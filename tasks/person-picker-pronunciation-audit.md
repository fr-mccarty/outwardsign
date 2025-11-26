# Person Picker Pronunciation Audit

This document lists all instances of `PersonPickerField` in the codebase and indicates whether pronunciation fields are shown.

**How pronunciation works:**
- Pronunciation fields (`first_name_pronunciation`, `last_name_pronunciation`) are shown if `visibleFields` includes them
- **Default behavior:** If no `visibleFields` prop is provided, the default includes pronunciation fields
- If a custom `visibleFields` array is provided but does NOT include pronunciation, they are NOT shown

**Legend:**
- `[x]` = Pronunciation fields ARE shown (default or explicitly included)
- `[ ]` = Pronunciation fields are NOT shown (custom `visibleFields` without pronunciation)

---

## Wedding Form (`src/app/(main)/weddings/wedding-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|---------|-------|
| 289 | Bride | [x] | No `visibleFields` (uses default) | AUTOSET to FEMALE
| 298 | Groom | [x] | No `visibleFields` (uses default) | AUTOSET to MALE
| 375 | Presider | [] | No `visibleFields`, has `autoSetSex="MALE"` |
| 384 | Homilist | [] | No `visibleFields`, has `autoSetSex="MALE"` |
| 406 | Lead Musician | [] | No `visibleFields` |
| 414 | Cantor | [] | No `visibleFields` |
| 431 | Witness 1 | [] | No `visibleFields` |
| 440 | Witness 2 | [] | No `visibleFields` |
| 470 | First Reader | [] | No `visibleFields` |
| 497 | Psalm Reader | [] | No `visibleFields`, conditionally rendered |
| 538 | Second Reader | [] | No `visibleFields` |
| 564 | Gospel Reader | [] | No `visibleFields` |
| 595 | Petition Reader | [] | No `visibleFields`, conditionally rendered |
| 637 | Coordinator | [] | No `visibleFields` |

---

## Quinceañera Form (`src/app/(main)/quinceaneras/quinceanera-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|------------|-------|
| 271 | Quinceañera | [x]        | No `visibleFields` | AUTOSET to FEMALE
| 321 | Family Contact | []         | No `visibleFields` |
| 338 | Presider | []         | No `visibleFields`, has `autoSetSex="MALE"` |
| 347 | Homilist | []         | No `visibleFields`, has `autoSetSex="MALE"` |
| 369 | Lead Musician | []         | No `visibleFields` |
| 378 | Cantor | []         | No `visibleFields` |
| 408 | First Reader | []         | No `visibleFields` |
| 433 | Psalm Reader | []         | No `visibleFields`, conditionally rendered |
| 472 | Second Reader | []         | No `visibleFields` |
| 496 | Gospel Reader | []         | No `visibleFields` |
| 535 | Petition Reader | []         | No `visibleFields`, conditionally rendered |
| 568 | Coordinator | []         | No `visibleFields` |

---

## Baptism Form (`src/app/(main)/baptisms/baptism-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|---------------------|-------|
| 169 | Child | [ ] | (uses default - needs update) |
| 202 | Mother | [ ] | (uses default - needs update) |
| 211 | Father | [ ] | (uses default - needs update) |
| 228 | Godparent 1 | [ ] | (uses default - needs update) |
| 237 | Godparent 2 | [ ] | (uses default - needs update) |
| 254 | Presider | [ ] | (uses default - needs update, autoSetSex="MALE") |

---

## Funeral Form (`src/app/(main)/funerals/funeral-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|---------------------|-------|
| 318 | Deceased | [ ] | (uses default - needs update) |
| 367 | Family Contact | [ ] | (uses default - needs update) |
| 384 | Presider | [ ] | (uses default - needs update, autoSetSex="MALE") |
| 393 | Homilist | [ ] | (uses default - needs update, autoSetSex="MALE") |
| 415 | Lead Musician | [ ] | (uses default - needs update) |
| 424 | Cantor | [ ] | (uses default - needs update) |
| 454 | First Reader | [ ] | (uses default - needs update) |
| 479 | Psalm Reader | [ ] | (uses default - needs update) |
| 518 | Second Reader | [ ] | (uses default - needs update) |
| 542 | Gospel Reader | [ ] | (uses default - needs update) |
| 581 | Petition Reader | [ ] | (uses default - needs update) |
| 615 | Coordinator | [ ] | (uses default - needs update) |

---

## Mass Intentions Form (`src/app/(main)/mass-intentions/mass-intention-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|---------------------|-------|
| 133 | Requested By | [ ] | (uses default - needs update) |

---

## Presentation Form (`src/app/(main)/presentations/presentation-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|---------------------|-------|
| 156 | Recipient (Child) | [ ] | `visibleFields={['email', 'phone_number', 'sex', 'note']}` (already set) |
| 188 | Family Contact | [ ] | `visibleFields={['email', 'phone_number', 'note']}` (already set) |
| 199 | Father | [ ] | `visibleFields={['email', 'phone_number', 'note']}` (already set) |
| 217 | Presider | [ ] | `visibleFields={['email', 'phone_number', 'note']}` (already set, autoSetSex="MALE") |

---

## Mass Form (`src/app/(main)/masses/mass-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|---------------------|-------|
| 425 | Presider | [ ] | `visibleFields={['email', 'phone_number', 'note']}` |
| 436 | Homilist | [ ] | `visibleFields={['email', 'phone_number', 'note']}` |

---

## Mass Times Template Form (`src/app/(main)/mass-times-templates/mass-time-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|-----------------|-------|
| 454 | Presider (Add Dialog) | [] | No `visibleFields`, has `autoSetSex="MALE"` |
| 463 | Homilist (Add Dialog) | [] | No `visibleFields`, has `autoSetSex="MALE"` |
| 540 | Presider (Edit Dialog) | [] | No `visibleFields`, has `autoSetSex="MALE"` |
| 549 | Homilist (Edit Dialog) | [] | No `visibleFields`, has `autoSetSex="MALE"` |

---

## Events Form (`src/app/(main)/events/event-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|--------------------|-------|
| 154 | Responsible Party | [] | No `visibleFields` |

---

## Group Form (`src/app/(main)/groups/group-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|--------------------|-------|
| 286 | Person (Add Member Dialog) | [] | No `visibleFields` |

---

## Mass Role Form (`src/app/(main)/mass-roles/mass-role-form.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|--------------------|-------|
| 416 | Person (Add Member Dialog) | [] | No `visibleFields` |

---

## Mass Role Members Actions (`src/app/(main)/mass-role-members/mass-role-members-actions.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|--------------------|-------|
| 85 | Person | [] | No `visibleFields` |

---

## Add Membership Modal (`src/components/groups/add-membership-modal.tsx`)

| Line | Field Label | Pronunciation Shown | Notes |
|------|-------------|--------------------|-------|
| 122 | Person | [] | No `visibleFields` |

---

## Summary

| Pronunciation Status | Count |
|---------------------|-------|
| **Shown** `[x]` | 32 |
| **Not Shown** `[ ]` | 2 |

**Files with pronunciation NOT shown:**
- `mass-form.tsx` - Presider and Homilist explicitly exclude pronunciation via custom `visibleFields`

---

## Planned Changes

_(Add your planned changes here)_
