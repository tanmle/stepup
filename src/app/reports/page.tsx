import type { Metadata } from 'next';
import CollectionGauge from '@/components/charts/CollectionGauge';
import CategoryBreakdown from '@/components/charts/CategoryBreakdown';
import ReportsRevenueChart from '@/components/charts/ReportsRevenueChart';
import { REPORT_KPIS, MONTHLY_REVENUE, REVENUE_CATEGORIES } from '@/lib/data/dashboard';

export const metadata: Metadata = {
  title: 'Báo cáo tài chính',
  description: 'Báo cáo tài chính trung tâm Anh ngữ StepUp — doanh thu, chi phí, lợi nhuận.',
};

export default function ReportsPage() {
  const REPORT_KPI_CARDS = [
    {
      label: 'Tổng doanh thu',
      value: REPORT_KPIS.totalRevenue,
      trend: REPORT_KPIS.totalRevenueTrend,
      trendUp: REPORT_KPIS.totalRevenueTrendUp,
      icon: 'trending_up',
      color: 'text-primary',
    },
    {
      label: 'Tổng chi phí',
      value: REPORT_KPIS.totalCost,
      trend: REPORT_KPIS.totalCostTrend,
      trendUp: !REPORT_KPIS.totalCostTrendUp,
      icon: 'trending_down',
      color: 'text-error',
    },
    {
      label: 'Lợi nhuận ròng',
      value: REPORT_KPIS.netProfit,
      trend: REPORT_KPIS.netProfitTrend,
      trendUp: REPORT_KPIS.netProfitTrendUp,
      icon: 'savings',
      color: 'text-emerald-600',
    },
    {
      label: 'Công nợ học phí',
      value: REPORT_KPIS.tuitionDebt,
      trend: REPORT_KPIS.tuitionDebtTrend,
      trendUp: REPORT_KPIS.tuitionDebtTrendUp,
      icon: 'money_off',
      color: 'text-amber-600',
    },
  ];

  const collectedAmount = REPORT_KPIS.totalRevenue * 0.85;
  const uncollectedAmount = REPORT_KPIS.totalRevenue * 0.15;

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-background">Báo cáo tài chính</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Tổng quan tài chính trung tâm — Năm 2024</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn-secondary">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Bộ lọc
          </button>
          <button className="btn-secondary">
            <span className="material-symbols-outlined text-[16px]">print</span>
            In báo cáo
          </button>
          <button className="btn-primary">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {REPORT_KPI_CARDS.map((kpi, i) => (
          <div
            key={kpi.label}
            className="card p-md relative overflow-hidden group hover:shadow-card-hover transition-all duration-300"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-md">
                <span className="text-label-sm text-on-surface-variant">{kpi.label}</span>
                <span className={`material-symbols-outlined text-[20px] ${kpi.color}`}>{kpi.icon}</span>
              </div>
              <p className={`text-[22px] font-bold ${kpi.color} leading-tight`}>
                {(kpi.value / 1_000_000).toLocaleString('vi-VN')}M <span className="text-body-md font-normal text-on-surface-variant">đ</span>
              </p>
              <div className="flex items-center gap-xs mt-xs">
                <span
                  className={`material-symbols-outlined text-[13px] ${kpi.trendUp ? 'text-emerald-600' : 'text-error'}`}
                >
                  {kpi.trendUp ? 'trending_up' : 'trending_down'}
                </span>
                <span className={`text-label-sm font-semibold ${kpi.trendUp ? 'text-emerald-600' : 'text-error'}`}>
                  {kpi.trend} so với năm trước
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Revenue + Cost Bar Chart (span 2) */}
        <div className="card p-lg lg:col-span-2">
          <div className="flex items-center justify-between mb-lg">
            <div>
              <h2 className="text-title-lg text-on-background">Doanh thu & Chi phí</h2>
              <p className="text-label-sm text-on-surface-variant mt-xs">Theo tháng — Năm 2024</p>
            </div>
            <button className="btn-secondary text-[12px] px-sm py-xs">
              <span className="material-symbols-outlined text-[14px]">filter_list</span>
              Năm 2024
            </button>
          </div>
          <ReportsRevenueChart data={MONTHLY_REVENUE} />
        </div>

        {/* Collection Gauge */}
        <div className="card p-lg">
          <div className="mb-lg">
            <h2 className="text-title-lg text-on-background">Tỷ lệ thu học phí</h2>
            <p className="text-label-sm text-on-surface-variant mt-xs">Kỳ hiện tại</p>
          </div>
          <CollectionGauge
            percentage={85}
            collected={collectedAmount}
            uncollected={uncollectedAmount}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <div className="card p-lg">
          <div className="mb-lg">
            <h2 className="text-title-lg text-on-background">Cơ cấu doanh thu</h2>
            <p className="text-label-sm text-on-surface-variant mt-xs">Phân tích theo nguồn thu</p>
          </div>
          <CategoryBreakdown data={REVENUE_CATEGORIES} />
        </div>

        {/* Top metrics table */}
        <div className="card p-lg">
          <div className="mb-lg">
            <h2 className="text-title-lg text-on-background">Chỉ số tháng này</h2>
            <p className="text-label-sm text-on-surface-variant mt-xs">So sánh với tháng trước</p>
          </div>
          <div className="space-y-sm">
            {[
              { label: 'Doanh thu tháng 7', value: '510M đ', change: '+21.4%', up: true },
              { label: 'Chi phí tháng 7', value: '185M đ', change: '+3.4%', up: false },
              { label: 'Lợi nhuận tháng 7', value: '325M đ', change: '+32.7%', up: true },
              { label: 'Học viên mới', value: '80 HV', change: '+6.7%', up: true },
              { label: 'Tỷ lệ tái đăng ký', value: '76%', change: '+2%', up: true },
              { label: 'Học phí tồn đọng', value: '85M đ', change: '-3%', up: true },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-sm bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                <span className="text-body-md text-on-surface">{metric.label}</span>
                <div className="flex items-center gap-md">
                  <span className="text-body-md font-semibold text-on-background">{metric.value}</span>
                  <span className={`flex items-center gap-xs text-label-sm font-semibold ${metric.up ? 'text-emerald-600' : 'text-error'}`}>
                    <span className="material-symbols-outlined text-[13px]">
                      {metric.up ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
