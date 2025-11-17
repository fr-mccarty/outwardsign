# Presentation Module - People Picker Configuration

This document describes all people pickers in the Presentation module and their default open behavior when first created.

## People Picker Behavior

When a people picker is first opened (when no person has been selected yet), it can open in one of two modes:

1. **Create New Person** - Opens directly to the create person form
2. **Search for Person** - Opens to the list view to search for and select an existing person

## Presentation Module People Pickers

### Key Information Section

#### Recipient
- **Label:** Recipient
- **Opens to:** Create New Person
- **Behavior:** When first opened (no recipient selected), opens directly to create a new person form
- **Code:** `openToNewPerson={!child.value}`
- **Special:** `visibleFields={['email', 'phone_number', 'sex', 'note']}` - Shows additional fields in the picker
- **Rationale:** Child being presented, new entry

### Other People in the Family Section

#### Family Contact
- **Label:** Family Contact
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!mother.value}`
- **Special:** `visibleFields={['email', 'phone_number', 'note']}` - Shows additional contact fields
- **Rationale:** Parent/family contact, likely new to system

#### Father
- **Label:** Father
- **Opens to:** Create New Person
- **Behavior:** When first opened, opens directly to create a new person form
- **Code:** `openToNewPerson={!father.value}`
- **Special:** `visibleFields={['email', 'phone_number', 'note']}` - Shows additional contact fields
- **Rationale:** Parent, likely new to system

### Key Liturgical Roles Section

#### Presider
- **Label:** Presider
- **Opens to:** Search for Person (List View)
- **Behavior:** Opens to search/list view to find existing presider
- **Special:** `autoSetSex="MALE"` - Automatically sets sex to MALE when creating new person
- **Special:** `visibleFields={['email', 'phone_number', 'note']}` - Shows additional fields
- **Code:** No `openToNewPerson` prop
- **Rationale:** Clergy, recurring minister, already in system

## Summary

### Opens to Create New Person (3 pickers)
- Recipient
- Family Contact
- Father

### Opens to Search for Person (1 picker)
- Presider

## Pattern

**Create New Person:**
- The child/recipient (new entry)
- Parents/family contacts (often new to system)
- Family members

**Search for Person:**
- Clergy (presider)
- Recurring ministers
- People likely already in the system

## Notes

- The Presentation module uses `visibleFields` extensively to show contact information (email, phone_number)
- This is a Latino tradition similar to baptism but for older children
- Presentation (Presentación del Señor) is when parents present their child to the Lord, often at 40 days old or older
