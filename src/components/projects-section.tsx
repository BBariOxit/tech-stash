"use client";

import { ExternalLink, FolderCode } from "lucide-react";
import { GithubIcon as Github } from "@/components/icons";
import { motion } from "motion/react";

const projects = [
  {
    title: "CoinFlow Tracker",
    description: "Nền tảng tracking thị trường Cryptocurrency realtime. Tích hợp Command Palette cực nhạy, cập nhật giá và biểu đồ xu hướng liên tục với độ trễ cực thấp.",
    tags: ["TypeScript", "WebSockets", "Next.js"],
    github: "https://github.com/BBariOxit/CoinFlow",
    demo: "https://coinflow.cobweb.id.vn/",
    color: "cyan",
    colSpan: "md:col-span-2",
  },
  {
    title: "Portfolio Mac OS",
    description: "Bê nguyên hệ sinh thái macOS lên trình duyệt web. Tích hợp Window management, Dock và trải nghiệm đa nhiệm mượt mà không thua kém native app.",
    tags: ["UI/UX", "React", "CSS Grid"],
    github: "#",
    demo: "https://ptb.cobweb.id.vn/",
    color: "slate",
    colSpan: "md:col-span-1",
  },
  {
    title: "KeyHub E-Commerce",
    description: "Nền tảng thương mại điện tử chuyên dụng cho bàn phím cơ. Đầy đủ tính năng giỏ hàng, bộ lọc sản phẩm đa dạng và tối ưu UX/UI chuẩn E-Commerce.",
    tags: ["React", "Zustand", "TailwindCSS"],
    github: "https://github.com/BBariOxit/KeyHub",
    demo: "https://keyhub.cobweb.id.vn/",
    color: "orange",
    colSpan: "md:col-span-1",
  },
  {
    title: "Whip App Ecosystem",
    description: "Ứng dụng quản lý dự án mang phong cách Trello. Tích hợp Kanban board kéo thả mượt mà, đồng bộ task realtime và quản lý cluster database quy mô lớn.",
    tags: ["MongoDB Atlas", "Express", "Auth"],
    github: "https://github.com/BBariOxit/whip-app",
    demo: "https://whip.cobweb.id.vn",
    color: "indigo",
    colSpan: "md:col-span-2",
  },
  {
    title: "Tech Stash",
    description: "Blog cá nhân kiêm kho tàng lưu trữ code snippets. Giao diện Cinematic độc quyền, performance tối đa với Next.js App Router và Tailwind CSS v4.",
    tags: ["Next.js 16", "Tailwind v4", "Framer Motion"],
    github: "#",
    demo: "https://techstash.cobweb.id.vn/",
    color: "blue",
    colSpan: "md:col-span-2",
  },
  {
    title: "MackBook Clone",
    description: "Bản clone landing page giới thiệu sản phẩm mang âm hưởng Apple. Chăm chút kỹ lưỡng vào micro-interactions, cuộn mượt và hiệu ứng chuyển cảnh.",
    tags: ["Frontend", "Animation", "Framer Motion"],
    github: "https://github.com/BBariOxit/macbook",
    demo: "/",
    color: "rose",
    colSpan: "md:col-span-1",
  }
];

const colorVariants = {
  cyan: "group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  indigo: "group-hover:border-indigo-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  blue: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] text-blue-400 bg-blue-400/10 border-blue-400/20",
  orange: "group-hover:border-orange-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)] text-orange-400 bg-orange-400/10 border-orange-400/20",
  slate: "group-hover:border-slate-400/50 group-hover:shadow-[0_0_30px_-5px_rgba(148,163,184,0.3)] text-slate-400 bg-slate-400/10 border-slate-400/20",
  rose: "group-hover:border-rose-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)] text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const glowVariants = {
  cyan: "from-cyan-500/10",
  indigo: "from-indigo-500/10",
  blue: "from-blue-500/10",
  orange: "from-orange-500/10",
  slate: "from-slate-400/10",
  rose: "from-rose-500/10",
};

export default function ProjectsSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-32 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-3">My Projects.</h2>
        <p className="text-zinc-400">
          "Crafting scalable, high-performance systems."
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`group relative flex flex-col h-full bg-[#121212] border border-white/10 rounded-2xl p-7 overflow-hidden transition-all duration-500 hover:-translate-y-2 ${project.colSpan} ${colorVariants[project.color as keyof typeof colorVariants].split(' ').filter(c => c.startsWith('group-hover:')).join(' ')}`}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-b ${glowVariants[project.color as keyof typeof glowVariants]} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

            {/* Top Bar: Icon + Actions */}
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 transition-colors duration-500 ${project.color === 'cyan' ? 'group-hover:text-cyan-400' : 
                project.color === 'indigo' ? 'group-hover:text-indigo-400' : 
                project.color === 'blue' ? 'group-hover:text-blue-400' : 
                project.color === 'orange' ? 'group-hover:text-orange-400' : 
                project.color === 'slate' ? 'group-hover:text-slate-400' : 
                'group-hover:text-rose-400'}`}>
                <FolderCode className="size-6" />
              </div>
              
              <div className="flex items-center gap-4">
                <motion.a 
                  href={project.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-zinc-500 hover:text-white transition-colors" 
                  title="Source Code"
                >
                  <Github className="size-5" />
                </motion.a>
                <motion.a 
                  href={project.demo} 
                  target="_blank" 
                  rel="noreferrer" 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-zinc-500 transition-colors ${project.color === 'cyan' ? 'hover:text-cyan-400' : 
                    project.color === 'indigo' ? 'hover:text-indigo-400' : 
                    project.color === 'blue' ? 'hover:text-blue-400' : 
                    project.color === 'orange' ? 'hover:text-orange-400' : 
                    project.color === 'slate' ? 'hover:text-slate-400' : 
                    'hover:text-rose-400'}`}
                  title="Live Demo"
                >
                  <ExternalLink className="size-5" />
                </motion.a>
              </div>
            </div>

            {/* Project Content */}
            <div className="relative z-10 flex-1">
              <h3 className={`text-xl font-bold text-white mb-3 transition-colors duration-500 ${project.color === 'cyan' ? 'group-hover:text-cyan-400' : 
                project.color === 'indigo' ? 'group-hover:text-indigo-400' : 
                project.color === 'blue' ? 'group-hover:text-blue-400' : 
                project.color === 'orange' ? 'group-hover:text-orange-400' : 
                project.color === 'slate' ? 'group-hover:text-slate-400' : 
                'group-hover:text-rose-400'}`}>
                {project.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                {project.description}
              </p>
            </div>

            {/* Tech Stack Tags */}
            <div className="relative z-10 flex flex-wrap gap-2 mt-auto pt-6 border-t border-white/5">
              {project.tags.map((tag, i) => (
                <span 
                  key={i} 
                  className={`px-2.5 py-1 text-[10px] font-mono font-medium rounded-md border transition-all duration-500 ${colorVariants[project.color as keyof typeof colorVariants].split(' ').filter(c => !c.startsWith('group-hover:')).join(' ')}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
