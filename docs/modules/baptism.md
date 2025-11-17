# Baptism Module - People Picker Configuration

This document describes all people pickers in the Baptism module and their default open behavior when first created.

## People Picker Behavior

When a people picker is first opened (when no person has been selected yet), it can open in one of two modes:

1. **Create New Person** - Opens directly to the create person form
2. **Search for Person** - Opens to the list view to search for and select an existing person

## Baptism Module People Pickers

### Key Information Section

#### Child
- **Label:** Child
- **Opens to:** Create New Person
- **Behavior:** When first opened (no child selected), opens directly to create a new person form
- **Code:** `openToNewPerson={!child.value}`
- **Rationale:** Child being baptized, new entry

### Other People Section

#### Mother
- **Label:** Mother
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!mother.value}`
- **Rationale:** Parent, likely new to system

#### Father
- **Label:** Father
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!father.value}`
- **Rationale:** Parent, likely new to system

#### Godparent 1
- **Label:** Godparent 1
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!sponsor1.value}`
- **Rationale:** Often family friend, one-time participant

#### Godparent 2
- **Label:** Godparent 2
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!sponsor2.value}`
- **Rationale:** Often family friend, one-time participant

### Key Liturgical Roles Section

#### Presider
- **Label:** Presider
- **Opens to:** Search for Person (List View)
- **Behavior:** Opens to search/list view to find existing presider
- **Special:** `autoSetSex="MALE"` - Automatically sets sex to MALE when creating new person
- **Code:** No `openToNewPerson` prop
- **Rationale:** Clergy, recurring minister, already in system

## Summary

### Opens to Create New Person (5 pickers)
- Child
- Mother
- Father
- Godparent 1
- Godparent 2

### Opens to Search for Person (1 picker)
- Presider

## Pattern

**Create New Person:**
- The child being baptized (new entry)
- Parents (often new to system, first sacrament)
- Godparents (often one-time participants)
- Family members

**Search for Person:**
- Clergy (presider)
- Recurring ministers
- People likely already in the system
