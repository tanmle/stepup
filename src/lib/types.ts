// ─── Core Entity Types ────────────────────────────────────────────────────────

export type StudentStatus = 'Đang học' | 'Tạm nghỉ' | 'Đã nghỉ' | 'Hoàn thành';
export type Gender = 'Nam' | 'Nữ' | 'Khác';
export type TeacherStatus = 'Nhận lớp' | 'Kín lịch' | 'Nghỉ phép';
export type PaymentStatus = 'Đã thu đủ' | 'Sắp đến hạn' | 'Quá hạn' | 'Chưa đến hạn';
export type ClassStatus = 'Đang học' | 'Sắp mở' | 'Đã kết thúc';
export type TransactionType = 'income' | 'expense';

// ─── Student ──────────────────────────────────────────────────────────────────

export interface Parent {
  fullName: string;
  relationship: 'Bố' | 'Mẹ' | 'Người giám hộ';
  phone: string;
  email?: string;
}

export interface Student {
  id: string;
  code: string; // HV-XXXXXX
  fullName: string;
  dateOfBirth: string; // DD/MM/YYYY
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  status: StudentStatus;
  avatar?: string;
  avatarInitials: string;
  avatarColor: string;
  parents: Parent[];
  enrolledCourses: EnrolledCourse[];
  payments: Payment[];
  notes: Note[];
  attendanceRate: number; // 0-100
  currentDebt: number;
}

export interface EnrolledCourse {
  classCode: string;
  className: string;
  teacher: string;
  schedule: string;
  sessionsCompleted: number;
  sessionsTotal: number;
  attendanceRate: number;
  status: ClassStatus;
  startDate: string;
}

// ─── Teacher ──────────────────────────────────────────────────────────────────

export interface Teacher {
  id: string;
  code: string; // GV-XXXX
  fullName: string;
  email: string;
  phone: string;
  degree: string;
  institution: string;
  certificates: string[];
  specializations: string[];
  teachingStrengths: string[];
  status: TeacherStatus;
  yearsOfExperience: number;
  avatar?: string;
  avatarInitials: string;
  avatarColor: string;
  currentClasses: TeacherClass[];
  rating: number; // 0-5
  studentGoalRate: number; // 0-100
  studentRating: number; // 0-5
  reEnrollmentRate: number; // 0-100
  location: string;
  scheduleNote?: string;
}

export interface TeacherClass {
  code: string;
  name: string;
  program: string;
  enrolled: number;
  capacity: number;
  schedule: string;
  startDate: string;
  status: ClassStatus;
  colorKey: 'primary' | 'secondary' | 'tertiary';
}

// ─── Tuition / Payment ────────────────────────────────────────────────────────

export interface TuitionRecord {
  id: string;
  student: Pick<Student, 'id' | 'code' | 'fullName' | 'avatarInitials' | 'avatarColor' | 'avatar'>;
  className: string;
  totalTuition: number;
  amountPaid: number;
  amountOwed: number;
  dueDate: string;
  status: PaymentStatus;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  note?: string;
  type: TransactionType;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface KpiData {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  colorVariant?: 'default' | 'error';
}

export interface RecentEnrollment {
  studentName: string;
  course: string;
  avatar?: string;
  avatarInitials: string;
  avatarColor: string;
  status: 'HOÀN TẤT' | 'ĐANG XỬ LÝ' | 'CHỜ DUYỆT';
}

export interface Transaction {
  id: string;
  description: string;
  time: string;
  method: string;
  amount: number;
  type: TransactionType;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  cost: number;
}

export interface Note {
  id: string;
  author: string;
  date: string;
  content: string;
}
