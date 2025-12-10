-- ============================================================
-- SEED FILE: General Parish Events
-- ============================================================
-- Creates 6 sample general events for development and testing.
--
-- REQUIREMENTS:
-- - At least one parish must exist in the database
-- - People must be seeded (run seed_people.sql first)
-- - Locations must be seeded (run seed_locations.sql first)
-- - Event types must be seeded via dev-seed.ts / populateInitialParishData()
--
-- RUN: supabase seed
-- ============================================================

DO $$
DECLARE
  v_parish_id UUID;
  v_coordinator_id UUID;
  v_reception_hall_id UUID;
  v_other_event_type_id UUID;
BEGIN
  -- Get the first parish in the database
  SELECT id INTO v_parish_id FROM parishes LIMIT 1;

  IF v_parish_id IS NULL THEN
    RAISE EXCEPTION 'No parish found. Please create a parish before running this seed script.';
  END IF;

  RAISE NOTICE 'Seeding events for parish_id: %', v_parish_id;

  -- Get coordinator (Sarah Williams)
  SELECT id INTO v_coordinator_id
  FROM people
  WHERE parish_id = v_parish_id
    AND first_name = 'Sarah'
    AND last_name = 'Williams'
  LIMIT 1;

  IF v_coordinator_id IS NULL THEN
    RAISE EXCEPTION 'Coordinator (Sarah Williams) not found. Run seed_people.sql first.';
  END IF;

  -- Get reception hall (Parish Hall)
  SELECT id INTO v_reception_hall_id
  FROM locations
  WHERE parish_id = v_parish_id
    AND name = 'Parish Hall'
  LIMIT 1;

  IF v_reception_hall_id IS NULL THEN
    RAISE EXCEPTION 'Reception hall (Parish Hall) not found. Run seed_locations.sql first.';
  END IF;

  -- Get "Other" event type ID for general events
  SELECT id INTO v_other_event_type_id
  FROM event_types
  WHERE parish_id = v_parish_id
    AND name = 'Other'
  LIMIT 1;

  IF v_other_event_type_id IS NULL THEN
    RAISE EXCEPTION 'Event type "Other" not found. Run dev-seed.ts or populateInitialParishData() first.';
  END IF;

  -- ============================================================
  -- EVENTS: Create general parish events
  -- ============================================================

  -- Zumba Class
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type_id,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Zumba Fitness Class',
    'Weekly Zumba class for all ages and fitness levels',
    v_coordinator_id,
    v_other_event_type_id,
    CURRENT_DATE + 2,
    '18:00:00',
    CURRENT_DATE + 2,
    '19:00:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'ENGLISH',
    'Bring comfortable shoes and water bottle. All levels welcome!'
  );

  -- Staff Meeting
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type_id,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Parish Staff Meeting',
    'Monthly meeting for all parish staff members',
    v_coordinator_id,
    v_other_event_type_id,
    CURRENT_DATE + 5,
    '10:00:00',
    CURRENT_DATE + 5,
    '12:00:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'ENGLISH',
    'Agenda: Budget review, upcoming events, facility updates'
  );

  -- Staff Birthday Celebration
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type_id,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Father John''s Birthday Celebration',
    'Birthday party for our beloved pastor',
    v_coordinator_id,
    v_other_event_type_id,
    CURRENT_DATE + 8,
    '13:00:00',
    CURRENT_DATE + 8,
    '15:00:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'ENGLISH',
    'Potluck lunch. Bring a dish to share!'
  );

  -- Volunteer Appreciation Dinner
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type_id,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Volunteer Appreciation Dinner',
    'Annual dinner to thank all parish volunteers',
    v_coordinator_id,
    v_other_event_type_id,
    CURRENT_DATE + 10,
    '18:30:00',
    CURRENT_DATE + 10,
    '21:00:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'ENGLISH',
    'Celebrating our amazing volunteers! Dinner provided.'
  );

  -- Youth Group Meeting
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type_id,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Youth Group Meeting',
    'Weekly youth group gathering for high school students',
    v_coordinator_id,
    v_other_event_type_id,
    CURRENT_DATE + 3,
    '19:00:00',
    CURRENT_DATE + 3,
    '21:00:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'ENGLISH',
    'Pizza and faith sharing. All teens welcome!'
  );

  -- Bible Study Group
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type_id,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Wednesday Evening Bible Study',
    'Weekly Scripture study and discussion',
    v_coordinator_id,
    v_other_event_type_id,
    CURRENT_DATE + 6,
    '19:30:00',
    CURRENT_DATE + 6,
    '21:00:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'ENGLISH',
    'Studying the Gospel of John. Bring your Bible!'
  );

  RAISE NOTICE 'Created 6 general parish events';

END $$;
