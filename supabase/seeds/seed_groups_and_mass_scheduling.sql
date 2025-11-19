-- ============================================================
-- HOW TO RUN THIS SCRIPT
-- ============================================================
-- This seed file should be run AFTER seed_modules.sql
-- supabase seed
-- ============================================================

-- ============================================================
-- GROUPS, MASS SCHEDULING, AND ROLE MANAGEMENT SEED DATA
-- ============================================================
-- Purpose: Seeds data for groups, mass times, mass types, mass role scheduling
-- This complements seed_modules.sql which handles the main sacrament modules
--
-- Tables populated:
-- - groups & group_members (ministry groups)
-- - mass_types (types of masses)
-- - mass_times (recurring mass schedules)
-- - mass_roles_templates & mass_roles_template_items
-- - mass_role_instances (actual assignments)
-- - mass_role_preferences (volunteer preferences)
-- - mass_role_blackout_dates (unavailability)
-- - petition_templates (additional templates)
-- ============================================================

DO $$
DECLARE
  v_parish_id UUID;

  -- Group IDs
  v_choir_group_id UUID;
  v_lector_group_id UUID;
  v_usher_group_id UUID;
  v_youth_ministry_id UUID;

  -- Mass Type IDs
  v_sunday_mass_type_id UUID;
  v_daily_mass_type_id UUID;
  v_holy_day_mass_type_id UUID;
  v_latin_mass_type_id UUID;

  -- Mass Times IDs
  v_mass_time_sunday_8am_id UUID;
  v_mass_time_sunday_10am_id UUID;
  v_mass_time_sunday_12pm_id UUID;
  v_mass_time_sunday_spanish_id UUID;
  v_mass_time_daily_id UUID;

  -- Mass Roles Template IDs
  v_sunday_template_id UUID;
  v_daily_template_id UUID;

  -- Location ID (will use first church location)
  v_church_location_id UUID;

  -- People IDs (will reuse from seed_modules)
  v_person_1_id UUID;
  v_person_2_id UUID;
  v_person_3_id UUID;
  v_person_4_id UUID;
  v_person_5_id UUID;

  -- Mass Role IDs (assumes these exist from onboarding)
  v_lector_role_id UUID;
  v_usher_role_id UUID;
  v_server_role_id UUID;
  v_cantor_role_id UUID;

  -- Mass IDs (will reuse from seed_modules if available)
  v_mass_1_id UUID;
  v_mass_2_id UUID;

