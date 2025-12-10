-- ============================================================
-- SEED FILE: People
-- ============================================================
-- Creates 27 sample people for development and testing.
--
-- REQUIREMENTS:
-- - At least one parish must exist in the database
-- - Run this BEFORE seed_events.sql (events reference people)
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

  RAISE NOTICE 'Seeding people for parish_id: %', v_parish_id;

  -- ============================================================
  -- PEOPLE: Create all people needed for the modules
  -- ============================================================

  -- Bride
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Maria',
    'Rodriguez',
    '(555) 123-4567',
    'maria.rodriguez@example.com',
    '123 Oak Street',
    'Springfield',
    'IL',
    '62701',
    'FEMALE',
    'Sample person for development'
  );

  -- Groom
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'James',
    'Smith',
    '(555) 234-5678',
    'james.smith@example.com',
    '456 Maple Avenue',
    'Springfield',
    'IL',
    '62702',
    'MALE',
    'Sample person for development'
  );

  -- Bride 2
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Emily',
    'Anderson',
    '(555) 345-6780',
    'emily.anderson@example.com',
    '789 Cedar Street',
    'Springfield',
    'IL',
    '62710',
    'FEMALE',
    'Sample person for development'
  );

  -- Groom 2
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Michael',
    'Chen',
    '(555) 456-7891',
    'michael.chen@example.com',
    '890 Willow Drive',
    'Springfield',
    'IL',
    '62711',
    'MALE',
    'Sample person for development'
  );

  -- Deceased
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Margaret',
    'Johnson',
    '(555) 345-6789',
    'margaret.johnson@example.com',
    '789 Pine Road',
    'Springfield',
    'IL',
    '62703',
    'FEMALE',
    'Sample person for development'
  );

  -- Family Contact
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Robert',
    'Johnson',
    '(555) 456-7890',
    'robert.johnson@example.com',
    '789 Pine Road',
    'Springfield',
    'IL',
    '62703',
    'MALE',
    'Sample person for development'
  );

  -- Quinceanera Person
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Isabella',
    'Garcia',
    '(555) 567-8901',
    'isabella.garcia@example.com',
    '321 Elm Street',
    'Springfield',
    'IL',
    '62704',
    'FEMALE',
    'Sample person for development'
  );

  -- Child for Baptism
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Sofia',
    'Martinez',
    NULL,
    NULL,
    '654 Birch Lane',
    'Springfield',
    'IL',
    '62705',
    'FEMALE',
    'Sample child for development'
  );

  -- Child for Presentation
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Miguel',
    'Lopez',
    NULL,
    NULL,
    '987 Cedar Court',
    'Springfield',
    'IL',
    '62706',
    'MALE',
    'Sample child for development'
  );

  -- Mother
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Carmen',
    'Martinez',
    '(555) 678-9012',
    'carmen.martinez@example.com',
    '654 Birch Lane',
    'Springfield',
    'IL',
    '62705',
    'FEMALE',
    'Sample person for development'
  );

  -- Father
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Carlos',
    'Martinez',
    '(555) 789-0123',
    'carlos.martinez@example.com',
    '654 Birch Lane',
    'Springfield',
    'IL',
    '62705',
    'MALE',
    'Sample person for development'
  );

  -- Sponsor 1 (Godparent)
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Teresa',
    'Hernandez',
    '(555) 890-1234',
    'teresa.hernandez@example.com',
    '147 Spruce Drive',
    'Springfield',
    'IL',
    '62707',
    'FEMALE',
    'Sample person for development'
  );

  -- Sponsor 2 (Godparent)
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Antonio',
    'Fernandez',
    '(555) 901-2345',
    'antonio.fernandez@example.com',
    '258 Willow Way',
    'Springfield',
    'IL',
    '62708',
    'MALE',
    'Sample person for development'
  );

  -- Presider (Priest)
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Father John',
    'O''Brien',
    '(555) 012-3456',
    'fr.john@stmarysparish.org',
    '100 Church Street',
    'Springfield',
    'IL',
    '62709',
    'MALE',
    'Parish priest and presider'
  );

  -- Homilist (Deacon)
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Deacon Michael',
    'Thompson',
    '(555) 123-4560',
    'dcn.michael@stmarysparish.org',
    '100 Church Street',
    'Springfield',
    'IL',
    '62709',
    'MALE',
    'Deacon and homilist'
  );

  -- Coordinator
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Sarah',
    'Williams',
    '(555) 234-5601',
    'sarah.williams@stmarysparish.org',
    '100 Church Street',
    'Springfield',
    'IL',
    '62709',
    'FEMALE',
    'Wedding and liturgy coordinator'
  );

  -- Lead Musician
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'David',
    'Anderson',
    '(555) 345-6012',
    'david.anderson@example.com',
    '369 Harmony Lane',
    'Springfield',
    'IL',
    '62710',
    'MALE',
    'Music director and organist'
  );

  -- Cantor
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Jennifer',
    'Brown',
    '(555) 456-0123',
    'jennifer.brown@example.com',
    '741 Melody Street',
    'Springfield',
    'IL',
    '62711',
    'FEMALE',
    'Parish cantor and soloist'
  );

  -- First Reader
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Thomas',
    'Davis',
    '(555) 567-0134',
    'thomas.davis@example.com',
    '852 Scripture Road',
    'Springfield',
    'IL',
    '62712',
    'MALE',
    'First reading lector'
  );

  -- Second Reader
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Patricia',
    'Miller',
    '(555) 678-0145',
    'patricia.miller@example.com',
    '963 Word Avenue',
    'Springfield',
    'IL',
    '62713',
    'FEMALE',
    'Second reading lector'
  );

  -- Psalm Reader
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Christopher',
    'Wilson',
    '(555) 789-0156',
    'christopher.wilson@example.com',
    '159 Psalter Place',
    'Springfield',
    'IL',
    '62714',
    'MALE',
    'Psalm lector'
  );

  -- Petition Reader
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Mary',
    'Moore',
    '(555) 890-0167',
    'mary.moore@example.com',
    '357 Prayer Path',
    'Springfield',
    'IL',
    '62715',
    'FEMALE',
    'Petition reader'
  );

  -- Witness 1
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Daniel',
    'Taylor',
    '(555) 901-0178',
    'daniel.taylor@example.com',
    '753 Witness Way',
    'Springfield',
    'IL',
    '62716',
    'MALE',
    'Sample person for development'
  );

  -- Witness 2
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Emily',
    'Jackson',
    '(555) 012-0189',
    'emily.jackson@example.com',
    '951 Vow Street',
    'Springfield',
    'IL',
    '62717',
    'FEMALE',
    'Sample person for development'
  );

  -- Requested By (for Mass Intention)
  INSERT INTO people (parish_id, first_name, last_name, phone_number, email, street, city, state, zipcode, sex, note)
  VALUES (
    v_parish_id,
    'Margaret',
    'White',
    '(555) 123-0190',
    'margaret.white@example.com',
    '135 Intention Avenue',
    'Springfield',
    'IL',
    '62718',
    'FEMALE',
    'Sample person for development'
  );

  RAISE NOTICE 'Created 27 sample people';

END $$;
