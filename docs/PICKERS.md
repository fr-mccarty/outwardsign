# Picker System Documentation

> **🔴 Context Requirement:** When working with ANY picker component (EventPicker, PeoplePicker, etc.) or creating a new picker, you MUST include the appropriate documentation from the `docs/pickers/` directory in your context.
>
> **Purpose:** Navigation hub for the picker system documentation.
>
> **See Also:**
> - **[PICKER_PATTERNS.md](./PICKER_PATTERNS.md)** - Critical behavioral rules (no redirect, auto-select, openToNew* pattern)
> - **[PICKER_EDIT_MODE.md](./PICKER_EDIT_MODE.md)** - Inline editing of related entities from pickers
> - **[pickers/PICKER_UI_PATTERNS.md](./pickers/PICKER_UI_PATTERNS.md)** - UI/UX layout patterns (inline "New" button, visual design)
> - **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Quick reference for all picker components and props

---

## Overview

The picker system provides a unified, reusable pattern for modal selection dialogs throughout the application. Pickers allow users to search, select, and optionally create entities (people, events, locations, etc.) in a consistent, user-friendly interface.

**Key Features:**
- Client-side search across multiple fields
- Inline creation forms for creating new entities
- Custom field types including nested pickers
- Validation using Zod schemas
- Type-safe with TypeScript generics
- Custom form components for complex use cases

---

## Documentation Structure

The picker documentation is organized into category files for easy navigation:

### 1. [ARCHITECTURE.md](./pickers/ARCHITECTURE.md)
**Core architecture, components, and design patterns**
- System architecture overview
- Core components (CorePicker, CorePickerField, PickerField)
- Available pickers reference table
- Field configuration types
- Best practices

**Read this when:**
- Understanding the picker system architecture
- Learning about core components
- Checking which pickers are available
- Understanding field configuration options

---

### 2. [CREATING_PICKERS.md](./pickers/CREATING_PICKERS.md)
**Step-by-step guide to creating new pickers**
- Step 1: Define field configuration
- Step 2: Create picker component
- Step 3: Create field wrapper
- Checklist for new pickers
- Migration from old patterns

**Read this when:**
- Creating a new picker component
- Converting old Command/CommandDialog pickers to CorePicker
- Implementing inline creation forms
- Setting up field wrappers

---

### 3. [USAGE_PATTERNS.md](./pickers/USAGE_PATTERNS.md)
**Common usage patterns and examples**
- Basic usage in forms
- React Hook Form integration
- Auto-open create form
- Pre-fill create form
- Custom list item rendering
- Complete reference for all existing pickers (PeoplePicker, EventPicker, LocationPicker, etc.)
- usePickerState hook

**Read this when:**
- Using existing pickers in forms
- Integrating with React Hook Form
- Auto-opening or pre-filling create forms
- Customizing list item display
- Looking up props for existing pickers

---

### 4. [ADVANCED_FEATURES.md](./pickers/ADVANCED_FEATURES.md)
**Advanced features and customization**
- Dynamic field visibility
- Validation with Zod
- Nested pickers (custom fields)
- Context-aware suggested event names
- Custom form components
- Memoization best practices
- Empty form data constants

**Read this when:**
- Implementing dynamic field visibility
- Adding complex validation rules
- Creating nested pickers
- Building custom form components
- Optimizing picker performance

---

### 5. [PICKER_UI_PATTERNS.md](./pickers/PICKER_UI_PATTERNS.md) 🔴
**UI/UX layout patterns and visual design**
- Inline "New Entity" button pattern
- Layout specifications (flexbox, spacing, alignment)
- Responsive behavior (320px minimum width)
- Button styling and text conventions
- Testing checklist for UI patterns

**Read this when:**
- Implementing picker field wrappers in forms
- Creating new picker components with inline creation
- Ensuring consistent UI across all pickers
- Troubleshooting layout issues with picker buttons
- Reviewing picker implementations for UI consistency

---

