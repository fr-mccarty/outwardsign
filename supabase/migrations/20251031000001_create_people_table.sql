-- Create people table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  first_name_pronunciation TEXT,
  last_name TEXT NOT NULL,
  last_name_pronunciation TEXT,
  phone_number TEXT,
  email TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zipcode TEXT,
  sex TEXT CHECK (sex IN ('Male', 'Female')),
  note TEXT,

  -- Auto-generated full name
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,

  -- Auto-generated full name pronunciation (falls back to full_name if pronunciation fields are null)
  full_name_pronunciation TEXT GENERATED ALWAYS AS (
    COALESCE(first_name_pronunciation, first_name) || ' ' || COALESCE(last_name_pronunciation, last_name)
  ) STORED,

  -- Mass scheduling availability
  mass_times_template_item_ids UUID[] DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment documenting the mass scheduling field
COMMENT ON COLUMN people.mass_times_template_item_ids IS 'Array of Mass Time Template Item IDs indicating which Masses this person is available to serve at (e.g., Saturday 5pm, Sunday 10am)';

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
CREATE INDEX idx_people_full_name ON people(full_name);
CREATE INDEX idx_people_email ON people(email);
CREATE INDEX idx_people_mass_times_template_item_ids ON people USING GIN (mass_times_template_item_ids);

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
