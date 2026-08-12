'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { addTeacherAttendance, deleteTeacherAttendance } from './actions';

interface TeacherAttendanceClientProps {
  teachers: any[];
  initialAttendance: any[];
}

export default function TeacherAttendanceClient({ teachers, initialAttendance }: TeacherAttendanceClientProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [isAttModalOpen, setIsAttModalOpen] = useState(false);
  const [attDate, setAttDate] = useState('');
  const [attShifts, setAttShifts] = useState<any[]>([{ checkIn: '08:00', checkOut: '10:00', hours: 2 }]);
  const [attType, setAttType] = useState('Dạy học');
  const [attNotes, setAttNotes] = useState('');

  const [isPending, startTransition] = useTransition();

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  const isHourly = selectedTeacher?.salary_type === 'hourly';

  // Filter attendance for selected teacher
  const attendance = initialAttendance.filter(a => a.teacher_id === selectedTeacherId);

  // Calendar logic
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
            formData.append('teacher_id', selectedTeacherId);
            formData.append('date', attDate);
            formData.append('check_in', shift.checkIn);
            formData.append('check_out', shift.checkOut);
            formData.append('hours_worked', shift.hours.toString());
            formData.append('type', attType);
            formData.append('notes', attNotes);
            await addTeacherAttendance(formData);
          }
        } else {
          const formData = new FormData();
          formData.append('teacher_id', selectedTeacherId);
          formData.append('date', attDate);
          formData.append('type', 'Dạy học');
          formData.append('notes', attNotes);
          await addTeacherAttendance(formData);
        }
        setIsAttModalOpen(false);
      } catch (error) {
        alert('Có lỗi xảy ra: ' + (error as Error).message);
      }
    });
  };

  const handleDeleteAttendance = (id: string) => {
    if (confirm('Xóa bản ghi chấm công này?')) {
      startTransition(async () => {
        try {
          await deleteTeacherAttendance(id);
        } catch (error) {
          alert('Có lỗi xảy ra: ' + (error as Error).message);
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      <div className="card p-md flex flex-col sm:flex-row gap-sm items-center justify-between mt-2">
        <div className="flex items-center gap-sm w-full sm:w-auto">
          <label className="text-label-sm text-on-surface-variant whitespace-nowrap">Chọn Giáo viên:</label>
          <select 
            className="input-field min-w-[250px]"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            <option value="">-- Vui lòng chọn giáo viên --</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.full_name} ({t.code})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedTeacherId ? (
        <div className="card p-xl">
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h3 className="text-title-md font-semibold text-on-background">Lịch chấm công</h3>
              <p className="text-body-sm text-on-surface-variant">Giáo viên: {selectedTeacher?.full_name} | {isHourly ? 'Lương theo giờ' : 'Lương cố định'}</p>
            </div>
            <div className="flex items-center gap-sm bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
              <button onClick={prevMonth} className="p-xs hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="text-label-sm font-semibold text-on-surface min-w-[100px] text-center">
                Tháng {month + 1}, {year}
              </span>
              <button onClick={nextMonth} className="p-xs hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-xs mb-xs">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
              <div key={d} className="text-center text-label-sm font-medium text-on-surface-variant py-xs">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-xs">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-24 rounded-xl bg-surface-container-lowest border border-outline-variant/10" />;
              
              const d = new Date(year, month, day);
              const tzOffset = d.getTimezoneOffset() * 60000;
              const dayStr = (new Date(d.getTime() - tzOffset)).toISOString().split('T')[0];
              const records = attendance.filter((a: any) => a.date === dayStr);
              
              return (
                <div key={day} className="h-24 rounded-xl border border-outline-variant/20 bg-surface flex flex-col p-xs hover:border-primary/30 transition-colors group relative">
                  <div className="flex justify-between items-start">
                    <span className="text-label-sm font-medium text-on-surface">{day}</span>
                    <button 
                      onClick={() => openAttModal(day)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-primary hover:bg-primary/10 rounded transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                  <div className="mt-xs flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                    {records.map((r: any) => (
                      <div key={r.id} className="text-[10px] leading-tight bg-primary/10 text-primary p-1 rounded">
                        <div className="font-semibold">{isHourly ? `${r.check_in} - ${r.check_out} (${r.hours_worked}h)` : 'Có mặt'}</div>
                        <div className="truncate opacity-80">{r.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-xl flex flex-col items-center justify-center text-on-surface-variant py-20">
          <span className="material-symbols-outlined text-[48px] opacity-20 mb-sm">how_to_reg</span>
          <p>Vui lòng chọn một giáo viên để chấm công</p>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card p-xl w-[500px] max-w-[90vw] shadow-elevation-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-lg border-b border-outline-variant/20 pb-md">
              <h2 className="text-title-lg font-semibold text-on-background">Chấm công ngày {new Date(attDate).toLocaleDateString('vi-VN')}</h2>
              <button onClick={() => setIsAttModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-lg">
              <h3 className="text-label-sm font-semibold mb-sm">Các ca đã chấm trong ngày:</h3>
              <div className="space-y-sm">
                {attendance.filter((a: any) => a.date === attDate).length > 0 ? (
                  attendance.filter((a: any) => a.date === attDate).map((r: any) => (
                    <div key={r.id} className="flex justify-between items-center p-sm bg-surface-container-low rounded-lg border border-outline-variant/20">
                      <div>
                        {isHourly ? (
                          <p className="text-body-sm font-medium">{r.check_in} - {r.check_out} <span className="text-primary">({r.hours_worked}h)</span></p>
                        ) : (
                          <p className="text-body-sm font-medium">Có mặt</p>
                        )}
                        <p className="text-[11px] text-on-surface-variant">{r.type} {r.notes && `- ${r.notes}`}</p>
                      </div>
                      <button onClick={() => handleDeleteAttendance(r.id)} disabled={isPending} className="text-error hover:bg-error/10 p-1 rounded transition-colors ml-2">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-body-sm text-on-surface-variant italic">Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            <form onSubmit={handleAddAttendance} className="bg-surface-container-lowest p-md rounded-xl space-y-md border border-outline-variant/20">
              <h3 className="text-label-sm font-semibold text-primary">Thêm chấm công mới</h3>
              {isHourly ? (
                <>
                  {attShifts.map((shift, index) => (
                    <div key={index} className="flex gap-sm items-end relative pb-2 border-b border-outline-variant/10 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <label className="text-[11px] text-on-surface-variant block mb-1">Giờ vào</label>
                        <input type="time" required className="input-field w-full text-body-sm py-1.5" value={shift.checkIn} onChange={(e) => handleShiftChange(index, 'checkIn', e.target.value)} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] text-on-surface-variant block mb-1">Giờ ra</label>
                        <input type="time" required className="input-field w-full text-body-sm py-1.5" value={shift.checkOut} onChange={(e) => handleShiftChange(index, 'checkOut', e.target.value)} />
                      </div>
                      <div className="w-16">
                        <label className="text-[11px] text-on-surface-variant block mb-1">Số giờ</label>
                        <input type="number" readOnly className="input-field w-full text-body-sm py-1.5 bg-surface-container-low text-primary font-semibold" value={shift.hours} />
                      </div>
                      {attShifts.length > 1 && (
                        <button type="button" onClick={() => setAttShifts(attShifts.filter((_, i) => i !== index))} className="p-1.5 text-error hover:bg-error/10 rounded mb-[2px]">
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setAttShifts([...attShifts, { checkIn: '13:00', checkOut: '15:00', hours: 2 }])} className="text-primary text-[12px] font-medium flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[14px]">add</span> Thêm ca
                  </button>
                </>
              ) : (
                <div className="p-sm bg-primary/5 text-primary text-body-sm rounded-lg border border-primary/20">
                  Giáo viên hưởng lương cố định. Đánh dấu có mặt cho ngày này.
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-sm pt-2 border-t border-outline-variant/20">
                <div>
                  <label className="text-[11px] text-on-surface-variant block mb-1">Loại công việc</label>
                  <select className="input-field w-full text-body-sm py-1.5" value={attType} onChange={(e) => setAttType(e.target.value)}>
                    <option>Dạy học</option>
                    <option>Họp</option>
                    <option>Soạn bài</option>
                    <option>Sự kiện</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-on-surface-variant block mb-1">Ghi chú</label>
                  <input type="text" className="input-field w-full text-body-sm py-1.5" placeholder="Ghi chú thêm..." value={attNotes} onChange={(e) => setAttNotes(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-sm pt-sm">
                <button type="button" onClick={() => setIsAttModalOpen(false)} className="btn-secondary py-1.5 px-4 text-label-sm">Đóng</button>
                <button type="submit" disabled={isPending} className="btn-primary py-1.5 px-4 text-label-sm">
                  {isPending ? 'Đang lưu...' : 'Lưu chấm công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
