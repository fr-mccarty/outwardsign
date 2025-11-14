-- ============================================================
-- HOW TO RUN THIS SCRIPT
-- ============================================================
-- supabase seed
-- ============================================================

-- Comprehensive seed script to create one fully populated record for each primary module
-- This script creates sample data including people, locations, events, readings, and all module records

-- NOTE: This script assumes at least one parish exists in the database
-- If no parish exists, this script will fail

DO $$
DECLARE
  v_parish_id UUID;

  -- People IDs
  v_bride_id UUID;
  v_groom_id UUID;
  v_deceased_id UUID;
  v_family_contact_id UUID;
  v_quinceanera_person_id UUID;
  v_child_baptism_id UUID;
  v_child_presentation_id UUID;
  v_mother_id UUID;
  v_father_id UUID;
  v_sponsor_1_id UUID;
  v_sponsor_2_id UUID;
  v_presider_id UUID;
  v_homilist_id UUID;
  v_coordinator_id UUID;
  v_lead_musician_id UUID;
  v_cantor_id UUID;
  v_first_reader_id UUID;
  v_second_reader_id UUID;
  v_psalm_reader_id UUID;
  v_gospel_reader_id UUID;
  v_petition_reader_id UUID;
  v_witness_1_id UUID;
  v_witness_2_id UUID;
  v_responsible_party_id UUID;
  v_requested_by_id UUID;

  -- Location IDs
  v_church_location_id UUID;
  v_reception_hall_id UUID;
  v_funeral_home_id UUID;

  -- Event IDs
  v_wedding_event_id UUID;
  v_reception_event_id UUID;
  v_rehearsal_event_id UUID;
  v_rehearsal_dinner_event_id UUID;
  v_funeral_event_id UUID;
  v_funeral_meal_event_id UUID;
  v_quinceanera_event_id UUID;
  v_quinceanera_reception_id UUID;
  v_baptism_event_id UUID;
  v_presentation_event_id UUID;
  v_mass_event_id UUID;

  -- Reading IDs
  v_first_reading_marriage_id UUID;
  v_psalm_marriage_id UUID;
  v_second_reading_marriage_id UUID;
  v_gospel_marriage_id UUID;
  v_first_reading_funeral_id UUID;
  v_psalm_funeral_id UUID;
  v_gospel_funeral_id UUID;
  v_first_reading_baptism_id UUID;
  v_psalm_baptism_id UUID;
  v_second_reading_baptism_id UUID;
  v_gospel_baptism_id UUID;

  -- Module Record IDs
  v_wedding_id UUID;
  v_funeral_id UUID;
  v_quinceanera_id UUID;
  v_baptism_id UUID;
  v_presentation_id UUID;
  v_mass_id UUID;
  v_mass_intention_id UUID;

  -- Global liturgical event ID (for mass)
  v_liturgical_event_id UUID;

