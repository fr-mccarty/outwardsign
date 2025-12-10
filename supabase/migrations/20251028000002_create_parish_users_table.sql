-- Create parish_users table (junction table for users and parishes)
CREATE TABLE parish_users (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  roles TEXT[] NOT NULL DEFAULT ARRAY['parishioner']::TEXT[],
  enabled_modules TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
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
CREATE INDEX idx_parish_users_enabled_modules ON parish_users USING GIN(enabled_modules);

-- Column comments
COMMENT ON COLUMN parish_users.enabled_modules IS 'Array of module names that ministry-leader role can access. Possible values: masses, weddings, funerals, baptisms, presentations, quinceaneras, groups. Empty array means no module access for ministry-leaders.';

-- Create a security definer function to check if user is admin of a parish
-- This bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION is_parish_admin(check_parish_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM parish_users
    WHERE user_id = auth.uid()
    AND parish_id = check_parish_id
    AND 'admin' = ANY(roles)
  );
$$;

-- RLS Policies for parish_users
-- Users can read their own record OR all records if they're admin of that parish
CREATE POLICY "Users can read parish memberships"
  ON parish_users
  FOR SELECT
  TO anon, authenticated
  USING (
    user_id = auth.uid()
    OR is_parish_admin(parish_id)
  );

-- Add comment explaining the policy
COMMENT ON POLICY "Users can read parish memberships" ON parish_users IS
  'Allows users to read their own record, or all members if they are admin of that parish.';

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
