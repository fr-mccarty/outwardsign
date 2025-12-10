-- Create custom_list_items table
-- Purpose: Items within a custom list (ordered options)
-- Related: custom_lists, input_field_definitions

CREATE TABLE custom_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES custom_lists(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_custom_list_item_order_non_negative CHECK ("order" >= 0)
);

-- Enable RLS
ALTER TABLE custom_list_items ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON custom_list_items TO anon;
GRANT ALL ON custom_list_items TO authenticated;
GRANT ALL ON custom_list_items TO service_role;

-- Indexes
CREATE INDEX idx_custom_list_items_list_id ON custom_list_items(list_id);
CREATE INDEX idx_custom_list_items_order ON custom_list_items(list_id, "order") WHERE deleted_at IS NULL;

-- RLS Policies
-- Parish members can read list items for their parish's lists
CREATE POLICY custom_list_items_select_policy ON custom_list_items
  FOR SELECT
  USING (
    list_id IN (
      SELECT cl.id
      FROM custom_lists cl
      JOIN parish_users pu ON cl.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND cl.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Admin, Staff, and Ministry-Leader roles can create list items
CREATE POLICY custom_list_items_insert_policy ON custom_list_items
  FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT cl.id
      FROM custom_lists cl
      JOIN parish_users pu ON cl.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can update list items
CREATE POLICY custom_list_items_update_policy ON custom_list_items
  FOR UPDATE
  USING (
    list_id IN (
      SELECT cl.id
      FROM custom_lists cl
      JOIN parish_users pu ON cl.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can delete list items
CREATE POLICY custom_list_items_delete_policy ON custom_list_items
  FOR DELETE
  USING (
    list_id IN (
      SELECT cl.id
      FROM custom_lists cl
      JOIN parish_users pu ON cl.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );
