-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Add index
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (user_id = auth.uid());

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO anon, authenticated
  USING (user_id = auth.uid());

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO anon, authenticated
  USING (user_id = auth.uid());

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER auto_create_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
