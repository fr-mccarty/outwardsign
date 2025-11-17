# Mass Module - People Picker Configuration

This document describes all people pickers in the Mass module and their default open behavior when first created.

## People Picker Behavior

When a people picker is first opened (when no person has been selected yet), it can open in one of two modes:

1. **Create New Person** - Opens directly to the create person form
2. **Search for Person** - Opens to the list view to search for and select an existing person

## Mass Module People Pickers

### Ministers Section

#### Presider
- **Label:** Presider
- **Opens to:** Search for Person (List View)
- **Behavior:** Opens to search/list view to find existing presider
- **Special:** `autoSetSex="MALE"` - Automatically sets sex to MALE when creating new person
- **Description:** "Priest or deacon presiding at this Mass"
- **Code:** No `openToNewPerson` prop
- **Rationale:** Clergy, recurring minister, already in system

#### Homilist
- **Label:** Homilist
- **Opens to:** Search for Person (List View)
- **Behavior:** Opens to search/list view to find existing homilist
- **Special:** `autoSetSex="MALE"` - Automatically sets sex to MALE when creating new person
- **Description:** "Person giving the homily (if different from presider)"
- **Code:** No `openToNewPerson` prop
- **Rationale:** Clergy, recurring minister, already in system

## Summary

### Opens to Create New Person (0 pickers)
- None

### Opens to Search for Person (2 pickers)
- Presider
- Homilist

## Mass Role Assignments

The Mass module uses a different approach for most liturgical roles through the **Mass Role Assignments** system:

- Instead of individual people pickers for each role (lectors, altar servers, etc.), the Mass module uses **Mass Role Templates**
- Users select a template (e.g., "Sunday Mass", "Weekday Mass") which defines the roles needed
- Then users assign people to those roles through a **PeoplePicker** modal
- This is managed through the `mass_roles` table and `mass_role_templates` system

### How Mass Role Assignments Work:
1. Select a Mass Role Template (defines which roles are needed)
2. For each role in the template, click "Assign Person"
3. Opens a `PeoplePicker` modal to **search for and select a person** (always opens to list view)
4. Multiple people can be assigned to the same role if the template specifies a count > 1

### Mass Role Assignment Picker Behavior:
- **Opens to:** Search for Person (List View)
- **Behavior:** When assigning people to mass roles, the picker always opens to search/list view
- **Rationale:** Mass roles (altar servers, lectors, EMHCs, ushers, etc.) are recurring ministers who are already in the system

This approach provides more flexibility for regular Masses where:
- Roles can vary significantly (weekday vs Sunday, feast days, etc.)
- Multiple people may fill the same role (multiple altar servers, lectors, etc.)
- Templates can be reused across many Masses

## Pattern

**Search for Person (All Pickers):**
- Regular Masses use existing clergy and ministers from the parish
- Presider and homilist are almost always parish priests or visiting clergy already in the system
- All other roles are assigned through the Mass Role Assignment system (also searches first)
- Mass is the most frequently celebrated sacrament, so efficiency in selecting existing people is critical
- Recurring ministers serve regularly and are already in the database

## Notes

- The Mass module is unique in using the Mass Role Template system instead of individual people pickers for most roles
- This reflects the recurring nature of Mass celebrations where the same ministers serve regularly
- For one-time liturgical celebrations (weddings, funerals, etc.), individual people pickers make more sense
- All people pickers in the Mass module (both direct pickers and the role assignment picker) open to search/list view
