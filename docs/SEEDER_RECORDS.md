# Seeder Records Reference

This document provides a comprehensive summary of all records created by the seeder scripts. Use this as a reference to understand what sample data is available for development and testing.

## Seeding Architecture

The seeding system is split into two phases:

1. **Onboarding Seeding** - Data that ALL parishes get (production + development)
2. **Dev Seeding** - Additional data for development only (NOT in production)

When running `npm run db:fresh` or `npm run seed:dev`, you'll see clear section headers indicating which phase is running.

---

## Table of Contents

- [Onboarding Seeder Records](#onboarding-seeder-records) (production parish data)
  - [Category Tags](#category-tags)
  - [Event Types](#event-types)
  - [Mass Event Types](#mass-event-types)
  - [Special Liturgy Event Types](#special-liturgy-event-types)
  - [Locations](#locations)
  - [Groups](#groups)
  - [Group Roles](#group-roles)
  - [Mass Times Templates](#mass-times-templates)
  - [Petition Templates](#petition-templates)
  - [Event Presets](#event-presets)
  - [Content Library (Non-Readings)](#content-library-non-readings)
  - [Sample Parish Events](#sample-parish-events)
  - [Sample Special Liturgies](#sample-special-liturgies)
- [Dev Seeder Records](#dev-seeder-records) (development-only data)
  - [Scripture Readings](#scripture-readings)
  - [People](#people)
  - [Families](#families)
  - [Group Memberships](#group-memberships)
  - [Masses](#masses)
  - [Mass Intentions](#mass-intentions)
  - [Weddings & Funerals](#weddings--funerals)

---

# Onboarding Seeder Records

Located in: `src/lib/onboarding-seeding/`

The onboarding seeder creates initial parish data during new parish setup. This data is what ALL parishes receive, including production parishes.

---

## Category Tags

**File:** `src/lib/onboarding-seeding/category-tags-seed.ts`

Creates tags for categorizing content and filtering.

### Sacrament Tags (sort_order 1-10)

| Name | Slug | Sort Order |
|------|------|------------|
| Wedding | wedding | 1 |
| Funeral | funeral | 2 |
| Baptism | baptism | 3 |
| Presentation | presentation | 4 |
| Quinceañera | quinceanera | 5 |

### Section Tags (sort_order 10-30)

| Name | Slug | Sort Order |
|------|------|------------|
| Reading | reading | 10 |
| First Reading | first-reading | 11 |
| Second Reading | second-reading | 12 |
| Psalm | psalm | 13 |
| Gospel | gospel | 14 |
| Opening Prayer | opening-prayer | 15 |
| Closing Prayer | closing-prayer | 16 |
| Prayers of the Faithful | prayers-of-the-faithful | 17 |
| Ceremony Instructions | ceremony-instructions | 18 |
| Announcements | announcements | 19 |

### Theme Tags (sort_order 31-50)

| Name | Slug | Sort Order |
|------|------|------------|
| Hope | hope | 31 |
| Resurrection | resurrection | 32 |
| Love | love | 33 |
| Eternal Life | eternal-life | 34 |
| Comfort | comfort | 35 |
| Joy | joy | 36 |
| Peace | peace | 37 |
| Faith | faith | 38 |
| Community | community | 39 |
| Family | family | 40 |

### Testament Tags (sort_order 51-60)

| Name | Slug | Sort Order |
|------|------|------------|
| Old Testament | old-testament | 51 |
| New Testament | new-testament | 52 |

---

## Event Types

**File:** `src/lib/onboarding-seeding/event-types-seed.ts`

Creates event types for sacraments and parish events.

### Special Liturgy Event Types

| # | Name | Slug | Icon | Description |
|---|------|------|------|-------------|
| 1 | Wedding | weddings | VenusAndMars | Celebrating the union of two people in marriage |
| 2 | Funeral | funerals | Cross | Honoring the life of the deceased |
| 3 | Baptism | baptisms | Droplet | Welcoming new members into the faith |
| 4 | Quinceañera | quinceaneras | BookHeart | Celebrating a young woman's 15th birthday |
| 5 | Presentation | presentations | HandHeartIcon | Presenting a child to God |

### Parish Event Types

| # | Name | Slug | Icon | Description |
|---|------|------|------|-------------|
| 6 | Bible Study | bible-studies | Book | Regular Bible study gatherings |
| 7 | Fundraiser | fundraisers | DollarSign | Parish fundraising events |
| 8 | Religious Education | religious-education | GraduationCap | Faith formation classes |
| 9 | Staff Meeting | staff-meetings | Users | Parish staff meetings |
| 10 | Other | other | CalendarDays | General parish events |

### Custom Lists Created

| List Name | Items |
|-----------|-------|
| Wedding Songs | Ave Maria, On This Day O Beautiful Mother, The Lord's Prayer, Panis Angelicus, Joyful Joyful We Adore Thee, All Creatures of Our God and King, How Great Thou Art, Here I Am Lord, The Wedding Song, One Hand One Heart |
| Funeral Songs | How Great Thou Art, On Eagle's Wings, Amazing Grace, Be Not Afraid, Shepherd Me O God, Ave Maria, The Lord Is My Shepherd, I Am the Bread of Life, Here I Am Lord, Song of Farewell |

---

## Mass Event Types

**File:** `src/lib/onboarding-seeding/mass-event-types-seed.ts`

| # | Name | Slug | Icon | Description | Minister Roles |
|---|------|------|------|-------------|----------------|
| 1 | Sunday Mass | sunday-mass | Church | Sunday celebration with full music | Presider, Homilist, Lector, EMHC, Altar Server, Cantor, Usher |
| 2 | Daily Mass | daily-mass | CalendarDays | Weekday celebration with minimal music | Presider, Lector, EMHC, Altar Server |

---

## Special Liturgy Event Types

**File:** `src/lib/onboarding-seeding/special-liturgy-event-types-seed.ts`

| # | Name | Slug | Icon | Description |
|---|------|------|------|-------------|
| 1 | Easter Vigil | easter-vigil | Flame | The Great Vigil of Easter |
| 2 | Holy Thursday | holy-thursday | Wheat | Mass of the Lord's Supper |
| 3 | Good Friday | good-friday | Cross | Celebration of the Lord's Passion |

---

## Locations

**File:** `src/lib/onboarding-seeding/locations-seed.ts`

Creates 3 default locations for the parish.

| # | Name | Description | Street | City | State |
|---|------|-------------|--------|------|-------|
| 1 | St. Mary's Catholic Church | Main parish church and worship space | 100 Church Street | Springfield | IL |
| 2 | Parish Hall | Parish event center and reception hall | 102 Church Street | Springfield | IL |
| 3 | Springfield Funeral Home | Local funeral home for vigil services | 500 Memorial Drive | Springfield | IL |

---

## Groups

**File:** `src/lib/onboarding-seeding/groups-seed.ts`

Creates 5 default parish groups.

| # | Name | Description | Active |
|---|------|-------------|--------|
| 1 | Parish Council | Advisory body for parish leadership and planning | Yes |
| 2 | Finance Council | Oversight of parish finances and budgeting | Yes |
| 3 | Zumba | Exercise and community group | Yes |
| 4 | Maintenance Committee | Care and upkeep of parish facilities | Yes |
| 5 | PLT | Parish Leadership Team | Yes |

---

## Group Roles

**File:** `src/lib/onboarding-seeding/parish-seed-data.ts`

| # | Name | Description | Display Order |
|---|------|-------------|---------------|
| 1 | Leader | Leads and coordinates the group | 1 |
| 2 | Member | Active participant in the group | 2 |
| 3 | Secretary | Maintains records and communications | 3 |
| 4 | Treasurer | Manages group finances | 4 |
| 5 | Coordinator | Coordinates group activities and events | 5 |

---

## Mass Times Templates

**File:** `src/lib/onboarding-seeding/parish-seed-data.ts`

| Day | Template Name | Times |
|-----|---------------|-------|
| Sunday | Sunday | 9:00 AM, 11:00 AM, 4:00 PM (Sat), 5:30 PM (Sat) |
| Monday | Monday | 12:05 PM |
| Wednesday | Wednesday | 6:00 PM |
| Thursday | Thursday | 6:00 AM |
| Friday | Friday | 12:05 PM |
| Movable | Holiday | 9:00 AM |

---

## Petition Templates

**File:** `src/lib/onboarding-seeding/parish-seed-data.ts`

| # | Title | Module | Language | Default |
|---|-------|--------|----------|---------|
| 1 | Sunday Mass Petitions | mass | English | Yes |
| 2 | Peticiones de la Misa Dominical | mass | Spanish | Yes |
| 3 | Daily Mass Petitions | mass | English | No |
| 4 | Wedding Petitions | wedding | English | Yes |
| 5 | Peticiones del Matrimonio | wedding | Spanish | Yes |
| 6 | Funeral Petitions | funeral | English | Yes |
| 7 | Peticiones del Funeral | funeral | Spanish | Yes |
| 8 | Quinceañera Petitions | quinceanera | English | Yes |
| 9 | Peticiones de la Quinceañera | quinceanera | Spanish | Yes |
| 10 | Presentation Petitions | presentation | English | Yes |
| 11 | Peticiones de la Presentación | presentation | Spanish | Yes |

---

## Event Presets

**File:** `src/lib/onboarding-seeding/event-presets-seed.ts`

Creates default event presets for quick event creation.

| # | Name | Event Type | Default Location |
|---|------|------------|------------------|
| 1 | Religious Education | Religious Education | Church |
| 2 | Staff Meeting | Staff Meeting | Church |

---

## Content Library (Non-Readings)

**File:** `src/lib/onboarding-seeding/content-seed.ts` → `seedNonReadingContentForParish()`

Creates sample content items for liturgies. **Note:** Scripture readings are seeded separately by the dev seeder.

### Opening Prayers (6 items)

| Title | Language | Tags |
|-------|----------|------|
| Wedding Opening Prayer | English | wedding, opening-prayer |
| Oración Inicial del Matrimonio | Spanish | wedding, opening-prayer |
| Funeral Opening Prayer | English | funeral, opening-prayer, comfort |
| Oración Inicial del Funeral | Spanish | funeral, opening-prayer, comfort |
| Baptism Opening Prayer | English | baptism, opening-prayer, hope |
| Oración Inicial del Bautismo | Spanish | baptism, opening-prayer, hope |

### Closing Prayers (4 items)

| Title | Language | Tags |
|-------|----------|------|
| Wedding Closing Prayer | English | wedding, closing-prayer, love |
| Oración Final del Matrimonio | Spanish | wedding, closing-prayer, love |
| Funeral Final Commendation | English | funeral, closing-prayer, eternal-life, hope |
| Encomendación Final del Funeral | Spanish | funeral, closing-prayer, eternal-life, hope |

### Prayers of the Faithful (6 items)

| Title | Language | Tags |
|-------|----------|------|
| Wedding Intercessions | English | wedding, prayers-of-the-faithful, love |
| Intercesiones del Matrimonio | Spanish | wedding, prayers-of-the-faithful, love |
| Funeral Intercessions | English | funeral, prayers-of-the-faithful, comfort, hope |
| Intercesiones del Funeral | Spanish | funeral, prayers-of-the-faithful, comfort, hope |
| Baptism Intercessions | English | baptism, prayers-of-the-faithful, hope, faith |
| Intercesiones del Bautismo | Spanish | baptism, prayers-of-the-faithful, hope, faith |

### Ceremony Instructions (6 items)

| Title | Language | Tags |
|-------|----------|------|
| Exchange of Consent | English | wedding, ceremony-instructions |
| Intercambio de Consentimientos | Spanish | wedding, ceremony-instructions |
| Blessing and Exchange of Rings | English | wedding, ceremony-instructions, love |
| Bendición e Intercambio de Anillos | Spanish | wedding, ceremony-instructions, love |
| Baptismal Promises Renewal | English | baptism, ceremony-instructions, faith |
| Renovación de las Promesas Bautismales | Spanish | baptism, ceremony-instructions, faith |

### Announcements (6 items)

| Title | Language | Tags |
|-------|----------|------|
| Wedding Reception Announcement | English | wedding, announcements |
| Anuncio de Recepción de Boda | Spanish | wedding, announcements |
| Funeral Repast Announcement | English | funeral, announcements |
| Anuncio de Recepción del Funeral | Spanish | funeral, announcements |
| Baptism Reception Announcement | English | baptism, announcements |
| Anuncio de Recepción del Bautismo | Spanish | baptism, announcements |

### Quinceañera Content (4 items)

| Title | Language | Tags |
|-------|----------|------|
| Quinceañera Thanksgiving Prayer | English | quinceanera, opening-prayer, joy |
| Oración de Acción de Gracias de la Quinceañera | Spanish | quinceanera, opening-prayer, joy |
| Quinceañera Blessing | English | quinceanera, ceremony-instructions, joy, faith |
| Bendición de la Quinceañera | Spanish | quinceanera, ceremony-instructions, joy, faith |

### Presentation Content (2 items)

| Title | Language | Tags |
|-------|----------|------|
| Presentation Prayer | English | presentation, opening-prayer, family |
| Oración de la Presentación | Spanish | presentation, opening-prayer, family |

---

## Sample Parish Events

**File:** `src/lib/onboarding-seeding/events-seed.ts`

Creates 8 sample events for parish event types (2 per type).

| Event Type | Count | Description |
|------------|-------|-------------|
| Bible Study | 2 | Gospel of John study, Acts of the Apostles |
| Fundraiser | 2 | Spring Pancake Breakfast, Parish Festival |
| Religious Education | 2 | First Communion prep, Confirmation prep |
| Staff Meeting | 2 | Monthly planning, Year-end review |

---

## Sample Special Liturgies

**File:** `src/lib/onboarding-seeding/special-liturgies-seed.ts`

Creates sample special liturgies for Baptisms, Quinceañeras, and Presentations. **Note:** Weddings and Funerals are NOT seeded here—they are created by the dev seeder because they require readings from the content library.

### Baptisms (2 records)

| # | Child | Mother | Father | Godmother | Godfather | Date | Color |
|---|-------|--------|--------|-----------|-----------|------|-------|
| 1 | Person 1 | Person 2 | Person 3 | Person 4 | Person 5 | +14 days | White |
| 2 | Person 6 | Person 7 | Person 8 | Person 9 | Person 10 | +28 days | White |

### Quinceañeras (2 records)

| # | Quinceañera | Mother | Father | Date | Color |
|---|-------------|--------|--------|------|-------|
| 1 | Person 1 | Person 2 | Person 3 | +60 days | White |
| 2 | Person 4 | Person 5 | Person 6 | +90 days | White |

### Presentations (2 records)

| # | Child | Mother | Father | Godmother | Godfather | Date | Color |
|---|-------|--------|--------|-----------|-----------|------|-------|
| 1 | Person 1 | Person 2 | Person 3 | Person 4 | Person 5 | +21 days | White |
| 2 | Person 6 | Person 7 | Person 8 | Person 9 | Person 10 | +35 days | White |

---

# Dev Seeder Records

Located in: `scripts/dev-seeders/`

The dev seeder creates additional sample data for local development and testing. This data is NOT created for production parishes. Run with `npm run seed:dev`.

---

## Scripture Readings

**File:** `src/lib/onboarding-seeding/content-seed.ts` → `seedReadingsForParish()`

Seeds liturgical scripture readings (public domain Douay-Rheims translation). These are seeded only in development because production parishes will add their own readings.

### First Readings (5 items)

| Citation | Tags | Description |
|----------|------|-------------|
| Genesis 1:26-28, 31a | wedding, first-reading, old-testament | Creation of man and woman |
| Ecclesiastes 3:1-8 | funeral, first-reading, old-testament, comfort | Seasons of life |
| Isaiah 25:6-9 | funeral, first-reading, old-testament, hope | God wiping away tears |
| Sirach 26:1-4, 13-16 | wedding, first-reading, old-testament | A good wife |
| Lamentations 3:17-26 | funeral, first-reading, old-testament, hope, comfort | Hope in suffering |

### Second Readings (5 items)

| Citation | Tags | Description |
|----------|------|-------------|
| Romans 8:31b-35, 37-39 | funeral, second-reading, new-testament, hope, comfort | God's unbreakable love |
| 1 Corinthians 12:31-13:8a | wedding, second-reading, new-testament, love | Love (charity) |
| Colossians 3:12-17 | wedding, second-reading, new-testament, love | Virtues and love |
| 1 John 3:14-16 | funeral, second-reading, new-testament, love, eternal-life | Passing from death to life |
| Revelation 21:1-5a, 6b-7 | funeral, second-reading, new-testament, hope, eternal-life | New heaven and earth |

### Gospel Readings (5 items)

| Citation | Tags | Description |
|----------|------|-------------|
| Matthew 5:1-12a | funeral, gospel, new-testament, hope | The Beatitudes |
| Matthew 19:3-6 | wedding, gospel, new-testament, love | What God has joined together |
| John 11:21-27 | funeral, gospel, new-testament, hope, eternal-life | I am the resurrection |
| John 15:9-12 | wedding, gospel, new-testament, love | Love one another |
| John 14:1-6 | funeral, gospel, new-testament, hope, comfort | I am the way, truth, life |

### Responsorial Psalms (5 items)

| Citation | Tags | Description |
|----------|------|-------------|
| Psalm 23:1-6 | funeral, psalm, old-testament, comfort | The Lord is my shepherd |
| Psalm 33:12, 18-22 | wedding, psalm, old-testament, joy | The earth is full of goodness |
| Psalm 103:1-4, 8, 10, 13-18 | funeral, psalm, old-testament, comfort, hope | The Lord is kind and merciful |
| Psalm 128:1-5 | wedding, psalm, old-testament, family | Blessed are those who fear the Lord |
| Psalm 27:1, 4, 7-9, 13-14 | funeral, psalm, old-testament, hope, comfort | The Lord is my light and salvation |

---

## People

**File:** `scripts/dev-seeders/seed-people.ts`

Creates 20 sample people plus a dev user record for portal access.

| # | First Name | Last Name | Email | Phone | Sex | City | State | Avatar |
|---|------------|-----------|-------|-------|-----|------|-------|--------|
| 1 | John | Doe | john.doe@example.com | (555) 123-4567 | MALE | Austin | TX | fr-josh.webp |
| 2 | Jane | Smith | jane.smith@example.com | (555) 987-6543 | FEMALE | Austin | TX | - |
| 3 | Bob | Johnson | bob.johnson@example.com | (555) 246-8101 | MALE | Round Rock | TX | - |
| 4 | Maria | Garcia | maria.garcia@example.com | (555) 369-1214 | FEMALE | Austin | TX | - |
| 5 | Michael | Chen | michael.chen@example.com | (555) 482-1357 | MALE | Cedar Park | TX | - |
| 6 | Sarah | Williams | sarah.williams@example.com | (555) 159-2634 | FEMALE | Austin | TX | - |
| 7 | David | Martinez | david.martinez@example.com | (555) 753-9514 | MALE | Pflugerville | TX | - |
| 8 | Emily | Taylor | emily.taylor@example.com | (555) 951-7532 | FEMALE | Austin | TX | - |
| 9 | James | Anderson | james.anderson@example.com | (555) 357-1593 | MALE | Georgetown | TX | joe.webp |
| 10 | Lisa | Brown | lisa.brown@example.com | (555) 753-8642 | FEMALE | Austin | TX | - |
| 11 | Robert | Wilson | robert.wilson@example.com | (555) 951-3578 | MALE | Leander | TX | - |
| 12 | Patricia | Moore | patricia.moore@example.com | (555) 159-7534 | FEMALE | Austin | TX | - |
| 13 | Thomas | Lee | thomas.lee@example.com | (555) 357-9512 | MALE | Round Rock | TX | - |
| 14 | Jennifer | White | jennifer.white@example.com | (555) 753-1596 | FEMALE | Austin | TX | - |
| 15 | Christopher | Harris | christopher.harris@example.com | (555) 951-7538 | MALE | Cedar Park | TX | - |
| 16 | Linda | Clark | linda.clark@example.com | (555) 159-3574 | FEMALE | Austin | TX | - |
| 17 | Daniel | Rodriguez | daniel.rodriguez@example.com | (555) 357-7539 | MALE | Pflugerville | TX | - |
| 18 | Barbara | Lewis | barbara.lewis@example.com | (555) 753-9516 | FEMALE | Austin | TX | - |
| 19 | Matthew | Walker | matthew.walker@example.com | (555) 951-1597 | MALE | Georgetown | TX | - |
| 20 | Nancy | Hall | nancy.hall@example.com | (555) 159-7535 | FEMALE | Austin | TX | - |

**Dev User:** A special person record is created with the dev user's email, with parishioner portal access enabled.

---

## Families

**File:** `scripts/dev-seeders/seed-families.ts`

Creates 15 sample families with various structures linking sample people.

| # | Family Name | Status | Members | Primary Contact |
|---|-------------|--------|---------|-----------------|
| 1 | Doe Family | Active | John Doe (Father), Jane Smith (Mother) | John Doe |
| 2 | Johnson Family | Active | Bob Johnson (Father) | Bob Johnson |
| 3 | Garcia-Martinez Family | Active | Maria Garcia (Mother), David Martinez (Father) | Maria Garcia |
| 4 | Chen Family | Active | Michael Chen (Head of Household) | Michael Chen |
| 5 | Williams-Taylor Family | Active | Sarah Williams (Wife), Emily Taylor (Daughter) | Sarah Williams |
| 6 | Anderson Family | Active | James Anderson (Father), Lisa Brown (Mother) | James Anderson |
| 7 | Wilson-Moore Family | Active | Robert Wilson (Husband), Patricia Moore (Wife) | Robert Wilson |
| 8 | Lee Family | Active | Thomas Lee (Father) | Thomas Lee |
| 9 | White-Harris Family | Active | Jennifer White (Mother), Christopher Harris (Father) | Jennifer White |
| 10 | Clark Family | Active | Linda Clark (Head of Household) | Linda Clark |
| 11 | Rodriguez-Lewis Family | Active | Daniel Rodriguez (Husband), Barbara Lewis (Wife) | Daniel Rodriguez |
| 12 | Walker-Hall Family | Active | Matthew Walker (Father), Nancy Hall (Mother) | Matthew Walker |
| 13 | Extended Garcia Family | Active | Maria Garcia (Grandmother) | Maria Garcia |
| 14 | Smith-Johnson Family | **Inactive** | Jane Smith (Mother), Bob Johnson (Stepfather) | Jane Smith |
| 15 | The Browns | Active | Lisa Brown (Head of Household) | Lisa Brown |

---

## Group Memberships

**File:** `scripts/dev-seeders/seed-groups.ts`

Adds sample people to groups created by the onboarding seeder.

| Group | Members |
|-------|---------|
| Parish Council | John Doe (Leader), Jane Smith (Member) |
| Finance Council | Bob Johnson (Coordinator), Maria Garcia (Secretary) |
| Zumba | Michael Chen (Member) |
| Maintenance Committee | John Doe (Member), Maria Garcia (Member) |

---

## Masses

**File:** `scripts/dev-seeders/seed-masses.ts`

Creates 20 sample Masses using the unified event model (8 Sunday, 12 Daily).

### Sunday Masses (8 total)

| # | Date | Time | Liturgical Color | Notes |
|---|------|------|------------------|-------|
| 1 | Next Sunday | 10:00 AM | Green | Children's Mass |
| 2 | Sunday +1 week | 10:00 AM | Green | - |
| 3 | Sunday +2 weeks | 10:00 AM | Green | - |
| 4 | Sunday +3 weeks | 10:00 AM | White | - |
| 5 | Sunday +4 weeks | 10:00 AM | Green | - |
| 6 | Sunday +5 weeks | 10:00 AM | Green | - |
| 7 | Sunday +6 weeks | 10:00 AM | Red | - |
| 8 | Sunday +7 weeks | 10:00 AM | Green | - |

### Daily Masses (12 total)

| # | Time | Liturgical Color |
|---|------|------------------|
| 1-12 | 8:00 AM (weekdays) | Mostly Green, with occasional White/Red |

Each Mass includes:
- Hymn selections (Entrance, Offertory, Communion, Recessional)
- Announcements
- Mass intentions
- Minister assignments (Presider, Lector, EMHC, etc.)

---

## Weddings & Funerals

**File:** `scripts/dev-seeders/seed-weddings-funerals.ts`

Creates 3 Weddings and 3 Funerals with readings from the content library.

### Weddings (3 events)

| # | Bride | Groom | Presider | Date | Time | Notes |
|---|-------|-------|----------|------|------|-------|
| 1 | Jane Smith | John Doe | James Anderson | +45 days | 2:00 PM | Bilingual readings, Unity candle |
| 2 | Maria Garcia | Bob Johnson | James Anderson | +90 days | 11:00 AM | Simple ceremony |
| 3 | Sarah Williams | Michael Chen | James Anderson | +120 days | 3:00 PM | Full Mass with Communion |

### Funerals (3 events)

| # | Deceased | Date of Death | Presider | Funeral Date | Time |
|---|----------|---------------|----------|--------------|------|
| 1 | Robert Wilson | -3 days | James Anderson | +2 days | 10:00 AM |
| 2 | Thomas Lee | -1 day | James Anderson | +5 days | 11:00 AM |
| 3 | Christopher Harris | -5 days | James Anderson | +7 days | 2:00 PM |

Each Wedding and Funeral includes:
- First Reading
- Responsorial Psalm
- Second Reading
- Gospel Reading

---

## Mass Intentions

**File:** `scripts/dev-seeders/seed-mass-intentions.ts`

Creates 12 sample mass intentions with various statuses.

| Category | Count | Status | Description |
|----------|-------|--------|-------------|
| Linked to Calendar Events | 5 | SCHEDULED | Assigned to upcoming Masses |
| Standalone (unassigned) | 5 | Mixed (REQUESTED, SCHEDULED, COMPLETED, CANCELLED) | Awaiting assignment |
| Historical | 2 | COMPLETED | Past intentions |

**Intention Types:**
- For the repose of the soul of...
- For the healing of...
- In thanksgiving for blessings received by...
- For the intentions of...
- For peace and comfort for the family of...
- In memory of...
- For the special intentions of...
- For the health and well-being of...

---

## How to Use This Document

1. **For Development:** Reference specific people, locations, or events when testing features
2. **For Testing:** Know what sample data exists to write meaningful test cases
3. **For Debugging:** Quickly find IDs and relationships between seeded records
4. **For Modification:** Update seeder files to change sample data, then run seeders again

### Running Seeders

```bash
# Run dev seeder (creates all sample data)
npm run seed:dev

# Reset database and run seeders
npm run db:fresh

# Onboarding seeder runs automatically when creating a new parish
```

### Related Files

- Dev seeders: `scripts/dev-seeders/*.ts`
- Onboarding seeders: `src/lib/onboarding-seeding/*.ts`
- Main dev seed script: `scripts/dev-seed.ts`
- Parish seed data: `src/lib/onboarding-seeding/parish-seed-data.ts`
