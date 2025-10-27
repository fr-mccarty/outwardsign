# CLAUDE.md

## Project Description
**Name:** Outward Sign  
**URL:** outwardsign.church  
**Purpose:** Sacrament and Sacramental Management Tool

Plan, Communicate, and Celebrate Sacraments and Sacramentals in a Catholic Parish

**Belief:** The Sacraments are the core activity of the Catholic Parish. Their proper celebration at every step is the evangelizing work of parishes.

**Tactics:**
- Working together as a parish staff and with the participants in the sacrament are essential for the joy of the individuals, and for the beauty for the world
- Communication with the individuals, with the staff, with the support staff, and with the world are part of what make the sacraments beautiful
- Important operational note: Being fully prepared to celebrate a sacrament or a sacramental means having the summary and the script printed off in a binder and in the sacristy for the priest, deacon, or church leader to pick up and take it to action

**Features:**
- Shared Preparation with presider, staff, and family
- Calendarize Events into a .ics feed
- Print and Export Documentation: Readings and Scripts
- Language Management

**Examples:** Wedding Liturgies, Quinceanera, Baptisms, Presentations (Latino), Funerals

## Tech Stack
**Frontend:** Next.js 13+ with App Router  
**Database:** Supabase (PostgreSQL)  
**Authentication:** Supabase Auth with server-side session management  
**API:** Server Actions for secure data operations  
**UI Components:** Radix UI primitives with shadcn/ui styling  
**Icons:** Lucide React  
**Styling:** Tailwind CSS (mobile-first approach)  
**Coding Tool:** Claude Code  
**Deployment:** Vercel

## Architecture

### Data Architecture
**Parish Structure:**
- Each main record everywhere (excluding pivot tables) should have a `parish_id`
- Data is scoped to parishes
- Shared access within team boundaries

**Naming Conventions:**
- Database tables: plural form (e.g., `petitions`, `baptisms`)
- TypeScript interfaces: singular form (e.g., `Petition`, `Baptism`)

### Module Structure Pattern
When creating new modules, follow this consistent structure:

```
src/app/(main)/petitions/           # Module directory (plural name)
├── page.tsx                        # Main list page
├── petition-form.tsx               # Form component (singular-form.tsx)
├── petition-list.tsx               # List component (singular-list.tsx)
├── create/
│   └── page.tsx                    # Create page
└── [id]/
    └── page.tsx                    # Edit page
```

**Key naming conventions:**
- **Module directory:** Use plural form (e.g., `petitions`, `contacts`, `users`)
- **Form component:** Use singular form with `-form` suffix (e.g., `petition-form.tsx`, `contact-form.tsx`)
- **List component:** Use singular form with `-list` suffix (e.g., `petition-list.tsx`, `contact-list.tsx`)
- **Dynamic routes:** Use `[id]` for edit pages
- **Static routes:** Use `create` directory for creation pages

### Authentication Pattern
- Server-side session management using Supabase Auth
- Authentication checks in Server Components
- Automatic redirection for unauthenticated users
- Using Server Actions (Next.js pattern) for data mutations

## Code Conventions

### General
- **Indentation:** 2 spaces
- **Language:** TypeScript for all new files
- **Component type:** Server Components by default, Client Components only when needed

### UI Patterns
- Do not use the system dialog for confirming or alerting the user. Use shadcn components.
- Handling an empty table: make sure there is always a button to create new, unless otherwise specified. Be sure to use the icon which the module is using in the main-sidebar.
- Table content should always be fetched server-side. Pagination should always be available. Use shadcn components.

### Development Guidelines
- **Always use custom components** before falling back to shadcn/ui components
- **Follow TypeScript patterns** established in existing components
- **Maintain responsive design** across all new components
- **Integrate with Supabase Auth** for user-facing features
- **Use consistent design patterns** from existing component library

## Custom Components

### Layout Components

#### MainSidebar Component
**SOURCE:** /examples/components/main-sidebar.tsx  
**DESCRIPTION:** Main application sidebar with navigation and user profile. Provides organized navigation groups for application features with company branding, collapsible sections, and user profile integration.  
**USAGE:** Main navigation component for authenticated application. Requires /Lolek-logo.png in public folder.

