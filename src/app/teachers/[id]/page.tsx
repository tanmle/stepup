import { createClient } from '@/lib/supabase/server';
import TeacherDetailClient from './TeacherDetailClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Chi tiết Giáo viên',
};

export default async function TeacherDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: t, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !t) {
    console.error('Error fetching teacher detail:', error);
    notFound();
  }

  // Format and augment the data with UI-specific mocked stats 
  // (Since classes, reviews, and schedules are not implemented in the DB yet)
  const formattedTeacher = {
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
    rating: t.rating || 5.0,
    avatarInitials: t.avatar_initials,
    avatarColor: t.avatar_color,
    
    // Mocked fields for UI completeness
    location: 'Cơ sở Quận 1',
    scheduleNote: '',
    studentGoalRate: 92,
    studentRating: 4.8,
    reEnrollmentRate: 85,
    currentClasses: [
      // Mock class data for the tabs
      {
        code: 'IEL-102',
        name: 'IELTS Intensive',
        program: 'IELTS',
        enrolled: 15,
        capacity: 15,
        schedule: 'T2, T4 (18:00)',
        startDate: '10/01/2024',
        status: 'Đang diễn ra',
        colorKey: 'primary'
      },
      {
        code: 'COM-05',
        name: 'Giao tiếp Nâng cao',
        program: 'Giao tiếp',
        enrolled: 8,
        capacity: 12,
        schedule: 'T7, CN (08:00)',
        startDate: '15/01/2024',
        status: 'Sắp khai giảng',
        colorKey: 'tertiary'
      }
    ],
  };

  return <TeacherDetailClient teacher={formattedTeacher} />;
}
