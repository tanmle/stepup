-- Bảng Danh sách Học viên (Students)
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    status VARCHAR(20) CHECK (status IN ('Đang học', 'Tạm nghỉ', 'Đã nghỉ', 'Hoàn thành')),
    avatar_url TEXT,
    avatar_initials VARCHAR(5),
    avatar_color VARCHAR(50),
    attendance_rate NUMERIC(5, 2) DEFAULT 0,
    current_debt NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Phụ huynh (Parents)
CREATE TABLE public.parents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Giáo viên (Teachers)
CREATE TABLE public.teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    degree VARCHAR(100),
    institution VARCHAR(150),
    certificates JSONB DEFAULT '[]'::JSONB,
    specializations JSONB DEFAULT '[]'::JSONB,
    teaching_strengths JSONB DEFAULT '[]'::JSONB,
    status VARCHAR(20) CHECK (status IN ('Nhận lớp', 'Kín lịch', 'Nghỉ phép')),
    years_of_experience INTEGER DEFAULT 0,
    rating NUMERIC(3, 1) DEFAULT 0,
    avatar_url TEXT,
    avatar_initials VARCHAR(5),
    avatar_color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Lớp học (Classes)
CREATE TABLE public.classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    program VARCHAR(100),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    capacity INTEGER DEFAULT 15,
    schedule VARCHAR(200),
    start_date DATE,
    status VARCHAR(20) CHECK (status IN ('Đang học', 'Sắp mở', 'Đã kết thúc')),
    color_key VARCHAR(20) DEFAULT 'primary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Ghi danh (Enrollments)
CREATE TABLE public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    sessions_completed INTEGER DEFAULT 0,
    sessions_total INTEGER DEFAULT 0,
    attendance_rate NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Đang học',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, class_id)
);

-- Bảng Học phí (Tuition Records)
CREATE TABLE public.tuition_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    total_tuition NUMERIC(15, 2) DEFAULT 0,
    amount_paid NUMERIC(15, 2) DEFAULT 0,
    amount_owed NUMERIC(15, 2) DEFAULT 0,
    due_date DATE,
    status VARCHAR(50) CHECK (status IN ('Đã thu đủ', 'Sắp đến hạn', 'Quá hạn', 'Chưa đến hạn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Lịch sử Giao dịch (Transactions)
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('income', 'expense')),
    method VARCHAR(50),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - allow public read for testing as requested
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create testing policies (allow all for anon for now since we bypass Auth)
CREATE POLICY "Allow anon read access" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow anon read access" ON public.parents FOR SELECT USING (true);
CREATE POLICY "Allow anon read access" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Allow anon read access" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow anon read access" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Allow anon read access" ON public.tuition_records FOR SELECT USING (true);
CREATE POLICY "Allow anon read access" ON public.transactions FOR SELECT USING (true);

-- Functions to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tuition_records_updated_at BEFORE UPDATE ON public.tuition_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
