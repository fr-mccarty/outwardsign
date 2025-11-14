# Liturgical Script Style Values

> **Single source for editing liturgical styling**
>
> Edit values here, then copy to `src/lib/styles/liturgy-styles.ts` to apply changes.
> All values in **points** (standard print unit) - automatically converted for HTML, PDF, and Word.

---

## Font Sizes (points)

| Element | Size | Usage |
|---------|------|-------|
| `eventTitle` | **18** | Main title (couple names, deceased name, etc.) |
| `eventDateTime` | **14** | Event date and time |
| `sectionTitle` | **16** | Section headings (SUMMARY, CEREMONY, etc.) |
| `readingTitle` | **14** | Reading headings (FIRST READING, PSALM, etc.) |
| `pericope` | **12** | Scripture references (Genesis 2:18-24) |
| `readerName` | **11** | Reader names (Read by: Sarah Johnson) |
| `introduction` | **11** | Reading introductions |
| `text` | **11** | Body text, scripture passages |
| `conclusion` | **11** | Reading conclusions |
| `response` | **11** | Congregation responses |
| `priestDialogue` | **11** | Priest/deacon dialogue |
| `petition` | **11** | Petition text |

**To change:** Update the number in the middle column, then copy to `liturgy-styles.ts`

---

## Spacing (points)

### General Spacing

| Name | Value | When to use |
|------|-------|-------------|
| `none` | **0** | No spacing |
| `tiny` | **2** | Minimal spacing |
| `small` | **3** | Small spacing |
| `medium` | **6** | Default spacing |
| `large` | **9** | Generous spacing |
| `xlarge` | **12** | Extra large spacing |
| `xxlarge` | **18** | Maximum spacing |

### Element-Specific Spacing

| Element | Before | After | Notes |
|---------|--------|-------|-------|
| Paragraph | **0** | **4** | Standard paragraph spacing |
| Section | **0** | **8** | Space between major sections |
| Reading | **6** | **8** | Space around complete reading |
| Response | **3** | **4** | Space around congregation response |

**To change:** Update values, then copy to `liturgy-styles.ts`

---

## Line Height (multiplier)

| Name | Value | Usage |
|------|-------|-------|
| `tight` | **1.2** | Condensed text, titles |
| `normal` | **1.4** | Default line spacing (recommended) |
| `relaxed` | **1.6** | Comfortable reading |
| `loose` | **1.8** | Extra spacing for readability |

**Default:** Most elements use `normal` (1.4)

---

## Colors

| Name | Value | Usage |
|------|-------|-------|
| `liturgyRed` | **#c41e3a** | Reading titles, rubrics, directions |
| `black` | **#000000** | Default text |
| `white` | **#ffffff** | Background (print) |

**Liturgy Red is used for:**
- Reading titles (FIRST READING, PSALM)
- Reader names
- Priest/deacon directions
- Petition instructions
- Any rubric or instructional text

---

## Page Margins (points)

| Setting | Value | Converted |
|---------|-------|-----------|
| `page` | **60** | ~0.83 inches |

**Note:** Page margins apply to PDF and Word outputs only (not web view)

---

## How to Apply Changes

1. **Edit values in this file** (for your reference)
2. **Open** `src/lib/styles/liturgy-styles.ts`
3. **Find** the `LITURGY_BASE_STYLES` object (starts around line 17)
4. **Update** the corresponding values:

```typescript
export const LITURGY_BASE_STYLES = {
  fontSizes: {
    eventTitle: 18,        // ← Change these numbers
    eventDateTime: 14,
    sectionTitle: 16,
    // ... etc
  },

  spacing: {
    tiny: 2,               // ← Change these numbers
    small: 3,
    medium: 6,
    // ... etc
  },

  lineHeight: {
    tight: 1.2,            // ← Change these numbers
    normal: 1.4,
    // ... etc
  },
}
```

5. **Save** the file
6. **Test** by viewing a wedding/funeral/baptism and checking the liturgy output
7. **Test all three formats:** Web view, Print view, PDF download, Word download

---

## Quick Examples

### Make titles bigger
```typescript
eventTitle: 18,  // Change to 20 or 22
```

### Increase space between sections
```typescript
afterSection: 8,  // Change to 10 or 12
```

### Make body text more readable
```typescript
text: 11,        // Change to 12
lineHeight: {
  normal: 1.4,   // Change to 1.6
}
```

### Tighten up spacing
```typescript
small: 3,        // Change to 2
medium: 6,       // Change to 4
large: 9,        // Change to 6
```

---

## Testing Checklist

After making changes, test these scenarios:

- [ ] View a wedding liturgy on web
- [ ] Open print view (Cmd/Ctrl+P to preview)
- [ ] Download PDF and check formatting
- [ ] Download Word doc and check formatting
- [ ] Verify liturgy red color appears correctly
- [ ] Check that spacing looks balanced
- [ ] Ensure text is readable at all sizes

---

## Related Files

- **Source of truth:** `src/lib/styles/liturgy-styles.ts` (edit this to apply changes)
- **Style guide:** [LITURGICAL_SCRIPT_STYLING_GUIDE.md](./LITURGICAL_SCRIPT_STYLING_GUIDE.md) (reference)
- **System setup:** [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md) (architecture)
