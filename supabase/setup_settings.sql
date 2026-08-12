CREATE TABLE public.center_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_name text NOT NULL DEFAULT 'StepUp English',
  phone text DEFAULT '0987 654 321',
  email text DEFAULT 'contact@stepup.edu.vn',
  address text DEFAULT '123 Đường ABC, Quận X, TP.Y',
  bank_name text DEFAULT 'Vietcombank',
  bank_account text DEFAULT '1234567890',
  bank_owner text DEFAULT 'NGUYEN VAN A',
  receipt_note text DEFAULT 'Học phí đã đóng không được hoàn trả dưới mọi hình thức.',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.center_settings ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả mọi người đọc (SELECT)
CREATE POLICY "Cho phép mọi người đọc cài đặt" 
ON public.center_settings FOR SELECT 
TO public 
USING (true);

-- Cho phép tất cả mọi người cập nhật (UPDATE) (Tạm thời cho MVP)
CREATE POLICY "Cho phép mọi người cập nhật cài đặt" 
ON public.center_settings FOR UPDATE 
TO public 
USING (true);

-- Cho phép tất cả mọi người thêm mới (INSERT) (Tạm thời cho MVP)
CREATE POLICY "Cho phép mọi người thêm cài đặt" 
ON public.center_settings FOR INSERT 
TO public 
WITH CHECK (true);

-- Chèn dữ liệu mặc định ban đầu
INSERT INTO public.center_settings (id, center_name) VALUES ('d8d7b876-0f1c-4b6d-a123-1a2b3c4d5e6f', 'StepUp English');
