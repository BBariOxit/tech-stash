"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { 
  LogOut, 
  User as UserIcon, 
  Settings, 
  LayoutDashboard,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface UserDropdownProps {
  user: User;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";
    
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-white/10 bg-white/4 px-2.5 py-1.5 text-zinc-100 transition-all hover:border-primary/40 hover:bg-primary/10 outline-none group cursor-pointer">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full border border-primary/30 object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[11px] font-semibold text-primary">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="max-w-24 truncate text-sm font-medium group-hover:text-white transition-colors">
          {displayName}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-[#0d0d0f] border-white/10 p-1.5 text-zinc-300 shadow-2xl rounded-xl overflow-hidden"
        sideOffset={8}
      >
        {/* User Info Header Section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-3 font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold text-white leading-none">{displayName}</p>
              <p className="text-xs text-zinc-500 truncate leading-tight">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-white/5 mx-1" />

        {/* Menu Items Section */}
        <DropdownMenuGroup className="p-1 space-y-0.5">
          <DropdownMenuItem asChild>
            <Link 
              href="/admin" 
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors focus:bg-white/5 focus:text-white outline-none"
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="text-sm">Admin Dashboard</span>
              <ShieldCheck className="w-3 h-3 ml-auto text-primary/60" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link 
              href="/profile" 
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors focus:bg-white/5 focus:text-white outline-none"
            >
              <UserIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-sm">Hồ sơ cá nhân</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link 
              href="/settings" 
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors focus:bg-white/5 focus:text-white outline-none"
            >
              <Settings className="w-4 h-4 text-zinc-400" />
              <span className="text-sm">Cài đặt hệ thống</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5 mx-1" />

        {/* External Link Section */}
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild>
            <a 
              href="https://github.com" 
              target="_blank"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors focus:bg-white/5 focus:text-white outline-none group/link"
            >
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover/link:text-zinc-300" />
              <span className="text-sm">Trợ giúp & Phản hồi</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5 mx-1" />

        {/* Logout Action Section */}
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors focus:bg-red-500/10 focus:text-red-400 text-red-400/80 outline-none"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
