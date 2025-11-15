-- Create mass_roles junction table
CREATE TABLE mass_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mass_id UUID NOT NULL REFERENCES masses(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  parameters JSONB,
  status TEXT DEFAULT 'ASSIGNED',
  confirmed_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mass_id, person_id, role_id)
);

-- Add comment documenting status values
COMMENT ON COLUMN mass_roles.status IS 'Status: ASSIGNED | CONFIRMED | DECLINED | SUBSTITUTE_REQUESTED | SUBSTITUTE_FOUND | NO_SHOW';

-- Enable RLS
ALTER TABLE mass_roles ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_roles TO anon;
GRANT ALL ON mass_roles TO authenticated;
GRANT ALL ON mass_roles TO service_role;

-- Add indexes
CREATE INDEX idx_mass_roles_mass_id ON mass_roles(mass_id);
CREATE INDEX idx_mass_roles_person_id ON mass_roles(person_id);
CREATE INDEX idx_mass_roles_role_id ON mass_roles(role_id);
CREATE INDEX idx_mass_roles_status ON mass_roles(status);

-- RLS Policies for mass_roles
CREATE POLICY "Parish members can read mass_roles for their parish masses"
  ON mass_roles
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    mass_id IN (
      SELECT id FROM masses WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parish members can create mass_roles for their parish masses"
  ON mass_roles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    mass_id IN (
      SELECT id FROM masses WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parish members can update mass_roles for their parish masses"
  ON mass_roles
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    mass_id IN (
      SELECT id FROM masses WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parish members can delete mass_roles for their parish masses"
  ON mass_roles
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    mass_id IN (
      SELECT id FROM masses WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_mass_roles_updated_at
  BEFORE UPDATE ON mass_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
