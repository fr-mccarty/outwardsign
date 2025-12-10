-- Create custom_lists table
-- Purpose: Parish-defined option sets (songs, readings, etc.)
-- Related: custom_list_items, input_field_definitions

CREATE TABLE custom_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_custom_list_name_per_parish UNIQUE (parish_id, name),
  CONSTRAINT unique_custom_list_slug_per_parish UNIQUE (parish_id, slug)
);

-- Enable RLS
ALTER TABLE custom_lists ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON custom_lists TO anon;
GRANT ALL ON custom_lists TO authenticated;
GRANT ALL ON custom_lists TO service_role;

-- Indexes
CREATE INDEX idx_custom_lists_parish_id ON custom_lists(parish_id);

-- RLS Policies
-- Parish members can read custom lists for their parish
CREATE POLICY custom_lists_select_policy ON custom_lists
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id
      FROM parish_users
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Admin, Staff, and Ministry-Leader roles can create custom lists
CREATE POLICY custom_lists_insert_policy ON custom_lists
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can update custom lists
CREATE POLICY custom_lists_update_policy ON custom_lists
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can delete custom lists
CREATE POLICY custom_lists_delete_policy ON custom_lists
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
CREATE TRIGGER custom_lists_updated_at
  BEFORE UPDATE ON custom_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
