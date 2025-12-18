/**
 * Events Seed Data - Sample events for onboarding
 *
 * Creates sample master_events with calendar_events for the 4 general event types:
 * - Bible Study
 * - Fundraiser
 * - Religious Education
 * - Staff Meeting
 *
 * This helps new parishes understand how to use the events module.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Seeds sample events for a new parish
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param parishId - The parish ID to seed data for
 */
export async function seedEventsForParish(supabase: SupabaseClient, parishId: string) {
  // =====================================================
  // Get Event Types
  // =====================================================
  const { data: eventTypes, error: eventTypesError } = await supabase
    .from('event_types')
    .select('id, slug, name')
    .eq('parish_id', parishId)
    .in('slug', ['bible-studies', 'fundraisers', 'religious-education', 'staff-meetings'])

  if (eventTypesError) {
    console.error('Error fetching event types:', eventTypesError)
    throw new Error(`Failed to fetch event types: ${eventTypesError.message}`)
  }

  if (!eventTypes || eventTypes.length === 0) {
    console.error('No event types found for parish')
    throw new Error('Failed to find event types for parish')
  }

  // Create a map of slug -> event type
  const eventTypeMap = new Map(eventTypes.map(et => [et.slug, et]))

  // =====================================================
  // Get Sample People (for leaders/coordinators)
  // =====================================================
  const { data: samplePeople, error: samplePeopleError } = await supabase
    .from('people')
    .select('id, full_name')
    .eq('parish_id', parishId)
    .limit(5)

  if (samplePeopleError) {
    console.error('Error fetching sample people:', samplePeopleError)
    // Don't throw - we can create events without people
  }

  const personId = samplePeople && samplePeople.length > 0 ? samplePeople[0].id : null

  // =====================================================
  // Get Sample Locations
  // =====================================================
  const { data: sampleLocations, error: sampleLocationsError } = await supabase
    .from('locations')
    .select('id, name')
    .eq('parish_id', parishId)
    .limit(5)

  if (sampleLocationsError) {
    console.error('Error fetching sample locations:', sampleLocationsError)
    // Don't throw - we can create events without locations
  }

  const locationId = sampleLocations && sampleLocations.length > 0 ? sampleLocations[0].id : null

  const createdEvents = []

  // =====================================================
  // 1. Bible Study Events
  // =====================================================
  const bibleStudyType = eventTypeMap.get('bible-studies')
  if (bibleStudyType) {
    // Get input field definitions for Bible Study
    const { data: bibleStudyFields, error: bibleStudyFieldsError } = await supabase
      .from('input_field_definitions')
      .select('id, name, type')
      .eq('event_type_id', bibleStudyType.id)

    if (bibleStudyFieldsError) {
      console.error('Error fetching Bible Study fields:', bibleStudyFieldsError)
      throw new Error(`Failed to fetch Bible Study fields: ${bibleStudyFieldsError.message}`)
    }

    const bibleStudyFieldMap = new Map((bibleStudyFields || []).map(f => [f.name, f]))
    const sessionField = bibleStudyFieldMap.get('Session')

    // Bible Study 1: Gospel of John Study
    const bibleStudy1FieldValues: Record<string, unknown> = {
      'Discussion Leader': personId,
      'Topic': 'The Gospel of John - Chapter 1',
      'Scripture Passage': 'John 1:1-18 - The Word Became Flesh',
      'Discussion Questions': '<p><strong>Reflection Questions:</strong></p><ul><li>What does it mean that "the Word was with God and the Word was God"?</li><li>How does John\'s prologue set the tone for his entire Gospel?</li><li>What is the significance of John the Baptist\'s testimony?</li></ul>',
      'Expected Attendance': 15,
      'Notes': '<p>Bring your Bible and a notebook for personal reflections.</p><p>Coffee and refreshments will be provided.</p>'
    }

    const { data: bibleStudy1, error: bibleStudy1Error } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: bibleStudyType.id,
        field_values: bibleStudy1FieldValues,
        presider_id: personId,
        status: 'PLANNING'
      })
      .select()
      .single()

    if (bibleStudy1Error) {
      console.error('Error creating Bible Study 1:', bibleStudy1Error)
      throw new Error(`Failed to create Bible Study 1: ${bibleStudy1Error.message}`)
    }

    // Create calendar event for Bible Study 1
    if (sessionField && bibleStudy1) {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setHours(19, 0, 0, 0) // 7:00 PM

      const endTime = new Date(nextWeek)
      endTime.setHours(20, 30, 0, 0) // 8:30 PM

      const { error: calendarEvent1Error } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: bibleStudy1.id,
          input_field_definition_id: sessionField.id,
          start_datetime: nextWeek.toISOString(),
          end_datetime: endTime.toISOString(),
          location_id: locationId,
          is_primary: true,
          is_all_day: false
        })

      if (calendarEvent1Error) {
        console.error('Error creating calendar event for Bible Study 1:', calendarEvent1Error)
      }
    }

    createdEvents.push(bibleStudy1)

    // Bible Study 2: Acts of the Apostles
    const bibleStudy2FieldValues: Record<string, unknown> = {
      'Discussion Leader': personId,
      'Topic': 'Acts of the Apostles - The Early Church',
      'Scripture Passage': 'Acts 2:42-47 - Life Among the Believers',
      'Discussion Questions': '<p><strong>Discussion Topics:</strong></p><ul><li>What characterized the early Christian community?</li><li>How can we live out the four pillars: teaching, fellowship, breaking bread, and prayer?</li><li>What does it mean to have "everything in common"?</li></ul>',
      'Expected Attendance': 12,
      'Notes': '<p>This session will focus on community life and discipleship.</p>'
    }

    const { data: bibleStudy2, error: bibleStudy2Error } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: bibleStudyType.id,
        field_values: bibleStudy2FieldValues,
        presider_id: personId,
        status: 'PLANNING'
      })
      .select()
      .single()

    if (bibleStudy2Error) {
      console.error('Error creating Bible Study 2:', bibleStudy2Error)
      throw new Error(`Failed to create Bible Study 2: ${bibleStudy2Error.message}`)
    }

    // Create calendar event for Bible Study 2
    if (sessionField && bibleStudy2) {
      const twoWeeks = new Date()
      twoWeeks.setDate(twoWeeks.getDate() + 14)
      twoWeeks.setHours(19, 0, 0, 0) // 7:00 PM

      const endTime = new Date(twoWeeks)
      endTime.setHours(20, 30, 0, 0) // 8:30 PM

      const { error: calendarEvent2Error } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: bibleStudy2.id,
          input_field_definition_id: sessionField.id,
          start_datetime: twoWeeks.toISOString(),
          end_datetime: endTime.toISOString(),
          location_id: locationId,
          is_primary: true,
          is_all_day: false
        })

      if (calendarEvent2Error) {
        console.error('Error creating calendar event for Bible Study 2:', calendarEvent2Error)
      }
    }

    createdEvents.push(bibleStudy2)
  }

  // =====================================================
  // 2. Fundraiser Events
  // =====================================================
  const fundraiserType = eventTypeMap.get('fundraisers')
  if (fundraiserType) {
    // Get input field definitions for Fundraiser
    const { data: fundraiserFields, error: fundraiserFieldsError } = await supabase
      .from('input_field_definitions')
      .select('id, name, type')
      .eq('event_type_id', fundraiserType.id)

    if (fundraiserFieldsError) {
      console.error('Error fetching Fundraiser fields:', fundraiserFieldsError)
      throw new Error(`Failed to fetch Fundraiser fields: ${fundraiserFieldsError.message}`)
    }

    const fundraiserFieldMap = new Map((fundraiserFields || []).map(f => [f.name, f]))
    const eventDateField = fundraiserFieldMap.get('Event Date')

    // Fundraiser 1: Spring Pancake Breakfast
    const fundraiser1FieldValues: Record<string, unknown> = {
      'Event Coordinator': personId,
      'Fundraising Goal': 2500,
      'Event Description': '<p><strong>Join us for our annual Spring Pancake Breakfast!</strong></p><p>All proceeds go toward our parish youth ministry programs.</p><p><strong>Menu:</strong> Pancakes, sausage, eggs, fruit, juice, and coffee</p><p><strong>Pricing:</strong> Adults $10, Children (under 12) $5, Family (4+) $30</p>',
      'Volunteer Needs': '<ul><li>Kitchen helpers (6 volunteers needed)</li><li>Servers (4 volunteers needed)</li><li>Cashiers (2 volunteers needed)</li><li>Setup crew (4 volunteers needed, arrive at 6:30 AM)</li><li>Cleanup crew (4 volunteers needed)</li></ul>',
      'Setup Notes': '<p>Setup begins at 6:30 AM. Tables and chairs need to be arranged in parish hall. Kitchen equipment should be prepped and ready by 7:30 AM.</p>',
      'Cleanup Notes': '<p>All tables, chairs, and kitchen equipment must be cleaned and stored. Floors should be swept and mopped. Estimated cleanup time: 1.5 hours.</p>'
    }

    const { data: fundraiser1, error: fundraiser1Error } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: fundraiserType.id,
        field_values: fundraiser1FieldValues,
        presider_id: personId,
        status: 'PLANNING'
      })
      .select()
      .single()

    if (fundraiser1Error) {
      console.error('Error creating Fundraiser 1:', fundraiser1Error)
      throw new Error(`Failed to create Fundraiser 1: ${fundraiser1Error.message}`)
    }

    // Create calendar event for Fundraiser 1
    if (eventDateField && fundraiser1) {
      const threeWeeks = new Date()
      threeWeeks.setDate(threeWeeks.getDate() + 21)
      threeWeeks.setHours(8, 0, 0, 0) // 8:00 AM

      const endTime = new Date(threeWeeks)
      endTime.setHours(12, 0, 0, 0) // 12:00 PM

      const { error: calendarEvent3Error } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: fundraiser1.id,
          input_field_definition_id: eventDateField.id,
          start_datetime: threeWeeks.toISOString(),
          end_datetime: endTime.toISOString(),
          location_id: locationId,
          is_primary: true,
          is_all_day: false
        })

      if (calendarEvent3Error) {
        console.error('Error creating calendar event for Fundraiser 1:', calendarEvent3Error)
      }
    }

    createdEvents.push(fundraiser1)

    // Fundraiser 2: Parish Festival
    const fundraiser2FieldValues: Record<string, unknown> = {
      'Event Coordinator': personId,
      'Fundraising Goal': 10000,
      'Event Description': '<p><strong>Annual Parish Festival - A Day of Faith, Family, and Fun!</strong></p><p>Join us for games, food, raffles, live music, and more!</p><p><strong>Activities:</strong></p><ul><li>Food booths (tamales, BBQ, baked goods, drinks)</li><li>Games and activities for children</li><li>Raffle with great prizes</li><li>Live music performance at 2 PM</li><li>Silent auction</li></ul>',
      'Volunteer Needs': '<ul><li>Booth coordinators (10 needed)</li><li>Raffle ticket sellers (8 needed)</li><li>Game booth operators (6 needed)</li><li>Food service helpers (12 needed)</li><li>Setup and teardown crew (15 needed)</li><li>Parking attendants (4 needed)</li></ul>',
      'Setup Notes': '<p>Setup starts Friday evening at 6 PM and continues Saturday morning at 7 AM. Tents, tables, booths, and signage need to be set up. Sound system must be tested by 11 AM.</p>',
      'Cleanup Notes': '<p>Cleanup begins immediately after event ends at 6 PM. All tents, tables, equipment must be cleaned and stored. Trash removal and grounds cleanup required. Estimated time: 3 hours.</p>'
    }

    const { data: fundraiser2, error: fundraiser2Error } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: fundraiserType.id,
        field_values: fundraiser2FieldValues,
        presider_id: personId,
        status: 'PLANNING'
      })
      .select()
      .single()

    if (fundraiser2Error) {
      console.error('Error creating Fundraiser 2:', fundraiser2Error)
      throw new Error(`Failed to create Fundraiser 2: ${fundraiser2Error.message}`)
    }

    // Create calendar event for Fundraiser 2
    if (eventDateField && fundraiser2) {
      const fiveWeeks = new Date()
      fiveWeeks.setDate(fiveWeeks.getDate() + 35)
      fiveWeeks.setHours(11, 0, 0, 0) // 11:00 AM

      const endTime = new Date(fiveWeeks)
      endTime.setHours(18, 0, 0, 0) // 6:00 PM

      const { error: calendarEvent4Error } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: fundraiser2.id,
          input_field_definition_id: eventDateField.id,
          start_datetime: fiveWeeks.toISOString(),
          end_datetime: endTime.toISOString(),
          location_id: locationId,
          is_primary: true,
          is_all_day: false
        })

      if (calendarEvent4Error) {
        console.error('Error creating calendar event for Fundraiser 2:', calendarEvent4Error)
      }
    }

    createdEvents.push(fundraiser2)
  }

  // =====================================================
  // 3. Religious Education Events
  // =====================================================
  const religiousEdType = eventTypeMap.get('religious-education')
  if (religiousEdType) {
    // Get input field definitions for Religious Education
    const { data: religiousEdFields, error: religiousEdFieldsError } = await supabase
      .from('input_field_definitions')
      .select('id, name, type')
      .eq('event_type_id', religiousEdType.id)

    if (religiousEdFieldsError) {
      console.error('Error fetching Religious Education fields:', religiousEdFieldsError)
      throw new Error(`Failed to fetch Religious Education fields: ${religiousEdFieldsError.message}`)
    }

    const religiousEdFieldMap = new Map((religiousEdFields || []).map(f => [f.name, f]))
    const classSessionField = religiousEdFieldMap.get('Class Session')

    // Religious Education 1: First Communion Preparation
    const religiousEd1FieldValues: Record<string, unknown> = {
      'Catechist': personId,
      'Grade Level': '2nd Grade',
      'Lesson Topic': 'The Eucharist - Bread of Life',
      'Lesson Plan': '<p><strong>Objectives:</strong></p><ul><li>Understand that Jesus is truly present in the Eucharist</li><li>Learn about the Last Supper</li><li>Recognize the parts of the Mass</li></ul><p><strong>Activities:</strong></p><ol><li>Opening prayer and attendance (5 min)</li><li>Story of the Last Supper (10 min)</li><li>Discussion: Why did Jesus give us the Eucharist? (10 min)</li><li>Coloring activity: Parts of the Mass (15 min)</li><li>Practice reverent behavior for receiving Communion (10 min)</li><li>Closing prayer (5 min)</li></ol>',
      'Materials Needed': '<ul><li>Children\'s Bibles (one per child)</li><li>Coloring sheets - "Parts of the Mass"</li><li>Crayons and markers</li><li>Visual aids showing the Last Supper</li><li>Practice hosts (unconsecrated wafers)</li></ul>',
      'Homework Assignment': '<p>With your parents, attend Mass this Sunday. Pay special attention to the Liturgy of the Eucharist. Draw a picture of what you see during Communion.</p>'
    }

    const { data: religiousEd1, error: religiousEd1Error } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: religiousEdType.id,
        field_values: religiousEd1FieldValues,
        presider_id: personId,
        status: 'PLANNING'
      })
      .select()
      .single()

    if (religiousEd1Error) {
      console.error('Error creating Religious Education 1:', religiousEd1Error)
      throw new Error(`Failed to create Religious Education 1: ${religiousEd1Error.message}`)
    }

    // Create calendar event for Religious Education 1
    if (classSessionField && religiousEd1) {
      const nextSunday = new Date()
      const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7
      nextSunday.setDate(nextSunday.getDate() + daysUntilSunday)
      nextSunday.setHours(10, 30, 0, 0) // 10:30 AM

      const endTime = new Date(nextSunday)
      endTime.setHours(11, 30, 0, 0) // 11:30 AM

      const { error: calendarEvent5Error } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: religiousEd1.id,
          input_field_definition_id: classSessionField.id,
          start_datetime: nextSunday.toISOString(),
          end_datetime: endTime.toISOString(),
          location_id: locationId,
          is_primary: true,
          is_all_day: false
        })

      if (calendarEvent5Error) {
        console.error('Error creating calendar event for Religious Education 1:', calendarEvent5Error)
      }
    }

    createdEvents.push(religiousEd1)

    // Religious Education 2: Confirmation Preparation
    const religiousEd2FieldValues: Record<string, unknown> = {
      'Catechist': personId,
      'Grade Level': '8th Grade',
      'Lesson Topic': 'The Gifts of the Holy Spirit',
      'Lesson Plan': '<p><strong>Learning Goals:</strong></p><ul><li>Identify the seven gifts of the Holy Spirit</li><li>Understand how these gifts help us live as disciples</li><li>Reflect on how we can use these gifts in daily life</li></ul><p><strong>Lesson Plan:</strong></p><ol><li>Opening prayer to the Holy Spirit (5 min)</li><li>Review: Who is the Holy Spirit? (10 min)</li><li>Teaching: The Seven Gifts (Wisdom, Understanding, Counsel, Fortitude, Knowledge, Piety, Fear of the Lord) (20 min)</li><li>Small group activity: Match gifts to real-life scenarios (15 min)</li><li>Personal reflection: Which gift do I need most right now? (10 min)</li><li>Closing prayer and blessing (5 min)</li></ol>',
      'Materials Needed': '<ul><li>Bibles (one per student)</li><li>Handout: "Seven Gifts of the Holy Spirit"</li><li>Scenario cards for group activity</li><li>Journals for personal reflection</li><li>Prayer cards with the "Come Holy Spirit" prayer</li></ul>',
      'Homework Assignment': '<p>Interview a confirmed Catholic (parent, godparent, or parish member) about which gift of the Holy Spirit has been most important in their life. Write a one-page reflection on what you learned.</p>'
    }

    const { data: religiousEd2, error: religiousEd2Error } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: religiousEdType.id,
        field_values: religiousEd2FieldValues,
        presider_id: personId,
        status: 'PLANNING'
      })
      .select()
      .single()

    if (religiousEd2Error) {
      console.error('Error creating Religious Education 2:', religiousEd2Error)
      throw new Error(`Failed to create Religious Education 2: ${religiousEd2Error.message}`)
    }

    // Create calendar event for Religious Education 2
    if (classSessionField && religiousEd2) {
      const nextWednesday = new Date()
      const daysUntilWednesday = (3 - nextWednesday.getDay() + 7) % 7 || 7
      nextWednesday.setDate(nextWednesday.getDate() + daysUntilWednesday)
      nextWednesday.setHours(18, 30, 0, 0) // 6:30 PM

      const endTime = new Date(nextWednesday)
      endTime.setHours(19, 45, 0, 0) // 7:45 PM

      const { error: calendarEvent6Error } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: religiousEd2.id,
          input_field_definition_id: classSessionField.id,
          start_datetime: nextWednesday.toISOString(),
          end_datetime: endTime.toISOString(),
          location_id: locationId,
          is_primary: true,
          is_all_day: false
        })

      if (calendarEvent6Error) {
        console.error('Error creating calendar event for Religious Education 2:', calendarEvent6Error)
      }
    }

    createdEvents.push(religiousEd2)
  }

  // =====================================================
  // 4. Staff Meeting Events
  // =====================================================
  const staffMeetingType = eventTypeMap.get('staff-meetings')
  if (staffMeetingType) {
    // Get input field definitions for Staff Meeting
    const { data: staffMeetingFields, error: staffMeetingFieldsError } = await supabase
      .from('input_field_definitions')
      .select('id, name, type')
      .eq('event_type_id', staffMeetingType.id)

    if (staffMeetingFieldsError) {
      console.error('Error fetching Staff Meeting fields:', staffMeetingFieldsError)
      throw new Error(`Failed to fetch Staff Meeting fields: ${staffMeetingFieldsError.message}`)
    }

    const staffMeetingFieldMap = new Map((staffMeetingFields || []).map(f => [f.name, f]))
    const meetingDateField = staffMeetingFieldMap.get('Meeting Date')

    // Staff Meeting 1: Monthly Planning Meeting
    const staffMeeting1FieldValues: Record<string, unknown> = {
      'Meeting Leader': personId,
      'Agenda': '<p><strong>Monthly Staff Meeting Agenda</strong></p><ol><li>Opening Prayer (5 min)</li><li>Review of Last Month\'s Action Items (10 min)</li><li>Upcoming Liturgical Season Planning (20 min)<ul><li>Lent preparation</li><li>Special liturgies</li><li>Sacrament schedule</li></ul></li><li>Ministry Updates (15 min)<ul><li>Faith Formation</li><li>Youth Ministry</li><li>Music Ministry</li></ul></li><li>Facilities and Maintenance (10 min)</li><li>Budget Review (10 min)</li><li>New Business (10 min)</li><li>Closing Prayer and Adjournment (5 min)</li></ol>',
      'Meeting Minutes': '',
      'Action Items': '<ul><li>Prepare Lenten materials by February 1st (Assigned to: Faith Formation Director)</li><li>Schedule additional confessions for Lent (Assigned to: Pastor)</li><li>Review HVAC maintenance schedule (Assigned to: Facilities Manager)</li><li>Update parish website with Lenten schedule (Assigned to: Communications Coordinator)</li></ul>'
    }

    const { data: staffMeeting1, error: staffMeeting1Error } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: staffMeetingType.id,
        field_values: staffMeeting1FieldValues,
        presider_id: personId,
        status: 'PLANNING'
      })
      .select()
      .single()

    if (staffMeeting1Error) {
      console.error('Error creating Staff Meeting 1:', staffMeeting1Error)
      throw new Error(`Failed to create Staff Meeting 1: ${staffMeeting1Error.message}`)
    }

    // Create calendar event for Staff Meeting 1
    if (meetingDateField && staffMeeting1) {
      const nextMonday = new Date()
      const daysUntilMonday = (1 - nextMonday.getDay() + 7) % 7 || 7
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
      nextMonday.setHours(9, 0, 0, 0) // 9:00 AM

      const endTime = new Date(nextMonday)
      endTime.setHours(10, 30, 0, 0) // 10:30 AM

      const { error: calendarEvent7Error } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: staffMeeting1.id,
          input_field_definition_id: meetingDateField.id,
          start_datetime: nextMonday.toISOString(),
          end_datetime: endTime.toISOString(),
          location_id: locationId,
          is_primary: true,
          is_all_day: false
        })

      if (calendarEvent7Error) {
        console.error('Error creating calendar event for Staff Meeting 1:', calendarEvent7Error)
      }
    }

    createdEvents.push(staffMeeting1)

    // Staff Meeting 2: Year-End Review
    const staffMeeting2FieldValues: Record<string, unknown> = {
      'Meeting Leader': personId,
      'Agenda': '<p><strong>Year-End Review and Planning Meeting</strong></p><ol><li>Opening Prayer (5 min)</li><li>Year in Review (30 min)<ul><li>Sacrament statistics (Baptisms, Weddings, Funerals)</li><li>Ministry participation numbers</li><li>Financial summary</li><li>Major accomplishments and challenges</li></ul></li><li>Next Year\'s Goals and Priorities (25 min)<ul><li>Evangelization initiatives</li><li>Youth and young adult outreach</li><li>Facility improvements</li><li>Staff development</li></ul></li><li>Budget Considerations for Next Year (15 min)</li><li>Staff Appreciation and Gratitude (10 min)</li><li>Closing Prayer (5 min)</li></ol>',
      'Meeting Minutes': '',
      'Action Items': '<ul><li>Compile annual report for bulletin (Assigned to: Communications Team)</li><li>Draft next year\'s ministry calendar (Assigned to: All Ministry Leaders)</li><li>Schedule staff retreat for January (Assigned to: Parish Administrator)</li><li>Review and update position descriptions (Assigned to: HR/Pastor)</li></ul>'
    }

    const { data: staffMeeting2, error: staffMeeting2Error } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: staffMeetingType.id,
        field_values: staffMeeting2FieldValues,
        presider_id: personId,
        status: 'PLANNING'
      })
      .select()
      .single()

    if (staffMeeting2Error) {
      console.error('Error creating Staff Meeting 2:', staffMeeting2Error)
      throw new Error(`Failed to create Staff Meeting 2: ${staffMeeting2Error.message}`)
    }

    // Create calendar event for Staff Meeting 2
    if (meetingDateField && staffMeeting2) {
      const sixWeeks = new Date()
      sixWeeks.setDate(sixWeeks.getDate() + 42)
      sixWeeks.setHours(13, 0, 0, 0) // 1:00 PM

      const endTime = new Date(sixWeeks)
      endTime.setHours(15, 0, 0, 0) // 3:00 PM

      const { error: calendarEvent8Error } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: staffMeeting2.id,
          input_field_definition_id: meetingDateField.id,
          start_datetime: sixWeeks.toISOString(),
          end_datetime: endTime.toISOString(),
          location_id: locationId,
          is_primary: true,
          is_all_day: false
        })

      if (calendarEvent8Error) {
        console.error('Error creating calendar event for Staff Meeting 2:', calendarEvent8Error)
      }
    }

    createdEvents.push(staffMeeting2)
  }

  return {
    success: true,
    events: createdEvents,
    count: createdEvents.length
  }
}
