'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateCourse } from '../actions';

export default function CourseDetailClient({ initialCourse }: { initialCourse: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    code: initialCourse.code,
    name: initialCourse.name,
    program: initialCourse.program,
    level: initialCourse.level,
    tuition_fee: initialCourse.tuition_fee.toString(),
    duration_months: initialCourse.duration_months.toString(),
    sessions_count: initialCourse.sessions_count.toString(),
    status: initialCourse.status,
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
        await updateCourse(initialCourse.id, data);
        alert('Cập nhật khóa học thành công!');
      } catch (error) {
        alert('Lỗi khi cập nhật khóa học.');
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
          <h1 className="text-headline-sm text-on-background">Chi tiết Khóa học</h1>
          <p className="text-body-md text-on-surface-variant">Chỉnh sửa thông tin khóa học {initialCourse.code}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-xl flex flex-col gap-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-xs">Mã khóa học *</label>
            <input
              type="text"
              name="code"
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
          
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-xs">Trạng thái *</label>
            <select
              name="status"
              required
              className="input-field w-full"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Tạm ngưng">Tạm ngưng</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
          <Link href="/courses" className="btn-secondary">
            Quay lại
          </Link>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
