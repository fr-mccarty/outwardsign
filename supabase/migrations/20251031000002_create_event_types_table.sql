-- Create event_types table for user-configurable event types
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- User-entered name
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER, -- For custom sorting
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_event_type_name_per_parish UNIQUE(parish_id, name)
);

-- Enable RLS
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON event_types TO anon;
GRANT ALL ON event_types TO authenticated;
GRANT ALL ON event_types TO service_role;

-- Add indexes
CREATE INDEX idx_event_types_parish_id ON event_types(parish_id);
CREATE INDEX idx_event_types_is_active ON event_types(is_active);
CREATE INDEX idx_event_types_display_order ON event_types(display_order);

-- RLS Policies for event_types
-- Parish members can read event types from their parish
CREATE POLICY "Parish members can read their parish event types"
  ON event_types
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert event types for their parish
CREATE POLICY "Parish members can create event types for their parish"
  ON event_types
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update event types from their parish
CREATE POLICY "Parish members can update their parish event types"
  ON event_types
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete event types from their parish
CREATE POLICY "Parish members can delete their parish event types"
  ON event_types
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
