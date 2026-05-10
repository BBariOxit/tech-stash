import { createClient } from "@/lib/supabase/client";

export interface CommentLike {
  comment_id: string;
  profile_id: string;
}

export interface CommentWithProfile {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  post_id: string;
  profile_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
  /** Flat list of likes for this comment */
  likes: CommentLike[];
}

/** Fetch ALL comments for a post (flat list — recursive rendering is done client-side) */
export async function getCommentsByPostId(
  postId: string
): Promise<CommentWithProfile[]> {
  const supabase = createClient();

  // ── 1. Fetch flat comments (no JOINs to avoid schema/RLS issues) ──
  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("id, content, created_at, updated_at, parent_id, post_id, profile_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error(
      "[comments] getCommentsByPostId error:",
      JSON.stringify(commentsError),
      commentsError
    );
    return [];
  }

  const rows = commentsData ?? [];
  if (rows.length === 0) return [];

  // ── 2. Fetch profiles for all unique profile_ids in this batch ──
  const profileIds = [...new Set(rows.map((r) => r.profile_id))];
  const profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();

  try {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", profileIds);

    for (const p of profilesData ?? []) {
      profileMap.set(p.id, { full_name: p.full_name, avatar_url: p.avatar_url });
    }
  } catch {
    // profiles query failed — avatars/names will show as null, not a blocking error
  }

  // ── 3. Fetch likes for these comments ──
  const commentIds = rows.map((r) => r.id);
  const likesMap = new Map<string, CommentLike[]>();

  try {
    const { data: likesData } = await supabase
      .from("comment_likes")
      .select("comment_id, profile_id")
      .in("comment_id", commentIds);

    for (const like of (likesData ?? []) as CommentLike[]) {
      const arr = likesMap.get(like.comment_id) ?? [];
      arr.push(like);
      likesMap.set(like.comment_id, arr);
    }
  } catch {
    // comment_likes might not exist yet — silently ignore
  }

  // ── 4. Merge everything ──
  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    parent_id: row.parent_id,
    post_id: row.post_id,
    profile_id: row.profile_id,
    profiles: profileMap.get(row.profile_id) ?? { full_name: null, avatar_url: null },
    likes: likesMap.get(row.id) ?? [],
  }));
}

/**
 * Toggle like on a comment.
 * - If the user hasn't liked it yet → INSERT a like row.
 * - If already liked → DELETE the row (unlike).
 * Returns the new optimistic liked state.
 */
export async function toggleLike({
  commentId,
  profileId,
  currentlyLiked,
}: {
  commentId: string;
  profileId: string;
  currentlyLiked: boolean;
}): Promise<{ error: string | null }> {
  const supabase = createClient();

  if (currentlyLiked) {
    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("profile_id", profileId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, profile_id: profileId });
    if (error) return { error: error.message };
  }

  return { error: null };
}

/** Insert a new comment */
export async function addComment({
  postId,
  profileId,
  content,
  parentId,
}: {
  postId: string;
  profileId: string;
  content: string;
  parentId?: string | null;
}): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    profile_id: profileId,
    content,
    parent_id: parentId ?? null,
  });

  if (error) {
    console.error("[comments] addComment error:", error);
    return { error: error.message };
  }
  return { error: null };
}

/** Update an existing comment's content */
export async function updateComment({
  commentId,
  content,
}: {
  commentId: string;
  content: string;
}): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("comments")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) {
    console.error("[comments] updateComment error:", error);
    return { error: error.message };
  }
  return { error: null };
}

/** Delete a comment */
export async function deleteComment(
  commentId: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("[comments] deleteComment error:", error);
    return { error: error.message };
  }
  return { error: null };
}
