'use client';

import dynamic from 'next/dynamic';
import type { MonthlyRevenue } from '@/lib/types';

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false });
const StudentLineChart = dynamic(() => import('./StudentLineChart'), { ssr: false });

interface DataPoint { month: string; count: number; }

interface DashboardChartsProps {
  revenueData: MonthlyRevenue[];
  studentData: DataPoint[];
}

export default function DashboardCharts({ revenueData, studentData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
      {/* Revenue Chart */}
      <div className="card p-lg flex flex-col">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h2 className="text-title-lg text-on-background">Doanh thu {new Date().getFullYear()}</h2>
            <p className="text-label-sm text-on-surface-variant mt-xs">So sánh doanh thu và chi phí theo tháng</p>
          </div>
          <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>filter_list</span>
            Năm {new Date().getFullYear()}
          </button>
        </div>
        <RevenueChart data={revenueData} />
      </div>

      {/* Student Chart */}
      <div className="card p-lg flex flex-col">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h2 className="text-title-lg text-on-background">Học viên mới</h2>
            <p className="text-label-sm text-on-surface-variant mt-xs">Học viên đăng ký mới theo tháng</p>
          </div>
          <div className="flex items-center" style={{ gap: '6px', background: '#eeedf7', padding: '4px 10px', borderRadius: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00288e', display: 'inline-block' }} />
            <span className="text-label-sm text-on-surface-variant">Thực tế</span>
          </div>
        </div>
        <StudentLineChart data={studentData} />
      </div>
    </div>
  );
}
