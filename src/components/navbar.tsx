"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useState, useEffect, useMemo } from "react";
import { Search, Menu, X, Terminal, LogIn } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { UserDropdown } from "@/components/user-dropdown";

import { dummyNavLinks, dummySiteConfig } from "@/data";

const navLinks = dummyNavLinks;

export default function Navbar() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "User";
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setUser(session?.user ?? null);

          if (session?.user) {
            const { data } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .maybeSingle();
            setRole(data?.role ?? null);
          } else {
            setRole(null);
          }
        }
      } catch (error) {
        console.warn("Auth load error (likely concurrent request):", error);
      }
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setRole(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-white/6 bg-[#09090b]/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 group"
          aria-label="tech-stash home"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-colors">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <span className="font-mono text-sm font-semibold text-white group-hover:text-primary transition-colors">
            <span className="text-primary/60">&lt;</span>
            tech-stash
            <span className="text-primary/60"> /&gt;</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-zinc-300 hover:text-white hover:bg-white/6"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-md text-zinc-300 hover:text-white hover:bg-white/6 transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <Link
            href={dummySiteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-md text-zinc-300 hover:text-white hover:bg-white/6 transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </Link>
          <Link
            href={dummySiteConfig.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-md text-zinc-300 hover:text-white hover:bg-white/6 transition-colors"
            aria-label="Twitter"
          >
            <TwitterIcon className="w-4 h-4" />
          </Link>

          {user ? (
            <UserDropdown user={user} role={role} />
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-200 border border-white/10 hover:text-white hover:border-primary/40 hover:bg-primary/10 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Đăng nhập
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-zinc-300 hover:text-white hover:bg-white/6 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/6 bg-[#09090b]/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-zinc-300 hover:text-white hover:bg-white/6"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/4 px-3 py-2">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="User avatar"
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
                  <span className="truncate text-sm font-medium text-zinc-100">{displayName}</span>
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 rotate-180" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-zinc-200 border border-white/10 hover:text-white hover:border-primary/40 hover:bg-primary/10 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
