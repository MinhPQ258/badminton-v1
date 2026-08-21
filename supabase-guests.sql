CREATE TABLE session_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  added_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bật Row Level Security
ALTER TABLE session_guests ENABLE ROW LEVEL SECURITY;

-- Cấp quyền truy cập
CREATE POLICY "Cho phép tất cả mọi người đọc danh sách khách" 
ON session_guests FOR SELECT 
USING (true);

CREATE POLICY "Cho phép thành viên được thêm/xóa khách" 
ON session_guests FOR ALL 
USING (auth.role() = 'authenticated');
