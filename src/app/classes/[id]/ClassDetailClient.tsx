'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addClassSession, updateClassSession, deleteClassSession, enrollStudentInClass, updateEnrollment, removeStudentFromClass } from '../actions';
import StatusBadge from '@/components/ui/StatusBadge';

interface ClassDetailClientProps {
  cls: any;
  enrollments: any[];
  sessions: any[];
  rooms: any[];
  students: any[];
}

export default function ClassDetailClient({ cls, enrollments, sessions, rooms, students }: ClassDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule'>('overview');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('1');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [isPending, startTransition] = useTransition();
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<any>(null);
  const [editPaymentPlan, setEditPaymentPlan] = useState('1');
  const [editDiscountPercent, setEditDiscountPercent] = useState('0');

  const courseFee = cls.courses?.tuition_fee || 0;
  const courseDuration = cls.courses?.duration_months || 1;

  const handleAddOrUpdateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        let response;
        if (editingSession) {
          response = await updateClassSession(editingSession.id, cls.id, formData);
        } else {
          response = await addClassSession(cls.id, formData);
        }
        
        if (response && !response.success && response.error) {
          alert(response.error);
          return;
        }

        setEditingSession(null);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } catch (error: any) {
        console.error('Error saving session:', error);
        alert(error.message || 'Lưu buổi học thất bại.');
      }
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa buổi học này?')) return;
    
    startTransition(async () => {
      try {
        await deleteClassSession(sessionId, cls.id);
        router.refresh();
      } catch (error: any) {
        console.error('Error deleting session:', error);
        alert(error.message || 'Xóa buổi học thất bại.');
      }
    });
  };

  const handleUpdateEnrollment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const sd = formData.get('startDate') as string;
    const ed = formData.get('endDate') as string;
    const st = formData.get('status') as string;
    const plan = formData.get('paymentPlan') as string;
    const discount = formData.get('discountPercent') as string;

    startTransition(async () => {
      try {
        await updateEnrollment(
          editingEnrollment.id, 
          sd || null, 
          ed || null, 
          st || undefined,
          plan || undefined,
          discount ? parseInt(discount) : 0
        );
        setEditingEnrollment(null);
        setEditPaymentPlan('1');
        setEditDiscountPercent('0');
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học viên khỏi lớp? Các dữ liệu về điểm danh và học phí của học viên ở lớp này cũng có thể bị ảnh hưởng.')) return;
    
    startTransition(async () => {
      try {
        await removeStudentFromClass(enrollmentId);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    startTransition(async () => {
      try {
        const formData = new FormData(e.target as HTMLFormElement);
        const sd = formData.get('enrollStartDate') as string;
        await enrollStudentInClass(
          selectedStudentId, 
          cls.id, 
          sd || undefined,
          paymentPlan,
          parseInt(discountPercent) || 0
        );
        setIsEnrollModalOpen(false);
        setSelectedStudentId('');
        setPaymentPlan('1');
        setDiscountPercent('0');
        router.refresh();
      } catch (error: any) {
        console.error('Error enrolling student:', error);
        alert(error.message || 'Thêm học viên thất bại.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-sm mb-xs">
        <Link href="/classes" className="p-xs rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-sm">
              <h1 className="text-headline-lg text-on-background">{cls.name}</h1>
              <StatusBadge status={cls.status} />
            </div>
            <Link href={`/classes/${cls.id}/edit`} className="btn-secondary py-1.5 px-3 text-label-sm">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Chỉnh sửa
            </Link>
          </div>
          <div className="flex items-center gap-md mt-xs text-body-md text-on-surface-variant flex-wrap">
            <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">tag</span>{cls.code}</span>
            <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">menu_book</span>{cls.program}</span>
            <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">person</span>GV: {cls.teacher?.full_name || 'Chưa phân công'}</span>
            {cls.assistant?.full_name && (
              <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">supervisor_account</span>Trợ giảng: {cls.assistant.full_name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-lg py-sm text-label-lg transition-colors relative ${activeTab === 'overview' ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container/50'}`}
        >
          Tổng quan
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-lg py-sm text-label-lg transition-colors relative ${activeTab === 'schedule' ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container/50'}`}
        >
          Lịch học
          {activeTab === 'schedule' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="mt-sm">
        {activeTab === 'overview' && (
          <div className="card overflow-hidden">
            <div className="p-md border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="text-title-md text-on-background">Danh sách học viên ({enrollments.length}/{cls.capacity})</h2>
              <button 
                onClick={() => setIsEnrollModalOpen(true)}
                className="btn-primary py-1.5 px-3 text-label-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm học viên
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase">Mã HV</th>
                    <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase">Học viên</th>
                    <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase">Ngày bắt đầu - kết thúc</th>
                    <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase">Học phí</th>
                    <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase">Trạng thái</th>
                    <th className="px-md py-md text-right text-label-sm text-on-surface-variant uppercase w-20">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-surface-container/30">
                      <td className="px-md py-md text-body-md text-on-surface-variant font-mono">{enr.students?.code}</td>
                      <td className="px-md py-md">
                        <div className="flex items-center gap-sm">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold text-white ${enr.students?.avatar_color || 'bg-primary'}`}>
                            {enr.students?.avatar_initials}
                          </div>
                          <span className="font-semibold text-body-md text-on-background">{enr.students?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-md py-md text-body-md text-on-surface-variant">
                        {enr.start_date || enr.end_date ? (
                          <>
                            {enr.start_date ? new Date(enr.start_date).toLocaleDateString('vi-VN') : '--'} 
                            {' - '} 
                            {enr.end_date ? new Date(enr.end_date).toLocaleDateString('vi-VN') : '--'}
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-md py-md">
                        {enr.tuition ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-body-md font-medium text-on-surface">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(enr.tuition.total_tuition)}
                            </span>
                            <div className="flex items-center gap-xs">
                              <span className="text-[11px] px-1.5 py-0.5 bg-surface-container-high rounded text-on-surface-variant">
                                {courseFee > 0 && Math.round((enr.tuition.total_tuition || 0) / courseFee) === courseDuration 
                                  ? 'Đóng toàn khóa' 
                                  : `Đóng ${courseFee > 0 ? Math.round((enr.tuition.total_tuition || 0) / courseFee) : 1} tháng`}
                              </span>
                              <span className={`text-[11px] font-medium ${enr.tuition.amount_owed > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {enr.tuition.amount_owed > 0 
                                  ? `Còn nợ: ${new Intl.NumberFormat('vi-VN').format(enr.tuition.amount_owed)}đ` 
                                  : 'Đã thu đủ'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-body-md text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="px-md py-md">
                        <StatusBadge status={enr.status} />
                      </td>
                      <td className="px-md py-md text-right">
                        <div className="flex items-center justify-end gap-xs">
                          <button 
                            onClick={() => {
                              setEditingEnrollment(enr);
                              let plan = '1';
                              let discount = '0';
                              if (enr.tuition) {
                                if (courseFee > 0) {
                                  const months = Math.round((enr.tuition.total_tuition || 0) / courseFee);
                                  if (months === courseDuration) {
                                    plan = 'full';
                                  } else {
                                    plan = months.toString();
                                  }
                                }
                                if (enr.tuition.total_tuition && enr.tuition.total_tuition > 0) {
                                  if (enr.tuition.discount) {
                                    discount = Math.round((enr.tuition.discount / enr.tuition.total_tuition) * 100).toString();
                                  }
                                }
                              }
                              setEditPaymentPlan(plan);
                              setEditDiscountPercent(discount);
                            }}
                            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                            title="Sửa thông tin học viên"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleRemoveStudent(enr.id)}
                            className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center text-rose-500 transition-colors"
                            title="Xóa học viên khỏi lớp"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {enrollments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-md py-xl text-center text-on-surface-variant">
                        Chưa có học viên nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="flex flex-col lg:flex-row gap-md">
            {/* Lịch học */}
            <div className="card overflow-hidden flex-1">
              <div className="p-md border-b border-outline-variant/20 flex justify-between items-center">
                <h2 className="text-title-md text-on-background">Lịch học ({sessions.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase">Ngày</th>
                      <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase">Giờ học</th>
                      <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase">Phòng</th>
                      <th className="px-md py-md text-left text-label-sm text-on-surface-variant uppercase">Trạng thái</th>
                      <th className="px-md py-md text-right text-label-sm text-on-surface-variant uppercase w-20">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-surface-container/30">
                        <td className="px-md py-md font-medium text-body-md text-on-background">
                          {new Date(session.session_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-md py-md text-body-md text-on-surface-variant">
                          {session.start_time?.substring(0, 5)} - {session.end_time?.substring(0, 5)}
                        </td>
                        <td className="px-md py-md text-body-md text-on-surface-variant">
                          {session.room}
                        </td>
                        <td className="px-md py-md">
                          <StatusBadge 
                            status={
                              session.status === 'Chưa học' && new Date(`${session.session_date}T${session.start_time}`) <= new Date() 
                                ? 'Đang học' 
                                : session.status
                            } 
                          />
                        </td>
                        <td className="px-md py-md text-right">
                          <div className="flex items-center justify-end gap-sm">
                            <button 
                              onClick={() => setEditingSession(session)}
                              className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
                              title="Sửa"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteSession(session.id)}
                              className="w-8 h-8 rounded-full hover:bg-rose-50 flex items-center justify-center text-rose-500 transition-colors"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-md py-xl text-center text-on-surface-variant">
                          Chưa có lịch học nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form thêm/sửa buổi học */}
            <div className="card p-md lg:w-80 shrink-0 h-fit">
              <div className="flex justify-between items-center mb-sm">
                <h3 className="text-title-md text-on-background">
                  {editingSession ? 'Cập nhật buổi học' : 'Thêm buổi học'}
                </h3>
                {editingSession && (
                  <button 
                    onClick={() => setEditingSession(null)}
                    className="text-label-sm text-primary hover:underline"
                  >
                    Hủy
                  </button>
                )}
              </div>
              <form onSubmit={handleAddOrUpdateSession} className="flex flex-col gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm text-on-surface">Ngày học</label>
                  <input 
                    name="sessionDate" 
                    type="date" 
                    required 
                    defaultValue={editingSession ? new Date(editingSession.session_date).toISOString().split('T')[0] : ''}
                    className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50" 
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm text-on-surface">Giờ bắt đầu</label>
                  <input 
                    name="startTime" 
                    type="time" 
                    required 
                    defaultValue={editingSession ? editingSession.start_time?.substring(0, 5) : '18:00'}
                    className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50" 
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm text-on-surface">Giờ kết thúc</label>
                  <input 
                    name="endTime" 
                    type="time" 
                    required 
                    defaultValue={editingSession ? editingSession.end_time?.substring(0, 5) : '19:30'}
                    className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50" 
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm text-on-surface">Trạng thái</label>
                  <select
                    name="status"
                    defaultValue={editingSession ? editingSession.status : 'Chưa học'}
                    className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                  >
                    <option value="Chưa học">Chưa học</option>
                    <option value="Đang học">Đang học</option>
                    <option value="Đã học">Đã học</option>
                    <option value="Đã hủy">Đã hủy</option>
                    <option value="Học bù">Học bù</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm text-on-surface">Phòng học (Tùy chọn)</label>
                  <select 
                    name="room" 
                    required 
                    defaultValue={editingSession ? editingSession.room : ''}
                    className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50" 
                  >
                    <option value="">-- Chọn phòng học --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.name}>{r.name} (Sức chứa: {r.capacity})</option>
                    ))}
                    {/* Fallback for existing rooms not in DB */}
                    {editingSession && editingSession.room && !rooms.some(r => r.name === editingSession.room) && (
                      <option value={editingSession.room}>{editingSession.room} (Phòng cũ)</option>
                    )}
                  </select>
                </div>
                {editingSession && (
                  <div className="flex flex-col gap-xs">
                    <label className="text-label-sm text-on-surface">Trạng thái</label>
                    <select 
                      name="status"
                      defaultValue={editingSession.status}
                      className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50" 
                    >
                      <option value="Chưa học">Chưa học</option>
                      <option value="Đã học">Đã học</option>
                      <option value="Nghỉ/Bù">Nghỉ/Bù</option>
                    </select>
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="btn-primary mt-xs justify-center"
                >
                  {isPending ? 'Đang lưu...' : (editingSession ? 'Cập nhật' : 'Thêm buổi học')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card p-xl w-[500px] max-w-[90vw] shadow-elevation-3">
            <div className="flex justify-between items-center mb-lg border-b border-outline-variant/20 pb-md">
              <h2 className="text-title-lg font-semibold text-on-background">Thêm học viên vào lớp</h2>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEnrollStudent} className="space-y-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Chọn học viên</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                >
                  <option value="">-- Chọn học viên --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Hình thức đóng học phí</label>
                  <select
                    value={paymentPlan}
                    onChange={(e) => setPaymentPlan(e.target.value)}
                    className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                  >
                    <option value="1">1 tháng</option>
                    <option value="2">2 tháng</option>
                    <option value="3">3 tháng</option>
                    <option value="6">6 tháng</option>
                    <option value="full">Toàn khóa ({courseDuration} tháng)</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Chiết khấu (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                  />
                </div>
              </div>
              
              <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/20 space-y-xs">
                <div className="flex justify-between text-body-sm text-on-surface-variant">
                  <span>Giá gốc lớp học ({paymentPlan === 'full' ? courseDuration : paymentPlan} tháng):</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (paymentPlan === 'full' ? courseDuration : parseInt(paymentPlan)))}</span>
                </div>
                {parseInt(discountPercent) > 0 && (
                  <div className="flex justify-between text-body-sm text-emerald-600">
                    <span>Chiết khấu ({discountPercent}%):</span>
                    <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (paymentPlan === 'full' ? courseDuration : parseInt(paymentPlan)) * parseInt(discountPercent) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between text-label-md font-bold text-on-background pt-xs border-t border-outline-variant/10">
                  <span>Tổng phải thu đợt này:</span>
                  <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (paymentPlan === 'full' ? courseDuration : parseInt(paymentPlan)) * (1 - (parseInt(discountPercent) || 0) / 100))}</span>
                </div>
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Ngày bắt đầu học (không bắt buộc)</label>
                <input 
                  type="date"
                  name="enrollStartDate"
                  className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                />
              </div>
              <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
                <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={isPending || !selectedStudentId} className="btn-primary">
                  {isPending ? 'Đang thêm...' : 'Thêm vào lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Enrollment Modal */}
      {editingEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card p-xl w-[500px] max-w-[90vw] shadow-elevation-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-lg border-b border-outline-variant/20 pb-md sticky top-0 bg-surface z-10">
              <h2 className="text-title-lg font-semibold text-on-background">Sửa thông tin học viên</h2>
              <button onClick={() => setEditingEnrollment(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-body-md text-on-surface-variant mb-md">Học viên: <strong className="text-on-surface">{editingEnrollment.students?.full_name}</strong></p>
            <form onSubmit={handleUpdateEnrollment} className="space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Ngày bắt đầu</label>
                  <input 
                    type="date"
                    name="startDate"
                    defaultValue={editingEnrollment.start_date ? new Date(editingEnrollment.start_date).toISOString().split('T')[0] : ''}
                    className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Ngày kết thúc</label>
                  <input 
                    type="date"
                    name="endDate"
                    defaultValue={editingEnrollment.end_date ? new Date(editingEnrollment.end_date).toISOString().split('T')[0] : ''}
                    className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Trạng thái lớp</label>
                <select
                  name="status"
                  defaultValue={editingEnrollment.status || 'Đang học'}
                  className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                >
                  <option value="Đang học">Đang học</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                  <option value="Đã nghỉ">Nghỉ học (Đã nghỉ)</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                </select>
              </div>

              <div className="pt-md border-t border-outline-variant/20">
                <h3 className="text-label-lg font-medium mb-sm text-on-surface">Cập nhật học phí</h3>
                <p className="text-body-sm text-on-surface-variant mb-md">Lưu ý: Nếu cập nhật gói học phí, công nợ sẽ được tính toán lại dựa trên gói mới và số tiền đã nộp.</p>
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Hình thức đóng học phí</label>
                    <select
                      name="paymentPlan"
                      value={editPaymentPlan}
                      onChange={(e) => setEditPaymentPlan(e.target.value)}
                      className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                    >
                      <option value="1">1 tháng</option>
                      <option value="2">2 tháng</option>
                      <option value="3">3 tháng</option>
                      <option value="6">6 tháng</option>
                      <option value="full">Toàn khóa ({courseDuration} tháng)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Chiết khấu (%)</label>
                    <input 
                      type="number"
                      name="discountPercent"
                      min="0"
                      max="100"
                      value={editDiscountPercent}
                      onChange={(e) => setEditDiscountPercent(e.target.value)}
                      className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/20 space-y-xs mt-md">
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>Giá gốc lớp học ({editPaymentPlan === 'full' ? courseDuration : editPaymentPlan} tháng):</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (editPaymentPlan === 'full' ? courseDuration : parseInt(editPaymentPlan)))}</span>
                  </div>
                  {parseInt(editDiscountPercent) > 0 && (
                    <div className="flex justify-between text-body-sm text-emerald-600">
                      <span>Chiết khấu ({editDiscountPercent}%):</span>
                      <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (editPaymentPlan === 'full' ? courseDuration : parseInt(editPaymentPlan)) * parseInt(editDiscountPercent) / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-label-md font-bold text-on-background pt-xs border-t border-outline-variant/10">
                    <span>Tổng tiền học phí gói này:</span>
                    <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (editPaymentPlan === 'full' ? courseDuration : parseInt(editPaymentPlan)) * (1 - (parseInt(editDiscountPercent) || 0) / 100))}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
                <button type="button" onClick={() => setEditingEnrollment(null)} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={isPending} className="btn-primary">
                  {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
