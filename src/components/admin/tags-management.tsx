"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import slugify from "slugify";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Hash,
  Tag,
  FileText,
  Loader2,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createTag,
  updateTag,
  deleteTag,
  type TagWithCount,
} from "@/app/admin/tags/actions";

// ── Zod Schema ─────────────────────────────────────────
const tagSchema = z.object({
  name: z.string().min(1, "Tên tag không được để trống").max(50),
  slug: z
    .string()
    .min(1, "Slug không được để trống")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
});

type TagFormValues = z.infer<typeof tagSchema>;

// ── Props ──────────────────────────────────────────────
interface TagsManagementProps {
  initialTags: TagWithCount[];
}

// ── Component ───────────────────────────────────────────
export function TagsManagement({ initialTags }: TagsManagementProps) {
  const [tags, setTags] = React.useState<TagWithCount[]>(initialTags);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = React.useState<TagWithCount | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Inline edit state — stores which row is being edited
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState({ name: "", slug: "" });
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  // ── Create form ────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: "", slug: "" },
  });

  const nameValue = watch("name");

  // Auto-generate slug from name
  React.useEffect(() => {
    if (!nameValue) return;
    setValue(
      "slug",
      slugify(nameValue, { lower: true, strict: true, locale: "vi" }),
      { shouldValidate: false }
    );
  }, [nameValue, setValue]);

  const onCreateSubmit = async (values: TagFormValues) => {
    setIsSubmitting(true);
    const result = await createTag(values);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Tag đã được tạo!", {
        description: `#${values.slug} sẵn sàng để gắn vào post.`,
      });
      reset();
      // Optimistic: add to local state with 0 count (server will revalidate)
      setTags((prev) =>
        [...prev, { id: crypto.randomUUID(), name: values.name, slug: values.slug, created_at: new Date().toISOString(), post_count: 0 }].sort((a, b) => a.name.localeCompare(b.name))
      );
    } else {
      toast.error("Tạo tag thất bại", { description: result.error });
    }
  };

  // ── Inline edit ────────────────────────────────────────
  const startEdit = (tag: TagWithCount) => {
    setEditingId(tag.id);
    setEditValues({ name: tag.name, slug: tag.slug });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: "", slug: "" });
  };

  const saveEdit = async (tag: TagWithCount) => {
    if (!editValues.name.trim() || !editValues.slug.trim()) return;
    setIsSavingEdit(true);
    const result = await updateTag(tag.id, editValues);
    setIsSavingEdit(false);

    if (result.success) {
      toast.success("Cập nhật tag thành công!");
      setTags((prev) =>
        prev.map((t) =>
          t.id === tag.id ? { ...t, name: editValues.name, slug: editValues.slug } : t
        )
      );
      cancelEdit();
    } else {
      toast.error("Cập nhật thất bại", { description: result.error });
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteTag(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Đã xoá tag "${deleteTarget.name}"`, {
        description: `${deleteTarget.post_count} post liên quan đã được gỡ tag này.`,
      });
      setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    } else {
      toast.error("Xoá thất bại", { description: result.error });
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="flex gap-6 items-start">
        {/* ════════════════════════
            LEFT — Create Tag Form
        ════════════════════════ */}
        <div className="w-72 shrink-0">
          <div className="border border-white/10 rounded-xl bg-[#0d0d0f] p-5 sticky top-6">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
              <Tag className="w-4 h-4 text-primary" />
              Tạo tag mới
            </h2>

            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="tag-name" className="text-xs text-zinc-400">
                  Tên tag <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tag-name"
                  placeholder="Ví dụ: React Hooks"
                  className="bg-white/5 border-white/10 focus:border-primary/50 h-9 text-sm"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="tag-slug" className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Hash className="w-3 h-3" /> Slug
                  <span className="text-zinc-600">(tự sinh)</span>
                </Label>
                <Input
                  id="tag-slug"
                  placeholder="react-hooks"
                  className="bg-white/5 border-white/10 focus:border-primary/50 h-9 text-sm font-mono"
                  {...register("slug")}
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Đang tạo...</>
                ) : (
                  <><Plus className="w-3.5 h-3.5 mr-2" />Tạo Tag</>
                )}
              </Button>
            </form>

            {/* Stats */}
            <div className="mt-5 pt-4 border-t border-white/[0.07]">
              <p className="text-xs text-zinc-600">
                Hiện có{" "}
                <span className="text-primary font-semibold">{tags.length}</span>{" "}
                tags trong database.
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════
            RIGHT — Tags Table
        ════════════════════════ */}
        <div className="flex-1 min-w-0">
          {tags.length === 0 ? (
            <div className="border border-white/10 rounded-xl bg-[#0d0d0f] p-12 text-center">
              <Tag className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Chưa có tag nào. Tạo tag đầu tiên đi!</p>
            </div>
          ) : (
            <div className="border border-white/10 rounded-xl bg-[#0d0d0f] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.07] hover:bg-transparent">
                    <TableHead className="text-xs text-zinc-500 font-medium w-[35%]">
                      Tên Tag
                    </TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium w-[30%]">
                      Slug
                    </TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium w-[15%] text-center">
                      Số bài
                    </TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium w-[20%] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) =>
                    editingId === tag.id ? (
                      /* ── Editing row ── */
                      <TableRow key={tag.id} className="border-white/[0.07] bg-primary/[0.04]">
                        <TableCell>
                          <Input
                            value={editValues.name}
                            onChange={(e) => {
                              const name = e.target.value;
                              setEditValues((prev) => ({
                                name,
                                slug: slugify(name, { lower: true, strict: true, locale: "vi" }),
                              }));
                            }}
                            className="bg-white/5 border-white/10 h-8 text-sm"
                            autoFocus
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues.slug}
                            onChange={(e) =>
                              setEditValues((prev) => ({ ...prev, slug: e.target.value }))
                            }
                            className="bg-white/5 border-white/10 h-8 text-sm font-mono"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-zinc-500">{tag.post_count}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => saveEdit(tag)}
                              disabled={isSavingEdit}
                              title="Lưu"
                              className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                            >
                              {isSavingEdit ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              title="Huỷ"
                              className="p-1.5 rounded-md text-zinc-500 hover:bg-white/10 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      /* ── Normal row ── */
                      <TableRow
                        key={tag.id}
                        className="border-white/[0.07] hover:bg-white/[0.025] transition-colors group"
                      >
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 text-xs font-medium px-2 py-0.5"
                          >
                            {tag.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-zinc-500 font-mono">
                            #{tag.slug}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FileText className="w-3 h-3 text-zinc-600" />
                            <span
                              className={`text-xs font-medium ${
                                tag.post_count > 0 ? "text-zinc-300" : "text-zinc-600"
                              }`}
                            >
                              {tag.post_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => startEdit(tag)}
                              title="Sửa"
                              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(tag)}
                              title="Xoá"
                              className="p-1.5 rounded-md text-zinc-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="bg-[#111113] border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Xoá tag này?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Tag{" "}
              <span className="text-primary font-medium">
                &ldquo;{deleteTarget?.name}&rdquo;
              </span>{" "}
              sẽ bị xoá vĩnh viễn.
              {deleteTarget && deleteTarget.post_count > 0 && (
                <span className="block mt-1 text-amber-400">
                  ⚠ Tag này đang được dùng trong{" "}
                  <strong>{deleteTarget.post_count}</strong> post — liên kết sẽ bị xoá theo.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="text-zinc-400 hover:text-white"
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
            >
              {isDeleting ? (
                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Đang xoá...</>
              ) : (
                <><Trash2 className="w-3.5 h-3.5 mr-2" />Xoá luôn</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
