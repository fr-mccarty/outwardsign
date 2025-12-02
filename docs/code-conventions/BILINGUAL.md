# Bilingual Implementation (English & Spanish)

This document covers bilingual implementation patterns for English and Spanish content throughout the application.

---

## Table of Contents

- [Overview](#overview)
- [Homepage Implementation](#homepage-implementation)
- [User-Facing Content](#user-facing-content)
- [Constants Pattern](#constants-pattern)
- [🔴 TEMPORARY: Hard-Coded English in Constants](#-temporary-hard-coded-english-in-constants)
- [Language Selector Placement](#language-selector-placement)
- [Verification Checklist](#verification-checklist)

---

## Overview

**CRITICAL:** Most content in the application is bilingual (English and Spanish). Always check the language implementation of each change.

All user-facing text must support both English and Spanish translations. This includes:
- Homepage content
- Form labels and messages
- UI components
- Constants and dropdown labels
- User documentation
- Error messages and notifications

---

## Homepage Implementation

All text must be in both English and Spanish in the translations object:

```typescript
// src/app/page.tsx
const translations = {
  en: {
    title: 'Sacrament Management for Catholic Parishes',
    subtitle: 'Plan, communicate, and celebrate with beauty',
    getStarted: 'Get Started',
    // ... more translations
  },
  es: {
    title: 'Gestión de Sacramentos para Parroquias Católicas',
    subtitle: 'Planificar, comunicar y celebrar con belleza',
    getStarted: 'Comenzar',
    // ... more translations
  }
}

// Usage
<h1>{translations[language].title}</h1>
```

### Pattern

1. Define a `translations` object with `en` and `es` keys
2. Each key contains all text for that language
3. Access translations via `translations[language].key`
4. Ensure both languages have the same keys

---

## User-Facing Content

Forms, labels, messages, and UI text should support both languages where applicable:

```typescript
// ✅ GOOD - Bilingual labels
const buttonText = {
  en: 'Save Changes',
  es: 'Guardar Cambios'
}

// Form labels with bilingual support
<Label>{language === 'en' ? 'Bride Name' : 'Nombre de la Novia'}</Label>
```

### Common Patterns

**Conditional rendering:**
```typescript
{language === 'en' ? 'English Text' : 'Spanish Text'}
```

**Object-based:**
```typescript
const labels = {
  en: 'English Text',
  es: 'Spanish Text'
}
<span>{labels[language]}</span>
```

**Function-based:**
```typescript
function getLabel(language: 'en' | 'es') {
  return language === 'en' ? 'English Text' : 'Spanish Text'
}
```

---

## Constants Pattern

All constants include bilingual labels:

```typescript
// lib/constants.ts
export const WEDDING_STATUS_VALUES = ['PLANNING', 'CONFIRMED', 'COMPLETED'] as const
export type WeddingStatus = typeof WEDDING_STATUS_VALUES[number]

export const WEDDING_STATUS_LABELS: Record<WeddingStatus, { en: string; es: string }> = {
  PLANNING: { en: 'Planning', es: 'Planificación' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  COMPLETED: { en: 'Completed', es: 'Completado' }
}

// Usage
<p>{WEDDING_STATUS_LABELS[wedding.status].en}</p>  // Currently hard-coded to .en
```

### Structure

1. **Values array** - Defines the enumeration values
2. **Type alias** - Creates a TypeScript type from the values
3. **Labels object** - Maps each value to bilingual labels

### Example from Weddings Module

```typescript
// Module-specific status constants
export const WEDDING_STATUS_VALUES = ['PLANNING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const
export type WeddingStatus = typeof WEDDING_STATUS_VALUES[number]

export const WEDDING_STATUS_LABELS: Record<WeddingStatus, { en: string; es: string }> = {
  PLANNING: { en: 'Planning', es: 'Planificación' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  COMPLETED: { en: 'Completed', es: 'Completado' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado' }
}
```

### Example from Event Types

```typescript
// Shared event type constants
export const EVENT_TYPE_VALUES = ['WEDDING', 'FUNERAL', 'BAPTISM', 'MASS'] as const
export type EventType = typeof EVENT_TYPE_VALUES[number]

export const EVENT_TYPE_LABELS: Record<EventType, { en: string; es: string }> = {
  WEDDING: { en: 'Wedding', es: 'Boda' },
  FUNERAL: { en: 'Funeral', es: 'Funeral' },
  BAPTISM: { en: 'Baptism', es: 'Bautismo' },
  MASS: { en: 'Mass', es: 'Misa' }
}
```

---

## 🔴 TEMPORARY: Hard-Coded English in Constants

**Current state:**
- All constant label usage (status labels, event type labels, etc.) currently hard-codes `.en` throughout the application
- Example: `MODULE_STATUS_LABELS[status].en` instead of dynamic language selection

**Why:**
- Temporary approach while full language selector system is being implemented
- Infrastructure exists: All labels have both `.en` and `.es` properties ready for use

**Coming soon:**
- See [ROADMAP.md](../ROADMAP.md) Phase I - Multilingual Support for planned language selector implementation
- See [CONSTANTS_PATTERN.md](../CONSTANTS_PATTERN.md) for detailed documentation

**When implementing new constants:**
- ALWAYS include both `.en` and `.es` labels
- Hard-code `.en` for now (this will be replaced with dynamic language selection)
- Prepare for future migration to language selector

**Example:**
```typescript
// Current usage (hard-coded .en)
<Badge>{WEDDING_STATUS_LABELS[wedding.status].en}</Badge>

// Future usage (dynamic language)
<Badge>{WEDDING_STATUS_LABELS[wedding.status][language]}</Badge>
```

---

## Language Selector Placement

Ordinarily, the language selector should be positioned in the **upper right-hand corner** of the interface.

This is the conventional location for language switchers and makes the feature easy to discover.

---

## Verification Checklist

After making changes to user-facing text:

- [ ] Both English and Spanish translations are complete
- [ ] Translations are accurate and natural (not literal)
- [ ] Both languages tested in UI (if applicable)
- [ ] Constants follow the bilingual pattern
- [ ] No hard-coded English text in user-facing components

**When in doubt:** Check existing bilingual implementations (homepage, constants file) for the correct pattern.

---

## Related Documentation

- [GENERAL.md](./GENERAL.md) - General code conventions
- [UI_PATTERNS.md](./UI_PATTERNS.md) - UI component patterns
- [CONSTANTS_PATTERN.md](../CONSTANTS_PATTERN.md) - Constants pattern with bilingual labels
- [LANGUAGE.md](../LANGUAGE.md) - Language system documentation
