'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addClass(formData: FormData) {
  const supabase = await createClient();

  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const program = formData.get('program') as string;
  const level = formData.get('level') as string;
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
      level,
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

export async function addClassSession(classId: string, formData: FormData) {
  const supabase = await createClient();
  
  const sessionDateStr = formData.get('sessionDate') as string;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const room = formData.get('room') as string;

  if (!sessionDateStr || !startTime || !endTime || !room) {
    throw new Error('Missing required fields');
  }

  // Fetch the default teacher for this class
  const { data: classData } = await supabase.from('classes').select('teacher_id').eq('id', classId).single();
  const teacherId = classData?.teacher_id || null;

  const { error } = await supabase.from('class_sessions').insert({
    class_id: classId,
    teacher_id: teacherId,
    session_date: sessionDateStr,
    start_time: startTime + ':00',
    end_time: endTime + ':00',
    room: room,
    status: 'Chưa học'
  });

  if (error) {
    console.error('Error adding class session:', error);
    throw new Error('Failed to add class session');
  }

  revalidatePath(`/classes/${classId}`);
  revalidatePath('/schedule');
  return { success: true };
}

export async function updateClassSession(sessionId: string, classId: string, formData: FormData) {
  const supabase = await createClient();
  
  const sessionDateStr = formData.get('sessionDate') as string;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const room = formData.get('room') as string;
  const status = formData.get('status') as string;
  const teacherId = formData.get('teacherId') as string;

  if (!sessionDateStr || !startTime || !endTime || !room) {
    throw new Error('Missing required fields');
  }

  const { error } = await supabase.from('class_sessions').update({
    session_date: sessionDateStr,
    start_time: startTime.includes(':') && startTime.length === 5 ? startTime + ':00' : startTime,
    end_time: endTime.includes(':') && endTime.length === 5 ? endTime + ':00' : endTime,
    room: room,
    teacher_id: teacherId || null,
    status: status || 'Chưa học'
  }).eq('id', sessionId);

  if (error) {
    console.error('Error updating class session:', error);
    throw new Error('Failed to update class session');
  }

  revalidatePath(`/classes/${classId}`);
  revalidatePath('/schedule');
  return { success: true };
}

export async function deleteClassSession(sessionId: string, classId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('class_sessions').delete().eq('id', sessionId);

  if (error) {
    console.error('Error deleting class session:', error);
    throw new Error('Failed to delete class session');
  }

  revalidatePath(`/classes/${classId}`);
  revalidatePath('/schedule');
  return { success: true };
}
