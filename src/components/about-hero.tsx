"use client";

import { TerminalProfile } from "@/components/TerminalProfile";
import dynamic from "next/dynamic";
import { Cpu, CodeXml, Layers, Terminal, Zap } from "lucide-react";

// Fix hydration mismatch: GitHubCalendar depends on client-side data (dates, timezone)
const GitHubCalendar = dynamic(
  () => import("react-github-calendar").then((mod: any) => mod.default || mod.GitHubCalendar),
  { ssr: false }
) as any;

export default function AboutHero() {
  return (
    <div className="max-w-6xl mx-auto px-4 mt-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">About Me.</h1>
        <p className="text-zinc-400">Không nói nhiều, nhìn code, commit và projects là hiểu.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* HÀNG 1: Terminal (Trái) + Current Focus (Phải) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Cột trái (Chiếm 8 phần): Terminal */}
          <div className="lg:col-span-8 w-full">
            <TerminalProfile />
          </div>

          {/* Cột phải (Chiếm 4 phần): Current Focus */}
          <div className="lg:col-span-4 w-full flex flex-col">
            <div className="group bg-[#121212] border border-white/10 rounded-xl p-6 shadow-2xl h-full flex flex-col justify-center relative overflow-hidden">
               {/* Tao ném thêm cái glow đằng sau cho nó nghệ */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
               
               <div className="z-10">
                 <h3 className="text-primary/80 text-sm font-mono mb-3">{"// Current Focus"}</h3>
                 <p className="text-white text-xl font-semibold leading-relaxed">
                   System Design &<br/>Web Development.
                 </p>
               </div>

               {/* Con hàng Icon nằm đây nè */}
               <Layers 
                 className="absolute right-8 top-1/2 -translate-y-1/2 size-24 text-primary opacity-20 -rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110" 
               />
            </div>
          </div>
        </div>

        {/* HÀNG 2: Github Calendar Full Width */}
        <div className="w-full">
          <div className="bg-[#121212] border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col">
            <div className="flex w-full items-center justify-between mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-zinc-300" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
                Github Contributions
              </h3>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                Always building
              </span>
            </div>
            
            {/* Lịch Github ép flex justify-center để nó luôn nằm giữa khi tràn full width */}
            <div className="w-full overflow-x-auto flex justify-center pb-2">
              <GitHubCalendar 
                username="BBariOxit" 
                colorScheme="dark"
                theme={{
                  dark: [
                    "#1c1c1f", // Muted empty state
                    "color-mix(in srgb, var(--primary) 20%, transparent)",
                    "color-mix(in srgb, var(--primary) 40%, transparent)",
                    "color-mix(in srgb, var(--primary) 70%, transparent)",
                    "var(--primary)", // Brand Primary
                  ],
                }}
                fontSize={13}
                blockSize={12}
                blockMargin={5}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}