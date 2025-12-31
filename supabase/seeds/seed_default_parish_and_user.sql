-- ============================================================
-- HOW TO RUN THIS SCRIPT
-- ============================================================
-- This seed file should be run BEFORE seed_modules.sql
-- supabase seed
-- ============================================================

-- Seed script to create a default parish and test user for development
-- IMPORTANT: This is for development only. In production, users/parishes are created through the application.

-- Create a default test parish
INSERT INTO parishes (id, name, slug, city, state, country, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'St. Mary''s Catholic Church',
  'st-marys-catholic-church',
  'Springfield',
  'Illinois',
  'United States',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug;

-- Create parish settings for the default parish
INSERT INTO parish_settings (parish_id, mass_intention_offering_quick_amount, donations_quick_amount, liturgical_locale, public_calendar_enabled, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  '[{"amount": 1000, "label": "$10"}, {"amount": 2000, "label": "$20"}, {"amount": 5000, "label": "$50"}]'::JSONB,
  '[{"amount": 1000, "label": "$10"}, {"amount": 2000, "label": "$20"}, {"amount": 5000, "label": "$50"}, {"amount": 10000, "label": "$100"}]'::JSONB,
  'en_US',
  true,
  now(),
  now()
)
ON CONFLICT (parish_id) DO UPDATE SET
  public_calendar_enabled = EXCLUDED.public_calendar_enabled;

-- Create a test user using Supabase's auth.users table structure
-- This approach properly sets up the user for email/password authentication
DO $$
DECLARE
  v_user_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
  v_encrypted_password TEXT;
BEGIN
  -- Generate properly encrypted password using Supabase's auth schema
  v_encrypted_password := crypt('1234567890', gen_salt('bf'));

  -- Insert user into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID,
    v_user_id,
    'authenticated',
    'authenticated',
    'fr.mccarty@gmail.com',
    v_encrypted_password,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create identity for the test user (only if it doesn't exist)
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id AND provider = 'email') THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      v_user_id,
      v_user_id, -- provider_id should match user_id for email provider
      format('{"sub":"%s","email":"%s"}', v_user_id, 'fr.mccarty@gmail.com')::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- Link the test user to the parish with admin role
INSERT INTO parish_users (user_id, parish_id, roles, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002'::UUID,
  '00000000-0000-0000-0000-000000000001'::UUID,
  ARRAY['admin']::TEXT[],
  now()
)
ON CONFLICT (user_id, parish_id) DO NOTHING;

-- Create user settings for the test user
INSERT INTO user_settings (user_id, selected_parish_id, language, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002'::UUID,
  '00000000-0000-0000-0000-000000000001'::UUID,
  'en',
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE
SET selected_parish_id = EXCLUDED.selected_parish_id;

-- Output summary
DO $$
BEGIN
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'DEFAULT PARISH AND USER CREATED';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Parish: St. Mary''s Catholic Church (Springfield, Illinois)';
  RAISE NOTICE 'Parish ID: 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE '';
  RAISE NOTICE 'Test User Email: fr.mccarty@gmail.com';
  RAISE NOTICE 'Test User Password: 1234567890';
  RAISE NOTICE 'User ID: 00000000-0000-0000-0000-000000000002';
  RAISE NOTICE 'Roles: admin';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now run seed scripts that require a parish.';
  RAISE NOTICE '================================================================';
END $$;
