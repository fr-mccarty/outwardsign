# Mass Module - User Interfaces

> **Purpose:** UI specifications for minister-facing and coordinator-facing interfaces.

## Table of Contents

- [Minister-Facing UI](#minister-facing-ui)
- [Coordinator-Facing UI](#coordinator-facing-ui)

---

## Minister-Facing UI

**Pages to Build:**

### 1. My Ministry Dashboard (`/my-ministry`)
- Overview of upcoming assignments
- Calendar view of my scheduled Masses
- Quick actions: Confirm, Request Substitute
- Notifications/alerts

### 2. My Assignments (`/my-ministry/assignments`)
- List view of upcoming assignments
- Past assignments
- Assignment details (Mass info, role, other ministers)
- Actions: Confirm, Decline, Request Substitute

### 3. My Availability (`/my-ministry/availability`)
- Preference settings form
- Blackout dates calendar
- Role preferences

### 4. Substitute Requests (`/my-ministry/substitutes`)
- Open requests I can fill
- My substitute history
- Accept/decline actions

### 5. My Training (`/my-ministry/training`)
- Certification status
- Training completion dates
- Renewal requirements

---

## Coordinator-Facing UI

**Pages to Build:**

### 1. Mass Schedule (`/masses`)
- Existing list view enhanced with role assignment status
- Color coding: Fully staffed (green), Partially staffed (yellow), Unstaffed (red)
- Quick stats: Unfilled roles, pending confirmations

### 2. Mass Detail/Edit (`/masses/[id]` or `/masses/[id]/edit`)
- Enhanced form with role assignment section
- For each role from template:
  - Show required count
  - Assign people (searchable dropdown)
  - Status badges (confirmed, pending, declined)
  - Quick actions: Notify, Remind, Find Substitute

### 3. Mass Role Assignment Grid (`/masses/[id]/assignments`)
- Table view:
  - Rows: Roles
  - Columns: Assigned person(s), Status, Actions
- Drag-and-drop interface (future)
- Bulk actions: Notify all, Confirm all

### 4. Minister List (`/ministers`)
- Filterable list of all ministers
- Columns: Name, Role Memberships, Recent Assignments, Status
- Actions: View Details, Assign to Mass, Contact

### 5. Minister Detail (`/ministers/[id]`)
- Minister profile
- Role memberships (active/inactive)
- Blackout dates
- Assignment history
- Communication log
- Notes

### 6. Role Membership Management (`/mass-role-members`)
- List people serving in each role
- Filter by role, active status
- Add/remove people from roles
- View blackout dates
- Bulk operations

### 7. Template Management (`/mass-templates`)
- List of templates
- Create/Edit/Clone/Delete templates
- Role requirement builder

### 8. Substitute Management (`/substitutes`)
- Pending substitute requests
- Filter by date, role, status
- Manually assign substitutes
- Communication tools

### 9. Reports (`/reports/masses`)
- Minister participation reports
- Role coverage reports
- No-show tracking
- Communication effectiveness

---

## Related Documentation

- **[MASSES_OVERVIEW.md](./MASSES_OVERVIEW.md)** - Implementation status and priorities
- **[MASSES_ROLE_SYSTEM.md](./MASSES_ROLE_SYSTEM.md)** - Role system details

---

**Last Updated:** 2025-12-02
