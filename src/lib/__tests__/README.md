# Liturgy System Tests

Comprehensive tests for the centralized content and style system.

## Running Tests

From the project root:

```bash
# Using the test script
./scripts/test-liturgy-system.sh

# Or directly with npx
npx tsx src/lib/__tests__/liturgy-system.test.ts
```

## What's Tested

### ✅ Test 1: Style System
- Base style values are defined correctly
- PDF, Word, and HTML styles all exist
- Colors are consistent across all formats
- Unit conversions work (points → twips, half-points, pixels)

### ✅ Test 2: Template Registry
- Template `wedding-full-script-english` exists
- Template has correct metadata (name, languages)
- Template has a valid builder function

### ✅ Test 3: Content Builder
- Builds a complete `LiturgyDocument` from wedding data
- Document metadata is correct (type, language, template)
- All expected sections are present
- Sections contain proper elements (pericopes, reading text, responses)
- Custom petitions are included

### ✅ Test 4: PDF Renderer
- Renders `LiturgyDocument` to pdfmake format
- Output is a valid array
- Contains page breaks
- Contains text content

### ✅ Test 5: Word Renderer
- Renders `LiturgyDocument` to docx Paragraph format
- Output is a valid array
- Paragraphs have valid structure

### ✅ Test 6: HTML Renderer
- Renders `LiturgyDocument` to React JSX
- Output is valid React elements

### ✅ Test 7: Content Consistency
- Content builder produces deterministic output
- Same input always produces same output
- Section order is consistent

### ✅ Test 8: Page Break Handling
- Summary section has page break after
- Reading sections have page breaks before
- Page breaks are properly set in content structure

## Mock Data

The tests use realistic mock data in `mock-wedding-data.ts` that includes:
- Complete wedding party (bride, groom, coordinator, presider, etc.)
- All readings (First Reading, Psalm, Second Reading, Gospel)
- Events (wedding, rehearsal, rehearsal dinner, reception)
- Custom petitions
- Announcements

## Test Results

When all tests pass, you'll see:

```
🎉 ALL TESTS PASSED!

Test Coverage:
  ✅ Style System (base values, conversions, consistency)
  ✅ Template Registry (wedding-full-script-english)
  ✅ Content Builder (sections, elements, content)
  ✅ PDF Renderer (output structure, page breaks)
  ✅ Word Renderer (paragraph structure)
  ✅ HTML Renderer (React elements)
  ✅ Content Consistency (deterministic output)
  ✅ Page Break Handling (section breaks)
```

## Adding Tests for Other Sacraments

When you create templates for other sacraments (baptisms, funerals, quinceañeras):

1. Create mock data file: `mock-{sacrament}-data.ts`
2. Create test file: `{sacrament}-system.test.ts`
3. Follow the same test pattern as `liturgy-system.test.ts`
4. Test your template registry, content builder, and all renderers

## Continuous Testing

Run tests before:
- Committing changes to the style system
- Committing changes to content builders
- Committing changes to renderers
- Deploying to production

This ensures the centralized system remains consistent across all formats.
