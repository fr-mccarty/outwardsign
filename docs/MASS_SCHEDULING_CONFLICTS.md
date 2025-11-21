# Mass Scheduling Conflicts

## Overview

When scheduling Masses, the system detects potential conflicts between regularly scheduled Masses and liturgical events (Holy Days, Solemnities, Feasts, etc.). This document explains how conflict detection works and what actions are taken.

## Conflict Detection Algorithm

### Step 1: Generate Proposed Masses

The system first generates all proposed Masses based on:
- **Date Range**: Start and end dates selected by user
- **Mass Times Templates**: Which days of the week and times to schedule (e.g., "Sunday 9:00 AM", "Saturday 5:00 PM Vigil")
- **Selected Template IDs**: Which Mass role templates to use for role assignments

For each day in the range, the system checks if any Mass Times Templates match that day of the week, and creates a proposed Mass for each match.

### Step 2: Check for Liturgical Event Overlaps

For each proposed Mass, the system checks if a liturgical event was selected for that date in Step 4.

**Selection in Step 4**:
- User reviews all liturgical events in the date range (fetched from Global Liturgical Calendar)
- User selects which events they want to track (e.g., Holy Days, Solemnities)
- Only SELECTED events are considered for conflict detection

**Conflict Logic**:
```
IF proposed_mass.date == selected_liturgical_event.date THEN
  conflict = true
  liturgicalEventName = selected_liturgical_event.name
  hasConflict = true
END IF
```

### Step 3: Mark Conflicts

When a conflict is detected:
- `hasConflict` = `true`
- `liturgicalEventName` = name of the liturgical event (e.g., "Christ the King", "Immaculate Conception")
- `conflictReason` = Optional additional explanation (currently not populated, reserved for future use)

## What is a Conflict?

A **conflict** means:
- A regularly scheduled Mass (from Mass Times Template) falls on the same date as a selected liturgical event
- This is flagged because liturgical events often have special requirements:
  - Different Mass times
  - Different readings
  - Special liturgical elements
  - Different role assignments

## What Happens to Conflicting Masses?

**Important**: Conflicting Masses are **NOT automatically excluded or cancelled**.

- The Mass is **still included** in the proposed schedule
- The Mass will be **created in the database** when the wizard completes
- The conflict is **flagged for review** so the parish can verify it matches their schedule

### Why Not Auto-Exclude?

Liturgical events don't necessarily mean Masses should be cancelled:
- Some parishes have MORE Masses on Holy Days (e.g., extra evening Mass)
- Vigil Masses the day before remain valid
- Regular Sunday schedule may continue alongside special celebrations

## Example Scenarios

### Scenario 1: Christ the King Sunday
```
Regular Schedule: Sunday 9:00 AM, Sunday 11:00 AM
Liturgical Event: Christ the King (Solemnity) - Sunday, November 23, 2025
Selected: Yes

Result:
✓ Sunday 9:00 AM Mass - CONFLICT (Christ the King)
✓ Sunday 11:00 AM Mass - CONFLICT (Christ the King)

Both Masses are created and flagged for review.
Parish can verify these times are correct for this Solemnity.
```

### Scenario 2: Immaculate Conception (Holy Day)
```
Regular Schedule: Tuesday 6:00 PM (if Tuesday falls on Dec 8)
Liturgical Event: Immaculate Conception - Monday, December 8, 2025
Selected: Yes

Result:
✓ No Tuesday Mass (event is on Monday)
✓ Parish may need to add special Holy Day Mass time manually

No automatic conflict since regular schedule is Tuesday, not Monday.
```

### Scenario 3: All Saints Day (Not Selected)
```
Regular Schedule: Thursday 7:00 AM
Liturgical Event: All Saints Day - Thursday, November 1, 2025
Selected: No (user did not select in Step 4)

Result:
✓ Thursday 7:00 AM Mass - NO CONFLICT

Mass is created normally because event was not selected for tracking.
```

## Conflict Reasons (Future Enhancement)

The `conflictReason` field is reserved for future enhancements:
- "Multiple Masses on Holy Day" - if template creates 3+ Masses on a holy day
- "Vigil Mass conflict" - if vigil Mass on day before conflicts with event vigil
- "Unusual Mass time" - if Mass time doesn't match parish's typical holy day schedule

**Current Status**: `conflictReason` is not populated. Conflicts only show the liturgical event name.

## User Actions

### Review Conflicts (Step 6)
1. Click on "Overlap with Events" card to see all conflicts
2. Review each conflicting Mass:
   - Check if the Mass time is correct for this event
   - Verify it matches parish schedule
   - Exclude individual Masses if needed (click on calendar item)

### After Mass Creation
- Conflicting Masses are created with their liturgical event association
- Parish can edit individual Masses to adjust times/roles
- Parish can delete Masses that shouldn't exist
- Parish can add additional Masses for the event if needed

## Technical Implementation

### Data Structure
```typescript
interface ProposedMass {
  id: string
  date: string
  templateId: string
  templateName: string
  dayOfWeek: string
  isIncluded: boolean
  hasConflict: boolean              // TRUE if conflict detected
  conflictReason?: string           // Optional explanation (not currently used)
  liturgicalEventId?: string        // ID of conflicting event
  liturgicalEventName?: string      // Name of conflicting event (e.g., "Christ the King")
  assignments?: RoleAssignment[]
}
```

### Conflict Detection Code
Location: `src/app/(main)/masses/schedule/schedule-masses-client.tsx`

Function: `generateProposedMasses()`

```typescript
// For each date in range
liturgicalEventsData.forEach(event => {
  if (event.date === massDate) {
    hasConflict = true
    liturgicalEventId = event.id
    liturgicalEventName = event.name
  }
})
```

## Future Enhancements

### Smart Conflict Resolution
- Auto-suggest adjusted Mass times for Holy Days
- Warn if creating 4+ Masses on a single day
- Suggest vigil Mass times for Holy Day eves

### Enhanced Conflict Types
- **Time Conflicts**: Mass time doesn't match typical holy day schedule
- **Count Conflicts**: Too many/too few Masses for event type
- **Reading Conflicts**: Template readings don't match event's proper readings

### Conflict Severity Levels
- **Warning** (Yellow): Review recommended, but likely correct
- **Error** (Red): Likely incorrect, manual review required
- **Info** (Blue): FYI only, no action needed

## Related Documentation

- [MASSES.md](./MASSES.md) - Mass module overview
- [LITURGICAL_CALENDAR.md](./LITURGICAL_CALENDAR.md) - Liturgical calendar integration
- [MASS_ASSIGNMENT_LOGIC.md](./MASS_ASSIGNMENT_LOGIC.md) - Role assignment algorithm
