# Mass Scheduling Algorithms

## Overview

Mass scheduling involves two distinct, sequential algorithms:

1. **Mass Schedule Generation Algorithm** - Creates Mass records for a date range
2. **Minister Assignment Algorithm** - Assigns people to roles for those Masses

These algorithms are independent and serve different purposes.

---

## Algorithm 1: Mass Schedule Generation

**Purpose**: Create Mass records based on parish's regular schedule and liturgical calendar

**Input**:
- Start Date and End Date
- Mass Times Templates (which days/times to schedule)
- Selected Liturgical Events (optional context for special days)
- Mass Role Template (which roles each Mass needs)

**Output**:
- Collection of Mass records with dates, times, and empty role assignments

### Step-by-Step Process

#### Step 1: Initialize Date Range
```
FOR each date FROM start_date TO end_date
  current_date = date
  day_of_week = getDayOfWeek(current_date)
```

#### Step 2: Match Mass Times Templates
```
  FOR each selected_mass_times_template
    IF template.day_of_week == day_of_week THEN
      // This template applies to this date

      FOR each item in template.items
        IF item.day_type == 'IS_DAY' THEN
          // Mass occurs on the actual day
          mass_date = current_date
          create_proposed_mass = true
        ELSE IF item.day_type == 'DAY_BEFORE' THEN
          // Vigil Mass: occurs the day before (e.g., Saturday vigil for Sunday)
          mass_date = current_date - 1 day
          create_proposed_mass = true
        END IF
      END FOR
    END IF
  END FOR
```

#### Step 3: Check for Liturgical Events (Optional Context)
```
  liturgical_event = NULL

  FOR each selected_liturgical_event
    IF event.date == current_date THEN
      liturgical_event = event
      BREAK
    END IF
  END FOR
```

**Important**: Liturgical events do NOT prevent Mass creation. They only provide context/metadata.

#### Step 4: Create Mass Record
```
  IF create_proposed_mass THEN
    mass = {
      date: current_date,
      time: template.time,
      language: template.language,
      mass_times_template_id: template.id,
      liturgical_event_id: liturgical_event?.id (optional),
      liturgical_event_name: liturgical_event?.name (optional),
      role_assignments: [] (empty, to be filled by Algorithm 2)
    }

    proposed_masses.add(mass)
  END IF
```

#### Step 5: User Review & Manual Adjustments
```
User can:
- View all proposed Masses in calendar
- Exclude specific Masses (set isIncluded = false)
- See which Masses fall on liturgical events
- Manually add/remove dates before finalizing
```

### Example 1: Sunday Schedule with Vigil Mass

**Input**:
- Date Range: Nov 1 - Nov 30, 2025
- Mass Times Template: "Sunday Schedule"
  - Template day_of_week: SUNDAY
  - Items:
    - Saturday 5:00 PM (day_type: DAY_BEFORE) ← Vigil
    - Sunday 9:00 AM (day_type: IS_DAY)
    - Sunday 11:00 AM (day_type: IS_DAY)

**Processing**:
```
Nov 1 (Saturday):
  - No match (not Sunday)

Nov 2 (Sunday):
  - Template matches: "Sunday Schedule"
  - Item 1: Saturday 5:00 PM (DAY_BEFORE) → Create Mass on Nov 1 at 5:00 PM
  - Item 2: Sunday 9:00 AM (IS_DAY) → Create Mass on Nov 2 at 9:00 AM
  - Item 3: Sunday 11:00 AM (IS_DAY) → Create Mass on Nov 2 at 11:00 AM

Nov 8 (Saturday):
  - No match (not Sunday)

Nov 9 (Sunday):
  - Template matches: "Sunday Schedule"
  - Item 1: Saturday 5:00 PM (DAY_BEFORE) → Create Mass on Nov 8 at 5:00 PM
  - Item 2: Sunday 9:00 AM (IS_DAY) → Create Mass on Nov 9 at 9:00 AM
  - Item 3: Sunday 11:00 AM (IS_DAY) → Create Mass on Nov 9 at 11:00 AM

... continues for all Sundays in range
```

**Output**: 12 Masses created for 4 Sundays:
- 4 Saturday vigil Masses (5:00 PM on Nov 1, 8, 15, 22, 29)
- 4 Sunday morning Masses (9:00 AM on Nov 2, 9, 16, 23, 30)
- 4 Sunday late morning Masses (11:00 AM on Nov 2, 9, 16, 23, 30)

**Key Point**: When the algorithm processes Sunday, it creates Masses for **both** Saturday evening (vigil) and Sunday morning/afternoon.

### Example 2: Sunday Schedule with Solemnity

**Input**:
- Date Range: Nov 1 - Nov 30, 2025
- Mass Times Template: "Sunday Schedule" (with vigil, as above)
- Liturgical Event: "Christ the King" - Sunday, Nov 23, 2025 (selected)

