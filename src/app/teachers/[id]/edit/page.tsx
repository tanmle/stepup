import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditTeacherClient from './EditTeacherClient';

export const metadata = {
  title: 'Chỉnh sửa Giáo viên',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTeacherPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !teacher) {
    notFound();
  }

  // Format to camelCase for the UI
  const formattedTeacher = {
    id: teacher.id,
    code: teacher.code,
    fullName: teacher.full_name,
    email: teacher.email,
    phone: teacher.phone,
    degree: teacher.degree,
    institution: teacher.institution,
    yearsOfExperience: teacher.years_of_experience,
    dateOfBirth: teacher.date_of_birth,
    idCard: teacher.id_card,
    address: teacher.address,
    gender: teacher.gender,
    startDate: teacher.start_date,
    major: teacher.major,
    englishLevel: teacher.english_level,
    salaryType: teacher.salary_type,
    salaryRate: teacher.salary_rate,
    assistantSalaryRate: teacher.assistant_salary_rate,
    certificates: teacher.certificates || [],
    specializations: teacher.specializations || [],
    teachingStrengths: teacher.teaching_strengths || [],
    status: teacher.status,
    allowances: teacher.allowances || {},
  };

  return <EditTeacherClient teacher={formattedTeacher} />;
}
