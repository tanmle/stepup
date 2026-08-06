import { createClient } from '@/lib/supabase/server';
import TeachersClient from './TeachersClient';

export const metadata = {
  title: 'Quản lý Giáo viên',
};

export default async function TeachersPage() {
  const supabase = await createClient();

  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teachers:', error);
  }

  // Format the data to match the UI types
  const formattedTeachers = (teachers || []).map((t) => ({
    id: t.id,
    code: t.code,
    fullName: t.full_name,
    email: t.email,
    phone: t.phone,
    degree: t.degree,
    institution: t.institution,
    certificates: t.certificates || [],
    specializations: t.specializations || [],
    teachingStrengths: t.teaching_strengths || [],
    status: t.status,
    yearsOfExperience: t.years_of_experience,
    rating: t.rating,
    avatarInitials: t.avatar_initials,
    avatarColor: t.avatar_color,
    currentClasses: [], // Not fetched in this query
  }));

  return <TeachersClient initialTeachers={formattedTeachers} />;
}
