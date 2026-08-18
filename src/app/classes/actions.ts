'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addClass(formData: FormData) {
  const supabase = await createClient();

  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const program = formData.get('program') as string;
  const level = formData.get('level') as string;
  const courseId = formData.get('courseId') as string;
  const teacherId = formData.get('teacherId') as string;
  const roomId = formData.get('roomId') as string;
  const capacity = parseInt(formData.get('capacity') as string || '15', 10);
  const schedule = formData.get('schedule') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const status = formData.get('status') as string || 'Sắp mở';
  
  const colors = ['primary', 'secondary', 'tertiary', 'error'];
  const colorKey = colors[Math.floor(Math.random() * colors.length)];

  const { data: newClass, error } = await supabase.from('classes').insert([
    {
      code,
      name,
      program,
      level,
      course_id: courseId || null,
      teacher_id: teacherId || null,
      room_id: roomId || null,
      capacity,
      schedule,
      start_date: startDate || null,
      end_date: endDate || null,
      status: status,
      color_key: colorKey,
    },
  ]).select().single();

  if (error) {
    console.error('Error adding class:', error);
    throw new Error('Failed to create class');
  }


  revalidatePath('/classes');
  revalidatePath('/schedule');
  return { success: true };
}

export async function updateClass(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const program = formData.get('program') as string;
  const level = formData.get('level') as string;
  const courseId = formData.get('courseId') as string;
  const teacherId = formData.get('teacherId') as string;
  const roomId = formData.get('roomId') as string;
  const capacity = parseInt(formData.get('capacity') as string || '15', 10);
  const schedule = formData.get('schedule') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const status = formData.get('status') as string;

  const { error } = await supabase.from('classes').update({
    code,
    name,
    program,
    level,
    course_id: courseId || null,
    teacher_id: teacherId || null,
    room_id: roomId || null,
    capacity,
    schedule,
    start_date: startDate || null,
    end_date: endDate || null,
    status,
  }).eq('id', id);

  if (error) {
    console.error('Error updating class:', error);
    throw new Error('Failed to update class');
  }

  revalidatePath('/classes');
  revalidatePath(`/classes/${id}`);
  revalidatePath('/schedule');
  return { success: true };
}

export async function enrollStudentInClass(studentId: string, classId: string) {
  const supabase = await createClient();

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .single();

  if (existing) {
    throw new Error('Học viên này đã có trong lớp.');
  }

  // Insert enrollment
  const { error } = await supabase.from('enrollments').insert([
    {
      student_id: studentId,
      class_id: classId,
      status: 'Đang học',
      enrollment_date: new Date().toISOString().split('T')[0],
      sessions_completed: 0,
      attendance_rate: 100,
    }
  ]);

  if (error) {
    console.error('Error enrolling student:', error);
    throw new Error('Không thể thêm học viên vào lớp');
  }

  // Fetch class price and create tuition record
  const { data: cls } = await supabase.from('classes').select('course_id').eq('id', classId).single();
  
  let tuition = 0;
  if (cls?.course_id) {
    const { data: course } = await supabase.from('courses').select('tuition_fee').eq('id', cls.course_id).single();
    if (course) tuition = course.tuition_fee || 0;
  }

  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await supabase.from('tuition_records').insert([
    {
      student_id: studentId,
      class_id: classId,
      total_tuition: tuition,
      amount_paid: 0,
      amount_owed: tuition,
      status: 'Chưa đến hạn',
      due_date: dueDate,
    }
  ]);

  revalidatePath(`/classes/${classId}`);
  revalidatePath('/classes');
  return { success: true };
}


export async function deleteClass(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('classes')
    .update({ status: 'Đã kết thúc' })
    .eq('id', id);

  if (error) {
    console.error('Error deleting class:', error);
    throw new Error('Failed to delete class');
  }

  revalidatePath('/classes');
  revalidatePath('/schedule');
}

