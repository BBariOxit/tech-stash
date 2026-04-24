import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { syncProfileFromAuth } from "@/lib/supabase/profiles";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=missing-code`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[auth/callback] Session exchange failed", exchangeError);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-failed`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[auth/callback] Unable to read authenticated user", userError);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=user-missing`);
  }

  try {
    await syncProfileFromAuth(user);
  } catch (error) {
    console.error("[auth/callback] Unable to sync profile", error);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=profile-sync`);
  }

  return NextResponse.redirect(`${requestUrl.origin}${nextPath}`);
}
