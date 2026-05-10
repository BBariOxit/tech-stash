'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addComment } from '@/lib/comments';
import { toast } from 'sonner';

// zod v4 schema
const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Gõ gì đi chứ để trống à?')
    .max(1000, 'Dài quá, rút gọn lại!'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  user: { id: string; full_name: string | null; avatar_url: string | null } | null;
  onSubmitSuccess: () => void;
}

export function CommentForm({ postId, parentId = null, user, onSubmitSuccess }: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  const displayName = user?.full_name ?? 'User';
  const avatarUrl = user?.avatar_url ?? null;
  const initials = displayName.charAt(0).toUpperCase();

  const onSubmit = async (values: CommentFormValues) => {
    if (!user) return;

    const { error } = await addComment({
      postId,
      profileId: user.id,
      content: values.content,
      parentId,
    });

    if (error) {
      toast.error('Gửi thất bại, thử lại nhé!');
      return;
    }

    toast.success(parentId ? 'Đã trả lời!' : 'Bình luận thành công!');
    reset();
    onSubmitSuccess();
  };

  if (!user) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
        <LogIn className="w-4 h-4 shrink-0 text-primary" />
        <span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Đăng nhập
          </Link>{' '}
          để bình luận
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3">
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
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

      {/* Input area */}
      <div className="flex-1 space-y-2">
        <Textarea
          {...register('content')}
          placeholder={parentId ? 'Viết phản hồi...' : 'Chia sẻ góc nhìn của bạn...'}
          className="min-h-[80px] bg-transparent border-white/10 focus-visible:ring-1 focus-visible:ring-primary/60 resize-y text-sm text-zinc-200 placeholder:text-zinc-500"
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="text-red-400 text-xs">{errors.content.message}</p>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="group relative gap-1.5 text-xs font-medium overflow-hidden transition-all duration-300 hover:shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_45%,transparent)] hover:scale-[1.03] active:scale-[0.98]"
          >
            {/* Shimmer sweep on hover */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <Send className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            {isSubmitting ? 'Đang gửi...' : parentId ? 'Trả lời' : 'Gửi bình luận'}
          </Button>
        </div>
      </div>
    </form>
  );
}
