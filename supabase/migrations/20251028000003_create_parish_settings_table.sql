-- Create parish_settings table
CREATE TABLE parish_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE UNIQUE,
  mass_intention_offering_quick_amounts JSONB NOT NULL DEFAULT '[]'::JSONB,
  donations_quick_amounts JSONB NOT NULL DEFAULT '[]'::JSONB,
  liturgical_locale TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE parish_settings ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON parish_settings TO anon;
GRANT ALL ON parish_settings TO authenticated;
GRANT ALL ON parish_settings TO service_role;

-- Add index
CREATE INDEX idx_parish_settings_parish_id ON parish_settings(parish_id);

-- RLS Policies for parish_settings
-- All parish members can read parish settings
CREATE POLICY "Parish members can read parish settings"
  ON parish_settings
  FOR SELECT
  TO anon, authenticated
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Anyone can insert parish_settings (for auto-creation trigger)
-- No role restriction needed since trigger uses SECURITY DEFINER
CREATE POLICY "Auto-create parish settings"
  ON parish_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins and super-admins can update parish settings
CREATE POLICY "Admins can update parish settings"
  ON parish_settings
  FOR UPDATE
  TO anon, authenticated
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND ('admin' = ANY(roles) OR 'super-admin' = ANY(roles))
    )
  );

-- Only super-admins can delete parish settings
CREATE POLICY "Super-admins can delete parish settings"
  ON parish_settings
  FOR DELETE
  TO anon, authenticated
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND 'super-admin' = ANY(roles)
    )
  );

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_parish_settings_updated_at
  BEFORE UPDATE ON parish_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-create parish_settings when a parish is created
-- Uses SECURITY DEFINER to bypass RLS policies during parish creation
CREATE OR REPLACE FUNCTION create_parish_settings()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.parish_settings (parish_id)
  VALUES (NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail parish creation
    RAISE WARNING 'Failed to create parish_settings for parish %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER auto_create_parish_settings
  AFTER INSERT ON parishes
  FOR EACH ROW
  EXECUTE FUNCTION create_parish_settings();

-- Column comments
COMMENT ON COLUMN parish_settings.liturgical_locale IS 'Locale preference for liturgical calendar events (e.g., "en", "es")';
