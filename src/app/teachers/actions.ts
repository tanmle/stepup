'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTeacher(formData: FormData) {
  const supabase = await createClient();

  // Generate random teacher code
  const code = `GV-${new Date().getFullYear().toString().slice(2)}${Math.floor(100 + Math.random() * 900)}`;

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const degree = formData.get('degree') as string;
  const institution = formData.get('institution') as string;
  const yearsOfExperience = parseInt((formData.get('yearsOfExperience') as string) || '0', 10);

  // Generate initials
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  // Random color logic
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-pink-100 text-pink-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-indigo-100 text-indigo-700',
    'bg-purple-100 text-purple-700'
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Default values for arrays
  const certificates = ['IELTS 8.0+', 'TESOL'];
  const specializations = ['Luyện thi IELTS', 'Giao tiếp nâng cao'];

  const { error } = await supabase.from('teachers').insert([
    {
      code,
      full_name: fullName,
      email,
      phone,
      degree: degree || null,
      institution: institution || null,
      years_of_experience: yearsOfExperience,
      status: 'Nhận lớp',
      rating: 5.0, // Default rating for new teachers
      certificates,
      specializations,
      avatar_initials: initials,
      avatar_color: color,
    },
  ]);

  if (error) {
    console.error('Error adding teacher:', error);
    throw new Error('Failed to create teacher');
  }

  revalidatePath('/teachers');
  return { success: true };
}

export async function deleteTeacher(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('teachers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting teacher:', error);
    throw new Error('Failed to delete teacher');
  }

  revalidatePath('/teachers');
}

export async function updateTeacher(id: string, formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const degree = formData.get('degree') as string;
  const institution = formData.get('institution') as string;
  const yearsOfExperience = parseInt((formData.get('yearsOfExperience') as string) || '0', 10);
  
  const certificatesRaw = formData.get('certificates') as string;
  const specializationsRaw = formData.get('specializations') as string;

  const certificates = certificatesRaw ? certificatesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const specializations = specializationsRaw ? specializationsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const { error } = await supabase
    .from('teachers')
    .update({
      full_name: fullName,
      email,
      phone,
      degree: degree || null,
      institution: institution || null,
      years_of_experience: yearsOfExperience,
      certificates,
      specializations,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating teacher:', error);
    throw new Error('Failed to update teacher');
  }

  revalidatePath('/teachers');
  revalidatePath(`/teachers/${id}`);
  return { success: true };
}
