# CLAUDE.md

## Project Description
Name: Outward Sign
URL: outwardsign.church
Outward Sign is a Sacrament and Sacramental Management Tool
Plan, Communicate, Celebrate Sacraments and Sacramentals in a Catholic Parish

Belief: The Sacraments are the core activity of the Catholic Parish.  Their proper celebration at every step are the evangelizing work of parishes.

Tactics:
-Working together as a parish staff and with the participants in the sacrament are essential for the joy of the individuals, and for the beauty for the world
-Communication with the individuals, with the staff, with the support staff, and with the world are part of what make the sacraments beautiful
-Important operational note: Being fully prepared to celebrate a sacrament or a sacramental means having the summary and the script printed off in a binder and in the sacristy for the priest, deacon, or church leader to pick up and take it to action. 

Features:
-Shared Preparation with presider, staff, and family
-Calendarize Events into a .ics feed
-Pring andd Export Documentation: Readings and Scripts
-Language Management

Example: Wedding Liturgies, Quinceanera, Baptisms, Presentations (Latino), Funerals, 

## Tech Stack
Frontend: Next.js
Database: Supabase and Postgres
Coding Tool: Claude Code
Deployment: Vercel

## Code Conventions
Indentation: 2 spaces

Do not use the system dialog for confirming or for alerting the user.  Use shadcn components.

Handling an empty table: make sure there is always a button to create new, unless otherwise specified.  Be sure to use the icon which the module is using in the main-sidebar.

Table content should always be fetched server-side.  Pagination should always be available.  use shadcn components

Formatting rules, naming conventions, indentation preferences

## Project Structure
outwardsign-church/
├── CLAUDE.md
├── README.md
├── public/
│   ├── next.svg
│   ├── vercel.svg
│   ├── file.svg
│   ├── globe.svg
│   └── window.svg
├── supabase/
│   └── migrations/
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── (main)/
    │   │   └── baptisms/
    │   │       ├── page.tsx
    │   │       ├── [id]/
    │   │       │   └── page.tsx
    │   │       └── create/
    │   │           └── page.tsx
    │   ├── (public)/
    │   │   ├── login/
    │   │   └── signup/
    │   ├── accept-invitation/
    │   ├── select-parish/
    │   ├── print/
    │   │   └── readings-print/
    │   └── api/
    │       └── invitations/
    ├── components/
    │   └── ui/
    ├── contexts/
    │   └── AppContextProvider.tsx
    ├── hooks/
    │   ├── use-mobile.ts
    │   └── use-parish-settings.ts
    └── lib/
        ├── constants.ts
        ├── petition-context-utils.ts
        ├── template-utils.ts
        ├── types.ts
        ├── utils.ts
        ├── actions/
        │   └── calendar.ts
        ├── auth/
        │   ├── jwt-claims.ts
        │   └── parish.ts
        └── supabase/
            ├── client.ts
            ├── server.ts
            └── middleware.ts

## Important Notes
Authentication methods, API patterns, state management approaches
using Server actions (Next.js pattern)

## Things that I want to give Claude permission to do automatically


## Known Issues
Any existing bugs or performance concerns Claudecode

## Custom Components
TITLE: PublicFooter Component
DESCRIPTION: Simple footer component for public-facing pages with company branding and copyright information. Provides consistent footer layout across all public pages.
SOURCE: /examples/components/PublicFooter.jsx
USAGE: Place at the bottom of public layout components. No props required.

TITLE: PublicHeader Component
DESCRIPTION: Navigation header for public pages with responsive mobile menu, logo, navigation links, and login button. Handles mobile menu state and provides consistent public page navigation.
SOURCE: /examples/components/PublicHeader.jsx
USAGE: Place at the top of public layout components. Requires /Lolek-logo.png in public folder.

TITLE: CenteredFormCard Component
DESCRIPTION: Reusable centered card container for forms and content. Provides consistent centered layout with customizable max-width and card styling using shadcn/ui components.
SOURCE: /examples/components/centered-form-card.tsx
LANGUAGE: tsx
USAGE: Wrap forms or content that need centered card layout. Customize maxWidth for different content sizes.

