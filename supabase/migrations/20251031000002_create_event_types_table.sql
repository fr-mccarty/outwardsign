-- Create event_types table for user-defined event types
-- Purpose: User-defined event categories (Wedding, Funeral, Baptism, etc.)
-- Related: input_field_definitions, scripts

CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'FileText',
  "order" INTEGER NOT NULL DEFAULT 0,
  slug TEXT,
  system_type TEXT NOT NULL DEFAULT 'parish-event',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_event_type_name_per_parish UNIQUE (parish_id, name),
  CONSTRAINT unique_event_type_slug_per_parish UNIQUE (parish_id, slug),
  CONSTRAINT check_event_type_order_non_negative CHECK ("order" >= 0),
  CONSTRAINT event_types_system_type_check CHECK (system_type IN ('mass-liturgy', 'special-liturgy', 'parish-event'))
);

-- Enable RLS
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON event_types TO anon;
GRANT ALL ON event_types TO authenticated;
GRANT ALL ON event_types TO service_role;

-- Indexes
CREATE INDEX idx_event_types_parish_id ON event_types(parish_id);
CREATE INDEX idx_event_types_order ON event_types(parish_id, "order") WHERE deleted_at IS NULL;
CREATE INDEX idx_event_types_slug ON event_types(parish_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_event_types_system_type ON event_types(parish_id, system_type) WHERE deleted_at IS NULL;

-- Column comments
COMMENT ON COLUMN event_types.slug IS 'URL-safe identifier for event type (e.g., "weddings", "funerals"). Auto-generated from name but can be edited by admins. Must be unique per parish.';
COMMENT ON COLUMN event_types.system_type IS 'System type for UI organization (mass-liturgy, special-liturgy, parish-event)';

-- RLS Policies
-- Parish members can read event types for their parish
CREATE POLICY event_types_select_policy ON event_types
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id
      FROM parish_users
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Admin role can create event types
CREATE POLICY event_types_insert_policy ON event_types
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Admin role can update event types
CREATE POLICY event_types_update_policy ON event_types
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Admin role can delete event types
CREATE POLICY event_types_delete_policy ON event_types
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
