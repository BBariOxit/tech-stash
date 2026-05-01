"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
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
  FileCode2,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TagsCombobox } from "@/components/admin/tags-combobox";
import { LanguagesSelect } from "@/components/admin/languages-select";
import { createSnippet } from "@/app/admin/snippets/actions";
import type { Tables } from "../../../types/supabase";

type TagType = Tables<"tags">;

// ── Zod Schema ─────────────────────────────────────────
const snippetSchema = z.object({
  title: z.string().min(3, "Tiêu đề cần ít nhất 3 ký tự").max(200),
  slug: z
    .string()
    .min(3, "Slug quá ngắn")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
  filename: z.string().min(1, "Filename không được để trống"),
  language_id: z.string().min(1, "Vui lòng chọn ngôn ngữ"),
  code: z.string().min(5, "Code quá ngắn, gõ nhiều vào!"),
  published: z.boolean(),
});

type SnippetFormValues = z.infer<typeof snippetSchema>;

// ── Component ───────────────────────────────────────────
export function CreateSnippetForm() {
  const [selectedTags, setSelectedTags] = React.useState<TagType[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      filename: "snippet.ts",
      language_id: "",
      code: "",
      published: false,
    },
  });

  const title = watch("title");
  const published = watch("published");

  // Auto-generate slug from title
  React.useEffect(() => {
    if (!title) return;
    const generatedSlug = slugify(title, {
      lower: true,
      strict: true,
      locale: "vi",
    });
    setValue("slug", generatedSlug, { shouldValidate: true });
  }, [title, setValue]);

  const onSubmit = async (values: SnippetFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createSnippet({
        ...values,
        description: values.description ?? "",
        tagIds: selectedTags.map((t) => t.id),
      });

      if (result.success) {
        toast.success("Snippet đã được tạo!", {
          description: `"${values.title}" đã được lưu vào Supabase.`,
          duration: 5000,
        });
        reset();
        setSelectedTags([]);
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
            LEFT COLUMN — Title / Code
        ════════════════════════════════ */}
        <div className="flex-[7] min-w-0 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="snippet-title" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <FileText className="w-4 h-4 text-primary" />
              Tiêu đề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="snippet-title"
              placeholder="Ví dụ: useWindowSize Hook"
              className="bg-white/5 border-white/10 focus:border-primary/50 text-base h-11"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="snippet-slug" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Hash className="w-4 h-4 text-primary" />
              Slug <span className="text-xs text-zinc-500 font-normal">(tự động từ title)</span>
            </Label>
            <Input
              id="snippet-slug"
              placeholder="use-window-size-hook"
              className="bg-white/5 border-white/10 focus:border-primary/50 font-mono text-sm"
              {...register("slug")}
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="snippet-desc" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <AlignLeft className="w-4 h-4 text-primary" />
              Mô tả ngắn
            </Label>
            <Textarea
              id="snippet-desc"
              placeholder="Custom hook lấy kích thước màn hình, auto-update khi resize..."
              rows={3}
              className="bg-white/5 border-white/10 focus:border-primary/50 resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Code Content */}
          <div className="space-y-2">
            <Label htmlFor="snippet-code" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Code2 className="w-4 h-4 text-primary" />
              Code <span className="text-destructive">*</span>
            </Label>
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              {/* Code editor header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0d0f] border-b border-white/[0.07]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] text-zinc-600 font-mono">
                  Raw Code — sẽ được highlight bởi Shiki
                </span>
              </div>
              <textarea
                id="snippet-code"
                placeholder={`// Paste hoặc gõ code vào đây...\nfunction example() {\n  return "Hello World";\n}`}
                rows={16}
                className="w-full bg-[#09090b] text-zinc-200 font-mono text-sm leading-relaxed p-4 resize-y outline-none placeholder:text-zinc-700 min-h-[320px]"
                spellCheck={false}
                {...register("code")}
              />
            </div>
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>
        </div>

        {/* ════════════════════════════════
            RIGHT COLUMN — Settings
        ════════════════════════════════ */}
        <div className="flex-[3] min-w-[260px] sticky top-6 space-y-5">
          {/* Card wrapper */}
          <div className="border border-white/10 rounded-xl bg-[#0d0d0f] p-5 space-y-5">
            {/* Filename */}
            <div className="space-y-2">
              <Label htmlFor="snippet-filename" className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <FileCode2 className="w-4 h-4 text-primary" />
                Filename
              </Label>
              <Input
                id="snippet-filename"
                placeholder="snippet.ts"
                className="bg-white/5 border-white/10 focus:border-primary/50 font-mono text-sm"
                {...register("filename")}
              />
              {errors.filename && (
                <p className="text-xs text-destructive">{errors.filename.message}</p>
              )}
            </div>

            <Separator className="bg-white/10" />

            {/* Language Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Globe className="w-4 h-4 text-primary" />
                Ngôn ngữ chính <span className="text-destructive">*</span>
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
                  {published ? "Publish Snippet" : "Lưu Draft"}
                </>
              )}
            </Button>

            {/* Info */}
            <p className="text-xs text-zinc-600 text-center leading-relaxed">
              Code sẽ được lưu raw string, client-side dùng Shiki để syntax highlight.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
