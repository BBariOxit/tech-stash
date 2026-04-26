"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { FileText, Layers, Tag, Shield, ChevronRight, ArrowLeft, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Tạo Post",
    icon: FileText,
    exact: true,
  },
  {
    href: "/admin/posts",
    label: "Quản lý Posts",
    icon: Layers,
    exact: false,
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
  const supabase = React.useMemo(() => createClient(), []);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (isMounted) {
        setUser(currentUser ?? null);
      }
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    "Người dùng";
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;

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
                  : "text-zinc-400 hover:text-white hover:bg-white/6 border-transparent"
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
      <div className="p-3 border-t border-white/[0.07] space-y-2">
        {user ? (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/3 p-2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="User avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full border border-primary/30 object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-200">{displayName}</p>
              <p className="truncate text-[10px] text-zinc-500">{user.email ?? ""}</p>
            </div>
          </div>
        ) : (
          <Link
            href="/login?next=/admin"
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors px-2 py-2 rounded-lg hover:bg-white/4"
          >
            <LogIn className="w-3 h-3" />
            Đăng nhập
          </Link>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-2 rounded-lg hover:bg-white/4"
        >
          <ArrowLeft className="w-3 h-3" />
          Về trang chủ
        </Link>
      </div>
    </aside>
  );
}
