type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

export default function BrandMark({
  className = "",
  compact = false
}: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/35 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-[2px] rounded-[1rem] bg-[linear-gradient(145deg,rgba(255,58,138,0.95),rgba(34,211,238,0.55)_58%,rgba(5,5,5,0.98))]" />
        <div className="absolute inset-[7px] rounded-[0.85rem] border border-white/12 bg-black/35" />
        <div className="relative flex items-end gap-[3px]">
          <span className="h-3 w-[4px] rounded-full bg-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
          <span className="h-6 w-[4px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.65)]" />
          <span className="h-8 w-[4px] rounded-full bg-[#ff4fa3] shadow-[0_0_14px_rgba(255,79,163,0.75)]" />
          <span className="h-5 w-[4px] rounded-full bg-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
        </div>
      </div>

      {!compact && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.36em] text-white/48">
            Wrapped Studio
          </p>
          <p className="text-base font-semibold tracking-[-0.03em] text-white">
            TikTok Wrapped
          </p>
        </div>
      )}
    </div>
  );
}