TITLE: FormField Component
DESCRIPTION: **MANDATORY** form input component that provides consistent styling, labeling, and behavior for all form inputs. Supports text inputs, textareas, and select dropdowns with built-in label, description, and required field handling.
SOURCE: /examples/components/form-field.tsx
LANGUAGE: tsx
USAGE: **CRITICAL: Use FormField for ALL form inputs unless you have a specific exception that requires direct input usage (such as search bars, filters, or specialized input patterns). You MUST request permission before using direct Input/Textarea/Select components instead of FormField.** 
Examples:
- Text input: `<FormField id="name" label="Full Name" value={name} onChange={setName} required />`
- Textarea: `<FormField id="bio" label="Biography" inputType="textarea" value={bio} onChange={setBio} />`
- Select: `<FormField id="role" label="Role" inputType="select" value={role} onChange={setRole} options={[{value: 'admin', label: 'Administrator'}]} />`

TITLE: Form Example Page
DESCRIPTION: Comprehensive example demonstrating mandatory FormField component usage for all form inputs. Shows proper patterns for text inputs, selects, textareas, and exception request guidelines.
SOURCE: /examples/pages/form-example-page.tsx
LANGUAGE: tsx
USAGE: **MANDATORY** reference for all form implementations. Always use FormField for standard form inputs. Copy the state management pattern and form structure. Use the exception request format when FormField doesn't meet specific requirements.

TITLE: CollapsibleNavSection Component
DESCRIPTION: Collapsible navigation section for sidebar menus with expand/collapse animation. Integrates with sidebar context for mobile behavior and supports custom icons and navigation items.
SOURCE: /examples/components/collapsible-nav-section.tsx
LANGUAGE: tsx
USAGE: Create collapsible navigation sections in sidebars. Pass array of NavItem objects with title, url, and icon.

TITLE: CopyButton Component
DESCRIPTION: Button component for copying text to clipboard with visual feedback. Shows "Copied!" state for 2 seconds after successful copy operation with error handling for clipboard failures.
SOURCE: /examples/components/copy-button.tsx
USAGE: Add copy functionality to any text content. Provide content prop with text to copy.

TITLE: Loading Component
DESCRIPTION: Flexible loading component with multiple display variants including spinner, skeleton cards, and skeleton lists. Provides consistent loading states throughout the application with customizable size, centering, and styling options.
SOURCE: /examples/components/loading.tsx
USAGE: Use for loading states throughout the application. Choose variant based on content type: 'spinner' for general loading, 'skeleton-cards' for card layouts, 'skeleton-list' for list layouts. **CRITICAL: Always place Loading components WITHIN PageContainer, not as a replacement for it.** Use `centered={false}` when inside PageContainer to avoid double-centering. Example: `<PageContainer title="Page Title"><Loading variant="skeleton-cards" centered={false} /></PageContainer>`

TITLE: Loading Example Page
DESCRIPTION: Complete example page demonstrating correct usage of Loading components within PageContainer. Shows all three loading variants with interactive switching and proper layout integration.
SOURCE: /examples/pages/loading-example-page.tsx
USAGE: Reference this example when implementing loading states in your pages. Always follow the pattern of Loading components inside PageContainer with proper configuration. Copy the conditional rendering pattern for loading/loaded states.
DEPENDENCIES: PageContainer component, Loading component, shadcn/ui Button

TITLE: MainHeader Component
DESCRIPTION: Main application header with sidebar trigger and breadcrumb navigation. Provides consistent header layout for authenticated application pages with optional sidebar toggle and dynamic breadcrumbs.
SOURCE: /examples/components/main-header.tsx
LANGUAGE: tsx
USAGE: Place at top of authenticated pages. Pass breadcrumbs array for navigation context.
DEPENDENCIES: shadcn/ui Breadcrumb and Sidebar components

TITLE: MainSidebar Component
DESCRIPTION: Main application sidebar with navigation and user profile. Provides organized navigation groups for application features with company branding, collapsible sections, and user profile integration.
SOURCE: /examples/components/main-sidebar.tsx
USAGE: Main navigation component for authenticated application. Requires /Lolek-logo.png in public folder.

