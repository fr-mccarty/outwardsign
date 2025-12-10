-- ============================================================
-- SEED FILE: Locations
-- ============================================================
-- Creates 3 sample locations for development and testing.
--
-- REQUIREMENTS:
-- - At least one parish must exist in the database
-- - Run this BEFORE seed_events.sql (events reference locations)
--
-- RUN: supabase seed
-- ============================================================

DO $$
DECLARE
  v_parish_id UUID;
BEGIN
  -- Get the first parish in the database
  SELECT id INTO v_parish_id FROM parishes LIMIT 1;

  IF v_parish_id IS NULL THEN
    RAISE EXCEPTION 'No parish found. Please create a parish before running this seed script.';
  END IF;

  RAISE NOTICE 'Seeding locations for parish_id: %', v_parish_id;

  -- ============================================================
  -- LOCATIONS: Create locations for events
  -- ============================================================

  -- Main Church
  INSERT INTO locations (parish_id, name, description, street, city, state, country, phone_number)
  VALUES (
    v_parish_id,
    'St. Mary''s Catholic Church',
    'Main parish church and worship space',
    '100 Church Street',
    'Springfield',
    'IL',
    'USA',
    '(555) 100-2000'
  );

  -- Reception Hall
  INSERT INTO locations (parish_id, name, description, street, city, state, country, phone_number)
  VALUES (
    v_parish_id,
    'Parish Hall',
    'Parish event center and reception hall',
    '102 Church Street',
    'Springfield',
    'IL',
    'USA',
    '(555) 100-2001'
  );

  -- Funeral Home
  INSERT INTO locations (parish_id, name, description, street, city, state, country, phone_number)
  VALUES (
    v_parish_id,
    'Springfield Funeral Home',
    'Local funeral home for vigil services',
    '500 Memorial Drive',
    'Springfield',
    'IL',
    'USA',
    '(555) 200-3000'
  );

  RAISE NOTICE 'Created 3 sample locations';

END $$;
