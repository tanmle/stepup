import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CourseDetailClient from './CourseDetailClient';

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !course) {
    notFound();
  }

  return <CourseDetailClient initialCourse={course} />;
}
