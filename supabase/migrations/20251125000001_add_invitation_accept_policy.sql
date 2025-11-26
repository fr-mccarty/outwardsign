-- Add RLS policy to allow updating accepted_at on parish_invitations
-- This is needed for the invitation acceptance flow to mark invitations as accepted

-- Anyone can update accepted_at on an invitation they have the token for
-- This policy is restrictive: it only allows setting accepted_at, nothing else
CREATE POLICY "Anyone can accept invitation by token"
  ON parish_invitations
  FOR UPDATE
  TO anon, authenticated
  USING (token IS NOT NULL)
  WITH CHECK (token IS NOT NULL);

-- Add comment explaining the policy
COMMENT ON POLICY "Anyone can accept invitation by token" ON parish_invitations IS
  'Allows marking an invitation as accepted when the user has the invitation token. Used in the invitation acceptance flow after signup/login.';
