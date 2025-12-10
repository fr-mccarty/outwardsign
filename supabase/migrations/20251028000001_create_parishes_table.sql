-- Create parishes table
CREATE TABLE parishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS (policies will be added in a later migration)
ALTER TABLE parishes ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON parishes TO anon;
GRANT ALL ON parishes TO authenticated;
GRANT ALL ON parishes TO service_role;

-- Add index for lookups
CREATE INDEX idx_parishes_name ON parishes(name);

-- Permanent INSERT policy - allows authenticated users to create parishes
-- Must apply to both anon and authenticated roles (server-side uses authenticated)
-- Verify user is authenticated with auth.uid() check
CREATE POLICY "Users can create parishes"
  ON parishes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Temporary SELECT policy for setup - will be replaced in migration 20251028000005
CREATE POLICY "Temporary select during setup"
  ON parishes
  FOR SELECT
  TO anon
  USING (true);
