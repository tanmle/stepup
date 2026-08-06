'use client';

import dynamic from 'next/dynamic';
import type { MonthlyRevenue } from '@/lib/types';

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false });

export default function ReportsRevenueChart({ data }: { data: MonthlyRevenue[] }) {
  return <RevenueChart data={data} />;
}
