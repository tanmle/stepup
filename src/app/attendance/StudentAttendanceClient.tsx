'use client';

import { useState, useEffect, useTransition } from 'react';
import { getStudentsForClass, getClassSessions, getSessionAttendance, saveStudentAttendance } from './actions';

interface StudentAttendanceClientProps {
  classes: any[];
}

export default function StudentAttendanceClient({ classes }: StudentAttendanceClientProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, { status: string; notes: string }>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  // Fetch data when class changes
  useEffect(() => {
    if (!selectedClassId) {
      setSessions([]);
      setStudents([]);
      setSelectedSessionId('');
      return;
    }

    const loadClassData = async () => {
      setIsLoading(true);
      try {
        const [classStudents, classSessions] = await Promise.all([
          getStudentsForClass(selectedClassId),
          getClassSessions(selectedClassId)
        ]);
        setStudents(classStudents);
        setSessions(classSessions);
        if (classSessions.length > 0) {
          setSelectedSessionId(classSessions[0].id);
        } else {
          setSelectedSessionId('');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClassData();
  }, [selectedClassId]);

  // Fetch attendance when session changes
  useEffect(() => {
    if (!selectedSessionId || students.length === 0) {
      setAttendance({});
      return;
    }

    const loadSessionData = async () => {
      setIsLoading(true);
      try {
        const sessionAtt = await getSessionAttendance(selectedSessionId);
        
        // Initialize attendance state for all students
        const initialAtt: Record<string, { status: string; notes: string }> = {};
        
        students.forEach(student => {
          const existingRecord = sessionAtt.find((a: any) => a.student_id === student.id);
          if (existingRecord) {
            initialAtt[student.id] = { status: existingRecord.status, notes: existingRecord.notes || '' };
          } else {
            initialAtt[student.id] = { status: 'Có mặt', notes: '' };
          }
        });
        
        setAttendance(initialAtt);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [selectedSessionId, students]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes }
    }));
  };

  const markAll = (status: string) => {
    const newAtt = { ...attendance };
    Object.keys(newAtt).forEach(id => {
      newAtt[id].status = status;
    });
    setAttendance(newAtt);
  };

  const handleSave = () => {
    if (!selectedSessionId || !selectedClassId) return;
    
    startTransition(async () => {
      try {
        const attendanceData = Object.entries(attendance).map(([studentId, data]) => ({
          session_id: selectedSessionId,
          student_id: studentId,
          status: data.status,
          notes: data.notes
        }));
        
        await saveStudentAttendance(selectedSessionId, selectedClassId, attendanceData);
        alert('Lưu điểm danh thành công!');
      } catch (error) {
        alert('Lỗi khi lưu điểm danh.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      <div className="card p-md flex flex-col sm:flex-row gap-md items-center justify-between mt-2">
        <div className="flex flex-col sm:flex-row items-center gap-md w-full">
          <div className="flex items-center gap-sm w-full sm:w-auto">
            <label className="text-label-sm text-on-surface-variant whitespace-nowrap min-w-[70px]">Lớp học:</label>
            <select 
              className="input-field min-w-[250px] w-full"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">-- Chọn lớp học --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code}) - {c.schedule}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-sm w-full sm:w-auto">
            <label className="text-label-sm text-on-surface-variant whitespace-nowrap min-w-[70px]">Buổi học:</label>
            <select 
              className="input-field min-w-[200px] w-full"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              disabled={!selectedClassId || sessions.length === 0}
            >
              <option value="">-- Chọn buổi học --</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {new Date(s.session_date).toLocaleDateString('vi-VN')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-xl flex flex-col items-center justify-center text-on-surface-variant py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : selectedClassId && selectedSessionId && students.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="p-md bg-surface-container-low border-b border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-sm">
            <div>
              <h3 className="text-title-md font-semibold text-on-background">
                Danh sách lớp {selectedClass?.name}
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-xs">
                Sĩ số: {students.length} học viên | Ngày: {new Date(selectedSession?.date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="flex gap-sm">
              <button onClick={() => markAll('Có mặt')} className="btn-secondary py-1.5 px-3 text-label-sm">
                Đánh dấu tất cả "Có mặt"
              </button>
              <button 
                onClick={handleSave} 
                disabled={isPending}
                className="btn-primary py-1.5 px-4 text-label-sm"
              >
                {isPending ? 'Đang lưu...' : 'Lưu điểm danh'}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-outline-variant/20">
                  <th className="p-md text-label-sm font-semibold text-on-surface-variant w-[80px]">STT</th>
                  <th className="p-md text-label-sm font-semibold text-on-surface-variant min-w-[200px]">Học viên</th>
                  <th className="p-md text-label-sm font-semibold text-on-surface-variant min-w-[250px]">Trạng thái</th>
                  <th className="p-md text-label-sm font-semibold text-on-surface-variant w-full">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {students.map((student, idx) => {
                  const studentAtt = attendance[student.id] || { status: 'Có mặt', notes: '' };
                  
                  return (
                    <tr key={student.id} className="hover:bg-primary/[0.02] transition-colors">
                      <td className="p-md text-body-md text-on-surface-variant">{idx + 1}</td>
                      <td className="p-md">
                        <p className="font-semibold text-body-md text-on-surface">{student.full_name}</p>
                        <p className="text-label-sm text-on-surface-variant">{student.code}</p>
                      </td>
                      <td className="p-md">
                        <div className="flex gap-sm">
                          {['Có mặt', 'Vắng mặt', 'Đi trễ'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`px-3 py-1.5 rounded-lg text-label-sm border transition-colors flex items-center gap-xs ${
                                studentAtt.status === status
                                  ? status === 'Có mặt' ? 'bg-emerald-100 border-emerald-200 text-emerald-800 font-semibold' 
                                    : status === 'Vắng mặt' ? 'bg-error/10 border-error/20 text-error font-semibold'
                                    : 'bg-amber-100 border-amber-200 text-amber-800 font-semibold'
                                  : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {studentAtt.status === status ? 'radio_button_checked' : 'radio_button_unchecked'}
                              </span>
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-md">
                        <input 
                          type="text" 
                          placeholder="Nhập ghi chú (VD: Phụ huynh xin phép)..."
                          className="input-field w-full py-1.5 text-body-sm"
                          value={studentAtt.notes}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedClassId && (!sessions || sessions.length === 0) ? (
        <div className="card p-xl flex flex-col items-center justify-center text-on-surface-variant py-20">
          <span className="material-symbols-outlined text-[48px] opacity-20 mb-sm">event_busy</span>
          <p>Lớp học này chưa có buổi học nào được lên lịch.</p>
        </div>
      ) : selectedClassId && selectedSessionId && students.length === 0 ? (
        <div className="card p-xl flex flex-col items-center justify-center text-on-surface-variant py-20">
          <span className="material-symbols-outlined text-[48px] opacity-20 mb-sm">person_off</span>
          <p>Lớp học này chưa có học viên nào.</p>
        </div>
      ) : (
        <div className="card p-xl flex flex-col items-center justify-center text-on-surface-variant py-20">
          <span className="material-symbols-outlined text-[48px] opacity-20 mb-sm">fact_check</span>
          <p>Vui lòng chọn lớp học và buổi học để điểm danh</p>
        </div>
      )}
    </div>
  );
}
