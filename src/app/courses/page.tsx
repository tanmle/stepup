import { createClient } from '@/lib/supabase/server';
import CoursesClient from './CoursesClient';

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
  }

  return <CoursesClient initialCourses={courses || []} />;
}