### 6. [INFINITE_LOOP_PREVENTION.md](./pickers/INFINITE_LOOP_PREVENTION.md) 🔴
**Critical rules for preventing infinite re-renders**
- The problem explained
- Correct patterns (constants outside component)
- Incorrect patterns to avoid
- Dynamic createFields with useMemo
- Checklist for new pickers
- Real examples from existing pickers

**Read this when:**
- Creating any new picker
- Debugging infinite re-render loops
- Seeing "Maximum update depth exceeded" errors
- Implementing dynamic field configurations
- Reviewing picker code for performance issues

---

## Quick Reference

### Which Picker Should I Use?

| Entity Type | Picker Component | Field Wrapper | Inline Creation |
|-------------|------------------|---------------|-----------------|
| **Person** | `PeoplePicker` | `PersonPickerField` | ✅ Yes |
| **Event** | `EventPicker` | `EventPickerField` | ✅ Yes |
| **Location** | `LocationPicker` | `LocationPickerField` | ✅ Yes |
| **Mass** | `MassPicker` | `MassPickerField` | ❌ No |
| **Global Liturgical Event** | `LiturgicalCalendarEventPicker` | - | ❌ No |
| **Reading** | `ReadingPickerModal` | - | ❌ No |
| **Role** | `RolePicker` | `RolePickerField` | ✅ Yes |

**See [USAGE_PATTERNS.md](./pickers/USAGE_PATTERNS.md) for complete props reference for each picker.**

---

### Common Tasks

| I need to... | Read this file |
|--------------|----------------|
| Understand picker architecture | [ARCHITECTURE.md](./pickers/ARCHITECTURE.md) |
| Create a new picker | [CREATING_PICKERS.md](./pickers/CREATING_PICKERS.md) |
| Use an existing picker in a form | [USAGE_PATTERNS.md](./pickers/USAGE_PATTERNS.md) |
| Add dynamic field visibility | [ADVANCED_FEATURES.md](./pickers/ADVANCED_FEATURES.md) |
| Create a nested picker | [ADVANCED_FEATURES.md](./pickers/ADVANCED_FEATURES.md) |
| Build a custom form component | [ADVANCED_FEATURES.md](./pickers/ADVANCED_FEATURES.md) |
| Implement inline "New" button layout | [PICKER_UI_PATTERNS.md](./pickers/PICKER_UI_PATTERNS.md) |
| Fix infinite re-render loop | [INFINITE_LOOP_PREVENTION.md](./pickers/INFINITE_LOOP_PREVENTION.md) |
| Understand picker behavioral rules | [PICKER_PATTERNS.md](./PICKER_PATTERNS.md) |
| Enable inline editing | [PICKER_EDIT_MODE.md](./PICKER_EDIT_MODE.md) |

---

## Critical Rules

When working with pickers, always remember:

🔴 **Define constants OUTSIDE component** - Arrays and objects used in props must be defined outside the component function to prevent infinite re-renders. See [INFINITE_LOOP_PREVENTION.md](./pickers/INFINITE_LOOP_PREVENTION.md).

🔴 **No redirect after creation** - Pickers create entities inline and auto-select them. Never redirect to edit pages. See [PICKER_PATTERNS.md](./PICKER_PATTERNS.md).

🔴 **Load data when picker opens** - Always fetch data in a useEffect with `open` as dependency.

🔴 **Add newly created items to local list** - Update local state immediately after creation.

---

## Summary

The picker system provides:
- ✅ **Consistency** - Unified UX across all picker modals
- ✅ **Reusability** - Write picker logic once, reuse everywhere
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Flexibility** - Support for simple to complex use cases
- ✅ **Validation** - Built-in Zod validation support
- ✅ **Extensibility** - Custom form components for maximum control
- ✅ **Performance** - Memoization patterns prevent unnecessary re-renders

For questions or additions to the picker system, consult `src/components/core-picker.tsx` and `src/types/core-picker.ts`.
