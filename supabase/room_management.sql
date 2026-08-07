-- Tạo bảng rooms (Phòng học)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 20,
    facilities JSONB DEFAULT '[]'::jsonb, -- Array of strings e.g. ["Máy chiếu", "Bảng tương tác"]
    status TEXT NOT NULL DEFAULT 'Sẵn sàng', -- 'Sẵn sàng', 'Bảo trì', 'Ngưng sử dụng'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cho phép đọc/ghi public tạm thời (theo pattern RLS hiện tại của dự án, bạn có thể thiết lập RLS chặt chẽ hơn sau)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phép tất cả thao tác trên bảng rooms" ON public.rooms FOR ALL USING (true);

-- Đổ dữ liệu mẫu (Tùy chọn)
INSERT INTO public.rooms (name, capacity, facilities, status) VALUES 
('Phòng 1', 15, '["Bảng từ", "Tivi"]', 'Sẵn sàng'),
('Phòng 2', 20, '["Bảng tương tác", "Loa", "Tivi"]', 'Sẵn sàng'),
('Phòng 3', 30, '["Máy chiếu", "Bảng từ", "Loa"]', 'Sẵn sàng'),
('Phòng 4', 15, '["Bảng từ", "Tivi"]', 'Sẵn sàng'),
('Phòng Lab', 12, '["Máy tính", "Tai nghe", "Màn hình tương tác"]', 'Sẵn sàng');
