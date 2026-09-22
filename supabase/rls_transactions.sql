-- Cấp quyền INSERT, UPDATE, DELETE cho ẩn danh (anon) trên bảng transactions
CREATE POLICY "Allow anon insert access" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access" ON public.transactions FOR DELETE USING (true);
