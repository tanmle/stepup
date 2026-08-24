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

  // Fetch additional data
  const [
    { data: attendanceData },
    { data: evaluationsData },
    { data: salaryData },
    { data: documentsData },
    { data: sessionsData },
    { data: classesData }
  ] = await Promise.all([
    supabase.from('teacher_attendance').select('*').eq('teacher_id', id).order('date', { ascending: false }),
    supabase.from('teacher_evaluations').select('*').eq('teacher_id', id).order('created_at', { ascending: false }),
    supabase.from('teacher_salary_records').select('*').eq('teacher_id', id).order('month', { ascending: false }),
    supabase.from('teacher_documents').select('*').eq('teacher_id', id),
    supabase.from('class_sessions').select(`
      session_date,
      start_time,
      classes (code, capacity, color_key, enrollments(status))
    `).eq('teacher_id', id),
    supabase.from('classes').select(`
      *,
      enrollments(status)
    `).eq('teacher_id', id)
  ]);

  // Format and augment the data with UI-specific mocked stats 
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
    
    // New fields according to requirements
    dob: t.dob || '',
    cccd: t.cccd || '',
    address: t.address || '',
    gender: t.gender || '',
    startDate: t.start_date || '',
    major: t.major || '',
    englishLevel: t.english_level || '',
    certificate_details: t.certificate_details || [],
    fixedSchedule: t.fixed_schedule || [],
    maxHoursPerWeek: t.max_hours_per_week || 40,
    fixedDaysOff: t.fixed_days_off || [],
    canTeachOnline: t.can_teach_online || false,
    canTeachWeekend: t.can_teach_weekend || false,
    salaryType: t.salary_type || 'Theo giờ',
    salaryRate: t.salary_rate || 0,
    assistantSalaryRate: t.assistant_salary_rate || 0,
    allowances: t.allowances || {},

    // Related tables data
    attendance: attendanceData || [],
    evaluations: evaluationsData || [],
    salaryRecords: salaryData || [],
    documents: documentsData || [],
    
    // Mocked fields for UI completeness
    location: 'Cơ sở Quận 1',
    scheduleNote: '',
    studentGoalRate: 92,
    studentRating: 4.8,
    reEnrollmentRate: 85,
    classSessions: (sessionsData || []).map((s: any) => ({
      date: s.session_date,
      startTime: s.start_time,
      code: s.classes?.code || 'N/A',
      capacity: s.classes?.capacity || 0,
      colorKey: s.classes?.color_key || 'primary',
      enrolled: s.classes?.enrollments ? s.classes.enrollments.filter((e: any) => e.status === 'Đang học').length : 0,
    })),
    currentClasses: (classesData || []).map((c: any) => ({
      code: c.code,
      name: c.name,
      program: c.program,
      enrolled: c.enrollments ? c.enrollments.filter((e: any) => e.status === 'Đang học').length : 0,
      capacity: c.capacity,
      schedule: c.schedule,
      startDate: c.start_date ? new Date(c.start_date).toLocaleDateString('vi-VN') : '',
      status: c.status,
      colorKey: c.color_key
    })),
  };

  return <TeacherDetailClient teacher={formattedTeacher} />;
}
