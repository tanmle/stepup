'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function collectTuition(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const method = formData.get('method') as string;
  const note = formData.get('note') as string;
  
  if (!id || !amount || amount <= 0) {
    throw new Error('Dữ liệu không hợp lệ');
  }

  // 1. Fetch current record
  const { data: record, error: fetchError } = await supabase
    .from('tuition_records')
    .select('*, students(full_name), classes(name)')
    .eq('id', id)
    .single();

  if (fetchError || !record) {
    throw new Error('Không tìm thấy phiếu học phí');
  }

  // 2. Calculate new values
  const newAmountPaid = (Number(record.amount_paid) || 0) + amount;
  const newAmountOwed = Math.max(0, (Number(record.amount_owed) || 0) - amount);
  
  let newStatus = record.status;
  let newDueDate = record.due_date;

  if (newAmountOwed <= 0) {
    newStatus = 'Đã thu đủ';
  } else if (amount > 0) {
    // Trượt hạn chót (due_date) thêm 30 ngày kể từ ngày nộp tiền
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);
    newDueDate = nextDueDate.toISOString().split('T')[0];
    newStatus = 'Chưa đến hạn';
  }

  // 3. Update tuition_records
  const { error: updateError } = await supabase
    .from('tuition_records')
    .update({
      amount_paid: newAmountPaid,
      amount_owed: newAmountOwed,
      status: newStatus,
      due_date: newDueDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error updating tuition:', updateError);
    throw new Error('Lỗi cập nhật học phí');
  }

  // 4. Create transaction
  const description = `Thu học phí - ${record.students?.full_name} - Lớp ${record.classes?.name}${note ? ` (${note})` : ''}`;
  
  const { error: transError } = await supabase
    .from('transactions')
    .insert([
      {
        description,
        amount: amount,
        type: 'income',
        method: method,
      }
    ]);

  if (transError) {
    console.error('Error creating transaction:', transError);
    // Don't throw, since tuition was updated successfully
  }

  revalidatePath('/tuition');
  revalidatePath('/dashboard'); // update income chart
  
  return { success: true };
}

export async function syncTuitionStatuses() {
  const supabase = await createClient();

  // Fetch all unpaid tuition records
  const { data: records } = await supabase
    .from('tuition_records')
    .select('id, amount_owed, due_date, status')
    .neq('status', 'Đã thu đủ');

  if (!records || records.length === 0) return { success: true };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updates = records.map(record => {
    let newStatus = record.status;
    let dueDate = record.due_date ? new Date(record.due_date) : today;
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      newStatus = 'Quá hạn';
    } else if (diffDays <= 3) {
      newStatus = 'Sắp đến hạn';
    } else {
      newStatus = 'Chưa đến hạn';
    }

    // Only update if status changed, or if due_date was originally null (we force it to today)
    if (newStatus !== record.status || !record.due_date) {
      return {
        id: record.id,
        status: newStatus,
        due_date: record.due_date || today.toISOString().split('T')[0]
      };
    }
    return null;
  }).filter(Boolean);

  if (updates.length > 0) {
    // Perform updates one by one (or write a rpc if bulk is needed, but this is simple enough)
    for (const update of updates) {
      await supabase
        .from('tuition_records')
        .update({ status: update!.status, due_date: update!.due_date })
        .eq('id', update!.id);
    }
  }

  return { success: true, updatedCount: updates.length };
}
