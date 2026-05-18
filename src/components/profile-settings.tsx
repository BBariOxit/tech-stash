"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  FileText,
  Camera,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

// lucide-react v1.x đã loại bỏ brand icons, nên tự tạo SVG
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { ProfileData } from "@/app/profile/actions";
import { updateProfile } from "@/app/profile/actions";

interface ProfileSettingsProps {
  initialProfile: ProfileData;
  userEmail: string;
}

const MAX_BIO_LENGTH = 300;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export function ProfileSettings({ initialProfile, userEmail }: ProfileSettingsProps) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [profile, setProfile] = React.useState({
    full_name: initialProfile.full_name ?? "",
    role: initialProfile.role ?? "",
    bio: initialProfile.bio ?? "",
    github_url: initialProfile.github_url ?? "",
    avatar_url: initialProfile.avatar_url ?? "",
  });

  // Track if anything has changed
  const hasChanges = React.useMemo(() => {
    return (
      profile.full_name !== (initialProfile.full_name ?? "") ||
      profile.role !== (initialProfile.role ?? "") ||
      profile.bio !== (initialProfile.bio ?? "") ||
      profile.github_url !== (initialProfile.github_url ?? "") ||
      profile.avatar_url !== (initialProfile.avatar_url ?? "")
    );
  }, [profile, initialProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Ảnh quá lớn", {
        description: "Vui lòng chọn ảnh dưới 2MB.",
      });
      e.target.value = "";
      return;
    }

    try {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `avatar-${initialProfile.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const newAvatarUrl = data.publicUrl;

      // Update local state
      setProfile((prev) => ({ ...prev, avatar_url: newAvatarUrl }));
      
      // Auto save to database
      const result = await updateProfile({
        full_name: profile.full_name || null,
        avatar_url: newAvatarUrl,
        role: profile.role || null,
        bio: profile.bio || null,
        github_url: profile.github_url || null,
      });

      if (result.success) {
        toast.success("Đổi ảnh đại diện thành công!");
        router.refresh();
      } else {
        toast.error("Lỗi lưu DB", { description: result.error });
      }
    } catch (error) {
      toast.error("Upload thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };



  const handleSave = async () => {
    setIsLoading(true);

    try {
      const result = await updateProfile({
        full_name: profile.full_name || null,
        avatar_url: profile.avatar_url || null,
        role: profile.role || null,
        bio: profile.bio || null,
        github_url: profile.github_url || null,
      });

      if (result.success) {
        toast.success("Hồ sơ đã được cập nhật!", {
          icon: <CheckCircle2 className="size-4 text-emerald-400" />,
        });
        router.refresh();
      } else {
        toast.error("Lỗi", { description: result.error });
      }
    } catch {
      toast.error("Đã xảy ra lỗi không mong muốn.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate initials for default avatar
  const initials = React.useMemo(() => {
    const name = profile.full_name || userEmail.split("@")[0];
    const parts = name.split(/[\s_-]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [profile.full_name, userEmail]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-white/[0.07] bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          <div className="text-xs font-mono text-primary uppercase tracking-wider font-semibold">
            Profile Settings
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 border-b border-white/[0.07] pb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            Hồ sơ cá nhân.
          </h1>
          <p className="text-zinc-500 text-sm">
            Cập nhật thông tin để thiên hạ biết bạn là ai. Để trống nếu muốn làm Ninja ẩn danh.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* Card 1: Avatar & Basic Info (Bento Box) */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card border border-white/[0.07] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center"
          >
            {/* Cột Avatar */}
            <div className="relative group shrink-0">
              <div className="size-32 rounded-full border-2 border-white/10 overflow-hidden bg-[#0a0a0c] flex items-center justify-center ring-1 ring-white/[0.04] ring-offset-2 ring-offset-background transition-all group-hover:border-primary/30">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary/60 select-none">
                    {initials}
                  </span>
                )}
              </div>

              {/* Overlay thay ảnh khi hover */}
              <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                {isUploading ? (
                  <Loader2 className="size-6 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="size-5 text-white mb-1" />
                    <span className="text-[10px] font-medium text-white/80">Đổi ảnh</span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>


            </div>

            {/* Cột Form Input */}
            <div className="flex-1 w-full space-y-5">
              {/* Tên */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-primary tracking-wide">
                  Tên hiển thị
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-4 text-zinc-600" />
                  </div>
                  <input
                    id="profile-fullname"
                    type="text"
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                    placeholder="Nhập tên thật hoặc nickname..."
                    className="w-full bg-[#0a0a0c] border border-white/[0.07] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-600 tracking-wide">
                  Vị trí / Role (không thể thay đổi)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="size-4 text-zinc-600" />
                  </div>
                  <div className="w-full bg-[#0a0a0c]/50 border border-white/[0.04] text-zinc-600 text-sm rounded-lg pl-10 pr-4 py-2.5 cursor-not-allowed select-all">
                    {profile.role || "user"}
                  </div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-600 tracking-wide">
                  Email (không thể thay đổi)
                </label>
                <div className="w-full bg-[#0a0a0c]/50 border border-white/[0.04] text-zinc-600 text-sm rounded-lg px-4 py-2.5 cursor-not-allowed select-all">
                  {userEmail}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* Card 2: Bio & Links */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card border border-white/[0.07] rounded-2xl p-6 md:p-8 space-y-6"
          >
            {/* Bio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-primary tracking-wide flex items-center gap-2">
                <FileText className="size-3.5" /> Tiểu sử (Bio)
              </label>
              <textarea
                id="profile-bio"
                value={profile.bio}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_BIO_LENGTH) {
                    setProfile({ ...profile, bio: e.target.value });
                  }
                }}
                rows={4}
                placeholder="Giới thiệu đôi nét về bản thân, sở thích, hoặc sự nghiệp code lỏ của bạn..."
                className="w-full bg-[#0a0a0c] border border-white/[0.07] text-white text-sm rounded-lg p-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all resize-none placeholder:text-zinc-700"
              />
              <div className="flex items-center justify-end gap-2">
                <span
                  className={`text-[10px] font-mono transition-colors ${
                    profile.bio.length >= MAX_BIO_LENGTH
                      ? "text-destructive"
                      : profile.bio.length >= MAX_BIO_LENGTH * 0.8
                        ? "text-amber-500"
                        : "text-zinc-600"
                  }`}
                >
                  {profile.bio.length}/{MAX_BIO_LENGTH}
                </span>
              </div>
            </div>

            {/* Github URL */}
            <div className="space-y-3 pt-6 border-t border-white/[0.04]">
              <label className="text-xs font-semibold text-primary tracking-wide block mb-1">
                Mạng xã hội
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GithubIcon className="size-4 text-zinc-600" />
                </div>
                <input
                  id="profile-github"
                  type="url"
                  value={profile.github_url}
                  onChange={(e) =>
                    setProfile({ ...profile, github_url: e.target.value })
                  }
                  placeholder="https://github.com/username"
                  className="w-full bg-[#0a0a0c] border border-white/[0.07] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* Action Button */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center justify-between pt-2"
          >
            {/* Change indicator */}
            <AnimatePresence>
              {hasChanges && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-xs text-amber-500/80 font-mono"
                >
                  ● Có thay đổi chưa lưu
                </motion.p>
              )}
            </AnimatePresence>

            <button
              id="profile-save-btn"
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 text-primary border border-primary/25 rounded-lg font-medium hover:bg-primary/20 hover:border-primary/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:border-primary/25 ml-auto cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
