'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTeacherAttendance(formData: FormData) {
  const supabase = await createClient();

  const data = {
    teacher_id: formData.get('teacher_id'),
    date: formData.get('date'),
    check_in: formData.get('check_in'),
    check_out: formData.get('check_out'),
    hours_worked: formData.get('hours_worked'),
    type: formData.get('type') || 'Dạy học',
    notes: formData.get('notes'),
  };

  const { error } = await supabase.from('teacher_attendance').insert([data]);

  if (error) {
    console.error('Error adding teacher attendance:', error);
    throw new Error('Failed to create attendance record');
  }

  revalidatePath('/attendance/teachers');
  revalidatePath(`/teachers/${data.teacher_id}`);
}

export async function deleteTeacherAttendance(id: string, teacherId?: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('teacher_attendance')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting teacher attendance:', error);
    throw new Error('Failed to delete attendance record');
  }

  revalidatePath('/attendance/teachers');
  if (teacherId) revalidatePath(`/teachers/${teacherId}`);
}

export async function saveStudentAttendance(sessionId: string, classId: string, attendanceData: any[]) {
  const supabase = await createClient();

  // 1. Upsert attendance records for the session
  const { error } = await supabase
    .from('session_attendance')
    .upsert(attendanceData, { onConflict: 'session_id,student_id' });

  if (error) {
    console.error('Error saving student attendance:', error);
    throw new Error('Failed to save student attendance');
  }

  // 2. Update enrollments stats (sessions_completed, attendance_rate)
  // To do this accurately, we should call a stored procedure or just increment sessions_completed.
  // For simplicity here, we assume the trigger or manual calculation handles it, 
  // or we can fetch all attendance for these students and update.
  // Since we don't have a robust trigger set up yet, we'll just let the server action trigger a revalidate.
  // The actual update to enrollments should ideally be done via a DB function.

  revalidatePath('/attendance/students');
  revalidatePath(`/classes/${classId}`);
}

export async function getStudentsForClass(classId: string) {
  const supabase = await createClient();
  
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      student_id,
      students (
        id,
        full_name,
        code
      )
    `)
    .eq('class_id', classId)
    .eq('status', 'Đang học');

  if (error) {
    console.error('Error fetching students for class:', error);
    return [];
  }

  return enrollments.map((e: any) => ({
    id: e.students.id,
    full_name: e.students.full_name,
    code: e.students.code
  }));
}

export async function getClassSessions(classId: string) {
  const supabase = await createClient();
  
  const { data: sessions, error } = await supabase
    .from('class_sessions')
    .select('id, session_date, status')
    .eq('class_id', classId)
    .order('session_date', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  
  return sessions || [];
}

export async function getSessionAttendance(sessionId: string) {
  const supabase = await createClient();
  
  const { data: attendance, error } = await supabase
    .from('session_attendance')
    .select('student_id, status, notes')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error fetching session attendance:', error);
    return [];
  }
  
  return attendance || [];
}
