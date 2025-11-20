-- Create mass_roles_template_items table
-- This table stores the individual role items within each mass role template
-- Each item represents one role requirement (e.g., "2 Lectors", "4 Eucharistic Ministers")
CREATE TABLE mass_roles_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mass_roles_template_id UUID NOT NULL REFERENCES mass_roles_templates(id) ON DELETE CASCADE,
  mass_role_id UUID NOT NULL REFERENCES mass_roles(id) ON DELETE RESTRICT,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  note TEXT,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each template can have each role only once
  UNIQUE(mass_roles_template_id, mass_role_id),

  -- Each position in a template must be unique
  UNIQUE(mass_roles_template_id, position)
);

-- Add comments for documentation
COMMENT ON TABLE mass_roles_template_items IS 'Individual role items within mass role templates, defining which roles are needed and how many of each';
COMMENT ON COLUMN mass_roles_template_items.mass_roles_template_id IS 'Which template this item belongs to';
COMMENT ON COLUMN mass_roles_template_items.count IS 'Number of people needed for this role (minimum 1)';
COMMENT ON COLUMN mass_roles_template_items.note IS 'Additional notes about this requirement (e.g., "1st and 2nd readings")';
COMMENT ON COLUMN mass_roles_template_items.position IS 'Zero-based ordering position for drag-and-drop sorting (0, 1, 2, ...)';

-- Enable RLS
ALTER TABLE mass_roles_template_items ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_roles_template_items TO anon;
GRANT ALL ON mass_roles_template_items TO authenticated;
GRANT ALL ON mass_roles_template_items TO service_role;

-- Add indexes for performance
CREATE INDEX idx_template_items_template_id ON mass_roles_template_items(mass_roles_template_id);
CREATE INDEX idx_template_items_mass_role_id ON mass_roles_template_items(mass_role_id);
CREATE INDEX idx_template_items_position ON mass_roles_template_items(mass_roles_template_id, position);

-- RLS Policies
CREATE POLICY "Parish members can read their parish template items"
  ON mass_roles_template_items
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    mass_roles_template_id IN (
      SELECT id FROM mass_roles_templates WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parish members can create items for their parish templates"
  ON mass_roles_template_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    mass_roles_template_id IN (
      SELECT id FROM mass_roles_templates WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parish members can update their parish template items"
  ON mass_roles_template_items
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    mass_roles_template_id IN (
      SELECT id FROM mass_roles_templates WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parish members can delete their parish template items"
  ON mass_roles_template_items
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    mass_roles_template_id IN (
      SELECT id FROM mass_roles_templates WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_mass_roles_template_items_updated_at
  BEFORE UPDATE ON mass_roles_template_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