TITLE: PageContainer Component
DESCRIPTION: Page layout container with optional card wrapper for consistent page layouts. Provides page title, description, and optional card wrapping for form-like content with customizable max-width.
SOURCE: /examples/components/page-container.tsx
USAGE: Wrap page content for consistent layout. Use cardTitle prop to wrap content in centered card.

TITLE: UserProfile Component
DESCRIPTION: User profile dropdown with authentication integration for Supabase. Displays user avatar with email initials, dropdown menu with settings and logout functionality, and handles loading states.
SOURCE: /examples/components/user-profile.tsx
USAGE: Place in sidebar footer or header for user authentication features. Requires Supabase configuration.

TITLE: AppContextProvider Component
DESCRIPTION: Application context provider that wraps the entire app with global state management. Provides centralized state for user authentication, application settings, and shared data across components using React Context API.
SOURCE: /examples/contexts/AppContextProvider.tsx
USAGE: Wrap your entire application with this provider in your root layout or _app.tsx file. Access state and methods using useAppContext hook.


TITLE: Component System Architecture
DESCRIPTION: Overview of component architecture, navigation patterns, and implementation guidelines for custom components.

## Component System Overview
This documentation covers the component architecture used in application development, focusing on:
- Navigation components (MainHeader, Sidebar, Breadcrumbs)
- Layout patterns and integration workflows  
- Common implementation problems and their solutions
- Best practices for component development

## MainHeader Component Architecture
The primary navigation header that appears at the top of every page includes:
- **Sidebar toggle button** - Controls sidebar open/close state
- **Breadcrumb navigation** - Shows current page hierarchy  
- **Responsive layout** - Adapts to different screen sizes

## Breadcrumb System
A dynamic navigation system that:
- **Updates automatically** when pages load via useEffect hooks
- **Supports dynamic content** (user names, IDs, etc.)
- **Follows configuration** defined in breadcrumbConfig.js
- **Integrates with React Context** for state management

## Integration Pattern
Every page in the main folder should follow this pattern:
1. **Import MainLayout** - Provides consistent header/sidebar structure
2. **Set up breadcrumbs** - Use useEffect to configure page hierarchy
3. **Handle cleanup** - Clear breadcrumbs when component unmounts



TITLE: Technology Stack Details
DESCRIPTION: Comprehensive technology stack and development guidelines for Next.js applications with Supabase integration.

## Frontend Stack
- **Framework**: Next.js 15 (App Router) - See [Next.js documentation](../nextjs/) for implementation details
- **Language**: TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS for utility-first styling
- **Components**: shadcn/ui components - See [shadcn/ui documentation](../shadcn/) for usage patterns

## Project Structure
```
src/
├── app/                     # Next.js App Router
│   ├── (main)/             # Main app route group
│   │   ├── layout.tsx      # Main layout wrapper
│   │   └── contacts/       # Contacts feature
│   │       ├── page.tsx    # Contact list
│   │       ├── [id]/       # Dynamic contact detail
│   │       └── create/     # Create new contact
│   ├── (public)/           # Public routes group
│   │   ├── layout.tsx      # Public layout
│   │   ├── page.tsx        # Public homepage
│   │   └── about/          # About page
│   └── (print)/            # Print-specific routes
├── components/             # Reusable components
└── lib/                    # Utility functions
```

## Module Structure Pattern
When creating new modules, follow this consistent structure pattern:

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

Key naming conventions:
- **Module directory**: Use plural form (e.g., `petitions`, `contacts`, `users`)
- **Form component**: Use singular form with `-form` suffix (e.g., `petition-form.tsx`, `contact-form.tsx`)
- **List component**: Use singular form with `-list` suffix (e.g., `petition-list.tsx`, `contact-list.tsx`)
- **Dynamic routes**: Use `[id]` for edit pages
- **Static routes**: Use `create` directory for creation pages

## Backend Stack
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **Authentication**: Supabase Auth with server-side session management
- **API**: Server Actions for secure data operations

