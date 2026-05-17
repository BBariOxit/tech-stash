"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import slugify from "slugify";
import { toast } from "sonner";
import {
  FileText,
  Hash,
  AlignLeft,
  Code2,
  Tag,
  Send,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { TagsCombobox } from "@/components/admin/tags-combobox";
import { LanguagesSelect } from "@/components/admin/languages-select";
import { ThumbnailUpload } from "@/components/admin/thumbnail-upload";
import { calculateReadTime } from "@/utils/readTime";
import { createPost } from "@/app/admin/actions";
import { updatePost } from "@/app/admin/posts/actions";
import type { Tables } from "../../../types/supabase";

type Tag = Tables<"tags">;

// ── Zod Schema ─────────────────────────────────────────
const postSchema = z.object({
  title: z.string().min(5, "Tiêu đề cần ít nhất 5 ký tự").max(200),
  slug: z
    .string()
    .min(3, "Slug quá ngắn")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
  excerpt: z.string().max(500, "Excerpt tối đa 500 ký tự").optional(),
  thumbnail: z.union([z.string().url("Thumbnail phải là URL hợp lệ"), z.literal("")]).optional(),
  language_id: z.string().min(1, "Hãy chọn ngôn ngữ"),
  content: z.string().min(10, "Nội dung quá ngắn, gõ nhiều vào!"),
  published: z.boolean(),
});

export type PostFormValues = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  initialData?: PostFormValues;
  initialTags?: Tag[];
  postId?: string;
  isEditMode?: boolean;
}

// ── Component ───────────────────────────────────────────
export function CreatePostForm({
  initialData,
  initialTags = [],
  postId,
  isEditMode = false,
}: CreatePostFormProps = {}) {
  const [selectedTags, setSelectedTags] = React.useState<Tag[]>(initialTags);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [plainText, setPlainText] = React.useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      excerpt: "",
      thumbnail: "",
      language_id: "",
      content: "",
      published: false,
    },
  });

  const title = watch("title");
  const published = watch("published");
  const currentThumbnail = watch("thumbnail");

  // Auto-generate slug from title
  React.useEffect(() => {
    if (!title || isEditMode) return;
    const generatedSlug = slugify(title, {
      lower: true,
      strict: true,
      locale: "vi",
    });
    setValue("slug", generatedSlug, { shouldValidate: true });
  }, [title, setValue, isEditMode]);

  const onSubmit = async (values: PostFormValues) => {
    setIsSubmitting(true);
    try {
      const readTime = calculateReadTime(plainText);
      const payload = {
        ...values,
        excerpt: values.excerpt ?? "",
        thumbnail: values.thumbnail || "",
        tagIds: selectedTags.map((t) => t.id),
        reading_time: readTime,
      };

      const result = isEditMode && postId
        ? await updatePost(postId, payload)
        : await createPost(payload);

      if (result.success) {
        toast.success(isEditMode ? "Đã cập nhật bài viết!" : "Đã lên sóng!", {
          description: `Post "${values.title}" đã được lưu vào Supabase.`,
          duration: 5000,
        });
        if (!isEditMode) {
          reset();
          setSelectedTags([]);
        }
      } else {
        toast.error("Lỗi rồi!", {
          description: result.error ?? "Không xác định được lỗi.",
        });
      }
    } catch (err) {
      toast.error("Server lỗi mất rồi!", {
        description: String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full">
      {/* ── Two-column layout ── */}
      <div className="flex gap-6 items-start">
        {/* ════════════════════════════════
            LEFT COLUMN — Title / Content
        ════════════════════════════════ */}
        <div className="flex-[7] min-w-0 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <FileText className="w-4 h-4 text-primary" />
              Tiêu đề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ví dụ: Cách dùng useCallback đúng cách trong React..."
              className="bg-white/5 border-white/10 focus:border-primary/50 text-base h-11"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Hash className="w-4 h-4 text-primary" />
              Slug <span className="text-xs text-zinc-500 font-normal">(tự động từ title)</span>
            </Label>
            <Input
              id="slug"
              placeholder="ten-bai-viet-cua-ban"
              className="bg-white/5 border-white/10 focus:border-primary/50 font-mono text-sm"
              {...register("slug")}
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <AlignLeft className="w-4 h-4 text-primary" />
              Excerpt / Mô tả ngắn
            </Label>
            <Textarea
              id="excerpt"
              placeholder="Một đoạn mô tả ngắn về bài viết (hiển thị ở trang danh sách)..."
              rows={3}
              className="bg-white/5 border-white/10 focus:border-primary/50 resize-none"
              {...register("excerpt")}
            />
            {errors.excerpt && (
              <p className="text-xs text-destructive">{errors.excerpt.message}</p>
            )}
          </div>

          {/* Content — Tiptap */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Code2 className="w-4 h-4 text-primary" />
              Nội dung <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TiptapEditor
                  content={field.value}
                  onChange={field.onChange}
                  onTextChange={setPlainText}
                />
              )}
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content.message}</p>
            )}
          </div>
        </div>

        {/* ════════════════════════════════
            RIGHT COLUMN — Settings
        ════════════════════════════════ */}
        <div className="flex-[3] min-w-[260px] sticky top-6 space-y-5">
          {/* Card wrapper */}
          <div className="border border-white/10 rounded-xl bg-[#0d0d0f] p-5 space-y-5">
            <ThumbnailUpload
              value={currentThumbnail}
              onChange={(url) => setValue("thumbnail", url, { shouldValidate: true })}
            />

            <Separator className="bg-white/10" />

            {/* Published toggle */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">Trạng thái</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setValue("published", false)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border transition-all ${
                    !published
                      ? "bg-zinc-700/50 border-zinc-600 text-white"
                      : "border-white/10 text-zinc-500 hover:border-white/20"
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" /> Draft
                </button>
                <button
                  type="button"
                  onClick={() => setValue("published", true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border transition-all ${
                    published
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "border-white/10 text-zinc-500 hover:border-white/20"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Published
                </button>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Language */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Code2 className="w-4 h-4 text-primary" />
                Ngôn ngữ <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="language_id"
                control={control}
                render={({ field }) => (
                  <LanguagesSelect
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.language_id}
                  />
                )}
              />
              {errors.language_id && (
                <p className="text-xs text-destructive">{errors.language_id.message}</p>
              )}
            </div>

            <Separator className="bg-white/10" />

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Tag className="w-4 h-4 text-primary" />
                Tags
              </Label>
              <TagsCombobox
                selectedTags={selectedTags}
                onChange={setSelectedTags}
              />
            </div>

            <Separator className="bg-white/10" />

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10 shadow-lg shadow-primary/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {isEditMode ? "Cập nhật bài viết" : published ? "Publish ngay" : "Lưu Draft"}
                </>
              )}
            </Button>

            {/* Info */}
            {/* <p className="text-xs text-zinc-600 text-center leading-relaxed">
              Dữ liệu sẽ được lưu trực tiếp lên Supabase và hiển thị ngay.cc
            </p> */}
          </div>
        </div>
      </div>
    </form>
  );
}
