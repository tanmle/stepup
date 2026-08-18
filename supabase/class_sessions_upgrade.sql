DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.class_sessions'::regclass
      AND contype = 'c';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.class_sessions DROP CONSTRAINT ' || constraint_name;
    END IF;
    
    ALTER TABLE public.class_sessions ADD CONSTRAINT class_sessions_status_check 
    CHECK (status IN ('Chưa học', 'Đang học', 'Đã học', 'Đã hủy', 'Học bù', 'Nghỉ/Bù'));
END $$;
