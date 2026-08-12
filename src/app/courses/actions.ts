'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addCourse(formData: FormData) {
  const supabase = await createClient();

  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const program = formData.get('program') as string;
  const level = formData.get('level') as string;
  const tuition_fee = parseInt(formData.get('tuition_fee') as string || '0', 10);
  const duration_months = parseInt(formData.get('duration_months') as string || '1', 10);
  const sessions_count = parseInt(formData.get('sessions_count') as string || '0', 10);
  const status = formData.get('status') as string || 'Đang hoạt động';

  const { data: newCourse, error } = await supabase.from('courses').insert([
    {
      code,
      name,
      program,
      level,
      tuition_fee,
      duration_months,
      sessions_count,
      status,
    },
  ]).select().single();

  if (error) {
    console.error('Error adding course:', error);
    throw new Error('Failed to create course');
  }

  revalidatePath('/courses');
  return { success: true, data: newCourse };
}

export async function updateCourse(id: string, formData: FormData) {
  const supabase = await createClient();

  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const program = formData.get('program') as string;
  const level = formData.get('level') as string;
  const tuition_fee = parseInt(formData.get('tuition_fee') as string || '0', 10);
  const duration_months = parseInt(formData.get('duration_months') as string || '1', 10);
  const sessions_count = parseInt(formData.get('sessions_count') as string || '0', 10);
  const status = formData.get('status') as string;

  const { data: updatedCourse, error } = await supabase
    .from('courses')
    .update({
      code,
      name,
      program,
      level,
      tuition_fee,
      duration_months,
      sessions_count,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating course:', error);
    throw new Error('Failed to update course');
  }

  revalidatePath('/courses');
  revalidatePath(`/courses/${id}`);
  return { success: true, data: updatedCourse };
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting course:', error);
    throw new Error('Failed to delete course');
  }

  revalidatePath('/courses');
  return { success: true };
}
