-- =====================================================
-- Mass Times Templates Table
-- =====================================================
-- Purpose: Define collections of recurring Mass times for different seasons/periods
-- A parish might have multiple templates (e.g., "Regular Schedule", "Summer Schedule", "Advent Schedule")
-- Only one template should typically be active at a time

-- Create mass_times_templates table
CREATE TABLE IF NOT EXISTS mass_times_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Template identification
  name TEXT NOT NULL, -- e.g., "Regular Schedule", "Summer Schedule", "Advent Schedule"
  description TEXT, -- Details about when this template applies

  -- Active status (only one should typically be active at a time)
  is_active BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments documenting the purpose
COMMENT ON TABLE mass_times_templates IS 'Collections of recurring Mass times for different seasons or time periods (e.g., Regular Schedule, Summer Schedule)';
COMMENT ON COLUMN mass_times_templates.name IS 'Template name (e.g., "Regular Schedule", "Summer Schedule", "Advent Schedule")';
COMMENT ON COLUMN mass_times_templates.is_active IS 'Whether this template is currently in use (typically only one active per parish)';

-- Create indexes
CREATE INDEX idx_mass_times_templates_parish_id ON mass_times_templates(parish_id);
CREATE INDEX idx_mass_times_templates_is_active ON mass_times_templates(is_active);

-- Enable RLS
ALTER TABLE mass_times_templates ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_times_templates TO anon;
GRANT ALL ON mass_times_templates TO authenticated;
GRANT ALL ON mass_times_templates TO service_role;

-- RLS Policies
CREATE POLICY "Parish members can read their parish mass times templates"
  ON mass_times_templates
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can create mass times templates for their parish"
  ON mass_times_templates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can update their parish mass times templates"
  ON mass_times_templates
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can delete their parish mass times templates"
  ON mass_times_templates
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_mass_times_templates_updated_at
  BEFORE UPDATE ON mass_times_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
