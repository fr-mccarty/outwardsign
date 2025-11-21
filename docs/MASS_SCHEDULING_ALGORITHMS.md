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

The algorithm loops through every single day in the selected date range. For each date, it determines what day of the week it is (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday).

**Example**:
- Nov 1, 2025 → Saturday
- Nov 2, 2025 → Sunday
- Nov 3, 2025 → Monday

#### Step 2: Match to Liturgical Calendar Events
```
  liturgical_events = []

  FOR each liturgical_event in global_liturgical_calendar
    IF event.date == current_date THEN
      liturgical_events.add(event)
    END IF
  END FOR
```

The algorithm checks the global liturgical calendar and retrieves all liturgical events that fall on the current date.

**Important Notes**:
- There should be **at least one liturgical event for every day** in the liturgical calendar (even if it's just an ordinary weekday in Ordinary Time)
- **Multiple liturgical events possible** - Some dates may have more than one liturgical event (e.g., a saint's feast day on a Sunday)
- Liturgical events do NOT prevent Mass creation. They only provide context/metadata.

**Example 1 - Special Solemnity**:
- Current date: November 23, 2025 (Sunday)
- Liturgical events: ["Christ the King Sunday"]

**Example 2 - Ordinary Day**:
- Current date: November 4, 2025 (Tuesday)
- Liturgical events: ["Tuesday of the 31st Week in Ordinary Time"]

#### Step 3: Match Mass Times Templates
```
  FOR each selected_mass_times_template
    IF template.day_of_week == day_of_week THEN
      // This template applies to this date
      matched_templates.add(template)
    END IF
  END FOR
```

The algorithm loops through each Mass Times Template selected by the user and checks if that template's `day_of_week` matches the current day.

**If there's a match**, the algorithm looks at all the **items** in that template. Each item represents a Mass time.

**If there's no match** (e.g., current date is Monday and you only selected "Sunday Schedule"), the algorithm skips this date and moves to the next one.

**Example items in "Sunday Schedule"**:
1. Saturday 5:00 PM - `day_type: DAY_BEFORE` (vigil Mass)
2. Sunday 9:00 AM - `day_type: IS_DAY`
3. Sunday 11:00 AM - `day_type: IS_DAY`

#### Step 4: Determine Mass Date Based on Day Type
```
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
```

For each item in the matched template, the algorithm determines **when the Mass should actually occur** based on the item's `day_type`.

**Two possibilities**:

1. **`day_type: IS_DAY`** - Mass occurs on the current date
   - Example: Sunday 9:00 AM on November 2
   - Mass date = November 2 (the current date)

2. **`day_type: DAY_BEFORE`** - Mass occurs the day before (vigil)
   - Example: Saturday 5:00 PM vigil for Sunday
   - Current date being processed = November 2 (Sunday)
   - Mass date = November 1 (the day BEFORE)

#### Step 5: Create Mass Record
```
  IF create_proposed_mass THEN
    mass = {
      date: mass_date,
      time: item.time,
      language: item.language,
      mass_times_template_id: template.id,
      liturgical_events: liturgical_events (from Step 2),
      role_assignments: [] (empty, to be filled by Algorithm 2)
    }

    proposed_masses.add(mass)
  END IF
```

For each Mass time identified in Step 4, the algorithm creates a Mass record object with all the information gathered from the previous steps.

**Important Note**: The `role_assignments` array is empty at this point. This will be populated later by Algorithm 2 (Minister Assignment), which assigns specific people to specific roles.

#### Step 6: User Review & Manual Adjustments
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

### Current UI Steps

The mass scheduling wizard follows these steps:

**Current Implementation**:
1. **Date Range** - Select scheduling period (start date and end date)
2. **Mass Times Templates** - Select which Mass times templates to use
3. **Role Templates** - Select which role template defines needed roles
4. **Liturgical Events** - Select which liturgical events to associate with Masses
5. **Proposed Schedule** - Review and adjust generated Masses (Algorithm 1 output)
6. **Assignment Summary** - Review minister workload distribution (Algorithm 2 preview)
7. **Confirmation** - Final confirmation before creating Masses
8. **Results** - View created Masses and any unassigned roles

**Algorithm Execution**:
- **Algorithm 1 (Mass Schedule Generation)** runs between Steps 4 and 5
  - Input: Date range, Mass times templates, liturgical events
  - Output: Proposed Mass records shown in Step 5
- **Algorithm 2 (Minister Assignment)** runs after Step 7 (on confirmation)
  - Input: Proposed Masses, role template, algorithm options
  - Output: Mass records with role assignments shown in Step 8

**Future Consideration**:
Consider adding explicit "algorithm options" configuration (balance workload, respect blackout dates, etc.) as a separate step before confirmation to make the assignment algorithm configuration more visible to users.

---

## Related Documentation

- [MASSES.md](./MASSES.md) - Mass module overview
- [MASS_ASSIGNMENT_LOGIC.md](./MASS_ASSIGNMENT_LOGIC.md) - Detailed assignment algorithm
- [LITURGICAL_CALENDAR.md](./LITURGICAL_CALENDAR.md) - Liturgical calendar integration
- [MASS_SCHEDULING_CONFLICTS.md](./MASS_SCHEDULING_CONFLICTS.md) - Current "conflict" system (to be deprecated)
