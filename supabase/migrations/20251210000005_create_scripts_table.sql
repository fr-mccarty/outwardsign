-- Create scripts table
-- Purpose: Ordered collection of sections (e.g., "English Program", "Spanish Program")
-- Related: event_types, sections

CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_script_order_non_negative CHECK ("order" >= 0)
);

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON scripts TO anon;
GRANT ALL ON scripts TO authenticated;
GRANT ALL ON scripts TO service_role;

-- Indexes
CREATE INDEX idx_scripts_event_type_id ON scripts(event_type_id);
CREATE INDEX idx_scripts_order ON scripts(event_type_id, "order") WHERE deleted_at IS NULL;

-- RLS Policies
-- Parish members can read scripts for their parish's event types
CREATE POLICY scripts_select_policy ON scripts
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

-- Admin role can create scripts
CREATE POLICY scripts_insert_policy ON scripts
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

-- Admin role can update scripts
CREATE POLICY scripts_update_policy ON scripts
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

-- Admin role can delete scripts
CREATE POLICY scripts_delete_policy ON scripts
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
CREATE TRIGGER scripts_updated_at
  BEFORE UPDATE ON scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
