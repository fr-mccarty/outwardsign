-- Create tag_assignments table
-- Polymorphic many-to-many linking tags to entities (content, petition_template, etc.)

CREATE TABLE tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES category_tags(id) ON DELETE CASCADE,

  -- Polymorphic reference
  entity_type TEXT NOT NULL, -- 'content', 'petition_template'
  entity_id UUID NOT NULL, -- ID of the content/template

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicates
  UNIQUE(tag_id, entity_type, entity_id)
);

-- Indexes
CREATE INDEX idx_tag_assignments_tag_id ON tag_assignments(tag_id);
CREATE INDEX idx_tag_assignments_entity ON tag_assignments(entity_type, entity_id);
CREATE INDEX idx_tag_assignments_composite ON tag_assignments(tag_id, entity_type, entity_id);

-- Enable RLS
ALTER TABLE tag_assignments ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON tag_assignments TO anon;
GRANT ALL ON tag_assignments TO authenticated;
GRANT ALL ON tag_assignments TO service_role;

-- RLS Policies

-- SELECT: Parish members can read assignments for their parish entities
CREATE POLICY tag_assignments_select_policy ON tag_assignments
  FOR SELECT
  USING (
    tag_id IN (
      SELECT ct.id
      FROM category_tags ct
      JOIN parish_users pu ON ct.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
    )
  );

-- INSERT: Admin and Staff can create assignments for their parish entities
CREATE POLICY tag_assignments_insert_policy ON tag_assignments
  FOR INSERT
  WITH CHECK (
    tag_id IN (
      SELECT ct.id
      FROM category_tags ct
      JOIN parish_users pu ON ct.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );

-- DELETE: Admin and Staff can delete assignments for their parish entities
CREATE POLICY tag_assignments_delete_policy ON tag_assignments
  FOR DELETE
  USING (
    tag_id IN (
      SELECT ct.id
      FROM category_tags ct
      JOIN parish_users pu ON ct.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );
