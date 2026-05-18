import React from 'react';

interface LevelBadgeProps {
  level: number;
  className?: string;
}

export function LevelBadge({ level, className = "" }: LevelBadgeProps) {
  return (
    <div className={`bg-zinc-900 border border-zinc-700 text-primary text-xs font-bold px-3 py-1 rounded-full shadow-lg tracking-wide flex items-center justify-center ${className}`}>
      Lv.{level}
    </div>
  );
}
