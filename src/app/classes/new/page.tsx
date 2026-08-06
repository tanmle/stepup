import { createClient } from '@/lib/supabase/server';
import NewClassClient from './NewClassClient';

export const metadata = {
  title: 'Mở lớp mới',
};

export default async function NewClassPage() {
  const supabase = await createClient();

  // Fetch teachers for the dropdown
  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('id, full_name, code')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching teachers for class creation:', error);
  }

  return <NewClassClient teachers={teachers || []} />;
}
