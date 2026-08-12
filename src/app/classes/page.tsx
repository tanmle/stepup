import { createClient } from '@/lib/supabase/server';
import ClassesClient from './ClassesClient';

export const metadata = {
  title: 'Quản lý Lớp học',
};

export default async function ClassesPage() {
  const supabase = await createClient();

  // Fetch classes and also fetch the associated teacher for each class
  const { data: classesData, error } = await supabase
    .from('classes')
    .select(`
      *,
      teacher:teachers(full_name),
      enrollments(status)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching classes:', error);
  }

  // Format data for the UI
  const formattedClasses = (classesData || []).map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    program: c.program,
    teacherName: c.teacher ? (c.teacher as any).full_name : 'Chưa phân công',
    capacity: c.capacity,
    enrolled: c.enrollments ? (c.enrollments as any[]).filter((e: any) => e.status === 'Đang học').length : 0,
    schedule: c.schedule,
    startDate: c.start_date,
    endDate: c.end_date,
    status: c.status,
    colorKey: c.color_key,
  }));

  return <ClassesClient initialClasses={formattedClasses} />;
}
