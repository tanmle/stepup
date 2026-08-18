import { createClient } from '@/lib/supabase/server';
import NewClassClient from './NewClassClient';

export const metadata = {
  title: 'Mở lớp mới',
};

export default async function NewClassPage() {
  const supabase = await createClient();

  const [
    { data: teachers },
    { data: courses },
    { data: rooms }
  ] = await Promise.all([
    supabase.from('teachers').select('id, full_name, code').order('full_name', { ascending: true }),
    supabase.from('courses').select('id, name, program, level').eq('status', 'Đang hoạt động').order('name', { ascending: true }),
    supabase.from('rooms').select('id, name, capacity, status').eq('status', 'Sẵn sàng').order('name', { ascending: true })
  ]);

  return <NewClassClient teachers={teachers || []} courses={courses || []} rooms={rooms || []} />;
}
