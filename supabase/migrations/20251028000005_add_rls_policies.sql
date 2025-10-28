-- Add RLS policies after all tables have been created
-- This migration runs after all table creation to avoid foreign key issues

-- Drop temporary policy from parishes table
DROP POLICY IF EXISTS "Allow all operations during setup" ON parishes;

-- RLS Policies for parishes
-- All parish members can read their parish
CREATE POLICY "Parish members can read their parish"
  ON parishes
  FOR SELECT
  USING (
    id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Anyone can insert parishes (when creating new parish during signup)
CREATE POLICY "Users can create parishes"
  ON parishes
  FOR INSERT
  WITH CHECK (true);

-- Super-admins and admins can update their parish
CREATE POLICY "Super-admins and admins can update their parish"
  ON parishes
  FOR UPDATE
  USING (
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
  USING (
    id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND 'super-admin' = ANY(roles)
    )
  );
