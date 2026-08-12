import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CourseDetailClient from './CourseDetailClient';

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !course) {
    notFound();
  }

  return <CourseDetailClient initialCourse={course} />;
}
