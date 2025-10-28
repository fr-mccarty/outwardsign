-- Create parish_users table (junction table for users and parishes)
CREATE TABLE parish_users (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  roles TEXT[] NOT NULL DEFAULT ARRAY['parishioner']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, parish_id)
);

-- Enable RLS
ALTER TABLE parish_users ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON parish_users TO anon;
GRANT ALL ON parish_users TO authenticated;
GRANT ALL ON parish_users TO service_role;

-- Add indexes
CREATE INDEX idx_parish_users_user_id ON parish_users(user_id);
CREATE INDEX idx_parish_users_parish_id ON parish_users(parish_id);
CREATE INDEX idx_parish_users_roles ON parish_users USING GIN(roles);

-- RLS Policies for parish_users
-- Users can read their own parish_users record
CREATE POLICY "Users can read their own parish memberships"
  ON parish_users
  FOR SELECT
  TO anon, authenticated
  USING (user_id = auth.uid());

-- Users can insert parish_users for themselves (during signup or when creating a parish)
CREATE POLICY "Users can create parish memberships"
  ON parish_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own parish_users record
CREATE POLICY "Users can update their own parish memberships"
  ON parish_users
  FOR UPDATE
  TO anon, authenticated
  USING (user_id = auth.uid());

-- Users can delete their own parish_users record
CREATE POLICY "Users can delete their own parish memberships"
  ON parish_users
  FOR DELETE
  TO anon, authenticated
  USING (user_id = auth.uid());
