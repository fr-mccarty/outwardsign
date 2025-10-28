-- Add RLS policies after all tables have been created
-- This migration runs after all table creation to avoid foreign key issues

-- Drop temporary SELECT policy from parishes table
DROP POLICY IF EXISTS "Temporary select during setup" ON parishes;

-- NOTE: INSERT policy "Users can create parishes" already exists from migration 1
-- We don't recreate it here to avoid conflicts

-- RLS Policies for parishes
-- All parish members can read their parish
-- Must use 'anon' role since client connections use anon key with JWT
CREATE POLICY "Parish members can read their parish"
  ON parishes
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Super-admins and admins can update their parish
CREATE POLICY "Super-admins and admins can update their parish"
  ON parishes
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND ('super-admin' = ANY(roles) OR 'admin' = ANY(roles))
    )
  );

-- Only super-admins can delete their parish
CREATE POLICY "Super-admins can delete their parish"
  ON parishes
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND 'super-admin' = ANY(roles)
    )
  );
