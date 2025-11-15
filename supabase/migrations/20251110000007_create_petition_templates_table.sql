-- Create petition_templates table
CREATE TABLE petition_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  context TEXT NOT NULL,
  module TEXT,
  language TEXT DEFAULT 'en',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE petition_templates ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON petition_templates TO anon;
GRANT ALL ON petition_templates TO authenticated;
GRANT ALL ON petition_templates TO service_role;

-- Add indexes
CREATE INDEX idx_petition_templates_parish_id ON petition_templates(parish_id);
CREATE INDEX idx_petition_templates_module ON petition_templates(module);
CREATE INDEX idx_petition_templates_language ON petition_templates(language);
CREATE INDEX idx_petition_templates_parish_module ON petition_templates(parish_id, module);

-- Add comments
COMMENT ON COLUMN petition_templates.module IS 'Module this template applies to: mass, wedding, funeral, baptism, presentation, quinceanera, mass-intention';
COMMENT ON COLUMN petition_templates.language IS 'Language of the template: en (English), es (Spanish), or bilingual';
COMMENT ON COLUMN petition_templates.is_default IS 'Whether this is a system-provided default template (true) or custom parish template (false)';

-- RLS Policies for petition_templates
CREATE POLICY "Parish members can read petition_templates for their parish"
  ON petition_templates
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can create petition_templates for their parish"
  ON petition_templates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can update petition_templates for their parish"
  ON petition_templates
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can delete petition_templates for their parish"
  ON petition_templates
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_petition_templates_updated_at
  BEFORE UPDATE ON petition_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
