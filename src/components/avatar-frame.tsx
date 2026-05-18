import React from 'react';
import Image from 'next/image';

interface AvatarFrameProps {
  frameClass?: string;
  avatarUrl?: string | null;
  initials?: string;
  sizeClassName?: string;
  imageSize?: number;
  overlay?: React.ReactNode;
}

export function AvatarFrame({
  frameClass = 'frame-default',
  avatarUrl,
  initials,
  sizeClassName = 'size-40',
  imageSize = 160,
  overlay,
}: AvatarFrameProps) {
  const avatarContent = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt="Avatar"
      width={imageSize}
      height={imageSize}
      className="absolute inset-0 w-full h-full object-cover rounded-full"
      unoptimized
    />
  ) : (
    <span className={`font-bold text-primary/60 select-none ${imageSize >= 128 ? 'text-4xl' : 'text-xl'}`}>
      {initials}
    </span>
  );

  if (frameClass === 'frame-intern') {
    return (
      <div className={`relative ${sizeClassName} rounded-full flex items-center justify-center p-2 group shrink-0`}>
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse"></div>
        <div className="relative size-full rounded-full overflow-hidden bg-[#0a0a0c] z-10 border-2 border-[#0d1117] flex items-center justify-center">
          {avatarContent}
          {overlay}
        </div>
      </div>
    );
  }

  if (frameClass === 'frame-master') {
    return (
      <div className={`relative ${sizeClassName} rounded-full flex items-center justify-center p-2 overflow-hidden group shrink-0`}>
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,#06b6d4_360deg)] animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent_0_340deg,#8b5cf6_360deg)] animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-[3px] bg-[#0d1117] rounded-full z-0"></div>
        <div className="relative size-full rounded-full overflow-hidden z-10 bg-[#0a0a0c] flex items-center justify-center">
          {avatarContent}
          {overlay}
        </div>
      </div>
    );
  }

  // Default frame
  return (
    <div className={`relative ${sizeClassName} rounded-full flex items-center justify-center p-2 group shrink-0`}>
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-600/50 rotate-45 transition-colors group-hover:border-primary/50"></div>
      <div className="relative size-full rounded-full overflow-hidden bg-[#0a0a0c] z-10 flex items-center justify-center">
        {avatarContent}
        {overlay}
      </div>
    </div>
  );
}
