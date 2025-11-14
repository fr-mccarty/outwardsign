# LITURGICAL_SCRIPT_STYLE_GUIDE.md

> **Style Guidelines for Liturgical Script Elements**
>
> This document defines the proper formatting and usage of liturgical script content elements.

## Table of Contents

1. [Rubric Elements](#rubric-elements)
2. [Text Elements](#text-elements)
3. [Multi-Part Text Elements](#multi-part-text-elements)
4. [Response Elements](#response-elements)
5. [General Principles](#general-principles)

---

## Rubric Elements

**Purpose:** Liturgical instructions and stage directions for the celebrant, readers, or assembly.

**Styling:** Italic text in liturgical red (#c41e3a)

### ❌ INCORRECT - Do not use brackets

```typescript
liturgyElements.push({
  type: 'rubric',
  text: '[Después de la Homilía]',  // WRONG - brackets included
})
```

### ✅ CORRECT - Text without brackets

```typescript
liturgyElements.push({
  type: 'rubric',
  text: 'Después de la Homilía',  // CORRECT - no brackets
})
```

**Rationale:** The rubric element type already provides visual distinction through italic formatting and liturgical red color. Brackets are redundant and create visual clutter.

### Examples

```typescript
// Stage directions
{
  type: 'rubric',
  text: 'Walk to the front of the altar',
}

// Celebrant actions
{
  type: 'rubric',
  text: 'Celebrant and parents sign the child with the cross',
}

// Conditional instructions
{
  type: 'rubric',
  text: 'Bless religious articles if presented',
}

// Timing/sequence
{
  type: 'rubric',
  text: 'After the Homily',
}
```

---

## Text Elements

**Purpose:** General paragraph text without special formatting.

**Styling:** Regular text, default color

### Basic Usage

```typescript
{
  type: 'text',
  text: 'Prayer text or general content',
}
```

### With Formatting

```typescript
// Bold text
{
  type: 'text',
  text: 'Important statement',
  formatting: ['bold'],
}

// Italic text
{
  type: 'text',
  text: 'Emphasized content',
  formatting: ['italic'],
}

// Aligned text
{
  type: 'text',
  text: 'Centered content',
  alignment: 'center',
}
```

---

## Multi-Part Text Elements

**Purpose:** Text with mixed formatting (e.g., speaker labels + dialogue).

**Styling:** Each part can have independent formatting and color.

### Basic Pattern

```typescript
{
  type: 'multi-part-text',
  parts: [
    {
      text: 'CELEBRANT: ',
      formatting: ['bold'],
    },
    {
      text: 'The Lord be with you.',
    },
  ],
}
```

### With Liturgical Red

```typescript
{
  type: 'multi-part-text',
  parts: [
    {
      text: 'Reader: ',
      formatting: ['bold'],
      color: 'liturgy-red',
    },
    {
      text: 'The Word of the Lord.',
    },
  ],
}
```

---

## Response Elements

**Purpose:** Assembly or congregational responses.

**Styling:** Special formatting for liturgical responses.

### Basic Pattern

```typescript
{
  type: 'response',
  parts: [
    {
      text: 'ASSEMBLY: ',
      formatting: ['bold'],
    },
    {
      text: 'Thanks be to God.',
    },
  ],
}
```

### Bilingual Response

```typescript
{
  type: 'response',
  parts: [
    {
      text: 'ASSEMBLY / ASAMBLEA: ',
      formatting: ['bold'],
    },
    {
      text: 'Amen. / Amén.',
    },
  ],
}
```

---

## General Principles

### 1. Use Semantic Element Types

Always choose the most semantically appropriate element type:

- **`rubric`** - Liturgical instructions/directions
- **`multi-part-text`** - Speaker + dialogue
- **`response`** - Assembly responses
- **`text`** - General content
- **`reading-text`** - Scripture passages
- **`petition`** - Prayer intentions

### 2. Consistency in Formatting

**Speaker Labels:**
- Always bold: `formatting: ['bold']`
- Follow with colon and space: `'CELEBRANT: '`
- Use ALL CAPS for role names

**Language Labels:**
- Bilingual: `'CELEBRANT / CELEBRANTE: '`
- Keep consistent throughout document

### 3. Liturgical Red Usage

Use liturgical red (`color: 'liturgy-red'`) for:
- Rubrics (automatic via element type)
- Reading titles (automatic)
- Pericopes (automatic)
- Reader names (automatic)
- Special emphasis in petitions (manual via color property)

**Never use for:**
- Regular dialogue
- Assembly responses
- General text content

### 4. Spacing

Use `spacer` elements for vertical spacing:

```typescript
// Small space (default)
{ type: 'spacer' }

// Medium space
{ type: 'spacer', size: 'medium' }

// Large space
{ type: 'spacer', size: 'large' }
```

### 5. Alignment

Available alignment options:
- `'left'` (default)
- `'center'`
- `'right'`
- `'justify'`

```typescript
{
  type: 'text',
  text: 'Centered title',
  alignment: 'center',
}
```

---

## Quick Reference Table

| Element Type | Use For | Auto-Styling | Manual Formatting |
|--------------|---------|--------------|-------------------|
| `rubric` | Instructions/directions | Italic, red | None needed |
| `multi-part-text` | Mixed formatting | None | Bold, italic, color on parts |
| `response` | Assembly responses | Spacing | Bold on speaker |
| `text` | General content | None | Bold, italic, alignment |
| `reading-text` | Scripture | Line breaks | None |
| `section-title` | Section headers | Bold, centered | None |
| `event-title` | Document title | Bold, centered | None |
| `spacer` | Vertical space | Spacing | Size option |

---

## Common Mistakes to Avoid

### ❌ Don't Add Brackets to Rubrics

```typescript
// WRONG
{ type: 'rubric', text: '[After the Homily]' }

// CORRECT
{ type: 'rubric', text: 'After the Homily' }
```

### ❌ Don't Use Text Type for Rubrics

```typescript
// WRONG - misses semantic meaning and styling
{ type: 'text', text: 'After the Homily', formatting: ['italic'] }

// CORRECT
{ type: 'rubric', text: 'After the Homily' }
```

### ❌ Don't Forget Speaker Formatting

```typescript
// WRONG - no bold on speaker
{
  type: 'multi-part-text',
  parts: [
    { text: 'CELEBRANT: The Lord be with you.' }
  ]
}

// CORRECT
{
  type: 'multi-part-text',
  parts: [
    { text: 'CELEBRANT: ', formatting: ['bold'] },
    { text: 'The Lord be with you.' }
  ]
}
```

### ❌ Don't Mix Element Types Incorrectly

```typescript
// WRONG - rubric content in multi-part-text
{
  type: 'multi-part-text',
  parts: [{ text: '[Walk to the altar]', formatting: ['italic'] }]
}

// CORRECT
{ type: 'rubric', text: 'Walk to the altar' }
```

---

## Version History

- **v1.0** - Initial style guide created
- Added rubric formatting rules (no brackets)
- Defined general element usage patterns
