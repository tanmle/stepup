'use client';

import { useState } from 'react';
import TeacherAttendanceClient from './TeacherAttendanceClient';
import StudentAttendanceClient from './StudentAttendanceClient';

interface AttendanceClientProps {
  teachers: any[];
  initialAttendance: any[];
  classes: any[];
}

export default function AttendanceClient({ teachers, initialAttendance, classes }: AttendanceClientProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      <div>
        <h1 className="text-headline-lg text-on-background">Chấm công & Điểm danh</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Quản lý chuyên cần của học viên và chấm công giáo viên</p>
      </div>

      <div className="flex gap-4 border-b border-outline-variant/20 mb-4">
        <button
          className={`pb-2 text-label-md font-medium transition-colors ${
            activeTab === 'students' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('students')}
        >
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Điểm danh Học viên
          </div>
        </button>
        <button
          className={`pb-2 text-label-md font-medium transition-colors ${
            activeTab === 'teachers' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('teachers')}
        >
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            Chấm công Giáo viên
          </div>
        </button>
      </div>

      <div className="mt-2">
        {activeTab === 'students' ? (
          <StudentAttendanceClient classes={classes} />
        ) : (
          <TeacherAttendanceClient teachers={teachers} initialAttendance={initialAttendance} />
        )}
      </div>
    </div>
  );
}
