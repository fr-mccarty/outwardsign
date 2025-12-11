-- Create sections table
-- Purpose: Rich text blocks with placeholders, belongs to one script
-- Related: scripts

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'text', -- 'text' | 'petition'
  content TEXT NOT NULL DEFAULT '', -- Markdown with placeholders (for text type)
  page_break_after BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_section_order_non_negative CHECK ("order" >= 0),
  CONSTRAINT check_section_type_valid CHECK (section_type IN ('text', 'petition'))
);

-- Enable RLS
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON sections TO anon;
GRANT ALL ON sections TO authenticated;
GRANT ALL ON sections TO service_role;

-- Indexes
CREATE INDEX idx_sections_script_id ON sections(script_id);
CREATE INDEX idx_sections_order ON sections(script_id, "order") WHERE deleted_at IS NULL;

-- RLS Policies
-- Parish members can read sections for their parish's scripts
CREATE POLICY sections_select_policy ON sections
  FOR SELECT
  USING (
    script_id IN (
      SELECT s.id
      FROM scripts s
      JOIN event_types et ON s.event_type_id = et.id
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND et.deleted_at IS NULL
        AND s.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Admin role can create sections
CREATE POLICY sections_insert_policy ON sections
  FOR INSERT
  WITH CHECK (
    script_id IN (
      SELECT s.id
      FROM scripts s
      JOIN event_types et ON s.event_type_id = et.id
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Admin role can update sections
CREATE POLICY sections_update_policy ON sections
  FOR UPDATE
  USING (
    script_id IN (
      SELECT s.id
      FROM scripts s
      JOIN event_types et ON s.event_type_id = et.id
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Admin role can delete sections
CREATE POLICY sections_delete_policy ON sections
  FOR DELETE
  USING (
    script_id IN (
      SELECT s.id
      FROM scripts s
      JOIN event_types et ON s.event_type_id = et.id
      JOIN parish_users pu ON et.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
