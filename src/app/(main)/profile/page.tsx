import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { syncProfileFromAuth } from "@/lib/supabase/profiles";
import { ProfileSettings } from "@/components/profile-settings";
import { getProfile } from "./actions";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
  description: "Cập nhật thông tin cá nhân của bạn trên Tech Stash.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  // Sync profile from Auth metadata (tạo mới nếu chưa có)
  await syncProfileFromAuth(user);

  const profile = await getProfile();

  if (!profile) {
    redirect("/login?next=/profile");
  }

  return (
    <ProfileSettings
      initialProfile={profile}
      userEmail={user.email ?? ""}
    />
  );
}
