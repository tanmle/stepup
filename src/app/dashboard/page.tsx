import type { Metadata } from 'next';
import KpiCard from '@/components/ui/KpiCard';
import {
  DASHBOARD_KPIS,
  RECENT_ENROLLMENTS,
  RECENT_TRANSACTIONS,
  MONTHLY_REVENUE,
  NEW_STUDENTS_DATA,
} from '@/lib/data/dashboard';
import StatusBadge from '@/components/ui/StatusBadge';
import DashboardCharts from '@/components/charts/DashboardCharts';

export const metadata: Metadata = {
  title: 'Tổng quan Dashboard',
  description: 'Tổng quan hoạt động trung tâm Anh ngữ StepUp — doanh thu, học viên, công nợ.',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-background">Tổng quan</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Tóm tắt hoạt động trung tâm hôm nay —{' '}
            <span className="font-medium text-on-surface">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </p>
        </div>
        <div className="flex gap-sm">
          <button className="btn-secondary">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            Tháng này
          </button>
          <button className="btn-primary">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Báo cáo
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-md">
        {DASHBOARD_KPIS.map((kpi, i) => (
          <KpiCard key={kpi.label} {...kpi} delay={i * 60} />
        ))}
      </div>

      {/* Charts Row */}
      <DashboardCharts revenueData={MONTHLY_REVENUE} studentData={NEW_STUDENTS_DATA} />

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {/* Recent Enrollments */}
        <div className="card flex flex-col overflow-hidden">
          <div className="px-lg py-md flex items-center justify-between border-b border-outline-variant/10">
            <h2 className="text-title-lg text-on-background">Ghi danh mới</h2>
            <button className="text-primary hover:text-primary-container text-label-sm transition-colors">
              Xem tất cả
            </button>
          </div>
          <div className="flex flex-col">
            {RECENT_ENROLLMENTS.map((enrollment, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-lg py-md hover:bg-primary/[0.03] transition-colors cursor-pointer border-b border-outline-variant/[0.07] last:border-b-0 group"
              >
                <div className="flex items-center gap-md">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${enrollment.avatarColor}`}
                  >
                    {enrollment.avatarInitials}
                  </div>
                  <div>
                    <p className="text-body-md font-medium text-on-background">{enrollment.studentName}</p>
                    <p className="text-label-sm text-on-surface-variant">{enrollment.course}</p>
                  </div>
                </div>
                <StatusBadge status={enrollment.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card flex flex-col overflow-hidden">
          <div className="px-lg py-md flex items-center justify-between border-b border-outline-variant/10">
            <h2 className="text-title-lg text-on-background">Giao dịch hôm nay</h2>
            <button className="text-primary hover:text-primary-container text-label-sm transition-colors">
              Chi tiết
            </button>
          </div>
          <div className="flex flex-col">
            {RECENT_TRANSACTIONS.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-lg py-md hover:bg-primary/[0.03] transition-colors cursor-pointer border-b border-outline-variant/[0.07] last:border-b-0 group"
              >
                <div className="flex items-center gap-md">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {tx.type === 'income' ? 'add' : 'remove'}
                    </span>
                  </div>
                  <div>
                    <p className="text-body-md font-medium text-on-background">{tx.description}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {tx.time} • {tx.method}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-body-md font-semibold ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-error'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {tx.amount.toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
