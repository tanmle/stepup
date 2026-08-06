-- 1. Bổ sung bảng session_attendance
CREATE TABLE IF NOT EXISTS public.session_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('Có mặt', 'Vắng mặt', 'Đi trễ')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS cho session_attendance
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access session_attendance" ON public.session_attendance FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access session_attendance" ON public.session_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access session_attendance" ON public.session_attendance FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access session_attendance" ON public.session_attendance FOR DELETE USING (true);

-- 2. Thêm cột price vào bảng classes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='classes' AND column_name='price') THEN
        ALTER TABLE public.classes ADD COLUMN price NUMERIC(15, 2) DEFAULT 0;
    END IF;
END $$;

-- 3. Cho phép Insert/Update/Delete vào enrollments và tuition_records (để app có thể ghi dữ liệu)
DO $$
BEGIN
    -- enrollments
    DROP POLICY IF EXISTS "Allow anon insert access enrollments" ON public.enrollments;
    DROP POLICY IF EXISTS "Allow anon update access enrollments" ON public.enrollments;
    DROP POLICY IF EXISTS "Allow anon delete access enrollments" ON public.enrollments;
    
    CREATE POLICY "Allow anon insert access enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow anon update access enrollments" ON public.enrollments FOR UPDATE USING (true);
    CREATE POLICY "Allow anon delete access enrollments" ON public.enrollments FOR DELETE USING (true);

    -- tuition_records
    DROP POLICY IF EXISTS "Allow anon insert access tuition_records" ON public.tuition_records;
    DROP POLICY IF EXISTS "Allow anon update access tuition_records" ON public.tuition_records;
    DROP POLICY IF EXISTS "Allow anon delete access tuition_records" ON public.tuition_records;

    CREATE POLICY "Allow anon insert access tuition_records" ON public.tuition_records FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow anon update access tuition_records" ON public.tuition_records FOR UPDATE USING (true);
    CREATE POLICY "Allow anon delete access tuition_records" ON public.tuition_records FOR DELETE USING (true);
END $$;
