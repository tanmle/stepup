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
      teachers(full_name)
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
      students(id, full_name, code, avatar_initials, avatar_color)
    `)
    .eq('class_id', id);

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

  return (
    <ClassDetailClient 
      cls={cls} 
      enrollments={enrollments || []} 
      sessions={sessions || []} 
      rooms={rooms || []}
    />
  );
}
