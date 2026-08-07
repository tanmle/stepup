'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addRoom(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const capacity = parseInt(formData.get('capacity') as string) || 20;
  const status = formData.get('status') as string;
  const facilitiesRaw = formData.get('facilities') as string;
  
  let facilities = [];
  try {
    facilities = facilitiesRaw ? JSON.parse(facilitiesRaw) : [];
  } catch (e) {
    facilities = facilitiesRaw.split(',').map(s => s.trim()).filter(Boolean);
  }

  if (!name) throw new Error('Missing required fields');

  const { error } = await supabase.from('rooms').insert({
    name,
    capacity,
    status: status || 'Sẵn sàng',
    facilities
  });

  if (error) {
    console.error('Error adding room:', error);
    throw new Error('Failed to add room');
  }

  revalidatePath('/rooms');
  return { success: true };
}

export async function updateRoom(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const capacity = parseInt(formData.get('capacity') as string) || 20;
  const status = formData.get('status') as string;
  const facilitiesRaw = formData.get('facilities') as string;
  
  let facilities = [];
  try {
    facilities = facilitiesRaw ? JSON.parse(facilitiesRaw) : [];
  } catch (e) {
    facilities = facilitiesRaw.split(',').map(s => s.trim()).filter(Boolean);
  }

  if (!name) throw new Error('Missing required fields');

  const { error } = await supabase.from('rooms').update({
    name,
    capacity,
    status: status || 'Sẵn sàng',
    facilities
  }).eq('id', id);

  if (error) {
    console.error('Error updating room:', error);
    throw new Error('Failed to update room');
  }

  revalidatePath('/rooms');
  return { success: true };
}

export async function deleteRoom(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('rooms').delete().eq('id', id);

  if (error) {
    console.error('Error deleting room:', error);
    throw new Error('Failed to delete room');
  }

  revalidatePath('/rooms');
  return { success: true };
}
