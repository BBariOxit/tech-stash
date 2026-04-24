import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

type ProfilePayload = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string | null;
};

function buildProfilePayload(user: User): ProfilePayload {
  const provider = user.app_metadata?.provider ?? null;
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
    email: user.email ?? null,
    full_name: fullName,
    avatar_url: avatarUrl,
    provider,
  };
}

export async function syncAuthenticatedUserProfile(user: User) {
  const supabase = await createClient();
  const payload = buildProfilePayload(user);

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    throw error;
  }
}
