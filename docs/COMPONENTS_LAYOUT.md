# Layout & Navigation Components

> **Part of Component Registry** - See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) for the complete component index.

This document covers layout components, navigation components, and context providers that structure pages and provide global functionality.

---

## See Also

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Application architecture and component communication
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Complete component index

---

## Layout Components

### PageContainer
**Path:** `src/components/page-container.tsx`

**Purpose:** Standard page wrapper with consistent padding and max-width.

**Usage:**
```tsx
<PageContainer>
  <h1>Page Title</h1>
  {/* Page content */}
</PageContainer>
```

---

### BreadcrumbSetter
**Path:** `src/components/breadcrumb-setter.tsx`

**Purpose:** Client component that sets breadcrumbs in context. Returns null (invisible).

**Props:**
- `breadcrumbs`: Array of `{label, href}` objects

**Usage:**
```tsx
// In server component
const breadcrumbs = [
  { label: 'Weddings', href: '/weddings' },
  { label: wedding.id, href: `/weddings/${wedding.id}` }
]

<BreadcrumbSetter breadcrumbs={breadcrumbs} />
```

---

### MainSidebar
**Path:** `src/components/main-sidebar.tsx`

**Purpose:** Application navigation sidebar with module links and icons.

**Module Icons (Source of Truth):**
- Weddings: `VenusAndMars`
- Funerals: `Cross`
- Baptisms: `Droplet`
- Presentations: `HandHeartIcon`
- Quinceañeras: `BookHeart`
- Confirmations: `Flame`

---

## Navigation & Layout Components

### CollapsibleNavSection
**Path:** `src/components/collapsible-nav-section.tsx`

**Purpose:** Collapsible navigation section for sidebar.

---

### ParishSwitcher
**Path:** `src/components/parish-switcher.tsx`

**Purpose:** Dropdown for switching between parishes (multi-parish support).

---

### ParishUserMenu
**Path:** `src/components/parish-user-menu.tsx`

**Purpose:** User menu dropdown with profile and logout options.

---

### MainHeader
**Path:** `src/components/main-header.tsx`

**Purpose:** Application header with breadcrumbs and user menu.

---

### UserProfile
**Path:** `src/components/user-profile.tsx`

**Purpose:** User profile display component.

---

## Context Providers

### BreadcrumbContext
**Path:** `src/components/breadcrumb-context.tsx`

**Purpose:** React context for managing breadcrumb state across the application.

---

### ThemeProvider
**Path:** `src/components/theme-provider.tsx`

**Purpose:** Theme provider for dark mode support (wraps next-themes).

---

