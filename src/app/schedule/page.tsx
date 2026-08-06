import { createClient } from '@/lib/supabase/server';
import ScheduleClient from './ScheduleClient';

export const metadata = {
  title: 'Lịch dạy & Học',
};

export default async function SchedulePage() {
  const supabase = await createClient();

  // Fetch all class sessions from today onwards, up to next 30 days
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  const { data: sessions, error } = await supabase
    .from('class_sessions')
    .select(`
      id,
      session_date,
      start_time,
      end_time,
      room,
      status,
      classes (code, name, color_key),
      teachers (full_name)
    `)
    .gte('session_date', today)
    .lte('session_date', nextMonthStr)
    .order('session_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching class sessions:', error);
  }

  // Format the data for the UI
  const formattedSessions = (sessions || []).map((s) => ({
    id: s.id,
    date: s.session_date,
    startTime: s.start_time.substring(0, 5), // '18:00:00' -> '18:00'
    endTime: s.end_time.substring(0, 5),
    room: s.room,
    status: s.status,
    classCode: (s.classes as any)?.code || 'N/A',
    className: (s.classes as any)?.name || 'N/A',
    colorKey: (s.classes as any)?.color_key || 'primary',
    teacherName: (s.teachers as any)?.full_name || 'Chưa phân công',
  }));

  return <ScheduleClient sessions={formattedSessions} />;
}
