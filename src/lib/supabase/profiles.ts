import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

function normalizeMetadata(user: User) {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  return {
    full_name: fullName,
    avatar_url: avatarUrl,
  };
}

export async function syncProfileFromAuth(user: User) {
  const supabase = await createClient();
  
  // 1. Kiểm tra profile hiện tại
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Nếu lỗi (có thể do RLS), đừng cố ghi đè vì sẽ làm mất dữ liệu cũ
  if (selectError) {
    console.error("[profiles] Error fetching profile:", selectError);
    return;
  }

  const metadata = normalizeMetadata(user);

  if (existingProfile) {
    // 2. Nếu đã có profile, chỉ cập nhật metadata, KHÔNG ghi đè role
    await supabase
      .from("profiles")
      .update({
        ...metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  } else {
    // 3. Nếu chưa có (user mới), tạo mới với role mặc định là 'user'
    await supabase
      .from("profiles")
      .insert({
        id: user.id,
        ...metadata,
        role: "user",
      });
  }
}

export async function getUserRole(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[profiles] getUserRole error:", error);
    return null;
  }
  return data?.role ?? null;
}
