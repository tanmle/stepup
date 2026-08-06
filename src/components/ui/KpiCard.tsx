import type { KpiData } from '@/lib/types';

interface KpiCardProps extends KpiData {
  delay?: number;
}

export default function KpiCard({ label, value, trend, trendUp, icon, colorVariant = 'default', delay = 0 }: KpiCardProps) {
  const isError = colorVariant === 'error';

  return (
    <div
      className="card p-md relative overflow-hidden group hover:shadow-card-hover transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          isError ? 'from-error/5' : 'from-primary/5'
        } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
      />

      {/* Decorative orb */}
      <div
        className={`absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl ${
          isError ? 'bg-error/10' : 'bg-primary/10'
        } group-hover:scale-150 transition-transform duration-500`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-md">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isError ? 'bg-error/10' : 'bg-primary/10'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isError ? 'text-error/80' : 'text-primary/80'
              }`}
            >
              {icon}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div
              className={`text-[28px] leading-tight font-bold ${
                isError ? 'text-error' : 'text-on-background'
              }`}
            >
              {value}
            </div>
            {trend !== undefined && (
              <div className="flex items-center gap-xs mt-xs">
                {trendUp !== undefined && (
                  <span
                    className={`material-symbols-outlined text-[13px] ${
                      trendUp ? 'text-emerald-600' : 'text-error'
                    }`}
                  >
                    {trendUp ? 'trending_up' : 'trending_down'}
                  </span>
                )}
                <span
                  className={`text-[11px] font-semibold ${
                    trendUp === undefined
                      ? 'text-on-surface-variant'
                      : trendUp
                      ? 'text-emerald-600'
                      : 'text-error'
                  }`}
                >
                  {trend}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
