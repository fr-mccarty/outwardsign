# ROADMAP.md

> **Development Roadmap**
>
> This document tracks current state, planned features, and the phased development approach for Outward Sign.

---

## Table of Contents

- [Current State](#current-state)
- [Phase I - Foundation (Current)](#phase-i---foundation-current)
- [Phase II - Collaboration & Communication](#phase-ii---collaboration--communication)
- [Phase III - Advanced Features](#phase-iii---advanced-features)
- [Future Considerations](#future-considerations)

---

## Current State

### What Works Now

**Core Modules:**
- ✅ Weddings - Complete liturgy planning with readings, petitions, and scripts
- ✅ Funerals - Full funeral liturgy management
- ✅ Baptisms - Baptism tracking and summary generation
- ✅ Presentations - Latino presentation ceremonies
- ✅ Quinceañeras - Quinceañera celebration planning
- ✅ Masses - Mass scheduling and liturgy planning
- ✅ Mass Intentions - Mass intention tracking and reports

**Support Systems:**
- ✅ People - Parish directory management
- ✅ Events - Event scheduling with date/time/location
- ✅ Locations - Venue management
- ✅ Readings - Scripture reading library
- ✅ Calendar - Calendar view of all events
- ✅ Liturgical Script System - Print, PDF, and Word export

**Authentication & Permissions:**
- ✅ User authentication (Supabase Auth)
- ✅ Parish selection
- ✅ Role-based permissions (super-admin, admin, staff, parishioner)

### Current Limitations

**❌ Team Collaboration (Not Yet Available):**
- Cannot invite team members to the application
- Cannot add staff members to the team
- No structure in place for team member invitations
- Cannot assign specific people to specific events/modules
- No member-level permissions for individual sacraments

**❌ Communication:**
- No email functionality
- No SMS/text messaging
- No automated notifications
- No event reminders

**❌ Ministry Scheduling:**
- Mass roles not yet implemented
- Cannot assign lectors, EMHCs, altar servers to specific masses
- No ministry scheduling for sacraments (weddings, funerals, baptisms, etc.)
- No unified ministry schedule view across all sacraments
- No conflict detection for ministry assignments

---

## Phase I - Foundation (Current)

**Status:** ✅ Mostly Complete

**Completed:**
1. ✅ All 7 primary sacramental modules operational
2. ✅ Liturgical script system with multiple output formats
3. ✅ Basic authentication and parish management
4. ✅ Core data models (people, events, locations, readings)
5. ✅ Calendar integration
6. ✅ Print and export functionality (PDF, Word)

**Remaining Phase I Work:**
- [ ] **Team Member System** - Critical missing piece
  - Database tables for team membership
  - Invitation flow (invite → accept → join parish)
  - Team member list/management UI
  - Permission structure for team roles

**Phase I Goal:** Establish foundation for single-parish usage with basic team structure.

---

## Phase II - Collaboration & Communication

**Status:** 🔜 Planned

**Priority Features:**

### 1. Team Member Invitations (HIGH PRIORITY)

**Problem:** Currently cannot add people to the parish team or invite staff members.

**Solution:**
- Invitation system allowing parish admin to invite team members via email
- Invitation acceptance flow for new users
- Team member management (view, edit, remove)
- Role assignment per team member (admin, staff, etc.)

**Database Requirements:**
- `team_invitations` table (parish_id, email, role, status, token, expires_at)
- `parish_members` or `team_members` table (parish_id, user_id, role, joined_at)
- RLS policies for invitation management

**User Flow:**
1. Admin clicks "Invite Team Member"
2. Enters email address and selects role (admin, staff)
3. System sends invitation email with unique link
4. Recipient clicks link → creates account or signs in → joins parish team
5. Team member appears in parish team list

### 2. Event-Specific Member Assignment

**Problem:** Cannot invite or assign specific people to specific events (weddings, funerals, masses).

**Solution:**
- "Invite to Event" functionality for each module
- Event-specific permissions (view, edit, manage)
- Participant/collaborator distinction:
  - **Team Members** - Parish staff with broad access
  - **Event Collaborators** - Limited access to specific event(s) only

**Use Cases:**
- Invite wedding coordinator to specific wedding (view/edit that wedding only)
- Invite musician to multiple masses (view assigned masses only)
- Invite family member to presentation (view-only access to their child's presentation)
- Invite funeral director to specific funeral (view/edit that funeral only)

**Database Requirements:**
- `event_collaborators` table (event_id, person_id, permission_level, invited_by, invited_at)
- `module_collaborators` table (module_type, module_id, person_id, permission_level)
- RLS policies for scoped access

### 3. Mass Roles Assignment

**Description:** Assign liturgical roles to specific masses.

**Features:**
- Mass role picker (Lector, EMHC, Altar Server, Cantor, Usher, Sacristan, Music Minister)
- Assign multiple people to same mass in different roles
- Mass role schedule view (who is serving when)
- Export mass role schedule (print, PDF)

**Database Requirements:**
- `mass_roles` table (mass_id, person_id, role, notes)
- RLS policies for role assignments

**UI Components:**
- Mass role assignment in mass form
- Mass role schedule report page
- Calendar view showing role assignments

### 4. Ministry Scheduling for Sacraments & Sacramentals

**Description:** Extend ministry role assignment beyond masses to all sacramental celebrations.

**Features:**
- Assign liturgical ministers to weddings, funerals, baptisms, presentations, quinceañeras
- Role types vary by sacrament:
  - **Weddings:** Presider, Deacon, Lector(s), EMHC(s), Altar Server(s), Cantor, Music Minister, Usher
  - **Funerals:** Presider, Deacon, Lector(s), EMHC(s), Altar Server(s), Cantor, Music Minister, Pallbearers
  - **Baptisms:** Presider, Deacon, Lector, Altar Server(s), Cantor, Music Minister
  - **Presentations:** Presider, Deacon, Lector, Music Minister
  - **Quinceañeras:** Presider, Deacon, Lector(s), Altar Server(s), Cantor, Music Minister, Damas, Chambelanes
- Ministry schedule reports by person (who is serving when and where)
- Ministry schedule reports by sacrament type
- Conflict detection (same person scheduled for multiple events at same time)
- Export ministry schedules (print, PDF)

**Database Requirements:**
- Extend existing role tables or create unified `liturgical_roles` table
- Link roles to module types (wedding_id, funeral_id, baptism_id, etc.)
- RLS policies for role assignments across all modules

**UI Components:**
- Ministry assignment in each module's form
- Unified ministry schedule view across all sacraments
- Ministry availability/conflict management
- Calendar integration showing ministry commitments

**Use Cases:**
- Assign regular lector to wedding on Saturday
- Schedule altar servers for funeral on weekday morning
- Assign music minister to multiple quinceañeras in a month
- View all ministry commitments for a specific person across all events

### 5. Communication System (Email & SMS)

**Goal:** Enable communication without requiring expensive services initially.

**Phase II.A - Cost-Free Approach:**

**Option 1: Copy-Paste Email Templates**
- Generate formatted email content in the UI
- User copies content and pastes into their own email client
- No cost, no external services
- Templates for:
  - Wedding preparation emails
  - Funeral coordination
  - Mass role reminders
  - Event confirmations

**Option 2: Calendar (.ics) Files**
- Generate downloadable calendar invitations
- Include event details, location, notes
- Recipients import to their own calendar apps
- Free, universally compatible

**Option 3: Printable Contact Sheets**
- Generate contact lists with phone numbers and emails
- Parish staff can manually send texts/emails
- Export as PDF for easy distribution

**Phase II.B - Automated Communication (Later):**
- Email integration (SendGrid, Mailgun, or similar)
- SMS integration (Twilio or similar)
- Automated reminders and notifications
- Cost considerations: Paid services required
- Future decision based on user demand and budget

### 6. Member Contribution Pathways

**Description:** Allow non-staff members to contribute to parish events without full team access.

**Contribution Types:**
- **Readings Submission** - Parishioners submit favorite scripture readings
- **Petition Suggestions** - Families suggest custom petitions for their events
- **Music Preferences** - Submit music choices for weddings/funerals
- **Photo/Document Upload** - Share photos, programs, or documents related to their event
- **Event Updates** - Family members can update their own event details (limited fields)

**Permission Model:**
- Event-specific "contributor" role
- Can only access their own assigned event
- Limited fields they can edit (preferences, not core liturgy)
- Requires invitation link (no broad signup)

**Implementation:**
- Public-facing form pages with token-based access
- Secure links generated per event
- Submissions reviewed by parish staff before incorporation

---

## Phase III - Advanced Features

**Status:** 🔮 Future

**Potential Features:**
- Multi-parish support (managing multiple parishes from one account)
- Advanced reporting and analytics
- Integration with parish management systems
- Mobile app (iOS/Android)
- Online giving/payment integration
- Automated liturgical calendar generation (multi-year)
- AI-assisted homily suggestions or resource recommendations
- Multilingual interface (full localization beyond English/Spanish)
- Custom module builder (create your own sacramental modules)
- Public event pages (share event details with families via link)

---

## Future Considerations

### Technical Debt
- Confirmations module (currently commented out, needs implementation)
- Test coverage improvements (ongoing)
- Performance optimization for large parishes
- Mobile responsiveness improvements

### User Feedback Integration
- Gather feedback from pilot parishes
- Prioritize features based on actual usage patterns
- Iterate on UX based on real-world workflows

### Scalability
- Multi-tenant architecture considerations
- Database optimization for large datasets
- Caching strategies for improved performance
- CDN for asset delivery

### Business Model
- Pricing structure for paid features (communication, advanced reporting)
- Free tier vs. paid tier feature split
- Sustainability and maintenance funding

---

## Decision Points

### Team Member System (Immediate)

**Decision Required:** How to implement team member invitations?

**Options:**
1. **Simple Email Invitation**
   - Admin enters email + role
   - System sends email with signup/login link
   - User creates account and automatically joins parish

2. **Invitation Code System**
   - Generate unique invitation codes
   - Admin shares code with staff members
   - Staff uses code during signup to join parish

3. **Manual Approval**
   - Staff requests to join via parish lookup
   - Admin approves/denies requests
   - More control, but more friction

**Recommendation:** Option 1 (Simple Email Invitation) - Most streamlined UX, industry standard pattern.

### Communication Approach (Phase II)

**Decision Required:** Start with free options or build paid integration from the start?

**Recommendation:**
- Start with **cost-free options** (templates, calendar files, printable sheets)
- Validate user demand and communication patterns
- Add paid integrations (email/SMS services) in Phase II.B based on actual need
- Avoids upfront costs and commitment before product-market fit

### Member vs. Collaborator Model

**Decision Required:** Should event-specific access be through the same "team member" system or a separate "collaborator" system?

**Recommendation:**
- **Separate systems**:
  - **Team Members** = Parish staff with broad access (invite to parish team)
  - **Event Collaborators** = Event-specific access only (invite to specific wedding/funeral/etc.)
- Different permission models, different UI, different use cases
- Keeps parish team management clean and focused

---

## Notes

- **Phase II is the critical next step** - Without team collaboration, the app is limited to single-user or very small teams
- **Communication features should start simple** - Don't overengineer before understanding usage patterns
- **Event-specific invitations are a key differentiator** - Most parish software doesn't allow granular event-level access
- **Keep cost low initially** - Free-tier options for communication reduce barrier to adoption

---

## Update History

- **2025-01-11** - Added Phase II feature: Ministry Scheduling for Sacraments & Sacramentals
- **2025-01-11** - Renamed from TIMELINE.md to ROADMAP.md for clarity
- **2025-01-11** - Initial document created based on current state and Phase II planning discussions
