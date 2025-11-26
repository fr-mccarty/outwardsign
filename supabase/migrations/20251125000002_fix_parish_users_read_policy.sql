-- Fix RLS policy for parish_users to allow admins to see all members of their parish
-- Regular users can only see their own record

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

-- Drop the old policy
DROP POLICY IF EXISTS "Users can read their own parish memberships" ON parish_users;

-- Single policy: Users can read their own record OR all records if they're admin of that parish
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
