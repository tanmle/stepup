interface CollectionGaugeProps {
  percentage: number;
  collected: number;
  uncollected: number;
}

export default function CollectionGauge({ percentage, collected, uncollected }: CollectionGaugeProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-lg">
      {/* SVG Gauge */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#e3e1eb"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#00288e"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[36px] font-bold text-on-background leading-none">{percentage}</span>
          <span className="text-[20px] font-bold text-on-background leading-none">%</span>
          <span className="text-label-sm text-emerald-600 flex items-center gap-xs mt-1">
            <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
            5% vs tháng trước
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-sm">
        <div className="flex justify-between items-center p-sm bg-surface-container rounded-xl">
          <span className="text-label-md text-on-surface">Đã thu</span>
          <span className="text-title-lg text-primary font-semibold">
            {(collected / 1_000_000).toFixed(0)}M đ
          </span>
        </div>
        <div className="flex justify-between items-center p-sm bg-surface-container-low rounded-xl">
          <span className="text-label-md text-on-surface-variant">Chưa thu</span>
          <span className="text-title-lg text-secondary font-semibold">
            {(uncollected / 1_000_000).toFixed(0)}M đ
          </span>
        </div>
      </div>
    </div>
  );
}
