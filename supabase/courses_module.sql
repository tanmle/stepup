-- Bảng Khóa học (Courses)
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    program VARCHAR(100) NOT NULL,
    level VARCHAR(100) NOT NULL,
    tuition_fee NUMERIC(15, 2) DEFAULT 0,
    duration_months INTEGER DEFAULT 1,
    sessions_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Đang hoạt động' CHECK (status IN ('Đang hoạt động', 'Tạm ngưng')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm cột course_id vào classes
ALTER TABLE public.classes
ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policy (cho phép full quyền với tất cả mọi người như các bảng khác hiện tại)
CREATE POLICY "Enable all for courses" ON public.courses
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Seed Data (Dựa trên constants.ts)
INSERT INTO public.courses (code, name, program, level, tuition_fee, duration_months, sessions_count) VALUES
('MAM-LS', 'Mầm non - Little Step', 'Tiếng Anh Mầm non', 'Little Step', 3000000, 3, 24),
('MAM-MS', 'Mầm non - Middle Step', 'Tiếng Anh Mầm non', 'Middle Step', 3500000, 3, 24),
('MAM-BS', 'Mầm non - Big Step', 'Tiếng Anh Mầm non', 'Big Step', 4000000, 3, 24),
('TH-STARTERS', 'Tiểu học - Starters', 'Tiếng Anh Tiểu học', 'Starters', 4500000, 3, 24),
('TH-MOVERS', 'Tiểu học - Movers', 'Tiếng Anh Tiểu học', 'Movers', 5000000, 3, 24),
('TH-FLYERS', 'Tiểu học - Flyers', 'Tiếng Anh Tiểu học', 'Flyers', 5500000, 3, 24),
('TRH-FOUND', 'Trung học - Foundation', 'Tiếng Anh Trung học', 'Foundation', 6000000, 3, 36),
('TRH-ADV', 'Trung học - Advanced', 'Tiếng Anh Trung học', 'Advanced', 7000000, 3, 36),
('IELTS-45', 'IELTS Band 4-5.5', 'Luyện thi IELTS', 'Band 4-5.5', 10000000, 6, 72);
