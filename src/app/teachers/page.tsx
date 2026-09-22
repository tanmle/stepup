import { createClient } from '@/lib/supabase/server';
import TeachersClient from './TeachersClient';

export const metadata = {
  title: 'Quản lý Giáo viên',
};

export default async function TeachersPage() {
  const supabase = await createClient();

  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('*, classes!classes_teacher_id_fkey(id, name, code, status), assistant_classes:classes!classes_assistant_teacher_id_fkey(id, name, code, status)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teachers:', error);
  }

  // Format the data to match the UI types
  const formattedTeachers = (teachers || []).map((t) => {
    const mainClasses = t.classes || [];
    const astClasses = t.assistant_classes || [];
    const activeClasses = [...mainClasses, ...astClasses].filter((c: any) => c.status === 'Đang học' || c.status === 'Sắp mở');

    return {
      id: t.id,
      code: t.code,
      fullName: t.full_name,
      email: t.email,
      phone: t.phone,
      degree: t.degree,
      institution: t.institution,
      certificates: typeof t.certificates === 'string' ? t.certificates.split(',').map((s: string) => s.trim()) : (t.certificates || []),
      specializations: typeof t.specializations === 'string' ? t.specializations.split(',').map((s: string) => s.trim()) : (t.specializations || []),
      teachingStrengths: typeof t.teaching_strengths === 'string' ? t.teaching_strengths.split(',').map((s: string) => s.trim()) : (t.teaching_strengths || []),
      status: t.status,
      yearsOfExperience: t.years_of_experience,
      rating: t.rating,
      avatarInitials: t.avatar_initials,
      avatarColor: t.avatar_color,
      currentClasses: activeClasses,
    };
  });

  return <TeachersClient initialTeachers={formattedTeachers} />;
}
