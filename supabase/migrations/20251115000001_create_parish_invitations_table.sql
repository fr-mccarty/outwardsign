-- Create parish_invitations table for inviting new members to parishes
CREATE TABLE parish_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  roles TEXT[] NOT NULL DEFAULT ARRAY['parishioner']::TEXT[],
  enabled_modules TEXT[] DEFAULT ARRAY[]::TEXT[], -- For ministry-leader role: which modules they can access
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  invited_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE parish_invitations ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON parish_invitations TO anon;
GRANT ALL ON parish_invitations TO authenticated;
GRANT ALL ON parish_invitations TO service_role;

-- Add indexes
CREATE INDEX idx_parish_invitations_parish_id ON parish_invitations(parish_id);
CREATE INDEX idx_parish_invitations_email ON parish_invitations(email);
CREATE INDEX idx_parish_invitations_token ON parish_invitations(token);
CREATE INDEX idx_parish_invitations_expires_at ON parish_invitations(expires_at);
CREATE INDEX idx_parish_invitations_accepted_at ON parish_invitations(accepted_at);

-- Column comments
COMMENT ON COLUMN parish_invitations.roles IS 'Array of roles to assign to the user when they accept the invitation. Possible values: admin, staff, ministry-leader, parishioner.';
COMMENT ON COLUMN parish_invitations.enabled_modules IS 'Array of module names that ministry-leader role can access. Only used when roles includes ministry-leader. Possible values: masses, weddings, funerals, baptisms, presentations, quinceaneras, groups.';
COMMENT ON COLUMN parish_invitations.token IS 'Unique token used in the invitation link. Generated server-side with crypto.randomUUID().';

-- RLS Policies for parish_invitations

-- Admins and staff can read all invitations for their parish
CREATE POLICY "Admins and staff can read parish invitations"
  ON parish_invitations
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND ('admin' = ANY(roles) OR 'staff' = ANY(roles))
    )
  );

-- Admins and staff can create invitations for their parish
CREATE POLICY "Admins and staff can create parish invitations"
  ON parish_invitations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND ('admin' = ANY(roles) OR 'staff' = ANY(roles))
    )
  );

-- Admins and staff can delete (revoke) invitations for their parish
CREATE POLICY "Admins and staff can delete parish invitations"
  ON parish_invitations
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND ('admin' = ANY(roles) OR 'staff' = ANY(roles))
    )
  );

-- Anyone can read invitation by token (for accepting invitation)
-- Note: This policy is needed for the public invitation acceptance flow
CREATE POLICY "Anyone can read invitation by token"
  ON parish_invitations
  FOR SELECT
  TO anon, authenticated
  USING (token IS NOT NULL);
