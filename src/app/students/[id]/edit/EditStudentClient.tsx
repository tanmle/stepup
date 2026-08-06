'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateStudent } from '../../actions';

interface EditStudentClientProps {
  student: any;
}

export default function EditStudentClient({ student }: EditStudentClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: student.fullName || '',
    gender: student.gender || 'Nam',
    dateOfBirth: student.dateOfBirth || '',
    phone: student.phone || '',
    email: student.email || '',
    address: student.address || '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    
    startTransition(async () => {
      try {
        await updateStudent(student.id, formData);
        router.push(`/students/${student.id}`);
        router.refresh();
      } catch (error) {
        alert('Lỗi cập nhật học viên: ' + (error as Error).message);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-xl animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-lg">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/students" className="hover:text-primary transition-colors">Quản lý học viên</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href={`/students/${student.id}`} className="hover:text-primary transition-colors">{student.fullName}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Chỉnh sửa</span>
      </nav>

      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-background">Sửa thông tin Học viên</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Cập nhật hồ sơ cho học viên <span className="font-semibold text-primary">{student.code}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="card p-lg space-y-md">
        <h2 className="text-title-md font-semibold text-on-background flex items-center gap-2 border-b border-outline-variant/20 pb-sm">
          <span className="material-symbols-outlined text-primary">person</span>
          Thông tin cá nhân
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Họ và tên <span className="text-error">*</span></label>
            <input
              required
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">Giới tính <span className="text-error">*</span></label>
              <select
                required
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="input-field w-full"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">Ngày sinh <span className="text-error">*</span></label>
              <input
                required
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Số điện thoại</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">Email liên hệ</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        <div>
          <label className="text-label-sm text-on-surface-variant mb-xs block">Địa chỉ thường trú</label>
          <input
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="input-field w-full"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-sm mt-lg pt-md border-t border-outline-variant/20">
          <Link href={`/students/${student.id}`} className="btn-secondary">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isPending || !form.fullName || !form.dateOfBirth}
            className="btn-primary"
          >
            {isPending ? (
              <>Đang lưu...</>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
