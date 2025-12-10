-- Create masses table
CREATE TABLE masses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  homilist_id UUID REFERENCES people(id) ON DELETE SET NULL,
  liturgical_event_id UUID REFERENCES global_liturgical_events(id) ON DELETE SET NULL,
  mass_roles_template_id UUID REFERENCES mass_roles_templates(id) ON DELETE SET NULL,
  mass_time_template_item_id UUID REFERENCES mass_times_template_items(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PLANNING',
  mass_template_id TEXT,
  name TEXT,
  description TEXT,
  announcements TEXT,
  note TEXT,
  petitions TEXT,
  liturgical_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Add comments documenting mass scheduling fields
COMMENT ON COLUMN masses.mass_time_template_item_id IS 'Which time template item this Mass corresponds to (e.g., Sunday 10:00am from Regular Schedule)';
COMMENT ON COLUMN masses.name IS 'Name of the Mass (e.g., "Sunday Mass - 3rd Sunday of Advent")';
COMMENT ON COLUMN masses.description IS 'Additional details about this Mass';
COMMENT ON COLUMN masses.liturgical_color IS 'The liturgical color for this Mass (e.g., Green, White, Red, Purple, Rose)';

-- Enable RLS
ALTER TABLE masses ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON masses TO anon;
GRANT ALL ON masses TO authenticated;
GRANT ALL ON masses TO service_role;

-- Add indexes
CREATE INDEX idx_masses_parish_id ON masses(parish_id);
CREATE INDEX idx_masses_event_id ON masses(event_id);
CREATE INDEX idx_masses_presider_id ON masses(presider_id);
CREATE INDEX idx_masses_liturgical_event_id ON masses(liturgical_event_id);
CREATE INDEX idx_masses_mass_roles_template_id ON masses(mass_roles_template_id);
CREATE INDEX idx_masses_mass_time_template_item_id ON masses(mass_time_template_item_id);
CREATE INDEX idx_masses_status ON masses(status);
CREATE INDEX idx_masses_liturgical_color ON masses(liturgical_color);

-- RLS Policies for masses
CREATE POLICY "Parish members can read their parish masses"
  ON masses
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can create masses for their parish"
  ON masses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can update their parish masses"
  ON masses
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can delete their parish masses"
  ON masses
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_masses_updated_at
  BEFORE UPDATE ON masses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
