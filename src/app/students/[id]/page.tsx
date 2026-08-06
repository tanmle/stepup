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
    attendanceRate: 95,
    currentDebt: 0,
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
    })) : [],
    payments: [],
    notes: [],
  };

  // Fetch available classes for new enrollment
  const { data: availableClasses } = await supabase
    .from('classes')
    .select('id, name, code, price')
    .in('status', ['Sắp mở', 'Đang học'])
    .order('created_at', { ascending: false });

  return <StudentDetailClient student={formattedStudent} availableClasses={availableClasses || []} />;
}