BEGIN
  -- Get the first parish in the database
  SELECT id INTO v_parish_id FROM parishes LIMIT 1;

  IF v_parish_id IS NULL THEN
    RAISE EXCEPTION 'No parish found. Please create a parish before running this seed script.';
  END IF;

  RAISE NOTICE 'Using parish_id: %', v_parish_id;

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
    'Female',
    'Bride for sample wedding'
  ) RETURNING id INTO v_bride_id;

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
    'Male',
    'Groom for sample wedding'
  ) RETURNING id INTO v_groom_id;

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
    'Female',
    'Deceased for sample funeral'
  ) RETURNING id INTO v_deceased_id;

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
    'Male',
    'Family contact for sample funeral'
  ) RETURNING id INTO v_family_contact_id;

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
    'Female',
    'Quinceañera for sample celebration'
  ) RETURNING id INTO v_quinceanera_person_id;

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
    'Female',
    'Child for sample baptism'
  ) RETURNING id INTO v_child_baptism_id;

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
    'Male',
    'Child for sample presentation'
  ) RETURNING id INTO v_child_presentation_id;

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
    'Female',
    'Mother for sample baptism and presentation'
  ) RETURNING id INTO v_mother_id;

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
    'Male',
    'Father for sample baptism and presentation'
  ) RETURNING id INTO v_father_id;

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
    'Female',
    'Godmother for sample baptism'
  ) RETURNING id INTO v_sponsor_1_id;

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
    'Male',
    'Godfather for sample baptism'
  ) RETURNING id INTO v_sponsor_2_id;

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
    'Male',
    'Parish priest and presider'
  ) RETURNING id INTO v_presider_id;

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
    'Male',
    'Deacon and homilist'
  ) RETURNING id INTO v_homilist_id;

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
    'Female',
    'Wedding and liturgy coordinator'
  ) RETURNING id INTO v_coordinator_id;

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
    'Male',
    'Music director and organist'
  ) RETURNING id INTO v_lead_musician_id;

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
    'Female',
    'Parish cantor and soloist'
  ) RETURNING id INTO v_cantor_id;

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
    'Male',
    'First reading lector'
  ) RETURNING id INTO v_first_reader_id;

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
    'Female',
    'Second reading lector'
  ) RETURNING id INTO v_second_reader_id;

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
    'Male',
    'Psalm lector'
  ) RETURNING id INTO v_psalm_reader_id;

  -- Gospel Reader (same as presider for this sample)
  v_gospel_reader_id := v_presider_id;

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
    'Female',
    'Petition reader'
  ) RETURNING id INTO v_petition_reader_id;

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
    'Male',
    'Best man and witness'
  ) RETURNING id INTO v_witness_1_id;

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
    'Female',
    'Maid of honor and witness'
  ) RETURNING id INTO v_witness_2_id;

  -- Responsible Party for Events
  v_responsible_party_id := v_coordinator_id;

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
    'Female',
    'Requested mass intention for deceased husband'
  ) RETURNING id INTO v_requested_by_id;

  RAISE NOTICE 'Created % people', 25;

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
  ) RETURNING id INTO v_church_location_id;

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
  ) RETURNING id INTO v_reception_hall_id;

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
  ) RETURNING id INTO v_funeral_home_id;

  RAISE NOTICE 'Created % locations', 3;

  -- ============================================================
  -- EVENTS: Create events for modules
  -- ============================================================

  -- Wedding Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Rodriguez-Smith Wedding Ceremony',
    'Wedding of Maria Rodriguez and James Smith',
    v_responsible_party_id,
    'WEDDING',
    '2025-06-14',
    '14:00:00',
    '2025-06-14',
    '15:30:00',
    'America/Chicago',
    false,
    v_church_location_id,
    'ENGLISH',
    'Saturday afternoon wedding ceremony'
  ) RETURNING id INTO v_wedding_event_id;

  -- Reception Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Rodriguez-Smith Wedding Reception',
    'Wedding reception following ceremony',
    v_responsible_party_id,
    'RECEPTION',
    '2025-06-14',
    '17:00:00',
    '2025-06-14',
    '22:00:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'ENGLISH',
    'Dinner and dancing reception'
  ) RETURNING id INTO v_reception_event_id;

  -- Rehearsal Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Rodriguez-Smith Wedding Rehearsal',
    'Wedding rehearsal practice',
    v_responsible_party_id,
    'REHEARSAL',
    '2025-06-13',
    '18:00:00',
    '2025-06-13',
    '19:00:00',
    'America/Chicago',
    false,
    v_church_location_id,
    'ENGLISH',
    'Friday evening rehearsal'
  ) RETURNING id INTO v_rehearsal_event_id;

  -- Rehearsal Dinner Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Rodriguez-Smith Rehearsal Dinner',
    'Rehearsal dinner for wedding party',
    v_responsible_party_id,
    'DINNER',
    '2025-06-13',
    '19:30:00',
    '2025-06-13',
    '21:30:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'ENGLISH',
    'Dinner following rehearsal'
  ) RETURNING id INTO v_rehearsal_dinner_event_id;

  -- Funeral Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Funeral Mass for Margaret Johnson',
    'Mass of Christian Burial for Margaret Johnson',
    v_responsible_party_id,
    'FUNERAL',
    '2025-05-20',
    '10:00:00',
    '2025-05-20',
    '11:30:00',
    'America/Chicago',
    false,
    v_church_location_id,
    'ENGLISH',
    'Funeral mass followed by burial'
  ) RETURNING id INTO v_funeral_event_id;

  -- Funeral Meal Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Funeral Meal for Margaret Johnson',
    'Reception meal following funeral',
    v_responsible_party_id,
    'MEAL',
    '2025-05-20',
    '12:00:00',
    '2025-05-20',
    '14:00:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'ENGLISH',
    'Luncheon in parish hall'
  ) RETURNING id INTO v_funeral_meal_event_id;

  -- Quinceanera Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Quinceañera for Isabella Garcia',
    'Quinceañera celebration mass',
    v_responsible_party_id,
    'QUINCEANERA',
    '2025-07-15',
    '11:00:00',
    '2025-07-15',
    '12:30:00',
    'America/Chicago',
    false,
    v_church_location_id,
    'SPANISH',
    'Quinceañera mass celebration'
  ) RETURNING id INTO v_quinceanera_event_id;

  -- Quinceanera Reception Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Quinceañera Reception for Isabella Garcia',
    'Reception celebration following mass',
    v_responsible_party_id,
    'RECEPTION',
    '2025-07-15',
    '14:00:00',
    '2025-07-15',
    '20:00:00',
    'America/Chicago',
    false,
    v_reception_hall_id,
    'SPANISH',
    'Celebration reception with dinner and dancing'
  ) RETURNING id INTO v_quinceanera_reception_id;

  -- Baptism Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Baptism of Sofia Martinez',
    'Sacrament of Baptism',
    v_responsible_party_id,
    'BAPTISM',
    '2025-04-27',
    '13:00:00',
    '2025-04-27',
    '14:00:00',
    'America/Chicago',
    false,
    v_church_location_id,
    'ENGLISH',
    'Sunday afternoon baptism'
  ) RETURNING id INTO v_baptism_event_id;

  -- Presentation Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Presentation of Miguel Lopez',
    'Presentation of the Child at the Temple',
    v_responsible_party_id,
    'PRESENTATION',
    '2025-05-04',
    '12:00:00',
    '2025-05-04',
    '13:00:00',
    'America/Chicago',
    false,
    v_church_location_id,
    'SPANISH',
    'Presentación del niño'
  ) RETURNING id INTO v_presentation_event_id;

  -- Mass Event
  INSERT INTO events (
    parish_id, name, description, responsible_party_id, event_type,
    start_date, start_time, end_date, end_time, timezone, is_all_day,
    location_id, language, note
  ) VALUES (
    v_parish_id,
    'Sunday Mass - 10:00 AM',
    'Sunday morning Mass',
    v_responsible_party_id,
    'MASS',
    '2025-06-01',
    '10:00:00',
    '2025-06-01',
    '11:15:00',
    'America/Chicago',
    false,
    v_church_location_id,
    'ENGLISH',
    'Sunday morning liturgy'
  ) RETURNING id INTO v_mass_event_id;

  RAISE NOTICE 'Created % events', 12;

  -- ============================================================
  -- READINGS: Create liturgical readings
  -- ============================================================

  -- Marriage First Reading
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'Genesis 1:26-28, 31a',
    E'Then God said: Let us make human beings in our image, after our likeness. Let them have dominion over the fish of the sea, the birds of the air, the tame animals, all the wild animals, and all the creatures that crawl on the earth.\n\nGod created mankind in his image; in the image of God he created them; male and female he created them.\n\nGod blessed them and God said to them: Be fertile and multiply; fill the earth and subdue it. Have dominion over the fish of the sea, the birds of the air, and all the living things that crawl on the earth.\n\nGod looked at everything he had made, and found it very good.',
    'A reading from the Book of Genesis',
    'The word of the Lord.',
    'ENGLISH',
    'marriage-1-a',
    ARRAY['marriage-1']
  ) RETURNING id INTO v_first_reading_marriage_id;

  -- Marriage Psalm
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'Psalm 128:1-2, 3, 4-5',
    E'R. Blessed are those who fear the Lord.\n\nBlessed are you who fear the LORD,\nwho walk in his ways!\nFor you shall eat the fruit of your handiwork;\nblessed shall you be, and favored.\n\nR. Blessed are those who fear the Lord.\n\nYour wife shall be like a fruitful vine\nin the recesses of your home;\nYour children like olive plants\naround your table.\n\nR. Blessed are those who fear the Lord.\n\nBehold, thus is the man blessed\nwho fears the LORD.\nThe LORD bless you from Zion:\nmay you see the prosperity of Jerusalem\nall the days of your life.\n\nR. Blessed are those who fear the Lord.',
    'Responsorial Psalm',
    NULL,
    'ENGLISH',
    'marriage-psalm-1',
    ARRAY['marriage-psalm']
  ) RETURNING id INTO v_psalm_marriage_id;

  -- Marriage Second Reading
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    '1 Corinthians 13:4-13',
    E'Brothers and sisters:\nLove is patient, love is kind. It is not jealous, love is not pompous, it is not inflated, it is not rude, it does not seek its own interests, it is not quick-tempered, it does not brood over injury, it does not rejoice over wrongdoing but rejoices with the truth. It bears all things, believes all things, hopes all things, endures all things.\n\nLove never fails. If there are prophecies, they will be brought to nothing; if tongues, they will cease; if knowledge, it will be brought to nothing. For we know partially and we prophesy partially, but when the perfect comes, the partial will pass away. When I was a child, I used to talk as a child, think as a child, reason as a child; when I became a man, I put aside childish things. At present we see indistinctly, as in a mirror, but then face to face. At present I know partially; then I shall know fully, as I am fully known. So faith, hope, love remain, these three; but the greatest of these is love.',
    'A reading from the first Letter of Saint Paul to the Corinthians',
    'The word of the Lord.',
    'ENGLISH',
    'marriage-2-b',
    ARRAY['marriage-2']
  ) RETURNING id INTO v_second_reading_marriage_id;

  -- Marriage Gospel
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'John 15:9-12',
    E'Jesus said to his disciples:\n"As the Father loves me, so I also love you. Remain in my love. If you keep my commandments, you will remain in my love, just as I have kept my Father''s commandments and remain in his love.\n\n"I have told you this so that my joy might be in you and your joy might be complete. This is my commandment: love one another as I love you."',
    'A reading from the holy Gospel according to John',
    'The Gospel of the Lord.',
    'ENGLISH',
    'marriage-gospel-4',
    ARRAY['marriage-gospel']
  ) RETURNING id INTO v_gospel_marriage_id;

  -- Funeral First Reading
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'Wisdom 3:1-6, 9',
    E'The souls of the just are in the hand of God,\nand no torment shall touch them.\nThey seemed, in the view of the foolish, to be dead;\nand their passing away was thought an affliction\nand their going forth from us, utter destruction.\nBut they are in peace.\nFor if before men, indeed, they be punished,\nyet is their hope full of immortality;\nChastised a little, they shall be greatly blessed,\nbecause God tried them\nand found them worthy of himself.\nAs gold in the furnace, he proved them,\nand as sacrificial offerings he took them to himself.\nThose who trust in him shall understand truth,\nand the faithful shall abide with him in love:\nBecause grace and mercy are with his holy ones,\nand his care is with his elect.',
    'A reading from the Book of Wisdom',
    'The word of the Lord.',
    'ENGLISH',
    'funeral-1-a',
    ARRAY['funeral-1']
  ) RETURNING id INTO v_first_reading_funeral_id;

  -- Funeral Psalm
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'Psalm 23:1-3, 4, 5, 6',
    E'R. The Lord is my shepherd; there is nothing I shall want.\n\nThe LORD is my shepherd; I shall not want.\nIn verdant pastures he gives me repose;\nBeside restful waters he leads me;\nhe refreshes my soul.\n\nR. The Lord is my shepherd; there is nothing I shall want.\n\nHe guides me in right paths\nfor his name''s sake.\nEven though I walk in the dark valley\nI fear no evil; for you are at my side\nWith your rod and your staff\nthat give me courage.\n\nR. The Lord is my shepherd; there is nothing I shall want.\n\nYou spread the table before me\nin the sight of my foes;\nYou anoint my head with oil;\nmy cup overflows.\n\nR. The Lord is my shepherd; there is nothing I shall want.\n\nOnly goodness and kindness follow me\nall the days of my life;\nAnd I shall dwell in the house of the LORD\nfor years to come.\n\nR. The Lord is my shepherd; there is nothing I shall want.',
    'Responsorial Psalm',
    NULL,
    'ENGLISH',
    'funeral-psalm-1',
    ARRAY['funeral-psalm']
  ) RETURNING id INTO v_psalm_funeral_id;

  -- Funeral Gospel
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'John 11:21-27',
    E'Martha said to Jesus,\n"Lord, if you had been here,\nmy brother would not have died.\nBut even now I know that whatever you ask of God,\nGod will give you."\nJesus said to her,\n"Your brother will rise."\nMartha said,\n"I know he will rise,\nin the resurrection on the last day."\nJesus told her,\n"I am the resurrection and the life;\nwhoever believes in me, even if he dies, will live,\nand everyone who lives and believes in me will never die.\nDo you believe this?"\nShe said to him, "Yes, Lord.\nI have come to believe that you are the Christ, the Son of God,\nthe one who is coming into the world."',
    'A reading from the holy Gospel according to John',
    'The Gospel of the Lord.',
    'ENGLISH',
    'funeral-gospel-3',
    ARRAY['funeral-gospel']
  ) RETURNING id INTO v_gospel_funeral_id;

  -- Baptism First Reading
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'Ezekiel 36:24-28',
    E'Thus says the Lord GOD:\nI will take you away from among the nations,\ngather you from all the foreign lands,\nand bring you back to your own land.\nI will sprinkle clean water upon you\nto cleanse you from all your impurities,\nand from all your idols I will cleanse you.\nI will give you a new heart and place a new spirit within you,\ntaking from your bodies your stony hearts\nand giving you natural hearts.\nI will put my spirit within you and make you live by my statutes,\ncareful to observe my decrees.\nYou shall live in the land I gave your fathers;\nyou shall be my people, and I will be your God.',
    'A reading from the Book of the Prophet Ezekiel',
    'The word of the Lord.',
    'ENGLISH',
    'baptism-1-a',
    ARRAY['baptism-1']
  ) RETURNING id INTO v_first_reading_baptism_id;

  -- Baptism Psalm
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'Psalm 23:1-3a, 3b-4, 5, 6',
    E'R. The Lord is my shepherd; there is nothing I shall want.\n\nThe LORD is my shepherd; I shall not want.\nIn verdant pastures he gives me repose;\nBeside restful waters he leads me;\nhe refreshes my soul.\n\nR. The Lord is my shepherd; there is nothing I shall want.\n\nHe guides me in right paths\nfor his name''s sake.\nEven though I walk in the dark valley\nI fear no evil; for you are at my side\nWith your rod and your staff\nthat give me courage.\n\nR. The Lord is my shepherd; there is nothing I shall want.\n\nYou spread the table before me\nin the sight of my foes;\nYou anoint my head with oil;\nmy cup overflows.\n\nR. The Lord is my shepherd; there is nothing I shall want.\n\nOnly goodness and kindness follow me\nall the days of my life;\nAnd I shall dwell in the house of the LORD\nfor years to come.\n\nR. The Lord is my shepherd; there is nothing I shall want.',
    'Responsorial Psalm',
    NULL,
    'ENGLISH',
    'baptism-psalm-1',
    ARRAY['baptism-psalm']
  ) RETURNING id INTO v_psalm_baptism_id;

  -- Baptism Second Reading
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'Romans 6:3-5',
    E'Brothers and sisters:\nAre you unaware that we who were baptized into Christ Jesus\nwere baptized into his death?\nWe were indeed buried with him through baptism into death,\nso that, just as Christ was raised from the dead\nby the glory of the Father,\nwe too might live in newness of life.\n\nFor if we have grown into union with him through a death like his,\nwe shall also be united with him in the resurrection.',
    'A reading from the Letter of Saint Paul to the Romans',
    'The word of the Lord.',
    'ENGLISH',
    'baptism-2-a',
    ARRAY['baptism-2']
  ) RETURNING id INTO v_second_reading_baptism_id;

  -- Baptism Gospel
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, lectionary_id, categories
  ) VALUES (
    v_parish_id,
    'Matthew 28:18-20',
    E'Jesus approached and said to his disciples:\n"All power in heaven and on earth has been given to me.\nGo, therefore, and make disciples of all nations,\nbaptizing them in the name of the Father,\nand of the Son, and of the Holy Spirit,\nteaching them to observe all that I have commanded you.\nAnd behold, I am with you always, until the end of the age."',
    'A reading from the holy Gospel according to Matthew',
    'The Gospel of the Lord.',
    'ENGLISH',
    'baptism-gospel-1',
    ARRAY['baptism-gospel']
  ) RETURNING id INTO v_gospel_baptism_id;

  RAISE NOTICE 'Created % readings', 11;

  -- ============================================================
  -- Get a liturgical event for mass (if available)
  -- ============================================================

  SELECT id INTO v_liturgical_event_id
  FROM global_liturgical_events
  WHERE date = '2025-06-01'
  LIMIT 1;

  -- ============================================================
  -- WEDDING: Create a fully populated wedding record
  -- ============================================================

  INSERT INTO weddings (
    parish_id,
    wedding_event_id,
    bride_id,
    groom_id,
    coordinator_id,
    presider_id,
    homilist_id,
    lead_musician_id,
    cantor_id,
    reception_event_id,
    rehearsal_event_id,
    rehearsal_dinner_event_id,
    witness_1_id,
    witness_2_id,
    status,
    wedding_template_id,
    first_reading_id,
    psalm_id,
    psalm_reader_id,
    psalm_is_sung,
    second_reading_id,
    gospel_reading_id,
    gospel_reader_id,
    first_reader_id,
    second_reader_id,
    petitions_read_by_second_reader,
    petition_reader_id,
    petitions,
    announcements,
    notes
  ) VALUES (
    v_parish_id,
    v_wedding_event_id,
    v_bride_id,
    v_groom_id,
    v_coordinator_id,
    v_presider_id,
    v_homilist_id,
    v_lead_musician_id,
    v_cantor_id,
    v_reception_event_id,
    v_rehearsal_event_id,
    v_rehearsal_dinner_event_id,
    v_witness_1_id,
    v_witness_2_id,
    'ACTIVE',
    'full-script-english',
    v_first_reading_marriage_id,
    v_psalm_marriage_id,
    v_psalm_reader_id,
    true,
    v_second_reading_marriage_id,
    v_gospel_marriage_id,
    v_gospel_reader_id,
    v_first_reader_id,
    v_second_reader_id,
    false,
    v_petition_reader_id,
    E'For the Church, that she may continue to be a sign of God''s love in the world, we pray to the Lord.\n\nFor Maria and James, that they may grow in love and faithfulness all the days of their lives, we pray to the Lord.\n\nFor their families, that they may continue to support and encourage this new family, we pray to the Lord.\n\nFor all married couples, that they may be strengthened in their commitment to one another, we pray to the Lord.\n\nFor those who are sick, suffering, or lonely, that they may experience God''s healing presence, we pray to the Lord.',
    E'Please join us for a reception immediately following the ceremony at the Parish Hall.\n\nPhotography is permitted during the ceremony, but please remain in your pews.\n\nThe family requests that cell phones be silenced during the ceremony.',
    'Beautiful summer wedding. Couple requested traditional hymns. Photographer will be present. Reception includes dinner and dancing.'
  ) RETURNING id INTO v_wedding_id;

  RAISE NOTICE 'Created wedding record: %', v_wedding_id;

  -- ============================================================
  -- FUNERAL: Create a fully populated funeral record
  -- ============================================================

  INSERT INTO funerals (
    parish_id,
    funeral_event_id,
    funeral_meal_event_id,
    deceased_id,
    family_contact_id,
    coordinator_id,
    presider_id,
    homilist_id,
    lead_musician_id,
    cantor_id,
    status,
    funeral_template_id,
    first_reading_id,
    psalm_id,
    psalm_reader_id,
    psalm_is_sung,
    second_reading_id,
    gospel_reading_id,
    gospel_reader_id,
    first_reader_id,
    second_reader_id,
    petitions_read_by_second_reader,
    petition_reader_id,
    petitions,
    announcements,
    note
  ) VALUES (
    v_parish_id,
    v_funeral_event_id,
    v_funeral_meal_event_id,
    v_deceased_id,
    v_family_contact_id,
    v_coordinator_id,
    v_presider_id,
    v_homilist_id,
    v_lead_musician_id,
    v_cantor_id,
    'ACTIVE',
    'full-script-english',
    v_first_reading_funeral_id,
    v_psalm_funeral_id,
    v_psalm_reader_id,
    true,
    NULL, -- Funerals typically don't have a second reading
    v_gospel_funeral_id,
    v_gospel_reader_id,
    v_first_reader_id,
    v_second_reader_id,
    true,
    NULL, -- Petitions read by second reader
    E'For Margaret, that she may rejoice forever in the presence of God, we pray to the Lord.\n\nFor the family and friends of Margaret, that they may find comfort in their faith and in one another, we pray to the Lord.\n\nFor all who mourn, that they may know the consolation of God''s love, we pray to the Lord.\n\nFor our departed loved ones, that they may rest in peace, we pray to the Lord.\n\nFor all of us, that we may live in hope of the resurrection, we pray to the Lord.',
    E'Following the burial at Calvary Cemetery, all are invited to join the family for a meal in the Parish Hall.\n\nIn lieu of flowers, the family requests donations to the parish building fund.',
    'Margaret was a longtime parishioner and active in many ministries. She will be deeply missed. Family prefers traditional hymns including Amazing Grace and Be Not Afraid.'
  ) RETURNING id INTO v_funeral_id;

  RAISE NOTICE 'Created funeral record: %', v_funeral_id;

  -- ============================================================
  -- QUINCEANERA: Create a fully populated quinceanera record
  -- ============================================================

  INSERT INTO quinceaneras (
    parish_id,
    quinceanera_event_id,
    quinceanera_reception_id,
    quinceanera_id,
    family_contact_id,
    coordinator_id,
    presider_id,
    homilist_id,
    lead_musician_id,
    cantor_id,
    status,
    quinceanera_template_id,
    first_reading_id,
    psalm_id,
    psalm_reader_id,
    psalm_is_sung,
    second_reading_id,
    gospel_reading_id,
    gospel_reader_id,
    first_reader_id,
    second_reader_id,
    petitions_read_by_second_reader,
    petition_reader_id,
    petitions,
    announcements,
    note
  ) VALUES (
    v_parish_id,
    v_quinceanera_event_id,
    v_quinceanera_reception_id,
    v_quinceanera_person_id,
    v_family_contact_id, -- Using same family contact
    v_coordinator_id,
    v_presider_id,
    v_homilist_id,
    v_lead_musician_id,
    v_cantor_id,
    'ACTIVE',
    'full-script-spanish',
    v_first_reading_marriage_id, -- Can reuse readings
    v_psalm_marriage_id,
    v_psalm_reader_id,
    true,
    v_second_reading_marriage_id,
    v_gospel_marriage_id,
    v_gospel_reader_id,
    v_first_reader_id,
    v_second_reader_id,
    false,
    v_petition_reader_id,
    E'Por Isabella, para que crezca en fe, esperanza y amor, roguemos al Señor.\n\nPor su familia, para que continúen apoyándola y guiándola en su camino de fe, roguemos al Señor.\n\nPor todos los jóvenes, para que encuentren su vocación y sigan a Cristo, roguemos al Señor.\n\nPor nuestra comunidad parroquial, para que seamos testimonio del amor de Dios, roguemos al Señor.',
    E'Todos están invitados a la recepción en el Salón Parroquial inmediatamente después de la Misa.\n\nFotografía está permitida durante la ceremonia.',
    'Quinceañera tradicional. La familia prefiere música en español. Habrá 14 damas y 14 chambelanes.'
  ) RETURNING id INTO v_quinceanera_id;

  RAISE NOTICE 'Created quinceanera record: %', v_quinceanera_id;

  -- ============================================================
  -- BAPTISM: Create a fully populated baptism record
  -- ============================================================

  INSERT INTO baptisms (
    parish_id,
    baptism_event_id,
    child_id,
    mother_id,
    father_id,
    sponsor_1_id,
    sponsor_2_id,
    presider_id,
    status,
    baptism_template_id,
    note
  ) VALUES (
    v_parish_id,
    v_baptism_event_id,
    v_child_baptism_id,
    v_mother_id,
    v_father_id,
    v_sponsor_1_id,
    v_sponsor_2_id,
    v_presider_id,
    'ACTIVE',
    'full-script-english',
    'First baptism of the month. Parents completed baptism preparation course. Godparents are confirmed Catholics in good standing. White baptismal gown will be worn.'
  ) RETURNING id INTO v_baptism_id;

  RAISE NOTICE 'Created baptism record: %', v_baptism_id;

  -- ============================================================
  -- PRESENTATION: Create a fully populated presentation record
  -- ============================================================

  INSERT INTO presentations (
    parish_id,
    presentation_event_id,
    child_id,
    mother_id,
    father_id,
    coordinator_id,
    is_baptized,
    status,
    note,
    presentation_template_id
  ) VALUES (
    v_parish_id,
    v_presentation_event_id,
    v_child_presentation_id,
    v_mother_id,
    v_father_id,
    v_coordinator_id,
    false, -- Child not yet baptized
    'ACTIVE',
    'Presentación del Niño. La familia prefiere la liturgia en español. El niño será bautizado el próximo mes.',
    'full-script-spanish'
  ) RETURNING id INTO v_presentation_id;

  RAISE NOTICE 'Created presentation record: %', v_presentation_id;

  -- ============================================================
  -- MASS: Create a fully populated mass record
  -- ============================================================

  INSERT INTO masses (
    parish_id,
    event_id,
    presider_id,
    homilist_id,
    liturgical_event_id,
    mass_roles_template_id,
    pre_mass_announcement_id,
    pre_mass_announcement_topic,
    status,
    mass_template_id,
    announcements,
    note,
    petitions
  ) VALUES (
    v_parish_id,
    v_mass_event_id,
    v_presider_id,
    v_homilist_id,
    v_liturgical_event_id,
    NULL, -- No mass roles template for this sample
    v_coordinator_id,
    'Parish Picnic Next Sunday',
    'PLANNING',
    'sunday-mass-english',
    E'Welcome to St. Mary''s Catholic Church. Please silence your cell phones.\n\nNext Sunday we will have our annual parish picnic following the 10 AM Mass. All are welcome!\n\nVolunteers are needed for vacation bible school. Please sign up in the parish hall.\n\nThe second collection today supports our sister parish in Haiti.',
    'First Sunday of the month. Children''s choir will sing. Special collection for missions.',
    E'For our Holy Father and all Church leaders, that they may guide us with wisdom and compassion, we pray to the Lord.\n\nFor world peace, especially in regions of conflict, we pray to the Lord.\n\nFor our parish community, that we may grow in faith and love, we pray to the Lord.\n\nFor the sick and suffering, especially those in our parish, we pray to the Lord.\n\nFor our beloved dead, that they may rest in peace, we pray to the Lord.'
  ) RETURNING id INTO v_mass_id;

  RAISE NOTICE 'Created mass record: %', v_mass_id;

  -- ============================================================
  -- MASS INTENTION: Create a mass intention linked to the mass
  -- ============================================================

  INSERT INTO mass_intentions (
    parish_id,
    mass_id,
    mass_offered_for,
    requested_by_id,
    date_received,
    date_requested,
    stipend_in_cents,
    status,
    note
  ) VALUES (
    v_parish_id,
    v_mass_id,
    'In memory of John White, beloved husband and father',
    v_requested_by_id,
    '2025-05-15',
    '2025-06-01',
    1000, -- $10.00 stipend
    'SCHEDULED',
    'Margaret White requests this mass for her late husband John, who passed away last year. She would like the intention announced during mass.'
  ) RETURNING id INTO v_mass_intention_id;

  RAISE NOTICE 'Created mass intention record: %', v_mass_intention_id;

  -- ============================================================
  -- SUMMARY
  -- ============================================================

  RAISE NOTICE '================================================================';
  RAISE NOTICE 'SEED DATA CREATION COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Parish ID: %', v_parish_id;
  RAISE NOTICE '';
  RAISE NOTICE 'People created: 25';
  RAISE NOTICE 'Locations created: 3';
  RAISE NOTICE 'Events created: 12';
  RAISE NOTICE 'Readings created: 11';
  RAISE NOTICE '';
  RAISE NOTICE 'Module Records Created:';
  RAISE NOTICE '  - Wedding: %', v_wedding_id;
  RAISE NOTICE '  - Funeral: %', v_funeral_id;
  RAISE NOTICE '  - Quinceanera: %', v_quinceanera_id;
  RAISE NOTICE '  - Baptism: %', v_baptism_id;
  RAISE NOTICE '  - Presentation: %', v_presentation_id;
  RAISE NOTICE '  - Mass: %', v_mass_id;
  RAISE NOTICE '  - Mass Intention: %', v_mass_intention_id;
  RAISE NOTICE '================================================================';

END $$;
