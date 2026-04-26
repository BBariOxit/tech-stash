"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Trash2,
  ExternalLink,
  ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { AdminPost } from "@/app/admin/posts/actions";
import {
  togglePostPublished,
  togglePostFeatured,
  deletePost,
} from "@/app/admin/posts/actions";

interface PostsManagementProps {
  initialPosts: AdminPost[];
}

export function PostsManagement({ initialPosts }: PostsManagementProps) {
  const [posts, setPosts] = React.useState<AdminPost[]>(initialPosts);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "published" | "draft"
  >("all");
  const [deleteTarget, setDeleteTarget] = React.useState<AdminPost | null>(
    null
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  // ── Filtering ────────────────────────────────────────
  const filteredPosts = React.useMemo(() => {
    let result = posts;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === "published") {
      result = result.filter((p) => p.published);
    } else if (statusFilter === "draft") {
      result = result.filter((p) => !p.published);
    }

    return result;
  }, [posts, search, statusFilter]);

  // ── Toggle Publish ───────────────────────────────────
  async function handleTogglePublish(post: AdminPost) {
    const newStatus = !post.published;
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, published: newStatus } : p))
    );

    const res = await togglePostPublished(post.id, newStatus);
    if (!res.success) {
      // Rollback
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, published: !newStatus } : p
        )
      );
      toast.error("Lỗi: " + res.error);
    } else {
      toast.success(newStatus ? "Đã xuất bản!" : "Đã chuyển về Bản nháp!");
    }
  }

  // ── Toggle Featured ──────────────────────────────────
  async function handleToggleFeatured(post: AdminPost) {
    const newFeatured = !post.featured;
    // Optimistic: nếu set featured, bỏ featured của bài khác
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id) return { ...p, featured: newFeatured };
        if (newFeatured) return { ...p, featured: false };
        return p;
      })
    );

    const res = await togglePostFeatured(post.id, newFeatured);
    if (!res.success) {
      // Rollback: reload from initialPosts
      setPosts(initialPosts);
      toast.error("Lỗi: " + res.error);
    } else {
      toast.success(
        newFeatured
          ? "Đã ghim bài viết lên trang chủ!"
          : "Đã bỏ ghim bài viết!"
      );
    }
  }

  // ── Delete ───────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const res = await deletePost(deleteTarget.id);
    if (res.success) {
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Đã bay màu! 🗑️");
    } else {
      toast.error("Lỗi: " + res.error);
    }

    setIsDeleting(false);
    setDeleteTarget(null);
  }

  // ── Format date ──────────────────────────────────────
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <span className="text-zinc-400">Tổng:</span>
          <span className="text-white font-semibold">{posts.length}</span>
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
            placeholder="Tìm theo tiêu đề hoặc slug..."
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
              <TableHead className="w-[60px] text-xs text-zinc-500">
                Ảnh
              </TableHead>
              <TableHead className="text-xs text-zinc-500">
                Tiêu đề
              </TableHead>
              <TableHead className="text-xs text-zinc-500 w-[100px]">
                Trạng thái
              </TableHead>
              <TableHead className="text-xs text-zinc-500 w-[100px]">
                Tags
              </TableHead>
              <TableHead className="text-xs text-zinc-500 w-[100px]">
                Ngày tạo
              </TableHead>
              <TableHead className="text-xs text-zinc-500 w-[60px] text-right">
                
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow className="border-white/[0.07]">
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-zinc-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-5 h-5 text-zinc-600" />
                    <p className="text-sm">Không tìm thấy bài viết nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow
                  key={post.id}
                  className="border-white/[0.07] group"
                >
                  {/* Thumbnail */}
                  <TableCell>
                    {post.thumbnail ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                        <Image
                          src={post.thumbnail}
                          alt={post.title}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-zinc-600" />
                      </div>
                    )}
                  </TableCell>

                  {/* Title & Slug */}
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate max-w-[360px] flex items-center gap-1.5">
                        {post.featured && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                        {post.title}
                      </p>
                      <p className="text-xs text-zinc-600 truncate max-w-[360px] mt-0.5 font-mono">
                        /{post.slug}
                      </p>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {post.published ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px]">
                        Published
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px]">
                        Draft
                      </Badge>
                    )}
                  </TableCell>

                  {/* Tags */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] border-primary/20 text-primary/70 font-mono"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-xs text-zinc-500">
                    {formatDate(post.created_at)}
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
                        {/* Preview */}
                        <DropdownMenuItem
                          render={
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer"
                            />
                          }
                        >
                          <ExternalLink className="w-4 h-4 text-zinc-400" />
                          Xem bài viết
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Toggle Published */}
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(post)}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer"
                        >
                          {post.published ? (
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

                        {/* Toggle Featured */}
                        <DropdownMenuItem
                          onClick={() => handleToggleFeatured(post)}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer"
                        >
                          {post.featured ? (
                            <>
                              <StarOff className="w-4 h-4 text-zinc-400" />
                              Bỏ ghim Featured
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 text-amber-400" />
                              Ghim Featured
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Delete */}
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(post)}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa bài viết
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
        Hiển thị {filteredPosts.length} / {posts.length} bài viết
      </p>

      {/* Delete Confirmation Dialog */}
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
              Xác nhận xóa bài viết
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa bài viết{" "}
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
              {isDeleting ? "Đang xóa..." : "Xóa bài viết"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
