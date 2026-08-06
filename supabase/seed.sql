-- Xóa dữ liệu cũ nếu có (cẩn thận khi chạy trên Production!)
TRUNCATE public.transactions, public.tuition_records, public.enrollments, public.classes, public.teachers, public.parents, public.students RESTART IDENTITY CASCADE;

-- Insert Students
INSERT INTO public.students (id, code, full_name, date_of_birth, gender, phone, email, address, status, avatar_initials, avatar_color, attendance_rate, current_debt)
VALUES 
('11111111-1111-1111-1111-111111111111', 'HV-240105', 'Nguyễn Văn An', '2008-08-15', 'Nam', '0987 654 321', 'nguyen.an@email.com', '12 Nguyễn Huệ, Q.1, TP.HCM', 'Đang học', 'NA', 'bg-blue-100 text-blue-700', 95, 4500000),
('22222222-2222-2222-2222-222222222222', 'HV-240234', 'Trần Thị Bích', '2009-02-20', 'Nữ', '0912 345 678', 'bich.tran@email.com', '45 Lê Lợi, Q.1, TP.HCM', 'Đang học', 'TB', 'bg-pink-100 text-pink-700', 100, 8500000),
('33333333-3333-3333-3333-333333333333', 'HV-240312', 'Lê Hoàng Minh', '2008-11-05', 'Nam', '0909 000 111', 'minh.le@email.com', '89 Võ Văn Tần, Q.3, TP.HCM', 'Tạm nghỉ', 'LM', 'bg-emerald-100 text-emerald-700', 70, 0);

-- Insert Teachers
INSERT INTO public.teachers (id, code, full_name, email, phone, degree, institution, status, years_of_experience, rating, avatar_initials, avatar_color, specializations, teaching_strengths)
VALUES 
('44444444-4444-4444-4444-444444444444', 'GV-1024', 'Nguyễn Trần Khánh Vân', 'khanhvan@stepup.edu.vn', '0901 111 222', 'Thạc sĩ TESOL', 'Victoria University', 'Nhận lớp', 5, 4.8, 'KV', 'bg-blue-100 text-blue-700', '["IELTS", "Học thuật"]', '["Writing", "Reading"]'),
('55555555-5555-5555-5555-555555555555', 'GV-1025', 'Trần Nhật Minh', 'nhatminh@stepup.edu.vn', '0902 333 444', 'Cử nhân Sư phạm Tiếng Anh', 'ĐH Sư phạm TP.HCM', 'Kín lịch', 3, 4.9, 'NM', 'bg-indigo-100 text-indigo-700', '["Giao tiếp", "TOEIC"]', '["Speaking", "Phát âm"]');

-- Insert Classes
INSERT INTO public.classes (id, code, name, program, teacher_id, capacity, schedule, start_date, status, color_key)
VALUES 
('66666666-6666-6666-6666-666666666666', 'IELTS-6.5-A', 'IELTS 6.5 Target', 'IELTS', '44444444-4444-4444-4444-444444444444', 15, 'T3, T5, T7 — 18:00-21:00', '2024-06-01', 'Đang học', 'primary'),
('77777777-7777-7777-7777-777777777777', 'TOEIC-650-B', 'TOEIC 650+', 'TOEIC', '55555555-5555-5555-5555-555555555555', 20, 'T2, T4, T6 — 19:30-21:00', '2024-07-15', 'Sắp mở', 'secondary');

-- Insert Enrollments
INSERT INTO public.enrollments (student_id, class_id, sessions_completed, sessions_total, attendance_rate, status)
VALUES 
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 15, 24, 95, 'Đang học'),
('22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 0, 20, 100, 'Sắp học');

-- Insert Tuition Records
INSERT INTO public.tuition_records (student_id, class_id, total_tuition, amount_paid, amount_owed, due_date, status)
VALUES 
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 9000000, 4500000, 4500000, '2024-08-15', 'Quá hạn'),
('22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 8500000, 0, 8500000, '2024-08-30', 'Sắp đến hạn');

-- Insert Transactions
INSERT INTO public.transactions (description, amount, type, method, transaction_date)
VALUES 
('Thu học phí - Nguyễn Văn An', 4500000, 'income', 'Chuyển khoản', NOW()),
('Thanh toán tiền điện tháng 7', 2150000, 'expense', 'Chuyển khoản', NOW() - INTERVAL '1 day'),
('Thu học phí - Lê Hoàng Minh', 5000000, 'income', 'Tiền mặt', NOW() - INTERVAL '2 days');
