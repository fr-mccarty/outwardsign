# Roadmap

> **Development Roadmap for Outward Sign**
>
> This document tracks current state, in-progress work, planned features, and the phased development approach.

**Last Updated:** 2025-01-15

---

## Table of Contents

- [Current State](#current-state)
- [🚧 In Progress](#-in-progress)
- [Phase I - Foundation](#phase-i---foundation)
- [Phase II - Collaboration & Communication](#phase-ii---collaboration--communication)
- [Phase III - Advanced Features](#phase-iii---advanced-features)
- [🐛 Known Issues & Technical Debt](#-known-issues--technical-debt)
- [🎨 UI/UX Improvements](#-uiux-improvements)
- [🧪 Testing](#-testing)
- [📝 Documentation](#-documentation)
- [Future Considerations](#future-considerations)
- [Decision Points](#decision-points)
- [Update History](#update-history)

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
- ✅ Groups - Ministry and group management
- ✅ Calendar - Calendar view of all events
- ✅ Liturgical Script System - Print, PDF, and Word export

**Authentication & Permissions:**
- ✅ User authentication (Supabase Auth)
- ✅ Parish selection
- ✅ Role-based permissions (super-admin, admin, staff, parishioner)

**Technical Foundation:**
- ✅ Dark mode support
- ✅ Bilingual content (English/Spanish)
- ✅ Liturgical calendar integration (2025-2026)
- ✅ Automated test infrastructure
- ✅ RLS policies for parish-scoped data

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
- Mass roles not yet implemented (see [MASSES.md](./MASSES.md) for detailed roadmap)
- Cannot assign lectors, EMHCs, altar servers to specific masses
- No ministry scheduling for sacraments (weddings, funerals, baptisms, etc.)
- No unified ministry schedule view across all sacraments
- No conflict detection for ministry assignments

### Recently Completed

**2025-01-18:**
- [x] Fixed liturgical color rendering in calendar views
  - Updated `getLiturgicalBgClass` and `getLiturgicalTextClass` to use explicit class maps
  - Ensured Tailwind can see all liturgical color classes at build time
  - Fixed text color display for all liturgical colors including white
- [x] Resolved FormField dark mode issue (no actual issue found)
  - Verified custom FormField components use semantic tokens correctly
  - Documented rule: Never edit `src/components/ui/` (shadcn components)
- [x] Added Automated Mass Scheduling System section to roadmap
  - Comprehensive wizard design with 6 steps
  - Algorithm considerations and implementation phases

**2025-01-15:**
- [x] Completed renderer structure migration
  - Migrated all 29 occurrences of deprecated `multi-part-text` to specific element types
  - Removed `MultiPartTextElement` from type system
  - Cleaned up all three renderers (HTML, PDF, Word)
  - Updated documentation (RENDERER.md, LITURGICAL_SCRIPT_REFERENCE.md)

**2025-11-15:**
- [x] Fixed Zod v4 compatibility across all forms (error.issues vs error.errors)
- [x] Updated validation documentation with Zod v4 guidance
- [x] Created comprehensive MASSES.md documentation
- [x] Verified build passes successfully

**2025-11-10:**
- [x] Created docs folder for documentation organization
- [x] Moved all capitalized MD files to docs
- [x] Updated all documentation references in CLAUDE.md and README.md
- [x] Created FORMS.md with comprehensive form guidelines
- [x] Added Component Registry section to CLAUDE.md
- [x] Improved EventPicker and PeoplePicker components
- [x] Added LocationPicker component

**Earlier:**
- [x] Implemented Weddings module (reference implementation)
- [x] Implemented Funerals module
- [x] Implemented Baptisms module
- [x] Implemented Presentations module
- [x] Implemented Quinceañeras module
- [x] Added liturgical calendar integration (2025-2026)
- [x] Implemented dark mode support
- [x] Created test infrastructure with automatic setup/cleanup
- [x] Added PDF/Word export functionality
- [x] Implemented parish-scoped data with RLS

---

## 🚧 In Progress

### Masses Module
- [ ] Complete Mass roles implementation (see [MASSES.md](./MASSES.md) Phase 1)
- [ ] Add role picker for mass participants
- [ ] Role assignment UI in Mass form
- [ ] Basic notification system (email templates)
- [ ] Minister confirmation workflow
- [ ] Template role configuration UI
- [ ] Minister directory

### Form Validation
- [ ] Implement React Hook Form integration for new forms
- [ ] Add client-side validation with Zod across all forms
- [ ] Ensure server-side validation in all server actions

---

## Phase I - Foundation

**Status:** ✅ Mostly Complete

**Completed:**
1. ✅ All 7 primary sacramental modules operational
2. ✅ Liturgical script system with multiple output formats
3. ✅ Basic authentication and parish management
4. ✅ Core data models (people, events, locations, readings)
5. ✅ Calendar integration
6. ✅ Print and export functionality (PDF, Word)

**Remaining Phase I Work:**

### Team Member System (CRITICAL)
- [ ] Database tables for team membership
- [ ] Invitation flow (invite → accept → join parish)
- [ ] Team member list/management UI
- [ ] Permission structure for team roles

### ~~Core Module Completions~~ (EXCLUDED)

**⚠️ EXCLUDED FROM ROADMAP - User Decision 2025-11-17**

These modules are explicitly excluded and should NOT be created:
- ❌ ~~**Confirmations Module**~~ - EXCLUDED
- ❌ ~~**First Communion Module**~~ - EXCLUDED
- ❌ ~~**Anointing of the Sick**~~ - EXCLUDED
- ❌ ~~**Reconciliation Preparation**~~ - EXCLUDED

**Reason:** Focus on existing modules and collaboration features. Current module coverage (Weddings, Funerals, Baptisms, Presentations, Quinceañeras, Masses, Mass Intentions) is sufficient.

### Multilingual Support
- [ ] Complete Spanish translations for all modules
- [ ] Add language selector throughout app
- [ ] Liturgical content in multiple languages
- [ ] Bilingual print outputs

**Phase I Goal:** Establish foundation for single-parish usage with basic team structure.

---

## Phase II - Collaboration & Communication

**Status:** 🔜 Planned

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

**Description:** Assign liturgical roles to specific masses (see [MASSES.md](./MASSES.md) for complete implementation plan).

**Features:**
- Mass role picker (Lector, EMHC, Altar Server, Cantor, Usher, Sacristan, Music Minister)
- Assign multiple people to same mass in different roles
- Mass role schedule view (who is serving when)
- Export mass role schedule (print, PDF)
- Substitute request workflow
- Minister preference management
- Auto-assignment algorithm (Phase 3)

**Database Requirements:**
- `mass_roles` table (mass_id, person_id, role, notes)
- `minister_preferences` table
- `minister_blackout_dates` table
- `mass_role_substitutions` table
- RLS policies for role assignments

**UI Components:**
- Mass role assignment in mass form
- Mass role schedule report page
- Minister self-service portal
- Calendar view showing role assignments

### 3.5. Automated Mass Scheduling System (Wizard)

**Description:** A systematic, automated approach to assign ministers to multiple masses over a time period based on their preferences, availability, and group memberships.

**Problem:** Manually assigning ministers to each mass individually is time-consuming and error-prone. Parish schedulers need to:
- Consider minister preferences (which masses, which roles)
- Respect availability and blackout dates
- Balance workload fairly across ministers
- Account for group assignments (e.g., all altar servers from Youth Group)
- Schedule multiple masses at once (e.g., entire month or liturgical season)

**Solution:** Multi-step wizard that guides the scheduler through configuration and generates assignments automatically.

**Wizard Steps:**

**Step 1: Date Range Selection**
- Select start and end dates for scheduling period
- Option to select by: Custom range, Month, Liturgical season, or Specific masses
- Display all masses within selected range
- Allow filtering by mass time, location, or type
- Show count of masses to be scheduled

**Step 2: Role Configuration**
- Select which roles to schedule (Lector, EMHC, Altar Server, etc.)
- Set quantity needed per role (e.g., 2 Lectors, 4 EMHCs per mass)
- Option to use Mass Role Templates for consistent role patterns
- Preview role requirements across all selected masses

**Step 3: Minister Pool Selection**
- Select ministers available for scheduling (individual or by group)
- Filter by role capability (only show qualified ministers per role)
- View minister preferences and availability at a glance
- Option to include/exclude specific ministers
- Display minister stats (availability, recent assignments, blackout dates)

**Step 4: Scheduling Rules & Preferences**
- **Distribution Rules:**
  - Minimize consecutive assignments (e.g., don't assign same person 2 weeks in a row)
  - Maximum assignments per minister per period
  - Preferred frequency per minister (weekly, bi-weekly, monthly)
  - Fair distribution algorithm (balance workload)
- **Priority Rules:**
  - Respect minister preferences (preferred masses, preferred roles)
  - Honor blackout dates (vacations, unavailability)
  - Group assignments (schedule youth group together for certain masses)
  - Avoid conflicts with other parish commitments
- **Fallback Behavior:**
  - What to do if insufficient ministers available
  - Option to leave slots empty vs. over-assign

**Step 5: Review & Adjust**
- Display generated schedule in calendar/table view
- Highlight potential issues:
  - Unfilled roles (insufficient ministers)
  - Over-assigned ministers (exceeds preferences)
  - Conflicts with blackout dates
  - Unbalanced distribution
- Manual override capability:
  - Drag-and-drop to reassign
  - Swap ministers between masses
  - Add/remove assignments
  - Lock specific assignments (won't change on re-generate)
- Re-generate button (recalculates with same rules)

**Step 6: Finalize & Notify**
- Review summary statistics:
  - Total assignments per minister
  - Coverage percentage (filled roles vs. total needed)
  - Distribution fairness score
- Bulk publish assignments to calendar
- Generate notification list (ministers to contact)
- Option to send notifications immediately or copy templates
- Export schedule (PDF, CSV, print)

**Database Requirements:**
- `mass_scheduling_sessions` - Save wizard progress and rules
- `minister_preferences` - Role preferences, frequency preferences, preferred masses
- `minister_blackout_dates` - Unavailability periods
- `minister_groups` - Group memberships for bulk scheduling
- `mass_roles` - Generated assignments
- `scheduling_rules` - Parish-level default rules

**Algorithm Considerations:**
- **Constraint satisfaction problem** - Some rules are hard constraints (blackout dates), others are soft (preferences)
- **Fair distribution** - Track assignment counts, rotate through minister pool
- **Preference scoring** - Weight assignments by how well they match minister preferences
- **Conflict detection** - Check for overlapping commitments across all modules
- **Iterative improvement** - Allow re-generation with adjustments

**UI/UX Considerations:**
- Wizard should feel guided but flexible
- Allow saving draft schedules (don't commit until finalized)
- Visual feedback on schedule quality (coverage %, fairness score)
- Quick filters and search in review step
- Undo/redo capability for manual adjustments
- Compare multiple generated schedules side-by-side

**Implementation Phases:**

**Phase 1: Basic Wizard (Manual with Assistance)**
- Wizard UI for date range, role selection, minister pool
- Display all masses and roles in table/calendar view
- Manual assignment with validation (prevent conflicts, respect blackout dates)
- Save and publish schedule

**Phase 2: Semi-Automated Suggestions**
- Algorithm suggests assignments based on availability
- Show "suggested" vs "assigned" states
- User reviews and accepts/modifies suggestions
- Re-generate suggestions as needed

**Phase 3: Fully Automated Scheduling**
- Complete algorithm with preference scoring and fair distribution
- Automatic conflict resolution with fallback strategies
- Iterative improvement based on user adjustments
- Learn from past schedules (ML-enhanced suggestions)

**Related Features:**
- Minister self-service portal (update preferences, mark unavailability)
- Group management (assign ministers to groups for bulk scheduling)
- Scheduling history (view past schedules, copy patterns)
- Recurring schedule templates (use last month's pattern)

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
- Email integration (SendGrid, Mailgun, AWS SES)
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

### 7. Calendar & Scheduling Improvements
- [ ] Liturgical calendar integration improvements
- [ ] Add Spanish language liturgical events (2025, 2026)
- [ ] Parish calendar view (monthly, weekly, daily)
- [ ] Event conflict detection
- [ ] Recurring event support
- [ ] Calendar export improvements (.ics format)

### 8. User Management
- [ ] Parish team management interface
- [ ] Role assignment UI (super-admin, admin, staff, parishioner)
- [ ] User permissions management
- [ ] Parishioner self-service portal

---

## Phase III - Advanced Features

**Status:** 🔮 Future

### Reporting & Analytics
- [ ] Sacrament statistics dashboard
- [ ] Annual sacrament reports
- [ ] Participant tracking over time
- [ ] Export reports to PDF/Excel
- [ ] Minister participation reports
- [ ] Role coverage reports
- [ ] No-show tracking and analytics

### Advanced Liturgical Features
- [ ] **Parish Default Module Templates** - Allow parishes to set default liturgical script templates per module (e.g., default to "Full Script - English" for weddings, "Bilingual" for presentations)
  - Per-module template preferences in parish settings
  - Template defaults applied when creating new records
  - Override capability on individual records
  - Templates: Simple/Full Script, English/Spanish/Bilingual variations
- [ ] Custom liturgy templates builder
- [ ] Document version history
- [ ] AI-powered scheduling suggestions for ministry roles
- [ ] Integration with liturgical calendar API for automatic Mass creation
- [ ] Template sharing marketplace

### Advanced Collaboration
- [ ] Real-time collaboration (multiple coordinators editing simultaneously)
- [ ] Version history for Mass assignments and sacramental records
- [ ] Advanced search functionality across all modules
- [ ] Bulk operations for multiple records

### Integrations
- [ ] Church management system integrations
- [ ] Donor management integration
- [ ] Google Calendar sync
- [ ] Outlook Calendar sync
- [ ] Zoom/video conferencing integration

### Mobile & Performance
- [ ] Progressive Web App (PWA) enhancements
- [ ] Offline support
- [ ] Mobile-optimized views
- [ ] Native mobile app (iOS/Android)

### Multi-Parish & Enterprise
- [ ] Multi-parish support (managing multiple parishes from one account)
- [ ] Multi-parish coordination (for shared ministers)
- [ ] Parish network features
- [ ] Diocesan-level administration

### Advanced Features
- [ ] Online giving/payment integration
- [ ] Automated liturgical calendar generation (multi-year)
- [ ] AI-assisted homily suggestions or resource recommendations
- [ ] Multilingual interface (full localization beyond English/Spanish)
- [ ] Custom module builder (create your own sacramental modules)
- [ ] Public event pages (share event details with families via link)
- [ ] Minister appreciation/recognition system

---

## 🐛 Known Issues & Technical Debt

### High Priority
- [ ] Review and fix any RLS policy gaps
- [ ] Test authentication flow edge cases
- [ ] Validate all foreign key relationships

### Medium Priority
- [ ] Improve loading states across modules
- [ ] Add better error messages
- [ ] Optimize database queries for large datasets
- [ ] Review and improve mobile responsiveness

### Low Priority
- [ ] Clean up console warnings
- [ ] Optimize bundle size
- [ ] Add skeleton loaders to more pages

### Code Quality
- [ ] Review and refactor large components
- [ ] Extract reusable patterns
- [ ] Remove unused code/dependencies
- [ ] Standardize error handling
- [ ] Improve type safety across codebase

### Performance
- [ ] Optimize image loading
- [ ] Add pagination to large lists
- [ ] Implement virtual scrolling where needed
- [ ] Review and optimize re-renders
- [ ] Add caching strategies

### Database
- [ ] Review and optimize database indexes
- [ ] Add database query monitoring
- [ ] Optimize N+1 query patterns
- [ ] Review and improve RLS policies performance

---

## 🎨 UI/UX Improvements

### Design System
- [ ] Review and standardize spacing patterns
- [ ] Ensure all components follow dark mode guidelines
- [ ] Add consistent empty states across all modules
- [ ] Improve loading skeleton designs

### User Experience
- [ ] Add keyboard shortcuts for power users
- [ ] Improve form autosave functionality
- [ ] Add inline editing where appropriate
- [ ] Better error recovery in forms
- [ ] Add success animations/feedback

### Accessibility
- [ ] Complete ARIA labels audit
- [ ] Test with screen readers
- [ ] Keyboard navigation improvements
- [ ] Color contrast verification
- [ ] Focus indicator improvements
- [ ] Screen reader optimization
- [ ] High contrast mode support

---

## 🧪 Testing

### Test Coverage
- [ ] Add tests for Masses module
- [ ] Add tests for new picker components (MassPicker, RolePicker, GlobalLiturgicalEventPicker)
- [ ] Increase test coverage to >80%
- [ ] Add integration tests for critical workflows
- [ ] Add visual regression tests

### Test Infrastructure
- [ ] Improve test performance
- [ ] Add test data factories
- [ ] Document testing patterns
- [ ] Add CI/CD pipeline

---

## 📝 Documentation

### User Documentation
- [ ] Create user guide for parish staff
- [ ] Add video tutorials for common workflows
- [ ] Create onboarding documentation
- [ ] Document best practices for each module

### Developer Documentation
- [ ] Add API documentation
- [ ] Document server actions patterns
- [ ] Add architecture diagrams
- [ ] Document testing strategies
- [ ] Add contribution guidelines

### Technical Documentation
- [ ] Document deployment process
- [ ] Add database schema documentation
- [ ] Document backup/restore procedures
- [ ] Add monitoring/logging guidelines

---

## Future Considerations

### Technical Scalability
- Multi-tenant architecture considerations
- Database optimization for large datasets
- Caching strategies for improved performance
- CDN for asset delivery

### Business Model
- Pricing structure for paid features (communication, advanced reporting)
- Free tier vs. paid tier feature split
- Sustainability and maintenance funding

### User Feedback Integration
- Gather feedback from pilot parishes
- Prioritize features based on actual usage patterns
- Iterate on UX based on real-world workflows

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

### Priority Legend
- **High Priority** - Blocking issues, critical features, security concerns
- **Medium Priority** - Important improvements, user-requested features
- **Low Priority** - Nice-to-have enhancements, polish items

### Task Management
- Use checkboxes `[ ]` for pending tasks, `[x]` for completed tasks
- Add dates when tasks are completed
- Archive completed sections periodically
- Review and update priorities monthly

### Key Insights
- **Phase II is the critical next step** - Without team collaboration, the app is limited to single-user or very small teams
- **Communication features should start simple** - Don't overengineer before understanding usage patterns
- **Event-specific invitations are a key differentiator** - Most parish software doesn't allow granular event-level access
- **Keep cost low initially** - Free-tier options for communication reduce barrier to adoption

### Contributing
When adding new roadmap items:
1. Place in appropriate section (Phase I/II/III or specific category)
2. Be specific about what needs to be done
3. Add context if needed (why it's important)
4. Link to related issues, discussions, or detailed docs (e.g., [MASSES.md](./MASSES.md))
5. Assign priority level

---

## Update History

- **2025-11-17** - Excluded 4 sacramental modules from roadmap (Confirmations, First Communion, Anointing, Reconciliation) per user decision
- **2025-11-17** - Note: Time estimates should NOT be included in future roadmap updates per user preference
- **2025-01-15** - Completed renderer migration (removed deprecated multi-part-text element)
- **2025-01-15** - Added Parish Default Module Templates feature to Phase III roadmap
- **2025-11-15** - Merged TIMELINE.md into ROADMAP.md for comprehensive single-source roadmap
- **2025-11-15** - Added Zod v4 compatibility fixes to Recently Completed
- **2025-11-15** - Added MASSES.md documentation to Recently Completed
- **2025-11-11** - Added Phase II feature: Ministry Scheduling for Sacraments & Sacramentals
- **2025-11-11** - Renamed from TIMELINE.md to ROADMAP.md for clarity
- **2025-11-11** - Initial document created based on current state and Phase II planning discussions
