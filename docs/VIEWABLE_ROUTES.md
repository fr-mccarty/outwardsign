# Viewable Routes

> **Note:** This content is generated from the `npm run build` process output. Routes marked with different symbols indicate their rendering strategy. Last updated: 2025-12-12.

## Route Legend

| Symbol | Type | Description |
|--------|------|-------------|
| ○ | Static | Prerendered as static content |
| ƒ | Dynamic | Prerendered as static HTML (uses 'loading' UI for dynamic server-rendering) |
| λ | Dynamic | Server-rendered on demand |

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

---

## Sacraments & Sacramentals

### Weddings

| Route | Type | Description |
|-------|------|-------------|
| `/weddings` | ƒ | Wedding list |
| `/weddings/create` | ƒ | Create wedding |
| `/weddings/[id]` | ƒ | View wedding |
| `/weddings/[id]/edit` | ƒ | Edit wedding |

### Baptisms

| Route | Type | Description |
|-------|------|-------------|
| `/baptisms` | ƒ | Baptism list |
| `/baptisms/create` | ƒ | Create baptism |
| `/baptisms/[id]` | ƒ | View baptism |
| `/baptisms/[id]/edit` | ƒ | Edit baptism |

### Funerals

| Route | Type | Description |
|-------|------|-------------|
| `/funerals` | ƒ | Funeral list |
| `/funerals/create` | ƒ | Create funeral |
| `/funerals/[id]` | ƒ | View funeral |
| `/funerals/[id]/edit` | ƒ | Edit funeral |

### Quinceañeras

| Route | Type | Description |
|-------|------|-------------|
| `/quinces` | ƒ | Quinceañera list |
| `/quinces/create` | ƒ | Create quinceañera |
| `/quinces/[id]` | ƒ | View quinceañera |
| `/quinces/[id]/edit` | ƒ | Edit quinceañera |

### Presentations

| Route | Type | Description |
|-------|------|-------------|
| `/presentations` | ƒ | Presentation list |
| `/presentations/create` | ƒ | Create presentation |
| `/presentations/[id]` | ƒ | View presentation |
| `/presentations/[id]/edit` | ƒ | Edit presentation |

---

## Mass Management

### Masses

| Route | Type | Description |
|-------|------|-------------|
| `/masses` | ƒ | Mass list |
| `/masses/create` | ƒ | Create mass |
| `/masses/[id]` | ƒ | View mass |
| `/masses/[id]/edit` | ƒ | Edit mass |

### Mass Intentions

| Route | Type | Description |
|-------|------|-------------|
| `/mass-intentions` | ƒ | Mass intention list |
| `/mass-intentions/create` | ƒ | Create mass intention |
| `/mass-intentions/[id]` | ƒ | View mass intention |
| `/mass-intentions/[id]/edit` | ƒ | Edit mass intention |
| `/mass-intentions/report` | ƒ | Mass intentions report |

### Mass Roles

| Route | Type | Description |
|-------|------|-------------|
| `/mass-roles` | ƒ | Mass role list |
| `/mass-roles/create` | ƒ | Create mass role |
| `/mass-roles/[id]` | ƒ | View mass role |
| `/mass-roles/[id]/edit` | ƒ | Edit mass role |

### Mass Role Members

| Route | Type | Description |
|-------|------|-------------|
| `/mass-role-members` | ƒ | Mass role members scheduling |

### Mass Role Templates

| Route | Type | Description |
|-------|------|-------------|
| `/mass-role-templates` | ƒ | Mass role template list |
| `/mass-role-templates/create` | ƒ | Create mass role template |
| `/mass-role-templates/[id]` | ƒ | View mass role template |
| `/mass-role-templates/[id]/edit` | ƒ | Edit mass role template |

### Mass Times Templates

| Route | Type | Description |
|-------|------|-------------|
| `/mass-times-templates` | ƒ | Mass times template list |
| `/mass-times-templates/create` | ƒ | Create mass times template |
| `/mass-times-templates/[id]` | ƒ | View mass times template |
| `/mass-times-templates/[id]/edit` | ƒ | Edit mass times template |

---

## Events

| Route | Type | Description |
|-------|------|-------------|
| `/events` | ƒ | Event list |
| `/events/create` | ƒ | Create event |
| `/events/[id]` | ƒ | View event |
| `/events/[id]/edit` | ƒ | Edit event |

---

## People & Groups

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

### Groups

| Route | Type | Description |
|-------|------|-------------|
| `/groups` | ƒ | Group list |
| `/groups/create` | ƒ | Create group |
| `/groups/[id]` | ƒ | View group |
| `/groups/[id]/edit` | ƒ | Edit group |

---

## Locations

| Route | Type | Description |
|-------|------|-------------|
| `/locations` | ƒ | Location list |
| `/locations/create` | ƒ | Create location |
| `/locations/[id]` | ƒ | View location |
| `/locations/[id]/edit` | ƒ | Edit location |

---

## Reports

| Route | Type | Description |
|-------|------|-------------|
| `/sacramental-report` | ƒ | Sacramental report builder |

---

## Settings

| Route | Type | Description |
|-------|------|-------------|
| `/settings` | ƒ | Settings overview |

### Event Types

| Route | Type | Description |
|-------|------|-------------|
| `/settings/event-types` | ƒ | Event types list |
| `/settings/event-types/create` | ƒ | Create event type |
| `/settings/event-types/[slug]` | ƒ | View/edit event type |
| `/settings/event-types/[slug]/form-builder` | ƒ | Event type form builder |

### Category Tags

| Route | Type | Description |
|-------|------|-------------|
| `/settings/category-tags` | ƒ | Category tag list |
| `/settings/category-tags/create` | ƒ | Create category tag |
| `/settings/category-tags/[id]` | ƒ | View category tag |
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
| `/settings/custom-lists/[id]` | ƒ | View custom list |
| `/settings/custom-lists/[id]/edit` | ƒ | Edit custom list |

### Petitions

| Route | Type | Description |
|-------|------|-------------|
| `/settings/petitions/default` | ƒ | Default petitions |
| `/settings/petitions/contexts` | ƒ | Petition contexts |

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
| `/parishioner/chat` | ƒ | Parishioner chat |
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
| `/onboarding/select` | ○ | Select parish |

---

## Print Views

| Route | Type | Description |
|-------|------|-------------|
| `/print/[module]/[id]` | λ | Print view for any module |

---

## Development/Testing

| Route | Type | Description |
|-------|------|-------------|
| `/testing` | ƒ | Testing utilities page |
| `/testing/pickers` | ƒ | Picker component testing |
| `/tests/error` | ƒ | Error state testing |
| `/tests/loading` | ƒ | Loading state testing |

---

## Route Summary

| Category | Count |
|----------|-------|
| Authentication | 2 |
| Dashboard & Calendar | 3 |
| Sacraments (Weddings, Baptisms, Funerals, Quinces, Presentations) | 20 |
| Mass Management | 24 |
| Events | 4 |
| People & Groups | 12 |
| Locations | 4 |
| Reports | 1 |
| Settings | 17 |
| Documentation | 2 |
| Parishioner Portal | 4 |
| Onboarding | 6 |
| Print Views | 1 |
| Development/Testing | 4 |
| **Total Viewable Routes** | **104** |
