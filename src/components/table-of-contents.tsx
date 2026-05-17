"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, PanelRightClose, PanelRightOpen, X } from "lucide-react";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

// ── Shared nav list ──────────────────────────────────────────
function TocNav({
  headings,
  activeId,
  onItemClick,
}: {
  headings: TocHeading[];
  activeId: string;
  onItemClick: (id: string) => void;
}) {
  const navRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!activeId || !navRef.current) return;
    const activeEl = navRef.current.querySelector(`[href="#${activeId}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeId]);

  return (
    <nav ref={navRef}>
      <ul className="relative flex flex-col gap-0.5">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.06]" />
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id} className="relative">
              {isActive && (
                <motion.div
                  layoutId="toc-active-indicator"
                  className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-primary rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onItemClick(heading.id);
                }}
                className={[
                  "flex py-1.5 pr-2 text-[13px] leading-snug transition-all duration-300 relative",
                  heading.level === 1 ? "pl-2 font-semibold" :
                  heading.level === 2 ? "pl-4" :
                  heading.level === 3 ? "pl-6" :
                  heading.level === 4 ? "pl-8 text-[12px]" :
                  heading.level === 5 ? "pl-10 text-[12px]" : "pl-12 text-[12px]",
                  isActive
                    ? "text-primary font-medium"
                    : "text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                <span className="line-clamp-2">{heading.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ── Main layout component ────────────────────────────────────
interface BlogPostLayoutProps {
  headings: TocHeading[];
  children: React.ReactNode; // the article content
}

export function BlogPostLayout({ headings, children }: BlogPostLayoutProps) {
  const [activeId, setActiveId] = React.useState<string>(headings[0]?.id ?? "");
  const [isOpen, setIsOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // ── Scrollspy ──
  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.scrollY < 100) return;
      const isAtBottom =
        window.innerHeight + Math.round(window.scrollY) >=
        document.body.offsetHeight - 50;
      if (isAtBottom) setActiveId(headings[headings.length - 1].id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 96, behavior: "smooth" });
      setActiveId(id);
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Two-column flex layout ── */}
      <div className="flex items-start justify-center w-full relative">
        {/* Article — animates to center when ToC closes */}
        <motion.article layout className="w-full max-w-4xl min-w-0 relative">
          {/* ToC toggle button — visible only on lg+ */}
          {headings.length > 0 && (
            <div className="hidden lg:flex absolute top-0 right-0 -mr-2">
              <button
                onClick={() => setIsOpen((v) => !v)}
                title={isOpen ? "Ẩn mục lục" : "Hiện mục lục"}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-500 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {isOpen ? (
                  <PanelRightClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelRightOpen className="w-3.5 h-3.5" />
                )}
                {isOpen ? "Ẩn mục lục" : "Hiện mục lục"}
              </button>
            </div>
          )}
          {children}
        </motion.article>

        {/* ── Desktop ToC ── */}
        {headings.length > 0 && (
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.aside
                key="toc"
                initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                animate={{ width: 240, opacity: 1, marginLeft: 64 }}
                exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="sticky top-28 hidden lg:block h-[calc(100vh-8rem)] shrink-0 overflow-hidden"
              >
                {/* Fixed-width inner so content doesn't squish during animation */}
                <div className="w-[240px] h-full overflow-y-auto pb-10 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-5 pl-4">
                    <List className="w-3 h-3 text-primary/50 shrink-0" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
                      On this page
                    </span>
                  </div>
                  <TocNav
                    headings={headings}
                    activeId={activeId}
                    onItemClick={scrollTo}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── Mobile: floating button + bottom sheet ── */}
      {headings.length > 0 && (
        <div className="lg:hidden">
          <motion.button
            onClick={() => setMobileOpen(true)}
            whileTap={{ scale: 0.93 }}
            className="fixed bottom-6 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#111113] border border-white/10 shadow-lg shadow-black/40 text-zinc-300 text-sm font-medium"
          >
            <List className="w-4 h-4 text-primary" />
            Mục lục
          </motion.button>

          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.div
                  key="sheet"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] rounded-t-2xl bg-[#111113] border-t border-white/10 flex flex-col"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
                    <div className="flex items-center gap-2">
                      <List className="w-3.5 h-3.5 text-primary/60" />
                      <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                        On this page
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto px-4 py-4">
                    <TocNav
                      headings={headings}
                      activeId={activeId}
                      onItemClick={scrollTo}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
