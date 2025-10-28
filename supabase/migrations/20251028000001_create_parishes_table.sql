-- Create parishes table
CREATE TABLE parishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (policies will be added in a later migration)
ALTER TABLE parishes ENABLE ROW LEVEL SECURITY;

-- Add index for lookups
CREATE INDEX idx_parishes_name ON parishes(name);

-- Temporary policy to allow all operations during setup
-- This will be replaced by proper policies in migration 20251028000005
CREATE POLICY "Allow all operations during setup"
  ON parishes
  FOR ALL
  USING (true)
  WITH CHECK (true);
