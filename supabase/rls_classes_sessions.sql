-- 1. Cấp quyền Thêm/Sửa/Xóa cho bảng classes
CREATE POLICY "Allow anon insert access classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access classes" ON public.classes FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access classes" ON public.classes FOR DELETE USING (true);

-- 2. Tạo bảng Buổi học chi tiết (class_sessions)
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Chưa học' CHECK (status IN ('Chưa học', 'Đã học', 'Đã hủy', 'Học bù')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bật RLS và cấp quyền cho bảng class_sessions
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select access class_sessions" ON public.class_sessions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access class_sessions" ON public.class_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access class_sessions" ON public.class_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access class_sessions" ON public.class_sessions FOR DELETE USING (true);
