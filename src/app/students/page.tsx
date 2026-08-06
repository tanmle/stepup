import { createClient } from '@/lib/supabase/server';
import StudentsClient from './StudentsClient';

export const metadata = {
  title: 'Quản lý Học viên',
};

export default async function StudentsPage() {
  const supabase = await createClient();

  // Fetch all students from Supabase (in a real app with 10k students, you'd paginate on the server.
  // For this demo, we fetch all and paginate on the client to preserve the existing UI behavior).
  const { data: students, error } = await supabase
    .from('students')
    .select(`
      *,
      student_parents(
        parents(full_name)
      ),
      enrollments(
        status,
        classes(name, code)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
  }

  // Format the data to match the UI types
  const formattedStudents = (students || []).map((s) => ({
    id: s.id,
    code: s.code,
    fullName: s.full_name,
    dateOfBirth: s.date_of_birth,
    gender: s.gender,
    phone: s.phone,
    email: s.email,
    address: s.address,
    status: s.status,
    avatarInitials: s.avatar_initials,
    avatarColor: s.avatar_color,
    attendanceRate: s.attendance_rate,
    currentDebt: s.current_debt,
    parents: s.student_parents?.length > 0 ? s.student_parents.map((sp: any) => ({
      fullName: sp.parents?.full_name || '—'
    })) : [],
    enrolledClasses: s.enrollments ? s.enrollments.filter((e: any) => e.status === 'Đang học').map((e: any) => e.classes?.name) : [],
  }));

  return <StudentsClient initialStudents={formattedStudents} />;
}
