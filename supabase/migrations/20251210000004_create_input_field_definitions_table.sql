-- Create input_field_definitions table
-- Purpose: Data field definitions for event types
-- Related: event_types, custom_lists

CREATE TABLE input_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  list_id UUID REFERENCES custom_lists(id) ON DELETE SET NULL,
  event_type_filter_id UUID REFERENCES event_types(id) ON DELETE SET NULL,
  is_key_person BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL,
  filter_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_input_field_type CHECK (type IN ('person', 'group', 'location', 'event_link', 'list_item', 'document', 'text', 'rich_text', 'content', 'petition', 'occasion', 'date', 'time', 'datetime', 'number', 'yes_no', 'mass-intention', 'spacer')),
  CONSTRAINT check_input_field_order_non_negative CHECK ("order" >= 0),
  CONSTRAINT check_is_key_person_only_for_person CHECK (is_key_person = false OR type = 'person'),
  CONSTRAINT check_is_primary_only_for_occasion CHECK (is_primary = false OR type = 'occasion')
);

-- Enable RLS
ALTER TABLE input_field_definitions ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON input_field_definitions TO anon;
GRANT ALL ON input_field_definitions TO authenticated;
GRANT ALL ON input_field_definitions TO service_role;

-- Indexes
CREATE INDEX idx_input_field_definitions_event_type_id ON input_field_definitions(event_type_id);
CREATE INDEX idx_input_field_definitions_list_id ON input_field_definitions(list_id);
CREATE INDEX idx_input_field_definitions_order ON input_field_definitions(event_type_id, "order") WHERE deleted_at IS NULL;

-- Unique index to ensure only one primary occasion per event type
CREATE UNIQUE INDEX idx_input_field_definitions_primary_occasion ON input_field_definitions(event_type_id)
  WHERE is_primary = true AND type = 'occasion' AND deleted_at IS NULL;

-- RLS Policies
-- Parish members can read field definitions for their parish's event types
CREATE POLICY input_field_definitions_select_policy ON input_field_definitions
  FOR SELECT
  USING (
    event_type_id IN (
      SELECT et.id
      FROM event_types et
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND et.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Admin role can create field definitions
CREATE POLICY input_field_definitions_insert_policy ON input_field_definitions
  FOR INSERT
  WITH CHECK (
    event_type_id IN (
      SELECT et.id
      FROM event_types et
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Admin role can update field definitions
CREATE POLICY input_field_definitions_update_policy ON input_field_definitions
  FOR UPDATE
  USING (
    event_type_id IN (
      SELECT et.id
      FROM event_types et
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Admin role can delete field definitions
CREATE POLICY input_field_definitions_delete_policy ON input_field_definitions
  FOR DELETE
  USING (
    event_type_id IN (
      SELECT et.id
      FROM event_types et
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER input_field_definitions_updated_at
  BEFORE UPDATE ON input_field_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
