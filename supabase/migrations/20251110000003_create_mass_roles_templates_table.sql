-- Create mass_roles_templates table
CREATE TABLE mass_roles_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  parameters JSONB,
  liturgical_contexts TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments documenting the purpose
COMMENT ON TABLE mass_roles_templates IS 'Templates defining ministerial role requirements for different types of Masses';
COMMENT ON COLUMN mass_roles_templates.is_active IS 'Whether this template is currently in use';
COMMENT ON COLUMN mass_roles_templates.liturgical_contexts IS 'Array of liturgical contexts this template applies to: SUNDAY, SOLEMNITY, FEAST, MEMORIAL, WEEKDAY';

-- Enable RLS
ALTER TABLE mass_roles_templates ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_roles_templates TO anon;
GRANT ALL ON mass_roles_templates TO authenticated;
GRANT ALL ON mass_roles_templates TO service_role;

-- Add indexes
CREATE INDEX idx_mass_roles_templates_parish_id ON mass_roles_templates(parish_id);

-- RLS Policies for mass_roles_templates
CREATE POLICY "Parish members can read their parish mass_roles_templates"
  ON mass_roles_templates
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can create mass_roles_templates for their parish"
  ON mass_roles_templates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can update their parish mass_roles_templates"
  ON mass_roles_templates
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can delete their parish mass_roles_templates"
  ON mass_roles_templates
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_mass_roles_templates_updated_at
  BEFORE UPDATE ON mass_roles_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
