'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateParent } from '../actions';
import StatusBadge from '@/components/ui/StatusBadge';

interface EditParentClientProps {
  parent: any;
}

export default function EditParentClient({ parent }: EditParentClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: parent.fullName || '',
    phone: parent.phone || '',
    email: parent.email || '',
    job: parent.job || '',
    notes: parent.notes || '',
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
        await updateParent(parent.id, formData);
        router.refresh();
        alert('Cập nhật thành công!');
      } catch (error) {
        alert('Lỗi cập nhật phụ huynh: ' + (error as Error).message);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-xl animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-lg">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/parents" className="hover:text-primary transition-colors">Quản lý phụ huynh</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">{parent.fullName}</span>
      </nav>

      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-background">Hồ sơ Phụ huynh</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Xem và cập nhật thông tin liên hệ, quản lý con em đang theo học.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Form (Left - 2 Cols) */}
        <div className="lg:col-span-2 card p-lg">
          <form onSubmit={handleSubmit} className="space-y-md">
            <h2 className="text-title-md font-semibold text-on-background flex items-center gap-2 border-b border-outline-variant/20 pb-sm mb-md">
              <span className="material-symbols-outlined text-primary">contact_mail</span>
              Thông tin liên hệ
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
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Số điện thoại <span className="text-error">*</span></label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Nghề nghiệp</label>
                <input
                  value={form.job}
                  onChange={(e) => handleChange('job', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">Ghi chú</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="input-field w-full h-24 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-sm mt-lg pt-md border-t border-outline-variant/20">
              <button
                type="submit"
                disabled={isPending || !form.fullName || !form.phone}
                className="btn-primary"
              >
                {isPending ? (
                  <>Đang lưu...</>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Cập nhật
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Linked Students (Right - 1 Col) */}
        <div className="space-y-md">
          <div className="card p-lg">
            <h2 className="text-title-md font-semibold text-on-background flex items-center gap-2 border-b border-outline-variant/20 pb-sm mb-md">
              <span className="material-symbols-outlined text-primary">school</span>
              Học viên liên kết
            </h2>
            
            {parent.students.length === 0 ? (
              <p className="text-body-md text-on-surface-variant text-center py-lg">Chưa có học viên nào liên kết.</p>
            ) : (
              <div className="space-y-sm">
                {parent.students.map((student: any) => (
                  <Link href={`/students/${student.id}`} key={student.id} className="block group">
                    <div className="p-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/10 group-hover:border-primary/30">
                      <div className="flex items-start gap-md">
                        <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-[18px] ${student.avatarColor}`}>
                          {student.avatarInitials}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-body-lg font-semibold text-on-background group-hover:text-primary transition-colors">{student.fullName}</p>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                              {student.relationship}
                            </span>
                          </div>
                          <p className="font-mono text-label-sm text-on-surface-variant mt-1 mb-2">{student.code}</p>
                          <StatusBadge status={student.status} size="sm" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => alert('Tính năng liên kết học viên mới đang được phát triển')}
              className="w-full btn-secondary mt-md justify-center border-dashed border-2 hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[16px]">link</span>
              Liên kết học viên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
