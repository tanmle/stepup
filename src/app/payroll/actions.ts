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
  const isFixed = teacher.salary_type === 'fixed';
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
  let baseSalary = 0;
  let deductions = 0;

  if (isFixed) {
    // Fixed salary: count actual Sundays, working days = total - Sundays
    let sundayCount = 0;
    for (let d = 1; d <= lastDay; d++) {
      if (new Date(year, month - 1, d).getDay() === 0) sundayCount++;
    }
    const workingDays = lastDay - sundayCount;
    const dailyRate = rate / workingDays;

    // Count days off from attendance records (type = 'Nghỉ phép' or 'Vắng mặt')
    const daysOff = (attendance || []).filter(
      (a: any) => a.type === 'Nghỉ phép' || a.type === 'Vắng mặt'
    );
    const totalDaysOff = daysOff.length;

    // 1 paid day off per month (doesn't accumulate)
    const unpaidDaysOff = Math.max(0, totalDaysOff - 1);

    baseSalary = rate;
    deductions = Math.round(unpaidDaysOff * dailyRate);
    totalHours = workingDays - totalDaysOff; // actual worked days
    sessionsCount = workingDays;
  } else if (isHourly) {
    (attendance || []).forEach((a: any) => {
      if (a.type !== 'Nghỉ phép') {
        totalHours += Number(a.hours_worked || 0);
      }
    });
    baseSalary = totalHours * rate;
  } else {
    (attendance || []).forEach((a: any) => {
      if (a.type === 'Dạy học') {
        sessionsCount += 1;
      }
    });
    baseSalary = sessionsCount * rate;
  }

  const netSalary = baseSalary - deductions + bonus - fine;

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
    deductions: deductions,
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

// --- Fixed salary day off management ---

export async function markFixedSalaryDayOff(teacherId: string, date: string, type: 'Nghỉ phép' | 'Vắng mặt', note?: string) {
  const supabase = await createClient();

  // Check if record already exists for this date
  const { data: existing } = await supabase
    .from('teacher_attendance')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('date', date)
    .maybeSingle();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('teacher_attendance')
      .update({ type, note: note || null, hours_worked: 0 })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating day off:', error);
      throw new Error('Lỗi khi cập nhật ngày nghỉ');
    }
  } else {
    // Insert new record
    const { error } = await supabase
      .from('teacher_attendance')
      .insert([{
        teacher_id: teacherId,
        date,
        type,
        note: note || null,
        hours_worked: 0,
        check_in: null,
        check_out: null,
      }]);

    if (error) {
      console.error('Error marking day off:', error);
      throw new Error('Lỗi khi đánh dấu ngày nghỉ');
    }
  }

  revalidatePath('/payroll');
  revalidatePath(`/teachers/${teacherId}`);
}

export async function removeFixedSalaryDayOff(teacherId: string, date: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('teacher_attendance')
    .delete()
    .eq('teacher_id', teacherId)
    .eq('date', date);

  if (error) {
    console.error('Error removing day off:', error);
    throw new Error('Lỗi khi xóa ngày nghỉ');
  }

  revalidatePath('/payroll');
  revalidatePath(`/teachers/${teacherId}`);
}

export async function generateAttendanceFromSessions(teacherId: string, month: number, year: number) {
  const supabase = await createClient();

  // 1. Get date range for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  // 2. Fetch class_sessions for this teacher in this month
  const { data: sessions, error: sessionsError } = await supabase
    .from('class_sessions')
    .select('id, session_date, start_time, end_time, classes(code, name)')
    .eq('teacher_id', teacherId)
    .gte('session_date', startDate)
    .lte('session_date', endDate)
    .neq('status', 'Đã hủy')
    .order('session_date', { ascending: true });

  if (sessionsError) {
    return { success: false, error: 'Lỗi khi truy xuất lịch dạy: ' + sessionsError.message };
  }

  if (!sessions || sessions.length === 0) {
    return { success: true, count: 0, message: 'Không có buổi dạy nào trong tháng này.' };
  }

  // 3. Fetch existing attendance to avoid duplicates
  const { data: existingAtt } = await supabase
    .from('teacher_attendance')
    .select('date, check_in')
    .eq('teacher_id', teacherId)
    .gte('date', startDate)
    .lte('date', endDate);

  const existingKeys = new Set(
    (existingAtt || []).map(a => `${a.date}_${a.check_in?.substring(0, 5)}`)
  );

  // 4. Build records to insert
  const recordsToInsert: any[] = [];
  for (const session of sessions) {
    const key = `${session.session_date}_${session.start_time?.substring(0, 5)}`;
    if (existingKeys.has(key)) continue;

    // Calculate hours
    const [inH, inM] = (session.start_time || '00:00').split(':').map(Number);
    const [outH, outM] = (session.end_time || '00:00').split(':').map(Number);
    const hours = parseFloat(((outH + outM / 60) - (inH + inM / 60)).toFixed(2));

    const classInfo = session.classes as any;
    const className = classInfo ? `${classInfo.code} ${classInfo.name}` : '';

    recordsToInsert.push({
      teacher_id: teacherId,
      date: session.session_date,
      check_in: session.start_time,
      check_out: session.end_time,
      hours_worked: hours > 0 ? hours : 0,
      type: 'Dạy học',
      note: className,
    });
  }

  if (recordsToInsert.length === 0) {
    return { success: true, count: 0, message: 'Tất cả chấm công đã tồn tại, không cần sinh thêm.' };
  }

  // 5. Insert
  const { error } = await supabase.from('teacher_attendance').insert(recordsToInsert);
  if (error) {
    console.error('Error inserting attendance:', error);
    return { success: false, error: 'Lỗi khi tạo chấm công: ' + error.message };
  }

  revalidatePath('/payroll');
  revalidatePath(`/teachers/${teacherId}`);
  return { success: true, count: recordsToInsert.length, message: `Đã sinh ${recordsToInsert.length} lượt chấm công từ lịch dạy.` };
}

export async function updateTeacherAttendance(attendanceId: string, formData: FormData) {
  const supabase = await createClient();

  const checkIn = formData.get('checkIn') as string;
  const checkOut = formData.get('checkOut') as string;
  const type = formData.get('type') as string;
  const note = formData.get('notes') as string;

  // Calculate hours
  let hoursWorked = 0;
  if (checkIn && checkOut) {
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    hoursWorked = parseFloat(((outH + outM / 60) - (inH + inM / 60)).toFixed(2));
    if (hoursWorked < 0) hoursWorked = 0;
  }

  const updateData: any = {
    check_in: checkIn || null,
    check_out: checkOut || null,
    hours_worked: hoursWorked,
    type: type || 'Dạy học',
    note: note || null,
  };

  const { data: record } = await supabase
    .from('teacher_attendance')
    .select('teacher_id')
    .eq('id', attendanceId)
    .single();

  const { error } = await supabase
    .from('teacher_attendance')
    .update(updateData)
    .eq('id', attendanceId);

  if (error) {
    console.error('Error updating attendance:', error);
    return { success: false, error: 'Lỗi khi cập nhật chấm công: ' + error.message };
  }

  revalidatePath('/payroll');
  if (record) {
    revalidatePath(`/teachers/${record.teacher_id}`);
  }
  return { success: true };
}
