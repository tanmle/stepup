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
    prefChannel: '',
    addressProvince: '',
    addressDistrict: '',
    addressWard: '',
    addressDetail: '',
    job: '',
    company: '',
    position: '',
    source: '',
    sourceNote: '',
    crmStatus: 'Tiềm năng',
    interestLevel: '',
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

      <form onSubmit={handleSubmit} className="space-y-xl">
        {/* Thông tin cá nhân */}
        <div className="card p-lg space-y-md">
          <h2 className="text-title-md text-on-surface font-semibold mb-sm">Thông tin cá nhân</h2>
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
                Số điện thoại <span className="text-error">*</span>
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
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Email
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
                Kênh liên lạc ưu tiên
              </label>
              <select
                value={form.prefChannel}
                onChange={(e) => handleChange('prefChannel', e.target.value)}
                className="input-field w-full"
              >
                <option value="">Chọn kênh</option>
                <option value="Zalo">Zalo</option>
                <option value="Điện thoại">Điện thoại</option>
                <option value="Email">Email</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>
          </div>
        </div>

        {/* Địa chỉ */}
        <div className="card p-lg space-y-md">
          <h2 className="text-title-md text-on-surface font-semibold mb-sm">Địa chỉ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Tỉnh / Thành phố
              </label>
              <input
                value={form.addressProvince}
                onChange={(e) => handleChange('addressProvince', e.target.value)}
                className="input-field w-full"
                placeholder="VD: Hà Nội"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Quận / Huyện
              </label>
              <input
                value={form.addressDistrict}
                onChange={(e) => handleChange('addressDistrict', e.target.value)}
                className="input-field w-full"
                placeholder="VD: Cầu Giấy"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Phường / Xã
              </label>
              <input
                value={form.addressWard}
                onChange={(e) => handleChange('addressWard', e.target.value)}
                className="input-field w-full"
                placeholder="VD: Dịch Vọng"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Địa chỉ chi tiết
              </label>
              <input
                value={form.addressDetail}
                onChange={(e) => handleChange('addressDetail', e.target.value)}
                className="input-field w-full"
                placeholder="VD: Số 123 Đường ABC"
              />
            </div>
          </div>
        </div>

        {/* Nghề nghiệp */}
        <div className="card p-lg space-y-md">
          <h2 className="text-title-md text-on-surface font-semibold mb-sm">Nghề nghiệp</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Nghề nghiệp
              </label>
              <input
                value={form.job}
                onChange={(e) => handleChange('job', e.target.value)}
                className="input-field w-full"
                placeholder="VD: Kinh doanh tự do"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Công ty
              </label>
              <input
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="input-field w-full"
                placeholder="VD: Công ty TNHH ABC"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Chức vụ
              </label>
              <input
                value={form.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="input-field w-full"
                placeholder="VD: Giám đốc"
              />
            </div>
          </div>
        </div>

        {/* CRM */}
        <div className="card p-lg space-y-md">
          <h2 className="text-title-md text-on-surface font-semibold mb-sm">CRM & Chăm sóc</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Nguồn khách hàng
              </label>
              <select
                value={form.source}
                onChange={(e) => handleChange('source', e.target.value)}
                className="input-field w-full"
              >
                <option value="">Chọn nguồn</option>
                <option value="Facebook">Facebook</option>
                <option value="Bạn bè">Bạn bè giới thiệu</option>
                <option value="Tờ rơi">Tờ rơi / Banner</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Ghi chú nguồn
              </label>
              <input
                value={form.sourceNote}
                onChange={(e) => handleChange('sourceNote', e.target.value)}
                className="input-field w-full"
                placeholder="VD: Do anh A giới thiệu"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Trạng thái CRM
              </label>
              <select
                value={form.crmStatus}
                onChange={(e) => handleChange('crmStatus', e.target.value)}
                className="input-field w-full"
              >
                <option value="Tiềm năng">Tiềm năng</option>
                <option value="Đang học">Đang học</option>
                <option value="Đã nghỉ">Đã nghỉ</option>
                <option value="Khách VIP">Khách VIP</option>
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Mức độ quan tâm
              </label>
              <select
                value={form.interestLevel}
                onChange={(e) => handleChange('interestLevel', e.target.value)}
                className="input-field w-full"
              >
                <option value="">Chọn mức độ</option>
                <option value="Cao">Cao</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Thấp">Thấp</option>
              </select>
            </div>
            <div className="md:col-span-2">
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
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-sm pt-md">
          <Link href="/parents" className="btn-secondary bg-surface card">
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
