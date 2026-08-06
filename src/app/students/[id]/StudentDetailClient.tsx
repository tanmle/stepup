'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { deleteStudent, enrollStudent } from '../actions';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: 'grid_view' },
  { id: 'courses', label: 'Khóa học & Điểm danh', icon: 'class' },
  { id: 'payments', label: 'Lịch sử thanh toán', icon: 'receipt_long' },
  { id: 'notes', label: 'Ghi chú', icon: 'note_alt' },
];

interface StudentDetailClientProps {
  student: any;
  availableClasses?: any[];
}

export default function StudentDetailClient({ student, availableClasses = [] }: StudentDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteStudent(student.id);
        router.push('/students');
      } catch (e) {
        alert('Có lỗi xảy ra khi xóa');
      }
    });
  };

  if (!student) return null;

  const primaryCourse = student.enrolledCourses?.[0];

  return (
    <>
      <div className="flex flex-col gap-md pb-xl animate-fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/students" className="hover:text-primary transition-colors">Quản lý học viên</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium">{student.fullName}</span>
        </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-md">
        {/* Left Sidebar Profile Card */}
        <div className="flex flex-col gap-md">
          {/* Profile */}
          <div className="card p-lg flex flex-col items-center text-center">
            <div className="relative mb-md">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold ${student.avatarColor}`}>
                {student.avatarInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-surface" />
            </div>
            <h1 className="text-title-lg text-on-background mb-xs">{student.fullName}</h1>
            <span className="font-mono text-label-sm bg-primary/10 text-primary px-sm py-xs rounded-md mb-sm">
              {student.code}
            </span>
            <StatusBadge status={student.status} size="md" />

            {/* Contact Info */}
            <div className="w-full mt-lg space-y-sm text-left">
              {[
                { icon: 'cake', label: 'Ngày sinh', value: student.dateOfBirth },
                { icon: 'phone', label: 'Điện thoại', value: student.phone },
                { icon: 'email', label: 'Email', value: student.email },
                { icon: 'location_on', label: 'Địa chỉ', value: student.address },
              ].map((info) => (
                <div key={info.label} className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px] mt-0.5">{info.icon}</span>
                  <div>
                    <p className="text-label-sm text-on-surface-variant">{info.label}</p>
                    <p className="text-body-md text-on-surface">{info.value || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="w-full mt-lg flex gap-sm">
              <Link href={`/students/${student.id}/edit`} className="flex-1 btn-secondary justify-center text-[13px]">
                <span className="material-symbols-outlined text-[15px]">edit</span>
                Chỉnh sửa
              </Link>
              <button className="flex-1 btn-primary justify-center text-[13px]">
                <span className="material-symbols-outlined text-[15px]">payments</span>
                Thu học phí
              </button>
            </div>
          </div>

          {/* Parent Info */}
          {student.parents?.length > 0 && (
            <div className="card p-lg">
              <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">Thông tin phụ huynh</h3>
              {student.parents.map((parent: any, i: number) => (
                <div key={i} className={i > 0 ? 'mt-md pt-md border-t border-outline-variant/20' : ''}>
                  <div className="flex items-center justify-between mb-xs">
                    <p className="text-body-md font-semibold text-on-background">{parent.fullName}</p>
                    <span className="text-label-sm bg-surface-container px-sm py-xs rounded-md text-on-surface-variant">
                      {parent.relationship}
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface-variant font-mono">{parent.phone}</p>
                  {parent.email && <p className="text-body-md text-on-surface-variant">{parent.email}</p>}
                  <div className="flex gap-xs mt-sm">
                    <button className="flex-1 flex items-center justify-center gap-xs py-xs text-label-sm text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[14px]">call</span>
                      Gọi điện
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-xs py-xs text-label-sm text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[14px]">sms</span>
                      Nhắn tin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="flex flex-col gap-md">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-md">
            {[
              { label: 'Lớp đang học', value: student.enrolledCourses?.filter((c: any) => c.status === 'Đang học').length || 0, icon: 'class', sub: primaryCourse?.className ?? 'Chưa có' },
              { label: 'Tỷ lệ đi học', value: `${student.attendanceRate}%`, icon: 'how_to_reg', sub: 'Chuyên cần', progress: student.attendanceRate },
              { label: 'Công nợ hiện tại', value: student.currentDebt > 0 ? `${(student.currentDebt / 1000).toFixed(0)}K` : '0đ', icon: 'payments', sub: student.currentDebt > 0 ? 'Cần thanh toán' : 'Đã đóng đủ', isError: student.currentDebt > 0 },
            ].map((stat) => (
              <div key={stat.label} className={`card p-md ${stat.isError ? 'border border-error/20' : ''}`}>
                <div className="flex items-center gap-sm mb-sm">
                  <span className={`material-symbols-outlined text-[18px] ${stat.isError ? 'text-error' : 'text-primary'}`}>
                    {stat.icon}
                  </span>
                  <span className="text-label-sm text-on-surface-variant">{stat.label}</span>
                </div>
                <p className={`text-[24px] font-bold leading-tight ${stat.isError ? 'text-error' : 'text-on-background'}`}>
                  {stat.value}
                </p>
                <p className="text-label-sm text-on-surface-variant mt-xs">{stat.sub}</p>
                {stat.progress !== undefined && (
                  <div className="progress-bar mt-sm">
                    <div className="progress-bar-fill bg-emerald-500" style={{ width: `${stat.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="card overflow-hidden">
            {/* Tab Header */}
            <div className="flex border-b border-outline-variant/20 px-lg overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn flex items-center gap-xs mr-lg whitespace-nowrap ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                  {tab.id === 'notes' && student.notes?.length > 0 && (
                    <span className="ml-xs w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">
                      {student.notes.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-lg">
              {activeTab === 'overview' && (
                <div className="space-y-lg">
                  <div>
                    <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">
                      Thông tin cá nhân
                    </h3>
                    <div className="grid grid-cols-2 gap-md">
                      {[
                        { label: 'Họ và tên', value: student.fullName },
                        { label: 'Giới tính', value: student.gender },
                        { label: 'Ngày sinh', value: student.dateOfBirth },
                        { label: 'Số điện thoại', value: student.phone },
                        { label: 'Email', value: student.email },
                        { label: 'Địa chỉ', value: student.address },
                      ].map((field) => (
                        <div key={field.label} className="bg-surface-container-low rounded-xl p-md">
                          <p className="text-label-sm text-on-surface-variant">{field.label}</p>
                          <p className="text-body-md text-on-surface font-medium mt-xs">{field.value || 'Chưa cập nhật'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div>
                  <div className="flex items-center justify-between mb-md">
                    <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Khóa học đã đăng ký
                    </h3>
                    <button 
                      onClick={() => setShowEnrollModal(true)}
                      className="btn-primary py-1 px-3 text-label-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Đăng ký lớp mới
                    </button>
                  </div>
                  {student.enrolledCourses?.length === 0 ? (
                    <p className="text-body-md text-on-surface-variant text-center py-xl bg-surface-container-low rounded-xl border border-dashed border-outline-variant">Chưa đăng ký khóa học nào</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-outline-variant/20">
                            {['Tên lớp', 'Giáo viên', 'Tiến độ', 'Chuyên cần', 'Trạng thái'].map((h) => (
                              <th key={h} className="text-left text-label-sm text-on-surface-variant py-sm px-md uppercase tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {student.enrolledCourses?.map((course: any) => (
                            <tr key={course.classCode} className="group hover:bg-primary/[0.02]">
                              <td className="py-md px-md">
                                <p className="font-mono text-label-sm text-primary">{course.classCode}</p>
                                <p className="text-body-md text-on-surface">{course.className}</p>
                                <p className="text-label-sm text-on-surface-variant">{course.schedule}</p>
                              </td>
                              <td className="py-md px-md text-body-md text-on-surface">{course.teacher}</td>
                              <td className="py-md px-md">
                                <p className="text-body-md text-on-surface">{course.sessionsCompleted}/{course.sessionsTotal} buổi</p>
                                <div className="progress-bar mt-xs w-24">
                                  <div
                                    className="progress-bar-fill bg-primary"
                                    style={{ width: `${(course.sessionsCompleted / course.sessionsTotal) * 100}%` }}
                                  />
                                </div>
                              </td>
                              <td className="py-md px-md">
                                <span className="text-body-md font-semibold text-emerald-600">{course.attendanceRate}%</span>
                              </td>
                              <td className="py-md px-md">
                                <StatusBadge status={course.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div>
                  <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">
                    Lịch sử giao dịch
                  </h3>
                  {student.payments?.length === 0 ? (
                    <p className="text-body-md text-on-surface-variant text-center py-xl">Chưa có giao dịch nào</p>
                  ) : (
                    <div className="space-y-sm">
                      {student.payments?.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between p-md bg-surface-container-low rounded-xl">
                          <div className="flex items-center gap-md">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px]">receipt</span>
                            </div>
                            <div>
                              <p className="text-body-md font-medium text-on-background">{p.method}</p>
                              <p className="text-label-sm text-on-surface-variant">{p.date}{p.note ? ` • ${p.note}` : ''}</p>
                            </div>
                          </div>
                          <span className="text-body-md font-semibold text-emerald-600">
                            +{p.amount.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <div className="flex items-center justify-between mb-md">
                    <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider">Ghi chú</h3>
                    <button className="btn-secondary text-[12px] px-sm py-xs">
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Thêm ghi chú
                    </button>
                  </div>
                  {student.notes?.length === 0 ? (
                    <p className="text-body-md text-on-surface-variant text-center py-xl">Chưa có ghi chú nào</p>
                  ) : (
                    <div className="space-y-md">
                      {student.notes?.map((note: any) => (
                        <div key={note.id} className="flex gap-md">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-[14px]">person</span>
                            </div>
                            <div className="flex-1 w-px bg-outline-variant/30 mt-sm" />
                          </div>
                          <div className="flex-1 bg-surface-container-low rounded-xl p-md mb-md">
                            <div className="flex items-center justify-between mb-sm">
                              <p className="text-body-md font-semibold text-on-background">{note.author}</p>
                              <p className="text-label-sm text-on-surface-variant">{note.date}</p>
                            </div>
                            <p className="text-body-md text-on-surface">{note.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="absolute inset-0 bg-scrim/30 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="card w-[384px] max-w-[90vw] p-lg relative animate-slide-up">
            <h3 className="text-title-lg text-on-background mb-xs">Xác nhận xóa</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              Bạn có chắc chắn muốn xóa học viên <span className="font-semibold text-on-surface">{student.fullName}</span>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-sm">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="btn-primary !bg-error hover:!bg-error/90"
              >
                {isPending ? 'Đang xóa...' : 'Xóa học viên'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="absolute inset-0 bg-scrim/30 backdrop-blur-sm" onClick={() => !isPending && setShowEnrollModal(false)} />
          <div className="card w-[448px] max-w-[90vw] p-lg relative animate-slide-up">
            <h3 className="text-title-lg text-on-background mb-xs">Đăng ký lớp học mới</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">Chọn lớp học để ghi danh cho học viên.</p>
            
            <div className="mb-lg">
              <label className="text-label-sm text-on-surface-variant mb-xs block">Lớp học</label>
              <select 
                value={selectedClassId} 
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="input-field w-full"
                disabled={isPending}
              >
                <option value="">-- Chọn lớp học --</option>
                {availableClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} (Mã: {cls.code}) - {cls.price ? `${cls.price.toLocaleString('vi-VN')} đ` : 'Chưa có giá'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-sm">
              <button
                onClick={() => setShowEnrollModal(false)}
                disabled={isPending}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!selectedClassId) return alert('Vui lòng chọn lớp học');
                  startTransition(async () => {
                    try {
                      await enrollStudent(student.id, selectedClassId);
                      setShowEnrollModal(false);
                      setSelectedClassId('');
                    } catch (e: any) {
                      alert(e.message);
                    }
                  });
                }}
                disabled={isPending || !selectedClassId}
                className="btn-primary"
              >
                {isPending ? 'Đang xử lý...' : 'Đăng ký ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
