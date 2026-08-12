import { createClient } from '@/lib/supabase/server';
import PayrollClient from './PayrollClient';

export const metadata = {
  title: 'Chấm công & Lương',
};

export default async function PayrollPage() {
  const supabase = await createClient();

  // Fetch teachers list for dropdowns
  const { data: teachers, error: teachersError } = await supabase
    .from('teachers')
    .select('id, full_name, code, salary_type, salary_rate')
    .eq('status', 'Đang làm việc')
    .order('full_name', { ascending: true });

  if (teachersError) {
    console.error('Error fetching teachers for payroll:', teachersError);
  }

  // Fetch teacher attendance
  const { data: attendanceData, error: attError } = await supabase
    .from('teacher_attendance')
    .select('*, teachers(full_name, code)')
    .order('date', { ascending: false });

  if (attError) {
    console.error('Error fetching teacher attendance:', attError);
  }

  // Fetch salary records
  const { data: salaryData, error: salaryError } = await supabase
    .from('teacher_salary_records')
    .select('*, teachers(full_name, code)')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (salaryError) {
    console.error('Error fetching salary records:', salaryError);
  }

  return (
    <PayrollClient 
      teachers={teachers || []} 
      initialAttendance={attendanceData || []} 
      initialSalaries={salaryData || []}
    />
  );
}
