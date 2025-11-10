-- Create roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parish_id, name)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON roles TO anon;
GRANT ALL ON roles TO authenticated;
GRANT ALL ON roles TO service_role;

-- Add indexes
CREATE INDEX idx_roles_parish_id ON roles(parish_id);

-- RLS Policies for roles
CREATE POLICY "Parish members can read their parish roles"
  ON roles
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can create roles for their parish"
  ON roles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can update their parish roles"
  ON roles
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parish members can delete their parish roles"
  ON roles
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
