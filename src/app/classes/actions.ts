'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addClass(formData: FormData) {
  const supabase = await createClient();

  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const program = formData.get('program') as string;
  const teacherId = formData.get('teacherId') as string;
  const capacity = parseInt(formData.get('capacity') as string || '15', 10);
  const schedule = formData.get('schedule') as string;
  const startDate = formData.get('startDate') as string;
  
  const colors = ['primary', 'secondary', 'tertiary', 'error'];
  const colorKey = colors[Math.floor(Math.random() * colors.length)];

  const { data: newClass, error } = await supabase.from('classes').insert([
    {
      code,
      name,
      program,
      teacher_id: teacherId || null,
      capacity,
      schedule,
      start_date: startDate,
      status: 'Sắp mở',
      color_key: colorKey,
    },
  ]).select().single();

  if (error) {
    console.error('Error adding class:', error);
    throw new Error('Failed to create class');
  }

  // Generate class_sessions for the next 4 weeks (12 sessions total as an example)
  // Real logic would parse the schedule string, but for now we create dummy sessions
  if (newClass && startDate) {
    const sessions = [];
    const baseDate = new Date(startDate);
    
    for (let i = 0; i < 12; i++) {
      const sessionDate = new Date(baseDate);
      sessionDate.setDate(baseDate.getDate() + (i * 2)); // Add 2 days for each session as dummy data
      
      sessions.push({
        class_id: newClass.id,
        teacher_id: teacherId || null,
        session_date: sessionDate.toISOString().split('T')[0],
        start_time: '18:00:00',
        end_time: '19:30:00',
        room: `Phòng ${Math.floor(Math.random() * 10) + 1}`,
        status: 'Chưa học'
      });
    }

    const { error: sessionError } = await supabase.from('class_sessions').insert(sessions);
    if (sessionError) {
      console.error('Error adding class sessions:', sessionError);
      // We don't throw here to not break the class creation, but in prod we would
    }
  }

  revalidatePath('/classes');
  revalidatePath('/schedule');
  return { success: true };
}

export async function deleteClass(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting class:', error);
    throw new Error('Failed to delete class');
  }

  revalidatePath('/classes');
  revalidatePath('/schedule');
}
