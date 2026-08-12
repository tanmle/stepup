'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTeacherAttendance(formData: FormData) {
  const supabase = await createClient();

  const data = {
    teacher_id: formData.get('teacherId'),
    date: formData.get('date'),
    check_in: formData.get('checkIn') || null,
    check_out: formData.get('checkOut') || null,
    hours_worked: formData.get('hoursWorked') ? parseFloat(formData.get('hoursWorked') as string) : 0,
    type: formData.get('type') || 'Dạy học',
    note: formData.get('notes'),
  };

  const { error } = await supabase.from('teacher_attendance').insert([data]);

  if (error) {
    console.error('Error adding teacher attendance:', error);
    throw new Error('Lỗi khi lưu chấm công');
  }

  revalidatePath('/payroll');
  revalidatePath(`/teachers/${data.teacher_id}`);
}

export async function deleteTeacherAttendance(id: string) {
  const supabase = await createClient();

  const { data: record } = await supabase.from('teacher_attendance').select('teacher_id').eq('id', id).single();

  const { error } = await supabase.from('teacher_attendance').delete().eq('id', id);

  if (error) {
    console.error('Error deleting teacher attendance:', error);
    throw new Error('Lỗi khi xóa chấm công');
  }

  revalidatePath('/payroll');
  if (record) {
    revalidatePath(`/teachers/${record.teacher_id}`);
  }
}

export async function generateSalaryRecord(
  teacherId: string, 
  month: number, 
  year: number, 
  bonus: number, 
  fine: number, 
  notes: string
) {
  const supabase = await createClient();

  // Fetch teacher details
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .select('salary_type, salary_rate')
    .eq('id', teacherId)
    .single();

  if (teacherError || !teacher) {
    throw new Error('Không tìm thấy thông tin giáo viên');
  }

  const isHourly = teacher.salary_type === 'hourly';
  const rate = teacher.salary_rate || 0;

  // Fetch attendance for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  const { data: attendance, error: attError } = await supabase
    .from('teacher_attendance')
    .select('*')
    .eq('teacher_id', teacherId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (attError) {
    throw new Error('Lỗi khi truy xuất dữ liệu chấm công');
  }

  let totalHours = 0;
  let sessionsCount = 0;

  if (attendance) {
    if (isHourly) {
      attendance.forEach(a => {
        if (a.type !== 'Nghỉ phép') {
          totalHours += Number(a.hours_worked || 0);
        }
      });
    } else {
      attendance.forEach(a => {
        if (a.type === 'Dạy học') {
          sessionsCount += 1;
        }
      });
    }
  }

  const quantity = isHourly ? totalHours : sessionsCount;
  const baseSalary = quantity * rate;
  const netSalary = baseSalary + bonus - fine; // simplified deductions

  const salaryData = {
    teacher_id: teacherId,
    month,
    year,
    total_hours: totalHours,
    sessions_count: sessionsCount,
    rate_per_unit: rate,
    base_salary: baseSalary,
    bonus: bonus,
    fine: fine,
    deductions: 0, // unused for now, combined into fine
    net_salary: netSalary,
    status: 'Chưa thanh toán',
    notes: notes
  };

  const { error } = await supabase
    .from('teacher_salary_records')
    .upsert([salaryData], { onConflict: 'teacher_id, month, year' });

  if (error) {
    console.error('Error saving salary record:', error);
    throw new Error('Không thể lưu phiếu lương. Lỗi: ' + error.message);
  }

  revalidatePath('/payroll');
  revalidatePath(`/teachers/${teacherId}`);
}
