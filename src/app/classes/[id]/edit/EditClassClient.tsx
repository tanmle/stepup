'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateClass } from '../../actions';

interface EditClassClientProps {
  classData: any;
  teachers: { id: string; full_name: string; code: string }[];
  courses: { id: string; name: string; program: string; level: string }[];
}

export default function EditClassClient({ classData, teachers, courses }: EditClassClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Parse existing schedule: "T2, T4, T6 (18:00-19:30)" -> days, startTime, endTime
  const scheduleStr = classData.schedule || '';
  const hasTime = scheduleStr.includes('(');
  
  let days: string[] = [];
  let start = '';
  let end = '';

  if (hasTime) {
    const timeMatch = scheduleStr.match(/\((.*?)-(.*?)\)/);
    if (timeMatch) {
      start = timeMatch[1].trim();
      end = timeMatch[2].trim();
    }
    const daysPart = scheduleStr.split('(')[0].trim();
    days = daysPart.split(',').map((d: string) => d.trim()).filter(Boolean);
  } else {
    days = scheduleStr.split(',').map((d: string) => d.trim()).filter(Boolean);
  }

  const [form, setForm] = useState({
    code: classData.code || '',
    name: classData.name || '',
    courseId: classData.course_id || '',
    teacherId: classData.teacher_id || '',
    capacity: classData.capacity?.toString() || '15',
    scheduleDays: days,
    startTime: start,
    endTime: end,
    startDate: classData.start_date || '',
    endDate: classData.end_date || '',
    status: classData.status || 'Đang học',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleDay = (day: string) => {
    setForm((prev) => {
      const current = prev.scheduleDays;
      if (current.includes(day)) {
        return { ...prev, scheduleDays: current.filter((d) => d !== day) };
      } else {
        return { ...prev, scheduleDays: [...current, day] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', classData.id);

    Object.entries(form).forEach(([key, value]) => {
      if (key === 'scheduleDays') {
        formData.append('schedule', (value as string[]).join(', ') + (form.startTime && form.endTime ? ` (${form.startTime}-${form.endTime})` : ''));
      } else if (key === 'courseId') {
        formData.append('courseId', value as string);
        const selectedCourse = courses.find(c => c.id === value);
        if (selectedCourse) {
          formData.append('program', selectedCourse.program);
          formData.append('level', selectedCourse.level);
        }
      } else {
        formData.append(key, value as string);
      }
    });

    startTransition(async () => {
      try {
        await updateClass(formData);
        router.push(`/classes/${classData.id}`);
        router.refresh();
      } catch (error) {
        alert('Lỗi cập nhật lớp học: ' + (error as Error).message);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-xl animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-lg">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/classes" className="hover:text-primary transition-colors">Quản lý lớp học</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href={`/classes/${classData.id}`} className="hover:text-primary transition-colors">{classData.name}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Chỉnh sửa</span>
      </nav>

      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-background">Cập nhật Lớp học</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Chỉnh sửa thông tin lớp {classData.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-lg space-y-lg max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Mã lớp <span className="text-error">*</span>
            </label>
            <input
              required
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value)}
              className="input-field w-full uppercase"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Tên lớp <span className="text-error">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Khóa học <span className="text-error">*</span>
            </label>
            <select
              required
              value={form.courseId}
              onChange={(e) => handleChange('courseId', e.target.value)}
              className="input-field w-full"
            >
              <option value="">-- Chọn Khóa học --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.program} - {c.level})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Giáo viên phụ trách
            </label>
            <select
              value={form.teacherId}
              onChange={(e) => handleChange('teacherId', e.target.value)}
              className="input-field w-full"
            >
              <option value="">-- Chưa xếp giáo viên --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Sĩ số dự kiến</label>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="input-field w-full"
            >
              <option value="Sắp mở">Sắp mở</option>
              <option value="Đang học">Đang học</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>
        </div>

        {/* Schedule */}
        <div className="p-md rounded-xl bg-surface-container-low border border-outline-variant/20">
          <h3 className="text-title-md font-medium text-on-background mb-md">Lịch học</h3>
          <div className="space-y-md">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-sm block">Ngày học trong tuần</label>
              <div className="flex flex-wrap gap-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => {
                  const isSelected = form.scheduleDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      className={`w-10 h-10 rounded-full text-label-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface border border-outline-variant hover:border-primary/50 text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Giờ bắt đầu</label>
                <input
                  type="time"
                  required
                  value={form.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Giờ kết thúc</label>
                <input
                  type="time"
                  required
                  value={form.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Ngày khai giảng <span className="text-error">*</span>
            </label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Ngày kết thúc dự kiến</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-sm pt-md border-t border-outline-variant/20">
          <Link href={`/classes/${classData.id}`} className="btn-secondary">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isPending || !form.code || !form.name || !form.courseId || !form.startDate || !form.startTime || !form.endTime}
            className="btn-primary"
          >
            {isPending ? 'Đang lưu...' : 'Cập nhật lớp'}
          </button>
        </div>
      </form>
    </div>
  );
}
