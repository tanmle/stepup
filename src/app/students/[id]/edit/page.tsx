import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditStudentClient from './EditStudentClient';

export const metadata = {
  title: 'Chỉnh sửa Học viên',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: s, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !s) {
    notFound();
  }

  const formattedStudent = {
    id: s.id,
    code: s.code,
    fullName: s.full_name,
    gender: s.gender,
    dateOfBirth: s.date_of_birth,
    phone: s.phone || '',
    email: s.email || '',
    address: s.address || '',
    status: s.status || 'Đang học',
  };

  return <EditStudentClient student={formattedStudent} />;
}
