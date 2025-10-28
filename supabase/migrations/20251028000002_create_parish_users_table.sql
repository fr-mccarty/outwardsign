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

-- Add indexes
CREATE INDEX idx_parish_users_user_id ON parish_users(user_id);
CREATE INDEX idx_parish_users_parish_id ON parish_users(parish_id);
CREATE INDEX idx_parish_users_roles ON parish_users USING GIN(roles);

-- RLS Policies for parish_users
-- Users can read their own parish_users record
CREATE POLICY "Users can read their own parish memberships"
  ON parish_users
  FOR SELECT
  USING (user_id = auth.uid());

-- Staff and above can read all parish_users in their parish
CREATE POLICY "Staff can read parish members"
  ON parish_users
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND ('staff' = ANY(roles) OR 'admin' = ANY(roles) OR 'super-admin' = ANY(roles))
    )
  );

-- Anyone can insert parish_users (during signup or when creating a parish)
CREATE POLICY "Users can create parish memberships"
  ON parish_users
  FOR INSERT
  WITH CHECK (true);

-- Super-admins and admins can update parish_users in their parish
CREATE POLICY "Admins can update parish memberships"
  ON parish_users
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND ('admin' = ANY(roles) OR 'super-admin' = ANY(roles))
    )
  );

-- Super-admins and admins can delete parish_users in their parish
CREATE POLICY "Admins can delete parish memberships"
  ON parish_users
  FOR DELETE
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND ('admin' = ANY(roles) OR 'super-admin' = ANY(roles))
    )
  );
