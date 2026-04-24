"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

interface ThumbnailUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ThumbnailUpload({ value, onChange }: ThumbnailUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ảnh quá lớn", {
        description: "Vui lòng chọn ảnh dưới 5MB.",
      });
      e.target.value = "";
      return;
    }

    try {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("thumbnails").getPublicUrl(fileName);
      onChange(data.publicUrl);
      toast.success("Upload ảnh thành công");
    } catch (error) {
      toast.error("Upload ảnh thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">Ảnh bìa (Thumbnail)</p>

      {value ? (
        <div className="group relative h-40 w-full overflow-hidden rounded-lg border border-white/10 bg-black/30">
          <img src={value} alt="Thumbnail preview" className="h-full w-full object-cover" />

          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
            aria-label="Xoa thumbnail"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/15 bg-white/3 transition-colors hover:border-primary/40 hover:bg-white/5">
          {isUploading ? (
            <>
              <Loader2 className="mb-2 h-7 w-7 animate-spin text-primary" />
              <p className="text-sm text-zinc-400">Đang upload...</p>
            </>
          ) : (
            <>
              <ImagePlus className="mb-2 h-7 w-7 text-zinc-500" />
              <p className="text-sm text-zinc-400">Click để chọn ảnh</p>
              <p className="mt-1 text-xs text-zinc-600">PNG, JPG, WEBP (tối đa 5MB)</p>
            </>
          )}

          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
