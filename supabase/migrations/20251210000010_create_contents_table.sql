-- Create contents table for reusable liturgical content library
-- Contents include readings, prayers, ceremony text that can be selected via picker in event forms

CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT NOT NULL,
  body TEXT NOT NULL, -- Markdown
  language TEXT NOT NULL CHECK (language IN ('en', 'es')),
  description TEXT, -- Optional short preview (user-entered)

  -- Standard fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_contents_parish_id ON contents(parish_id);
CREATE INDEX idx_contents_language ON contents(parish_id, language);
CREATE INDEX idx_contents_title_search ON contents USING gin(to_tsvector('english', title));
CREATE INDEX idx_contents_body_search ON contents USING gin(to_tsvector('english', body));

-- Enable RLS
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON contents TO anon;
GRANT ALL ON contents TO authenticated;
GRANT ALL ON contents TO service_role;

-- RLS Policies

-- SELECT: Parish members can read contents for their parish
CREATE POLICY contents_select_policy ON contents
  FOR SELECT
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
    )
  );

-- INSERT: Admin and Staff can create contents
CREATE POLICY contents_insert_policy ON contents
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );

-- UPDATE: Admin and Staff can update contents
CREATE POLICY contents_update_policy ON contents
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );

-- DELETE: Admin and Staff can delete contents
CREATE POLICY contents_delete_policy ON contents
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER contents_updated_at
  BEFORE UPDATE ON contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
