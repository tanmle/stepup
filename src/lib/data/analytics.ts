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
  const { data: transactions } = await supabase.from('transactions').select('amount, type, created_at, description');
  
  let totalRevenue = 0;
  let totalCost = 0;
  
  let currentMonthRevenue = 0;
  let lastMonthRevenue = 0;
  let currentMonthCost = 0;
  let lastMonthCost = 0;

  let tuitionRevenue = 0;
  let otherRevenue = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  if (transactions) {
    transactions.forEach(t => {
      if (!t.created_at) return;
      const date = new Date(t.created_at);
      const isCurrentYear = date.getFullYear() === currentYear;
      const isCurrentMonth = date.getMonth() === currentMonth && isCurrentYear;
      const isLastMonth = date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      const amount = t.amount || 0;

      if (t.type === 'income') {
        if (isCurrentYear) totalRevenue += amount;
        if (isCurrentMonth) currentMonthRevenue += amount;
        if (isLastMonth) lastMonthRevenue += amount;
        
        if (isCurrentYear) {
          if (t.description?.toLowerCase().includes('thu học phí')) {
            tuitionRevenue += amount;
          } else {
            otherRevenue += amount;
          }
        }
      }
      if (t.type === 'expense') {
        if (isCurrentYear) totalCost += amount;
        if (isCurrentMonth) currentMonthCost += amount;
        if (isLastMonth) lastMonthCost += amount;
      }
    });
  }

  const netProfit = totalRevenue - totalCost;
  const currentMonthProfit = currentMonthRevenue - currentMonthCost;
  const lastMonthProfit = lastMonthRevenue - lastMonthCost;

  const { data: tuition } = await supabase.from('tuition_records').select('total_tuition, amount_paid, amount_owed');
  let tuitionDebt = 0;
  let totalTuitionExpected = 0;
  let totalTuitionCollected = 0;

  if (tuition) {
    tuition.forEach(t => {
      tuitionDebt += t.amount_owed || 0;
      totalTuitionExpected += t.total_tuition || 0;
      totalTuitionCollected += t.amount_paid || 0;
    });
  }

  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const diff = ((curr - prev) / prev) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  const chartData = await getChartData();

  return { 
    totalRevenue, 
    totalCost, 
    netProfit, 
    tuitionDebt,
    trends: {
      revenueTrend: calcTrend(currentMonthRevenue, lastMonthRevenue),
      revenueTrendUp: currentMonthRevenue >= lastMonthRevenue,
      costTrend: calcTrend(currentMonthCost, lastMonthCost),
      costTrendUp: currentMonthCost >= lastMonthCost,
      profitTrend: calcTrend(currentMonthProfit, lastMonthProfit),
      profitTrendUp: currentMonthProfit >= lastMonthProfit,
    },
    collectionData: {
      expected: totalTuitionExpected,
      collected: totalTuitionCollected,
      uncollected: tuitionDebt,
      percentage: totalTuitionExpected > 0 ? Math.round((totalTuitionCollected / totalTuitionExpected) * 100) : 0,
    },
    revenueCategories: [
      { name: 'Học phí', value: totalRevenue > 0 ? Math.round((tuitionRevenue / totalRevenue) * 100) : 0, amount: tuitionRevenue },
      { name: 'Khác', value: totalRevenue > 0 ? Math.round((otherRevenue / totalRevenue) * 100) : 0, amount: otherRevenue }
    ],
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
