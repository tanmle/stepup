'use client';

import { useState, useMemo } from 'react';

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
  classCode: string;
  className: string;
  colorKey: string;
  teacherName: string;
}

interface ScheduleClientProps {
  sessions: Session[];
}

export default function ScheduleClient({ sessions }: ScheduleClientProps) {
  const [filter, setFilter] = useState('upcoming'); // upcoming, all

  const groupedSessions = useMemo(() => {
    const groups: Record<string, Session[]> = {};
    const todayStr = new Date().toISOString().split('T')[0];

    sessions.forEach(session => {
      if (filter === 'upcoming' && session.date < todayStr) return;
      if (!groups[session.date]) groups[session.date] = [];
      groups[session.date].push(session);
    });

    return groups;
  }, [sessions, filter]);

  const sortedDates = Object.keys(groupedSessions).sort();

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      <div className="flex items-center justify-between mb-sm">
        <div>
          <h1 className="text-headline-lg text-on-background">Lịch giảng dạy</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Theo dõi chi tiết từng buổi học của tất cả các lớp
          </p>
        </div>
        <div className="flex gap-sm">
          <button 
            className={`btn-${filter === 'upcoming' ? 'primary' : 'secondary'}`}
            onClick={() => setFilter('upcoming')}
          >
            Sắp tới
          </button>
          <button 
            className={`btn-${filter === 'all' ? 'primary' : 'secondary'}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="card p-xl text-center text-on-surface-variant">
          Không có lịch học nào trong thời gian tới. Hãy tạo Lớp học mới!
        </div>
      ) : (
        <div className="space-y-lg">
          {sortedDates.map((date) => {
            const dateObj = new Date(date);
            const dayOfWeek = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
            const formattedDate = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            return (
              <div key={date} className="animate-fade-in">
                <h2 className="text-title-md font-semibold text-on-background mb-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                  {dayOfWeek}, {formattedDate}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                  {groupedSessions[date].map((session) => (
                    <div key={session.id} className="card p-md border-l-4 border-l-primary hover:-translate-y-1 transition-transform cursor-pointer group">
                      <div className="flex justify-between items-start mb-sm">
                        <div className={`px-2 py-1 rounded text-[11px] font-bold border ${COLOR_MAP[session.colorKey] || COLOR_MAP['primary']}`}>
                          {session.classCode}
                        </div>
                        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${
                          session.status === 'Chưa học' ? 'bg-surface-container text-on-surface-variant' :
                          session.status === 'Đã học' ? 'bg-emerald-100 text-emerald-700' :
                          session.status === 'Học bù' ? 'bg-amber-100 text-amber-700' :
                          'bg-error/10 text-error'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <h3 className="text-body-lg font-bold text-on-background line-clamp-1 mb-xs" title={session.className}>
                        {session.className}
                      </h3>
                      <div className="space-y-xs">
                        <div className="flex items-center gap-xs text-label-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {session.startTime} - {session.endTime}
                        </div>
                        <div className="flex items-center gap-xs text-label-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">person</span>
                          {session.teacherName}
                        </div>
                        <div className="flex items-center gap-xs text-label-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                          {session.room || 'Chưa xếp phòng'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
