-- ============================================
-- PARENT CRM UPGRADE - SQL Migration
-- ============================================

-- 1. Add new columns to parents table
ALTER TABLE parents ADD COLUMN IF NOT EXISTS address_province VARCHAR(100);
ALTER TABLE parents ADD COLUMN IF NOT EXISTS address_district VARCHAR(100);
ALTER TABLE parents ADD COLUMN IF NOT EXISTS address_ward VARCHAR(100);
ALTER TABLE parents ADD COLUMN IF NOT EXISTS address_detail TEXT;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS pref_channel VARCHAR(50); -- Zalo, Điện thoại, Email, Facebook
ALTER TABLE parents ADD COLUMN IF NOT EXISTS company VARCHAR(150);
ALTER TABLE parents ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE parents ADD COLUMN IF NOT EXISTS source VARCHAR(100); -- Facebook, Google, Bạn bè giới thiệu...
ALTER TABLE parents ADD COLUMN IF NOT EXISTS source_notes TEXT;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS crm_status VARCHAR(50) DEFAULT 'Tiềm năng'; -- Khách tiềm năng, Đang học, Tạm nghỉ, Đã nghỉ, Khách VIP
ALTER TABLE parents ADD COLUMN IF NOT EXISTS interest_level INTEGER DEFAULT 3; -- 1 to 5 stars

-- 2. Create parent_interactions table for CRM logging
CREATE TABLE IF NOT EXISTS parent_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  interaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type VARCHAR(50) NOT NULL, -- Cuộc gọi, Tin nhắn, Gặp mặt, Khác
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS Policies for parent_interactions
ALTER TABLE parent_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for parent_interactions" ON parent_interactions FOR ALL USING (true) WITH CHECK (true);
