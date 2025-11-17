# Funeral Module - People Picker Configuration

This document describes all people pickers in the Funeral module and their default open behavior when first created.

## People Picker Behavior

When a people picker is first opened (when no person has been selected yet), it can open in one of two modes:

1. **Create New Person** - Opens directly to the create person form
2. **Search for Person** - Opens to the list view to search for and select an existing person

## Funeral Module People Pickers

### Key Information Section

#### Deceased
- **Label:** Deceased
- **Opens to:** Create New Person
- **Behavior:** When first opened (no deceased selected), opens directly to create a new person form
- **Code:** `openToNewPerson={!deceased.value}`
- **Rationale:** Specific to this funeral, new entry

### Other People Section

#### Family Contact
- **Label:** Family Contact
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!familyContact.value}`
- **Rationale:** Often new to system, one-time contact

### Key Liturgical Roles Section

#### Presider
- **Label:** Presider
- **Opens to:** Search for Person (List View)
- **Behavior:** Opens to search/list view to find existing presider
- **Special:** `autoSetSex="MALE"` - Automatically sets sex to MALE when creating new person
- **Code:** No `openToNewPerson` prop
- **Rationale:** Clergy, recurring minister, already in system

#### Homilist
- **Label:** Homilist
- **Opens to:** Search for Person (List View)
- **Behavior:** Opens to search/list view to find existing homilist
- **Special:** `autoSetSex="MALE"` - Automatically sets sex to MALE when creating new person
- **Code:** No `openToNewPerson` prop
- **Rationale:** Clergy, recurring minister, already in system

### Other Liturgical Roles Section

#### Lead Musician
- **Label:** Lead Musician
- **Opens to:** Search for Person (List View)
- **Behavior:** Opens to search/list view to find person
- **Code:** No `openToNewPerson` prop (remove if present)
- **Rationale:** Recurring minister, likely already in system

#### Cantor
- **Label:** Cantor
- **Opens to:** Search for Person (List View)
- **Behavior:** Opens to search/list view to find person
- **Code:** No `openToNewPerson` prop (remove if present)
- **Rationale:** Recurring minister, likely already in system

#### First Reader
- **Label:** First Reader
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!firstReader.value}`
- **Rationale:** Often family member, one-time participant

#### Psalm Reader
- **Label:** Psalm Reader
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!psalmReader.value}`
- **Rationale:** Often family member, one-time participant

#### Second Reader
- **Label:** Second Reader
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!secondReader.value}`
- **Rationale:** Often family member, one-time participant

#### Gospel Reader
- **Label:** Gospel Reader
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!gospelReader.value}`
- **Rationale:** Often family member, one-time participant

#### Petition Reader
- **Label:** Petition Reader
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!petitionReader.value}`
- **Rationale:** Often family member, one-time participant

### Additional Details Section

#### Coordinator
- **Label:** Coordinator
- **Opens to:** Search for Person (List View)
- **Behavior:** Opens to search/list view to find person
- **Code:** No `openToNewPerson` prop (remove if present)
- **Rationale:** Staff member, recurring role, already in system

## Summary

### Opens to Create New Person (7 pickers)
- Deceased
- Family Contact
- First Reader
- Psalm Reader
- Second Reader
- Gospel Reader
- Petition Reader

### Opens to Search for Person (5 pickers)
- Presider
- Homilist
- Lead Musician
- Cantor
- Coordinator

## Pattern

**Create New Person:**
- The deceased (specific to this funeral)
- Family contacts (often one-time)
- Readers (often family members)
- One-time participants

**Search for Person:**
- Clergy (presider, homilist)
- Recurring ministers (musicians, cantor)
- Staff (coordinator)
- People likely already in the system
