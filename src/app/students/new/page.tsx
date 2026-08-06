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

  return <NewStudentClient parents={parents || []} />;
}
