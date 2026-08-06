'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addParent(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const job = formData.get('job') as string;
  const notes = formData.get('notes') as string;

  const { error } = await supabase.from('parents').insert([
    {
      full_name: fullName,
      phone,
      email: email || null,
      job: job || null,
      notes: notes || null,
    },
  ]);

  if (error) {
    console.error('Error adding parent:', error);
    throw new Error('Failed to create parent');
  }

  revalidatePath('/parents');
  return { success: true };
}

export async function updateParent(id: string, formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const job = formData.get('job') as string;
  const notes = formData.get('notes') as string;

  const { error } = await supabase
    .from('parents')
    .update({
      full_name: fullName,
      phone,
      email: email || null,
      job: job || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating parent:', error);
    throw new Error('Failed to update parent');
  }

  revalidatePath('/parents');
  revalidatePath(`/parents/${id}`);
  return { success: true };
}

export async function deleteParent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('parents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting parent:', error);
    throw new Error('Failed to delete parent');
  }

  revalidatePath('/parents');
}
