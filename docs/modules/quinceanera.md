# Quinceañera Module - People Picker Configuration

This document describes all people pickers in the Quinceañera module and their default open behavior when first created.

## People Picker Behavior

When a people picker is first opened (when no person has been selected yet), it can open in one of two modes:

1. **Create New Person** - Opens directly to the create person form
2. **Search for Person** - Opens to the list view to search for and select an existing person

## Quinceañera Module People Pickers

### Key Information Section

#### Quinceañera
- **Label:** Quinceañera
- **Opens to:** Create New Person
- **Behavior:** When first opened (no quinceañera selected), opens directly to create a new person form
- **Code:** `openToNewPerson={!quinceaneraGirl.value}`
- **Rationale:** The girl celebrating her quinceañera, specific to this celebration

### Other People Section

#### Family Contact
- **Label:** Family Contact
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!familyContact.value}`
- **Rationale:** Parent/family contact, often one-time

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
- Quinceañera
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
- The quinceañera herself (specific to this celebration)
- Family contacts (often one-time)
- Readers (often family members or friends)
- One-time participants

**Search for Person:**
- Clergy (presider, homilist)
- Recurring ministers (musicians, cantor)
- Staff (coordinator)
- People likely already in the system

## Notes

- Quinceañera is a significant coming-of-age celebration in Latino culture for girls turning 15
- The celebration includes a Mass of Thanksgiving followed by a reception
