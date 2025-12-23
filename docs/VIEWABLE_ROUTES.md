# Viewable Routes

> **Note:** This document lists the primary viewable routes in Outward Sign. Routes marked with different symbols indicate their rendering strategy.
>
> **Architecture Note:** Outward Sign uses a **unified Event Types system**. Sacraments and parish events (Weddings, Funerals, Baptisms, etc.) are all managed through the Events module with dynamic Event Types.

## Route Legend

| Symbol | Type | Description |
|--------|------|-------------|
| ○ | Static | Prerendered as static content |
| ƒ | Dynamic | Server-rendered on demand |

---

## Authentication

| Route | Type | Description |
|-------|------|-------------|
| `/login` | ○ | User login page |
| `/signup` | ○ | User registration page |

---

## Dashboard & Calendar

| Route | Type | Description |
|-------|------|-------------|
| `/` | ○ | Home/landing page |
| `/dashboard` | ƒ | Main dashboard |
| `/calendar` | ƒ | Parish calendar view |
| `/weekend-summary` | ƒ | Weekend summary view |

---

## Events (Unified System)

All sacraments and parish events are managed through the Events module with dynamic Event Types.

| Route | Type | Description |
|-------|------|-------------|
| `/events` | ƒ | Event list (filterable by Event Type) |
| `/events/create` | ƒ | Event type selector / create event |
| `/events/[event_type_id]/[id]` | ƒ | View event |
| `/events/[event_type_id]/[id]/edit` | ƒ | Edit event |

**Note:** Event Types (Wedding, Funeral, Baptism, Bible Study, etc.) are configured in Settings. Events are accessed via `/events?type=[slug]` for filtered lists.

---

## Mass Management

### Masses

| Route | Type | Description |
|-------|------|-------------|
| `/mass-liturgies` | ƒ | Mass list |
| `/mass-liturgies/create` | ƒ | Create mass |
| `/mass-liturgies/schedule` | ƒ | Mass scheduling wizard |
| `/mass-liturgies/[id]` | ƒ | View mass |
| `/mass-liturgies/[id]/edit` | ƒ | Edit mass |

### Mass Intentions

| Route | Type | Description |
|-------|------|-------------|
| `/mass-intentions` | ƒ | Mass intention list |
| `/mass-intentions/create` | ƒ | Create mass intention |
| `/mass-intentions/[id]` | ƒ | View mass intention |
| `/mass-intentions/[id]/edit` | ƒ | Edit mass intention |
| `/mass-intentions/report` | ƒ | Mass intentions report |

### Mass Rosters

| Route | Type | Description |
|-------|------|-------------|
| `/print/mass-liturgies/[id]/roster` | ƒ | Print mass roster |

---

## People & Families

### People

| Route | Type | Description |
|-------|------|-------------|
| `/people` | ƒ | People list |
| `/people/create` | ƒ | Create person |
| `/people/[id]` | ƒ | View person |
| `/people/[id]/edit` | ƒ | Edit person |

### Families

| Route | Type | Description |
|-------|------|-------------|
| `/families` | ƒ | Family list |
| `/families/create` | ƒ | Create family |
| `/families/[id]` | ƒ | View family |
| `/families/[id]/edit` | ƒ | Edit family |

---

## Groups

| Route | Type | Description |
|-------|------|-------------|
| `/groups` | ƒ | Group list |
| `/groups/[id]` | ƒ | View group (dialog-based editing) |

---

## Locations

| Route | Type | Description |
|-------|------|-------------|
| `/locations` | ƒ | Location list |
| `/locations/create` | ƒ | Create location |
| `/locations/[id]` | ƒ | View location |
| `/locations/[id]/edit` | ƒ | Edit location |

---

## Settings

| Route | Type | Description |
|-------|------|-------------|
| `/settings` | ƒ | Settings hub |

### Event Types

| Route | Type | Description |
|-------|------|-------------|
| `/settings/event-types` | ƒ | Event types list |
| `/settings/event-types/create` | ƒ | Create event type |
| `/settings/event-types/[slug]` | ƒ | View event type |
| `/settings/event-types/[slug]/fields` | ƒ | Event type custom fields |
| `/settings/event-types/[slug]/scripts` | ƒ | Event type scripts |

