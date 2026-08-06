import type { KpiData, RecentEnrollment, Transaction, MonthlyRevenue } from '@/lib/types';

export const DASHBOARD_KPIS: KpiData[] = [
  { label: 'Học viên', value: '1,248', trend: '+12%', trendUp: true, icon: 'groups' },
  { label: 'Đang học', value: '986', trend: '+5%', trendUp: true, icon: 'how_to_reg' },
  { label: 'Giáo viên', value: '42', trend: 'Cố định', trendUp: undefined, icon: 'co_present' },
  { label: 'Doanh thu', value: '450tr', trend: '+18%', trendUp: true, icon: 'account_balance_wallet' },
  { label: 'Công nợ', value: '85tr', trend: '-2%', trendUp: false, icon: 'money_off', colorVariant: 'error' },
  { label: 'Lợi nhuận', value: '320tr', trend: '+25%', trendUp: true, icon: 'savings' },
];

export const RECENT_ENROLLMENTS: RecentEnrollment[] = [
  { studentName: 'Nguyễn Văn An', course: 'IELTS Intensive', avatarInitials: 'NA', avatarColor: 'bg-blue-100 text-blue-700', status: 'HOÀN TẤT' },
  { studentName: 'Trần Thị Bích', course: 'TOEIC 650+', avatarInitials: 'TB', avatarColor: 'bg-pink-100 text-pink-700', status: 'ĐANG XỬ LÝ' },
  { studentName: 'Lê Hoàng Nam', course: 'Giao tiếp Cơ bản', avatarInitials: 'LN', avatarColor: 'bg-green-100 text-green-700', status: 'HOÀN TẤT' },
  { studentName: 'Phạm Minh Đức', course: 'IELTS 5.5', avatarInitials: 'PD', avatarColor: 'bg-purple-100 text-purple-700', status: 'CHỜ DUYỆT' },
  { studentName: 'Lê Thu Hà', course: 'IELTS 7.0', avatarInitials: 'LH', avatarColor: 'bg-amber-100 text-amber-700', status: 'HOÀN TẤT' },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', description: 'Thu học phí - Nguyễn Văn An', time: '10:45 AM', method: 'CK Vietcombank', amount: 4500000, type: 'income' },
  { id: 'tx2', description: 'Chi trả lương GV - T7', time: '09:12 AM', method: 'Chi nhánh Q1', amount: 12000000, type: 'expense' },
  { id: 'tx3', description: 'Thu cọc - Lê Hoàng Nam', time: '08:30 AM', method: 'Tiền mặt', amount: 1000000, type: 'income' },
  { id: 'tx4', description: 'Thu học phí - Vũ Ngọc Linh', time: '08:00 AM', method: 'CK MB Bank', amount: 7500000, type: 'income' },
  { id: 'tx5', description: 'Chi phí văn phòng T7', time: 'Hôm qua', method: 'Tiền mặt', amount: 2500000, type: 'expense' },
];

export const MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'T1', revenue: 280, cost: 120 },
  { month: 'T2', revenue: 320, cost: 135 },
  { month: 'T3', revenue: 290, cost: 118 },
  { month: 'T4', revenue: 380, cost: 150 },
  { month: 'T5', revenue: 410, cost: 160 },
  { month: 'T6', revenue: 450, cost: 170 },
  { month: 'T7', revenue: 390, cost: 155 },
  { month: 'T8', revenue: 470, cost: 178 },
  { month: 'T9', revenue: 430, cost: 162 },
  { month: 'T10', revenue: 490, cost: 180 },
  { month: 'T11', revenue: 420, cost: 158 },
  { month: 'T12', revenue: 510, cost: 185 },
];

export const NEW_STUDENTS_DATA = [
  { month: 'T1', count: 28 },
  { month: 'T2', count: 35 },
  { month: 'T3', count: 22 },
  { month: 'T4', count: 42 },
  { month: 'T5', count: 55 },
  { month: 'T6', count: 48 },
  { month: 'T7', count: 62 },
  { month: 'T8', count: 58 },
  { month: 'T9', count: 70 },
  { month: 'T10', count: 65 },
  { month: 'T11', count: 75 },
  { month: 'T12', count: 80 },
];

export const REPORT_KPIS = {
  totalRevenue: 1250000000,
  totalRevenueTrend: '+12.5%',
  totalRevenueTrendUp: true,
  totalCost: 450000000,
  totalCostTrend: '+4.2%',
  totalCostTrendUp: false,
  netProfit: 800000000,
  netProfitTrend: '+18.3%',
  netProfitTrendUp: true,
  tuitionDebt: 125000000,
  tuitionDebtTrend: '-2.1%',
  tuitionDebtTrendUp: true,
};

export const REVENUE_CATEGORIES = [
  { name: 'Học phí khóa dài hạn', value: 65, amount: 812500000 },
  { name: 'Học phí khóa ngắn hạn', value: 20, amount: 250000000 },
  { name: 'Phí thi thử & lệ phí', value: 8, amount: 100000000 },
  { name: 'Bán tài liệu & sách', value: 5, amount: 62500000 },
  { name: 'Khác', value: 2, amount: 25000000 },
];
