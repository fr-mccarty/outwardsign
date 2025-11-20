-- Create mass_assignment table
-- This table stores the actual assignments of people to roles for specific masses
CREATE TABLE mass_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mass_id UUID NOT NULL REFERENCES masses(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE, -- NULL = unassigned
  mass_roles_template_item_id UUID NOT NULL REFERENCES mass_roles_template_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment documenting the purpose
COMMENT ON TABLE mass_assignment IS 'Actual assignments of people to liturgical roles for specific masses';
COMMENT ON COLUMN mass_assignment.person_id IS 'Person assigned to this role. NULL means unassigned (awaiting auto-assignment or manual assignment)';

-- Enable RLS
ALTER TABLE mass_assignment ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_assignment TO anon;
GRANT ALL ON mass_assignment TO authenticated;
GRANT ALL ON mass_assignment TO service_role;

-- Add indexes
CREATE INDEX idx_mass_assignment_mass_id ON mass_assignment(mass_id);
CREATE INDEX idx_mass_assignment_person_id ON mass_assignment(person_id);
CREATE INDEX idx_mass_assignment_template_item_id ON mass_assignment(mass_roles_template_item_id);

-- RLS Policies for mass_assignment
CREATE POLICY "mass_assignment_select"
  ON mass_assignment
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

CREATE POLICY "mass_assignment_insert"
  ON mass_assignment
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

CREATE POLICY "mass_assignment_update"
  ON mass_assignment
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

CREATE POLICY "mass_assignment_delete"
  ON mass_assignment
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
CREATE TRIGGER update_mass_assignment_updated_at
  BEFORE UPDATE ON mass_assignment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
