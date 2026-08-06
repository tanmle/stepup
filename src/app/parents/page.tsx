import { createClient } from '@/lib/supabase/server';
import ParentsClient from './ParentsClient';

export const metadata = {
  title: 'Quản lý Phụ huynh',
};

export default async function ParentsPage() {
  const supabase = await createClient();

  // Fetch parents and count their linked students
  // Using an inner join or a subquery to get students count would be ideal, 
  // but for simplicity in this CRM we will fetch parents and their linked student_parents.
  const { data: parents, error } = await supabase
    .from('parents')
    .select(`
      *,
      student_parents(student_id, relationship)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching parents:', error);
  }

  // Format data for the UI
  const formattedParents = (parents || []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    phone: p.phone,
    email: p.email,
    job: p.job,
    notes: p.notes,
    linkedStudentsCount: p.student_parents ? p.student_parents.length : 0,
  }));

  return <ParentsClient initialParents={formattedParents} />;
}
