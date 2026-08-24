'use server';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ClassDetailClient from './ClassDetailClient';

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch class details
  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select(`
      *,
      teacher:teachers!classes_teacher_id_fkey(full_name),
      assistant:teachers!classes_assistant_teacher_id_fkey(full_name),
      courses(tuition_fee, duration_months)
    `)
    .eq('id', id)
    .single();

  if (clsError || !cls) {
    notFound();
  }

  // Fetch enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      start_date,
      end_date,
      students(id, full_name, code, avatar_initials, avatar_color)
    `)
    .eq('class_id', id);

  // Fetch tuition records for this class to show in student list
  const { data: tuitions } = await supabase
    .from('tuition_records')
    .select('id, student_id, amount_owed, amount_paid, total_tuition, discount, refund, due_date, status')
    .eq('class_id', id);

  const enrollmentsWithTuition = (enrollments || []).map(enr => {
    // Find all tuition records for this student in this class
    const studentTuitions = tuitions?.filter(t => t.student_id === enr.student_id) || [];
    return {
      ...enr,
      tuitions: studentTuitions
    };
  });

  // Fetch class sessions
  const { data: sessions } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('class_id', id)
    .order('session_date', { ascending: true });

  // Fetch rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('status', 'Sẵn sàng')
    .order('name');

  // Fetch all students (for enrolling into class)
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, code')
    .eq('status', 'Đang học')
    .order('full_name');

  return (
    <ClassDetailClient 
      cls={cls} 
      enrollments={enrollmentsWithTuition || []} 
      sessions={sessions || []} 
      rooms={rooms || []}
      students={students || []}
    />
  );
}
