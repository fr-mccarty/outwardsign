# Mass Assignment Logic

This document describes the algorithm and logic used in the Mass Scheduling Wizard for assigning ministers to masses.

## Overview

The Mass Scheduling Wizard allows parish staff to create multiple masses over a date range and assign ministers to liturgical roles. The process involves:

1. Selecting a date range
2. Choosing Mass Times Templates (which days/times to schedule)
3. Selecting Role Templates (which roles need to be filled)
4. Selecting Liturgical Events (celebrations for each day)
5. Reviewing and manually adjusting the proposed schedule
6. Confirming and creating the masses

## Data Structures

### ProposedMass

Each proposed mass contains:

```typescript
interface ProposedMass {
  id: string                    // Unique identifier
  date: string                  // ISO date string (YYYY-MM-DD)
  templateId: string            // Mass Times Template ID
  templateName: string          // Display name from template
  dayOfWeek: string            // SUNDAY, MONDAY, etc.
  isIncluded: boolean          // Whether to create this mass
  hasConflict: boolean         // If there's a scheduling conflict
  conflictReason?: string      // Description of conflict
  liturgicalEventId?: string   // Associated liturgical event
  liturgicalEventName?: string // Display name of event
  assignments?: RoleAssignment[] // Minister assignments
}
```

### RoleAssignment

Each role assignment tracks:

```typescript
interface RoleAssignment {
  roleId: string      // Mass Role ID
  roleName: string    // Display name (Reader, Cantor, etc.)
  personId?: string   // Assigned person ID (empty if unassigned)
  personName?: string // Assigned person name
}
```

## Mass Generation Algorithm

### Step 1: Generate Base Schedule

The `generateProposedMasses()` function creates the initial list of masses:

1. **Iterate through date range**: Loop from start date to end date
2. **Match templates**: For each date, check which selected Mass Times Templates apply based on `day_of_week`
3. **Create mass entries**: For each matching template, create a ProposedMass with:
   - Unique ID (generated)
   - Date from the current iteration
   - Template information
   - Empty assignments array

### Step 2: Apply Liturgical Events

For each generated mass:

1. Look up the liturgical event for that date
2. If found and selected, associate the event with the mass
3. Handle dates with multiple events (user selects which to use)

### Step 3: Initialize Role Assignments

When role templates are selected:

1. Get all roles from the selected templates
2. For each mass, create empty RoleAssignment entries for each role
3. Assignments start with `personId` and `personName` as undefined

## Manual Assignment Process

The Proposed Schedule step (Step 6) provides a calendar view where staff can:

### Assign Ministers

1. Click on an unassigned role slot
2. PeoplePicker opens filtered to people with that role qualification
3. Select a person to assign
4. Assignment updates immediately in state

### View Conflicts

The system detects conflicts:
- **Same person, same time**: A person assigned to multiple masses at the same time
- **Blackout dates**: Person unavailable on specific dates (future feature)

### Toggle Mass Inclusion

Each mass can be toggled on/off:
- Excluded masses won't be created
- Useful for skipping holidays or special circumstances

## Workload Distribution

The Assignment Summary (Step 7) calculates:

### Per-Minister Statistics

```typescript
interface MinisterSummary {
  personId: string
  personName: string
  totalAssignments: number
  roles: Map<string, { roleName: string; count: number }>
  assignments: MinisterAssignment[]
}
```

### Aggregate Statistics

- **Total Ministers**: Count of unique people assigned
- **Total Assignments**: Sum of all role assignments
- **Average per Minister**: Total assignments / Total ministers
- **Unassigned Count**: Roles without a person assigned

### Workload Visualization

Ministers are color-coded by relative workload:
- **Green** (Light): 0-25% of max assignments
- **Blue** (Moderate): 25-50% of max assignments
- **Amber** (Heavy): 50-75% of max assignments
- **Red** (Very Heavy): 75-100% of max assignments

## Future Enhancements

### Auto-Assignment Algorithm

**Status**: ✅ Implemented in `src/lib/actions/mass-scheduling.ts`

The auto-assignment algorithm:

1. **Balance workload**: Distribute assignments evenly across qualified ministers
2. **Respect preferred mass times**: Only assign people to Masses they have indicated they prefer
3. **Respect blackout dates**: Honor minister unavailability
4. **Prevent double-booking**: Same person cannot have multiple roles at the same Mass
5. **Active members only**: Only assign people with active mass role memberships

### Algorithm Implementation

```
For each Mass in chronological order:
  assigned_this_mass = []  // Track who's already assigned to this specific Mass

  For each role in this Mass:
    1. Get list of qualified people for this role (active mass_role_members)
    2. ⚠️ CRITICAL: Filter out people already assigned to this Mass (prevents double-booking)
    3. ⚠️ CRITICAL: Filter by preferred mass times (only assign people to Masses they prefer)
    4. Filter out people with blackout dates on this date
    5. If balance_workload enabled:
       - Sort by fewest total assignments (ascending)
    6. Assign first eligible person
    7. Add person to assigned_this_mass array
```

**Key Constraints**:
1. The `assigned_this_mass` array ensures no person is assigned to multiple roles at the same Mass. For example, someone cannot be both a Lector and Usher at the 9:00 AM Sunday Mass.
2. Each person has a `mass_times_template_item_ids` array that stores which specific Mass times they prefer (e.g., Saturday 5:00 PM, Sunday 10:00 AM). People are only assigned to their preferred Masses. If the array is empty, they can be assigned to any Mass time.

## Database Schema Dependencies

The assignment system relies on:

- `mass_times_templates`: Defines recurring mass schedules
- `mass_role_templates`: Defines which roles exist
- `mass_roles`: Links roles to templates
- `people`: Minister information
- `person_mass_roles`: Links people to roles they can serve (qualifications)
- `liturgical_calendar`: Calendar of liturgical celebrations

## Related Documentation

- [MASSES.md](./MASSES.md) - Mass module documentation
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - PeoplePicker and other components
- [DEFINITIONS.md](./DEFINITIONS.md) - Liturgical terminology
