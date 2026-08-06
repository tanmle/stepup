import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditParentClient from './EditParentClient';

export const metadata = {
  title: 'Chi tiết Phụ huynh',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ParentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: p, error } = await supabase
    .from('parents')
    .select(`
      *,
      student_parents(
        relationship,
        students(id, code, full_name, status, avatar_color, avatar_initials)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !p) {
    notFound();
  }

  // Format to camelCase for UI
  const formattedParent = {
    id: p.id,
    fullName: p.full_name,
    phone: p.phone,
    email: p.email || '',
    job: p.job || '',
    notes: p.notes || '',
    students: p.student_parents ? p.student_parents.map((sp: any) => ({
      relationship: sp.relationship,
      id: sp.students.id,
      code: sp.students.code,
      fullName: sp.students.full_name,
      status: sp.students.status,
      avatarColor: sp.students.avatar_color,
      avatarInitials: sp.students.avatar_initials,
    })) : []
  };

  return <EditParentClient parent={formattedParent} />;
}
