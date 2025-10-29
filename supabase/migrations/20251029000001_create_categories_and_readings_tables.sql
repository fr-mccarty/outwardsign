-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON categories TO anon;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON categories TO service_role;

-- Add indexes
CREATE INDEX idx_categories_parish_id ON categories(parish_id);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- RLS Policies for categories
-- Parish members can read categories from their parish
CREATE POLICY "Parish members can read their parish categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert categories for their parish
CREATE POLICY "Parish members can create categories for their parish"
  ON categories
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update categories from their parish
CREATE POLICY "Parish members can update their parish categories"
  ON categories
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete categories from their parish
CREATE POLICY "Parish members can delete their parish categories"
  ON categories
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );


-- Create readings table
CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  pericope TEXT NOT NULL,
  text TEXT NOT NULL,
  introduction TEXT,
  conclusion TEXT,
  language TEXT,
  lectionary_id TEXT,
  categories JSONB,
  reading_category_ids TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON readings TO anon;
GRANT ALL ON readings TO authenticated;
GRANT ALL ON readings TO service_role;

-- Add indexes
CREATE INDEX idx_readings_parish_id ON readings(parish_id);
CREATE INDEX idx_readings_pericope ON readings(pericope);
CREATE INDEX idx_readings_language ON readings(language);
CREATE INDEX idx_readings_lectionary_id ON readings(lectionary_id);
CREATE INDEX idx_readings_category_ids ON readings USING GIN(reading_category_ids);

-- RLS Policies for readings
-- Parish members can read readings from their parish
CREATE POLICY "Parish members can read their parish readings"
  ON readings
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert readings for their parish
CREATE POLICY "Parish members can create readings for their parish"
  ON readings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update readings from their parish
CREATE POLICY "Parish members can update their parish readings"
  ON readings
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete readings from their parish
CREATE POLICY "Parish members can delete their parish readings"
  ON readings
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on readings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_readings_updated_at
  BEFORE UPDATE ON readings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
