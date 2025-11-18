-- Add parish RLS policy that depends on parish_invitations table
-- This policy must be in a separate migration after the parish_invitations table is created

-- Allow users with valid invitation tokens to read parish names
-- This is needed so that new users can see which parish they're joining during signup
CREATE POLICY "Anyone can read parish name via invitation token"
  ON parishes
  FOR SELECT
  TO anon, authenticated
  USING (
    id IN (
      SELECT parish_id FROM parish_invitations
      WHERE accepted_at IS NULL  -- Only active invitations
      AND expires_at > now()      -- Not expired
    )
  );
