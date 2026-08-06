'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addStudent } from '../actions';

const STEPS = [
  { id: 1, label: 'Thông tin cá nhân', icon: 'person' },
  { id: 2, label: 'Thông tin phụ huynh', icon: 'family_restroom' },
  { id: 3, label: 'Đăng ký khóa học', icon: 'class' },
  { id: 4, label: 'Xác nhận', icon: 'check_circle' },
];



interface NewStudentClientProps {
  parents: any[];
  classes: any[];
}

export default function NewStudentClient({ parents, classes }: NewStudentClientProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', dateOfBirth: '', gender: '', phone: '', email: '',
    parentName: '', parentRelationship: 'Mẹ', parentPhone: '', address: '',
    courseId: '', classId: '', parentId: '',
  });

  const selectedClass = classes.find((c) => c.id === form.classId);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('dateOfBirth', form.dateOfBirth);
    formData.append('gender', form.gender);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('address', form.address);
    formData.append('parentName', form.parentName);
    formData.append('parentRelationship', form.parentRelationship);
    formData.append('parentPhone', form.parentPhone);
    formData.append('courseId', form.courseId);
    if (form.parentId) formData.append('parentId', form.parentId);
    // Note: In reality, classes table should have these IDs. We are mocking the classId for now.
    
    startTransition(async () => {
      try {
        await addStudent(formData);
        router.push('/students');
        router.refresh();
      } catch (e) {
        alert('Lỗi tạo học viên: ' + (e as Error).message);
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
        <span className="text-on-surface font-medium">Thêm học viên mới</span>
      </nav>

      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-background">Thêm học viên mới</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Điền thông tin để đăng ký học viên vào trung tâm</p>
      </div>

      {/* Stepper */}
      <div className="card p-lg mb-lg">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex flex-col items-center gap-xs flex-shrink-0 ${
                  step > s.id ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    s.id < step
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : s.id === step
                      ? 'bg-primary text-on-primary shadow-md ring-4 ring-primary/20'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {s.id < step ? (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                  )}
                </div>
                <span
                  className={`text-label-sm whitespace-nowrap ${
                    s.id === step ? 'text-primary font-semibold' : 'text-on-surface-variant'
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-md ${s.id < step ? 'bg-emerald-400' : 'bg-outline-variant/30'} transition-colors duration-300`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="card p-xl">
        {/* Step 1 - Personal Info */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-title-lg text-on-background mb-lg">Thông tin cá nhân</h2>
            <div className="grid grid-cols-2 gap-md">
              <div className="col-span-2">
                <label className="text-label-sm text-on-surface-variant mb-xs block">
                  Họ và tên <span className="text-error">*</span>
                </label>
                <input
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Ngày sinh</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Giới tính</label>
                <select
                  value={form.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="input-field"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Số điện thoại</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="0987 654 321"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Parent Info */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-title-lg text-on-background mb-lg">Thông tin phụ huynh</h2>
            <div className="grid grid-cols-2 gap-md">
              <div className="col-span-2">
                <label className="text-label-sm text-on-surface-variant mb-xs block">
                  Chọn Phụ huynh đã có (hoặc tạo mới)
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    handleChange('parentId', pid);
                    if (pid) {
                      const selectedParent = parents.find(p => p.id === pid);
                      if (selectedParent) {
                        handleChange('parentName', selectedParent.full_name);
                        handleChange('parentPhone', selectedParent.phone);
                      }
                    } else {
                      handleChange('parentName', '');
                      handleChange('parentPhone', '');
                    }
                  }}
                  className="input-field"
                >
                  <option value="">-- Tạo Phụ huynh mới --</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.phone})</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="text-label-sm text-on-surface-variant mb-xs block">
                  Họ và tên phụ huynh <span className="text-error">*</span>
                </label>
                <input
                  value={form.parentName}
                  onChange={(e) => handleChange('parentName', e.target.value)}
                  placeholder="Nguyễn Thị B"
                  className="input-field"
                  disabled={!!form.parentId}
                />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Mối quan hệ</label>
                <select
                  value={form.parentRelationship}
                  onChange={(e) => handleChange('parentRelationship', e.target.value)}
                  className="input-field"
                >
                  <option value="Bố">Bố</option>
                  <option value="Mẹ">Mẹ</option>
                  <option value="Người giám hộ">Người giám hộ</option>
                </select>
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">
                  Số điện thoại liên hệ <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  value={form.parentPhone}
                  onChange={(e) => handleChange('parentPhone', e.target.value)}
                  placeholder="0987 654 321"
                  className="input-field"
                  disabled={!!form.parentId}
                />
              </div>
              <div className="col-span-2">
                <label className="text-label-sm text-on-surface-variant mb-xs block">Địa chỉ liên hệ</label>
                <input
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="12 Nguyễn Huệ, Q.1, TP.HCM"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Course Registration */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-title-lg text-on-background mb-lg">Đăng ký lớp học</h2>
            
            {classes.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">Không có lớp học nào đang mở.</p>
            ) : (
              <div className="grid grid-cols-2 gap-md mb-lg">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => handleChange('classId', cls.id)}
                    className={`text-left p-md rounded-xl border-2 transition-all duration-200 ${
                      form.classId === cls.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-outline-variant/30 hover:border-primary/30 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-body-lg font-semibold text-on-background">{cls.name}</p>
                        <p className="text-body-md text-on-surface-variant mt-xs">Mã: {cls.code} | {cls.program}</p>
                      </div>
                      {form.classId === cls.id && (
                        <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-md mt-md">
                      <span className="text-label-sm bg-primary/10 text-primary px-sm py-xs rounded-md">
                        {cls.price ? `${cls.price.toLocaleString('vi-VN')} đ` : 'Chưa cập nhật giá'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedClass && (
              <div className="animate-fade-in">
                <div className="mt-md p-md bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-label-sm text-primary font-semibold">Học phí dự tính</p>
                  <p className="text-[24px] font-bold text-primary mt-xs">
                    {selectedClass.price ? selectedClass.price.toLocaleString('vi-VN') : '0'} <span className="text-body-md">đồng</span>
                  </p>
                  <p className="text-label-sm text-on-surface-variant mt-xs">* Sẽ tự động tạo hóa đơn học phí khi hoàn tất ghi danh</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4 - Confirmation */}
        {step === 4 && (
          <div className="animate-fade-in text-center">
            <div className="flex flex-col items-center gap-lg mb-xl">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500 text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <div>
                <h2 className="text-headline-md text-on-background">Xác nhận đăng ký</h2>
                <p className="text-body-md text-on-surface-variant mt-xs">Vui lòng kiểm tra lại thông tin trước khi hoàn tất</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm max-w-2xl mx-auto w-full text-left">
              {[
                { label: 'Họ và tên', value: form.fullName || '(chưa điền)' },
                { label: 'Ngày sinh', value: form.dateOfBirth || '(chưa điền)' },
                { label: 'Số điện thoại', value: form.phone || '(chưa điền)' },
                { label: 'Phụ huynh', value: form.parentName || '(chưa điền)' },
                { label: 'Lớp đăng ký', value: selectedClass ? selectedClass.name : '(chưa chọn)' },
                { label: 'Học phí', value: selectedClass && selectedClass.price ? `${selectedClass.price.toLocaleString('vi-VN')} đ` : '0 đ' },
              ].map((item) => (
                <div key={item.label} className="p-md bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col justify-center">
                  <span className="text-label-sm text-on-surface-variant mb-xs">{item.label}</span>
                  <span className="text-body-md font-medium text-on-surface break-words">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-between mt-xl pt-lg border-t border-outline-variant/20">
          <div className="flex gap-sm">
            {step > 1 && (
              <button onClick={prevStep} className="btn-secondary">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Quay lại
              </button>
            )}
            <Link href="/students" className="btn-secondary">
              Hủy
            </Link>
          </div>
          <button
            onClick={step === 4 ? handleSubmit : nextStep}
            className={`btn-primary ${step === 4 ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            disabled={(step === 1 && !form.fullName) || isPending}
          >
            {isPending ? (
              <>Đang xử lý...</>
            ) : step === 4 ? (
              <>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Hoàn tất
              </>
            ) : (
              <>
                Tiếp tục
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