### Category Tags

| Route | Type | Description |
|-------|------|-------------|
| `/settings/category-tags` | ƒ | Category tag list |
| `/settings/category-tags/create` | ƒ | Create category tag |
| `/settings/category-tags/[id]/edit` | ƒ | Edit category tag |

### Content Library

| Route | Type | Description |
|-------|------|-------------|
| `/settings/content-library` | ƒ | Content library list |
| `/settings/content-library/create` | ƒ | Create content item |
| `/settings/content-library/[id]` | ƒ | View content item |
| `/settings/content-library/[id]/edit` | ƒ | Edit content item |

### Custom Lists

| Route | Type | Description |
|-------|------|-------------|
| `/settings/custom-lists` | ƒ | Custom lists |
| `/settings/custom-lists/create` | ƒ | Create custom list |
| `/settings/custom-lists/[slug]` | ƒ | View/edit custom list |

### Petitions

| Route | Type | Description |
|-------|------|-------------|
| `/settings/petitions` | ƒ | Petitions list |
| `/settings/petitions/create` | ƒ | Create petition |
| `/settings/petitions/default` | ƒ | Default petitions |
| `/settings/petitions/contexts` | ƒ | Petition contexts |
| `/settings/petitions/[id]` | ƒ | View petition |
| `/settings/petitions/[id]/edit` | ƒ | Edit petition |

### Parish Settings

| Route | Type | Description |
|-------|------|-------------|
| `/settings/parish/general` | ƒ | Parish general settings |
| `/settings/parish/users` | ƒ | Parish users management |
| `/settings/parish/mass-intentions` | ƒ | Mass intentions settings |
| `/settings/parish/petitions` | ƒ | Parish petitions settings |

### User Settings

| Route | Type | Description |
|-------|------|-------------|
| `/settings/user` | ƒ | User preferences |

---

## Documentation

| Route | Type | Description |
|-------|------|-------------|
| `/documentation` | ƒ | Documentation home |
| `/documentation/[...path]` | ƒ | Documentation pages |

---

## Parishioner Portal

| Route | Type | Description |
|-------|------|-------------|
| `/parishioner` | ƒ | Parishioner portal home |
| `/parishioner/calendar` | ƒ | Parishioner calendar |
| `/parishioner/chat` | ƒ | Parishioner AI chat |
| `/parishioner/notifications` | ƒ | Parishioner notifications |

---

## Onboarding

| Route | Type | Description |
|-------|------|-------------|
| `/onboarding` | ƒ | Onboarding start |
| `/onboarding/create` | ƒ | Create parish |
| `/onboarding/join` | ƒ | Join parish |
| `/onboarding/join/[invitationId]` | ƒ | Accept invitation |
| `/onboarding/pending` | ƒ | Pending approval |
| `/select-parish` | ○ | Select parish |

---

## Print Views

| Route | Type | Description |
|-------|------|-------------|
| `/print/mass-liturgies/[id]` | ƒ | Print mass |
| `/print/events/[type]/[id]` | ƒ | Print event |
| `/print/weekend-summary` | ƒ | Print weekend summary |

---

## Support & Testing

| Route | Type | Description |
|-------|------|-------------|
| `/support` | ƒ | Support page |
| `/testing` | ƒ | Testing utilities |
| `/testing/pickers` | ƒ | Picker component testing |
| `/tests/error` | ƒ | Error state testing |
| `/tests/loading` | ƒ | Loading state testing |

---

## Route Summary

| Category | Count |
|----------|-------|
| Authentication | 2 |
| Dashboard & Calendar | 4 |
| Events (unified system) | 4 |
| Mass Management | 8 |
| People & Families | 8 |
| Groups | 2 |
| Locations | 4 |
| Settings | 25 |
| Documentation | 2 |
| Parishioner Portal | 4 |
| Onboarding | 6 |
| Print Views | 3 |
| Support & Testing | 5 |
| **Total Viewable Routes** | **~77** |
