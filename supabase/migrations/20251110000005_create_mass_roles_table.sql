-- Create mass_roles table for liturgical role definitions
CREATE TABLE mass_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parish_id, name)
);

-- Add comment documenting the purpose
COMMENT ON TABLE mass_roles IS 'Liturgical role definitions (Lector, Usher, Server, etc.) for Mass';

-- Enable RLS
ALTER TABLE mass_roles ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_roles TO anon;
GRANT ALL ON mass_roles TO authenticated;
GRANT ALL ON mass_roles TO service_role;

-- Add indexes
CREATE INDEX idx_mass_roles_parish_id ON mass_roles(parish_id);

-- RLS Policies for mass_roles
CREATE POLICY "Parish members can read their parish mass_roles"
  ON mass_roles
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can create mass_roles for their parish"
  ON mass_roles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can update their parish mass_roles"
  ON mass_roles
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can delete their parish mass_roles"
  ON mass_roles
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_mass_roles_updated_at
  BEFORE UPDATE ON mass_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
