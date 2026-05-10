'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { CommentWithProfile } from '@/lib/comments';
import { deleteComment, updateComment, toggleLike } from '@/lib/comments';
import { CommentForm } from './CommentForm';
import { formatRelativeTime } from './utils';

interface CommentItemProps {
  comment: CommentWithProfile;
  allComments: CommentWithProfile[];
  postId: string;
  currentUser: { id: string; full_name: string | null; avatar_url: string | null } | null;
  depth?: number;
  onMutate: () => void;
}

const MAX_DEPTH = 3;

export function CommentItem({
  comment,
  allComments,
  postId,
  currentUser,
  depth = 0,
  onMutate,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Accordion: collapse replies by default ──
  const [showReplies, setShowReplies] = useState(false);

  // ── Optimistic like state ──
  const serverLiked = currentUser
    ? comment.likes.some((l) => l.profile_id === currentUser.id)
    : false;
  const serverCount = comment.likes.length;
  const [hasLiked, setHasLiked] = useState(serverLiked);
  const [likeCount, setLikeCount] = useState(serverCount);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = currentUser?.id === comment.profile_id;
  const replies = allComments.filter((c) => c.parent_id === comment.id);
  const hasReplies = replies.length > 0;

  const displayName = comment.profiles?.full_name ?? 'Người dùng';
  const avatarUrl = comment.profiles?.avatar_url ?? null;
  const initials = displayName.charAt(0).toUpperCase();

  const indentClass =
    depth > 0 && depth <= MAX_DEPTH
      ? 'ml-4 md:ml-10 border-l-2 border-white/6 pl-4'
      : depth > MAX_DEPTH
      ? 'ml-4 md:ml-10 pl-4'
      : '';

  // ── Handlers ──
  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await deleteComment(comment.id);
    if (error) {
      toast.error('Xóa thất bại, thử lại nhé!');
    } else {
      toast.success('Đã xóa bình luận.');
      onMutate();
    }
    setIsDeleting(false);
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      toast.error('Nội dung không được để trống!');
      return;
    }
    setIsSaving(true);
    const { error } = await updateComment({ commentId: comment.id, content: trimmed });
    if (error) {
      toast.error('Lưu thất bại, thử lại nhé!');
    } else {
      toast.success('Đã cập nhật bình luận!');
      onMutate();
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      toast.error('Đăng nhập để thả tim nhé!');
      return;
    }
    if (isLiking) return;

    // Optimistic update
    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));
    setIsLiking(true);

    const { error } = await toggleLike({
      commentId: comment.id,
      profileId: currentUser.id,
      currentlyLiked: hasLiked,
    });

    if (error) {
      // Rollback on failure
      setHasLiked(hasLiked);
      setLikeCount(likeCount);
      toast.error('Thao tác thất bại, thử lại nhé!');
    }
    setIsLiking(false);
  };

  return (
    <div className={`mt-5 ${indentClass}`}>
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-primary/20 object-cover"
                unoptimized
              />
            ) : (
              <span className="flex w-8 h-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[12px] font-semibold text-primary">
                {initials}
              </span>
            )}
          </div>

          {/* Name + time */}
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-sm font-semibold text-zinc-100">{displayName}</span>
            <span className="text-[11px] text-zinc-500">
              {formatRelativeTime(comment.created_at)}
              {comment.updated_at !== comment.created_at && (
                <span className="ml-1 italic text-zinc-600">(đã chỉnh sửa)</span>
              )}
            </span>
          </div>
        </div>

        {/* Owner actions — 3-dot dropdown */}
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center h-6 w-6 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/6 transition-colors shrink-0"
              aria-label="Tùy chọn bình luận"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[130px]">
              <DropdownMenuItem
                onClick={() => {
                  setEditContent(comment.content);
                  setIsEditing(true);
                  setIsReplying(false);
                }}
                className="gap-2 text-xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* ── Content / Edit mode ── */}
      {isEditing ? (
        <div className="mt-2 space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[72px] bg-transparent border-white/10 focus-visible:ring-1 focus-visible:ring-primary/60 resize-y text-sm text-zinc-200"
            disabled={isSaving}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="gap-1 text-xs h-7"
            >
              <Check className="w-3 h-3" />
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="gap-1 text-xs h-7 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-3 h-3" />
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      )}

      {/* ── Action bar: Like + Reply + collapse toggle ── */}
      {!isEditing && (
        <div className="flex items-center gap-4 mt-2.5">
          {/* ❤ Like button */}
          <button
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`inline-flex items-center gap-1 text-[11px] font-medium transition-all duration-150 disabled:opacity-60 ${
              hasLiked
                ? 'text-red-400 hover:text-red-300'
                : 'text-zinc-500 hover:text-red-400'
            }`}
            aria-label={hasLiked ? 'Bỏ tim' : 'Thả tim'}
          >
            <motion.div
              animate={hasLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all duration-150 ${
                  hasLiked ? 'fill-red-400 stroke-red-400' : 'fill-none'
                }`}
              />
            </motion.div>
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {/* 💬 Reply button */}
          <button
            onClick={() => {
              setIsReplying((prev) => !prev);
              setIsEditing(false);
            }}
            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-primary transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            {isReplying ? 'Hủy' : 'Trả lời'}
          </button>

          {/* 🔽 Collapse/expand replies toggle */}
          {hasReplies && (
            <button
              onClick={() => setShowReplies((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Ẩn phản hồi
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  {replies.length} phản hồi
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Animated reply form ── */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="mt-3 overflow-hidden"
          >
            <CommentForm
              postId={postId}
              parentId={comment.id}
              user={currentUser}
              onSubmitSuccess={() => {
                setIsReplying(false);
                setShowReplies(true); // Auto-expand so user sees their new reply
                onMutate();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Animated collapsible nested replies ── */}
      <AnimatePresence>
        {showReplies && hasReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                allComments={allComments}
                postId={postId}
                currentUser={currentUser}
                depth={depth + 1}
                onMutate={onMutate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
