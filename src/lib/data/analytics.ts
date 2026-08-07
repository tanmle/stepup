import { createClient } from '@/lib/supabase/server';

export async function getDashboardData() {
  const supabase = await createClient();

  // 1. Học viên (Total students)
  const { count: totalStudents } = await supabase.from('students').select('*', { count: 'exact', head: true });

  // 2. Đang học (Active students)
  const { count: activeStudents } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'Đang học');

  // 3. Giáo viên
  const { count: totalTeachers } = await supabase.from('teachers').select('*', { count: 'exact', head: true });

  // 4. Doanh thu & 6. Lợi nhuận
  const { data: transactionsData } = await supabase.from('transactions').select('amount, type');
  let revenue = 0;
  let expense = 0;
  if (transactionsData) {
    transactionsData.forEach(t => {
      if (t.type === 'income') revenue += t.amount || 0;
      if (t.type === 'expense') expense += t.amount || 0;
    });
  }
  const profit = revenue - expense;

  // 5. Công nợ
  const { data: tuition } = await supabase.from('tuition_records').select('amount_owed');
  let debt = 0;
  if (tuition) {
    tuition.forEach(t => {
      debt += t.amount_owed || 0;
    });
  }

  // Recent transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // 7. Recent Enrollments
  const { data: enrollmentsData } = await supabase
    .from('enrollments')
    .select('*, students(full_name, avatar_initials, avatar_color), classes(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const recentEnrollments = enrollmentsData ? enrollmentsData.map(e => ({
    studentName: e.students?.full_name || 'Học viên',
    course: e.classes?.name || 'Khóa học',
    avatarInitials: e.students?.avatar_initials || 'HV',
    avatarColor: e.students?.avatar_color || 'bg-primary-100 text-primary-700',
    status: e.status
  })) : [];

  const chartData = await getChartData();

  return { 
    totalStudents: totalStudents || 0,
    activeStudents: activeStudents || 0,
    totalTeachers: totalTeachers || 0,
    revenue,
    debt,
    profit,
    transactions: transactions || [],
    recentEnrollments,
    monthlyRevenue: chartData.monthlyRevenue,
    monthlyStudents: chartData.monthlyStudents
  };
}

export async function getReportsData() {
  const supabase = await createClient();
  const { data: transactions } = await supabase.from('transactions').select('amount, type');
  let totalRevenue = 0;
  let totalCost = 0;

  if (transactions) {
    transactions.forEach(t => {
      if (t.type === 'income') totalRevenue += t.amount || 0;
      if (t.type === 'expense') totalCost += t.amount || 0;
    });
  }

  const netProfit = totalRevenue - totalCost;

  const { data: tuition } = await supabase.from('tuition_records').select('amount_owed');
  let tuitionDebt = 0;
  if (tuition) {
    tuition.forEach(t => {
      tuitionDebt += t.amount_owed || 0;
    });
  }

  const chartData = await getChartData();

  return { 
    totalRevenue, 
    totalCost, 
    netProfit, 
    tuitionDebt,
    monthlyRevenue: chartData.monthlyRevenue,
    monthlyStudents: chartData.monthlyStudents
  };
}

export async function getTuitionData() {
  const supabase = await createClient();
  const { data: tuition } = await supabase.from('tuition_records').select('total_tuition, amount_paid, amount_owed, status');
  
  let expectedTotal = 0;
  let collected = 0;
  let overdueDebt = 0;
  let upcomingDebt = 0;

  if (tuition) {
    tuition.forEach(t => {
      expectedTotal += t.total_tuition || 0;
      collected += t.amount_paid || 0;
      if (t.status === 'Quá hạn') {
        overdueDebt += t.amount_owed || 0;
      }
      if (t.status === 'Sắp đến hạn') {
        upcomingDebt += t.amount_owed || 0;
      }
    });
  }

  return { expectedTotal, collected, overdueDebt, upcomingDebt };
}

export async function getChartData() {
  const supabase = await createClient();
  const currentYear = new Date().getFullYear();
  
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
    month: `T${i + 1}`,
    revenue: 0,
    expense: 0
  }));
  
  const monthlyStudents = Array.from({ length: 12 }, (_, i) => ({
    month: `T${i + 1}`,
    count: 0
  }));
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, created_at')
    .gte('created_at', `${currentYear}-01-01T00:00:00.000Z`)
    .lte('created_at', `${currentYear}-12-31T23:59:59.999Z`);
    
  if (transactions) {
    transactions.forEach(t => {
      if (!t.created_at) return;
      const date = new Date(t.created_at);
      const monthIndex = date.getMonth();
      if (t.type === 'income') {
        monthlyRevenue[monthIndex].revenue += t.amount || 0;
      } else if (t.type === 'expense') {
        monthlyRevenue[monthIndex].expense += t.amount || 0;
      }
    });
  }
  
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('created_at')
    .gte('created_at', `${currentYear}-01-01T00:00:00.000Z`)
    .lte('created_at', `${currentYear}-12-31T23:59:59.999Z`);
    
  if (enrollments) {
    enrollments.forEach(e => {
      if (!e.created_at) return;
      const date = new Date(e.created_at);
      const monthIndex = date.getMonth();
      monthlyStudents[monthIndex].count += 1;
    });
  }
  
  return { monthlyRevenue, monthlyStudents };
}
