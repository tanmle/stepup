'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { addTeacherAttendance, addTeacherEvaluation, addTeacherSalaryRecord, deleteTeacherAttendance } from '../actions';

const TABS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: 'person' },
  { id: 'education', label: 'Học vấn & Chứng chỉ', icon: 'school' },
  { id: 'schedule', label: 'Lịch dạy', icon: 'calendar_month' },
  { id: 'attendance', label: 'Chấm công', icon: 'schedule' },
  { id: 'classes', label: 'Lớp phụ trách', icon: 'class' },
  { id: 'salary', label: 'Lương & Phụ cấp', icon: 'payments' },
  { id: 'evaluation', label: 'Đánh giá', icon: 'star' },
  { id: 'documents', label: 'Hồ sơ đính kèm', icon: 'folder' },
];

const SCHEDULE_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const SCHEDULE_SLOTS = ['Sáng (08:00–12:00)', 'Chiều (13:30–17:30)', 'Tối (18:00–21:30)'];

const COLOR_MAP: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-amber-50 text-amber-700 border-amber-200',
  tertiary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

interface TeacherDetailClientProps {
  teacher: any;
}

export default function TeacherDetailClient({ teacher }: TeacherDetailClientProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // States for attendance
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attType, setAttType] = useState('Dạy học');
  const [attWorkAmount, setAttWorkAmount] = useState('1');
  const [attShifts, setAttShifts] = useState([{ checkIn: '17:30', checkOut: '19:00' }]);
  const [attNote, setAttNote] = useState('');

  // States for Calendar Attendance
  const [calMonth, setCalMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));
  const [isAttModalOpen, setIsAttModalOpen] = useState(false);

  // States for salary
  const [salMonth, setSalMonth] = useState('2024-01');
  const [salTotalHours, setSalTotalHours] = useState('');
  const [salBaseSalary, setSalBaseSalary] = useState('');
  const [salAllowanceTotal, setSalAllowanceTotal] = useState('');
  const [salDeductions, setSalDeductions] = useState('');
  
  // States for evaluation
  const [evalMonth, setEvalMonth] = useState('2024-01');
  const [evalScores, setEvalScores] = useState({
    chuyenMon: 0,
    chuyenCan: 0,
    tuongTac: 0,
    hoSo: 0,
    quanLy: 0,
    tacPhong: 0,
  });

  const totalEvalScore = Object.values(evalScores).reduce((a, b) => a + (Number(b) || 0), 0);
  
  const getEvalClassification = (score: number) => {
    if (score >= 100) return 'Xuất sắc';
    if (score >= 80) return 'Tốt';
    if (score >= 70) return 'Khá';
    return 'Cần cải thiện';
  };

  const getEvalColor = (score: number) => {
    if (score >= 100) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-primary bg-primary/10';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const handleAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (teacher.salaryType === 'fixed') {
          let hoursWorked = Number(attWorkAmount);
          const formData = new FormData();
          formData.append('teacher_id', teacher.id);
          formData.append('date', attDate);
          formData.append('hours_worked', hoursWorked.toString());
          formData.append('type', attType);
          formData.append('note', attNote);
          await addTeacherAttendance(formData);
        } else {
          for (const shift of attShifts) {
            if (!shift.checkIn || !shift.checkOut) continue;
            const checkInParts = shift.checkIn.split(':');
            const checkOutParts = shift.checkOut.split(':');
            const checkInDate = new Date();
            checkInDate.setHours(Number(checkInParts[0]), Number(checkInParts[1]));
            const checkOutDate = new Date();
            checkOutDate.setHours(Number(checkOutParts[0]), Number(checkOutParts[1]));
            
            let hoursWorked = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
            if (hoursWorked < 0) hoursWorked += 24;

            const formData = new FormData();
            formData.append('teacher_id', teacher.id);
            formData.append('date', attDate);
            formData.append('check_in', shift.checkIn);
            formData.append('check_out', shift.checkOut);
            formData.append('hours_worked', hoursWorked.toString());
            formData.append('type', attType);
            formData.append('note', attNote);

            await addTeacherAttendance(formData);
          }
        }
        
        // Reset form slightly but keep date
        setAttShifts([{ checkIn: '17:30', checkOut: '19:00' }]);
        setAttWorkAmount('1');
        setAttNote('');
        setIsAttModalOpen(false); // Close the modal after saving
        
        router.refresh();
      } catch (error) {
        alert('Lỗi khi thêm chấm công.');
      }
    });
  };

  const handleDeleteAttendance = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chấm công này?')) return;
    startTransition(async () => {
      try {
        await deleteTeacherAttendance(id);
        router.refresh();
      } catch (error) {
        alert('Lỗi khi xóa chấm công.');
      }
    });
  };

  const handleAddEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const [year, month] = evalMonth.split('-');
        const formData = new FormData();
        formData.append('teacher_id', teacher.id);
        formData.append('month', month);
        formData.append('year', year);
        formData.append('expertise_score', evalScores.chuyenMon.toString());
        formData.append('attendance_score', evalScores.chuyenCan.toString());
        formData.append('parent_interaction_score', evalScores.tuongTac.toString());
        formData.append('lesson_plan_score', evalScores.hoSo.toString());
        formData.append('class_management_score', evalScores.quanLy.toString());
        formData.append('professionalism_score', evalScores.tacPhong.toString());

        await addTeacherEvaluation(formData);
        router.refresh();
      } catch (error) {
        alert('Lỗi khi thêm đánh giá (có thể đã tồn tại cho tháng này).');
      }
    });
  };

  // Calendar Helpers
  const generateCalendarDays = () => {
    const [yearStr, monthStr] = calMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    const daysInMonth = new Date(year, month, 0).getDate();
    let firstDay = new Date(year, month - 1, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // 0 is Monday, 6 is Sunday

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month - 1, i).toISOString().split('T')[0]);
    }
    return days;
  };

  const calculateSalary = () => {
    if (!salMonth) return;
    const [yearStr, monthStr] = salMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    const attendanceRecords = (teacher.attendance || []).filter((a: any) => {
      const date = new Date(a.date);
      return date.getFullYear() === year && (date.getMonth() + 1) === month;
    });

    const totalHours = attendanceRecords.reduce((sum: number, a: any) => sum + (Number(a.hours_worked) || 0), 0);
    
    setSalTotalHours(totalHours.toString());

    let baseSalary = 0;
    if (teacher.salaryType === 'fixed') {
      const daysInMonth = new Date(year, month, 0).getDate();
      const standardWorkingDays = daysInMonth - 4;
      const dailyRate = (Number(teacher.salaryRate) || 0) / standardWorkingDays;
      baseSalary = Math.round(totalHours * dailyRate);
    } else {
      baseSalary = Math.round(totalHours * (Number(teacher.salaryRate) || 0));
    }
    setSalBaseSalary(baseSalary.toString());

    const allowances = teacher.allowances || {};
    const allowanceTotal = (Number(allowances.chuyenCan) || 0) + (Number(allowances.soanBai) || 0) + (Number(allowances.tuyenSinh) || 0) + (Number(allowances.thuongKPI) || 0);
    setSalAllowanceTotal(allowanceTotal.toString());
  };

  useEffect(() => {
    if (activeTab === 'salary') {
      calculateSalary();
    }
  }, [salMonth, activeTab]);

  const handleAddSalary = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const [year, month] = salMonth.split('-');
        const netSalary = (Number(salBaseSalary) || 0) + (Number(salAllowanceTotal) || 0) - (Number(salDeductions) || 0);
        
        const formData = new FormData();
        formData.append('teacher_id', teacher.id);
        formData.append('month', month);
        formData.append('year', year);
        formData.append('total_hours', salTotalHours);
        formData.append('base_salary', salBaseSalary);
        formData.append('allowance_total', salAllowanceTotal);
        formData.append('deductions', salDeductions);
        formData.append('net_salary', netSalary.toString());

        await addTeacherSalaryRecord(formData);
        router.refresh();
      } catch (error) {
        alert('Lỗi khi thêm bảng lương (có thể đã tồn tại cho tháng này).');
      }
    });
  };

  if (!teacher) return null;

  return (
    <>
    <div className="flex flex-col gap-md pb-xl animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-label-sm text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/teachers" className="hover:text-primary transition-colors">Quản lý giáo viên</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">{teacher.fullName}</span>
      </nav>

      {/* Profile Header Card */}
      <div className="card p-lg relative overflow-hidden">
        <div className="blur-orb w-64 h-64 bg-primary/5 -top-16 -right-16" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-lg items-start">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold ${teacher.avatarColor || 'bg-primary/10 text-primary'}`}>
              {teacher.avatarInitials}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-surface ${
              teacher.status === 'Đang làm việc' ? 'bg-emerald-500' : 
              teacher.status === 'Nghỉ phép' ? 'bg-amber-500' : 
              teacher.status === 'Nghỉ thai sản' ? 'bg-blue-500' : 'bg-rose-500'
            }`} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-md">
              <div>
                <h1 className="text-headline-md text-on-background flex items-center gap-sm">
                  {teacher.fullName}
                </h1>
                <div className="flex flex-wrap gap-sm mt-sm">
                  <span className="font-mono text-label-sm bg-primary/10 text-primary px-sm py-xs rounded-md">
                    {teacher.code}
                  </span>
                  {teacher.certificates?.slice(0, 2).map((cert: string) => (
                    <span key={cert} className="text-label-sm bg-surface-container px-sm py-xs rounded-md text-on-surface-variant">
                      {cert}
                    </span>
                  ))}
                  <span className="text-label-sm bg-surface-container px-sm py-xs rounded-md text-on-surface-variant">
                    {teacher.yearsOfExperience} năm kinh nghiệm
                  </span>
                </div>
              </div>
              <div className="flex gap-sm">
                <Link href={`/teachers/${teacher.id}/edit`} className="btn-secondary">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Sửa thông tin
                </Link>
                <button className="btn-primary">
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  Giao lớp
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-md mt-lg">
              {[
                { label: 'Lớp đang dạy', value: teacher.currentClasses?.length || 0 },
                { label: 'Tổng học viên', value: teacher.currentClasses?.reduce((sum: number, c: any) => sum + (c.enrolled || 0), 0) || 0 },
                { label: 'Đánh giá TB', value: `${teacher.rating}/5.0` },
                { label: 'Kinh nghiệm', value: `${teacher.yearsOfExperience} năm` },
              ].map((stat) => (
                <div key={stat.label} className="text-center bg-surface-container-low rounded-xl p-sm">
                  <p className="text-[20px] font-bold text-on-background">{stat.value}</p>
                  <p className="text-label-sm text-on-surface-variant mt-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-outline-variant/20 px-lg overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn flex items-center gap-xs mr-lg whitespace-nowrap px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-lg">
          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in space-y-lg">
              <div className="flex items-center gap-sm mb-md">
                <span className={`px-sm py-xs rounded-full text-label-sm font-medium ${
                  teacher.status === 'Đang làm việc' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  teacher.status === 'Nghỉ phép' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  teacher.status === 'Nghỉ thai sản' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {teacher.status || 'Đang làm việc'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {[
                  { label: 'Họ và tên', value: teacher.fullName },
                  { label: 'Ngày sinh', value: teacher.dob },
                  { label: 'CCCD', value: teacher.cccd },
                  { label: 'Địa chỉ', value: teacher.address },
                  { label: 'Giới tính', value: teacher.gender },
                  { label: 'Email', value: teacher.email },
                  { label: 'Số điện thoại', value: teacher.phone },
                  { label: 'Ngày bắt đầu làm việc', value: teacher.startDate },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col border-b border-outline-variant/10 pb-sm">
                    <span className="text-label-sm text-on-surface-variant mb-1">{item.label}</span>
                    <span className="text-body-md text-on-surface font-medium">{item.value || 'Chưa cập nhật'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Education */}
          {activeTab === 'education' && (
            <div className="animate-fade-in space-y-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="bg-surface-container-low rounded-xl p-md">
                  <p className="text-label-sm text-on-surface-variant mb-xs">Bằng cấp</p>
                  <p className="text-body-md font-medium text-on-background">{teacher.degree || 'Chưa cập nhật'}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-md">
                  <p className="text-label-sm text-on-surface-variant mb-xs">Cơ sở đào tạo</p>
                  <p className="text-body-md font-medium text-on-background">{teacher.institution || 'Chưa cập nhật'}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-md">
                  <p className="text-label-sm text-on-surface-variant mb-xs">Chuyên ngành tốt nghiệp</p>
                  <p className="text-body-md font-medium text-on-background">{teacher.major || 'Chưa cập nhật'}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-md">
                  <p className="text-label-sm text-on-surface-variant mb-xs">Trình độ Tiếng Anh</p>
                  <p className="text-body-md font-medium text-on-background">{teacher.englishLevel || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-title-md font-medium mb-md">Chứng chỉ đã có</h3>
                <div className="flex flex-wrap gap-md mb-lg">
                  {['TESOL', 'CELTA', 'TKT', 'IELTS', 'TOEIC'].map(cert => (
                    <label key={cert} className="flex items-center gap-sm">
                      <input 
                        type="checkbox" 
                        checked={teacher.certificates?.includes(cert) || false} 
                        readOnly
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-body-md">{cert}</span>
                    </label>
                  ))}
                </div>

                <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low border-b border-outline-variant/20">
                      <tr>
                        <th className="p-sm text-label-sm text-on-surface-variant">Chứng chỉ chi tiết</th>
                        <th className="p-sm text-label-sm text-on-surface-variant">Ngày hết hạn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {teacher.certificate_details?.length > 0 ? (
                        teacher.certificate_details.map((c: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-sm text-body-md font-medium">{c.name}</td>
                            <td className="p-sm text-body-md">{c.expiry || 'Không thời hạn'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="p-md text-center text-on-surface-variant">Chưa có thông tin chứng chỉ chi tiết</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Schedule */}
          {activeTab === 'schedule' && (
            <div className="animate-fade-in space-y-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
                <div className="bg-surface-container-low p-md rounded-xl space-y-sm">
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-sm">
                    <span className="text-label-sm text-on-surface-variant">Số giờ tối đa/tuần</span>
                    <span className="font-medium">{teacher.maxHoursPerWeek} giờ</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-sm">
                    <span className="text-label-sm text-on-surface-variant">Có thể dạy online</span>
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      {teacher.canTeachOnline ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-xs">
                    <span className="text-label-sm text-on-surface-variant">Có thể dạy cuối tuần</span>
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      {teacher.canTeachWeekend ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-low p-md rounded-xl space-y-sm">
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-xs">Ngày nghỉ cố định</p>
                    <div className="flex gap-xs flex-wrap">
                      {teacher.fixedDaysOff?.length > 0 ? (
                        teacher.fixedDaysOff.map((day: string) => (
                          <span key={day} className="px-sm py-xs rounded bg-rose-50 text-rose-700 text-label-sm border border-rose-100">
                            {day}
                          </span>
                        ))
                      ) : (
                        <span className="text-body-sm text-on-surface-variant">Không có</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <h3 className="text-title-md font-medium mb-md">Lịch dạy tuần này</h3>
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="w-36 text-left text-label-sm text-on-surface-variant py-sm px-md">Ca / Ngày</th>
                      {SCHEDULE_DAYS.map((d) => (
                        <th key={d} className="text-center text-label-sm text-on-surface-variant py-sm px-sm">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SCHEDULE_SLOTS.map((slot, si) => (
                      <tr key={slot} className="border-t border-outline-variant/10">
                        <td className="py-sm px-md">
                          <p className="text-body-md text-on-surface">{slot.split(' ')[0]}</p>
                          <p className="text-label-sm text-on-surface-variant">{slot.split(' ').slice(1).join(' ')}</p>
                        </td>
                        {SCHEDULE_DAYS.map((_, di) => {
                          const date = new Date();
                          const day = date.getDay();
                          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                          const mondayDate = new Date(date.setDate(diff));
                          const cellDate = new Date(mondayDate);
                          cellDate.setDate(mondayDate.getDate() + di);
                          // Adjust for timezone offset to match YYYY-MM-DD
                          const cellDateStr = new Date(cellDate.getTime() - (cellDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

                          const classForSlot = teacher.classSessions?.find((s: any) => {
                            if (s.date !== cellDateStr) return false;
                            const hour = parseInt(s.startTime.split(':')[0], 10);
                            if (si === 0 && hour >= 8 && hour < 12) return true; // Sáng
                            if (si === 1 && hour >= 13 && hour < 18) return true; // Chiều
                            if (si === 2 && hour >= 18) return true; // Tối
                            return false;
                          });

                          return (
                            <td key={di} className="py-sm px-sm text-center">
                              {classForSlot ? (
                                <div className={`rounded-lg p-xs border text-[11px] font-semibold ${COLOR_MAP[classForSlot.colorKey] || COLOR_MAP['primary']}`}>
                                  <p>{classForSlot.code}</p>
                                  <p className="text-[10px] font-normal opacity-80">{classForSlot.enrolled}/{classForSlot.capacity} HV</p>
                                </div>
                              ) : (
                                <span className="text-on-surface-variant/30 text-[10px]">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Attendance */}
          {activeTab === 'attendance' && (
            <div className="animate-fade-in space-y-md">
              <div className="flex items-center justify-between mb-md">
                <h3 className="font-medium text-title-md">Bảng chấm công</h3>
                <div className="flex items-center gap-2">
                  <input type="month" className="input-field py-1" value={calMonth} onChange={e => setCalMonth(e.target.value)} />
                </div>
              </div>

              <div className="border border-outline-variant/20 rounded-xl overflow-hidden bg-surface-container-lowest">
                <div className="grid grid-cols-7 bg-surface-container-low border-b border-outline-variant/20">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                    <div key={day} className="p-xs text-center text-label-sm font-medium text-on-surface-variant border-r last:border-r-0 border-outline-variant/20">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[100px]">
                  {generateCalendarDays().map((dayStr, idx) => {
                    if (!dayStr) return <div key={idx} className="border-r border-b border-outline-variant/20 bg-surface-container-lowest/50"></div>;
                    const dateParts = dayStr.split('-');
                    const dayNum = parseInt(dateParts[2]);
                    const records = (teacher.attendance || []).filter((a: any) => a.date === dayStr);
                    
                    return (
                      <div 
                        key={idx} 
                        onClick={() => { setAttDate(dayStr); setIsAttModalOpen(true); }}
                        className="border-r border-b border-outline-variant/20 p-xs hover:bg-primary/[0.02] cursor-pointer group transition-colors relative flex flex-col"
                      >
                        <div className="text-label-sm text-on-surface-variant group-hover:text-primary transition-colors mb-1">{dayNum}</div>
                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                          {records.map((r: any, ri: number) => (
                            <div key={ri} className="bg-primary/10 text-primary rounded px-1 py-0.5 text-[10px] font-medium flex items-center justify-between">
                              <span className="truncate">{teacher.salaryType === 'fixed' ? (r.hours_worked == 1 ? 'Full' : (r.hours_worked == 0.5 ? 'Nửa' : 'Nghỉ phép')) : `${r.hours_worked}h`}</span>
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

          {/* Tab 5: Classes */}
          {activeTab === 'classes' && (
            <div className="animate-fade-in">
              <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-surface-container-low border-b border-outline-variant/20">
                    <tr>
                      {['Tên lớp', 'Chương trình', 'Sĩ số', 'Lịch học', 'Ngày bắt đầu', 'Trạng thái'].map((h) => (
                        <th key={h} className="p-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {teacher.currentClasses?.length > 0 ? teacher.currentClasses.map((cls: any) => (
                      <tr key={cls.code} className="hover:bg-primary/[0.02] transition-colors">
                        <td className="p-md">
                          <div className={`inline-flex items-center gap-sm px-sm py-xs rounded-lg border mb-xs ${COLOR_MAP[cls.colorKey] || COLOR_MAP['primary']}`}>
                            <span className="material-symbols-outlined text-[14px]">class</span>
                            <span className="font-semibold text-[13px]">{cls.code}</span>
                          </div>
                          <p className="text-body-md text-on-surface font-medium">{cls.name}</p>
                        </td>
                        <td className="p-md text-body-md text-on-surface-variant">{cls.program}</td>
                        <td className="p-md">
                          <p className="text-body-md font-semibold text-on-background">{cls.enrolled}/{cls.capacity}</p>
                          <div className="progress-bar mt-xs w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }} />
                          </div>
                        </td>
                        <td className="p-md text-body-md text-on-surface-variant">{cls.schedule}</td>
                        <td className="p-md text-body-md text-on-surface-variant">{cls.startDate}</td>
                        <td className="p-md">
                          <StatusBadge status={cls.status} />
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="text-center py-lg text-on-surface-variant">Chưa có lớp học nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 6: Salary */}
          {activeTab === 'salary' && (
            <div className="animate-fade-in space-y-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-md flex flex-col justify-center">
                  <span className="text-label-sm text-primary uppercase font-medium">Hình thức & Mức lương</span>
                  <div className="mt-sm flex items-end gap-sm">
                    <span className="text-headline-md font-bold text-on-surface">{teacher.salaryRate?.toLocaleString() || '0'}đ</span>
                    <span className="text-on-surface-variant mb-1">/ {teacher.salaryType === 'fixed' ? 'tháng' : 'giờ'}</span>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-md">
                  <span className="text-label-sm text-on-surface-variant uppercase font-medium">Phụ cấp</span>
                  <div className="mt-sm grid grid-cols-2 gap-sm">
                    {[
                      { name: 'Chuyên cần', amount: teacher.allowances?.chuyenCan || 0 },
                      { name: 'Soạn bài', amount: teacher.allowances?.soanBai || 0 },
                      { name: 'Tuyển sinh', amount: teacher.allowances?.tuyenSinh || 0 },
                      { name: 'Thưởng KPI', amount: teacher.allowances?.thuongKPI || 0 },
                    ].map((allowance, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-on-surface-variant">{allowance.name}:</span>
                        <span className="font-medium">{allowance.amount.toLocaleString()}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <form onSubmit={handleAddSalary} className="bg-surface-container-low p-md rounded-xl space-y-md mb-lg">
                  <h3 className="font-medium text-title-md">Tạo bảng lương</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-md">
                    <div>
                      <div className="flex items-center justify-between mb-xs">
                        <label className="text-label-sm text-on-surface-variant">Tháng</label>
                        <button type="button" onClick={calculateSalary} className="text-primary hover:bg-primary/10 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors" title="Tính lại tự động">
                          <span className="material-symbols-outlined text-[14px] align-middle mr-0.5">refresh</span>
                          Tự tính
                        </button>
                      </div>
                      <input type="month" className="input-field w-full" value={salMonth} onChange={e => setSalMonth(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface-variant block mb-xs">Tổng giờ</label>
                      <input type="number" step="0.5" className="input-field w-full" value={salTotalHours} onChange={e => setSalTotalHours(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface-variant block mb-xs">Lương cơ bản</label>
                      <input type="number" className="input-field w-full" value={salBaseSalary} onChange={e => setSalBaseSalary(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface-variant block mb-xs">Phụ cấp</label>
                      <input type="number" className="input-field w-full" value={salAllowanceTotal} onChange={e => setSalAllowanceTotal(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface-variant block mb-xs">Khấu trừ</label>
                      <input type="number" className="input-field w-full" value={salDeductions} onChange={e => setSalDeductions(e.target.value)} required />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-title-sm">
                      <span className="text-on-surface-variant">Thực nhận: </span>
                      <span className="font-bold text-primary">
                        {((Number(salBaseSalary) || 0) + (Number(salAllowanceTotal) || 0) - (Number(salDeductions) || 0)).toLocaleString()}đ
                      </span>
                    </div>
                    <button type="submit" className="btn-primary" disabled={isPending}>
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      {isPending ? 'Đang lưu...' : 'Thêm bảng lương'}
                    </button>
                  </div>
                </form>
                
                <h3 className="text-title-md font-medium mb-md">Bảng lương theo tháng</h3>
                
                <div className="border border-outline-variant/20 rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-surface-container-low border-b border-outline-variant/20">
                      <tr>
                        <th className="p-sm text-label-sm text-on-surface-variant">Tháng</th>
                        <th className="p-sm text-label-sm text-on-surface-variant text-right">Tổng giờ</th>
                        <th className="p-sm text-label-sm text-on-surface-variant text-right">Lương cơ bản</th>
                        <th className="p-sm text-label-sm text-on-surface-variant text-right">Phụ cấp</th>
                        <th className="p-sm text-label-sm text-on-surface-variant text-right">Khấu trừ</th>
                        <th className="p-sm text-label-sm text-on-surface-variant text-right">Thực nhận</th>
                        <th className="p-sm text-label-sm text-on-surface-variant text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {teacher.salaryRecords?.length > 0 ? (
                        teacher.salaryRecords.map((r: any, idx: number) => (
                          <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                            <td className="p-sm font-medium">{r.month}</td>
                            <td className="p-sm text-right">{r.total_hours}</td>
                            <td className="p-sm text-right">{r.base_salary?.toLocaleString()}đ</td>
                            <td className="p-sm text-right">{r.allowance_total?.toLocaleString()}đ</td>
                            <td className="p-sm text-right text-rose-600">-{r.deduction_total?.toLocaleString()}đ</td>
                            <td className="p-sm text-right font-bold text-primary">{r.net_salary?.toLocaleString()}đ</td>
                            <td className="p-sm text-center">
                              <span className={`px-2 py-1 rounded text-[11px] font-medium ${
                                r.status === 'Đã thanh toán' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-lg text-center text-on-surface-variant">Chưa có dữ liệu lương</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: Evaluation */}
          {activeTab === 'evaluation' && (
            <form onSubmit={handleAddEvaluation} className="animate-fade-in space-y-lg">
              <div className="flex justify-between items-center">
                <input 
                  type="month" 
                  className="input-field max-w-[200px]" 
                  value={evalMonth}
                  onChange={(e) => setEvalMonth(e.target.value)}
                  required
                />
                <div className={`px-md py-sm rounded-lg flex gap-sm items-center ${getEvalColor(totalEvalScore)}`}>
                  <div className="text-center border-r border-current/20 pr-sm">
                    <div className="text-label-sm opacity-80">Tổng điểm</div>
                    <div className="text-title-lg font-bold">{totalEvalScore}/100</div>
                  </div>
                  <div className="pl-xs font-bold text-title-md">
                    {getEvalClassification(totalEvalScore)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md bg-surface-container-low p-md rounded-xl">
                {[
                  { id: 'chuyenMon', label: 'Chuyên môn', max: 30 },
                  { id: 'chuyenCan', label: 'Chuyên cần', max: 10 },
                  { id: 'tuongTac', label: 'Tương tác phụ huynh', max: 10 },
                  { id: 'hoSo', label: 'Hồ sơ giáo án', max: 20 },
                  { id: 'quanLy', label: 'Quản lý lớp', max: 20 },
                  { id: 'tacPhong', label: 'Tác phong', max: 10 },
                ].map(criterion => (
                  <div key={criterion.id} className="flex items-center justify-between bg-surface p-sm rounded-lg border border-outline-variant/20">
                    <span className="text-body-md">{criterion.label} (Tối đa {criterion.max})</span>
                    <input 
                      type="number" 
                      min="0" 
                      max={criterion.max}
                      className="input-field w-20 text-center font-bold text-primary"
                      value={evalScores[criterion.id as keyof typeof evalScores]}
                      onChange={(e) => {
                        const val = Math.min(Math.max(0, Number(e.target.value)), criterion.max);
                        setEvalScores({...evalScores, [criterion.id]: val});
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={isPending}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {isPending ? 'Đang lưu...' : 'Lưu đánh giá'}
                </button>
              </div>

              <div className="mt-lg border-t border-outline-variant/20 pt-lg">
                <h3 className="text-title-md font-medium mb-md">Lịch sử đánh giá</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                  {teacher.evaluations?.length > 0 ? (
                    teacher.evaluations.map((ev: any, idx: number) => (
                      <div key={idx} className="border border-outline-variant/20 rounded-xl p-md">
                        <div className="flex justify-between items-center mb-sm">
                          <span className="font-medium text-title-sm">Tháng {ev.evaluation_date}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getEvalColor(ev.total_score)}`}>
                            {getEvalClassification(ev.total_score)}
                          </span>
                        </div>
                        <div className="text-3xl font-black text-center my-md text-on-surface">
                          {ev.total_score}
                        </div>
                        <div className="text-xs text-on-surface-variant flex justify-between px-md">
                          <span>CM: {ev.scores?.chuyenMon || 0}</span>
                          <span>CC: {ev.scores?.chuyenCan || 0}</span>
                          <span>HS: {ev.scores?.hoSo || 0}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-md text-on-surface-variant bg-surface-container-low rounded-xl">
                      Chưa có lịch sử đánh giá
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Tab 8: Documents */}
          {activeTab === 'documents' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                {[
                  { id: 'cccd', label: 'CCCD', type: 'image' },
                  { id: 'bang_dh', label: 'Bằng đại học', type: 'school' },
                  { id: 'chung_chi', label: 'Chứng chỉ', type: 'workspace_premium' },
                  { id: 'hop_dong', label: 'Hợp đồng lao động', type: 'contract' },
                  { id: 'cv', label: 'CV', type: 'description' },
                  { id: 'suc_khoe', label: 'Giấy khám sức khỏe', type: 'medical_information' },
                ].map(doc => {
                  // Mock checking if document exists
                  const hasDoc = teacher.documents?.some((d: any) => d.type === doc.id);
                  
                  return (
                    <div key={doc.id} className={`border rounded-xl p-md flex flex-col items-center justify-center gap-sm text-center aspect-square transition-colors ${
                      hasDoc ? 'border-emerald-200 bg-emerald-50/30' : 'border-dashed border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low cursor-pointer'
                    }`}>
                      <span className={`material-symbols-outlined text-[40px] ${hasDoc ? 'text-emerald-500' : 'text-on-surface-variant opacity-50'}`}>
                        {doc.type}
                      </span>
                      <span className="text-label-sm font-medium">{doc.label}</span>
                      
                      {hasDoc ? (
                        <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check</span>
                          Đã tải lên
                        </span>
                      ) : (
                        <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">upload</span>
                          Tải lên
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
      
      {/* Attendance Modal */}
      {isAttModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-md animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-[500px] overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-md border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
              <h3 className="font-semibold text-title-md">Chấm công ngày {attDate.split('-').reverse().join('/')}</h3>
              <button onClick={() => setIsAttModalOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-md overflow-y-auto flex-1">
              <div className="mb-lg">
                <h4 className="text-label-sm text-on-surface-variant mb-sm uppercase">Lịch sử trong ngày</h4>
                <div className="space-y-sm">
                  {teacher.attendance?.filter((a: any) => a.date === attDate).length > 0 ? (
                    teacher.attendance.filter((a: any) => a.date === attDate).map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-sm">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-body-md text-primary">
                              {teacher.salaryType === 'fixed' ? (r.hours_worked == 1 ? 'Full ngày' : (r.hours_worked == 0.5 ? 'Nửa ngày' : 'Nghỉ phép')) : `${r.check_in} - ${r.check_out} (${r.hours_worked}h)`}
                            </span>
                            <span className="bg-surface-variant px-1.5 py-0.5 rounded text-[10px]">{r.type}</span>
                          </div>
                          {r.note && <p className="text-body-sm text-on-surface-variant mt-1">{r.note}</p>}
                        </div>
                        <button onClick={() => handleDeleteAttendance(r.id)} disabled={isPending} className="text-rose-600 hover:bg-rose-50 p-1 rounded transition-colors ml-2">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-body-sm text-on-surface-variant italic">Chưa có chấm công.</p>
                  )}
                </div>
              </div>

              <form onSubmit={handleAddAttendance} className="bg-surface-container-low p-md rounded-xl space-y-md border border-outline-variant/20">
                <h4 className="text-label-sm text-on-surface-variant uppercase">Thêm mới</h4>
                <div className="grid grid-cols-1 gap-md">
                  {teacher.salaryType !== 'fixed' ? (
                    <div className="space-y-sm">
                      {attShifts.map((shift, idx) => (
                        <div key={idx} className="flex items-center gap-sm">
                          <div className="flex-1">
                            <label className="text-label-sm text-on-surface-variant block mb-xs">Giờ vào</label>
                            <input type="time" className="input-field w-full" value={shift.checkIn} onChange={e => {
                              const newShifts = [...attShifts];
                              newShifts[idx].checkIn = e.target.value;
                              setAttShifts(newShifts);
                            }} required />
                          </div>
                          <div className="flex-1">
                            <label className="text-label-sm text-on-surface-variant block mb-xs">Giờ ra</label>
                            <input type="time" className="input-field w-full" value={shift.checkOut} onChange={e => {
                              const newShifts = [...attShifts];
                              newShifts[idx].checkOut = e.target.value;
                              setAttShifts(newShifts);
                            }} required />
                          </div>
                          {attShifts.length > 1 && (
                            <button type="button" onClick={() => {
                              const newShifts = attShifts.filter((_, i) => i !== idx);
                              setAttShifts(newShifts);
                            }} className="mt-6 text-rose-600 p-2 hover:bg-rose-50 rounded">
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => setAttShifts([...attShifts, { checkIn: '', checkOut: '' }])} className="text-primary text-label-sm font-medium flex items-center gap-1 hover:bg-primary/10 px-2 py-1 rounded transition-colors w-fit mt-2">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Thêm ca khác
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="text-label-sm text-on-surface-variant block mb-xs">Khối lượng làm việc</label>
                      <select className="input-field w-full" value={attWorkAmount} onChange={e => setAttWorkAmount(e.target.value)}>
                        <option value="1">Full ngày (1 ngày công)</option>
                        <option value="0.5">Nửa ngày (0.5 ngày công)</option>
                        <option value="1">Nghỉ phép có lương (1 ngày công)</option>
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="text-label-sm text-on-surface-variant block mb-xs">Loại</label>
                      <select className="input-field w-full" value={attType} onChange={e => setAttType(e.target.value)}>
                        <option value="Dạy học">Dạy học</option>
                        <option value="Họp">Họp</option>
                        <option value="Soạn bài">Soạn bài</option>
                        <option value="Nghỉ phép">Nghỉ phép</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-label-sm text-on-surface-variant block mb-xs">Ghi chú</label>
                      <input type="text" className="input-field w-full" value={attNote} onChange={e => setAttNote(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="btn-primary" disabled={isPending}>
                    {isPending ? 'Đang lưu...' : 'Lưu chấm công'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
