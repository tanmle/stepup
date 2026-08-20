'use client';

import KpiCard from '@/components/ui/KpiCard';
import StatusBadge from '@/components/ui/StatusBadge';
import DashboardCharts from '@/components/charts/DashboardCharts';
import { formatVND } from '@/utils/format';
import {
  DASHBOARD_KPIS,
  RECENT_ENROLLMENTS,
  RECENT_TRANSACTIONS,
} from '@/lib/data/dashboard';

interface DashboardClientProps {
  data: {
    totalStudents: number;
    activeStudents: number;
    totalTeachers: number;
    revenue: number;
    debt: number;
    profit: number;
    transactions: any[];
    recentEnrollments: any[];
    monthlyRevenue: any[];
    monthlyStudents: any[];
  }
}

export default function DashboardClient({ data }: DashboardClientProps) {
  // Override KPIs with real data
  const kpis = DASHBOARD_KPIS.map(kpi => {
    if (kpi.label === 'Học viên') return { ...kpi, value: data.totalStudents.toLocaleString('vi-VN'), trend: '', trendUp: false };
    if (kpi.label === 'Đang học') return { ...kpi, value: data.activeStudents.toLocaleString('vi-VN'), trend: '', trendUp: false };
    if (kpi.label === 'Giáo viên') return { ...kpi, value: data.totalTeachers.toString(), trend: '', trendUp: false };
    if (kpi.label === 'Doanh thu') return { ...kpi, value: formatVND(data.revenue), trend: '', trendUp: false };
    if (kpi.label === 'Công nợ') return { ...kpi, value: formatVND(data.debt), trend: '', trendUp: false };
    if (kpi.label === 'Lợi nhuận') return { ...kpi, value: formatVND(data.profit), trend: '', trendUp: false };
    return kpi;
  });

  const recentTransactions = data.transactions.map(tx => ({
    id: tx.id,
    type: tx.type,
    description: tx.description || 'Giao dịch',
    amount: tx.amount,
    time: new Date(tx.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    method: tx.payment_method || 'Chuyển khoản'
  }));

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
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} {...kpi} delay={i * 60} />
        ))}
      </div>

      {/* Charts Row */}
      <DashboardCharts revenueData={data.monthlyRevenue} studentData={data.monthlyStudents} />

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
            {data.recentEnrollments.length === 0 ? (
               <div className="p-lg text-center text-on-surface-variant">Chưa có ghi danh nào</div>
            ) : data.recentEnrollments.map((enrollment, i) => (
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
            <h2 className="text-title-lg text-on-background">Giao dịch gần đây</h2>
            <button className="text-primary hover:text-primary-container text-label-sm transition-colors">
              Chi tiết
            </button>
          </div>
          <div className="flex flex-col">
            {recentTransactions.length === 0 ? (
               <div className="p-lg text-center text-on-surface-variant">Chưa có giao dịch nào</div>
            ) : recentTransactions.map((tx) => (
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
                  {formatVND(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