#### MainHeader Component
**SOURCE:** /examples/components/main-header.tsx  
**DESCRIPTION:** Main application header with sidebar trigger and breadcrumb navigation. Provides consistent header layout for authenticated application pages with optional sidebar toggle and dynamic breadcrumbs.  
**USAGE:** Place at top of authenticated pages. Pass breadcrumbs array for navigation context.  
**DEPENDENCIES:** shadcn/ui Breadcrumb and Sidebar components

#### PublicHeader Component
**SOURCE:** /examples/components/PublicHeader.jsx  
**DESCRIPTION:** Navigation header for public pages with responsive mobile menu, logo, navigation links, and login button. Handles mobile menu state and provides consistent public page navigation.  
**USAGE:** Place at the top of public layout components. Requires /Lolek-logo.png in public folder.

#### PublicFooter Component
**SOURCE:** /examples/components/PublicFooter.jsx  
**DESCRIPTION:** Simple footer component for public-facing pages with company branding and copyright information. Provides consistent footer layout across all public pages.  
**USAGE:** Place at the bottom of public layout components. No props required.

#### Layout Implementation Notes
**Important:** In actual Next.js implementation, layout files are named `layout.tsx` and placed in specific route groups:
- `app-layout.tsx` → `app/layout.tsx` (root layout)
- `main-layout.jsx` → `app/(main)/layout.tsx` (authenticated layout)  
- `public-layout.jsx` → `app/(public)/layout.tsx` (public layout)

### Container Components

#### PageContainer Component
**SOURCE:** /examples/components/page-container.tsx  
**DESCRIPTION:** Page layout container with optional card wrapper for consistent page layouts. Provides page title, description, and optional card wrapping for form-like content with customizable max-width.  
**USAGE:** Wrap all page content with PageContainer for consistent layout and spacing. Use `useCard={true}` for form pages.

#### CenteredFormCard Component
**SOURCE:** /examples/components/centered-form-card.tsx  
**LANGUAGE:** tsx  
**DESCRIPTION:** Reusable centered card container for forms and content. Provides consistent centered layout with customizable max-width and card styling using shadcn/ui components.  
**USAGE:** Wrap forms or content that need centered card layout. Customize maxWidth for different content sizes.

### Form Components

#### FormField Component
**SOURCE:** /examples/components/form-field.tsx  
**LANGUAGE:** tsx  
**DESCRIPTION:** **MANDATORY** form input component that provides consistent styling, labeling, and behavior for all form inputs. Supports text inputs, textareas, and select dropdowns with built-in label, description, and required field handling.  
**USAGE:** **CRITICAL: Use FormField for ALL form inputs unless you have a specific exception that requires direct input usage (such as search bars, filters, or specialized input patterns). You MUST request permission before using direct Input/Textarea/Select components instead of FormField.**  
**Examples:**
- Text input: `<FormField id="name" label="Full Name" value={name} onChange={setName} required />`
- Textarea: `<FormField id="bio" label="Biography" inputType="textarea" value={bio} onChange={setBio} />`
- Select: `<FormField id="role" label="Role" inputType="select" value={role} onChange={setRole} options={[{value: 'admin', label: 'Administrator'}]} />`

#### Form Example Page
**SOURCE:** /examples/pages/form-example-page.tsx  
**LANGUAGE:** tsx  
**DESCRIPTION:** Comprehensive example demonstrating mandatory FormField component usage for all form inputs. Shows proper patterns for text inputs, selects, textareas, and exception request guidelines.  
**USAGE:** **MANDATORY** reference for all form implementations. Always use FormField for standard form inputs. Copy the state management pattern and form structure. Use the exception request format when FormField doesn't meet specific requirements.

### Navigation Components

#### CollapsibleNavSection Component
**SOURCE:** /examples/components/collapsible-nav-section.tsx  
**LANGUAGE:** tsx  
**DESCRIPTION:** Collapsible navigation section for sidebar menus with expand/collapse animation. Integrates with sidebar context for mobile behavior and supports custom icons and navigation items.  
**USAGE:** Create collapsible navigation sections in sidebars. Pass array of NavItem objects with title, url, and icon.

