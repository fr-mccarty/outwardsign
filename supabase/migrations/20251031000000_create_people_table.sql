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
  sex TEXT CHECK (sex IN ('MALE', 'FEMALE')),
  note TEXT,
  avatar_url TEXT,
  preferred_communication_channel TEXT DEFAULT 'email' CHECK (preferred_communication_channel IN ('email', 'sms')),
  parishioner_portal_enabled BOOLEAN DEFAULT false,
  last_portal_access TIMESTAMPTZ,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'es')),

  -- Auto-generated full name
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,

  -- Auto-generated full name pronunciation (falls back to full_name if pronunciation fields are null)
  full_name_pronunciation TEXT GENERATED ALWAYS AS (
    COALESCE(first_name_pronunciation, first_name) || ' ' || COALESCE(last_name_pronunciation, last_name)
  ) STORED,

  -- Mass scheduling availability
  mass_times_template_item_ids UUID[] DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Add comments documenting fields
COMMENT ON COLUMN people.mass_times_template_item_ids IS 'Array of Mass Time Template Item IDs indicating which Masses this person is available to serve at (e.g., Saturday 5pm, Sunday 10am)';
COMMENT ON COLUMN people.avatar_url IS 'Storage path to profile photo in person-avatars bucket (e.g., parish_id/person_id.jpg)';
COMMENT ON COLUMN people.preferred_communication_channel IS 'How this person prefers to receive reminders and notifications (email or SMS)';
COMMENT ON COLUMN people.parishioner_portal_enabled IS 'Whether this person has access to the parishioner portal';
COMMENT ON COLUMN people.last_portal_access IS 'Last time this person accessed the parishioner portal (for engagement tracking)';
COMMENT ON COLUMN people.preferred_language IS 'Preferred language for portal and communications (en or es)';

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
CREATE INDEX idx_people_portal_enabled ON people(parishioner_portal_enabled) WHERE parishioner_portal_enabled = true;
CREATE INDEX idx_people_preferred_communication_channel ON people(preferred_communication_channel);

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

-- ============================================================================
-- STORAGE BUCKET RLS POLICIES FOR PERSON AVATARS
-- Note: The bucket "person-avatars" must be created manually via Supabase Dashboard
-- or CLI: supabase storage buckets create person-avatars --private
-- ============================================================================

-- SELECT Policy: Parish members can view their parish person avatars
CREATE POLICY "Parish members can view their parish person avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'person-avatars'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
  )
);

-- INSERT Policy: Parish members can upload avatars for their parish
CREATE POLICY "Parish members can upload avatars for their parish"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'person-avatars'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
  )
);

-- UPDATE Policy: Parish members can update avatars for their parish
CREATE POLICY "Parish members can update avatars for their parish"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'person-avatars'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
  )
);

-- DELETE Policy: Parish members can delete avatars for their parish
CREATE POLICY "Parish members can delete avatars for their parish"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'person-avatars'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
  )
);
