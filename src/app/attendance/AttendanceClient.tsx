'use client';

import StudentAttendanceClient from './StudentAttendanceClient';

interface AttendanceClientProps {
  classes: any[];
}

export default function AttendanceClient({ classes }: AttendanceClientProps) {

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      <div>
        <h1 className="text-headline-lg text-on-background">Điểm danh Học viên</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Quản lý chuyên cần của học viên</p>
      </div>

      <div className="mt-2">
        <StudentAttendanceClient classes={classes} />
      </div>
    </div>
  );
}
