-- Create master_event_templates table
-- Purpose: Save master event configurations for reuse (templates)
-- Related: master_events, event_types

CREATE TABLE master_event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE master_event_templates ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON master_event_templates TO anon;
GRANT ALL ON master_event_templates TO authenticated;
GRANT ALL ON master_event_templates TO service_role;

-- Indexes
CREATE INDEX idx_master_event_templates_parish_id ON master_event_templates(parish_id);
CREATE INDEX idx_master_event_templates_event_type_id ON master_event_templates(event_type_id);
CREATE INDEX idx_master_event_templates_created_by ON master_event_templates(created_by);
CREATE INDEX idx_master_event_templates_template_data_gin ON master_event_templates USING GIN (template_data);

-- RLS Policies
-- Parish members can read templates for their parish
CREATE POLICY master_event_templates_select_policy ON master_event_templates
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Admin, Staff, and Ministry-Leader roles can create templates
CREATE POLICY master_event_templates_insert_policy ON master_event_templates
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can update templates
CREATE POLICY master_event_templates_update_policy ON master_event_templates
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can delete templates
CREATE POLICY master_event_templates_delete_policy ON master_event_templates
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
CREATE TRIGGER master_event_templates_updated_at
  BEFORE UPDATE ON master_event_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE master_event_templates IS 'Templates for master events that can be reused when creating new events of the same type. Templates save all field_values, presider_id, homilist_id, and calendar event structure (excluding specific datetimes).';
COMMENT ON COLUMN master_event_templates.template_data IS 'JSONB storing field_values, presider_id, homilist_id, and calendar event structure. Structure: {field_values: {}, presider_id, homilist_id, calendar_events: {[fieldName]: {location_id, is_all_day, duration_days}}}';
COMMENT ON COLUMN master_event_templates.created_by IS 'User who created this template (nullable for system templates or if user is deleted)';