BEGIN
  -- Get the first parish
  SELECT id INTO v_parish_id FROM parishes ORDER BY created_at LIMIT 1;

  IF v_parish_id IS NULL THEN
    RAISE EXCEPTION 'No parish found. Please run seed_default_parish_and_user.sql first.';
  END IF;

  -- Get the first church location
  SELECT id INTO v_church_location_id FROM locations WHERE parish_id = v_parish_id ORDER BY created_at LIMIT 1;

  -- Get some people IDs
  SELECT id INTO v_person_1_id FROM people WHERE parish_id = v_parish_id ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO v_person_2_id FROM people WHERE parish_id = v_parish_id ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO v_person_3_id FROM people WHERE parish_id = v_parish_id ORDER BY created_at LIMIT 1 OFFSET 2;
  SELECT id INTO v_person_4_id FROM people WHERE parish_id = v_parish_id ORDER BY created_at LIMIT 1 OFFSET 3;
  SELECT id INTO v_person_5_id FROM people WHERE parish_id = v_parish_id ORDER BY created_at LIMIT 1 OFFSET 4;

  -- Get mass role IDs (if they exist)
  SELECT id INTO v_lector_role_id FROM mass_roles WHERE parish_id = v_parish_id AND name = 'Lector' LIMIT 1;
  SELECT id INTO v_usher_role_id FROM mass_roles WHERE parish_id = v_parish_id AND name = 'Usher' LIMIT 1;
  SELECT id INTO v_server_role_id FROM mass_roles WHERE parish_id = v_parish_id AND name = 'Server' LIMIT 1;
  SELECT id INTO v_cantor_role_id FROM mass_roles WHERE parish_id = v_parish_id AND name = 'Cantor' LIMIT 1;

  -- Get existing masses (if any)
  SELECT id INTO v_mass_1_id FROM masses WHERE parish_id = v_parish_id ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO v_mass_2_id FROM masses WHERE parish_id = v_parish_id ORDER BY created_at LIMIT 1 OFFSET 1;

  RAISE NOTICE '================================================================';
  RAISE NOTICE 'SEEDING GROUPS, MASS SCHEDULING, AND ROLE MANAGEMENT';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Parish ID: %', v_parish_id;

  -- =====================================================
  -- 1. GROUPS (Ministry Groups)
  -- =====================================================
  RAISE NOTICE 'Creating groups...';

  INSERT INTO groups (parish_id, name, description, is_active, created_at, updated_at)
  VALUES
    (v_parish_id, 'Adult Choir', 'Main parish choir for Sunday Mass at 10:00 AM', true, now(), now()),
    (v_parish_id, 'Lectors', 'Ministers of the Word who proclaim the readings', true, now(), now()),
    (v_parish_id, 'Ushers & Greeters', 'Welcome parishioners and assist with seating and collection', true, now(), now()),
    (v_parish_id, 'Youth Ministry', 'Teen youth group for grades 9-12', true, now(), now())
  RETURNING id INTO v_choir_group_id;

  SELECT id INTO v_choir_group_id FROM groups WHERE parish_id = v_parish_id AND name = 'Adult Choir';
  SELECT id INTO v_lector_group_id FROM groups WHERE parish_id = v_parish_id AND name = 'Lectors';
  SELECT id INTO v_usher_group_id FROM groups WHERE parish_id = v_parish_id AND name = 'Ushers & Greeters';
  SELECT id INTO v_youth_ministry_id FROM groups WHERE parish_id = v_parish_id AND name = 'Youth Ministry';

  RAISE NOTICE 'Created % groups', 4;

  -- =====================================================
  -- 2. GROUP MEMBERS
  -- =====================================================
  IF v_person_1_id IS NOT NULL THEN
    RAISE NOTICE 'Creating group members...';

    INSERT INTO group_members (group_id, person_id, role, joined_at)
    VALUES
      (v_choir_group_id, v_person_1_id, 'Choir Director', now()),
      (v_choir_group_id, v_person_2_id, 'Member', now()),
      (v_lector_group_id, v_person_3_id, 'Coordinator', now()),
      (v_lector_group_id, v_person_4_id, 'Member', now()),
      (v_usher_group_id, v_person_5_id, 'Head Usher', now())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created % group member assignments', 5;
  END IF;

  -- =====================================================
  -- 3. MASS TYPES
  -- =====================================================
  RAISE NOTICE 'Creating mass types...';

  INSERT INTO mass_types (parish_id, name, description, created_at, updated_at)
  VALUES
    (v_parish_id, 'Sunday Mass', 'Regular Sunday liturgy', now(), now()),
    (v_parish_id, 'Daily Mass', 'Weekday Mass', now(), now()),
    (v_parish_id, 'Holy Day of Obligation', 'Major feast day celebration', now(), now()),
    (v_parish_id, 'Traditional Latin Mass', 'Extraordinary Form of the Roman Rite', now(), now())
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_sunday_mass_type_id FROM mass_types WHERE parish_id = v_parish_id AND name = 'Sunday Mass';
  SELECT id INTO v_daily_mass_type_id FROM mass_types WHERE parish_id = v_parish_id AND name = 'Daily Mass';
  SELECT id INTO v_holy_day_mass_type_id FROM mass_types WHERE parish_id = v_parish_id AND name = 'Holy Day of Obligation';
  SELECT id INTO v_latin_mass_type_id FROM mass_types WHERE parish_id = v_parish_id AND name = 'Traditional Latin Mass';

  RAISE NOTICE 'Created % mass types', 4;

  -- =====================================================
  -- 4. MASS TIMES (Recurring Schedules)
  -- =====================================================
  IF v_sunday_mass_type_id IS NOT NULL AND v_church_location_id IS NOT NULL THEN
    RAISE NOTICE 'Creating mass times...';

    INSERT INTO mass_times (parish_id, mass_type_id, schedule_items, location_id, language, special_designation, effective_start_date, active, created_at, updated_at)
    VALUES
      (
        v_parish_id,
        v_sunday_mass_type_id,
        '[{"day": "SUNDAY", "time": "08:00"}]'::jsonb,
        v_church_location_id,
        'en',
        NULL,
        '2025-01-01',
        true,
        now(),
        now()
      ),
      (
        v_parish_id,
        v_sunday_mass_type_id,
        '[{"day": "SUNDAY", "time": "10:00"}]'::jsonb,
        v_church_location_id,
        'en',
        'Family Mass with Children''s Choir',
        '2025-01-01',
        true,
        now(),
        now()
      ),
      (
        v_parish_id,
        v_sunday_mass_type_id,
        '[{"day": "SUNDAY", "time": "12:00"}]'::jsonb,
        v_church_location_id,
        'en',
        NULL,
        '2025-01-01',
        true,
        now(),
        now()
      ),
      (
        v_parish_id,
        v_sunday_mass_type_id,
        '[{"day": "SUNDAY", "time": "14:00"}]'::jsonb,
        v_church_location_id,
        'es',
        'Misa en Español',
        '2025-01-01',
        true,
        now(),
        now()
      ),
      (
        v_parish_id,
        v_daily_mass_type_id,
        '[
          {"day": "MONDAY", "time": "07:00"},
          {"day": "TUESDAY", "time": "07:00"},
          {"day": "WEDNESDAY", "time": "07:00"},
          {"day": "THURSDAY", "time": "07:00"},
          {"day": "FRIDAY", "time": "07:00"}
        ]'::jsonb,
        v_church_location_id,
        'en',
        NULL,
        '2025-01-01',
        true,
        now(),
        now()
      ),
      (
        v_parish_id,
        v_latin_mass_type_id,
        '[{"day": "SUNDAY", "time": "17:00"}]'::jsonb,
        v_church_location_id,
        'la',
        'Traditional Latin Mass (Extraordinary Form)',
        '2025-01-01',
        true,
        now(),
        now()
      )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created % mass time schedules', 6;
  END IF;

  -- =====================================================
  -- 5. MASS ROLES TEMPLATES
  -- =====================================================
  IF v_lector_role_id IS NOT NULL THEN
    RAISE NOTICE 'Creating mass roles templates...';

    INSERT INTO mass_roles_templates (parish_id, name, description, created_at, updated_at)
    VALUES
      (v_parish_id, 'Sunday Mass Template', 'Standard roles for Sunday liturgy', now(), now()),
      (v_parish_id, 'Daily Mass Template', 'Simplified roles for weekday Mass', now(), now())
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_sunday_template_id FROM mass_roles_templates WHERE parish_id = v_parish_id AND name = 'Sunday Mass Template';
    SELECT id INTO v_daily_template_id FROM mass_roles_templates WHERE parish_id = v_parish_id AND name = 'Daily Mass Template';

    -- =====================================================
    -- 6. MASS ROLES TEMPLATE ITEMS
    -- =====================================================
    RAISE NOTICE 'Creating mass roles template items...';

    -- Sunday template items
    INSERT INTO mass_roles_template_items (template_id, mass_role_id, count, position, created_at, updated_at)
    VALUES
      (v_sunday_template_id, v_lector_role_id, 2, 1, now(), now()),
      (v_sunday_template_id, v_usher_role_id, 4, 2, now(), now())
    ON CONFLICT DO NOTHING;

    IF v_server_role_id IS NOT NULL THEN
      INSERT INTO mass_roles_template_items (template_id, mass_role_id, count, position, created_at, updated_at)
      VALUES (v_sunday_template_id, v_server_role_id, 2, 3, now(), now())
      ON CONFLICT DO NOTHING;
    END IF;

    IF v_cantor_role_id IS NOT NULL THEN
      INSERT INTO mass_roles_template_items (template_id, mass_role_id, count, position, created_at, updated_at)
      VALUES (v_sunday_template_id, v_cantor_role_id, 1, 4, now(), now())
      ON CONFLICT DO NOTHING;
    END IF;

    -- Daily template items (fewer roles needed)
    INSERT INTO mass_roles_template_items (template_id, mass_role_id, count, position, created_at, updated_at)
    VALUES
      (v_daily_template_id, v_lector_role_id, 1, 1, now(), now())
    ON CONFLICT DO NOTHING;

    IF v_server_role_id IS NOT NULL THEN
      INSERT INTO mass_roles_template_items (template_id, mass_role_id, count, position, created_at, updated_at)
      VALUES (v_daily_template_id, v_server_role_id, 1, 2, now(), now())
      ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Created mass roles template items';
  END IF;

  -- =====================================================
  -- 7. MASS ROLE INSTANCES (Sample Assignments)
  -- =====================================================
  IF v_mass_1_id IS NOT NULL AND v_person_3_id IS NOT NULL AND v_lector_role_id IS NOT NULL THEN
    RAISE NOTICE 'Creating mass role instances...';

    DECLARE
      v_template_item_id UUID;
    BEGIN
      -- Get the lector template item ID from Sunday template
      SELECT id INTO v_template_item_id
      FROM mass_roles_template_items
      WHERE template_id = v_sunday_template_id AND mass_role_id = v_lector_role_id
      LIMIT 1;

      IF v_template_item_id IS NOT NULL THEN
        INSERT INTO mass_role_instances (mass_id, person_id, mass_roles_template_item_id, created_at, updated_at)
        VALUES
          (v_mass_1_id, v_person_3_id, v_template_item_id, now(), now()),
          (v_mass_1_id, v_person_4_id, v_template_item_id, now(), now())
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Created % mass role instance assignments', 2;
      END IF;
    END;
  END IF;

  -- =====================================================
  -- 8. MASS ROLE PREFERENCES
  -- =====================================================
  IF v_person_3_id IS NOT NULL AND v_lector_role_id IS NOT NULL THEN
    RAISE NOTICE 'Creating mass role preferences...';

    INSERT INTO mass_role_preferences (
      person_id,
      parish_id,
      mass_role_id,
      preferred_days,
      available_days,
      desired_frequency,
      max_per_month,
      active,
      created_at,
      updated_at
    )
    VALUES
      (
        v_person_3_id,
        v_parish_id,
        v_lector_role_id,
        ARRAY['SUNDAY'],
        ARRAY['SATURDAY', 'SUNDAY'],
        'WEEKLY',
        4,
        true,
        now(),
        now()
      ),
      (
        v_person_4_id,
        v_parish_id,
        v_lector_role_id,
        ARRAY['SUNDAY'],
        ARRAY['SUNDAY'],
        'MONTHLY',
        2,
        true,
        now(),
        now()
      )
    ON CONFLICT DO NOTHING;

    IF v_usher_role_id IS NOT NULL AND v_person_5_id IS NOT NULL THEN
      INSERT INTO mass_role_preferences (
        person_id,
        parish_id,
        mass_role_id,
        preferred_days,
        available_days,
        desired_frequency,
        active,
        created_at,
        updated_at
      )
      VALUES
        (
          v_person_5_id,
          v_parish_id,
          v_usher_role_id,
          ARRAY['SUNDAY'],
          ARRAY['SUNDAY'],
          'BIWEEKLY',
          true,
          now(),
          now()
        )
      ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Created % mass role preferences', 3;
  END IF;

  -- =====================================================
  -- 9. MASS ROLE BLACKOUT DATES
  -- =====================================================
  IF v_person_3_id IS NOT NULL THEN
    RAISE NOTICE 'Creating mass role blackout dates...';

    INSERT INTO mass_role_blackout_dates (person_id, start_date, end_date, reason, created_at)
    VALUES
      (v_person_3_id, '2025-07-01', '2025-07-15', 'Summer vacation', now()),
      (v_person_4_id, '2025-12-20', '2026-01-05', 'Family visit', now())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created % blackout date periods', 2;
  END IF;

  -- =====================================================
  -- 10. ADDITIONAL PETITION TEMPLATES
  -- =====================================================
  RAISE NOTICE 'Creating additional petition templates...';

  INSERT INTO petition_templates (parish_id, title, description, context, module, language, is_default, created_at, updated_at)
  VALUES
    (v_parish_id, 'Baptism Petitions (English)', 'Standard petitions for baptism ceremony', 'baptism', 'baptism', 'en', true, now(), now()),
    (v_parish_id, 'Baptism Petitions (Spanish)', 'Peticiones estándar para bautismo', 'baptism', 'baptism', 'es', true, now(), now()),
    (v_parish_id, 'Presentation Petitions', 'Standard petitions for presentation ceremony', 'presentation', 'presentation', 'en', true, now(), now()),
    (v_parish_id, 'Quinceañera Petitions', 'Standard petitions for quinceañera celebration', 'quinceanera', 'quinceanera', 'es', true, now(), now())
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Created % petition templates', 4;

  -- =====================================================
  -- SUMMARY
  -- =====================================================
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'GROUPS, MASS SCHEDULING, AND ROLE MANAGEMENT SEED COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 4 ministry groups (Choir, Lectors, Ushers, Youth Ministry)';
  RAISE NOTICE '  - 5 group member assignments';
  RAISE NOTICE '  - 4 mass types (Sunday, Daily, Holy Day, Latin Mass)';
  RAISE NOTICE '  - 6 mass time schedules';
  RAISE NOTICE '  - 2 mass roles templates (Sunday, Daily)';
  RAISE NOTICE '  - Mass roles template items';
  RAISE NOTICE '  - 2 sample mass role instances';
  RAISE NOTICE '  - 3 mass role preferences';
  RAISE NOTICE '  - 2 blackout date periods';
  RAISE NOTICE '  - 4 petition templates';
  RAISE NOTICE '================================================================';

END $$;
