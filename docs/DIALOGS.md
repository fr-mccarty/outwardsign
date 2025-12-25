# Dialog Components

This document describes the custom dialog components and when to use each one.

## Rule: Never Import from `ui/dialog` Directly

**In application code, NEVER import directly from `@/components/ui/dialog`.** Always use one of the custom wrapper components below.

Only files inside `src/components/` that create custom dialog wrappers should import from `@/components/ui/dialog`.

### Existing Custom Dialog Components

These files are **allowed** to import from `ui/dialog` because they ARE custom dialog wrappers:

| Component | Location |
|-----------|----------|
| ConfirmationDialog | `src/components/confirmation-dialog.tsx` |
| InfoDialog | `src/components/info-dialog.tsx` |
| FormDialog | `src/components/form-dialog.tsx` |
| FieldFormDialog | `src/app/(main)/settings/event-types/[slug]/fields/field-form-dialog.tsx` |
| AddMassTimeDialog | `src/components/add-mass-time-dialog.tsx` |

If you create a new custom dialog component, add it to this list.

## Available Dialog Components

### ConfirmationDialog

**Use for:** Actions that require user confirmation before proceeding.

**Examples:**
- Delete confirmations
- Destructive actions
- "Are you sure?" prompts

**Location:** `@/components/confirmation-dialog`

```tsx
import { ConfirmationDialog } from '@/components/confirmation-dialog'

<ConfirmationDialog
  open={open}
  onOpenChange={setOpen}
  onConfirm={handleDelete}
  preset="delete"
  itemName="Wedding"
/>
```

**Props:**
- `preset`: `"delete"` | `"remove"` - Pre-configured title/description/button
- `variant`: `"default"` | `"destructive"` - Button styling
- `title`, `description`, `confirmLabel`, `cancelLabel` - Custom text
- `children` - Additional content in dialog body

---

### InfoDialog

**Use for:** Displaying informational content to users.

**Examples:**
- Help text and instructions
- Feature explanations
- "How to" guides
- Onboarding information

**Location:** `@/components/info-dialog`

```tsx
import { InfoDialog } from '@/components/info-dialog'

<InfoDialog
  open={open}
  onOpenChange={setOpen}
  title="How to Create a Template"
  description="Templates are created by saving an existing event."
  primaryAction={{
    label: "Go to Events",
    href: "/events",
  }}
>
  <ol className="list-decimal list-inside space-y-2">
    <li>Step one</li>
    <li>Step two</li>
  </ol>
</InfoDialog>
```

**Props:**
- `title` - Dialog title (required)
- `description` - Subtitle text
- `children` - Custom content in dialog body
- `primaryAction` - Optional button with `label`, `href` or `onClick`, `icon`
- `dismissLabel` - Custom close button text (default: "Close")
- `hideDismiss` - Hide the close button

---

### FormDialog

**Use for:** Dialogs containing forms that require user input.

**Examples:**
- Add/edit item forms
- Invite user forms
- Create new entity forms

**Location:** `@/components/form-dialog`

```tsx
import { FormDialog } from '@/components/form-dialog'

<FormDialog
  open={open}
  onOpenChange={setOpen}
  title="Add Member"
  description="Add a new member to the group."
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
>
  <FormInput id="name" label="Name" value={name} onChange={setName} />
</FormDialog>
```

**Props:**
- `title` - Dialog title (required)
- `description` - Subtitle text
- `children` - Form content
- `onSubmit` - Submit handler
- `submitLabel`, `cancelLabel` - Custom button text
- `isLoading`, `loadingLabel` - Loading state
- `submitDisabled` - Disable submit button
- `contentClassName` - Custom styling for dialog content

---

### Complex Form Dialogs

For dialogs with complex forms that need their own state management, create a dedicated component. See examples:
- `src/components/groups/group-form-dialog.tsx`
- `src/components/add-mass-time-dialog.tsx`

---

## Quick Reference

| Need to... | Use |
|------------|-----|
| Confirm before delete/remove | `ConfirmationDialog` with `preset="delete"` |
| Show a destructive confirmation | `ConfirmationDialog` with `variant="destructive"` |
| Display help or instructions | `InfoDialog` |
| Show a simple form in a modal | `FormDialog` |
| Show a complex form with custom state | Create dedicated dialog component in `src/components/` |
