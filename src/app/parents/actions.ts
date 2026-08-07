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
  
  const addressProvince = formData.get('addressProvince') as string;
  const addressDistrict = formData.get('addressDistrict') as string;
  const addressWard = formData.get('addressWard') as string;
  const addressDetail = formData.get('addressDetail') as string;
  const prefChannel = formData.get('prefChannel') as string;
  const company = formData.get('company') as string;
  const position = formData.get('position') as string;
  const source = formData.get('source') as string;
  const sourceNote = formData.get('sourceNote') as string;
  const crmStatus = formData.get('crmStatus') as string;
  const interestLevel = formData.get('interestLevel') as string;

  const { error } = await supabase.from('parents').insert([
    {
      full_name: fullName,
      phone,
      email: email || null,
      job: job || null,
      notes: notes || null,
      address_province: addressProvince || null,
      address_district: addressDistrict || null,
      address_ward: addressWard || null,
      address_detail: addressDetail || null,
      pref_channel: prefChannel || null,
      company: company || null,
      position: position || null,
      source: source || null,
      source_notes: sourceNote || null,
      crm_status: crmStatus || 'Tiềm năng',
      interest_level: parseInt(interestLevel, 10) || null,
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

  const addressProvince = formData.get('addressProvince') as string;
  const addressDistrict = formData.get('addressDistrict') as string;
  const addressWard = formData.get('addressWard') as string;
  const addressDetail = formData.get('addressDetail') as string;
  const prefChannel = formData.get('prefChannel') as string;
  const company = formData.get('company') as string;
  const position = formData.get('position') as string;
  const source = formData.get('source') as string;
  const sourceNote = formData.get('sourceNote') as string;
  const crmStatus = formData.get('crmStatus') as string;
  const interestLevel = formData.get('interestLevel') as string;

  const { error } = await supabase
    .from('parents')
    .update({
      full_name: fullName,
      phone,
      email: email || null,
      job: job || null,
      notes: notes || null,
      address_province: addressProvince || null,
      address_district: addressDistrict || null,
      address_ward: addressWard || null,
      address_detail: addressDetail || null,
      pref_channel: prefChannel || null,
      company: company || null,
      position: position || null,
      source: source || null,
      source_notes: sourceNote || null,
      crm_status: crmStatus || 'Tiềm năng',
      interest_level: parseInt(interestLevel, 10) || null,
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

export async function updateParentCRM(id: string, formData: FormData) {
  const supabase = await createClient();

  const source = formData.get('source') as string;
  const sourceNotes = formData.get('sourceNotes') as string;
  const crmStatus = formData.get('crmStatus') as string;
  const interestLevel = parseInt(formData.get('interestLevel') as string, 10);

  const { error } = await supabase
    .from('parents')
    .update({
      source: source || null,
      source_notes: sourceNotes || null,
      crm_status: crmStatus || null,
      interest_level: isNaN(interestLevel) ? null : interestLevel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating parent CRM:', error);
    throw new Error('Failed to update parent CRM');
  }

  revalidatePath(`/parents/${id}`);
  return { success: true };
}

export async function addParentInteraction(formData: FormData) {
  const supabase = await createClient();
  const parentId = formData.get('parentId') as string;
  const interactionDate = formData.get('date') as string;
  const type = formData.get('type') as string;
  const notes = formData.get('notes') as string;

  const { error } = await supabase.from('parent_interactions').insert([
    {
      parent_id: parentId,
      interaction_date: interactionDate,
      type,
      notes,
    },
  ]);

  if (error) {
    console.error('Error adding interaction:', error);
    throw new Error('Failed to add interaction');
  }

  revalidatePath(`/parents/${parentId}`);
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
  revalidatePath('/parents');
}

export async function getAllStudentsForSelect() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, code')
    .order('full_name');
  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }
  return data;
}

export async function linkStudentToParent(formData: FormData) {
  const supabase = await createClient();
  const parentId = formData.get('parentId') as string;
  const studentId = formData.get('studentId') as string;
  const relationship = formData.get('relationship') as string;

  const { error } = await supabase.from('student_parents').insert([
    {
      parent_id: parentId,
      student_id: studentId,
      relationship: relationship || 'Phụ huynh',
    },
  ]);

  if (error) {
    console.error('Error linking student:', error);
    throw new Error('Failed to link student');
  }

  revalidatePath(`/parents/${parentId}`);
  return { success: true };
}

export async function unlinkStudentFromParent(parentId: string, studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('student_parents')
    .delete()
    .match({ parent_id: parentId, student_id: studentId });

  if (error) {
    console.error('Error unlinking student:', error);
    throw new Error('Failed to unlink student');
  }

  revalidatePath(`/parents/${parentId}`);
  return { success: true };
}
