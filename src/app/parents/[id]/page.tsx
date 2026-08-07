import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditParentClient from './EditParentClient';
import { getAllStudentsForSelect } from '../actions';

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

  const { data: interactionsData } = await supabase
    .from('parent_interactions')
    .select('*')
    .eq('parent_id', id)
    .order('interaction_date', { ascending: false });

  const interactions = interactionsData || [];

  const allStudents = await getAllStudentsForSelect();

  // Find all student ids
  const studentIds = p.student_parents?.map((sp: any) => sp.students.id) || [];
  
  // query tuition_records for all students
  let tuitionRecords: any[] = [];
  if (studentIds.length > 0) {
    const { data: trData } = await supabase
      .from('tuition_records')
      .select('*, students(full_name)')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });
    if (trData) tuitionRecords = trData;
  }

  let totalDebt = 0;
  let totalPaid = 0;
  tuitionRecords.forEach((t: any) => {
    totalDebt += (t.remaining_amount || 0);
    totalPaid += (t.paid_amount || 0);
  });

  // Format to camelCase for UI
  const formattedParent = {
    id: p.id,
    fullName: p.full_name,
    phone: p.phone,
    email: p.email || '',
    prefChannel: p.pref_channel || '',
    job: p.job || '',
    company: p.company || '',
    jobTitle: p.job_title || '',
    province: p.province || '',
    district: p.district || '',
    ward: p.ward || '',
    address: p.address || '',
    notes: p.notes || '',
    source: p.source || '',
    sourceNotes: p.source_notes || '',
    crmStatus: p.crm_status || 'Tiềm năng',
    interestLevel: p.interest_level || 3,
    totalDebt: totalDebt,
    totalPaid: totalPaid,
    tuitionHistory: tuitionRecords.map((t: any) => ({
      id: t.id,
      date: t.created_at ? new Date(t.created_at).toLocaleDateString('vi-VN') : '',
      amount: t.paid_amount || t.amount || 0,
      studentName: t.students?.full_name || 'N/A',
      status: t.status,
    })),
    students: p.student_parents ? p.student_parents.map((sp: any) => ({
      relationship: sp.relationship,
      id: sp.students.id,
      code: sp.students.code,
      fullName: sp.students.full_name,
      status: sp.students.status,
      avatarColor: sp.students.avatar_color,
      avatarInitials: sp.students.avatar_initials,
    })) : [],
    interactions: interactions.map((i: any) => ({
      id: i.id,
      date: i.interaction_date,
      type: i.type,
      notes: i.notes,
      createdAt: i.created_at,
    }))
  };

  return <EditParentClient parent={formattedParent} allStudents={allStudents} />;
}
