import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import StudentDetailClient from './StudentDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Chi tiết Học viên',
};

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: s, error } = await supabase
    .from('students')
    .select(`
      *,
      student_parents(
        relationship,
        parents(id, full_name, phone, email)
      ),
      enrollments(
        status, sessions_completed, sessions_total, attendance_rate,
        classes(id, name, code, schedule, teachers(full_name))
      )
    `)
    .eq('id', id)
    .single();

  if (error || !s) {
    console.error('Error fetching student detail:', error);
    notFound();
  }

  // Fetch tuition records
  const { data: tuitionRecords } = await supabase
    .from('tuition_records')
    .select('*')
    .eq('student_id', id)
    .order('created_at', { ascending: false });

  let currentDebt = 0;
  const tuitionHistory = tuitionRecords || [];
  tuitionHistory.forEach((t: any) => {
    currentDebt += (t.remaining_amount || 0);
  });

  // Fetch session attendance
  const { data: attendanceData } = await supabase
    .from('session_attendance')
    .select('status')
    .eq('student_id', id);

  let attendanceRate = 0;
  if (attendanceData && attendanceData.length > 0) {
    const present = attendanceData.filter((a: any) => a.status === 'Có mặt' || a.status === 'present').length;
    attendanceRate = Math.round((present / attendanceData.length) * 100);
  }

  // Format to match UI
  const formattedStudent = {
    id: s.id,
    code: s.code,
    fullName: s.full_name,
    gender: s.gender,
    dateOfBirth: s.date_of_birth,
    phone: s.phone,
    email: s.email,
    address: s.address,
    status: s.status,
    avatarColor: s.avatar_color,
    avatarInitials: s.avatar_initials,
    
    // Mock data for UI until we build enrollments, payments, and parents
    attendanceRate: attendanceRate,
    currentDebt: currentDebt,
    tuitionHistory: tuitionHistory,
    parents: s.student_parents ? s.student_parents.map((sp: any) => ({
      id: sp.parents.id,
      fullName: sp.parents.full_name,
      relationship: sp.relationship,
      phone: sp.parents.phone,
      email: sp.parents.email || '',
    })) : [],
    // Format enrollments
    enrolledCourses: s.enrollments ? s.enrollments.map((e: any) => ({
      classId: e.classes.id,
      className: e.classes.name,
      classCode: e.classes.code,
      schedule: e.classes.schedule,
      teacher: e.classes.teachers?.full_name || 'Chưa xếp',
      sessionsCompleted: e.sessions_completed,
      sessionsTotal: e.sessions_total,
      attendanceRate: e.attendance_rate,
      status: e.status,
      startDate: e.classes.start_date,
      endDate: e.classes.end_date,
    })) : [],
    payments: tuitionHistory.map((t: any) => ({
      id: t.id,
      method: t.payment_method || 'Chuyển khoản',
      date: t.created_at ? new Date(t.created_at).toLocaleDateString('vi-VN') : '',
      note: t.notes || '',
      amount: t.paid_amount || t.amount || 0,
      status: t.status
    })),
    notes: [],
  };

  // Fetch available classes for new enrollment
  const { data: classesData } = await supabase
    .from('classes')
    .select('id, name, code, courses(tuition_fee)')
    .in('status', ['Sắp mở', 'Đang học'])
    .order('created_at', { ascending: false });

  const availableClasses = classesData?.map((c: any) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    price: c.courses?.tuition_fee || null
  })) || [];

  return <StudentDetailClient student={formattedStudent} availableClasses={availableClasses || []} />;
}
