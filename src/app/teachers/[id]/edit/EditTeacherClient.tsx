'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateTeacher } from '../../actions';

interface EditTeacherClientProps {
  teacher: any;
}

export default function EditTeacherClient({ teacher }: EditTeacherClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: teacher.fullName || '',
    email: teacher.email || '',
    phone: teacher.phone || '',
    dateOfBirth: teacher.dateOfBirth || '',
    idCard: teacher.idCard || '',
    address: teacher.address || '',
    gender: teacher.gender || '',
    startDate: teacher.startDate || '',
    status: teacher.status || 'Đang làm việc',
    degree: teacher.degree || '',
    institution: teacher.institution || '',
    yearsOfExperience: teacher.yearsOfExperience?.toString() || '0',
    major: teacher.major || '',
    englishLevel: teacher.englishLevel || '',
    salaryType: teacher.salaryType || '',
    salaryRate: teacher.salaryRate?.toString() || '',
    certificates: teacher.certificates?.join(', ') || '',
    specializations: teacher.specializations?.join(', ') || '',
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
        await updateTeacher(teacher.id, formData);
        router.push(`/teachers/${teacher.id}`);
        router.refresh();
      } catch (error) {
        alert('Lỗi cập nhật giáo viên: ' + (error as Error).message);
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
        <Link href={`/teachers/${teacher.id}`} className="hover:text-primary transition-colors">{teacher.fullName}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Chỉnh sửa</span>
      </nav>

      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-background">Sửa thông tin giáo viên</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Cập nhật hồ sơ cho giáo viên <span className="font-semibold text-primary">{teacher.code}</span></p>
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

          <div className="grid grid-cols-2 gap-sm">
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
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">
                Trạng thái <span className="text-error">*</span>
              </label>
              <select
                required
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="input-field w-full"
              >
                <option value="Đang làm việc">Đang làm việc</option>
                <option value="Nghỉ phép">Nghỉ phép</option>
                <option value="Nghỉ thai sản">Nghỉ thai sản</option>
                <option value="Đã nghỉ việc">Đã nghỉ việc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column - Qualifications */}
        <div className="card p-lg space-y-md">
          <h2 className="text-title-md font-semibold text-on-background flex items-center gap-2 border-b border-outline-variant/20 pb-sm">
            <span className="material-symbols-outlined text-primary">school</span>
            Học vị & Chuyên môn
          </h2>

          <div className="grid grid-cols-2 gap-sm">
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
                Năm kinh nghiệm
              </label>
              <input
                type="number"
                min="0"
                value={form.yearsOfExperience}
                onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Nơi công tác / Trường tốt nghiệp
            </label>
            <input
              value={form.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
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

          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Chứng chỉ (Ngăn cách bằng dấu phẩy)
            </label>
            <input
              value={form.certificates}
              onChange={(e) => handleChange('certificates', e.target.value)}
              placeholder="IELTS 8.0, TESOL..."
              className="input-field w-full"
            />
          </div>
          
          <div>
            <label className="text-label-sm text-on-surface-variant mb-xs block">
              Chuyên môn (Ngăn cách bằng dấu phẩy)
            </label>
            <input
              value={form.specializations}
              onChange={(e) => handleChange('specializations', e.target.value)}
              placeholder="Luyện thi IELTS, Giao tiếp..."
              className="input-field w-full"
            />
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
                Mức lương
              </label>
              <input
                type="number"
                min="0"
                value={form.salaryRate}
                onChange={(e) => handleChange('salaryRate', e.target.value)}
                placeholder="Ví dụ: 150000"
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="col-span-1 lg:col-span-2 flex items-center justify-end gap-sm mt-lg pt-md border-t border-outline-variant/20">
          <Link href={`/teachers/${teacher.id}`} className="btn-secondary">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isPending || !form.fullName || !form.phone || !form.email}
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
