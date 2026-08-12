-- 1. Create a new bucket for teacher documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'teacher_documents', 
    'teacher_documents', 
    true, -- public bucket for easy PDF/image viewing without signed URLs
    5242880, -- 5MB limit
    '{image/jpeg, image/png, application/pdf}'
)
ON CONFLICT (id) DO UPDATE
SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = '{image/jpeg, image/png, application/pdf}';

-- 2. Setup Storage Policies for 'teacher_documents'
-- Allow public read access to the files
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT
USING (bucket_id = 'teacher_documents');

-- Allow anon to upload files (since we are using anon key)
CREATE POLICY "Allow Uploads" 
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'teacher_documents');

-- Allow anon to update their files
CREATE POLICY "Allow Updates" 
ON storage.objects FOR UPDATE
USING (bucket_id = 'teacher_documents');

-- Allow anon to delete files
CREATE POLICY "Allow Deletes" 
ON storage.objects FOR DELETE
USING (bucket_id = 'teacher_documents');
