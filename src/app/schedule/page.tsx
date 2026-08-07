import { createClient } from '@/lib/supabase/server';
import ScheduleClient from './ScheduleClient';

export const metadata = {
  title: 'Lịch dạy & Học',
};

export default async function SchedulePage() {
  const supabase = await createClient();

  // Fetch class sessions for +/- 3 months from today
  const today = new Date();
  const pastDate = new Date();
  pastDate.setMonth(today.getMonth() - 3);
  const futureDate = new Date();
  futureDate.setMonth(today.getMonth() + 3);

  const [
    { data: sessions, error: sessionsError },
    { data: teachers, error: teachersError }
  ] = await Promise.all([
    supabase
      .from('class_sessions')
      .select(`
        id,
        session_date,
        start_time,
        end_time,
        room,
        status,
        class_id,
        teacher_id,
        classes (code, name, color_key),
        teachers (full_name)
      `)
      .gte('session_date', pastDate.toISOString().split('T')[0])
      .lte('session_date', futureDate.toISOString().split('T')[0])
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true }),
    supabase.from('teachers').select('id, full_name').order('full_name')
  ]);

  if (sessionsError) console.error('Error fetching class sessions:', sessionsError);

  // Format the data for the UI
  const formattedSessions = (sessions || []).map((s) => ({
    id: s.id,
    date: s.session_date,
    startTime: s.start_time.substring(0, 5), // '18:00:00' -> '18:00'
    endTime: s.end_time.substring(0, 5),
    room: s.room,
    status: s.status,
    classId: s.class_id,
    teacherId: s.teacher_id,
    classCode: (s.classes as any)?.code || 'N/A',
    className: (s.classes as any)?.name || 'N/A',
    colorKey: (s.classes as any)?.color_key || 'primary',
    teacherName: (s.teachers as any)?.full_name || 'Chưa phân công',
  }));

  return <ScheduleClient sessions={formattedSessions} teachers={teachers || []} />;
}