**Processing**:
```
Nov 23 (Sunday):
  - Template matches: "Sunday Schedule"
  - Item 1: Saturday 5:00 PM (DAY_BEFORE) → Create Mass on Nov 22 at 5:00 PM
    ✓ liturgical_event: "Christ the King"
  - Item 2: Sunday 9:00 AM (IS_DAY) → Create Mass on Nov 23 at 9:00 AM
    ✓ liturgical_event: "Christ the King"
  - Item 3: Sunday 11:00 AM (IS_DAY) → Create Mass on Nov 23 at 11:00 AM
    ✓ liturgical_event: "Christ the King"
```

**Output**: 3 Masses for Christ the King:
- Saturday Nov 22, 5:00 PM (Vigil)
- Sunday Nov 23, 9:00 AM
- Sunday Nov 23, 11:00 AM

All three have liturgical event metadata: "Christ the King"

**Key Point**: Vigil Masses for liturgical events also get tagged with the event metadata, even though they occur the day before.

---

## Algorithm 2: Minister Assignment

**Purpose**: Assign people to roles for each Mass

**Input**:
- Collection of Masses (from Algorithm 1)
- Mass Role Template (defines which roles are needed)
- Available Ministers (people assigned to each role)
- Algorithm Options:
  - Balance Workload
  - Respect Blackout Dates
  - Allow Manual Adjustments

**Output**:
- Mass records with role assignments populated (person_id assigned to each role)

### Step-by-Step Process

#### Step 1: Get Required Roles from Template
```
role_template = getMassRoleTemplate(template_id)

required_roles = []
FOR each item in role_template.items
  FOR i = 1 to item.count
    required_roles.add({
      role_id: item.mass_role_id,
      role_name: item.mass_role.name
    })
  END FOR
END FOR
```

**Example**:
```
Template: "Sunday Mass Roles"
Items:
  - Lector × 2
  - Usher × 4
  - Eucharistic Minister × 3

Required Roles: [Lector, Lector, Usher, Usher, Usher, Usher, EM, EM, EM]
```

#### Step 2: For Each Mass, Assign Each Role
```
FOR each mass in masses
  assigned_person_ids = [] // Track who's already assigned to this Mass

  FOR each required_role in required_roles
    person = findBestMinister(
      role_id: required_role.role_id,
      mass_date: mass.date,
      mass_time: mass.time,
      already_assigned: assigned_person_ids,
      options: algorithm_options
    )

    IF person found THEN
      mass.role_assignments.add({
        role_id: required_role.role_id,
        person_id: person.id,
        status: ASSIGNED
      })
      assigned_person_ids.add(person.id)
    ELSE
      mass.role_assignments.add({
        role_id: required_role.role_id,
        person_id: NULL,
        status: UNASSIGNED
      })
    END IF
  END FOR
END FOR
```

#### Step 3: Find Best Minister (Sub-Algorithm)
```
FUNCTION findBestMinister(role_id, mass_date, mass_time, already_assigned, options):

  // Get all people assigned to this role
  ministers = getMassRoleMembers(role_id, active=true)

  // Filter out people already assigned to this specific Mass
  available = ministers.filter(m => !already_assigned.includes(m.person_id))

  IF options.respectBlackoutDates THEN
    // Remove people who are unavailable on this date
    available = available.filter(m => !hasBlackoutDate(m.person_id, mass_date))
  END IF

  IF available.length == 0 THEN
    RETURN NULL // No one available
  END IF

  IF options.balanceWorkload THEN
    // Sort by fewest assignments in this date range
    available.sortBy(m => m.assignment_count, ascending)
  END IF

  RETURN available[0] // Return first eligible minister
END FUNCTION
```

### Example: Assigning Sunday Nov 23

**Mass**: Sunday Nov 23, 9:00 AM (Christ the King)

**Required Roles**: Lector × 2, Usher × 4

**Available Ministers**:
- Lector: Alice (2 assignments), Bob (3 assignments), Carol (1 assignment)
- Usher: Dave (5 assignments), Eve (4 assignments), Frank (4 assignments), Grace (6 assignments)

**With Balance Workload = TRUE**:

```
Assign Lector #1:
  - Available: Alice (2), Bob (3), Carol (1)
  - Choose: Carol (lowest count)
  - Assigned: [Carol]

Assign Lector #2:
  - Available: Alice (2), Bob (3) [Carol excluded - already assigned]
  - Choose: Alice (lowest count)
  - Assigned: [Carol, Alice]

Assign Usher #1:
  - Available: Dave (5), Eve (4), Frank (4), Grace (6)
  - Choose: Eve (lowest count, first in list)
  - Assigned: [Carol, Alice, Eve]

Assign Usher #2:
  - Available: Dave (5), Frank (4), Grace (6) [Eve excluded]
  - Choose: Frank (lowest count)
  - Assigned: [Carol, Alice, Eve, Frank]

... and so on
```

