-- 1. Xóa bảng phụ huynh cũ (Nếu đã tồn tại)
DROP TABLE IF EXISTS public.parents CASCADE;
DROP TABLE IF EXISTS public.student_parents CASCADE;

-- 2. Tạo bảng Phụ huynh độc lập
CREATE TABLE public.parents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    job VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tạo bảng trung gian Liên kết Học viên - Phụ huynh
CREATE TABLE public.student_parents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE,
    relationship VARCHAR(50) DEFAULT 'Phụ huynh',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, parent_id)
);

-- 4. Bật RLS và Phân quyền cho 2 bảng mới
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;

-- Cấp quyền cho bảng parents
CREATE POLICY "Allow anon select access parents" ON public.parents FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access parents" ON public.parents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access parents" ON public.parents FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access parents" ON public.parents FOR DELETE USING (true);

-- Cấp quyền cho bảng student_parents
CREATE POLICY "Allow anon select access student_parents" ON public.student_parents FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access student_parents" ON public.student_parents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access student_parents" ON public.student_parents FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access student_parents" ON public.student_parents FOR DELETE USING (true);
