-- Create content_tag_assignments table for many-to-many relationship between contents and tags

CREATE TABLE content_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicates
  UNIQUE(content_id, tag_id)
);

-- Indexes
CREATE INDEX idx_content_tag_assignments_content_id ON content_tag_assignments(content_id);
CREATE INDEX idx_content_tag_assignments_tag_id ON content_tag_assignments(tag_id);

-- RLS Policies
ALTER TABLE content_tag_assignments ENABLE ROW LEVEL SECURITY;

-- SELECT: Parish members can read assignments for their parish's contents
CREATE POLICY content_tag_assignments_select_policy ON content_tag_assignments
  FOR SELECT
  USING (
    content_id IN (
      SELECT c.id
      FROM contents c
      JOIN parish_users pu ON c.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
    )
  );

-- INSERT: Admin and Staff can create assignments for their parish's contents
CREATE POLICY content_tag_assignments_insert_policy ON content_tag_assignments
  FOR INSERT
  WITH CHECK (
    content_id IN (
      SELECT c.id
      FROM contents c
      JOIN parish_users pu ON c.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );

-- DELETE: Admin and Staff can delete assignments for their parish's contents
CREATE POLICY content_tag_assignments_delete_policy ON content_tag_assignments
  FOR DELETE
  USING (
    content_id IN (
      SELECT c.id
      FROM contents c
      JOIN parish_users pu ON c.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );
