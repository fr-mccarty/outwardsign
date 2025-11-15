# Module Registry

> **Purpose:** Central reference for all modules in Outward Sign, including routes, labels, and internationalization.
>
> **Note:** This registry preserves module metadata that was previously in `constants.ts` but is kept here for documentation and future i18n needs.

---

## Table of Contents

- [Primary Modules](#primary-modules)
- [Supporting Modules](#supporting-modules)
- [Module Labels (Internationalization)](#module-labels-internationalization)
- [Module Icons](#module-icons)
- [Module Routes](#module-routes)

---

## Primary Modules

**Primary modules** are the core sacramental and liturgical modules in Outward Sign. Each primary module follows the standard 9-file architecture pattern.

### List of Primary Modules

1. **Weddings** - Wedding celebrations and ceremonies
2. **Funerals** - Funeral liturgies and services
3. **Baptisms** - Baptism celebrations
4. **Presentations** - Presentation of children in the temple (Latino tradition)
5. **Quinceañeras** - Quinceañera celebrations
6. **Masses** - Mass celebrations
7. **Mass Intentions** - Mass intention requests and tracking

### Planned Modules (Not Yet Implemented)

- **Confirmations** - Confirmation celebrations

---

## Supporting Modules

**Supporting modules** provide foundational data and functionality for primary modules. Some use different architectural patterns.

1. **People** - Parish directory and person management
2. **Events** - Event scheduling and calendar
3. **Locations** - Parish locations and venues
4. **Groups** - Ministry groups and teams (uses dialog-based architecture)
5. **Readings** - Scripture readings for liturgies
6. **Petitions** - Prayer intentions and petitions

---

## Module Labels (Internationalization)

All module labels are provided in **English** and **Spanish** for internationalization support.

### Primary Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **Weddings** | Weddings | Bodas |
| **Funerals** | Funerals | Funerales |
| **Baptisms** | Baptisms | Bautismos |
| **Presentations** | Presentations | Presentaciones |
| **Quinceañeras** | Quinceañeras | Quinceañeras |
| **Masses** | Masses | Misas |
| **Mass Intentions** | Mass Intentions | Intenciones de Misa |

### Supporting Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **People** | People | Personas |
| **Events** | Events | Eventos |
| **Locations** | Locations | Ubicaciones |
| **Groups** | Groups | Grupos |
| **Readings** | Readings | Lecturas |
| **Petitions** | Petitions | Peticiones |

### Planned Module Labels

| Module | English | Spanish |
|--------|---------|---------|
| **Confirmations** | Confirmations | Confirmaciones |

---

## Module Icons

Each module uses a consistent icon throughout the application. All icons are from **Lucide React**.

| Module | Icon Component | Visual |
|--------|---------------|--------|
| **Weddings** | `VenusAndMars` | ⚤ |
| **Funerals** | `Cross` | ✝ |
| **Baptisms** | `Droplet` | 💧 |
| **Presentations** | `HandHeartIcon` | 🤲 |
| **Quinceañeras** | `BookHeart` | 📖 |
| **Masses** | `CirclePlus` | ⊕ |
| **Mass Intentions** | `Heart` | ❤️ |
| **People** | `Users` | 👥 |
| **Events** | `Calendar` | 📅 |
| **Locations** | `MapPin` | 📍 |
| **Groups** | `Users` | 👥 |

**Source of Truth:** The main sidebar (`src/components/main-sidebar.tsx`) defines the official icon for each module.

---

## Module Routes

### Primary Module Routes

| Module | Route | Pattern |
|--------|-------|---------|
| **Weddings** | `/weddings` | `/weddings`, `/weddings/create`, `/weddings/[id]`, `/weddings/[id]/edit` |
| **Funerals** | `/funerals` | `/funerals`, `/funerals/create`, `/funerals/[id]`, `/funerals/[id]/edit` |
| **Baptisms** | `/baptisms` | `/baptisms`, `/baptisms/create`, `/baptisms/[id]`, `/baptisms/[id]/edit` |
| **Presentations** | `/presentations` | `/presentations`, `/presentations/create`, `/presentations/[id]`, `/presentations/[id]/edit` |
| **Quinceañeras** | `/quinceaneras` | `/quinceaneras`, `/quinceaneras/create`, `/quinceaneras/[id]`, `/quinceaneras/[id]/edit` |
| **Masses** | `/masses` | `/masses`, `/masses/create`, `/masses/[id]`, `/masses/[id]/edit` |
| **Mass Intentions** | `/mass-intentions` | `/mass-intentions`, `/mass-intentions/create`, `/mass-intentions/[id]`, `/mass-intentions/[id]/edit` |

### Supporting Module Routes

| Module | Route | Pattern |
|--------|-------|---------|
| **People** | `/people` | `/people`, `/people/create`, `/people/[id]`, `/people/[id]/edit` |
| **Events** | `/events` | `/events`, `/events/create`, `/events/[id]`, `/events/[id]/edit` |
| **Locations** | `/locations` | `/locations`, `/locations/create`, `/locations/[id]`, `/locations/[id]/edit` |
| **Groups** | `/groups` | `/groups`, `/groups/[id]` (no separate edit page, uses dialogs) |
| **Readings** | `/readings` | `/readings`, `/readings/create`, `/readings/[id]/edit` |
| **Petitions** | `/petitions` | `/petitions` |

### Special Routes

| Purpose | Route | Description |
|---------|-------|-------------|
| **Calendar** | `/calendar` | Parish calendar view |
| **Dashboard** | `/dashboard` | Main dashboard after login |
| **Settings** | `/settings/*` | User and parish settings |
| **Onboarding** | `/onboarding` | New user onboarding flow |

---

## Module Route Patterns

All primary modules follow the **standard 9-file architecture** with these route patterns:

1. **List** - `/[module-plural]` - Shows all entities with filters
2. **Create** - `/[module-plural]/create` - Create new entity
3. **View** - `/[module-plural]/[id]` - View entity details
4. **Edit** - `/[module-plural]/[id]/edit` - Edit entity
5. **Print** - `/print/[module-plural]/[id]` - Print-optimized view
6. **PDF Export** - `/api/[module-plural]/[id]/pdf` - Download PDF
7. **Word Export** - `/api/[module-plural]/[id]/word` - Download Word document

**Exception:** Groups module uses dialog-based editing instead of separate edit pages.

---

## Module Database Tables

| Module | Database Table | Singular Form |
|--------|---------------|---------------|
| **Weddings** | `weddings` | `wedding` |
| **Funerals** | `funerals` | `funeral` |
| **Baptisms** | `baptisms` | `baptism` |
| **Presentations** | `presentations` | `presentation` |
| **Quinceañeras** | `quinceaneras` | `quinceanera` |
| **Masses** | `masses` | `mass` |
| **Mass Intentions** | `mass_intentions` | `mass_intention` |
| **People** | `people` | `person` |
| **Events** | `events` | `event` |
| **Locations** | `locations` | `location` |
| **Groups** | `groups` | `group` |
| **Readings** | `individual_readings` | `individual_reading` |
| **Petitions** | `petitions` | `petition` |

**Naming Convention:**
- Database tables: plural form (e.g., `weddings`, `baptisms`)
- Database columns: singular form (e.g., `note`, not `notes`)
- TypeScript interfaces: singular form (e.g., `Wedding`, `Baptism`)

---

## Adding a New Module

When creating a new module, ensure it's documented in this registry:

1. Add to appropriate section (Primary or Supporting)
2. Add bilingual labels (English + Spanish)
3. Add icon reference (Lucide React component)
4. Add route patterns
5. Add database table name
6. Update main sidebar (`src/components/main-sidebar.tsx`)
7. Follow MODULE_CHECKLIST.md for implementation

---

## Related Documentation

- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Step-by-step guide for creating new modules
- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - Implementation patterns for module files
- **[CLAUDE.md](../CLAUDE.md)** - Main development guide with module architecture

---

## Liturgical Roles

Liturgical roles are used in the Groups module for assigning people to ministry roles.

### Role Values

These constants are defined in `src/lib/constants.ts`:
- `ROLE_VALUES` - Array of role constants
- `ROLE_LABELS` - Bilingual labels for each role
- `LiturgicalRole` - TypeScript type

### Available Roles

| Role | English | Spanish |
|------|---------|---------|
| **LECTOR** | Lector | Lector |
| **EMHC** | Extraordinary Minister of Holy Communion | Ministro Extraordinario de la Comunión |
| **ALTAR_SERVER** | Altar Server | Monaguillo |
| **CANTOR** | Cantor | Cantor |
| **USHER** | Usher | Ujier |
| **SACRISTAN** | Sacristan | Sacristán |
| **MUSIC_MINISTER** | Music Minister | Ministro de Música |

**Usage:**
```typescript
import { ROLE_VALUES, ROLE_LABELS, type LiturgicalRole } from '@/lib/constants'

// Display role in select dropdown
<FormField
  inputType="select"
  options={ROLE_VALUES.map(role => ({
    value: role,
    label: ROLE_LABELS[role].en  // or .es for Spanish
  }))}
/>
```

---

## Future Internationalization

This registry preserves all module labels in multiple languages to support future internationalization efforts. When implementing language selection:

1. Import labels from this registry or from `constants.ts`
2. Use user's selected language to display appropriate label
3. Maintain consistency across all modules
4. Follow bilingual patterns established here

**Example Implementation:**
```typescript
// Future i18n pattern
const selectedLanguage = getUserLanguage() // 'en' or 'es'
const moduleLabel = MODULE_LABELS.WEDDINGS[selectedLanguage]
```
