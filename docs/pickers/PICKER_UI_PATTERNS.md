# Picker UI/UX Patterns

> **Purpose:** Visual design and layout patterns for picker components.
>
> **Related Documentation:**
> - **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Core architecture and components
> - **[PICKER_PATTERNS.md](../PICKER_PATTERNS.md)** - Critical behavioral rules
> - **[USAGE_PATTERNS.md](./USAGE_PATTERNS.md)** - Code usage patterns and examples

---

## Table of Contents

- [Overview](#overview)
- [Inline "New Entity" Button](#inline-new-entity-button)

---

## Overview

This document defines UI/UX patterns for picker components, including layout, visual design, and user interaction patterns. These patterns ensure consistency across all pickers and provide a cohesive user experience.

---

## Inline "New Entity" Button

**🔴 CRITICAL:** All pickers that support inline creation (`enableCreate={true}`) must display the "New [Entity]" button inline to the right of the picker input field, NOT below it.

### Design Specification

**Layout:**
```
[Picker Input Field                              ] [New Person]
```

**Requirements:**
1. **Button Position:** Inline to the right of the picker input
2. **Button Text:** "New [Entity]" (shortened from "Add New [Entity]")
   - Examples: "New Person", "New Event", "New Location", "New Reading", "New Mass", "New Group"
3. **Button Style:** Primary button for maximum visibility and discoverability
4. **Responsive Behavior:** Keep inline at all screen sizes (minimum supported width: 320px)
5. **Spacing:** Small gap between input and button using flexbox

### Implementation Pattern

**Flexbox Layout:**
```tsx
<div className="flex gap-2 items-start">
  {/* Picker input takes available space */}
  <div className="flex-1">
    <PickerField ... />
  </div>

  {/* Button stays compact */}
  <Button
    variant="default"
    onClick={() => setShowPicker(true)}
    className="flex-shrink-0"
  >
    New Person
  </Button>
</div>
```

**Key CSS Properties:**
- Parent container: `flex gap-2 items-start`
- Picker wrapper: `flex-1` (takes available space)
- Button: `flex-shrink-0` (maintains size, doesn't compress)

### Rationale

**Why Inline?**
1. **Logical Relationship** - The search input and "New" button are logically related to one another. The search helps you find existing entities, and the "New" button lets you create one if it doesn't exist. Placing them side-by-side makes this relationship explicit and obvious.
2. **Space Efficiency** - Reduces vertical space, keeps the modal compact
3. **Visual Association** - Clear spatial relationship reinforces the functional relationship
4. **Discoverability** - "New" button is immediately visible next to the search field
5. **Modern UX** - Common pattern in contemporary web applications
6. **Consistency** - Same layout pattern across all pickers

**Why Primary Button?**
- Maximum visibility for the create action
- Parish staff (often non-tech-savvy) need clear, obvious affordances
- Primary button signals "this is an important, common action"

**Why "New [Entity]" instead of icon-only?**
- Text is clearer than icons for less tech-savvy users
- "New Person" is immediately understandable, "+" icon requires interpretation
- Accessibility: Screen readers announce the full action

### Applicable Pickers

This pattern applies to ALL pickers with `enableCreate={true}`:

| Picker | Button Text | Field Wrapper Component |
|--------|-------------|-------------------------|
| PeoplePicker | "New Person" | `PersonPickerField` |
| EventPicker | "New Event" | `EventPickerField` |
| LocationPicker | "New Location" | `LocationPickerField` |
| ReadingPickerModal | "New Reading" | Direct usage |
| MassPicker | "New Mass" | `MassPickerField` |
| GroupPicker | "New Group" | `GroupPickerField` |

**Note:** Pickers without inline creation (like LiturgicalCalendarEventPicker) do not have this button.

### Mobile/Narrow Screen Behavior

**Screen Width:** Minimum supported is 320px

**Behavior:**
- Keep inline layout at all screen sizes
- Input field compresses naturally (`flex: 1`)
- Button maintains its size (`flex-shrink: 0`)
- Button text "New [Entity]" should fit on all modern mobile screens

**Example responsive behavior:**
```
Desktop (1024px+):
[Person Picker Input Field                              ] [New Person]

Tablet (768px):
[Person Picker Input Field                ] [New Person]

Mobile (375px):
[Person Picker Input        ] [New Person]

Minimum (320px):
[Person Picker Input  ] [New Person]
```

### Testing Checklist

When implementing this pattern, verify:
- ✅ Button appears inline to the right of input
- ✅ Button text is "New [Entity]" (not "Add New [Entity]")
- ✅ Button uses primary variant
- ✅ Layout stays inline on mobile (test at 320px width)
- ✅ Input field takes available space, button doesn't compress
- ✅ Visual alignment is clean (use `items-start` for proper alignment)

### Code Example: Complete Implementation

**PersonPickerField with Inline Button:**
```tsx
import { PersonPickerField } from '@/components/person-picker-field'
import { Button } from '@/components/ui/button'

export function MyForm() {
  const [showPersonPicker, setShowPersonPicker] = useState(false)

  return (
    <form>
      {/* Inline "New Person" Button Pattern */}
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <PersonPickerField
            name="person_id"
            label="Person"
            required
            showPicker={showPersonPicker}
            onShowPickerChange={setShowPersonPicker}
          />
        </div>
        <Button
          type="button"
          variant="default"
          onClick={() => setShowPersonPicker(true)}
          className="flex-shrink-0 mt-8" // mt-8 aligns with input field (accounts for label height)
        >
          New Person
        </Button>
      </div>
    </form>
  )
}
```

**Note:** The `mt-8` class on the button accounts for the label height above the input field, ensuring the button aligns with the input itself, not the label.

---

## Future UI Patterns

Additional UI/UX patterns will be documented here as they are established:
- Icon selection guidelines
- Color usage in pickers
- Spacing and layout standards
- Empty state patterns
- Loading state patterns
