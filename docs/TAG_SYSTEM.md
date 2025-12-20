# Tag System

> **Purpose:** Document the polymorphic tag system used for categorizing and filtering content across the application.

---

## Overview

The tag system provides a flexible way to categorize content (readings, prayers, announcements) so it can be filtered and discovered in content pickers. Tags are parish-scoped and shared across all content types.

## Database Schema

### `category_tags` Table

Stores tag definitions for a parish.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `parish_id` | UUID | Parish scope |
| `name` | TEXT | Display name (e.g., "First Reading") |
| `slug` | TEXT | URL-safe identifier (e.g., "first-reading") |
| `sort_order` | INTEGER | Controls display ordering |
| `color` | TEXT | Optional UI color (not currently used) |

**Unique constraint:** `(parish_id, slug)`

### `tag_assignments` Table

Polymorphic junction table linking tags to entities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tag_id` | UUID | References category_tags |
| `entity_type` | TEXT | Type of entity (e.g., "content") |
| `entity_id` | UUID | ID of the tagged entity |

---

## Tag Categories

Tags are organized into categories using `sort_order` ranges:

### 1. Sacrament Tags (sort_order 1-10)

Identify which sacrament/event type content belongs to.

| Slug | Name | sort_order |
|------|------|------------|
| `wedding` | Wedding | 1 |
| `funeral` | Funeral | 2 |
| `baptism` | Baptism | 3 |
| `presentation` | Presentation | 4 |
| `quinceanera` | Quinceañera | 5 |

### 2. Section Tags (sort_order 10-30)

Identify the liturgical section/role of content.

| Slug | Name | sort_order |
|------|------|------------|
| `reading` | Reading | 10 |
| `first-reading` | First Reading | 11 |
| `second-reading` | Second Reading | 12 |
| `psalm` | Psalm | 13 |
| `gospel` | Gospel | 14 |
| `opening-prayer` | Opening Prayer | 15 |
| `closing-prayer` | Closing Prayer | 16 |
| `prayers-of-the-faithful` | Prayers of the Faithful | 17 |
| `ceremony-instructions` | Ceremony Instructions | 18 |
| `announcements` | Announcements | 19 |

### 3. Theme Tags (sort_order 31-50)

Optional thematic categorization for discoverability.

| Slug | Name | sort_order |
|------|------|------------|
| `hope` | Hope | 31 |
| `resurrection` | Resurrection | 32 |
| `love` | Love | 33 |
| `eternal-life` | Eternal Life | 34 |
| `comfort` | Comfort | 35 |
| `joy` | Joy | 36 |
| `peace` | Peace | 37 |
| `faith` | Faith | 38 |
| `community` | Community | 39 |
| `family` | Family | 40 |

### 4. Testament Tags (sort_order 51-60)

Identify scripture source.

| Slug | Name | sort_order |
|------|------|------------|
| `old-testament` | Old Testament | 51 |
| `new-testament` | New Testament | 52 |

---

## How Tags Are Used

### Tagging Content

Content items are typically tagged with multiple tags:
1. A **SACRAMENT** tag (which event type)
2. A **SECTION** tag (what liturgical role)
3. Optional **THEME** tags (for discoverability)

**Example:**
```
Wedding Opening Prayer → ['wedding', 'opening-prayer']
Funeral Gospel about Hope → ['funeral', 'gospel', 'hope']
Generic Bible Study Reading → ['reading']
```

### Filtering with `filter_tags`

Input field definitions on event types use `filter_tags` to specify which content should appear in the picker.

**Example from event-types-seed.ts:**
```typescript
{
  name: 'First Reading',
  type: 'content',
  filter_tags: ['wedding', 'first-reading']
}
```

This shows only content tagged with BOTH 'wedding' AND 'first-reading'.

---

## Querying Tagged Content

### Find Content by Tags

```sql
-- Find all wedding first readings
SELECT c.* FROM contents c
JOIN tag_assignments ta1 ON ta1.entity_id = c.id AND ta1.entity_type = 'content'
JOIN category_tags ct1 ON ct1.id = ta1.tag_id AND ct1.slug = 'wedding'
JOIN tag_assignments ta2 ON ta2.entity_id = c.id AND ta2.entity_type = 'content'
JOIN category_tags ct2 ON ct2.id = ta2.tag_id AND ct2.slug = 'first-reading'
WHERE c.parish_id = :parish_id;
```

### Find Tags for Content

```sql
-- Get all tags assigned to a content item
SELECT ct.name, ct.slug FROM category_tags ct
JOIN tag_assignments ta ON ta.tag_id = ct.id
WHERE ta.entity_id = :content_id AND ta.entity_type = 'content';
```

---

## Source Files

| Purpose | File |
|---------|------|
| Tag definitions (seeding) | `src/lib/onboarding-seeding/category-tags-seed.ts` |
| Content seeding with tags | `src/lib/onboarding-seeding/content-seed.ts` |
| Event types with filter_tags | `src/lib/onboarding-seeding/event-types-seed.ts` |
| Dev readings seeder | `scripts/dev-seeders/seed-readings.ts` |
| Content picker (uses tags) | `src/components/content-picker.tsx` |
| Server action (queries tags) | `src/lib/actions/contents.ts` |

---

## Adding New Tags

1. **Add to category-tags-seed.ts:**
   ```typescript
   const SECTION_TAGS = [
     // ... existing tags
     { name: 'New Section', slug: 'new-section', sort_order: 20 },
   ]
   ```

2. **Use in content-seed.ts (if seeding content):**
   ```typescript
   {
     title: 'My New Content',
     tags: ['wedding', 'new-section']
   }
   ```

3. **Use in event-types-seed.ts (if filtering in picker):**
   ```typescript
   {
     name: 'New Section',
     type: 'content',
     filter_tags: ['wedding', 'new-section']
   }
   ```

4. **Run seed script:**
   ```bash
   npm run seed:dev
   ```

---

## Best Practices

1. **Always use slugs, not names** - The `slug` field is the identifier used in code
2. **Combine sacrament + section** - Most filter_tags should include both for specificity
3. **Use 'reading' for generic** - The generic 'reading' tag is for non-sacrament-specific content
4. **Theme tags are optional** - Only add for discoverability, not required for filtering
5. **Check existing slugs** - Always reference category-tags-seed.ts before adding new ones

---

## See Also

- [INPUT_FIELD_TYPES.md](./INPUT_FIELD_TYPES.md) - How filter_tags work on input fields
- [SEEDERS_REFERENCE.md](./SEEDERS_REFERENCE.md) - Complete seeders documentation
- [DATABASE.md](./DATABASE.md) - Database operations and seeding
