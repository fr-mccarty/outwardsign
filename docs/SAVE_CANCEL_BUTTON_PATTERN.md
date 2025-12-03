# Save/Cancel Button Pattern

**Status:** Current Standard
**Applies To:** All forms, pickers, and dialogs

## Overview

The Save/Cancel button pattern is a critical UX standard that ensures consistency across all forms, pickers, and dialogs in the application. This pattern establishes clear visual hierarchy, consistent button ordering, and predictable user interactions.

**Why This Matters:**
- **Consistency** - Users develop muscle memory for button locations
- **Accessibility** - Tab order flows naturally left-to-right (Cancel → Save)
- **Visual Hierarchy** - Primary action (Save) visually emphasized but not larger
- **Predictability** - Same pattern everywhere reduces cognitive load

---

## Table of Contents

- [Visual Pattern](#visual-pattern)
- [Core Principles](#core-principles)
- [Implementation by Context](#implementation-by-context)
  - [Module Forms](#module-forms)
  - [Picker Modals](#picker-modals)
  - [Custom Dialogs](#custom-dialogs)
- [Component Reference](#component-reference)
  - [SaveButton](#savebutton)
  - [CancelButton](#cancelbutton)
  - [ModuleSaveButton](#modulesavebutton)
  - [ModuleCancelButton](#modulecancelbutton)
  - [FormBottomActions](#formbottomactions)
- [Why This Pattern](#why-this-pattern)
- [Migration Checklist](#migration-checklist)
- [Common Mistakes](#common-mistakes)

---

## Visual Pattern

The correct visual pattern for Save/Cancel buttons:

```
┌──────────────────────────────────────┐
│                                      │
│                       [Cancel] [Save]│
│                                      │
└──────────────────────────────────────┘
```

**Layout Rules:**
1. **Order:** Cancel FIRST (left), Save SECOND (right)
2. **Alignment:** Right-aligned container (`justify-end`)
3. **Sizing:** Both buttons SAME width (no flex-1)
4. **Spacing:** Consistent gap between buttons (gap-2 or gap-4)
5. **Variants:** Cancel = outline, Save = primary (default)

---

## Core Principles

### 1. Button Order

**Rule:** Cancel button ALWAYS comes before Save button (left to right)

**Rationale:**
- Follows Western reading order (left to right)
- Places destructive action (Cancel) farther from natural click target
- Primary action (Save) is in the "power position" (bottom-right)
- Consistent with industry standards (dialogs, modals, forms)

### 2. Equal Sizing

**Rule:** Both buttons should have the SAME width (no flex-1)

**Rationale:**
- Prevents one button from dominating visually
- Creates balanced, professional appearance
- Button content determines width, not container
- Maintains hierarchy through variant, not size

### 3. Visual Hierarchy

**Rule:** Use button variants for hierarchy, NOT sizing

**Rationale:**
- Primary variant (Save) naturally draws attention through color
- Outline variant (Cancel) is visible but less prominent
- Size equality prevents accidental clicks on oversized buttons
- Hierarchy through color is more accessible than through size

### 4. Consistent Spacing

**Rule:** Use consistent gap (gap-2 or gap-4) between buttons

**Rationale:**
- Establishes visual rhythm
- Prevents buttons from looking disconnected
- Maintains touch target separation on mobile
- Matches spacing in rest of application

---

## Implementation by Context

### Module Forms

**Component:** `FormBottomActions`

Module forms (Wedding, Funeral, Baptism, etc.) should ALWAYS use the `FormBottomActions` wrapper component.

**Example (Correct):**
```tsx
// src/app/(main)/weddings/wedding-form.tsx

<FormBottomActions
  isEditing={isEditing}
  isLoading={isSubmitting}
  cancelHref={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
  moduleName="Wedding"
/>
```

**What It Does:**
- Renders `ModuleCancelButton` and `ModuleSaveButton` in correct order
- Applies consistent layout (flex gap-4 justify-end)
- Shows "Save [Module]" or "Update [Module]" based on mode
- Handles navigation for Cancel button
- Manages disabled state during form submission

**Reference Implementation:** See `src/components/form-bottom-actions.tsx`

---

### Picker Modals

**Components:** `SaveButton` + `CancelButton`

Picker modals (CorePicker, PersonPicker, EventPicker) should use the base components directly.

**Example (Correct):**
```tsx
// Picker modal footer
<div className="flex gap-2 justify-end pt-4">
  <CancelButton
    onClick={resetForm}
    disabled={isCreating}
  >
    Cancel
  </CancelButton>
  <SaveButton
    isLoading={isCreating}
    loadingText="Saving..."
    disabled={isCreating}
  >
    {isEditMode ? 'Update Item' : 'Create Item'}
  </SaveButton>
</div>
```

**Key Points:**
- No `flex-1` on SaveButton
- CancelButton uses `onClick` for dialog dismissal
- Order: Cancel FIRST, Save SECOND
- Both buttons equally sized

**Example (Incorrect - Current CorePicker):**
```tsx
// ❌ DON'T DO THIS
<div className="flex gap-2 pt-4">
  <SaveButton
    isLoading={isCreating}
    className="flex-1"  // ❌ Makes Save button huge
  >
    {isEditMode ? updateButtonLabel : createButtonLabel}
  </SaveButton>
  <CancelButton onClick={resetForm}>  {/* ❌ Wrong order */}
    Cancel
  </CancelButton>
</div>
```

**What's Wrong:**
- `flex-1` on SaveButton makes it disproportionately large
- Save button comes before Cancel button (wrong order)
- No `justify-end` for right-alignment

**Reference Location:** `src/components/core-picker.tsx` lines 476-489 (needs fixing)

---

### Custom Dialogs

**Components:** `SaveButton` + `CancelButton`

Custom dialogs (confirmation dialogs, settings dialogs) should use the base components.

**Example (Correct):**
```tsx
// Custom dialog footer
<DialogFooter>
  <div className="flex gap-2 justify-end w-full">
    <CancelButton onClick={onCancel}>
      Cancel
    </CancelButton>
    <SaveButton
      isLoading={isLoading}
      onClick={onSave}
    >
      Confirm
    </SaveButton>
  </div>
</DialogFooter>
```

**Key Points:**
- Wrap in container with `justify-end` for right-alignment
- Use `onClick` handlers (not form submission)
- Both buttons handle their own actions
- Dialog close is typically triggered by CancelButton's onClick

---

## Component Reference

### SaveButton

**Location:** `src/components/save-button.tsx`

**Purpose:** Base save button with loading state and icon support

**Props:**
```typescript
interface SaveButtonProps {
  isLoading?: boolean      // Shows spinner and loading text
  loadingText?: string     // Text during loading (default: "Saving...")
  children?: React.ReactNode  // Button text (default: "Save")
  showIcon?: boolean       // Show save icon (default: true)
  className?: string       // Additional classes
  disabled?: boolean       // Disable button
  // ...extends Button props
}
```

**Usage:**
```tsx
<SaveButton
  isLoading={isLoading}
  loadingText="Creating..."
  disabled={isLoading}
>
  Create Person
</SaveButton>
```

**Features:**
- Automatically adds Save icon (unless `showIcon={false}`)
- Switches to spinner during loading
- Type="submit" by default
- Primary variant (blue)

---

### CancelButton

**Location:** `src/components/cancel-button.tsx`

**Purpose:** Base cancel button for navigation or dialog dismissal

**Props:**
```typescript
interface CancelButtonProps {
  href?: string            // For navigation (form cancel)
  onClick?: () => void     // For dismissal (dialog cancel)
  children?: React.ReactNode  // Button text (default: "Cancel")
  showIcon?: boolean       // Show X icon (default: false)
  className?: string       // Additional classes
  variant?: ButtonVariant  // Default: "outline"
  // ...extends Button props
}
```

**Usage (Navigation):**
```tsx
<CancelButton href="/weddings">
  Cancel
</CancelButton>
```

**Usage (Dialog):**
```tsx
<CancelButton onClick={() => setOpen(false)}>
  Cancel
</CancelButton>
```

**Features:**
- Either `href` OR `onClick` required (mutually exclusive)
- Uses Next.js Link for navigation
- Outline variant by default
- X icon optional (off by default)

---

### ModuleSaveButton

**Location:** `src/components/module-save-button.tsx`

**Purpose:** Specialized save button for module forms with context-aware text

**Props:**
```typescript
interface ModuleSaveButtonProps {
  moduleName: string       // e.g., "Wedding", "Funeral"
  isLoading: boolean       // Required
  isEditing?: boolean      // Changes text: "Save" vs "Update"
  form?: string            // Form ID for external submission
  type?: 'submit' | 'button'  // Default: 'submit'
  onClick?: () => void     // Optional click handler
}
```

**Usage:**
```tsx
<ModuleSaveButton
  moduleName="Wedding"
  isLoading={isLoading}
  isEditing={isEditing}
  form="wedding-form"
/>
```

**Features:**
- Shows "Save [Module]" or "Update [Module]" automatically
- Always shows Save icon
- Can be placed outside form using `form` prop
- Used by FormBottomActions

---

### ModuleCancelButton

**Location:** `src/components/module-cancel-button.tsx`

**Purpose:** Specialized cancel button for module forms with navigation

**Props:**
```typescript
interface ModuleCancelButtonProps {
  href: string             // Required navigation target
  disabled?: boolean       // Optional disabled state
}
```

**Usage:**
```tsx
<ModuleCancelButton
  href={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
  disabled={isLoading}
/>
```

**Features:**
- Always shows "Cancel" (no module name)
- Uses Next.js Link for navigation
- Outline variant
- Used by FormBottomActions

---

### FormBottomActions

**Location:** `src/components/form-bottom-actions.tsx`

**Purpose:** Wrapper component for module form buttons

**Props:**
```typescript
interface FormBottomActionsProps {
  isEditing: boolean       // Create vs Edit mode
  isLoading: boolean       // Form submission state
  cancelHref: string       // Where to navigate on cancel
  moduleName: string       // e.g., "Wedding", "Funeral"
}
```

**Usage:**
```tsx
<FormBottomActions
  isEditing={isEditing}
  isLoading={isLoading}
  cancelHref={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
  moduleName="Wedding"
/>
```

**What It Does:**
```tsx
// Internally renders:
<div className="flex gap-4 justify-end">
  <ModuleCancelButton href={cancelHref} disabled={isLoading} />
  <ModuleSaveButton
    moduleName={moduleName}
    isLoading={isLoading}
    isEditing={isEditing}
  />
</div>
```

**Features:**
- Enforces correct button order
- Applies consistent layout
- Manages disabled state during submission
- Shows context-aware button text
- **Always use this for module forms**

---

## Why This Pattern

### UX Benefits

1. **Predictability**
   - Same pattern across all forms/dialogs
   - Users know where to find actions
   - Reduces decision fatigue

2. **Accessibility**
   - Keyboard navigation flows naturally (Tab: Cancel → Save)
   - Screen readers encounter cancel first (safer default)
   - Equal sizing prevents accidental clicks
   - Proper focus management

3. **Mobile-Friendly**
   - Equal button sizes work well on touch screens
   - Right-alignment keeps primary action near thumb zone
   - Sufficient spacing prevents tap errors
   - Responsive layout maintains order on small screens

4. **Visual Hierarchy**
   - Color contrast (outline vs primary) establishes importance
   - Position (right-most) emphasizes primary action
   - Equal sizing prevents overwhelming user
   - Balanced layout feels professional

### Technical Benefits

1. **Maintainability**
   - Single source of truth (FormBottomActions)
   - Component reuse prevents drift
   - Easy to update globally
   - Enforces standards automatically

2. **Consistency**
   - Same props interface across contexts
   - Predictable behavior
   - Less code duplication
   - Fewer bugs

3. **Testability**
   - Consistent selectors (getByRole, getByText)
   - Predictable test patterns
   - Easy to verify button order
   - Clear loading state testing

---

## Migration Checklist

Use this checklist when updating existing code to follow the Save/Cancel button pattern:

### For Module Forms

- [ ] Replace custom button markup with `FormBottomActions`
- [ ] Remove `flex-1` from any save buttons
- [ ] Verify button order (Cancel → Save)
- [ ] Pass correct `isEditing`, `isLoading`, `cancelHref`, `moduleName` props
- [ ] Test both create and edit modes
- [ ] Verify cancel navigation works correctly
- [ ] Check disabled state during submission

**Example Migration:**
```tsx
// ❌ Before
<div className="flex gap-2">
  <Button type="submit" disabled={isLoading} className="flex-1">
    {isLoading ? 'Saving...' : isEditing ? 'Update Wedding' : 'Save Wedding'}
  </Button>
  <Button variant="outline" asChild>
    <Link href="/weddings">Cancel</Link>
  </Button>
</div>

// ✅ After
<FormBottomActions
  isEditing={isEditing}
  isLoading={isLoading}
  cancelHref={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
  moduleName="Wedding"
/>
```

---

### For Picker Modals

- [ ] Replace custom button markup with `SaveButton` + `CancelButton`
- [ ] Remove `flex-1` from SaveButton
- [ ] Verify button order (Cancel → Save)
- [ ] Add `justify-end` to container
- [ ] Add consistent gap (gap-2 or gap-4)
- [ ] CancelButton uses `onClick` (not href)
- [ ] SaveButton shows appropriate text
- [ ] Test loading states
- [ ] Verify dialog dismissal works

**Example Migration:**
```tsx
// ❌ Before (CorePicker current state)
<div className="flex gap-2 pt-4">
  <SaveButton
    isLoading={isCreating}
    className="flex-1"  // ❌ Remove this
  >
    {isEditMode ? updateButtonLabel : createButtonLabel}
  </SaveButton>
  <CancelButton onClick={resetForm}>  {/* ❌ Wrong order */}
    Cancel
  </CancelButton>
</div>

// ✅ After
<div className="flex gap-2 justify-end pt-4">
  <CancelButton
    onClick={resetForm}
    disabled={isCreating}
  >
    Cancel
  </CancelButton>
  <SaveButton
    isLoading={isCreating}
    loadingText="Saving..."
    disabled={isCreating}
  >
    {isEditMode ? updateButtonLabel : createButtonLabel}
  </SaveButton>
</div>
```

---

### For Custom Dialogs

- [ ] Replace custom buttons with `SaveButton` + `CancelButton`
- [ ] Verify button order (Cancel → Save)
- [ ] Wrap in container with `justify-end`
- [ ] Add consistent gap (gap-2 or gap-4)
- [ ] Both buttons use `onClick` handlers
- [ ] SaveButton shows appropriate text
- [ ] CancelButton dismisses dialog
- [ ] Test loading states
- [ ] Verify keyboard navigation

**Example Migration:**
```tsx
// ❌ Before
<DialogFooter>
  <Button onClick={onConfirm} disabled={isLoading}>
    {isLoading ? 'Confirming...' : 'Confirm'}
  </Button>
  <Button variant="outline" onClick={onCancel}>
    Cancel
  </Button>
</DialogFooter>

// ✅ After
<DialogFooter>
  <div className="flex gap-2 justify-end w-full">
    <CancelButton onClick={onCancel}>
      Cancel
    </CancelButton>
    <SaveButton
      isLoading={isLoading}
      loadingText="Confirming..."
      onClick={onConfirm}
    >
      Confirm
    </SaveButton>
  </div>
</DialogFooter>
```

---

## Common Mistakes

### ❌ Mistake 1: Wrong Button Order

```tsx
// ❌ DON'T: Save before Cancel
<div className="flex gap-2">
  <SaveButton>Save</SaveButton>
  <CancelButton href="/back">Cancel</CancelButton>
</div>
```

**Why It's Wrong:**
- Breaks user expectations
- Primary action in wrong position
- Inconsistent with rest of app
- Tab order is backwards

**Fix:**
```tsx
// ✅ DO: Cancel before Save
<div className="flex gap-2 justify-end">
  <CancelButton href="/back">Cancel</CancelButton>
  <SaveButton>Save</SaveButton>
</div>
```

---

### ❌ Mistake 2: Using flex-1 on Save Button

```tsx
// ❌ DON'T: Make Save button huge
<div className="flex gap-2">
  <CancelButton href="/back">Cancel</CancelButton>
  <SaveButton className="flex-1">Save</SaveButton>
</div>
```

**Why It's Wrong:**
- Creates visual imbalance
- Dominates the interface
- Looks unprofessional
- Increases accidental clicks

**Fix:**
```tsx
// ✅ DO: Equal sizing with right-alignment
<div className="flex gap-2 justify-end">
  <CancelButton href="/back">Cancel</CancelButton>
  <SaveButton>Save</SaveButton>
</div>
```

---

### ❌ Mistake 3: Custom Buttons Instead of Components

```tsx
// ❌ DON'T: Create custom buttons
<div className="flex gap-2">
  <Button variant="outline" onClick={onCancel}>
    Cancel
  </Button>
  <Button type="submit" disabled={isLoading}>
    {isLoading ? <Loader2 /> : <Save />}
    {isLoading ? 'Saving...' : 'Save'}
  </Button>
</div>
```

**Why It's Wrong:**
- Duplicates logic
- Inconsistent styling
- Hard to maintain
- Missing features (icons, loading text)

**Fix:**
```tsx
// ✅ DO: Use provided components
<div className="flex gap-2 justify-end">
  <CancelButton onClick={onCancel}>Cancel</CancelButton>
  <SaveButton isLoading={isLoading}>Save</SaveButton>
</div>
```

---

### ❌ Mistake 4: Missing justify-end

```tsx
// ❌ DON'T: Forget right-alignment
<div className="flex gap-2">
  <CancelButton href="/back">Cancel</CancelButton>
  <SaveButton>Save</SaveButton>
</div>
```

**Why It's Wrong:**
- Buttons stuck on left side
- Doesn't match form layout
- Inconsistent with other forms
- Primary action not in power position

**Fix:**
```tsx
// ✅ DO: Right-align button group
<div className="flex gap-2 justify-end">
  <CancelButton href="/back">Cancel</CancelButton>
  <SaveButton>Save</SaveButton>
</div>
```

---

### ❌ Mistake 5: Not Using FormBottomActions for Module Forms

```tsx
// ❌ DON'T: Manual implementation in module forms
<div className="flex gap-2 justify-end">
  <CancelButton href={cancelHref}>Cancel</CancelButton>
  <SaveButton isLoading={isLoading}>
    {isEditing ? 'Update Wedding' : 'Save Wedding'}
  </SaveButton>
</div>
```

**Why It's Wrong:**
- Duplicates wrapper logic
- Risk of inconsistency
- More code to maintain
- Missing standardization

**Fix:**
```tsx
// ✅ DO: Use FormBottomActions wrapper
<FormBottomActions
  isEditing={isEditing}
  isLoading={isLoading}
  cancelHref={cancelHref}
  moduleName="Wedding"
/>
```

---

### ❌ Mistake 6: Inconsistent Spacing

```tsx
// ❌ DON'T: Random gap values
<div className="flex gap-1 justify-end">  {/* Too tight */}
  <CancelButton href="/back">Cancel</CancelButton>
  <SaveButton>Save</SaveButton>
</div>

<div className="flex gap-8 justify-end">  {/* Too wide */}
  <CancelButton href="/back">Cancel</CancelButton>
  <SaveButton>Save</SaveButton>
</div>
```

**Why It's Wrong:**
- Inconsistent visual rhythm
- Breaks design system
- Touch targets too close or too far
- Doesn't match other forms

**Fix:**
```tsx
// ✅ DO: Use standard gap (gap-2 for dialogs, gap-4 for forms)
<div className="flex gap-2 justify-end">
  <CancelButton href="/back">Cancel</CancelButton>
  <SaveButton>Save</SaveButton>
</div>
```

---

## Related Documentation

- [FORMS.md](./FORMS.md) - Complete form patterns and validation
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - All available components
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Module form structure
- [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md) - UX principles (clarity, feedback, affordances)
- [CODE_CONVENTIONS.md](./CODE_CONVENTIONS.md) - General coding standards

---

## Summary

**The Save/Cancel Button Pattern ensures:**
- Consistent button order (Cancel → Save)
- Equal button sizing (no flex-1)
- Right-aligned layout (justify-end)
- Proper visual hierarchy (outline vs primary)
- Reusable components (SaveButton, CancelButton, FormBottomActions)

**For module forms:** Always use `FormBottomActions`
**For picker modals:** Use `SaveButton` + `CancelButton` directly
**For custom dialogs:** Use `SaveButton` + `CancelButton` directly

**Key Rule:** Cancel FIRST (left), Save SECOND (right), EQUAL SIZING, RIGHT-ALIGNED
