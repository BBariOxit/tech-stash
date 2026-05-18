"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileData = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
  github_url: string | null;
  level?: number | null;
  coin?: number | null;
  current_frame_id?: string | null;
  avatar_frames?: { css_class: string | null } | null;
};

export type UpdateProfileState = {
  success: boolean;
  error?: string;
};

export async function getProfile(): Promise<ProfileData | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, bio, github_url, level, coin, current_frame_id, avatar_frames:current_frame_id(css_class)")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[profile/actions] getProfile error:", error);
    return null;
  }

  return data;
}

export async function updateProfile(
  profileData: Omit<ProfileData, "id">
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Bạn cần đăng nhập để cập nhật hồ sơ." };
  }

  // 1. Cập nhật Auth User Metadata để hiển thị ra ngoài (Navbar, Dropdown, Sidebar...)
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: profileData.full_name,
      avatar_url: profileData.avatar_url,
    },
  });

  if (authError) {
    console.error("[profile/actions] update auth user metadata error:", authError);
    return { success: false, error: "Lỗi khi cập nhật tài khoản: " + authError.message };
  }

  // 2. Cập nhật database profiles
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: profileData.full_name,
      avatar_url: profileData.avatar_url,
      bio: profileData.bio,
      github_url: profileData.github_url,
      // Không cho user tự đổi role
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[profile/actions] updateProfile error:", error);
    return { success: false, error: "Lỗi khi cập nhật hồ sơ: " + error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}
