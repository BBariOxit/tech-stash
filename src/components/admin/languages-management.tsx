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
  Globe,
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
  createLanguage,
  updateLanguage,
  deleteLanguage,
  type LanguageWithCount,
} from "@/app/admin/languages/actions";

// ── Zod Schema ─────────────────────────────────────────
const languageSchema = z.object({
  name: z.string().min(1, "Tên ngôn ngữ không được để trống").max(50),
  slug: z
    .string()
    .min(1, "Slug không được để trống")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
});

type LanguageFormValues = z.infer<typeof languageSchema>;

// ── Props ──────────────────────────────────────────────
interface LanguagesManagementProps {
  initialLanguages: LanguageWithCount[];
}

// ── Component ───────────────────────────────────────────
export function LanguagesManagement({ initialLanguages }: LanguagesManagementProps) {
  const [languages, setLanguages] = React.useState<LanguageWithCount[]>(initialLanguages);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = React.useState<LanguageWithCount | null>(null);
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
  } = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
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

  const onCreateSubmit = async (values: LanguageFormValues) => {
    setIsSubmitting(true);
    const result = await createLanguage(values);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Ngôn ngữ đã được tạo!");
      reset();
      // Optimistic: add to local state with 0 count
      setLanguages((prev) =>
        [...prev, { id: crypto.randomUUID(), name: values.name, slug: values.slug, created_at: new Date().toISOString(), usage_count: 0 }].sort((a, b) => a.name.localeCompare(b.name))
      );
    } else {
      toast.error("Tạo ngôn ngữ thất bại", { description: result.error });
    }
  };

  // ── Inline edit ────────────────────────────────────────
  const startEdit = (lang: LanguageWithCount) => {
    setEditingId(lang.id);
    setEditValues({ name: lang.name, slug: lang.slug });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: "", slug: "" });
  };

  const saveEdit = async (lang: LanguageWithCount) => {
    if (!editValues.name.trim() || !editValues.slug.trim()) return;
    setIsSavingEdit(true);
    const result = await updateLanguage(lang.id, editValues);
    setIsSavingEdit(false);

    if (result.success) {
      toast.success("Cập nhật ngôn ngữ thành công!");
      setLanguages((prev) =>
        prev.map((l) =>
          l.id === lang.id ? { ...l, name: editValues.name, slug: editValues.slug } : l
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
    const result = await deleteLanguage(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`Đã xoá ngôn ngữ "${deleteTarget.name}"`);
      setLanguages((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    } else {
      toast.error("Xoá thất bại", { description: result.error });
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="flex gap-6 items-start">
        {/* ════════════════════════
            LEFT — Create Form
        ════════════════════════ */}
        <div className="w-72 shrink-0">
          <div className="border border-white/10 rounded-xl bg-[#0d0d0f] p-5 sticky top-6">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-primary" />
              Tạo ngôn ngữ mới
            </h2>

            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="lang-name" className="text-xs text-zinc-400">
                  Tên ngôn ngữ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lang-name"
                  placeholder="Ví dụ: TypeScript"
                  className="bg-white/5 border-white/10 focus:border-primary/50 h-9 text-sm"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="lang-slug" className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Hash className="w-3 h-3" /> Slug
                  <span className="text-zinc-600">(tự sinh)</span>
                </Label>
                <Input
                  id="lang-slug"
                  placeholder="typescript"
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
                  <><Plus className="w-3.5 h-3.5 mr-2" />Tạo ngôn ngữ</>
                )}
              </Button>
            </form>

            {/* Stats */}
            <div className="mt-5 pt-4 border-t border-white/[0.07]">
              <p className="text-xs text-zinc-600">
                Hiện có{" "}
                <span className="text-primary font-semibold">{languages.length}</span>{" "}
                ngôn ngữ.
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════
            RIGHT — Table
        ════════════════════════ */}
        <div className="flex-1 min-w-0">
          {languages.length === 0 ? (
            <div className="border border-white/10 rounded-xl bg-[#0d0d0f] p-12 text-center">
              <Globe className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Chưa có ngôn ngữ nào. Tạo ngôn ngữ đầu tiên đi!</p>
            </div>
          ) : (
            <div className="border border-white/10 rounded-xl bg-[#0d0d0f] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.07] hover:bg-transparent">
                    <TableHead className="text-xs text-zinc-500 font-medium w-[35%]">
                      Tên ngôn ngữ
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
                  {languages.map((lang) =>
                    editingId === lang.id ? (
                      /* ── Editing row ── */
                      <TableRow key={lang.id} className="border-white/[0.07] bg-primary/[0.04]">
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
                          <span className="text-xs text-zinc-500">{lang.usage_count}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => saveEdit(lang)}
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
                        key={lang.id}
                        className="border-white/[0.07] hover:bg-white/[0.025] transition-colors group"
                      >
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 text-xs font-medium px-2 py-0.5"
                          >
                            {lang.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-zinc-500 font-mono">
                            #{lang.slug}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FileText className="w-3 h-3 text-zinc-600" />
                            <span
                              className={`text-xs font-medium ${
                                lang.usage_count > 0 ? "text-zinc-300" : "text-zinc-600"
                              }`}
                            >
                              {lang.usage_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => startEdit(lang)}
                              title="Sửa"
                              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(lang)}
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
            <DialogTitle className="text-white">Xoá ngôn ngữ này?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Ngôn ngữ{" "}
              <span className="text-primary font-medium">
                &ldquo;{deleteTarget?.name}&rdquo;
              </span>{" "}
              sẽ bị xoá vĩnh viễn.
              {deleteTarget && deleteTarget.usage_count > 0 && (
                <span className="block mt-1 text-amber-400">
                  ⚠ Ngôn ngữ này đang được dùng trong{" "}
                  <strong>{deleteTarget.usage_count}</strong> bài/snippet — liên kết sẽ bị gỡ.
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
