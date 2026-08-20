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
      student_parents(
        relationship,
        students(id, full_name, code, avatar_color, avatar_initials)
      )
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
    crmStatus: p.crm_status,
    source: p.source,
    company: p.company,
    position: p.position,
    linkedStudentsCount: p.student_parents ? p.student_parents.length : 0,
    linkedStudents: p.student_parents ? p.student_parents.map((sp: any) => sp.students) : [],
  }));

  return <ParentsClient initialParents={formattedParents} />;
}
