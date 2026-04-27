"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "motion/react";
import type { User } from "@supabase/supabase-js";
import { Loader2, LogIn, Mail, UserPlus, Eye, EyeOff } from "lucide-react";
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

// ─── Profile sync ─────────────────────────────────────────────────────────────
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

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, full_name: fullName, avatar_url: avatarUrl, role: "user" },
      { onConflict: "id" }
    );

  if (error) throw error;
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
      className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0c1118]/90 p-7 shadow-[0_24px_80px_-20px_rgba(45,212,191,0.35)] backdrop-blur-xl"
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
        toast.success("Đăng ký thành công", {
          description: "Kiểm tra email để xác nhận tài khoản.",
        });
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
          <motion.div
            key={mode}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 shadow-inner shadow-cyan-300/10"
          >
            {mode === "login" ? (
              <LogIn className="h-7 w-7 text-cyan-300" />
            ) : (
              <UserPlus className="h-7 w-7 text-cyan-300" />
            )}
          </motion.div>
          <h1 className="text-3xl font-bold text-white">Tech Stash</h1>
          <p className="mt-2 text-sm text-zinc-300">
            {mode === "login"
              ? "Đăng nhập để quản lý nội dung."
              : "Tạo tài khoản để bắt đầu đăng bài."}
          </p>
        </div>

        {/* ── Tab switcher ── */}
        <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1">
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
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
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

            {/* Password strength hints (register only, no error yet) */}
            {mode === "register" && !passwordError && password.length > 0 && (
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 space-y-0.5"
              >
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
              </motion.ul>
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
        </form>

        {/* ── Divider ── */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">hoặc</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {/* ── OAuth buttons ── */}
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
      </TiltCard>
    </div>
  );
}
