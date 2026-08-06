-- Cấp quyền INSERT, UPDATE, DELETE cho ẩn danh (anon) trên bảng teachers
CREATE POLICY "Allow anon insert access" ON public.teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access" ON public.teachers FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access" ON public.teachers FOR DELETE USING (true);
