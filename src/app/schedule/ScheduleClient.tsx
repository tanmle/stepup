'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateClassSession, deleteClassSession } from '../classes/actions';

const COLOR_MAP: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-amber-50 text-amber-700 border-amber-200',
  tertiary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-error/10 text-error border-error/20',
};

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  status: string;
  classId: string;
  teacherId: string;
  classCode: string;
  className: string;
  colorKey: string;
  teacherName: string;
}

interface Teacher {
  id: string;
  full_name: string;
}

interface ScheduleClientProps {
  sessions: Session[];
  teachers: Teacher[];
}

export default function ScheduleClient({ sessions, teachers }: ScheduleClientProps) {
  const router = useRouter();
  const [view, setView] = useState<'month' | 'week'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Edit Modal State
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isPending, startTransition] = useTransition();

  // Navigation functions
  const next = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + 1);
      else d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const prev = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() - 1);
      else d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const today = () => setCurrentDate(new Date());

  // Week calculation (Monday to Sunday)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(d.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      days.push(current);
    }
    return days;
  }, [currentDate]);

  // Month calculation
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 0 is Sunday, we want Monday to be 0
    let startOffset = firstDay.getDay() - 1;
    if (startOffset === -1) startOffset = 6;
    
    const days = [];
    // Add prev month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }
    
    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Add next month leading days to complete grid (42 cells max)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  }, [currentDate]);

  // Format date helper: YYYY-MM-DD local time
  const formatYMD = (date: Date) => {
    const d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return d.toISOString().split('T')[0];
  };

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map: Record<string, Session[]> = {};
    sessions.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    // Sort sessions within each day by start time
    Object.keys(map).forEach(date => {
      map[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  }, [sessions]);

  // Actions
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSession) return;
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await updateClassSession(editingSession.id, editingSession.classId, formData);
        setEditingSession(null);
        router.refresh();
      } catch (error) {
        console.error('Error saving session:', error);
        alert('Cập nhật thất bại.');
      }
    });
  };

  const handleDelete = async () => {
    if (!editingSession) return;
    if (!confirm('Bạn có chắc chắn muốn xóa lịch học này?')) return;
    
    startTransition(async () => {
      try {
        await deleteClassSession(editingSession.id, editingSession.classId);
        setEditingSession(null);
        router.refresh();
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Xóa thất bại.');
      }
    });
  };

  // Render Session Card inside Calendar
  const renderSessionCard = (session: Session) => (
    <div 
      key={session.id} 
      onClick={() => setEditingSession(session)}
      className={`rounded p-1 mb-1 text-[11px] cursor-pointer hover:brightness-95 transition-all border-l-2 ${COLOR_MAP[session.colorKey] || COLOR_MAP['primary']}`}
    >
      <div className="font-bold flex items-center justify-between">
        <span className="truncate pr-1">{session.classCode}</span>
        <span>{session.startTime}</span>
      </div>
      <div className="truncate opacity-80">{session.teacherName}</div>
      <div className="truncate opacity-80">{session.room}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in h-[calc(100vh-100px)]">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-md mb-xs">
        <div>
          <h1 className="text-headline-lg text-on-background">Lịch giảng dạy</h1>
        </div>
        
        <div className="flex items-center gap-md">
          {/* View Toggle */}
          <div className="flex bg-surface-container rounded-lg p-1">
            <button 
              onClick={() => setView('month')}
              className={`px-sm py-1 text-label-sm rounded-md transition-colors ${view === 'month' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Tháng
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-sm py-1 text-label-sm rounded-md transition-colors ${view === 'week' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Tuần
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-xs">
            <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button onClick={today} className="px-sm py-1 rounded-full border border-outline-variant/30 text-label-sm hover:bg-surface-container transition-colors font-medium">
              Hôm nay
            </button>
            <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
          
          <h2 className="text-title-lg font-semibold w-48 text-right">
            {view === 'month' 
              ? `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`
              : `Tháng ${weekDays[0].getMonth() + 1}, ${weekDays[0].getFullYear()}`
            }
          </h2>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="card flex-1 flex flex-col overflow-hidden bg-surface">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-outline-variant/20 bg-surface-container-low shrink-0">
          {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, i) => (
            <div key={day} className="py-2 text-center text-label-sm font-semibold text-on-surface-variant border-r border-outline-variant/10 last:border-0">
              {day}
              {view === 'week' && (
                <div className={`text-title-md mt-1 ${formatYMD(weekDays[i]) === formatYMD(new Date()) ? 'text-primary' : 'text-on-surface'}`}>
                  {weekDays[i].getDate()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-y-auto">
          {view === 'month' ? (
            <div className="grid grid-cols-7 min-h-full">
              {monthDays.map((dayObj, i) => {
                const dateStr = formatYMD(dayObj.date);
                const isToday = dateStr === formatYMD(new Date());
                const daySessions = sessionsByDate[dateStr] || [];

                return (
                  <div 
                    key={dateStr} 
                    className={`min-h-[120px] p-1 border-r border-b border-outline-variant/10 transition-colors ${!dayObj.isCurrentMonth ? 'bg-surface-container-lowest/50 opacity-60' : 'bg-surface hover:bg-surface-container-lowest'}`}
                  >
                    <div className={`text-right text-label-sm mb-1 ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                      <span className={isToday ? 'bg-primary/10 px-2 py-0.5 rounded-full' : ''}>
                        {dayObj.date.getDate()}
                      </span>
                    </div>
                    <div className="overflow-y-auto max-h-[90px] pr-1 space-y-1 custom-scrollbar">
                      {daySessions.map(renderSessionCard)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7 min-h-full">
              {weekDays.map((day, i) => {
                const dateStr = formatYMD(day);
                const daySessions = sessionsByDate[dateStr] || [];
                const isToday = dateStr === formatYMD(new Date());
                
                return (
                  <div key={dateStr} className={`p-sm border-r border-outline-variant/10 min-h-full ${isToday ? 'bg-primary/5' : 'bg-surface'}`}>
                    <div className="flex flex-col gap-2">
                      {daySessions.length === 0 ? (
                        <div className="text-center py-lg text-[12px] text-on-surface-variant/50">Trống</div>
                      ) : (
                        daySessions.map(renderSessionCard)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-md animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-xl w-[450px] max-w-[95vw] overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="text-title-lg font-bold text-on-background">Sửa buổi học</h3>
                <p className="text-label-sm text-on-surface-variant">{editingSession.classCode} - {editingSession.className}</p>
              </div>
              <button 
                onClick={() => setEditingSession(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-lg flex flex-col gap-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="col-span-2">
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Ngày học</label>
                  <input 
                    name="sessionDate" 
                    type="date" 
                    required 
                    defaultValue={editingSession.date}
                    className="input-field w-full" 
                  />
                </div>
                <div>
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Giờ bắt đầu</label>
                  <input 
                    name="startTime" 
                    type="time" 
                    required 
                    defaultValue={editingSession.startTime}
                    className="input-field w-full" 
                  />
                </div>
                <div>
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Giờ kết thúc</label>
                  <input 
                    name="endTime" 
                    type="time" 
                    required 
                    defaultValue={editingSession.endTime}
                    className="input-field w-full" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Giáo viên phụ trách</label>
                  <select 
                    name="teacherId"
                    defaultValue={editingSession.teacherId || ''}
                    className="input-field w-full"
                  >
                    <option value="">-- Chưa phân công --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Phòng học</label>
                  <input 
                    name="room" 
                    type="text" 
                    required 
                    defaultValue={editingSession.room}
                    className="input-field w-full" 
                  />
                </div>
                <div>
                  <label className="text-label-sm font-medium text-on-surface mb-xs block">Trạng thái</label>
                  <select 
                    name="status"
                    defaultValue={editingSession.status}
                    className="input-field w-full"
                  >
                    <option value="Chưa học">Chưa học</option>
                    <option value="Đã học">Đã học</option>
                    <option value="Học bù">Học bù</option>
                    <option value="Nghỉ">Nghỉ</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-sm pt-sm border-t border-outline-variant/10">
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-md py-sm text-label-md font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Xóa buổi học
                </button>
                <div className="flex gap-sm">
                  <button 
                    type="button"
                    onClick={() => setEditingSession(null)}
                    className="btn-secondary"
                    disabled={isPending}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="btn-primary"
                  >
                    {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
