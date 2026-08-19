'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addTeacher } from '../actions';
import CurrencyInput from '@/components/ui/CurrencyInput';

export default function NewTeacherPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    idCard: '',
    address: '',
    gender: '',
    startDate: '',
    degree: '',
    institution: '',
    yearsOfExperience: '',
    major: '',
    englishLevel: '',
    salaryType: '',
    salaryRate: '',
    assistantSalaryRate: '',
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
        await addTeacher(formData);
        router.push('/teachers');
        router.refresh();
      } catch (error) {
        alert('Lỗi tạo giáo viên: ' + (error as Error).message);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-xl animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-lg">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/teachers" className="hover:text-primary transition-colors">Quản lý giáo viên</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Thêm giáo viên mới</span>
      </nav>

      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-background">Thêm giáo viên mới</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Điền thông tin để tạo hồ sơ giáo viên mới</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Left Column - Personal Info */}
        <div className="card p-lg space-y-md">
          <h2 className="text-title-md font-semibold text-on-background flex items-center gap-2 border-b border-outline-variant/20 pb-sm">
            <span className="material-symbols-outlined text-primary">person</span>
            Thông tin cá nhân
          </h2>
          
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Họ và tên <span className="text-error">*</span>
            </label>
            <input
              required
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Nguyễn Văn A"
              className="input-field w-full"
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
              placeholder="0987 654 321"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Email liên hệ <span className="text-error">*</span>
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="nguyenvana@gmail.com"
              className="input-field w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Ngày sinh
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Giới tính
              </label>
              <select
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="input-field w-full"
              >
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              CCCD/CMND
            </label>
            <input
              value={form.idCard}
              onChange={(e) => handleChange('idCard', e.target.value)}
              placeholder="001234567890"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Địa chỉ
            </label>
            <input
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Đường A, Quận B..."
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Ngày bắt đầu làm việc
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        {/* Right Column - Qualifications */}
        <div className="card p-lg space-y-md">
          <h2 className="text-title-md font-semibold text-on-background flex items-center gap-2 border-b border-outline-variant/20 pb-sm">
            <span className="material-symbols-outlined text-primary">school</span>
            Học vị & Chuyên môn
          </h2>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Bằng cấp cao nhất
            </label>
            <select
              value={form.degree}
              onChange={(e) => handleChange('degree', e.target.value)}
              className="input-field w-full"
            >
              <option value="">-- Chọn bằng cấp --</option>
              <option value="Cử nhân">Cử nhân</option>
              <option value="Thạc sĩ">Thạc sĩ</option>
              <option value="Tiến sĩ">Tiến sĩ</option>
            </select>
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Nơi công tác / Trường tốt nghiệp
            </label>
            <input
              value={form.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
              placeholder="ĐH Ngoại Thương, ĐH Sư Phạm..."
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Số năm kinh nghiệm
            </label>
            <input
              type="number"
              min="0"
              value={form.yearsOfExperience}
              onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
              placeholder="Ví dụ: 3"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Chuyên ngành
            </label>
            <input
              value={form.major}
              onChange={(e) => handleChange('major', e.target.value)}
              placeholder="Sư phạm Anh, Ngôn ngữ Anh..."
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Trình độ Tiếng Anh
            </label>
            <input
              value={form.englishLevel}
              onChange={(e) => handleChange('englishLevel', e.target.value)}
              placeholder="IELTS 7.0, C1, TOEIC 900..."
              className="input-field w-full"
            />
          </div>
          
          <div className="bg-primary/5 border border-primary/20 p-sm rounded-lg text-label-sm text-primary flex gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            Các chứng chỉ và chuyên môn chi tiết (IELTS, TOEIC, TESOL...) có thể được bổ sung ở chức năng Cập nhật Hồ sơ sau khi tạo mới thành công.
          </div>
        </div>

        {/* Full Width - Salary Info */}
        <div className="card p-lg space-y-md col-span-1 lg:col-span-2">
          <h2 className="text-title-md font-semibold text-on-background flex items-center gap-2 border-b border-outline-variant/20 pb-sm">
            <span className="material-symbols-outlined text-primary">payments</span>
            Thông tin lương
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Hình thức lương
              </label>
              <select
                value={form.salaryType}
                onChange={(e) => handleChange('salaryType', e.target.value)}
                className="input-field w-full"
              >
                <option value="">-- Chọn hình thức --</option>
                <option value="hourly">Theo giờ</option>
                <option value="fixed">Lương cố định</option>
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Mức lương dạy chính
              </label>
              <CurrencyInput
                value={form.salaryRate}
                onChange={(val) => handleChange('salaryRate', val)}
                placeholder="Ví dụ: 150.000"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Mức lương trợ giảng
              </label>
              <CurrencyInput
                value={form.assistantSalaryRate}
                onChange={(val) => handleChange('assistantSalaryRate', val)}
                placeholder="Ví dụ: 80.000"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="col-span-1 lg:col-span-2 flex items-center justify-end gap-sm mt-lg pt-md border-t border-outline-variant/20">
          <Link href="/teachers" className="btn-secondary">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isPending || !form.fullName || !form.phone || !form.email}
            className="btn-primary"
          >
            {isPending ? (
              <>Đang xử lý...</>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                Hoàn tất
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
