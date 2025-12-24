-- Create category_tags table
-- Shared tag definitions used across all entity types (content, petition_template, etc.)

CREATE TABLE category_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Tag details
  name TEXT NOT NULL, -- Display name (e.g., "Wedding", "Funeral")
  slug TEXT NOT NULL, -- URL-safe identifier (e.g., "wedding", "funeral")
  sort_order INTEGER NOT NULL DEFAULT 0, -- For ordering in UI

  -- Optional display
  color TEXT, -- Optional: for UI badges

  -- Standard fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  -- Unique constraint
  UNIQUE(parish_id, slug)
);

-- Indexes
CREATE INDEX idx_category_tags_parish_id ON category_tags(parish_id);
CREATE INDEX idx_category_tags_sort_order ON category_tags(parish_id, sort_order);
CREATE INDEX idx_category_tags_slug ON category_tags(parish_id, slug);

-- Enable RLS
ALTER TABLE category_tags ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON category_tags TO anon;
GRANT ALL ON category_tags TO authenticated;
GRANT ALL ON category_tags TO service_role;

-- RLS Policies

-- SELECT: Parish members can read tags for their parish
CREATE POLICY category_tags_select_policy ON category_tags
  FOR SELECT
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
    )
  );

-- INSERT: Admin only can create tags
CREATE POLICY category_tags_insert_policy ON category_tags
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
CREATE POLICY category_tags_update_policy ON category_tags
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
CREATE POLICY category_tags_delete_policy ON category_tags
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
CREATE TRIGGER category_tags_updated_at
  BEFORE UPDATE ON category_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