### Utility Components

#### Loading Component
**SOURCE:** /examples/components/loading.tsx  
**DESCRIPTION:** Flexible loading component with multiple display variants including spinner, skeleton cards, and skeleton lists. Provides consistent loading states throughout the application with customizable size, centering, and styling options.  
**USAGE:** Use for loading states throughout the application. Choose variant based on content type: 'spinner' for general loading, 'skeleton-cards' for card layouts, 'skeleton-list' for list layouts. **CRITICAL: Always place Loading components WITHIN PageContainer, not as a replacement for it.** Use `centered={false}` when inside PageContainer to avoid double-centering. Example: `<PageContainer title="Page Title"><Loading variant="skeleton-cards" centered={false} /></PageContainer>`

#### Loading Example Page
**SOURCE:** /examples/pages/loading-example-page.tsx  
**DESCRIPTION:** Complete example page demonstrating correct usage of Loading components within PageContainer. Shows all three loading variants with interactive switching and proper layout integration.  
**USAGE:** Reference this example when implementing loading states in your pages. Always follow the pattern of Loading components inside PageContainer with proper configuration. Copy the conditional rendering pattern for loading/loaded states.  

#### CopyButton Component
**SOURCE:** /examples/components/copy-button.tsx  
**DESCRIPTION:** Button component for copying text to clipboard with visual feedback. Shows "Copied!" state for 2 seconds after successful copy operation with error handling for clipboard failures.  
**USAGE:** Add copy functionality to any text content. Provide content prop with text to copy.

### EditForm Component
**FILE:** `EditForm.tsx`  
**PURPOSE:** Reusable form component for creating and editing entities  
**USAGE:** Handles both create and update operations with unified interface

**Usage Notes:**
- Pass existing entity for edit mode, omit for create mode
- Follows redirect-to-index pattern after successful creation
- Uses shadcn/ui form components (Button, Input, Textarea, Label)
- Integrates with Server Actions for data operations
- TypeScript interfaces ensure type safety

### ListTable Component
**FILE:** `ListTable.jsx`  
**PURPOSE:** Comprehensive data table with search, filtering, and actions  
**USAGE:** Display lists of entities with CRUD operations

**Features:**
- **Search Functionality:** Real-time search across entity content
- **Responsive Grid:** Card-based layout that adapts to screen size
- **Action Buttons:** Delete operations with confirmation dialogs
- **Empty States:** Helpful messaging when no data exists
- **Toast Integration:** Success/error notifications using toast utilities
- **Date Formatting:** Relative date display (Today, Yesterday, etc.)

**Usage Notes:**
- Requires toast utilities from examples/lib/toast-utils
- Uses shadcn/ui Dialog for confirmation dialogs
- Accepts onUpdate callback for custom refresh logic
- Implements responsive card grid instead of traditional table
- Search functionality with debounced filtering

### Create Page Template
**FILE:** `create-page.tsx`  
**PURPOSE:** Complete page template for entity creation  
**USAGE:** Server component with authentication and proper layout structure

**Usage Notes:**
- Server component with async authentication
- Uses Supabase auth with automatic redirection
- Integrates MainHeader and PageContainer components
- Customizable maxWidth for different content types

### Edit Page Template
**FILE:** `edit-page.jsx`  
**PURPOSE:** Complete page template for entity editing  
**USAGE:** Server component with data fetching and error handling

**Usage Notes:**
- Dynamic route parameter handling with params.noteId
- Error boundaries with notFound() for missing data
- Same form component used for both create and edit
- Proper breadcrumb navigation showing context

### List Page Template
**FILE:** `list-page.jsx`  
**PURPOSE:** Complete page template for entity listing  
**USAGE:** Server component with data loading and table integration

**Usage Notes:**
- Graceful error handling with fallback empty arrays
- Suspense boundaries for loading states
- Wider maxWidth (5xl) for table layouts
- Server component pattern with data fetching


## Known Issues
(Document any existing bugs or performance concerns here)

## Permissions & Automation
(Document things you want to give Claude permission to do automatically)