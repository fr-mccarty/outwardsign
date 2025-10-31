-- Create people table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zipcode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON people TO anon;
GRANT ALL ON people TO authenticated;
GRANT ALL ON people TO service_role;

-- Add indexes
CREATE INDEX idx_people_parish_id ON people(parish_id);
CREATE INDEX idx_people_last_name ON people(last_name);
CREATE INDEX idx_people_first_name ON people(first_name);
CREATE INDEX idx_people_email ON people(email);

-- RLS Policies for people
-- Parish members can read people from their parish
CREATE POLICY "Parish members can read their parish people"
  ON people
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert people for their parish
CREATE POLICY "Parish members can create people for their parish"
  ON people
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update people from their parish
CREATE POLICY "Parish members can update their parish people"
  ON people
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete people from their parish
CREATE POLICY "Parish members can delete their parish people"
  ON people
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on people
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
