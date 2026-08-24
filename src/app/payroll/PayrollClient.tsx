'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { addTeacherAttendance, deleteTeacherAttendance, generateSalaryRecord, generateAttendanceFromSessions, updateTeacherAttendance, markFixedSalaryDayOff, removeFixedSalaryDayOff } from './actions';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { formatVND } from '@/utils/format';

interface PayrollClientProps {
  teachers: any[];
  initialAttendance: any[];
  initialSalaries: any[];
}

export default function PayrollClient({ teachers, initialAttendance, initialSalaries }: PayrollClientProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'salary'>('attendance');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states for Attendance
  const [isAttModalOpen, setIsAttModalOpen] = useState(false);
  const [attDate, setAttDate] = useState('');
  const [attShifts, setAttShifts] = useState<any[]>([{ checkIn: '08:00', checkOut: '10:00', hours: 2 }]);
  const [attType, setAttType] = useState('Dạy học');
  const [attNotes, setAttNotes] = useState('');

  // Modal states for Salary
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryMonth, setSalaryMonth] = useState(currentDate.getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState(currentDate.getFullYear());
  const [salaryBonus, setSalaryBonus] = useState(0);
  const [salaryFine, setSalaryFine] = useState(0);
  const [salaryNotes, setSalaryNotes] = useState('');

  const [isPending, startTransition] = useTransition();
  const [autoGenResult, setAutoGenResult] = useState<string | null>(null);
  const [editingAtt, setEditingAtt] = useState<any | null>(null);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  const isHourly = selectedTeacher?.salary_type === 'hourly';
  const isFixed = selectedTeacher?.salary_type === 'fixed';

  const attendance = initialAttendance.filter(a => a.teacher_id === selectedTeacherId);
  const salaries = initialSalaries.filter(s => s.teacher_id === selectedTeacherId);

  // Fixed salary day-off modal
  const [isDayOffModalOpen, setIsDayOffModalOpen] = useState(false);
  const [dayOffDate, setDayOffDate] = useState('');
  const [dayOffType, setDayOffType] = useState<'Nghỉ phép' | 'Vắng mặt'>('Nghỉ phép');
  const [dayOffNote, setDayOffNote] = useState('');
  const [dayOffExisting, setDayOffExisting] = useState<any | null>(null);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // --- ATTENDANCE HANDLERS ---
  const openAttModal = (day: number) => {
    const d = new Date(year, month, day);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().split('T')[0];
    setAttDate(localISOTime);
    setAttShifts([{ checkIn: '08:00', checkOut: '10:00', hours: 2 }]);
    setAttType('Dạy học');
    setAttNotes('');
    setIsAttModalOpen(true);
  };

  const calculateHours = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return 0;
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    let diff = (outH + outM / 60) - (inH + inM / 60);
    return diff > 0 ? parseFloat(diff.toFixed(2)) : 0;
  };

  const handleShiftChange = (index: number, field: string, value: string) => {
    const newShifts = [...attShifts];
    newShifts[index][field] = value;
    if (field === 'checkIn' || field === 'checkOut') {
      newShifts[index].hours = calculateHours(newShifts[index].checkIn, newShifts[index].checkOut);
    }
    setAttShifts(newShifts);
  };

  const handleAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (isHourly) {
          for (const shift of attShifts) {
            const formData = new FormData();
            formData.append('teacherId', selectedTeacherId);
            formData.append('date', attDate);
            formData.append('checkIn', shift.checkIn);
            formData.append('checkOut', shift.checkOut);
            formData.append('hoursWorked', shift.hours.toString());
            formData.append('type', attType);
            formData.append('notes', attNotes);
            await addTeacherAttendance(formData);
          }
        } else {
          const formData = new FormData();
          formData.append('teacherId', selectedTeacherId);
          formData.append('date', attDate);
          formData.append('type', attType);
          formData.append('notes', attNotes);
          await addTeacherAttendance(formData);
        }
        setIsAttModalOpen(false);
      } catch (error) {
        alert('Lỗi thêm chấm công: ' + (error as Error).message);
      }
    });
  };

  const handleDeleteAttendance = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lượt chấm công này?')) return;
    startTransition(async () => {
      try {
        await deleteTeacherAttendance(id);
      } catch (error) {
        alert('Lỗi xóa chấm công: ' + (error as Error).message);
      }
    });
  };

  // --- FIXED SALARY DAY-OFF HANDLERS ---
  const openDayOffModal = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existing = attendance.find(a => a.date?.startsWith(dateStr) && (a.type === 'Nghỉ phép' || a.type === 'Vắng mặt'));
    setDayOffDate(dateStr);
    setDayOffExisting(existing || null);
    setDayOffType(existing?.type === 'Vắng mặt' ? 'Vắng mặt' : 'Nghỉ phép');
    setDayOffNote(existing?.note || '');
    setIsDayOffModalOpen(true);
  };

  const handleMarkDayOff = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await markFixedSalaryDayOff(selectedTeacherId, dayOffDate, dayOffType, dayOffNote);
        setIsDayOffModalOpen(false);
      } catch (error) {
        alert('Lỗi: ' + (error as Error).message);
      }
    });
  };

  const handleRemoveDayOff = () => {
    startTransition(async () => {
      try {
        await removeFixedSalaryDayOff(selectedTeacherId, dayOffDate);
        setIsDayOffModalOpen(false);
      } catch (error) {
        alert('Lỗi: ' + (error as Error).message);
      }
    });
  };

  // --- SALARY HANDLERS ---
  const handleGenerateSalary = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await generateSalaryRecord(selectedTeacherId, salaryMonth, salaryYear, salaryBonus, salaryFine, salaryNotes);
        setIsSalaryModalOpen(false);
      } catch (error) {
        alert('Lỗi tính lương: ' + (error as Error).message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-md pb-xl">
      <div>
        <h1 className="text-headline-lg text-on-background">Chấm công & Lương</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Quản lý chuyên cần và tính lương cho giáo viên</p>
      </div>

      <div className="flex gap-4 border-b border-outline-variant/20 mb-4">
        <button
          className={`pb-2 text-label-md font-medium transition-colors ${
            activeTab === 'attendance' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('attendance')}
        >
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            Chấm công
          </div>
        </button>
        <button
          className={`pb-2 text-label-md font-medium transition-colors ${
            activeTab === 'salary' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('salary')}
        >
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Tính lương
          </div>
        </button>
      </div>

      {/* Teacher Selector */}
      <div className="card p-md bg-surface-container-low flex flex-wrap gap-sm items-center justify-between">
        <div className="flex items-center gap-sm flex-1 min-w-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant">person_search</span>
          <select 
            className="input-field flex-1"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            <option value="">-- Chọn giáo viên --</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.full_name} ({t.code})</option>
            ))}
          </select>
        </div>
        
        {selectedTeacher && (
          <div className="text-body-sm text-on-surface-variant bg-surface-container py-1 px-3 rounded-lg border border-outline-variant/20 flex gap-4">
            <span>Loại lương: <strong className="text-on-surface">{isFixed ? 'Cố định' : isHourly ? 'Theo giờ' : 'Theo tiết/buổi'}</strong></span>
            <span>{isFixed ? 'Lương tháng' : 'Đơn giá'}: <strong className="text-on-surface">{formatVND(selectedTeacher.salary_rate)}</strong></span>
          </div>
        )}
      </div>

      {!selectedTeacherId ? (
        <div className="card p-xl flex flex-col items-center justify-center text-on-surface-variant py-20 text-center">
          <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">person_search</span>
          <p className="text-title-md font-medium text-on-background mb-1">Chưa chọn giáo viên</p>
          <p>Vui lòng chọn giáo viên ở trên để xem dữ liệu</p>
        </div>
      ) : activeTab === 'attendance' ? (
        /* ATTENDANCE TAB */
        <div className="card overflow-hidden">
          <div className="p-md border-b border-outline-variant/20 flex flex-wrap gap-2 justify-between items-center bg-surface-container-low">
            <h2 className="text-title-md text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Tháng {month + 1}/{year}
            </h2>
            <div className="flex gap-2">
              {!isFixed && (
                <button
                  onClick={() => {
                    setAutoGenResult(null);
                    startTransition(async () => {
                      try {
                        const result = await generateAttendanceFromSessions(selectedTeacherId, month + 1, year);
                        setAutoGenResult(result.message || (result.success ? `Đã sinh ${result.count} lượt chấm công` : result.error || 'Lỗi'));
                      } catch (err: any) {
                        setAutoGenResult('Lỗi: ' + err.message);
                      }
                    });
                  }}
                  disabled={isPending}
                  className="btn-primary py-1.5 px-3 text-label-sm flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                  {isPending ? 'Đang sinh...' : 'Sinh chấm công từ lịch dạy'}
                </button>
              )}
              <button onClick={prevMonth} className="btn-secondary py-1 px-2"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <button onClick={nextMonth} className="btn-secondary py-1 px-2"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>

          {autoGenResult && (
            <div className={`mx-md mt-sm p-sm rounded-xl text-body-sm ${autoGenResult.startsWith('Đã sinh') ? 'bg-emerald-50 text-emerald-700' : autoGenResult.includes('Lỗi') ? 'bg-error-container text-on-error-container' : 'bg-amber-50 text-amber-700'}`}>
              <span className="material-symbols-outlined text-[16px] mr-xs align-middle">
                {autoGenResult.startsWith('Đã sinh') ? 'check_circle' : autoGenResult.includes('Lỗi') ? 'error' : 'info'}
              </span>
              {autoGenResult}
            </div>
          )}

          {isFixed ? (
            /* FIXED SALARY CALENDAR */
            (() => {
              // Count actual Sundays
              let sundayCount = 0;
              for (let d = 1; d <= daysInMonth; d++) {
                if (new Date(year, month, d).getDay() === 0) sundayCount++;
              }
              const workingDays = daysInMonth - sundayCount;

              // Count days off from attendance
              const daysOffRecords = attendance.filter(a => {
                const aMonth = new Date(a.date).getMonth();
                const aYear = new Date(a.date).getFullYear();
                return aMonth === month && aYear === year && (a.type === 'Nghỉ phép' || a.type === 'Vắng mặt');
              });
              const totalDaysOff = daysOffRecords.length;
              const paidDaysOff = Math.min(totalDaysOff, 1);
              const unpaidDaysOff = Math.max(0, totalDaysOff - 1);

              return (
                <div className="p-md">
                  {/* Summary bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-sm mb-md">
                    <div className="bg-surface-container-low rounded-xl p-sm text-center border border-outline-variant/10">
                      <p className="text-label-sm text-on-surface-variant">Ngày làm việc</p>
                      <p className="text-title-lg font-bold text-on-background">{workingDays - totalDaysOff}/{workingDays}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-sm text-center border border-outline-variant/10">
                      <p className="text-label-sm text-on-surface-variant">Chủ nhật</p>
                      <p className="text-title-lg font-bold text-on-surface-variant">{sundayCount}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-sm text-center border border-emerald-200">
                      <p className="text-label-sm text-emerald-600">Nghỉ có lương</p>
                      <p className="text-title-lg font-bold text-emerald-700">{paidDaysOff}/1</p>
                    </div>
                    <div className="bg-error-container/30 rounded-xl p-sm text-center border border-error/20">
                      <p className="text-label-sm text-error">Nghỉ không lương</p>
                      <p className="text-title-lg font-bold text-error">{unpaidDaysOff}</p>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="border border-outline-variant/20 rounded-xl overflow-hidden bg-surface">
                    <div className="grid grid-cols-7 bg-surface-container-low border-b border-outline-variant/20">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                        <div key={d} className={`p-2 text-center text-label-sm font-semibold uppercase ${d === 'CN' ? 'text-error/60' : 'text-on-surface-variant'}`}>{d}</div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7">
                      {(() => {
                        // Build calendar starting from Monday
                        const calDays: (number | null)[] = [];
                        let firstDayMon = new Date(year, month, 1).getDay();
                        firstDayMon = firstDayMon === 0 ? 6 : firstDayMon - 1; // Convert: Mon=0, Sun=6
                        for (let i = 0; i < firstDayMon; i++) calDays.push(null);
                        for (let i = 1; i <= daysInMonth; i++) calDays.push(i);
                        
                        return calDays.map((day, idx) => {
                          if (!day) return <div key={`empty-${idx}`} className="min-h-[72px] md:min-h-[88px] border-r border-b border-outline-variant/10 bg-surface-container-lowest/30" />;
                          
                          const isSunday = new Date(year, month, day).getDay() === 0;
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const dayRecord = attendance.find((a: any) => a.date?.startsWith(dateStr) && (a.type === 'Nghỉ phép' || a.type === 'Vắng mặt'));
                          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                          const isFuture = new Date(year, month, day) > new Date();
                          
                          if (isSunday) {
                            return (
                              <div key={day} className="min-h-[72px] md:min-h-[88px] p-2 border-r border-b border-outline-variant/10 bg-surface-container-lowest/50 flex flex-col items-center justify-center opacity-40">
                                <span className="text-label-md text-on-surface-variant">{day}</span>
                                <span className="material-symbols-outlined text-[14px] text-on-surface-variant mt-0.5">lock</span>
                              </div>
                            );
                          }

                          const isDayOff = !!dayRecord;
                          const dayOffType = dayRecord?.type;

                          return (
                            <div 
                              key={day}
                              onClick={() => openDayOffModal(day)}
                              className={`min-h-[72px] md:min-h-[88px] p-2 border-r border-b border-outline-variant/10 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group ${
                                isToday ? 'ring-2 ring-primary ring-inset' : ''
                              } ${
                                isDayOff 
                                  ? (dayOffType === 'Vắng mặt' ? 'bg-error/5 hover:bg-error/10' : 'bg-amber-50 hover:bg-amber-100')
                                  : (isFuture ? 'bg-surface hover:bg-surface-container-lowest' : 'bg-emerald-50/50 hover:bg-emerald-50')
                              }`}
                            >
                              <span className={`text-label-md font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                                isToday ? 'bg-primary text-on-primary' : 'text-on-surface'
                              }`}>
                                {day}
                              </span>
                              {isDayOff ? (
                                <div className="flex flex-col items-center">
                                  <span className={`material-symbols-outlined text-[18px] ${dayOffType === 'Vắng mặt' ? 'text-error' : 'text-amber-600'}`}>
                                    {dayOffType === 'Vắng mặt' ? 'cancel' : 'beach_access'}
                                  </span>
                                  <span className={`text-[9px] md:text-[10px] font-medium mt-0.5 ${dayOffType === 'Vắng mặt' ? 'text-error' : 'text-amber-600'}`}>
                                    {dayOffType === 'Vắng mặt' ? 'Vắng' : 'Nghỉ phép'}
                                  </span>
                                </div>
                              ) : !isFuture ? (
                                <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                              ) : (
                                <span className="material-symbols-outlined text-[18px] text-on-surface-variant/30 transition-opacity">remove_circle_outline</span>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-md gap-y-xs mt-md text-label-sm text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span> Đi làm</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-amber-600">beach_access</span> Nghỉ phép</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-error">cancel</span> Vắng mặt</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-on-surface-variant/40">lock</span> Chủ nhật</span>
                  </div>
                  <div className="mt-sm p-sm bg-blue-50 rounded-lg border border-blue-200 text-body-sm text-blue-700 flex items-start gap-xs">
                    <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                    <span>Nhân viên lương cố định được <strong>1 ngày nghỉ có lương</strong> mỗi tháng. Ngày nghỉ vượt quá sẽ bị khấu trừ lương.</span>
                  </div>
                </div>
              );
            })()
          ) : (
            /* HOURLY / PER-SESSION CALENDAR (existing) */
            <div className="p-md overflow-x-auto">
              <div className="min-w-[700px] border border-outline-variant/20 rounded-xl overflow-hidden bg-surface">
                <div className="grid grid-cols-7 bg-surface-container-low border-b border-outline-variant/20">
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                    <div key={d} className="p-2 text-center text-label-sm font-semibold text-on-surface-variant uppercase">{d}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7">
                  {days.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="min-h-[120px] p-2 border-r border-b border-outline-variant/10 bg-surface-container-lowest/50" />;
                    
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayAtts = attendance.filter(a => a.date.startsWith(dateStr));
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                    
                    return (
                      <div 
                        key={day} 
                        onClick={() => openAttModal(day)}
                        className={`min-h-[120px] p-2 border-r border-b border-outline-variant/10 relative group cursor-pointer ${isToday ? 'bg-primary/5' : 'hover:bg-surface-container-lowest transition-colors'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-label-md w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-on-primary font-bold' : 'text-on-surface'}`}>
                            {day}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openAttModal(day); }}
                            className="transition-opacity p-0.5 rounded-full text-primary hover:bg-primary/10"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                        
                        <div className="space-y-1">
                          {dayAtts.map(att => (
                            <div key={att.id} className={`text-[10px] p-1 rounded border flex justify-between group/item ${
                              att.type === 'Nghỉ phép' ? 'bg-error-container/50 border-error/20 text-error' :
                              att.type === 'Đi muộn' ? 'bg-tertiary-container/50 border-tertiary/20 text-tertiary' :
                              'bg-primary-container/30 border-primary/20 text-primary-600'
                            }`}>
                              <div className="truncate" title={att.note || att.type}>
                                {isHourly ? (
                                  <><b>{att.check_in?.substring(0,5)}</b>-<b>{att.check_out?.substring(0,5)}</b></>
                                ) : (
                                  <b>{att.type}</b>
                                )}
                              </div>
                              <div className="flex gap-0.5">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingAtt(att); }}
                                  className="text-primary hover:text-primary/80"
                                >
                                  <span className="material-symbols-outlined text-[12px]">edit</span>
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteAttendance(att.id); }}
                                  className="text-error hover:text-error-600"
                                >
                                  <span className="material-symbols-outlined text-[12px]">close</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SALARY TAB */
        <div className="card overflow-hidden">
          <div className="p-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
            <h2 className="text-title-md text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">request_quote</span>
              Lịch sử Tính lương
            </h2>
            <button 
              onClick={() => setIsSalaryModalOpen(true)}
              className="btn-primary py-1.5 px-3 text-label-sm"
            >
              <span className="material-symbols-outlined text-[18px]">calculate</span>
              Tính lương tháng mới
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-md py-sm text-left text-label-sm text-on-surface-variant uppercase">Kỳ lương</th>
                  <th className="px-md py-sm text-right text-label-sm text-on-surface-variant uppercase">Số lượng</th>
                  <th className="px-md py-sm text-right text-label-sm text-on-surface-variant uppercase">Đơn giá</th>
                  <th className="px-md py-sm text-right text-label-sm text-on-surface-variant uppercase">Thưởng</th>
                  <th className="px-md py-sm text-right text-label-sm text-on-surface-variant uppercase">Phạt/Khấu trừ</th>
                  <th className="px-md py-sm text-right text-label-sm text-on-surface-variant uppercase">Thực nhận</th>
                  <th className="px-md py-sm text-center text-label-sm text-on-surface-variant uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {salaries.map(s => (
                  <tr key={s.id} className="hover:bg-surface-container/30">
                    <td className="px-md py-md font-medium text-on-background">Tháng {s.month}/{s.year}</td>
                    <td className="px-md py-md text-right">{isFixed ? `${s.total_hours} ngày` : `${s.sessions_count || s.total_hours} ${isHourly ? 'giờ' : 'tiết'}`}</td>
                    <td className="px-md py-md text-right text-on-surface-variant">{formatVND(s.rate_per_unit)}</td>
                    <td className="px-md py-md text-right text-primary">+{formatVND(s.bonus)}</td>
                    <td className="px-md py-md text-right text-error">-{formatVND(s.deductions + (s.fine || 0))}</td>
                    <td className="px-md py-md text-right font-bold text-on-background">{formatVND(s.net_salary)}</td>
                    <td className="px-md py-md text-center">
                      <span className={`px-2 py-1 rounded-full text-label-sm ${s.status === 'Đã thanh toán' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {salaries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-xl text-on-surface-variant">Chưa có bảng lương nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Fixed Salary Day-Off Modal */}
      {isDayOffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card p-xl w-[400px] max-w-[90vw] shadow-elevation-3">
            <div className="flex justify-between items-center mb-lg border-b border-outline-variant/20 pb-md">
              <h2 className="text-title-lg font-semibold text-on-background">
                Ngày {new Date(dayOffDate).toLocaleDateString('vi-VN')}
              </h2>
              <button onClick={() => setIsDayOffModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {dayOffExisting ? (
              /* Day already marked as off — show current status and allow change */
              <div className="space-y-md">
                <div className={`p-md rounded-xl border text-center ${
                  dayOffExisting.type === 'Vắng mặt' 
                    ? 'bg-error/5 border-error/20' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <span className={`material-symbols-outlined text-[32px] ${dayOffExisting.type === 'Vắng mặt' ? 'text-error' : 'text-amber-600'}`}>
                    {dayOffExisting.type === 'Vắng mặt' ? 'cancel' : 'beach_access'}
                  </span>
                  <p className={`text-body-md font-semibold mt-xs ${dayOffExisting.type === 'Vắng mặt' ? 'text-error' : 'text-amber-700'}`}>
                    {dayOffExisting.type}
                  </p>
                  {dayOffExisting.note && (
                    <p className="text-body-sm text-on-surface-variant mt-xs">{dayOffExisting.note}</p>
                  )}
                </div>
                <div className="flex gap-sm">
                  <button
                    onClick={handleRemoveDayOff}
                    disabled={isPending}
                    className="flex-1 btn-primary py-sm flex items-center justify-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {isPending ? 'Đang xử lý...' : 'Đánh dấu Đi làm'}
                  </button>
                  <button
                    onClick={() => setIsDayOffModalOpen(false)}
                    className="btn-secondary py-sm"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              /* Day is working — allow marking as off */
              <form onSubmit={handleMarkDayOff} className="space-y-md">
                <div className="bg-emerald-50 p-md rounded-xl border border-emerald-200 text-center">
                  <span className="material-symbols-outlined text-[32px] text-emerald-600">check_circle</span>
                  <p className="text-body-md font-semibold text-emerald-700 mt-xs">Đang đi làm</p>
                </div>

                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Đánh dấu nghỉ</label>
                  <div className="grid grid-cols-2 gap-sm">
                    <button
                      type="button"
                      onClick={() => setDayOffType('Nghỉ phép')}
                      className={`p-sm rounded-xl border text-center transition-all ${
                        dayOffType === 'Nghỉ phép'
                          ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                          : 'border-outline-variant/20 hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px] text-amber-600">beach_access</span>
                      <p className="text-label-sm font-medium mt-1">Nghỉ phép</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDayOffType('Vắng mặt')}
                      className={`p-sm rounded-xl border text-center transition-all ${
                        dayOffType === 'Vắng mặt'
                          ? 'border-error bg-error/5 ring-2 ring-error/30'
                          : 'border-outline-variant/20 hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px] text-error">cancel</span>
                      <p className="text-label-sm font-medium mt-1">Vắng mặt</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Ghi chú (tuỳ chọn)</label>
                  <input
                    value={dayOffNote}
                    onChange={(e) => setDayOffNote(e.target.value)}
                    placeholder="Lý do nghỉ..."
                    className="input-field w-full"
                  />
                </div>

                <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
                  <button type="button" onClick={() => setIsDayOffModalOpen(false)} className="btn-secondary">Huỷ</button>
                  <button type="submit" disabled={isPending} className="btn-primary">
                    {isPending ? 'Đang lưu...' : 'Xác nhận nghỉ'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card p-xl w-[500px] max-w-[90vw] shadow-elevation-3">
            <div className="flex justify-between items-center mb-lg border-b border-outline-variant/20 pb-md">
              <h2 className="text-title-lg font-semibold text-on-background">Thêm chấm công</h2>
              <button onClick={() => setIsAttModalOpen(false)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleAddAttendance} className="space-y-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Ngày</label>
                <input type="date" required value={attDate} onChange={(e) => setAttDate(e.target.value)} className="input-field w-full bg-surface-container-lowest" />
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Loại</label>
                <select required value={attType} onChange={(e) => setAttType(e.target.value)} className="input-field w-full">
                  <option value="Dạy học">Dạy học</option>
                  <option value="Họp">Họp</option>
                  <option value="Nghỉ phép">Nghỉ phép</option>
                  <option value="Đi muộn">Đi muộn</option>
                  <option value="Soạn bài">Soạn bài</option>
                </select>
              </div>

              {isHourly && (attType === 'Dạy học' || attType === 'Họp' || attType === 'Soạn bài') && (
                <div className="space-y-sm bg-surface-container/30 p-sm rounded-lg border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="text-label-sm font-semibold">Thời gian (Ca)</span>
                    <button type="button" onClick={() => setAttShifts([...attShifts, { checkIn: '08:00', checkOut: '10:00', hours: 2 }])} className="text-primary text-label-sm flex items-center hover:underline">
                      <span className="material-symbols-outlined text-[16px]">add</span> Thêm ca
                    </button>
                  </div>
                  {attShifts.map((shift, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="time" required value={shift.checkIn} onChange={(e) => handleShiftChange(idx, 'checkIn', e.target.value)} className="input-field flex-1" />
                      <span className="text-on-surface-variant">-</span>
                      <input type="time" required value={shift.checkOut} onChange={(e) => handleShiftChange(idx, 'checkOut', e.target.value)} className="input-field flex-1" />
                      <span className="w-12 text-right text-label-sm text-on-surface-variant">{shift.hours}h</span>
                      {attShifts.length > 1 && (
                        <button type="button" onClick={() => setAttShifts(attShifts.filter((_, i) => i !== idx))} className="text-error ml-1"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Ghi chú</label>
                <input value={attNotes} onChange={(e) => setAttNotes(e.target.value)} placeholder="Nhập ghi chú (tùy chọn)..." className="input-field w-full" />
              </div>

              <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
                <button type="button" onClick={() => setIsAttModalOpen(false)} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={isPending} className="btn-primary">
                  {isPending ? 'Đang lưu...' : 'Lưu chấm công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Calculation Modal */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card p-xl w-[600px] max-w-[95vw] shadow-elevation-3">
            <div className="flex justify-between items-center mb-lg border-b border-outline-variant/20 pb-md">
              <h2 className="text-title-lg font-semibold text-on-background">Tính lương</h2>
              <button onClick={() => setIsSalaryModalOpen(false)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleGenerateSalary} className="space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Tháng</label>
                  <input type="number" min="1" max="12" required value={salaryMonth} onChange={(e) => setSalaryMonth(parseInt(e.target.value))} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Năm</label>
                  <input type="number" min="2000" required value={salaryYear} onChange={(e) => setSalaryYear(parseInt(e.target.value))} className="input-field w-full" />
                </div>
              </div>

              <div className="bg-surface-container/30 p-md rounded-xl border border-outline-variant/20 space-y-sm">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Hệ thống sẽ tự động tổng hợp:</span>
                </div>
                <ul className="text-label-sm text-on-surface-variant list-disc pl-5 space-y-1">
                  {isFixed ? (
                    <>
                      <li>Lương cố định: <strong>{formatVND(selectedTeacher?.salary_rate)}</strong></li>
                      <li>Trừ ngày nghỉ không lương (sau 1 ngày nghỉ có lương)</li>
                    </>
                  ) : isHourly ? (
                    <li>Tổng số <strong>giờ</strong> từ dữ liệu Chấm công</li>
                  ) : (
                    <li>Tổng số <strong>tiết/buổi</strong> từ dữ liệu Chấm công</li>
                  )}
                  {!isFixed && <li>Nhân với đơn giá: <strong>{formatVND(selectedTeacher?.salary_rate)}</strong></li>}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Thưởng (VNĐ)</label>
                  <CurrencyInput value={salaryBonus} onChange={v => setSalaryBonus(parseInt(v) || 0)} className="w-full" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Phạt/Khấu trừ (VNĐ)</label>
                  <CurrencyInput value={salaryFine} onChange={v => setSalaryFine(parseInt(v) || 0)} className="w-full" />
                </div>
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Ghi chú phiếu lương</label>
                <input value={salaryNotes} onChange={(e) => setSalaryNotes(e.target.value)} placeholder="Nhập ghi chú..." className="input-field w-full" />
              </div>

              <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
                <button type="button" onClick={() => setIsSalaryModalOpen(false)} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={isPending} className="btn-primary">
                  {isPending ? 'Đang tính...' : 'Tạo phiếu lương'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {editingAtt && (
        <div 
          style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '100vh', zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setEditingAtt(null)}
        >
          <div className="bg-surface rounded-2xl shadow-xl w-[400px] max-w-[90vw] p-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">edit_note</span>
              <h2 className="text-title-lg font-semibold">Chỉnh sửa chấm công</h2>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-md">Ngày: <strong>{new Date(editingAtt.date).toLocaleDateString('vi-VN')}</strong></p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                startTransition(async () => {
                  try {
                    await updateTeacherAttendance(editingAtt.id, formData);
                    setEditingAtt(null);
                  } catch (err: any) {
                    alert('Lỗi: ' + err.message);
                  }
                });
              }}
              className="space-y-md"
            >
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Giờ vào</label>
                  <input type="time" name="checkIn" defaultValue={editingAtt.check_in?.substring(0, 5)} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Giờ ra</label>
                  <input type="time" name="checkOut" defaultValue={editingAtt.check_out?.substring(0, 5)} className="input-field w-full" />
                </div>
              </div>
              <div>
                <label className="text-label-sm font-medium text-on-surface mb-xs block">Loại</label>
                <select name="type" defaultValue={editingAtt.type} className="input-field w-full">
                  <option value="Dạy học">Dạy học</option>
                  <option value="Họp">Họp</option>
                  <option value="Soạn bài">Soạn bài</option>
                  <option value="Nghỉ phép">Nghỉ phép</option>
                  <option value="Đi muộn">Đi muộn</option>
                </select>
              </div>
              <div>
                <label className="text-label-sm font-medium text-on-surface mb-xs block">Ghi chú</label>
                <input type="text" name="notes" defaultValue={editingAtt.note || ''} className="input-field w-full" placeholder="Ghi chú..." />
              </div>
              <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
                <button type="button" onClick={() => setEditingAtt(null)} className="btn-secondary">Hủy</button>
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
