'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addParent } from '../actions';

export default function NewParentPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    job: '',
    notes: '',
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
        await addParent(formData);
        router.push('/parents');
        router.refresh();
      } catch (error) {
        alert('Lỗi tạo phụ huynh: ' + (error as Error).message);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-xl animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-lg">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/parents" className="hover:text-primary transition-colors">Quản lý phụ huynh</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Thêm mới</span>
      </nav>

      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-background">Thêm Phụ huynh mới</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Tạo hồ sơ phụ huynh để dễ dàng quản lý học phí và chăm sóc khách hàng.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-lg space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Họ và tên <span className="text-error">*</span>
            </label>
            <input
              required
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="input-field w-full"
              placeholder="VD: Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Số điện thoại (Zalo) <span className="text-error">*</span>
            </label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="input-field w-full"
              placeholder="VD: 0901234567"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Email liên hệ
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="input-field w-full"
              placeholder="VD: email@example.com"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Nghề nghiệp / Công tác
            </label>
            <input
              value={form.job}
              onChange={(e) => handleChange('job', e.target.value)}
              className="input-field w-full"
              placeholder="VD: Kinh doanh tự do"
            />
          </div>
        </div>

        <div>
          <label className="text-label-sm text-on-surface-variant mb-xs block">
            Ghi chú nội bộ
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input-field w-full h-24 resize-none"
            placeholder="Ghi chú về phụ huynh..."
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-sm pt-md border-t border-outline-variant/20">
          <Link href="/parents" className="btn-secondary">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isPending || !form.fullName || !form.phone}
            className="btn-primary"
          >
            {isPending ? (
              <>Đang xử lý...</>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">add</span>
                Tạo hồ sơ
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
