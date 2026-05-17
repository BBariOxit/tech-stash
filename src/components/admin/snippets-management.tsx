"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Code2,
  AlertTriangle,
  Loader2,
  X,
  Check,
  Hash,
  FileCode2,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TagsCombobox } from "@/components/admin/tags-combobox";
import { LanguagesSelect } from "@/components/admin/languages-select";
import type { AdminSnippet } from "@/app/admin/snippets/actions";
import {
  toggleSnippetPublished,
  deleteSnippet,
  updateSnippet,
} from "@/app/admin/snippets/actions";
import type { Tables } from "../../../types/supabase";
import slugify from "slugify";

type TagType = Tables<"tags">;

interface SnippetsManagementProps {
  initialSnippets: AdminSnippet[];
}

export function SnippetsManagement({ initialSnippets }: SnippetsManagementProps) {
  const [snippets, setSnippets] = React.useState<AdminSnippet[]>(initialSnippets);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "published" | "draft">("all");

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = React.useState<AdminSnippet | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Edit dialog state
  const [editTarget, setEditTarget] = React.useState<AdminSnippet | null>(null);
  const [editForm, setEditForm] = React.useState({
    title: "",
    slug: "",
    description: "",
    code: "",
    filename: "",
    language_id: "",
  });
  const [editTags, setEditTags] = React.useState<TagType[]>([]);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  // ── Filtering ────────────────────────────────────────
  const filteredSnippets = React.useMemo(() => {
    let result = snippets;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          (s.description?.toLowerCase().includes(q) ?? false)
      );
    }

    if (statusFilter === "published") {
      result = result.filter((s) => s.published);
    } else if (statusFilter === "draft") {
      result = result.filter((s) => !s.published);
    }

    return result;
  }, [snippets, search, statusFilter]);

  // ── Toggle Publish ───────────────────────────────────
  async function handleTogglePublish(snippet: AdminSnippet) {
    const newStatus = !snippet.published;
    // Optimistic update
    setSnippets((prev) =>
      prev.map((s) => (s.id === snippet.id ? { ...s, published: newStatus } : s))
    );

    const res = await toggleSnippetPublished(snippet.id, newStatus);
    if (!res.success) {
      // Rollback
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === snippet.id ? { ...s, published: !newStatus } : s
        )
      );
      toast.error("Lỗi: " + res.error);
    } else {
      toast.success(newStatus ? "Đã xuất bản!" : "Đã chuyển về Draft!");
    }
  }

  // ── Edit ──────────────────────────────────────────────
  function startEdit(snippet: AdminSnippet) {
    setEditTarget(snippet);
    setEditForm({
      title: snippet.title,
      slug: snippet.slug,
      description: snippet.description ?? "",
      code: snippet.code,
      filename: snippet.filename ?? "snippet.ts",
      language_id: snippet.language_id ?? "",
    });
    setEditTags(
      snippet.tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        created_at: "",
      }))
    );
  }

  async function handleSaveEdit() {
    if (!editTarget) return;
    if (!editForm.title.trim() || !editForm.slug.trim() || !editForm.code.trim()) {
      toast.error("Title, slug và code không được để trống.");
      return;
    }
    setIsSavingEdit(true);

    const res = await updateSnippet(editTarget.id, {
      title: editForm.title,
      slug: editForm.slug,
      description: editForm.description,
      code: editForm.code,
      filename: editForm.filename,
      language_id: editForm.language_id,
      published: editTarget.published,
      tagIds: editTags.map((t) => t.id),
    });

    setIsSavingEdit(false);

    if (res.success) {
      toast.success("Cập nhật snippet thành công!");
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === editTarget.id
            ? {
                ...s,
                title: editForm.title,
                slug: editForm.slug,
                description: editForm.description,
                code: editForm.code,
                filename: editForm.filename,
                language_id: editForm.language_id,
                tags: editTags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
              }
            : s
        )
      );
      setEditTarget(null);
    } else {
      toast.error("Cập nhật thất bại", { description: res.error });
    }
  }

  // ── Delete ───────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const res = await deleteSnippet(deleteTarget.id);
    if (res.success) {
      setSnippets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Đã bay màu! 🗑️");
    } else {
      toast.error("Lỗi: " + res.error);
    }

    setIsDeleting(false);
    setDeleteTarget(null);
  }

  // ── Format date ──────────────────────────────────────
  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const publishedCount = snippets.filter((s) => s.published).length;
  const draftCount = snippets.filter((s) => !s.published).length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <span className="text-zinc-400">Tổng:</span>
          <span className="text-white font-semibold">{snippets.length}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-emerald-400">Published:</span>
          <span className="text-emerald-300 font-semibold">
            {publishedCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="text-amber-400">Draft:</span>
          <span className="text-amber-300 font-semibold">{draftCount}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Tìm theo tiêu đề, slug hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-sm h-9"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
          {(
            [
              { key: "all", label: "Tất cả" },
              { key: "published", label: "Published" },
              { key: "draft", label: "Draft" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                statusFilter === key
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-[#0d0d0f]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.07] hover:bg-transparent">
              <TableHead className="text-xs text-zinc-500 w-[35%]">
                Snippet
              </TableHead>
              <TableHead className="text-xs text-zinc-500 w-[20%]">
                Tags
              </TableHead>
              <TableHead className="text-xs text-zinc-500 w-[12%]">
                Trạng thái
              </TableHead>
              <TableHead className="text-xs text-zinc-500 w-[12%]">
                Filename
              </TableHead>
              <TableHead className="text-xs text-zinc-500 w-[12%]">
                Ngày tạo
              </TableHead>
              <TableHead className="text-xs text-zinc-500 w-[9%] text-right">
                
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSnippets.length === 0 ? (
              <TableRow className="border-white/[0.07]">
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-zinc-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Code2 className="w-5 h-5 text-zinc-600" />
                    <p className="text-sm">Không tìm thấy snippet nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSnippets.map((snippet) => (
                <TableRow
                  key={snippet.id}
                  className="border-white/[0.07] group"
                >
                  {/* Title & Code Preview */}
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate max-w-[360px] flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                        {snippet.title}
                      </p>
                      <p className="text-[11px] text-zinc-600 truncate max-w-[360px] mt-1 font-mono leading-none">
                        {snippet.code.substring(0, 70).replace(/\n/g, " ")}
                        {snippet.code.length > 70 ? "..." : ""}
                      </p>
                    </div>
                  </TableCell>

                  {/* Tags */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {snippet.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-[10px] border-primary/20 text-primary/70 font-mono"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {snippet.tags.length > 2 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-zinc-700 text-zinc-500"
                        >
                          +{snippet.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {snippet.published ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px]">
                        Published
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px]">
                        Draft
                      </Badge>
                    )}
                  </TableCell>

                  {/* Filename */}
                  <TableCell>
                    <span className="text-xs text-zinc-500 font-mono">
                      {snippet.filename ?? "snippet.ts"}
                    </span>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-xs text-zinc-500">
                    {formatDate(snippet.created_at)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-1.5 rounded-md hover:bg-white/10 transition-colors outline-none opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={4}
                        className="w-48"
                      >
                        {/* Edit */}
                        <DropdownMenuItem
                          onClick={() => startEdit(snippet)}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 text-zinc-400" />
                          Sửa snippet
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Toggle Published */}
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(snippet)}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer"
                        >
                          {snippet.published ? (
                            <>
                              <EyeOff className="w-4 h-4 text-zinc-400" />
                              Chuyển về Draft
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 text-emerald-400" />
                              Xuất bản
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Delete */}
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(snippet)}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa snippet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer info */}
      <p className="text-xs text-zinc-600 text-right">
        Hiển thị {filteredSnippets.length} / {snippets.length} snippets
      </p>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="bg-[#111113] border-white/10 sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" />
              Sửa Snippet
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Chỉnh sửa thông tin và code cho snippet này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Tiêu đề</Label>
              <Input
                value={editForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditForm((prev) => ({
                    ...prev,
                    title,
                    slug: slugify(title, { lower: true, strict: true, locale: "vi" }),
                  }));
                }}
                className="bg-white/5 border-white/10 h-9 text-sm"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Hash className="w-3 h-3" /> Slug
              </Label>
              <Input
                value={editForm.slug}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="bg-white/5 border-white/10 h-9 text-sm font-mono"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Mô tả</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
                className="bg-white/5 border-white/10 text-sm resize-none"
              />
            </div>

            {/* Filename */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400 flex items-center gap-1.5">
                <FileCode2 className="w-3 h-3" /> Filename
              </Label>
              <Input
                value={editForm.filename}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, filename: e.target.value }))
                }
                className="bg-white/5 border-white/10 h-9 text-sm font-mono"
              />
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Code2 className="w-3 h-3" /> Code
              </Label>
              <div className="rounded-lg overflow-hidden border border-white/10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d0d0f] border-b border-white/[0.07]">
                  <div className="w-2 h-2 rounded-full bg-red-500/60" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                  <div className="w-2 h-2 rounded-full bg-green-500/60" />
                </div>
                <textarea
                  value={editForm.code}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  rows={12}
                  className="w-full bg-[#09090b] text-zinc-200 font-mono text-sm leading-relaxed p-3 resize-y outline-none min-h-[200px]"
                  style={{ fontFamily: "var(--font-jb-mono), monospace" }}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Ngôn ngữ chính
              </Label>
              <LanguagesSelect
                value={editForm.language_id}
                onChange={(val) => setEditForm((prev) => ({ ...prev, language_id: val }))}
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Tags</Label>
              <TagsCombobox
                selectedTags={editTags}
                onChange={setEditTags}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 shrink-0 border-t border-white/[0.07] pt-4">
            <Button
              variant="ghost"
              onClick={() => setEditTarget(null)}
              disabled={isSavingEdit}
              className="text-zinc-400 hover:text-white"
            >
              Huỷ
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSavingEdit ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Xác nhận xóa snippet
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa snippet{" "}
              <strong className="text-white">
                &quot;{deleteTarget?.title}&quot;
              </strong>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa snippet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
