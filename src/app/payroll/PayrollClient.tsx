'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { addTeacherAttendance, deleteTeacherAttendance, generateSalaryRecord } from './actions';

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

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  const isHourly = selectedTeacher?.salary_type === 'hourly';

  const attendance = initialAttendance.filter(a => a.teacher_id === selectedTeacherId);
  const salaries = initialSalaries.filter(s => s.teacher_id === selectedTeacherId);

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
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
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
            <span>Loại lương: <strong className="text-on-surface">{isHourly ? 'Theo giờ' : 'Theo tiết/buổi'}</strong></span>
            <span>Đơn giá: <strong className="text-on-surface">{selectedTeacher.salary_rate?.toLocaleString('vi-VN')}đ</strong></span>
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
          <div className="p-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
            <h2 className="text-title-md text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Tháng {month + 1}/{year}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="btn-secondary py-1 px-2"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <button onClick={nextMonth} className="btn-secondary py-1 px-2"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>
          
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
                    <div key={day} className={`min-h-[120px] p-2 border-r border-b border-outline-variant/10 relative group ${isToday ? 'bg-primary/5' : 'hover:bg-surface-container-lowest transition-colors'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-label-md w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-on-primary font-bold' : 'text-on-surface'}`}>
                          {day}
                        </span>
                        <button 
                          onClick={() => openAttModal(day)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full text-primary hover:bg-primary/10"
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
                            <button 
                              onClick={() => handleDeleteAttendance(att.id)}
                              className="opacity-0 group-hover/item:opacity-100 text-error hover:text-error-600"
                            >
                              <span className="material-symbols-outlined text-[12px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
                    <td className="px-md py-md text-right">{s.sessions_count || s.total_hours} {isHourly ? 'giờ' : 'tiết'}</td>
                    <td className="px-md py-md text-right text-on-surface-variant">{(s.rate_per_unit || 0).toLocaleString()}đ</td>
                    <td className="px-md py-md text-right text-primary">+{(s.bonus || 0).toLocaleString()}đ</td>
                    <td className="px-md py-md text-right text-error">-{(s.deductions + (s.fine || 0)).toLocaleString()}đ</td>
                    <td className="px-md py-md text-right font-bold text-on-background">{(s.net_salary || 0).toLocaleString()}đ</td>
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

      {/* Generate Salary Modal */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card p-xl w-[500px] max-w-[90vw] shadow-elevation-3">
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
                  {isHourly ? (
                    <li>Tổng số <strong>giờ</strong> từ dữ liệu Chấm công</li>
                  ) : (
                    <li>Tổng số <strong>tiết/buổi</strong> từ dữ liệu Chấm công</li>
                  )}
                  <li>Nhân với đơn giá: <strong>{selectedTeacher?.salary_rate?.toLocaleString()}đ</strong></li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Thưởng (VNĐ)</label>
                  <input type="number" min="0" value={salaryBonus} onChange={(e) => setSalaryBonus(parseInt(e.target.value) || 0)} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Phạt/Khấu trừ (VNĐ)</label>
                  <input type="number" min="0" value={salaryFine} onChange={(e) => setSalaryFine(parseInt(e.target.value) || 0)} className="input-field w-full" />
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
    </div>
  );
}
