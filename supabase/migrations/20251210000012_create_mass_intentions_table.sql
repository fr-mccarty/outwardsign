-- Create mass_intentions table
-- Purpose: Mass intention requests that can be assigned to master_events (Mass type)
CREATE TABLE mass_intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  master_event_id UUID UNIQUE REFERENCES master_events(id) ON DELETE SET NULL,
  mass_offered_for TEXT,
  requested_by_id UUID REFERENCES people(id) ON DELETE SET NULL,
  date_received DATE,
  date_requested DATE,
  stipend_in_cents INTEGER DEFAULT 0,
  status TEXT DEFAULT 'REQUESTED',
  mass_intention_template_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE mass_intentions ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_intentions TO anon;
GRANT ALL ON mass_intentions TO authenticated;
GRANT ALL ON mass_intentions TO service_role;

-- Add indexes
CREATE INDEX idx_mass_intentions_parish_id ON mass_intentions(parish_id);
CREATE INDEX idx_mass_intentions_master_event_id ON mass_intentions(master_event_id);
CREATE INDEX idx_mass_intentions_requested_by_id ON mass_intentions(requested_by_id);
CREATE INDEX idx_mass_intentions_status ON mass_intentions(status);

-- RLS Policies for mass_intentions
CREATE POLICY "Parish members can read their parish mass_intentions"
  ON mass_intentions
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can create mass_intentions for their parish"
  ON mass_intentions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can update their parish mass_intentions"
  ON mass_intentions
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can delete their parish mass_intentions"
  ON mass_intentions
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_mass_intentions_updated_at
  BEFORE UPDATE ON mass_intentions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
