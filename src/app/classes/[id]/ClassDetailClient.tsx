'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addClassSession, updateClassSession, deleteClassSession, enrollStudentInClass, updateEnrollment, removeStudentFromClass } from '../actions';
import StatusBadge from '@/components/ui/StatusBadge';
import { createPortal } from 'react-dom';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { formatVND } from '@/utils/format';
import { collectTuition } from '@/app/tuition/actions';

interface ClassDetailClientProps {
  cls: any;
  enrollments: any[];
  sessions: any[];
  rooms: any[];
  students: any[];
  settings: any;
}

export default function ClassDetailClient({ cls, enrollments, sessions, rooms, students, settings }: ClassDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule'>('overview');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Tuition Collection State
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDiscount, setPayDiscount] = useState('');
  const [payRefund, setPayRefund] = useState('');
  const [payMethod, setPayMethod] = useState('Chuyển khoản');
  const [payNote, setPayNote] = useState('');

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    
    const formData = new FormData();
    formData.append('id', selectedRecord.id);
    formData.append('amount', payAmount);
    formData.append('discount', payDiscount);
    formData.append('refund', payRefund);
    formData.append('method', payMethod);
    formData.append('note', payNote);

    startTransition(async () => {
      try {
        await collectTuition(formData);
        
        const amt = parseInt(payAmount) || 0;
        const disc = parseInt(payDiscount) || 0;
        const ref = parseInt(payRefund) || 0;
        const newAmountPaid = (selectedRecord.amountPaid || 0) + amt;
        const newDiscount = (selectedRecord.discount || 0) + disc;
        const newRefund = (selectedRecord.refund || 0) + ref;
        const newAmountOwed = Math.max(0, selectedRecord.totalTuition - newAmountPaid - newDiscount - newRefund);
        
        setSelectedRecord({
          ...selectedRecord,
          amountPaid: newAmountPaid,
          discount: newDiscount,
          refund: newRefund,
          amountOwed: newAmountOwed,
        });

        setCollectModalOpen(false);
        setReceiptModalOpen(true);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };
  const [paymentPlan, setPaymentPlan] = useState('1');
  const [discountPercent, setDiscountPercent] = useState('0');

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
    if (!confirm('Bạn có chắc chắn muốn xóa học viên này khỏi lớp?')) return;
    startTransition(async () => {
      try {
        await removeStudentFromClass(enrollmentId);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleOpenCollectModal = (enr: any) => {
    if (!enr.tuitions || enr.tuitions.length === 0) return;
    const unpaidRecords = enr.tuitions.filter((t: any) => t.amount_owed > 0).sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    if (unpaidRecords.length === 0) return;
    const record = unpaidRecords[0]; 
    
    setSelectedRecord({
      id: record.id,
      student: { fullName: enr.students?.full_name, code: enr.students?.code },
      className: cls.name,
      amountOwed: record.amount_owed,
      totalTuition: record.total_tuition,
      amountPaid: record.amount_paid,
      discount: record.discount,
      refund: record.refund,
      dueDate: record.due_date
    });
    setPayAmount(record.amount_owed.toString());
    setPayDiscount('0');
    setPayRefund('0');
    setPayNote('');
    setCollectModalOpen(true);
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
                        {(() => {
                          const hasTuitions = enr.tuitions && enr.tuitions.length > 0;
                          
                          let registeredMonths = 1;
                          if (enr.start_date && enr.end_date) {
                            const s = new Date(enr.start_date);
                            const e = new Date(enr.end_date);
                            registeredMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
                          }
                          if (registeredMonths < 1) registeredMonths = 1;
                          
                          let monthlyFee = courseFee;
                          let monthlyDiscount = 0;
                          if (hasTuitions) {
                            monthlyFee = enr.tuitions[0].total_tuition || courseFee;
                            monthlyDiscount = enr.tuitions[0].discount || 0;
                          }
                          
                          const totalExpected = (monthlyFee - monthlyDiscount) * registeredMonths;
                          const totalPaid = (enr.tuitions || []).reduce((sum: number, t: any) => sum + (t.amount_paid || 0), 0);
                          const currentDebt = (enr.tuitions || []).reduce((sum: number, t: any) => sum + (t.amount_owed || 0), 0);

                          return hasTuitions ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-xs">
                                <span className="text-body-md font-medium text-on-surface">
                                  {new Intl.NumberFormat('vi-VN').format(totalPaid)}đ
                                </span>
                                <span className="text-body-sm text-on-surface-variant">
                                  / {new Intl.NumberFormat('vi-VN').format(totalExpected)}đ
                                </span>
                              </div>
                              <div className="flex items-center gap-xs mt-0.5">
                                <span className="text-[11px] px-1.5 py-0.5 bg-surface-container-high rounded text-on-surface-variant">
                                  ĐK {registeredMonths === courseDuration ? 'toàn khóa' : `${registeredMonths} tháng`}
                                </span>
                                {currentDebt > 0 && (
                                  <span className="text-[11px] font-medium text-amber-600">
                                    Nợ: {new Intl.NumberFormat('vi-VN').format(currentDebt)}đ
                                  </span>
                                )}
                                {(() => {
                                  const upcoming = enr.tuitions.find((t: any) => t.status === 'Sắp đến hạn' && t.due_date);
                                  const overdue = enr.tuitions.find((t: any) => t.status === 'Quá hạn');
                                  
                                  if (overdue) {
                                    return <span className="text-[11px] font-medium text-error px-1.5 py-0.5 bg-error/10 rounded">Quá hạn</span>;
                                  }
                                  
                                  if (upcoming) {
                                    const due = new Date(upcoming.due_date);
                                    due.setHours(0, 0, 0, 0);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                      <span className="text-[11px] font-medium text-amber-600 px-1.5 py-0.5 bg-amber-50 rounded">
                                        Sắp đến hạn ({diff} ngày)
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-body-md text-on-surface-variant">—</span>
                          );
                        })()}
                      </td>
                      <td className="px-md py-md">
                        <StatusBadge status={enr.status} />
                      </td>
                      <td className="px-md py-md text-right">
                        <div className="flex items-center justify-end gap-xs">
                          {(() => {
                            const currentDebt = (enr.tuitions || []).reduce((sum: number, t: any) => sum + (t.amount_owed || 0), 0);
                            return (
                              <button 
                                onClick={() => handleOpenCollectModal(enr)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentDebt > 0 ? 'hover:bg-emerald-50 text-emerald-600' : 'text-on-surface-variant opacity-50 cursor-not-allowed'}`}
                                title="Thu học phí"
                                disabled={currentDebt <= 0}
                              >
                                <span className="material-symbols-outlined text-[18px]">add_card</span>
                              </button>
                            );
                          })()}
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
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Số tháng đăng ký học</label>
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
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Chiết khấu (%) cho mỗi tháng</label>
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
                  <span>Giá gốc lớp học (1 tháng):</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee)}</span>
                </div>
                {parseInt(discountPercent) > 0 && (
                  <div className="flex justify-between text-body-sm text-emerald-600">
                    <span>Chiết khấu ({discountPercent}%):</span>
                    <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * parseInt(discountPercent) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between text-label-md font-bold text-on-background pt-xs border-t border-outline-variant/10">
                  <span>Học phí mỗi tháng:</span>
                  <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (1 - (parseInt(discountPercent) || 0) / 100))}</span>
                </div>
                <div className="flex justify-between text-label-sm font-medium text-on-surface-variant pt-xs border-t border-outline-variant/10 mt-xs">
                  <span>Tổng tiền cho cả khóa đăng ký ({paymentPlan === 'full' ? courseDuration : parseInt(paymentPlan)} tháng):</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (paymentPlan === 'full' ? courseDuration : parseInt(paymentPlan)) * (1 - (parseInt(discountPercent) || 0) / 100))}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant italic mt-sm">Học phí sẽ được thu tự động 1 tháng 1 lần. Thời gian kết thúc học được tính dựa trên số tháng đã chọn.</p>
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
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Số tháng đăng ký học</label>
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
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Chiết khấu (%) cho mỗi tháng</label>
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
                    <span>Giá gốc lớp học (1 tháng):</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee)}</span>
                  </div>
                  {parseInt(editDiscountPercent) > 0 && (
                    <div className="flex justify-between text-body-sm text-emerald-600">
                      <span>Chiết khấu ({editDiscountPercent}%):</span>
                      <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * parseInt(editDiscountPercent) / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-label-md font-bold text-on-background pt-xs border-t border-outline-variant/10">
                    <span>Học phí mỗi tháng:</span>
                    <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (1 - (parseInt(editDiscountPercent) || 0) / 100))}</span>
                  </div>
                  <div className="flex justify-between text-label-sm font-medium text-on-surface-variant pt-xs border-t border-outline-variant/10 mt-xs">
                    <span>Tổng tiền cho cả khóa đăng ký ({editPaymentPlan === 'full' ? courseDuration : parseInt(editPaymentPlan)} tháng):</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseFee * (editPaymentPlan === 'full' ? courseDuration : parseInt(editPaymentPlan)) * (1 - (parseInt(editDiscountPercent) || 0) / 100))}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant italic mt-sm">Học phí sẽ được thu tự động 1 tháng 1 lần. Thời gian kết thúc học được tính dựa trên số tháng đã chọn.</p>
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
      {/* Collect Modal */}
      {collectModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-[450px] flex flex-col max-h-[90vh] overflow-hidden text-gray-800">
            <div className="p-md border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Thu Học Phí</h2>
              <button type="button" onClick={() => setCollectModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCollect} className="p-md flex flex-col gap-md overflow-y-auto">
              <div>
                <p className="text-label-sm text-on-surface-variant mb-1">Học viên</p>
                <p className="text-body-lg font-medium">{selectedRecord.student.fullName}</p>
                <p className="text-label-sm text-on-surface-variant">Lớp: {selectedRecord.className}</p>
              </div>
              
              <div className="bg-primary/5 p-sm rounded-lg flex justify-between">
                <span className="text-on-surface-variant">Còn nợ đợt này:</span>
                <span className="font-bold text-primary">{formatVND(selectedRecord.amountOwed)}</span>
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Số tiền thu</label>
                <CurrencyInput 
                  className="w-full"
                  value={payAmount}
                  onChange={setPayAmount}
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Chiết khấu (giảm trừ)</label>
                  <CurrencyInput 
                    className="w-full"
                    value={payDiscount}
                    onChange={setPayDiscount}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Hoàn học phí</label>
                  <CurrencyInput 
                    className="w-full"
                    value={payRefund}
                    onChange={setPayRefund}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Phương thức</label>
                <select 
                  className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                </select>
              </div>

              {payMethod === 'Chuyển khoản' && (
                <div className="flex flex-col items-center bg-gray-50 border rounded-lg p-sm mt-xs text-center">
                  {settings?.bank_name && settings?.bank_account ? (
                    <>
                      <p className="text-xs text-gray-500 mb-2">Quét mã QR để thanh toán</p>
                      <img 
                        src={`https://img.vietqr.io/image/${settings.bank_name === 'MBBank' ? 'MB' : settings.bank_name}-${settings.bank_account}-compact2.png?amount=${payAmount ? parseInt(payAmount.replace(/\D/g,'')) : 0}&addInfo=Thu hoc phi ${selectedRecord.student.code} ${selectedRecord.className}&accountName=${settings.bank_owner || ''}`}
                        alt="QR Code"
                        className="w-40 h-40 object-contain bg-white rounded-md p-1 border shadow-sm"
                      />
                      <div className="mt-2 text-center text-xs space-y-1">
                        <p>NH: <span className="font-semibold">{settings.bank_name}</span></p>
                        <p>STK: <span className="font-semibold">{settings.bank_account}</span></p>
                        <p>CTK: <span className="font-semibold uppercase">{settings.bank_owner}</span></p>
                      </div>
                    </>
                  ) : (
                    <div className="p-sm py-md text-on-surface-variant flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-[32px] text-amber-500">warning</span>
                      <p className="text-sm">Chưa có thông tin tài khoản ngân hàng của Trung tâm.</p>
                      <p className="text-xs">Vui lòng vào mục <span className="font-semibold">Cài đặt</span> để cập nhật thông tin chuyển khoản.</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Ghi chú</label>
                <input 
                  type="text" 
                  className="w-full px-md py-sm bg-surface-container hover:bg-surface-container-high focus:bg-surface transition-colors rounded-xl outline-none text-body-md text-on-surface border border-transparent focus:border-primary/50"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Nhập ghi chú (không bắt buộc)"
                />
              </div>

              <div className="flex justify-end gap-sm mt-sm">
                <button type="button" className="btn-secondary" onClick={() => setCollectModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={isPending}>
                  {isPending ? 'Đang xử lý...' : 'Xác nhận thu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-[450px] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-md border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Biên Lai Thu Tiền</h2>
              <button onClick={() => setReceiptModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-xl flex flex-col gap-md overflow-y-auto bg-white text-black flex-1 min-h-0">
              <div className="text-center border-b border-dashed border-gray-300 pb-md mb-md">
                <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">STEPUP ENGLISH</h1>
                <h2 className="text-xl font-bold mt-md uppercase">Biên Lai Thu Học Phí</h2>
                <p className="text-xs text-gray-500 mt-1">Ngày in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}</p>
              </div>

              <div className="space-y-sm text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Học viên:</span>
                  <span className="font-semibold uppercase">{selectedRecord.student.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lớp học:</span>
                  <span className="font-semibold">{selectedRecord.className}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-gray-300 py-md my-xs space-y-sm text-sm">
                <div className="flex justify-between mb-sm">
                  <span className="text-on-surface-variant">Học phí:</span>
                  <span>{formatVND(selectedRecord.totalTuition)}</span>
                </div>
                <div className="flex justify-between mb-sm">
                  <span className="text-on-surface-variant">Đã thanh toán đợt này:</span>
                  <span>{formatVND(selectedRecord.amountPaid)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">CÒN NỢ:</span>
                <span className="font-bold text-red-600">{formatVND(selectedRecord.amountOwed)}</span>
              </div>
            </div>

            <div className="p-md border-t border-outline-variant/20 flex justify-end gap-sm bg-surface-container-low print:hidden flex-shrink-0">
              <button type="button" className="btn-secondary" onClick={() => setReceiptModalOpen(false)}>
                Đóng
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handlePrint}
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                In Biên Lai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Container injected into body */}
      {receiptModalOpen && selectedRecord && mounted && document.body && createPortal(
        <div id="print-root" className="hidden print:block w-full bg-white text-black p-8 max-w-2xl mx-auto">
          <div className="text-center border-b border-dashed border-gray-300 pb-md mb-md">
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">STEPUP ENGLISH</h1>
            <h2 className="text-xl font-bold mt-md uppercase">Biên Lai Thu Học Phí</h2>
            <p className="text-xs text-gray-500 mt-1">Ngày in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}</p>
          </div>
          <div className="space-y-sm text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Học viên:</span>
              <span className="font-semibold uppercase">{selectedRecord.student.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lớp học:</span>
              <span className="font-semibold">{selectedRecord.className}</span>
            </div>
          </div>
          <div className="border-t border-b border-dashed border-gray-300 py-md my-xs space-y-[2px]">
            <div className="flex justify-between text-[11px] mb-[2px]">
              <span className="text-gray-600">Học phí:</span>
              <span>{formatVND(selectedRecord.totalTuition)}</span>
            </div>
            <div className="flex justify-between text-[11px] mb-[2px]">
              <span className="text-gray-600">Đã thanh toán:</span>
              <span>{formatVND(selectedRecord.amountPaid)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-lg mt-md">
            <span className="font-semibold">CÒN NỢ:</span>
            <span className="font-bold text-red-600">{formatVND(selectedRecord.amountOwed)}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
