'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addStudent } from '../actions';
import { REGISTRATION_TYPES } from '@/lib/constants';

interface NewStudentClientProps {
  parents: any[];
  classes: any[];
  courses: { id: string; name: string; program: string; level: string; tuition_fee: number; duration_months: number; sessions_count: number }[];
}

export default function NewStudentClient({ parents, classes, courses }: NewStudentClientProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', englishName: '', dateOfBirth: '', gender: '',
    parentName: '', parentRelationship: 'Mẹ', parentPhone: '', address: '',
    courseId: '', classId: '', parentId: '', registrationType: '', totalSessions: '',
  });

  const STEPS = [
    { id: 1, label: 'Thông tin cá nhân', icon: 'person' },
    { id: 2, label: 'Thông tin phụ huynh', icon: 'family_restroom' },
    { id: 3, label: 'Đăng ký khóa học', icon: 'class' },
    { id: 4, label: 'Xác nhận', icon: 'check_circle' },
  ];

  const selectedClass = classes.find((c) => c.id === form.classId);

  const selectedCourse = courses.find((c) => c.id === form.courseId);
  const filteredClasses = selectedCourse 
    ? classes.filter(c => c.program === selectedCourse.program) 
    : [];
    
  // Group courses by program for display
  const coursesByProgram = courses.reduce((acc, course) => {
    if (!acc[course.program]) {
      acc[course.program] = {
        category: course.program,
        icon: course.program.includes('Mầm non') ? 'child_care' : 
              course.program.includes('Tiểu học') ? 'school' : 
              course.program.includes('Trung học') ? 'menu_book' : 
              course.program.includes('IELTS') ? 'workspace_premium' : 'class',
        courses: []
      };
    }
    acc[course.program].courses.push(course);
    return acc;
  }, {} as Record<string, any>);
  
  const groupedCoursesArray = Object.values(coursesByProgram);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('englishName', form.englishName);
    formData.append('dateOfBirth', form.dateOfBirth);
    formData.append('gender', form.gender);
    formData.append('address', form.address);
    formData.append('parentName', form.parentName);
    formData.append('parentRelationship', form.parentRelationship);
    formData.append('parentPhone', form.parentPhone);
    formData.append('courseId', form.courseId);
    if (form.classId) formData.append('classId', form.classId);
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
              <div>
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
                <label className="text-label-sm text-on-surface-variant mb-xs block">Tên Tiếng Anh</label>
                <input
                  value={form.englishName}
                  onChange={(e) => handleChange('englishName', e.target.value)}
                  placeholder="Alex Nguyen"
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
            {/* Mục 1: Đăng ký khóa học */}
            <h2 className="text-title-lg text-on-background mb-md">Đăng ký khóa học</h2>
            <p className="text-body-md text-on-surface-variant mb-lg">Chọn chương trình và cấp độ phù hợp</p>
            
            <div className="space-y-lg mb-xl">
              {groupedCoursesArray.map((programGroup: any) => (
                <div key={programGroup.category}>
                  <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">{programGroup.icon}</span>
                    {programGroup.category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
                    {programGroup.courses.map((course: any) => {
                      const isSelected = form.courseId === course.id;
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => handleChange('courseId', course.id)}
                          className={`text-left p-md rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-outline-variant/30 hover:border-primary/30 hover:bg-surface-container-low'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-xs">
                            <p className="text-body-md font-semibold text-on-background">{course.name}</p>
                            {isSelected && (
                              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                              </span>
                            )}
                          </div>
                          <p className="text-label-sm text-on-surface-variant">Học phí: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.tuition_fee)}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mục Chọn lớp học */}
            {form.courseId && (
              <div className="mb-xl animate-fade-in">
                <h2 className="text-title-lg text-on-background mb-md">Chọn lớp học</h2>
                <p className="text-body-md text-on-surface-variant mb-md">Chọn lớp thuộc chương trình {selectedCourse?.program}</p>
                {filteredClasses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    {filteredClasses.map((cls) => {
                      const isSelected = form.classId === cls.id;
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => handleChange('classId', cls.id)}
                          className={`text-left p-md rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-outline-variant/30 hover:border-primary/30 hover:bg-surface-container-low'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-xs">
                            <p className="text-body-md font-semibold text-on-background">{cls.name}</p>
                            {isSelected && (
                              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                              </span>
                            )}
                          </div>
                          <p className="text-label-sm text-on-surface-variant">Mã lớp: {cls.code}</p>
                          {cls.capacity && <p className="text-label-sm text-on-surface-variant">Sĩ số: {cls.capacity}</p>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-body-md text-on-surface-variant italic p-md bg-surface-container-low rounded-xl">
                    Chưa có lớp nào đang mở cho chương trình này.
                  </p>
                )}
              </div>
            )}

            {/* Mục 2: Hình thức đăng ký */}
            <h2 className="text-title-lg text-on-background mb-md">Hình thức đăng ký</h2>
            <p className="text-body-md text-on-surface-variant mb-md">Chọn hình thức đóng học phí</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
              {REGISTRATION_TYPES.map((type) => {
                const isSelected = form.registrationType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('registrationType', type.value)}
                    className={`text-center p-md rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-outline-variant/30 hover:border-primary/30 hover:bg-surface-container-low'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[24px] mb-xs ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {type.icon}
                    </span>
                    <p className={`text-body-md font-semibold ${isSelected ? 'text-primary' : 'text-on-background'}`}>{type.label}</p>
                    <p className="text-label-sm text-on-surface-variant mt-xs">{type.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Mục 3: Số buổi học */}
            <div className="mt-xl p-lg bg-surface-container-low rounded-2xl border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">event_repeat</span>
                  </div>
                  <div>
                    <p className="text-body-md font-semibold text-on-background">Tổng số buổi học</p>
                    <p className="text-label-sm text-on-surface-variant">Nhập số buổi cho khóa học đã chọn</p>
                  </div>
                </div>
                <div className="w-[120px]">
                  <input
                    type="number"
                    min="1"
                    value={form.totalSessions}
                    onChange={(e) => handleChange('totalSessions', e.target.value)}
                    placeholder="VD: 24"
                    className="input-field text-center text-body-lg font-semibold"
                  />
                </div>
              </div>
            </div>
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
                { label: 'Tên Tiếng Anh', value: form.englishName || '(chưa điền)' },
                { label: 'Ngày sinh', value: form.dateOfBirth || '(chưa điền)' },
                { label: 'Giới tính', value: form.gender || '(chưa điền)' },
                { label: 'Phụ huynh', value: form.parentName || '(chưa điền)' },
                { label: 'Khóa học', value: form.courseId || '(chưa chọn)' },
                { label: 'Lớp học', value: selectedClass ? `${selectedClass.name} (${selectedClass.code})` : '(chưa chọn)' },
                { label: 'Ngày bắt đầu', value: selectedClass?.start_date ? new Date(selectedClass.start_date).toLocaleDateString('vi-VN') : '(chưa có)' },
                { label: 'Ngày kết thúc', value: selectedClass?.end_date ? new Date(selectedClass.end_date).toLocaleDateString('vi-VN') : '(chưa có)' },
                { label: 'Hình thức', value: REGISTRATION_TYPES.find(t => t.value === form.registrationType)?.label || '(chưa chọn)' },
                { label: 'Số buổi học', value: form.totalSessions || '(chưa điền)' },
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