export async function addClassSession(classId: string, formData: FormData) {
  const supabase = await createClient();
  
  const sessionDateStr = formData.get('sessionDate') as string;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const room = formData.get('room') as string;
  const status = formData.get('status') as string || 'Chưa học';

  if (!sessionDateStr || !startTime || !endTime || !room) {
    throw new Error('Missing required fields');
  }

  const formTeacherId = formData.get('teacherId') as string;

  // Fetch the default teacher for this class if not provided in form
  let teacherId = formTeacherId;
  if (!teacherId) {
    const { data: classData } = await supabase.from('classes').select('teacher_id').eq('id', classId).single();
    teacherId = classData?.teacher_id || null;
  }

  // Check for room & teacher conflict
  const { data: conflicts } = await supabase
    .from('class_sessions')
    .select('id, room, teacher_id')
    .eq('session_date', sessionDateStr)
    .neq('status', 'Nghỉ/Bù')
    .or(`and(start_time.lte.${startTime}:00,end_time.gt.${startTime}:00),and(start_time.lt.${endTime}:00,end_time.gte.${endTime}:00),and(start_time.gte.${startTime}:00,end_time.lte.${endTime}:00)`);
    
  if (conflicts && conflicts.length > 0) {
    const roomConflict = room ? conflicts.find(c => c.room === room) : null;
    const teacherConflict = teacherId ? conflicts.find(c => c.teacher_id === teacherId) : null;
    
    if (roomConflict && teacherConflict) {
      return { success: false, error: 'Trùng lịch: Cả phòng học và giáo viên đều đã được xếp lịch trong khung giờ này!' };
    } else if (roomConflict) {
      return { success: false, error: 'Trùng lịch: Phòng học này đã được xếp lịch trong khung giờ này!' };
    } else if (teacherConflict) {
      return { success: false, error: 'Trùng lịch: Giáo viên này đã có lịch dạy trong khung giờ này!' };
    }
  }

  const { error } = await supabase.from('class_sessions').insert({
    class_id: classId,
    teacher_id: teacherId,
    session_date: sessionDateStr,
    start_time: startTime + ':00',
    end_time: endTime + ':00',
    room: room,
    status: status
  });

  if (error) {
    console.error('Error adding class session:', error);
    return { success: false, error: 'Lỗi hệ thống: Không thể thêm buổi học' };
  }

  revalidatePath(`/classes/${classId}`);
  revalidatePath('/schedule');
  return { success: true };
}

export async function updateClassSession(sessionId: string, classId: string, formData: FormData) {
  const supabase = await createClient();
  
  const sessionDateStr = formData.get('sessionDate') as string;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const room = formData.get('room') as string;
  const status = formData.get('status') as string;
  const teacherId = formData.get('teacherId') as string;

  if (!sessionDateStr || !startTime || !endTime || !room) {
    throw new Error('Missing required fields');
  }

  // Check for room & teacher conflict
  if (sessionDateStr && startTime && endTime && status !== 'Nghỉ/Bù') {
    const { data: conflicts } = await supabase
      .from('class_sessions')
      .select('id, room, teacher_id')
      .neq('id', sessionId)
      .eq('session_date', sessionDateStr)
      .neq('status', 'Nghỉ/Bù')
      .or(`and(start_time.lte.${startTime}:00,end_time.gt.${startTime}:00),and(start_time.lt.${endTime}:00,end_time.gte.${endTime}:00),and(start_time.gte.${startTime}:00,end_time.lte.${endTime}:00)`);
      
    if (conflicts && conflicts.length > 0) {
      const roomConflict = room ? conflicts.find(c => c.room === room) : null;
      const teacherConflict = teacherId ? conflicts.find(c => c.teacher_id === teacherId) : null;
      
      if (roomConflict && teacherConflict) {
        return { success: false, error: 'Trùng lịch: Cả phòng học và giáo viên đều đã được xếp lịch trong khung giờ này!' };
      } else if (roomConflict) {
        return { success: false, error: 'Trùng lịch: Phòng học này đã được xếp lịch trong khung giờ này!' };
      } else if (teacherConflict) {
        return { success: false, error: 'Trùng lịch: Giáo viên này đã có lịch dạy trong khung giờ này!' };
      }
    }
  }

  const updateData: any = {};
  if (sessionDateStr) updateData.session_date = sessionDateStr;
  if (startTime) updateData.start_time = startTime.includes(':') && startTime.length === 5 ? startTime + ':00' : startTime;
  if (endTime) updateData.end_time = endTime.includes(':') && endTime.length === 5 ? endTime + ':00' : endTime;
  if (room) updateData.room = room;
  if (status) updateData.status = status;
  updateData.teacher_id = teacherId || null;

  const { error } = await supabase.from('class_sessions').update(updateData).eq('id', sessionId);

  if (error) {
    console.error('Error updating class session:', error);
    return { success: false, error: 'Lỗi hệ thống: Không thể cập nhật buổi học' };
  }

  revalidatePath(`/classes/${classId}`);
  revalidatePath('/schedule');
  return { success: true };
}

