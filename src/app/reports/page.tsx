import type { Metadata } from 'next';
import ReportsClient from './ReportsClient';
import { getReportsData } from '@/lib/data/analytics';

export const metadata: Metadata = {
  title: 'Báo cáo tài chính',
  description: 'Báo cáo tài chính trung tâm Anh ngữ StepUp — doanh thu, chi phí, lợi nhuận.',
};

export default async function ReportsPage() {
  const data = await getReportsData();
  
  return <ReportsClient data={data} />;
}
