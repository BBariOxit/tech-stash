"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import type { User } from "@supabase/supabase-js";
import { Loader2, LogIn, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { GithubIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

const GOOGLE_ICON = "https://www.svgrepo.com/show/475656/google-color.svg";

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
      {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: "user",
      },
      { onConflict: "id" }
    );

  if (error) throw error;
}

export default function LoginPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = React.useState<AuthMode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const nextPath = searchParams.get("next") || "/";

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

  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const handleOAuth = async (provider: "github" | "google") => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      setIsLoading(false);
      toast.error("Đăng nhập OAuth thất bại", {
        description: error.message,
      });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng nhập email và mật khẩu.",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await syncClientProfile(user);
        }

        toast.success("Đăng nhập thành công");
        router.push(nextPath);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;

      if (data.session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await syncClientProfile(user);
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1118]/90 p-7 shadow-[0_20px_80px_-24px_rgba(45,212,191,0.45)] backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 shadow-inner shadow-cyan-300/15">
            {mode === "login" ? (
              <LogIn className="h-8 w-8 text-cyan-300" />
            ) : (
              <UserPlus className="h-8 w-8 text-cyan-300" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white">Tech Stash</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === "login" ? "Đăng nhập để quản lý nội dung." : "Tạo tài khoản để bắt đầu đăng bài."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "login" ? "bg-cyan-400/20 text-cyan-200" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "register" ? "bg-cyan-400/20 text-cyan-200" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs text-zinc-400">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/50"
              placeholder="you@techstash.dev"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-zinc-400">Mật khẩu</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/50"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {mode === "login" ? "Đăng nhập bằng email" : "Đăng ký bằng email"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">hoặc</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => void handleOAuth("github")}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <GithubIcon className="h-5 w-5" />
            Tiếp tục với GitHub
          </button>

          <button
            type="button"
            onClick={() => void handleOAuth("google")}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <img src={GOOGLE_ICON} className="h-5 w-5" alt="Google logo" />
            Tiếp tục với Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}
