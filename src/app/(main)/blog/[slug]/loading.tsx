export default function Loading() {
  return (
    <div className="pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-4 w-24 bg-white/[0.06] rounded mb-8" />
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
          <div className="h-5 w-20 bg-white/[0.06] rounded-full" />
        </div>
        <div className="h-10 bg-white/[0.06] rounded mb-2" />
        <div className="h-10 w-3/4 bg-white/[0.06] rounded mb-6" />
        <div className="h-px bg-white/[0.06] mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-white/[0.04] rounded w-full" />
          <div className="h-4 bg-white/[0.04] rounded w-5/6" />
          <div className="h-4 bg-white/[0.04] rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}
