# Calendar Components

> **Part of Component Registry** - See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) for the complete component index.

This document covers calendar-related components for date selection and scheduling.

---

## See Also

- **[CALENDAR.md](./CALENDAR.md)** - Calendar module documentation
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Complete component index

---

## Calendar Components

### Calendar System
**Path:** `src/components/calendar/`

**Purpose:** Complete calendar view system for displaying parish events and liturgical calendar.

**Components:**
- `calendar.tsx` - Main calendar container
- `calendar-header.tsx` - Calendar navigation and view switcher
- `calendar-grid.tsx` - Calendar grid layout
- `calendar-day.tsx` - Individual day cell
- `day-events-modal.tsx` - Modal for viewing all events on a day

**Event Item Components:**
Parish events:
- `event-items/parish-event-item-month.tsx` - Parish event display in month view
- `event-items/parish-event-item-week.tsx` - Parish event display in week view
- `event-items/parish-event-item-day.tsx` - Parish event display in day view

Liturgical events:
- `event-items/liturgical-event-item-month.tsx` - Liturgical event in month view
- `event-items/liturgical-event-item-week.tsx` - Liturgical event in week view
- `event-items/liturgical-event-item-day.tsx` - Liturgical event in day view

**Features:**
- Month/week/day views
- Parish events integration
- Liturgical calendar integration
- Event color coding by type
- Click to view event details
- Responsive design
- Scrollable event modals

---

### MiniCalendar
**Path:** `src/components/mini-calendar.tsx`

**Purpose:** Small calendar widget for date selection and navigation.

---

### LiturgicalEventPreview
**Path:** `src/components/liturgical-event-preview.tsx`

**Purpose:** Reusable modal component for displaying comprehensive liturgical event details including colors, readings, grades, seasons, and vigil information. Used across calendar views, mass scheduling, and liturgical event picker fields.

**Features:**
- Visual liturgical color bars and badges
- Complete readings display (first reading, psalm, gospel, etc.)
- Event metadata (grade, season, liturgical year, psalter week)
- Vigil mass information
- Scrollable content with fixed header

**Usage:**
```tsx
import { LiturgicalEventPreview } from '@/components/liturgical-event-preview'

const [previewOpen, setPreviewOpen] = useState(false)
const [selectedEvent, setSelectedEvent] = useState<GlobalLiturgicalEvent | null>(null)

<LiturgicalEventPreview
  open={previewOpen}
  onOpenChange={setPreviewOpen}
  event={selectedEvent}
/>
```

---

