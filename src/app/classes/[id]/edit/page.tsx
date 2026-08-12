import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditClassClient from './EditClassClient';

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the class to edit
  const { data: cls, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (classError || !cls) {
    notFound();
  }

  // Fetch teachers and courses for dropdowns
  const [
    { data: teachers },
    { data: courses }
  ] = await Promise.all([
    supabase.from('teachers').select('id, full_name, code').eq('status', 'Đang làm việc'),
    supabase.from('courses').select('id, name, program, level')
  ]);

  return (
    <EditClassClient
      classData={cls}
      teachers={teachers || []}
      courses={courses || []}
    />
  );
}
