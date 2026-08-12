import { createClient } from '@/lib/supabase/server';
import AttendanceClient from './AttendanceClient';

export default async function AttendancePage() {
  const supabase = await createClient();

  // Fetch teachers list for dropdown
  const { data: teachers, error: teachersError } = await supabase
    .from('teachers')
    .select('id, full_name, code, salary_type')
    .eq('status', 'Đang làm việc')
    .order('full_name', { ascending: true });

  if (teachersError) {
    console.error('Error fetching teachers for attendance:', teachersError);
  }

  // Fetch teacher attendance
  const { data: attendanceData, error: attError } = await supabase
    .from('teacher_attendance')
    .select('*')
    .order('date', { ascending: false });

  if (attError) {
    console.error('Error fetching teacher attendance:', attError);
  }

  // Fetch classes for dropdown
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('id, name, code, schedule')
    .eq('status', 'Đang học')
    .order('name', { ascending: true });

  if (classesError) {
    console.error('Error fetching classes:', classesError);
  }

  return (
    <AttendanceClient 
      teachers={teachers || []} 
      initialAttendance={attendanceData || []} 
      classes={classes || []} 
    />
  );
}
