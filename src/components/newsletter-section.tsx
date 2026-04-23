"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dummySiteConfig } from "@/data";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    // Simulate API call
    setTimeout(() => {
      setState("success");
      setEmail("");
    }, 1200);
  };

  return (
    <section className="py-16 px-4 sm:px-6 border-t border-white/[0.05]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0d1117] to-[#111113] overflow-hidden p-8 sm:p-12"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          {/* Border glow top */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          <div className="relative max-w-lg mx-auto text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 mb-6">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Nhận code xịn mỗi tuần
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed mb-8">
              Tổng hợp bài viết mới, snippet hay, và tips thực chiến gửi thẳng vào
              hộp thư. Không spam, không quảng cáo — chỉ có code.
            </p>

            <AnimatePresence mode="wait">
              {state === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-cyan-400" />
                  <p className="text-white font-medium">Cảm ơn mày đã subscribe! 🎉</p>
                  <p className="text-zinc-300 text-sm">Check hộp thư để confirm nhé.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input
                      id="newsletter-email"
                      type="email"
                      placeholder={dummySiteConfig.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-400 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/20 h-10"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={state === "loading"}
                    className="bg-cyan-400 text-zinc-950 font-semibold hover:bg-cyan-300 disabled:opacity-70 h-10 px-5 shrink-0 transition-colors"
                  >
                    {state === "loading" ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                        Đang gửi...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Subscribe <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {state !== "success" && (
              <p className="mt-3 text-xs text-zinc-400">
                Unsubscribe bất cứ lúc nào. No BS.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