## UI Library
- **Component System**: Radix UI primitives with shadcn/ui styling
- **Icons**: Lucide React for consistent iconography
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Development Guidelines
- **Always use custom components** before falling back to shadcn/ui components
- **Follow TypeScript patterns** established in existing components
- **Maintain responsive design** across all new components
- **Integrate with Supabase Auth** for user-facing features
- **Use consistent design patterns** from existing component library


## Environment Setup
- Next.js 13+ with App Router
- Tailwind CSS configured
- shadcn/ui components library
- Supabase client configuration
- Lucide React icons package




TITLE: Data Architecture Guidelines
DESCRIPTION: Data architecture patterns and database design guidelines for scalable applications.

## App Structure

### Parish Structure
- Each main record everywhere (excluding pivot tables) should have a `parish_id`
- Data is scoped to parishes
- Shared access within team boundaries

TITLE: Layout Components
DESCRIPTION: Complete layout system providing application structure for different page types. Includes root layout with theming, authenticated main layout with sidebar, and public layout for marketing pages.

**Important**: In actual Next.js implementation, these files are named `layout.tsx` and placed in specific route groups:
- `app-layout.tsx` → `app/layout.tsx` (root layout)
- `main-layout.jsx` → `app/(main)/layout.tsx` (authenticated layout)  
- `public-layout.jsx` → `app/(public)/layout.tsx` (public layout)


TITLE: Page Components
DESCRIPTION: Complete CRUD page templates and components for building data management interfaces. Includes list tables, edit forms, and page templates with authentication, search, filtering, and responsive design.
SOURCE: /examples/pages/

## EditForm Component
**File**: `EditForm.tsx`
**Purpose**: Reusable form component for creating and editing entities
**Usage**: Handles both create and update operations with unified interface

### Usage Notes
- Pass existing entity for edit mode, omit for create mode
- Follows redirect-to-index pattern after successful creation
- Uses shadcn/ui form components (Button, Input, Textarea, Label)
- Integrates with Server Actions for data operations
- TypeScript interfaces ensure type safety

## ListTable Component
**File**: `ListTable.jsx`
**Purpose**: Comprehensive data table with search, filtering, and actions
**Usage**: Display lists of entities with CRUD operations

### Features
- **Search Functionality**: Real-time search across entity content
- **Responsive Grid**: Card-based layout that adapts to screen size
- **Action Buttons**: Delete operations with confirmation dialogs
- **Empty States**: Helpful messaging when no data exists
- **Toast Integration**: Success/error notifications using toast utilities
- **Date Formatting**: Relative date display (Today, Yesterday, etc.)

### Usage Notes
- Requires toast utilities from examples/lib/toast-utils
- Uses shadcn/ui Dialog for confirmation dialogs
- Accepts onUpdate callback for custom refresh logic
- Implements responsive card grid instead of traditional table
- Search functionality with debounced filtering

## Create Page Template
**File**: `create-page.tsx`
**Purpose**: Complete page template for entity creation
**Usage**: Server component with authentication and proper layout structure


### Usage Notes
- Server component with async authentication
- Uses Supabase auth with automatic redirection
- Integrates MainHeader and PageContainer components
- Customizable maxWidth for different content types

## Edit Page Template
**File**: `edit-page.jsx`
**Purpose**: Complete page template for entity editing
**Usage**: Server component with data fetching and error handling


### Usage Notes
- Dynamic route parameter handling with params.noteId
- Error boundaries with notFound() for missing data
- Same form component used for both create and edit
- Proper breadcrumb navigation showing context

## List Page Template
**File**: `list-page.jsx`
**Purpose**: Complete page template for entity listing
**Usage**: Server component with data loading and table integration


### Usage Notes
- Graceful error handling with fallback empty arrays
- Suspense boundaries for loading states
- Wider maxWidth (5xl) for table layouts
- Server component pattern with data fetching

## CRUD Implementation Pattern

### Complete CRUD Structure
```
app/notes/
├── page.tsx                  # Main list page
├── note-form.tsx            # Form component
├── note-list.tsx            # List component
├── create/
│   └── page.tsx             # Create page
├── [id]/
│   └── page.tsx             # Edit page
└── actions.ts               # Server actions
```