export async function deleteClassSession(sessionId: string, classId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('class_sessions').delete().eq('id', sessionId);

  if (error) {
    console.error('Error deleting class session:', error);
    throw new Error('Failed to delete class session');
  }

  revalidatePath(`/classes/${classId}`);
  revalidatePath('/schedule');
  return { success: true };
}

export async function generateScheduleSessions(classId: string) {
  const supabase = await createClient();

  // 1. Fetch class info
  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select('schedule, start_date, end_date, teacher_id, room_id, rooms(name)')
    .eq('id', classId)
    .single();

  if (clsError || !cls) {
    return { success: false, error: 'Không tìm thấy lớp học' };
  }

  if (!cls.schedule || !cls.start_date || !cls.end_date) {
    return { success: false, error: 'Lớp học chưa có đủ thông tin lịch học, ngày bắt đầu hoặc ngày kết thúc' };
  }

  // 2. Parse schedule string: "Thứ 2, Thứ 4 (18:00-19:30)" or "Thứ 2, Thứ 4, Thứ 6 (18:00-19:30)"
  const scheduleStr = cls.schedule as string;
  const timeMatch = scheduleStr.match(/\((\d{2}:\d{2})[-–](\d{2}:\d{2})\)/);
  if (!timeMatch) {
    return { success: false, error: 'Không thể đọc giờ học từ lịch: ' + scheduleStr };
  }
  const startTime = timeMatch[1];
  const endTime = timeMatch[2];

  // Parse days: "Thứ 2" -> 1 (Monday), "Thứ 3" -> 2, ... "Thứ 7" -> 6, "Chủ nhật" -> 0
  const dayMap: Record<string, number> = {
    'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6, 'Chủ nhật': 0, 'CN': 0,
    'T2': 1, 'T3': 2, 'T4': 3, 'T5': 4, 'T6': 5, 'T7': 6
  };
  const daysPart = scheduleStr.replace(/\(.*\)/, '').trim();
  const scheduleDays: number[] = [];
  for (const [label, dayNum] of Object.entries(dayMap)) {
    if (daysPart.includes(label)) {
      scheduleDays.push(dayNum);
    }
  }

  if (scheduleDays.length === 0) {
    return { success: false, error: 'Không thể đọc ngày học từ lịch: ' + scheduleStr };
  }

  // 3. Get existing session dates for this class (to avoid duplicates)
  const { data: existingSessions } = await supabase
    .from('class_sessions')
    .select('session_date, start_time')
    .eq('class_id', classId);

  const existingDates = new Set(
    (existingSessions || []).map(s => `${s.session_date}_${s.start_time?.substring(0, 5)}`)
  );

  // 4. Generate sessions from start_date to end_date
  const roomName = cls.rooms ? (cls.rooms as any).name : null;
  const sessionsToInsert: any[] = [];
  const start = new Date(cls.start_date);
  const end = new Date(cls.end_date);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (scheduleDays.includes(d.getDay())) {
      const dateStr = d.toISOString().split('T')[0];
      const key = `${dateStr}_${startTime}`;
      if (!existingDates.has(key)) {
        sessionsToInsert.push({
          class_id: classId,
          teacher_id: cls.teacher_id || null,
          session_date: dateStr,
          start_time: startTime + ':00',
          end_time: endTime + ':00',
          room: roomName,
          status: 'Chưa học',
        });
      }
    }
  }

  if (sessionsToInsert.length === 0) {
    return { success: true, count: 0, message: 'Tất cả buổi học đã tồn tại, không cần sinh thêm.' };
  }

  // 5. Insert in batches of 50
  let insertedCount = 0;
  for (let i = 0; i < sessionsToInsert.length; i += 50) {
    const batch = sessionsToInsert.slice(i, i + 50);
    const { error } = await supabase.from('class_sessions').insert(batch);
    if (error) {
      console.error('Error inserting sessions batch:', error);
      return { success: false, error: 'Lỗi khi tạo buổi học: ' + error.message, count: insertedCount };
    }
    insertedCount += batch.length;
  }

  revalidatePath('/schedule');
  revalidatePath(`/classes/${classId}`);
  return { success: true, count: insertedCount, message: `Đã sinh ${insertedCount} buổi học thành công.` };
}
