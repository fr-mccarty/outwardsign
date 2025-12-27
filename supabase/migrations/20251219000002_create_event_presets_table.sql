-- Create event_presets table
-- Purpose: Save event configurations for reuse (presets)
-- Related: master_events, event_types

CREATE TABLE event_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  preset_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE event_presets ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON event_presets TO anon;
GRANT ALL ON event_presets TO authenticated;
GRANT ALL ON event_presets TO service_role;

-- Indexes
CREATE INDEX idx_event_presets_parish_id ON event_presets(parish_id);
CREATE INDEX idx_event_presets_event_type_id ON event_presets(event_type_id);
CREATE INDEX idx_event_presets_created_by ON event_presets(created_by);
CREATE INDEX idx_event_presets_preset_data_gin ON event_presets USING GIN (preset_data);

-- RLS Policies
-- Parish members can read presets for their parish
CREATE POLICY event_presets_select_policy ON event_presets
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Admin, Staff, and Ministry-Leader roles can create presets
CREATE POLICY event_presets_insert_policy ON event_presets
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can update presets
CREATE POLICY event_presets_update_policy ON event_presets
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can delete presets
CREATE POLICY event_presets_delete_policy ON event_presets
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER event_presets_updated_at
  BEFORE UPDATE ON event_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE event_presets IS 'Presets for events that can be reused when creating new events of the same type. Presets save all field_values, presider_id, homilist_id, and calendar event structure (excluding specific datetimes).';
COMMENT ON COLUMN event_presets.preset_data IS 'JSONB storing field_values, presider_id, homilist_id, and calendar event structure. Structure: {field_values: {}, presider_id, homilist_id, calendar_events: {[fieldName]: {location_id, is_all_day, duration_days}}}';
COMMENT ON COLUMN event_presets.created_by IS 'User who created this preset (nullable for system presets or if user is deleted)';
