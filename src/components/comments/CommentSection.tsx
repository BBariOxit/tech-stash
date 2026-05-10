'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getCommentsByPostId, type CommentWithProfile } from '@/lib/comments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  postId: string;
}

interface CurrentUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

/** Extract the best available display name from a Supabase auth user */
function resolveDisplayName(user: { email?: string; user_metadata?: Record<string, unknown> }): string | null {
  const meta = user.user_metadata ?? {};
  // OAuth providers (Google, GitHub) store name here
  const fromMeta =
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    null;
  if (fromMeta) return fromMeta;
  // Email login fallback: use the part before @
  if (user.email) return user.email.split('@')[0];
  return null;
}

function resolveAvatarUrl(user: { email?: string; user_metadata?: Record<string, unknown> }): string | null {
  const meta = user.user_metadata ?? {};
  return (
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined) ??
    null
  );
}

export function CommentSection({ postId }: CommentSectionProps) {
  const supabase = useMemo(() => createClient(), []);

  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  /* ── Fetch comments ─────────────────────────────────────────── */
  const fetchComments = useCallback(async () => {
    const data = await getCommentsByPostId(postId);
    setComments(data);
  }, [postId]);

  /* ── Initial load: user session + comments ──────────────────── */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted && session?.user) {
          const u = session.user;

          // 1. Set from auth metadata immediately (fast)
          const metaName = resolveDisplayName(u);
          const metaAvatar = resolveAvatarUrl(u);
          setCurrentUser({ id: u.id, full_name: metaName, avatar_url: metaAvatar });

          // 2. Also pull from profiles table — may have a richer/updated name
          try {
            const supabaseClient = createClient();
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', u.id)
              .maybeSingle();
            if (mounted && profile) {
              setCurrentUser({
                id: u.id,
                full_name: profile.full_name ?? metaName,
                avatar_url: profile.avatar_url ?? metaAvatar,
              });
            }
          } catch {
            // profiles fetch failed — keep auth metadata values
          }
        }

        if (mounted) {
          await fetchComments();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void init();

    /* Listen for auth state changes (login / logout in same tab) */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setCurrentUser(null);
      } else {
        const u = session.user;
        setCurrentUser({
          id: u.id,
          full_name: resolveDisplayName(u),
          avatar_url: resolveAvatarUrl(u),
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchComments]);

  /* Only root-level comments (parent_id === null) go in the top list */
  const rootComments = comments.filter((c) => c.parent_id === null);
  const totalCount = comments.length;

  return (
    <section className="mt-16 border-t border-white/8 pt-10" aria-label="Bình luận">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-8">
        <MessageSquareText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-white">
          Bình luận
          {totalCount > 0 && (
            <span className="ml-2 text-sm font-normal text-zinc-500">({totalCount})</span>
          )}
        </h2>
      </div>

      {/* ── Root comment form ── */}
      <CommentForm
        postId={postId}
        parentId={null}
        user={currentUser}
        onSubmitSuccess={fetchComments}
      />

      {/* ── Comment list ── */}
      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-zinc-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tải bình luận...
          </div>
        ) : rootComments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageSquareText className="w-8 h-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">Chưa có bình luận nào. Là người đầu tiên đi!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {rootComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                allComments={comments}
                postId={postId}
                currentUser={currentUser}
                depth={0}
                onMutate={fetchComments}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
