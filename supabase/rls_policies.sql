-- Cấp quyền INSERT, UPDATE, DELETE cho ẩn danh (anon) trên bảng students
CREATE POLICY "Allow anon insert access" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access" ON public.students FOR DELETE USING (true);

-- Cấp quyền tương tự cho bảng parents
CREATE POLICY "Allow anon insert access" ON public.parents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access" ON public.parents FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access" ON public.parents FOR DELETE USING (true);

-- Cấp quyền tương tự cho bảng enrollments
CREATE POLICY "Allow anon insert access" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access" ON public.enrollments FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access" ON public.enrollments FOR DELETE USING (true);