**Result**:
- Lector #1: Carol
- Lector #2: Alice
- Usher #1: Eve
- Usher #2: Frank
- Usher #3: Dave
- Usher #4: Grace

---

## Algorithm Separation: Why It Matters

### Independence
- **Algorithm 1** creates Mass schedule structure
- **Algorithm 2** fills in the people

These can run at different times:
- Schedule Masses now, assign ministers later
- Re-run assignment algorithm without recreating Masses
- Manual adjustments to schedule don't affect assignment logic

### Different Concerns

**Algorithm 1 cares about**:
- Calendar dates
- Parish Mass schedule patterns
- Liturgical calendar context
- How many Masses to create

**Algorithm 2 cares about**:
- Who is trained for which roles
- Who is available (blackout dates)
- Workload distribution
- Avoiding double-booking same person

### Future Flexibility

**Algorithm 1 enhancements**:
- Template variations by liturgical season
- Auto-adjust times for Holy Days
- Vigil Mass generation

**Algorithm 2 enhancements**:
- Prefer certain people for special events
- Team scheduling (assign groups together)
- Time-of-day preferences
- Skill level matching

---

## Current Implementation Status

### Algorithm 1: Mass Schedule Generation
**Location**: `src/app/(main)/masses/schedule/steps/step-6-proposed-schedule.tsx`

**Function**: `generateProposedMasses()`

**Status**: ⚠️ Partially Implemented

**What Works**:
- ✅ Creates Masses for selected Mass Times Templates
- ✅ Matches templates to dates by day_of_week
- ✅ Associates liturgical events with Masses on same date
- ✅ Creates role assignments structure

**Known Issues**:
- ❌ **Vigil Masses (DAY_BEFORE) not implemented** - Saturday vigil Masses are not created
- ⚠️ Uses "conflict" terminology when liturgical event present (misleading) - **FIXED in UI, still in code**
- ⚠️ `conflictReason` populated but meaning unclear
- ⚠️ Liturgical event treated as warning rather than metadata

**Critical Missing Feature: Vigil Mass Support**

The database schema supports `day_type` enum with `DAY_BEFORE` value, but the scheduling algorithm doesn't use it. Currently:
- Template items with `day_type: 'DAY_BEFORE'` are ignored
- Saturday vigil Masses must be manually created as separate templates
- Vigil Masses don't automatically inherit liturgical event associations

**Required Fix**:
Update `generateProposedMasses()` to:
1. Loop through template items, not just templates
2. Check each item's `day_type`
3. If `DAY_BEFORE`, create Mass on `current_date - 1 day`
4. If `IS_DAY`, create Mass on `current_date`
5. Both should inherit liturgical event metadata from the target day

### Algorithm 2: Minister Assignment
**Location**: `src/lib/actions/mass-scheduling.ts`

**Functions**:
- `scheduleMasses()` - Main orchestration
- `getAvailableMinisters()` - Find eligible people
- `getSuggestedMinister()` - Preview mode version

**Status**: ✅ Implemented

**Known Issues**:
- Preview only samples 3 Masses (performance limitation)
- No "prefer leaders for special events" logic
- No team scheduling support

---

## Recommended Improvements

### Algorithm 1: Remove "Conflict" Concept
```
Current:
  hasConflict: true/false
  conflictReason: "Overlaps with Christ the King"

Proposed:
  liturgicalContext: {
    eventId: "abc123",
    eventName: "Christ the King",
    eventType: "SOLEMNITY"
  }
```

This makes it clear: liturgical events are **context**, not conflicts.

### Algorithm 2: Add Preview for All Masses
Currently preview only shows 3 sample Masses. Consider:
- Full preview with loading indicator
- Progressive rendering (show results as they come in)
- Cache results for faster re-preview

### Separate UI Steps
Consider breaking the wizard into clearer steps:

**Current**:
1. Date Range
2. Mass Times Templates
3. Role Templates
4. Liturgical Events
5. Review
6. Proposed Schedule (mixed: schedule + assignment preview)
7. Assignment Summary
8. Confirmation
9. Results

**Proposed**:
1. Date Range
2. Mass Times Templates
3. Liturgical Events (optional context)
4. Review Schedule
5. **Generate Masses** (Algorithm 1 completes here)
6. Select Role Template
7. Configure Assignment Options
8. Preview Assignments
9. **Generate Assignments** (Algorithm 2 completes here)
10. Results

This makes it clearer which algorithm is running at which stage.

---

## Related Documentation

- [MASSES.md](./MASSES.md) - Mass module overview
- [MASS_ASSIGNMENT_LOGIC.md](./MASS_ASSIGNMENT_LOGIC.md) - Detailed assignment algorithm
- [LITURGICAL_CALENDAR.md](./LITURGICAL_CALENDAR.md) - Liturgical calendar integration
- [MASS_SCHEDULING_CONFLICTS.md](./MASS_SCHEDULING_CONFLICTS.md) - Current "conflict" system (to be deprecated)
