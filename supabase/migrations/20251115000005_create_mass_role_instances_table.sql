-- Create mass_role_instances table
-- This table stores the actual assignments of people to roles for specific masses
CREATE TABLE mass_role_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mass_id UUID NOT NULL REFERENCES masses(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE, -- NULL = unassigned
  mass_roles_template_item_id UUID NOT NULL REFERENCES mass_roles_template_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment documenting the purpose
COMMENT ON TABLE mass_role_instances IS 'Actual assignments of people to liturgical roles for specific masses';
COMMENT ON COLUMN mass_role_instances.person_id IS 'Person assigned to this role instance. NULL means unassigned (awaiting auto-assignment or manual assignment)';

-- Enable RLS
ALTER TABLE mass_role_instances ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_role_instances TO anon;
GRANT ALL ON mass_role_instances TO authenticated;
GRANT ALL ON mass_role_instances TO service_role;

-- Add indexes
CREATE INDEX idx_mass_role_instances_mass_id ON mass_role_instances(mass_id);
CREATE INDEX idx_mass_role_instances_person_id ON mass_role_instances(person_id);
CREATE INDEX idx_mass_role_instances_template_item_id ON mass_role_instances(mass_roles_template_item_id);

-- RLS Policies for mass_role_instances
CREATE POLICY "mass_role_instances_select"
  ON mass_role_instances
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

CREATE POLICY "mass_role_instances_insert"
  ON mass_role_instances
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

CREATE POLICY "mass_role_instances_update"
  ON mass_role_instances
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

CREATE POLICY "mass_role_instances_delete"
  ON mass_role_instances
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
CREATE TRIGGER update_mass_role_instances_updated_at
  BEFORE UPDATE ON mass_role_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
