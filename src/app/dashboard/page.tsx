import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';
import { getDashboardData } from '@/lib/data/analytics';

export const metadata: Metadata = {
  title: 'Tổng quan Dashboard',
  description: 'Tổng quan hoạt động trung tâm Anh ngữ StepUp — doanh thu, học viên, công nợ.',
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  
  return <DashboardClient data={data} />;
}
