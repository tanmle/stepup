-- Thêm các cột mới vào bảng teacher_salary_records để hỗ trợ tính lương chi tiết

ALTER TABLE public.teacher_salary_records ADD COLUMN IF NOT EXISTS sessions_count NUMERIC(6,2) DEFAULT 0;
ALTER TABLE public.teacher_salary_records ADD COLUMN IF NOT EXISTS rate_per_unit NUMERIC DEFAULT 0;
ALTER TABLE public.teacher_salary_records ADD COLUMN IF NOT EXISTS bonus NUMERIC DEFAULT 0;
ALTER TABLE public.teacher_salary_records ADD COLUMN IF NOT EXISTS fine NUMERIC DEFAULT 0;

-- Cập nhật comment giải thích
COMMENT ON COLUMN public.teacher_salary_records.sessions_count IS 'Số tiết hoặc số ca dạy (đối với lương theo buổi/tiết)';
COMMENT ON COLUMN public.teacher_salary_records.rate_per_unit IS 'Đơn giá trên 1 giờ hoặc 1 tiết';
COMMENT ON COLUMN public.teacher_salary_records.bonus IS 'Tổng tiền thưởng';
COMMENT ON COLUMN public.teacher_salary_records.fine IS 'Tổng tiền phạt (đi muộn, vi phạm...)';
