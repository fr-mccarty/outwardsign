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
  -- READINGS: Create liturgical readings from canonical library
  -- (First 10 readings from readingsData)
  -- ============================================================

  -- Reading 1: Matthew 5:1-12a
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Matthew 5:1-12a',
    'When Jesus saw the crowds, he went up the mountain, and after he had sat down, his disciples came to him. He began to teach them, saying: Blessed are the poor in spirit, for theirs is the Kingdom of heaven. Blessed are they who mourn, for they will be comforted. Blessed are the meek, for they will inherit the land. Blessed are they who hunger and thirst for righteousness, for they will be satisfied. Blessed are the merciful, for they will be shown mercy. Blessed are the clean of heart, for they will see God. Blessed are the peacemakers, for they will be called children of God. Blessed are they who are persecuted for the sake of righteousness, for theirs is the Kingdom of heaven. Blessed are you when they insult you and persecute you and utter every kind of evil against you falsely because of me. Rejoice and be glad, for your reward will be great in heaven.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Matthew',
    'The Gospel of the Lord.'
  );

  -- Reading 2: Matthew 11:25-30
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Matthew 11:25-30',
    'At that time Jesus answered; I give praise to you, Father, Lord of heaven and earth, for although you have hidden these things from the wise and the learned you have revealed them to the childlike. Yes, Father, such has been your gracious will. All things have been handed over to me by my Father. No one knows the Son except the Father, and no one knows the Father except the Son and anyone to whom the Son wishes to reveal him. Come to me, all you who labor and are burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am meek and humble of heart; and you will find rest for yourselves. For my yoke is easy, and my burden light.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Matthew',
    'The Gospel of the Lord.'
  );

  -- Reading 3: Matthew 25:1-13
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Matthew 25:1-13',
    'Jesus told his disciples this parable: The Kingdom of heaven will be like ten virgins who took their lamps and went out to meet the bridegroom. Five of them were foolish and five were wise. The foolish ones, when taking their lamps, brought no oil with them, but the wise brought flasks of oil with their lamps. Since the bridegroom was long delayed, they all became drowsy and fell asleep. At midnight, there was a cry, Behold, the bridegroom! Come out to meet him! Then all those virgins got up and trimmed their lamps. The foolish ones said to the wise, Give us some of your oil, for our lamps are going out. But the wise ones replied, No, for there may not be enough for us and you. Go instead to the merchants and buy some for yourselves. While they went off to buy it, the bridegroom came and those who were ready went to the wedding feast with him. Then the door was locked. Afterwards the other virgins came and said, Lord, Lord, open the door for us! But he said in reply, Amen, I say to you, I do not know you. Therefore, stay awake, for you know neither the day nor the hour.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Matthew',
    'The Gospel of the Lord.'
  );

  -- Reading 4: Matthew 25:31-46
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Matthew 25:31-46',
    'Jesus said to his disciples: When the Son of Man comes in his glory, and all the angels with him, he will sit upon his glorious throne, and all the nations will be assembled before him. And he will separate them one from another, as a shepherd separates the sheep from the goats. He will place the sheep on his right and the goats on his left. Then the king will say to those on his right, Come, you who are blessed by my Father. Inherit the kingdom prepared for you from the foundation of the world. For I was hungry and you gave me food. I was thirsty and you gave me drink, a stranger and you welcomed me, naked and you clothed me, ill and you cared for me, in prison and you visited me. Then the righteous will answer him and say, Lord, when did we see you hungry and feed you, or thirsty and give you drink? When did we see you a stranger and welcome you, or naked and clothe you? When did we see you ill or in prison, and visit you? And the king will say to them in reply, Amen, I say to you, whatever you did for one of these least brothers of mine, you did for me. Then he will say to those on his left, Depart from me, you accursed, into the eternal fire prepared for the Devil and his angels. For I was hungry and you gave me no food, I was thirsty and you gave me no drink, a stranger and you gave me no welcome, naked and you gave me no clothing, ill and in prison, and you did not care for me. Then they will answer and say, Lord, when did we see you hungry or thirsty or a stranger or naked or ill or in prison, and not minister to your needs? He will answer them, Amen, I say to you, what you did not do for one of these least ones, you did not do for me. And these will go off to eternal punishment, but the righteous to eternal life.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Matthew',
    'The Gospel of the Lord.'
  );

  -- Reading 5: Mark 15:33-39;16:1-6
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Mark 15:33-39;16:1-6',
    'At noon darkness came over the whole land until three in the afternoon. And at three oclock Jesus cried out in a loud voice, Eloi, Eloi, lema sabachthani? which is translated, My God, my God, why have you forsaken me? Some of the bystanders who heard it said, Look, he is calling Elijah. One of them ran, soaked a sponge with wine, put it on a reed, and gave it to him to drink, saying, Wait, let us see if Elijah comes to take him down. Jesus gave a loud cry and breathed his last. The veil of the sanctuary was torn in two from top to bottom. When the centurion who stood facing him saw how he breathed his last he said, Truly this man was the Son of God! When the Sabbath was over, Mary Magdalene, Mary, the mother of James, and Salome bought spices so that they might go and anoint him. Very early when the sun had risen, on the first day of the week, they came to the tomb. They were saying to one another, Who will roll back the stone for us from the entrance to the tomb? When they looked up, they saw that the stone had been rolled back; it was very large. On entering the tomb they saw a young man sitting on the right side, clothed in a white robe, and they were utterly amazed. He said to them, Do not be amazed! You seek Jesus of Nazareth, the crucified. He has been raised; he is not here. Behold the place where they laid him.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Mark',
    'The Gospel of the Lord.'
  );

  -- Reading 6: Luke 7:11-17
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Luke 7:11-17',
    'Jesus journeyed to a city called Nain, and his disciples and a large crowd accompanied him. As he drew near to the gate of the city, a man who had died was being carried out, the only son of his mother, and she was a widow. A large crowd from the city was with her. When the Lord saw her, he was moved with pity for her and said to her, Do not weep. He stepped forward and touched the coffin; at this the bearers halted, and he said, Young man, I tell you, arise! The dead man sat up and began to speak, and Jesus gave him to his mother. Fear seized them all, and they glorified God, exclaiming, A great prophet has arisen in our midst, and God has visited his people. This report about him spread through the whole of Judea and in all the surrounding region.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Luke',
    'The Gospel of the Lord.'
  );

  -- Reading 7: Luke 12:35-40
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Luke 12:35-40',
    'Jesus said to his disciples: Gird your loins and light your lamps and be like servants who await their master return from a wedding, ready to open immediately when he comes and knocks. Blessed are those servants whom the master finds vigilant on his arrival. Amen, I say to you, he will gird himself, have them recline at table, and proceed to wait on them. And should he come in the second or third watch and find them prepared in this way, blessed are those servants. Be sure of this: if the master of the house had known the hour when the thief was coming, he would not have let his house be broken into. You also must be prepared, for at an hour you do not expect, the Son of Man will come.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Luke',
    'The Gospel of the Lord.'
  );

  -- Reading 8: Luke 23:33,39-43
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Luke 23:33,39-43',
    'When the soldiers came to the place called the Skull, they crucified Jesus and the criminals there, one on his right, the other on his left. Now one of the criminals hanging there reviled Jesus, saying, Are you not the Christ? Save yourself and us. The other man, however, rebuking him, said in reply, Have you no fear of God, for you are subject to the same condemnation? And indeed, we have been condemned justly, for the sentence we received corresponds to our crimes, but this man has done nothing criminal. Then he said, Jesus, remember me when you come into your Kingdom. He replied to him, Amen, I say to you, today you will be with me in Paradise.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Luke',
    'The Gospel of the Lord.'
  );

  -- Reading 9: Luke 23:44-46,50,52;24:1-6a
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Luke 23:44-46,50,52;24:1-6a',
    'It was about noon and darkness came over the whole land until three in the afternoon because of an eclipse of the sun. Then the veil of the temple was torn down the middle. Jesus cried out in a loud voice, Father, into your hands I commend my spirit; and when he had said this he breathed his last. Now there was a virtuous and righteous man named Joseph who, though he was a member of the council, went to Pilate and asked for the Body of Jesus. After he had taken the Body down, he wrapped it in a linen cloth and laid him in a rock-hewn tomb in which no one had yet been buried. At daybreak on the first day of the week the women took the spices they had prepared and went to the tomb. They found the stone rolled away from the tomb; but when they entered, they did not find the Body of the Lord Jesus. While they were puzzling over this, behold, two men in dazzling garments appeared to them. They were terrified and bowed their faces to the ground. They said to them, Why do you seek the living one among the dead? He is not here, but he has been raised.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Luke',
    'The Gospel of the Lord.'
  );

  -- Reading 10: Luke 24:13-35
  INSERT INTO readings (
    parish_id, pericope, text, categories, language, introduction, conclusion
  ) VALUES (
    v_parish_id,
    'Luke 24:13-35',
    'That very day, the first day of the week, two of the disciples of Jesus were going to a village called Emmaus, seven miles from Jerusalem, and they were conversing about all the things that had occurred. And it happened that while they were conversing and debating, Jesus himself drew near and walked with them, but their eyes were prevented from recognizing him. He asked them, What are you discussing as you walk along? They stopped, looking downcast. One of them, named Cleopas, said to him in reply, Are you the only visitor to Jerusalem who does not know of the things that have taken place there in these days? And he replied to them, What sort of things? They said to him, The things that happened to Jesus the Nazarene, who was a prophet mighty in deed and word before God and all the people, how our chief priests and rulers both handed him over to a sentence of death and crucified him. But we were hoping that he would be the one to redeem Israel; and besides all this, it is now the third day since this took place. Some women from our group, however, have astounded us; they were at the tomb early in the morning and did not find his Body; they came back and reported that they had indeed seen a vision of angels who announced that he was alive. Then some of those with us went to the tomb and found things just as the women had described, but him they did not see. And he said to them, Oh, how foolish you are! How slow of heart to believe all that the prophets spoke! Was it not necessary that the Christ should suffer these things and enter into his glory? Then beginning with Moses and all the prophets, Jesus interpreted to them what referred to him in all the Scriptures. As they approached the village to which they were going, Jesus gave the impression that he was going on farther. But they urged him, Stay with us, for it is nearly evening and the day is almost over. So he went in to stay with them. And it happened that, while he was with them at table, he took bread, said the blessing, broke it, and gave it to them. With that their eyes were opened and they recognized him, but he vanished from their sight. Then they said to each other, Were not our hearts burning within us while he spoke to us on the way and opened the Scriptures to us? So they set out at once and returned to Jerusalem where they found gathered together the Eleven and those with them, who were saying, The Lord has truly been raised and has appeared to Simon! Then the two recounted what had taken place on the way and how he was made known to them in the breaking of the bread.',
    ARRAY['FUNERAL', 'GOSPEL'],
    'ENGLISH',
    'A reading from the holy Gospel according to Luke',
    'The Gospel of the Lord.'
  );

  RAISE NOTICE 'Created % readings', 10;

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
