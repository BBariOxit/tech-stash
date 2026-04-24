"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Tag, Shield, ChevronRight, ArrowLeft } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Tạo Post",
    icon: FileText,
    exact: true,
  },
  {
    href: "/admin/tags",
    label: "Quản lý Tags",
    icon: Tag,
    exact: false,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 border-r border-white/[0.07] bg-[#0a0a0c] flex flex-col">
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/15 border border-primary/25">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-semibold text-white">Admin Panel</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">tech-stash</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold px-2 pb-2">
          Nội dung
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all group border",
                isActive
                  ? "bg-primary/10 text-primary border-primary/20 font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.06] border-transparent"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.07]">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-2 rounded-lg hover:bg-white/[0.04]"
        >
          <ArrowLeft className="w-3 h-3" />
          Về trang chủ
        </Link>
      </div>
    </aside>
  );
}
