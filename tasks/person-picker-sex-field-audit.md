# Person Picker Sex Field Audit

This document lists all instances of `PersonPickerField` in the codebase and indicates whether the `sex` field should be shown.

**How to use:** Mark `[x]` for instances where you want the `sex` field to be visible in the picker, or `[ ]` to hide it.

**Legend:**
- `[x]` = Sex field IS shown
- `[ ]` = Sex field is NOT shown

---

## Wedding Form (`src/app/(main)/weddings/wedding-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting                                  |
|-------------|---------|------------------------------------------------------------------|
| Bride | []      | (uses default - has sex autoSetSex="FEMALE")                     |
| Groom | []      | (uses default - has sex autoSetSex="MALE")                                        |
| Presider | [ ]     | `['email', 'phone_number', 'note']` (no sex - autoSetSex="MALE") |
| Homilist | [ ]     | `['email', 'phone_number', 'note']` (no sex - autoSetSex="MALE") |
| Lead Musician | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |
| Cantor | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |
| Witness 1 | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |
| Witness 2 | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |
| First Reader | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |
| Psalm Reader | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |
| Second Reader | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |
| Gospel Reader | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |
| Petition Reader | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |
| Coordinator | [ ]     | `['email', 'phone_number', 'sex', 'note']`                       |

---

## Quinceañera Form (`src/app/(main)/quinceaneras/quinceanera-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting                                 |
|-------------|-----------|-----------------------------------------------------------------|
| Quinceañera | [ ] | (uses default - has sex autoSetSex="FEMALE")                    |
| Family Contact | [ ] |                                         |
| Presider | [ ] | `['email', 'phone_number', 'note']` (no sex - autoSetSex="MALE") |
| Homilist | [ ] | `['email', 'phone_number', 'note']` (no sex - autoSetSex="MALE") |
| Lead Musician | [ ] | `['email', 'phone_number', 'sex', 'note']`                      |
| Cantor | [ ] | `['email', 'phone_number', 'sex', 'note']`                      |
| First Reader | [ ] | `['email', 'phone_number', 'sex', 'note']`                      |
| Psalm Reader | [ ] | `['email', 'phone_number', 'sex', 'note']`                      |
| Second Reader | [ ] | `['email', 'phone_number', 'sex', 'note']`                      |
| Gospel Reader | [ ] | (needs update)                                                  |
| Petition Reader | [ ] | (needs update)                                                  |
| Coordinator | [ ] | (needs update)                                                  |

---

## Baptism Form (`src/app/(main)/baptisms/baptism-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting              |
|-------------|-----------|----------------------------------------------|
| Child | [x]       | (uses default - has sex)                     |
| Mother | [ ]       | (uses default - has sex) autoSetSex="FEMALE" |
| Father | [ ]       | (uses default - has sex) autoSetSex="MALE"                    |
| Godparent 1 | [ ]       | (uses default - has sex)                     |
| Godparent 2 | [ ]       | (uses default - has sex)                     |
| Presider | [ ]       | (uses default - has sex, autoSetSex="MALE")  |

---

## Funeral Form (`src/app/(main)/funerals/funeral-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting            |
|-------------|-----------|--------------------------------------------|
| Deceased | [x]       | (uses default - has sex)                   |
| Family Contact | [ ]       | (uses default - has sex)                   |
| Presider | [ ]       | (uses default - has sex, autoSetSex="MALE") |
| Homilist | [ ]       | (uses default - has sex, autoSetSex="MALE") |
| Lead Musician | [ ]       | (uses default - has sex)                   |
| Cantor | [ ]       | (uses default - has sex)                   |
| First Reader | [ ]       | (uses default - has sex)                   |
| Psalm Reader | [ ]       | (uses default - has sex)                   |
| Second Reader | [ ]       | (uses default - has sex)                   |
| Gospel Reader | [ ]       | (uses default - has sex)                   |
| Petition Reader | [ ]       | (uses default - has sex)                   |
| Coordinator | [ ]       | (uses default - has sex)                   |

---

## Mass Intentions Form (`src/app/(main)/mass-intentions/mass-intention-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting |
|-------------|-----------|--------------------------------|
| Requested By | [ ] | (uses default - has sex) |

---

## Presentation Form (`src/app/(main)/presentations/presentation-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting |
|-------------|-----------|--------------------------------|
| Recipient (Child) | [x]       | `['email', 'phone_number', 'sex', 'note']` |
| Family Contact | [ ]       | `['email', 'phone_number', 'note']` (no sex) |
| Father | [ ]       | `['email', 'phone_number', 'note']` (no sex) |
|             |           |                                 
***Need a spot for Mother

| Presider | [ ]       | `['email', 'phone_number', 'note']` (no sex, autoSetSex="MALE") |

---

## Mass Form (`src/app/(main)/masses/mass-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting |
|-------------|-----------|--------------------------------|
| Presider | [ ] | `['email', 'phone_number', 'note']` (no sex - autoSetSex="MALE") |
| Homilist | [ ] | `['email', 'phone_number', 'note']` (no sex - autoSetSex="MALE") |

---

## Mass Times Template Form (`src/app/(main)/mass-times-templates/mass-time-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting |
|-------------|-----------|--------------------------------|
| Presider (Add Dialog) | [ ] | (uses default - has sex, autoSetSex="MALE") |
| Homilist (Add Dialog) | [ ] | (uses default - has sex, autoSetSex="MALE") |
| Presider (Edit Dialog) | [ ] | (uses default - has sex, autoSetSex="MALE") |
| Homilist (Edit Dialog) | [ ] | (uses default - has sex, autoSetSex="MALE") |

---

## Events Form (`src/app/(main)/events/event-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting |
|-------------|-----------|--------------------------------|
| Responsible Party | [ ] | (uses default - has sex) |

---

## Group Form (`src/app/(main)/groups/group-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting |
|-------------|-----------|--------------------------------|
| Person (Add Member Dialog) | [ ] | (uses default - has sex) |

---

## Mass Role Form (`src/app/(main)/mass-roles/mass-role-form.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting |
|-------------|-----------|--------------------------------|
| Person (Add Member Dialog) | [ ] | (uses default - has sex) |

---

## Mass Role Members Actions (`src/app/(main)/mass-role-members/mass-role-members-actions.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting |
|-------------|-----------|--------------------------------|
| Person | [ ] | (uses default - has sex) |

---

## Add Membership Modal (`src/components/groups/add-membership-modal.tsx`)

| Field Label | Show Sex? | Current `visibleFields` Setting |
|-------------|-----------|--------------------------------|
| Person | [ ] | (uses default - has sex) |

---

## Notes

- Fields with `autoSetSex="MALE"` automatically set the sex field when creating a new person, so showing the sex selector may be redundant
- The default `visibleFields` includes: `['email', 'phone_number', 'sex', 'note', 'first_name_pronunciation', 'last_name_pronunciation']`
- Mark `[x]` for any field where you want users to be able to select/view the sex field in the picker
