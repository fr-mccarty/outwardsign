-- Create mass_role_members table for storing people who serve in mass roles
CREATE TABLE mass_role_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  mass_role_id UUID NOT NULL REFERENCES mass_roles(id) ON DELETE CASCADE,

  -- Membership type (MEMBER or LEADER)
  membership_type TEXT NOT NULL DEFAULT 'MEMBER',

  -- Special notes
  notes TEXT,

  -- Active status
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each person can have one membership record per role per parish
  UNIQUE(person_id, parish_id, mass_role_id),

  -- Ensure membership_type is valid
  CHECK (membership_type IN ('MEMBER', 'LEADER'))
);

-- Add comment documenting the purpose
COMMENT ON TABLE mass_role_members IS 'People who serve in liturgical mass roles';

-- Enable RLS
ALTER TABLE mass_role_members ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_role_members TO anon;
GRANT ALL ON mass_role_members TO authenticated;
GRANT ALL ON mass_role_members TO service_role;

-- Add indexes for performance
CREATE INDEX idx_mass_role_prefs_person ON mass_role_members(person_id);
CREATE INDEX idx_mass_role_prefs_parish ON mass_role_members(parish_id);
CREATE INDEX idx_mass_role_prefs_role ON mass_role_members(mass_role_id);
CREATE INDEX idx_mass_role_prefs_active ON mass_role_members(active);

-- RLS Policies for mass_role_members

-- Parish members can read memberships for their parish
CREATE POLICY "Parish members can read their parish mass role members"
  ON mass_role_members
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can create memberships for their parish
CREATE POLICY "Parish members can create mass role members"
  ON mass_role_members
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update memberships for their parish
CREATE POLICY "Parish members can update mass role members"
  ON mass_role_members
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete memberships for their parish
CREATE POLICY "Parish members can delete mass role members"
  ON mass_role_members
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_mass_role_members_updated_at
  BEFORE UPDATE ON mass_role_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
