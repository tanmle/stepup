'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function collectTuition(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const discount = parseFloat(formData.get('discount') as string) || 0;
  const refund = parseFloat(formData.get('refund') as string) || 0;
  const method = formData.get('method') as string;
  const note = formData.get('note') as string;
  
  if (!id || (amount === 0 && discount === 0 && refund === 0)) {
    throw new Error('Dữ liệu không hợp lệ: Cần có số tiền thu, chiết khấu hoặc hoàn học phí');
  }
  if (amount < 0 || discount < 0 || refund < 0) {
    throw new Error('Số tiền không được âm');
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
  const newDiscount = (Number(record.discount) || 0) + discount;
  const newRefund = (Number(record.refund) || 0) + refund;
  const newAmountOwed = Math.max(0, (Number(record.total_tuition) || 0) - newAmountPaid - newDiscount - newRefund);
  
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
      discount: newDiscount,
      refund: newRefund,
      status: newStatus,
      due_date: newDueDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error updating tuition:', updateError);
    throw new Error('Lỗi cập nhật học phí: ' + updateError.message);
  }

  // 4. Create transaction
  let descriptionParts = [`Thu học phí - ${record.students?.full_name} - Lớp ${record.classes?.name}`];
  if (discount > 0) descriptionParts.push(`CK: ${discount.toLocaleString('vi-VN')}đ`);
  if (refund > 0) descriptionParts.push(`Hoàn: ${refund.toLocaleString('vi-VN')}đ`);
  if (note) descriptionParts.push(`(${note})`);
  const description = descriptionParts.join(' - ');
  
  if (amount > 0 || discount > 0 || refund > 0) {
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
    } else if (diffDays <= 7) {
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

export async function generateMissingTuitions() {
  const supabase = await createClient();

  // 1. Get all enrollments with class and course details
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select(`
      student_id,
      class_id,
      classes (
        course_id,
        courses (
          tuition_fee,
          duration_months
        )
      )
    `)
    // only active enrollments
    .in('status', ['Đang học', 'Tạm nghỉ']); 

  if (enrollError) {
    console.error('Error fetching enrollments:', enrollError);
    throw new Error('Không thể lấy danh sách ghi danh');
  }

  // 2. Get all existing tuition records
  const { data: existingTuitions, error: tuitionError } = await supabase
    .from('tuition_records')
    .select('student_id, class_id, total_tuition, due_date')
    .order('due_date', { ascending: true });

  if (tuitionError) {
    console.error('Error fetching tuition records:', tuitionError);
    throw new Error('Không thể lấy danh sách học phí');
  }

  const insertData: any[] = [];
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + 15); // generate if due within 15 days

  for (const enr of enrollments || []) {
    const classesInfo = enr.classes as any;
    const fee = classesInfo?.courses?.tuition_fee || 0;
    const duration = classesInfo?.courses?.duration_months || 1;
    const maxTuition = fee * duration;

    if (fee === 0) continue; // skip free courses

    const records = existingTuitions.filter(t => t.student_id === enr.student_id && t.class_id === enr.class_id);
    
    if (records.length === 0) {
      // Completely missing, create for 1 month
      const dueDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      insertData.push({
        student_id: enr.student_id,
        class_id: enr.class_id,
        total_tuition: fee,
        amount_paid: 0,
        amount_owed: fee,
        status: 'Chưa đến hạn',
        due_date: dueDate,
        discount: 0,
        refund: 0
      });
    } else {
      // Check if they need a new record
      const totalBilled = records.reduce((sum, r) => sum + (r.total_tuition || 0), 0);
      
      if (totalBilled < maxTuition) {
        const latestRecord = records[records.length - 1];
        const monthsCovered = Math.round((latestRecord.total_tuition || 0) / fee) || 1;
        
        const latestDueDate = new Date(latestRecord.due_date || now);
        const nextDueDate = new Date(latestDueDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + monthsCovered);
        
        if (nextDueDate <= threshold) {
          const remainingTuition = maxTuition - totalBilled;
          const nextBillAmount = Math.min(fee, remainingTuition);
          
          insertData.push({
            student_id: enr.student_id,
            class_id: enr.class_id,
            total_tuition: nextBillAmount,
            amount_paid: 0,
            amount_owed: nextBillAmount,
            status: 'Chưa đến hạn',
            due_date: nextDueDate.toISOString().split('T')[0],
            discount: 0,
            refund: 0
          });
        }
      }
    }
  }

  if (insertData.length === 0) {
    return { success: true, count: 0 };
  }

  // 5. Insert
  const { error: insertError } = await supabase
    .from('tuition_records')
    .insert(insertData);

  if (insertError) {
    console.error('Error inserting missing tuitions:', insertError);
    throw new Error('Không thể tạo học phí: ' + insertError.message);
  }

  revalidatePath('/tuition');
  return { success: true, count: insertData.length };
}
