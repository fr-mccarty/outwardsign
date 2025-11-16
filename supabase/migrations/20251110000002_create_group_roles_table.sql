-- Create group_roles table
CREATE TABLE group_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parish_id, name)
);

-- Add comment documenting the purpose
COMMENT ON TABLE group_roles IS 'Group role definitions (Leader, Member, Secretary, etc.) for parish groups';

-- Enable RLS
ALTER TABLE group_roles ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON group_roles TO anon;
GRANT ALL ON group_roles TO authenticated;
GRANT ALL ON group_roles TO service_role;

-- Add indexes
CREATE INDEX idx_group_roles_parish_id ON group_roles(parish_id);
CREATE INDEX idx_group_roles_is_active ON group_roles(is_active);
CREATE INDEX idx_group_roles_display_order ON group_roles(display_order);

-- RLS Policies for group_roles
CREATE POLICY "Parish members can read their parish group_roles"
  ON group_roles
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can create group_roles for their parish"
  ON group_roles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can update their parish group_roles"
  ON group_roles
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can delete their parish group_roles"
  ON group_roles
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_group_roles_updated_at
  BEFORE UPDATE ON group_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
