'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addCourse } from '../actions';

export default function NewCourseClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    program: 'Tiếng Anh Mầm non',
    level: '',
    tuition_fee: '',
    duration_months: '3',
    sessions_count: '24',
    status: 'Đang hoạt động',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          data.append(key, value);
        });
        await addCourse(data);
        router.push('/courses');
      } catch (error) {
        alert('Lỗi khi thêm khóa học. Vui lòng kiểm tra lại mã khóa học (có thể bị trùng).');
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto pb-xl animate-fade-in">
      <div className="flex items-center gap-sm mb-lg">
        <Link href="/courses" className="p-sm hover:bg-surface-container rounded-full transition-colors">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-headline-sm text-on-background">Thêm mới Khóa học</h1>
          <p className="text-body-md text-on-surface-variant">Tạo một khóa học mới cho trung tâm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-xl flex flex-col gap-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-xs">Mã khóa học *</label>
            <input
              type="text"
              name="code"
              placeholder="VD: IELTS-45"
              required
              className="input-field w-full uppercase"
              value={formData.code}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-xs">Tên hiển thị *</label>
            <input
              type="text"
              name="name"
              placeholder="VD: Luyện thi IELTS Band 4.5"
              required
              className="input-field w-full"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant block mb-xs">Chương trình *</label>
            <select
              name="program"
              required
              className="input-field w-full"
              value={formData.program}
              onChange={handleChange}
            >
              <option value="Tiếng Anh Mầm non">Tiếng Anh Mầm non</option>
              <option value="Tiếng Anh Tiểu học">Tiếng Anh Tiểu học</option>
              <option value="Tiếng Anh Trung học">Tiếng Anh Trung học</option>
              <option value="Luyện thi IELTS">Luyện thi IELTS</option>
              <option value="Tiếng Anh Giao tiếp">Tiếng Anh Giao tiếp</option>
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-xs">Cấp độ *</label>
            <input
              type="text"
              name="level"
              placeholder="VD: Foundation, Band 4-5.5..."
              required
              className="input-field w-full"
              value={formData.level}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant block mb-xs">Học phí (VND) *</label>
            <input
              type="number"
              name="tuition_fee"
              placeholder="VD: 5000000"
              required
              min="0"
              className="input-field w-full"
              value={formData.tuition_fee}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-xs">Thời lượng (Tháng) *</label>
              <input
                type="number"
                name="duration_months"
                required
                min="1"
                className="input-field w-full"
                value={formData.duration_months}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-xs">Số buổi học *</label>
              <input
                type="number"
                name="sessions_count"
                required
                min="1"
                className="input-field w-full"
                value={formData.sessions_count}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
          <Link href="/courses" className="btn-secondary">
            Hủy bỏ
          </Link>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? 'Đang lưu...' : 'Thêm khóa học'}
          </button>
        </div>
      </form>
    </div>
  );
}
