# TODO

> Project task tracking for Outward Sign

**Last Updated:** 2025-11-10

---

## 🚧 In Progress

### Masses Module
- [ ] Complete Masses module implementation
- [ ] Add Mass intentions functionality
- [ ] Integrate global liturgical event picker
- [ ] Add role picker for mass participants
- [ ] Test mass creation and editing workflows
- [ ] Add mass list view with filters
- [ ] Create print view for mass schedules

### Form Validation
- [ ] Implement React Hook Form integration
- [ ] Add client-side validation with Zod
- [ ] Add server-side validation in all server actions
- [ ] Test validation across all forms

---

## 📋 Planned Features

### Core Modules
- [ ] **Confirmations Module** - Implement confirmation sacrament tracking
- [ ] **First Communion Module** - Add first communion preparation workflow
- [ ] **Anointing of the Sick** - Track anointing sacrament celebrations
- [ ] **Reconciliation Preparation** - Manage first reconciliation preparation

### Calendar & Scheduling
- [ ] Liturgical calendar integration improvements
- [ ] Add Spanish language liturgical events (2025, 2026)
- [ ] Parish calendar view (monthly, weekly, daily)
- [ ] Event conflict detection
- [ ] Recurring event support
- [ ] Calendar export improvements (.ics format)

### Communication & Notifications
- [ ] Email notifications for event reminders
- [ ] SMS notifications (optional)
- [ ] Staff assignment notifications
- [ ] Family communication templates
- [ ] Print reminder cards/letters

### Reporting & Analytics
- [ ] Sacrament statistics dashboard
- [ ] Annual sacrament reports
- [ ] Participant tracking over time
- [ ] Export reports to PDF/Excel

### Multilingual Support
- [ ] Complete Spanish translations for all modules
- [ ] Add language selector throughout app
- [ ] Liturgical content in multiple languages
- [ ] Bilingual print outputs

### User Management
- [ ] Parish team management interface
- [ ] Role assignment UI (super-admin, admin, staff, parishioner)
- [ ] User permissions management
- [ ] Parishioner self-service portal

---

## 🐛 Known Issues

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

## 🔧 Technical Debt

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

## 🚀 Future Enhancements

### Advanced Features
- [ ] Custom liturgy templates builder
- [ ] Document version history
- [ ] Advanced search functionality
- [ ] Bulk operations for multiple records
- [ ] Import/export parish data

### Integrations
- [ ] Church management system integrations
- [ ] Donor management integration
- [ ] Google Calendar sync
- [ ] Outlook Calendar sync
- [ ] Zoom/video conferencing integration

### Mobile
- [ ] Progressive Web App (PWA) enhancements
- [ ] Offline support
- [ ] Mobile-optimized views
- [ ] Native mobile app (future consideration)

---

## 📌 Notes

### Priority Legend
- **High Priority** - Blocking issues, critical features, security concerns
- **Medium Priority** - Important improvements, user-requested features
- **Low Priority** - Nice-to-have enhancements, polish items

### Task Management
- Use checkboxes `[ ]` for pending tasks, `[x]` for completed tasks
- Add dates when tasks are completed
- Archive completed sections periodically
- Review and update priorities monthly

### Contributing
When adding new TODOs:
1. Place in appropriate section
2. Be specific about what needs to be done
3. Add context if needed (why it's important)
4. Link to related issues or discussions
5. Assign priority level

---

## ✅ Recently Completed

### 2025-11-10
- [x] Created docs folder for documentation organization
- [x] Moved all capitalized MD files to docs
- [x] Updated all documentation references in CLAUDE.md and README.md
- [x] Created FORMS.md with comprehensive form guidelines
- [x] Added Component Registry section to CLAUDE.md
- [x] Improved EventPicker and PeoplePicker components
- [x] Added LocationPicker component

### Earlier
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
