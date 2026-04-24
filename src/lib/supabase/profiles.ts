import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

function normalizeProfile(user: User): ProfileRow {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  return {
    id: user.id,
    full_name: fullName,
    avatar_url: avatarUrl,
    role: "user",
  };
}

export async function syncProfileFromAuth(user: User) {
  const supabase = await createClient();
  const payload = normalizeProfile(user);

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) throw error;
}

export async function getUserRole(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role ?? null;
}
