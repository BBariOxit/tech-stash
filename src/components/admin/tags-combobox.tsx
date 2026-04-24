"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "../../../types/supabase";

type Tag = Tables<"tags">;

interface TagsComboboxProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagsCombobox({ selectedTags, onChange }: TagsComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [search, setSearch] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const supabase = createClient();

  // Load all existing tags
  React.useEffect(() => {
    supabase
      .from("tags")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setTags(data);
      });
  }, []);

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = tags.find(
    (t) => t.name.toLowerCase() === search.toLowerCase()
  );

  const isSelected = (tag: Tag) => selectedTags.some((s) => s.id === tag.id);

  const toggleTag = (tag: Tag) => {
    if (isSelected(tag)) {
      onChange(selectedTags.filter((s) => s.id !== tag.id));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const createTag = async () => {
    if (!search.trim() || creating) return;
    setCreating(true);
    const slug = search
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const { data, error } = await supabase
      .from("tags")
      .insert({ name: search.trim(), slug })
      .select()
      .single();
    if (!error && data) {
      setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      onChange([...selectedTags, data]);
    }
    setSearch("");
    setCreating(false);
  };

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 pl-2 pr-1 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="rounded-full hover:bg-primary/20 p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Combobox trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="w-full flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors text-left"
          aria-expanded={open}
        >
          <span className="text-muted-foreground">
            {selectedTags.length > 0
              ? `${selectedTags.length} tag đã chọn`
              : "Chọn hoặc tạo tags..."}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 border-white/10 bg-[#111113]" align="start">
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Tìm hoặc tạo tag..."
              value={search}
              onValueChange={setSearch}
              className="border-b border-white/10"
            />
            <CommandList>
              {/* Create new tag option */}
              {search.trim() && !exactMatch && (
                <CommandGroup heading="Tạo mới">
                  <CommandItem
                    value={`create-${search}`}
                    onSelect={createTag}
                    disabled={creating}
                    className="gap-2 text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {creating ? "Đang tạo..." : `Tạo "${search}"`}
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                <Tag className="w-4 h-4 mx-auto mb-1 opacity-50" />
                Không tìm thấy tag
              </CommandEmpty>
              <CommandGroup heading="Tags có sẵn">
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => {
                      toggleTag(tag);
                    }}
                    className="gap-2 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected(tag) ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                    {tag.name}
                    <span className="ml-auto text-xs text-muted-foreground font-mono">
                      #{tag.slug}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
