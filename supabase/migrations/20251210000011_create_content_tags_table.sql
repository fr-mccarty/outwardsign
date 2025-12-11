-- Create content_tags table for flat tags categorizing content library items
-- Tags include sacrament types, section types, themes, and testament types

CREATE TABLE content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Tag details
  name TEXT NOT NULL, -- Display name (e.g., "Funeral", "First Reading")
  slug TEXT NOT NULL, -- URL-safe identifier (e.g., "funeral", "first-reading")
  sort_order INTEGER NOT NULL DEFAULT 0, -- For ordering in UI (1-10 sacrament, 11-30 section, etc.)

  -- Optional display
  color TEXT, -- Optional: for UI badges (NULL in MVP)

  -- Standard fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  -- Unique constraint
  UNIQUE(parish_id, slug)
);

-- Indexes
CREATE INDEX idx_content_tags_parish_id ON content_tags(parish_id);
CREATE INDEX idx_content_tags_sort_order ON content_tags(parish_id, sort_order);
CREATE INDEX idx_content_tags_slug ON content_tags(parish_id, slug);

-- RLS Policies
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

-- SELECT: Parish members can read tags for their parish
CREATE POLICY content_tags_select_policy ON content_tags
  FOR SELECT
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
    )
  );

-- INSERT: Admin only can create tags
CREATE POLICY content_tags_insert_policy ON content_tags
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- UPDATE: Admin only can update tags
CREATE POLICY content_tags_update_policy ON content_tags
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- DELETE: Admin only can delete tags
CREATE POLICY content_tags_delete_policy ON content_tags
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
CREATE TRIGGER content_tags_updated_at
  BEFORE UPDATE ON content_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
