import { createClient } from '@/lib/supabase/server';
import NewStudentClient from './NewStudentClient';

export const metadata = {
  title: 'Thêm Học viên mới',
};

export default async function NewStudentPage() {
  const supabase = await createClient();

  // Fetch parents for the linking dropdown
  const { data: parents, error } = await supabase
    .from('parents')
    .select('id, full_name, phone')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching parents:', error);
  }

  // Fetch active or upcoming classes
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('id, name, code, program, capacity, price')
    .in('status', ['Đang học', 'Sắp mở'])
    .order('created_at', { ascending: false });

  if (classesError) {
    console.error('Error fetching classes:', classesError);
  }

  return <NewStudentClient parents={parents || []} classes={classes || []} />;
}
