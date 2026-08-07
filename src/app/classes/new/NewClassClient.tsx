'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addClass } from '../actions';
import { COURSE_OPTIONS } from '@/lib/constants';

interface NewClassClientProps {
  teachers: { id: string; full_name: string; code: string }[];
}

export default function NewClassClient({ teachers }: NewClassClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    code: '',
    name: '',
    program: '',
    level: '',
    teacherId: '',
    capacity: '15',
    scheduleDays: [] as string[],
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'scheduleDays') {
        formData.append('schedule', (value as string[]).join(', ') + ` (${form.startTime}-${form.endTime})`);
      } else {
        formData.append(key, value as string);
      }
    });

    startTransition(async () => {
      try {
        await addClass(formData);
        router.push('/classes');
        router.refresh();
      } catch (error) {
        alert('Lỗi tạo lớp học: ' + (error as Error).message);
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
        <span className="text-on-surface font-medium">Mở lớp mới</span>
      </nav>

      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-background">Mở lớp mới</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Điền thông tin cơ bản để mở một lớp học mới</p>
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
              placeholder="VD: IEL-102"
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
              placeholder="IELTS Intensive K1"
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Chương trình <span className="text-error">*</span>
            </label>
            <select
              required
              value={form.program}
              onChange={(e) => {
                handleChange('program', e.target.value);
                handleChange('level', '');
              }}
              className="input-field w-full"
            >
              <option value="">-- Chọn chương trình --</option>
              {COURSE_OPTIONS.map((opt) => (
                <option key={opt.category} value={opt.category}>{opt.category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Cấp độ <span className="text-error">*</span>
            </label>
            <select
              required
              value={form.level}
              onChange={(e) => handleChange('level', e.target.value)}
              className="input-field w-full"
              disabled={!form.program}
            >
              <option value="">-- Chọn cấp độ --</option>
              {form.program && COURSE_OPTIONS.find(o => o.category === form.program)?.levels.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Giáo viên phụ trách
            </label>
            <select
              value={form.teacherId}
              onChange={(e) => handleChange('teacherId', e.target.value)}
              className="input-field w-full"
            >
              <option value="">-- Chọn giáo viên --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Sĩ số tối đa
            </label>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Ngày học trong tuần
            </label>
            <div className="flex flex-wrap gap-xs">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => {
                const isSelected = form.scheduleDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        scheduleDays: isSelected
                          ? prev.scheduleDays.filter((d) => d !== day)
                          : [...prev.scheduleDays, day],
                      }));
                    }}
                    className={`px-sm py-xs rounded-lg text-label-sm font-semibold border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/30'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Giờ bắt đầu <span className="text-error">*</span>
            </label>
            <input
              required
              type="time"
              value={form.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Giờ kết thúc <span className="text-error">*</span>
            </label>
            <input
              required
              type="time"
              value={form.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Ngày bắt đầu <span className="text-error">*</span>
            </label>
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Ngày kết thúc
            </label>
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
          <Link href="/classes" className="btn-secondary">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isPending || !form.code || !form.name || !form.program || !form.level || !form.startDate || !form.startTime || !form.endTime}
            className="btn-primary"
          >
            {isPending ? (
              <>Đang xử lý...</>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">add</span>
                Mở lớp
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
