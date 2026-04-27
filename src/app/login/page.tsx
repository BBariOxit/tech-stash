"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "motion/react";
import type { User } from "@supabase/supabase-js";
import { Loader2, LogIn, Mail, UserPlus, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";

import { GithubIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

const GOOGLE_ICON = "https://www.svgrepo.com/show/475656/google-color.svg";

// ─── Password validation rules (register only) ───────────────────────────────
const PASSWORD_RULES = [
  { regex: /.{8,}/, label: "Ít nhất 8 ký tự" },
  { regex: /[A-Z]/, label: "Ít nhất 1 chữ IN HOA" },
  { regex: /[a-z]/, label: "Ít nhất 1 chữ thường" },
  { regex: /[0-9]/, label: "Ít nhất 1 chữ số" },
  { regex: /[^a-zA-Z0-9]/, label: "Ít nhất 1 ký tự đặc biệt (@, !, #…)" },
];

function validatePassword(password: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.regex.test(password)) return rule.label;
  }
  return null;
}

// ─── Profile sync (client-side) ───────────────────────────────────────────────
// Chỉ update metadata, KHÔNG đụng role — tránh downgrade admin và tránh RLS block
async function syncClientProfile(user: User) {
  const supabase = createClient();
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  // 1. Kiểm tra profile đã tồn tại chưa
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    console.warn("[syncClientProfile] Could not check profile:", selectError.message);
    return; // Không throw — login vẫn thành công
  }

  if (existing) {
    // 2. Đã có profile → chỉ update metadata, KHÔNG ghi đè role
    await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq("id", user.id);
  } else {
    // 3. User mới → insert với role mặc định "user"
    await supabase
      .from("profiles")
      .insert({ id: user.id, full_name: fullName, avatar_url: avatarUrl, role: "user" });
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
// ─── Spotlight + Tilt card ────────────────────────────────────────────────────
function TiltCard({ children }: { children: React.ReactNode }) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Raw mouse position relative to card center (-0.5 → 0.5)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spotlight position (px relative to card)
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);

  // Spring-smoothed tilt (degrees)
  const springCfg = { stiffness: 200, damping: 28, mass: 0.6 };
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [4, -4]), springCfg);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-4, 4]), springCfg);

  // Spotlight opacity spring
  const spotOpacity = useSpring(0, { stiffness: 180, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(x);
    rawY.set(y);
    spotX.set(e.clientX - rect.left);
    spotY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => spotOpacity.set(1);
  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    spotOpacity.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1118]/90 p-7 shadow-[0_24px_80px_-20px_rgba(45,212,191,0.35)] backdrop-blur-xl"
    >
      {/* Spotlight layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: spotOpacity,
          background: useTransform(
            [spotX, spotY],
            ([x, y]: number[]) =>
              `radial-gradient(280px circle at ${x}px ${y}px, rgba(45,212,191,0.12), transparent 70%)`,
          ),
        }}
      />
      {children}
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = React.useState<AuthMode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false); // register confirm-email screen

  const nextPath = searchParams.get("next") || "/";

  // Reset fields on mode switch
  const handleSetMode = (next: AuthMode) => {
    setMode(next);
    setPasswordError(null);
    setPassword("");
    setEmail("");
    setShowPassword(false);
  };

  // Show OAuth error from query param
  React.useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;
    const messageMap: Record<string, string> = {
      "auth-failed": "Đăng nhập OAuth thất bại.",
      "missing-code": "Thiếu mã xác thực từ OAuth provider.",
      "user-missing": "Không lấy được user sau đăng nhập.",
      "profile-sync": "Không đồng bộ được hồ sơ người dùng.",
    };
    toast.error("Không thể đăng nhập", {
      description: messageMap[error] ?? "Vui lòng thử lại.",
    });
  }, [searchParams]);

  const buildRedirectTo = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? "";
    return `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  };

  // ── OAuth ──────────────────────────────────────────────────────────────────
  const handleOAuth = async (provider: "github" | "google") => {
    setIsLoading(true);
    const redirectTo = buildRedirectTo();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      setIsLoading(false);
      toast.error("Đăng nhập OAuth thất bại", { description: error.message });
    }
  };

  // ── Email / Password ───────────────────────────────────────────────────────
  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng nhập email và mật khẩu.",
      });
      return;
    }

    // Client-side password validation for register
    if (mode === "register") {
      const err = validatePassword(password);
      if (err) {
        setPasswordError(err);
        return;
      }
    }
    setPasswordError(null);

    try {
      setIsLoading(true);

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try { await syncClientProfile(user); }
          catch (err) { console.error("[login] Failed to sync profile", err); }
        }
        toast.success("Đăng nhập thành công");
        router.push(nextPath);
        router.refresh();
        return;
      }

      // Register
      const redirectTo = buildRedirectTo();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;

      if (data.session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try { await syncClientProfile(user); }
          catch (err) { console.error("[register] Failed to sync profile", err); }
        }
        toast.success("Tạo tài khoản thành công");
        router.push(nextPath);
        router.refresh();
      } else {
        // Supabase gửi email confirm — chuyển sang success screen
        setIsSuccess(true);
      }
    } catch (error) {
      toast.error(mode === "login" ? "Đăng nhập thất bại" : "Đăng ký thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Page-level spotlight ───────────────────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 100 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 100 });
  const spotlightBg = useMotionTemplate`radial-gradient(800px circle at ${springX}px ${springY}px, rgba(6,182,212,0.13), transparent 80%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10"
      onPointerMove={handlePointerMove}
    >
      {/* Page-level cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: spotlightBg }}
      />

      <TiltCard>
        {/* ── Header ── */}
        <div className="mb-7 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSuccess ? "success-icon" : mode}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-inner ${
                isSuccess
                  ? "border-emerald-400/30 bg-emerald-400/10 shadow-emerald-300/10"
                  : "border-cyan-300/20 bg-cyan-400/10 shadow-cyan-300/10"
              }`}
            >
              {isSuccess ? (
                <Check className="h-7 w-7 text-emerald-400" />
              ) : mode === "login" ? (
                <LogIn className="h-7 w-7 text-cyan-300" />
              ) : (
                <UserPlus className="h-7 w-7 text-cyan-300" />
              )}
            </motion.div>
          </AnimatePresence>
          <h1 className="text-3xl font-bold text-white">Tech Stash</h1>
          <p className="mt-2 text-sm text-zinc-300">
            {isSuccess
              ? "Xác nhận email để hoàn tất."
              : mode === "login"
              ? "Đăng nhập để quản lý nội dung."
              : "Tạo tài khoản để bắt đầu đăng bài."}
          </p>
        </div>

        {/* ── Tab switcher — ẩn khi success ── */}
        <AnimatePresence>
          {!isSuccess && (
            <motion.div
              key="tabs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1"
            >
              {(["login", "register"] as AuthMode[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleSetMode(tab)}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    mode === tab ? "text-cyan-200" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {mode === tab && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-lg bg-cyan-400/20"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span className="relative">
                    {tab === "login" ? "Đăng nhập" : "Đăng ký"}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Body: Success screen OR Form ── */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-5 text-center"
            >
              {/* Email badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">{email}</span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-white">Check mail đi!</h2>
                <p className="text-sm text-zinc-400">
                  Link kích hoạt vừa được gửi rồi đấy.
                </p>
                <p className="text-xs text-zinc-600">
                  Không thấy? Ngó thử hòm <span className="text-zinc-500">Spam / Junk</span> nhé.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsSuccess(false); handleSetMode("login"); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 active:scale-[0.98]"
                >
                  <LogIn className="h-4 w-4" />
                  Quay lại đăng nhập
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.resend({ type: "signup", email });
                    if (error) {
                      toast.error("Gửi lại thất bại", { description: error.message });
                    } else {
                      toast.success("Đã gửi lại!", { description: "Kiểm tra hộp thư nhé." });
                    }
                  }}
                  className="text-xs text-zinc-500 transition hover:text-zinc-300"
                >
                  Gửi lại email xác nhận
                </button>
              </div>
            </motion.div>
          ) : (
        <motion.form
          key="form"
          onSubmit={handleEmailAuth}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:bg-white/7"
              placeholder="you@techstash.dev"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-medium text-zinc-400">
                Mật khẩu
              </label>
              {mode === "login" && (
                <a
                  href="/forgot-password"
                  className="text-xs text-zinc-500 transition hover:text-cyan-300"
                >
                  Quên mật khẩu?
                </a>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (mode === "register" && passwordError) {
                    setPasswordError(validatePassword(e.target.value));
                  }
                }}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2.5 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:bg-white/7 ${
                  passwordError
                    ? "border-red-500/60 focus:border-red-400/70"
                    : "border-white/10 focus:border-cyan-300/50"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>

              {/* ── Desktop: Floating popover (thò ra bên phải, không đẩy layout) ── */}
              {mode === "register" && (
                <div
                  className={`hidden md:block absolute top-0 left-[calc(100%+1rem)] w-56 rounded-xl border border-white/10 bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-200 z-50 ${
                    passwordFocused && password.length > 0
                      ? "opacity-100 translate-x-0 pointer-events-auto"
                      : "opacity-0 -translate-x-2 pointer-events-none"
                  }`}
                >
                  {/* Arrow */}
                  <div className="absolute top-3.5 -left-[5px] h-2.5 w-2.5 rotate-45 border-b-0 border-r-0 border border-white/10 bg-zinc-900" />
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Yêu cầu mật khẩu</p>
                  <ul className="space-y-1.5">
                    {PASSWORD_RULES.map((rule) => (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          rule.regex.test(password) ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      >
                        <span className="text-[10px]">{rule.regex.test(password) ? "✓" : "○"}</span>
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Password validation error */}
            <AnimatePresence>
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-xs text-red-400"
                >
                  ✕ {passwordError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* ── Mobile: Inline checklist (chỉ hiện trên mobile, sổ xuống bình thường) ── */}
            {mode === "register" && passwordFocused && password.length > 0 && (
              <ul className="block md:hidden mt-1 space-y-1">
                {PASSWORD_RULES.map((rule) => (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      rule.regex.test(password) ? "text-emerald-400" : "text-zinc-500"
                    }`}
                  >
                    <span>{rule.regex.test(password) ? "✓" : "○"}</span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {mode === "login" ? "Đăng nhập bằng email" : "Đăng ký bằng email"}
          </button>
        </motion.form>
          )}
        </AnimatePresence>

        {/* ── Divider + OAuth — ẩn khi success ── */}
        {!isSuccess && (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">hoặc</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="space-y-3">
              {/* GitHub — dark, tone-sur-tone */}
              <button
                type="button"
                onClick={() => void handleOAuth("github")}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700/60 bg-zinc-900 py-3 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <GithubIcon className="h-5 w-5" />
                Tiếp tục với GitHub
              </button>

              {/* Google */}
              <button
                type="button"
                onClick={() => void handleOAuth("google")}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <img src={GOOGLE_ICON} className="h-5 w-5" alt="Google logo" />
                Tiếp tục với Google
              </button>
            </div>
          </>
        )}
      </TiltCard>
    </div>
  );
}
