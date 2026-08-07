-- ============================================
-- TEACHER MANAGEMENT UPGRADE - SQL Migration
-- ============================================

-- 1. Add new columns to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS id_card VARCHAR(20);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS english_level VARCHAR(50);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS major VARCHAR(100);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS certificate_details JSONB DEFAULT '[]';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS max_hours_per_week INTEGER DEFAULT 20;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS fixed_days_off JSONB DEFAULT '[]';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS can_teach_online BOOLEAN DEFAULT false;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS can_teach_weekend BOOLEAN DEFAULT false;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS salary_type VARCHAR(20) DEFAULT 'hourly';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS salary_rate NUMERIC DEFAULT 0;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS allowances JSONB DEFAULT '{}';

-- 2. Update status constraint
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_status_check;
ALTER TABLE teachers ADD CONSTRAINT teachers_status_check
  CHECK (status IN ('Đang làm việc', 'Nghỉ phép', 'Nghỉ thai sản', 'Đã nghỉ việc', 'Nhận lớp', 'Kín lịch'));

-- 3. Create teacher_evaluations table
CREATE TABLE IF NOT EXISTS teacher_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  expertise_score INTEGER DEFAULT 0,        -- Chuyên môn (max 30)
  attendance_score INTEGER DEFAULT 0,       -- Chuyên cần (max 10)
  parent_interaction_score INTEGER DEFAULT 0, -- Tương tác PH (max 10)
  lesson_plan_score INTEGER DEFAULT 0,      -- Hồ sơ giáo án (max 20)
  class_management_score INTEGER DEFAULT 0, -- Quản lý lớp (max 20)
  professionalism_score INTEGER DEFAULT 0,  -- Tác phong (max 10)
  total_score INTEGER GENERATED ALWAYS AS (
    expertise_score + attendance_score + parent_interaction_score +
    lesson_plan_score + class_management_score + professionalism_score
  ) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, month, year)
);

-- 4. Create teacher_attendance table
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  hours_worked NUMERIC(4,2) DEFAULT 0,
  type VARCHAR(20) DEFAULT 'Dạy học',  -- Dạy học, Họp, Soạn bài, Nghỉ phép
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create teacher_documents table
CREATE TABLE IF NOT EXISTS teacher_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL, -- CCCD, Bằng ĐH, Chứng chỉ, HĐ lao động, CV, Giấy khám SK
  file_name TEXT NOT NULL,
  file_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create teacher_salary_records table
CREATE TABLE IF NOT EXISTS teacher_salary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_hours NUMERIC(6,2) DEFAULT 0,
  base_salary NUMERIC DEFAULT 0,
  allowance_total NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_salary NUMERIC DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Chưa thanh toán', -- Chưa thanh toán, Đã thanh toán
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, month, year)
);

-- 7. RLS Policies
ALTER TABLE teacher_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_salary_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for teacher_evaluations" ON teacher_evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for teacher_attendance" ON teacher_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for teacher_documents" ON teacher_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for teacher_salary_records" ON teacher_salary_records FOR ALL USING (true) WITH CHECK (true);
