-- ============================================================
-- DEMO PARISH SEED MIGRATION
-- ============================================================
-- This migration creates the demo parish infrastructure that
-- exists in both development and production environments.
--
-- The demo parish is used for:
-- - Developer testing with Claude Desktop (MCP)
-- - Demonstrating the application to potential users
-- - Integration testing
--
-- After this migration runs, the application will automatically
-- seed sample data (people, masses, etc.) on first access.
-- ============================================================

-- ============================================================
-- 1. CREATE DEMO PARISH
-- ============================================================
INSERT INTO parishes (id, name, slug, city, state, country, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'St. Damo',
  'st-damo',
  'Springfield',
  'Illinois',
  'United States',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug;

-- ============================================================
-- 2. CREATE PARISH SETTINGS
-- ============================================================
INSERT INTO parish_settings (
  parish_id,
  mass_intention_offering_quick_amount,
  donations_quick_amount,
  liturgical_locale,
  public_calendar_enabled,
  timezone,
  primary_language,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  '[{"amount": 500, "label": "$5"}, {"amount": 1000, "label": "$10"}, {"amount": 1500, "label": "$15"}, {"amount": 2000, "label": "$20"}, {"amount": 2500, "label": "$25"}, {"amount": 5000, "label": "$50"}]'::JSONB,
  '[{"amount": 2500, "label": "$25"}, {"amount": 5000, "label": "$50"}, {"amount": 10000, "label": "$100"}, {"amount": 25000, "label": "$250"}, {"amount": 50000, "label": "$500"}]'::JSONB,
  'en_US',
  true,
  'America/Chicago',
  'en',
  now(),
  now()
)
ON CONFLICT (parish_id) DO UPDATE SET
  public_calendar_enabled = EXCLUDED.public_calendar_enabled,
  timezone = EXCLUDED.timezone,
  primary_language = EXCLUDED.primary_language;

-- ============================================================
-- 3. CREATE DEVELOPER USER
-- ============================================================
-- Email: fr.mccarty@gmail.com
-- Password: 1234567890
-- Bcrypt hash pre-computed for production compatibility
-- ============================================================
DO $$
DECLARE
  v_user_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
  -- Pre-computed bcrypt hash for password: 1234567890
  v_encrypted_password TEXT := '$2b$12$gSUzgYqFXDnX.6bDAtB6HOcyvOC3VZDhsIT5dbHscDbrTuu/zflyG';
BEGIN
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
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password;

  -- Create identity for the user (only if it doesn't exist)
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
      v_user_id,
      format('{"sub":"%s","email":"%s"}', v_user_id, 'fr.mccarty@gmail.com')::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- ============================================================
-- 4. LINK USER TO PARISH (ADMIN ROLE)
-- ============================================================
INSERT INTO parish_users (user_id, parish_id, roles, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002'::UUID,
  '00000000-0000-0000-0000-000000000001'::UUID,
  ARRAY['admin']::TEXT[],
  now()
)
ON CONFLICT (user_id, parish_id) DO UPDATE SET
  roles = EXCLUDED.roles;

-- ============================================================
-- 5. CREATE USER SETTINGS
-- ============================================================
INSERT INTO user_settings (user_id, selected_parish_id, language, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002'::UUID,
  '00000000-0000-0000-0000-000000000001'::UUID,
  'en',
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  selected_parish_id = EXCLUDED.selected_parish_id;

-- ============================================================
-- 6. CREATE MCP API KEY FOR DEVELOPER
-- ============================================================
-- API Key: os_dev_DEVELOPMENT_KEY_12345678
-- Bcrypt hash pre-computed for consistency
-- ============================================================
INSERT INTO mcp_api_keys (
  id,
  parish_id,
  user_id,
  name,
  key_prefix,
  key_hash,
  scopes,
  is_active,
  created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000003'::UUID,
  '00000000-0000-0000-0000-000000000001'::UUID,
  '00000000-0000-0000-0000-000000000002'::UUID,
  'Dev API Key (Claude Desktop)',
  'os_dev_DEVEL',
  -- Bcrypt hash of: os_dev_DEVELOPMENT_KEY_12345678
  '$2b$12$R/ABBkLNFMIQcf7uwUeQM.ZsBxR54TicSvQUKVAZ8HIsDuSGwWhDG',
  ARRAY['read', 'write', 'delete']::TEXT[],
  true,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  key_hash = EXCLUDED.key_hash,
  scopes = EXCLUDED.scopes,
  is_active = EXCLUDED.is_active;

-- ============================================================
-- 7. CREATE MARKER FOR SAMPLE DATA SEEDING
-- ============================================================
-- This table tracks whether sample data has been seeded.
-- The application checks this and seeds if needed.
-- ============================================================
CREATE TABLE IF NOT EXISTS demo_parish_seed_status (
  parish_id UUID PRIMARY KEY REFERENCES parishes(id) ON DELETE CASCADE,
  onboarding_seeded BOOLEAN DEFAULT FALSE,
  sample_data_seeded BOOLEAN DEFAULT FALSE,
  seeded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Grant access
GRANT ALL ON demo_parish_seed_status TO anon;
GRANT ALL ON demo_parish_seed_status TO authenticated;
GRANT ALL ON demo_parish_seed_status TO service_role;

-- Insert initial status (not yet seeded)
INSERT INTO demo_parish_seed_status (parish_id, onboarding_seeded, sample_data_seeded)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID, FALSE, FALSE)
ON CONFLICT (parish_id) DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'DEMO PARISH INFRASTRUCTURE CREATED';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Parish: St. Damo (Springfield, Illinois)';
  RAISE NOTICE 'Parish ID: 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE '';
  RAISE NOTICE 'Developer Account:';
  RAISE NOTICE '  Email: fr.mccarty@gmail.com';
  RAISE NOTICE '  Password: 1234567890';
  RAISE NOTICE '  User ID: 00000000-0000-0000-0000-000000000002';
  RAISE NOTICE '  Role: admin';
  RAISE NOTICE '';
  RAISE NOTICE 'MCP API Key: os_dev_DEVELOPMENT_KEY_12345678';
  RAISE NOTICE '';
  RAISE NOTICE 'Sample data will be seeded on first application access.';
  RAISE NOTICE '================================================================';
END $$;
