'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const center_name = formData.get('center_name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const address = formData.get('address') as string;
  const bank_name = formData.get('bank_name') as string;
  const bank_account = formData.get('bank_account') as string;
  const bank_owner = formData.get('bank_owner') as string;
  const receipt_note = formData.get('receipt_note') as string;

  if (!center_name) {
    throw new Error('Tên trung tâm không được để trống');
  }

  const updates = {
    center_name,
    phone,
    email,
    address,
    bank_name,
    bank_account,
    bank_owner,
    receipt_note,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase
      .from('center_settings')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating settings:', error);
      throw new Error('Lỗi khi cập nhật cài đặt');
    }
  } else {
    const { error } = await supabase
      .from('center_settings')
      .insert([updates]);

    if (error) {
      console.error('Error inserting settings:', error);
      throw new Error('Lỗi khi thêm mới cài đặt');
    }
  }

  revalidatePath('/settings');
  revalidatePath('/tuition');
  return { success: true };
}
