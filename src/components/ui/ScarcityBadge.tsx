"use client";

interface ScarcityBadgeProps {
  count?: number;
}

export default function ScarcityBadge({ count = 3 }: ScarcityBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      <span className="text-red-400 text-[10px] uppercase tracking-[0.1em] font-medium">
        Only {count} left at this price
      </span>
    </div>
  );
}
