'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addStudent(formData: FormData) {
  const supabase = await createClient();

  // Generate sequential student code
  const { data: maxStudent } = await supabase
    .from('students')
    .select('code')
    .order('code', { ascending: false })
    .limit(1)
    .single();

  let nextCodeNum = 1;
  if (maxStudent && maxStudent.code) {
    const parsed = parseInt(maxStudent.code, 10);
    if (!isNaN(parsed)) {
      nextCodeNum = parsed + 1;
    }
  }
  const code = String(nextCodeNum).padStart(6, '0');

  // Extract student data
  const fullName = formData.get('fullName') as string;
  const englishName = formData.get('englishName') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const gender = formData.get('gender') as string;
  const address = formData.get('address') as string;

  // Generate initials for avatar
  const nameParts = fullName ? fullName.trim().split(/\s+/) : [];
  const initials = nameParts.length > 0 
    ? (nameParts.length === 1 ? nameParts[0][0] : nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : 'HV';

  // Random color logic for avatar
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-pink-100 text-pink-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-indigo-100 text-indigo-700',
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Insert Student
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert([
      {
        code,
        full_name: fullName,
        english_name: englishName || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || 'Khác',
        address: address || '',
        status: 'Đang học',
        avatar_initials: initials,
        avatar_color: color,
        attendance_rate: 100,
        current_debt: 0,
      },
    ])
    .select('id')
    .single();

  if (studentError) {
    console.error('Error adding student:', studentError);
    throw new Error('Failed to create student');
  }

  // Link or Create Parent
  const parentId = formData.get('parentId') as string;
  const parentName = formData.get('parentName') as string;
  const parentRelationship = formData.get('parentRelationship') as string || 'Phụ huynh';
  const parentPhone = formData.get('parentPhone') as string || '';

  if (student.id) {
    if (parentId) {
      // Link existing parent
      await supabase.from('student_parents').insert([{
        student_id: student.id,
        parent_id: parentId,
        relationship: parentRelationship,
      }]);
    } else if (parentName) {
      // Create new parent and link
      const { data: newParent, error: parentError } = await supabase.from('parents').insert([{
        full_name: parentName,
        phone: parentPhone,
      }]).select('id').single();

      if (!parentError && newParent) {
        await supabase.from('student_parents').insert([{
          student_id: student.id,
          parent_id: newParent.id,
          relationship: parentRelationship,
        }]);
      }
    }
  }

  // If a class was selected, create an enrollment
  const classId = formData.get('classId') as string;
  if (classId && student.id) {
    // Insert enrollment
    await supabase.from('enrollments').insert([
      {
        student_id: student.id,
        class_id: classId,
        sessions_completed: 0,
        sessions_total: 24, // default mock value
        attendance_rate: 100,
        status: 'Đang học',
      }
    ]);

    // Fetch class price to generate tuition record
    const { data: cls } = await supabase.from('classes').select('course_id').eq('id', classId).single();
    let tuition = 0;
    if (cls?.course_id) {
      const { data: course } = await supabase.from('courses').select('tuition_fee').eq('id', cls.course_id).single();
      if (course) tuition = course.tuition_fee || 0;
    }

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await supabase.from('tuition_records').insert([
      {
        student_id: student.id,
        class_id: classId,
        total_tuition: tuition,
        amount_paid: 0,
        amount_owed: tuition,
        status: 'Chưa đến hạn',
        due_date: dueDate,
      }
    ]);
  }

  revalidatePath('/students');
  return { success: true };
}

export async function deleteStudent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .update({ status: 'Đã nghỉ' })
    .eq('id', id);

  if (error) {
    console.error('Error deleting student:', error);
    throw new Error('Failed to delete student');
  }

  revalidatePath('/students');
}

export async function enrollStudent(studentId: string, classId: string) {
  const supabase = await createClient();

  // 1. Insert enrollment
  const { error: enrollError } = await supabase.from('enrollments').insert([
    {
      student_id: studentId,
      class_id: classId,
      sessions_completed: 0,
      sessions_total: 24, // default mock value
      attendance_rate: 100,
      status: 'Đang học',
    }
  ]);

  if (enrollError) {
    console.error('Error enrolling student:', enrollError);
    throw new Error('Failed to enroll student');
  }

  // 2. Fetch class price and create tuition record
  const { data: cls } = await supabase.from('classes').select('course_id').eq('id', classId).single();
  
  let tuition = 0;
  if (cls?.course_id) {
    const { data: course } = await supabase.from('courses').select('tuition_fee').eq('id', cls.course_id).single();
    if (course) tuition = course.tuition_fee || 0;
  }

  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await supabase.from('tuition_records').insert([
    {
      student_id: studentId,
      class_id: classId,
      total_tuition: tuition,
      amount_paid: 0,
      amount_owed: tuition,
      status: 'Chưa đến hạn',
      due_date: dueDate,
    }
  ]);

  revalidatePath(`/students/${studentId}`);
  return { success: true };
}

export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get('fullName') as string;
  const gender = formData.get('gender') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const address = formData.get('address') as string;
  const status = formData.get('status') as string;

  const { error } = await supabase
    .from('students')
    .update({
      full_name: fullName,
      gender,
      date_of_birth: dateOfBirth,
      phone,
      email,
      address,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating student:', error);
    throw new Error('Failed to update student');
  }

  revalidatePath('/students');
  revalidatePath(`/students/${id}`);
  return { success: true };
}
