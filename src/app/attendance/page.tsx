import { createClient } from '@/lib/supabase/server';
import AttendanceClient from './AttendanceClient';

export default async function AttendancePage() {
  const supabase = await createClient();



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
      classes={classes || []} 
    />
  );
}
