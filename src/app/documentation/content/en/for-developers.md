# Contributing to Outward Sign

Thank you for your interest in contributing to Outward Sign! This project is built by Catholics for the Catholic community, and we welcome contributions from developers who want to help parishes celebrate beautiful liturgies.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Understanding the Codebase](#understanding-the-codebase)
- [Finding Issues to Work On](#finding-issues-to-work-on)
- [Contribution Workflow](#contribution-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Getting Help](#getting-help)

---

## Getting Started

### Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** package manager
- **Git** for version control
- A **GitHub account**
- **Supabase CLI** (for database work)
- Basic knowledge of **TypeScript**, **React**, and **Next.js**

### Tech Stack

Outward Sign is built with modern web technologies:

- **Frontend:** Next.js 15+ with App Router, React, TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **UI Components:** Radix UI primitives with shadcn/ui
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Testing:** Playwright for end-to-end tests
- **Deployment:** Vercel

---

## Development Environment Setup

### 1. Fork and Clone the Repository

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/outwardsign.git
cd outwardsign

# Add upstream remote to stay in sync
git remote add upstream https://github.com/CatholicOS/outwardsign.git
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Contact the maintainers for development database credentials or set up your own Supabase project.

### 4. Run Database Migrations

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push
```

### 5. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application running.

---

## Understanding the Codebase

### Project Structure

```
outwardsign/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (main)/       # Authenticated routes
│   │   ├── documentation/# Public documentation
│   │   └── api/          # API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities and server actions
│   │   ├── actions/      # Server actions (database operations)
│   │   ├── auth/         # Authentication utilities
│   │   └── supabase/     # Supabase client
│   └── types/            # TypeScript type definitions
├── supabase/
│   └── migrations/       # Database migration files
├── tests/                # Playwright tests
├── docs/                 # Developer documentation
└── CLAUDE.md             # Main development guide
```

### Key Files to Read

Before contributing, familiarize yourself with:

1. **[CLAUDE.md](https://github.com/CatholicOS/outwardsign/blob/main/CLAUDE.md)** - Main development guide with architecture patterns
2. **[docs/FORMS.md](https://github.com/CatholicOS/outwardsign/blob/main/docs/FORMS.md)** - Form implementation patterns
3. **[docs/MODULE_CHECKLIST.md](https://github.com/CatholicOS/outwardsign/blob/main/docs/MODULE_CHECKLIST.md)** - Guide for creating new modules
4. **[docs/TESTING_GUIDE.md](https://github.com/CatholicOS/outwardsign/blob/main/docs/TESTING_GUIDE.md)** - Testing patterns and requirements

### Module Architecture

Outward Sign is organized into **modules** (Weddings, Funerals, Baptisms, Masses, etc.). Each module follows a consistent 9-file pattern:

1. List Page (Server)
2. List Client Component
3. Create Page (Server)
4. View Page (Server)
5. Edit Page (Server)
6. Form Wrapper Component
7. Unified Form Component
8. View Client Component
9. Form Actions Component

See the **Wedding module** (`src/app/(main)/weddings/`) as the reference implementation.

---

## Finding Issues to Work On

### Good First Issues

Look for issues labeled `good first issue` on our [GitHub Issues page](https://github.com/CatholicOS/outwardsign/issues). These are beginner-friendly tasks with clear requirements.

### Areas That Need Help

- **Bilingual Content:** Improving Spanish translations
- **Documentation:** Writing user guides and tutorials
- **Testing:** Adding test coverage for features
- **Bug Fixes:** Addressing reported bugs
- **New Features:** Implementing new sacrament modules
- **Accessibility:** Improving keyboard navigation and screen reader support

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Comment on the issue** to let others know you're working on it
3. **Ask questions** if requirements are unclear
4. **Discuss your approach** for larger changes before coding

---

## Contribution Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new branch for your work
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation updates
- `test/` for adding tests

### 2. Make Your Changes

- Write clean, readable code
- Follow existing patterns and conventions
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run the development server
npm run dev

# Run tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "Descriptive commit message"
```

Commit message format:
- Use present tense ("Add feature" not "Added feature")
- Be specific and descriptive
- Reference issue numbers when applicable

Examples:
- `Add Baptism module following wedding pattern`
- `Fix date picker validation in event form`
- `Update Spanish translations for petition templates`

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template with:
   - Description of changes
   - Related issue numbers
   - Screenshots (for UI changes)
   - Testing steps

---

## Code Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` types
- Export types from server action files

### React Components

- **Server Components by default** - Only use `'use client'` when necessary
- Follow the established component patterns
- Use proper prop types
- Keep components focused and single-purpose

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use semantic color tokens (never hardcoded colors)
- Support dark mode automatically with CSS variables
- **Never modify form input styling** (font-family, borders, backgrounds)

### Database

- Create migration files for all database changes
- Use Row Level Security (RLS) policies
- Follow naming conventions:
  - Tables: plural (e.g., `weddings`, `baptisms`)
  - Columns: singular (e.g., `note`, not `notes`)
- Add proper indexes for performance

### Bilingual Support

- All user-facing text must support English and Spanish
- Add translations to constants file
- Follow the pattern in existing bilingual content

---

## Testing Requirements

### What to Test

- User flows (create, edit, delete)
- Form validation
- Authentication and permissions
- Data persistence
- Navigation and routing

### Writing Tests

```typescript
// tests/weddings.spec.ts
import { test, expect } from '@playwright/test'

test('should create a new wedding', async ({ page }) => {
  await page.goto('/weddings/create')

  // Fill out form
  await page.getByLabel('Bride Name').fill('Maria Garcia')
  await page.getByLabel('Groom Name').fill('Juan Rodriguez')

  // Submit form
  await page.getByRole('button', { name: 'Save' }).click()

  // Verify redirect to view page
  await expect(page).toHaveURL(/\/weddings\/[a-f0-9-]+$/)
})
```

See [TESTING_GUIDE.md](https://github.com/CatholicOS/outwardsign/blob/main/docs/TESTING_GUIDE.md) for comprehensive testing documentation.

---

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project conventions
- [ ] Tests pass locally
- [ ] TypeScript compiles without errors
- [ ] Lint checks pass
- [ ] Changes are documented
- [ ] Bilingual content is complete
- [ ] UI is responsive and accessible

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Testing Steps
1. Go to...
2. Click on...
3. Verify that...

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Follows code standards
- [ ] Bilingual support included
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in release notes

---

## Getting Help

### Questions About Contributing?

- **GitHub Discussions:** Ask questions and discuss ideas
- **GitHub Issues:** Report bugs or suggest features
- **Documentation:** Check docs/ folder for detailed guides
- **CLAUDE.md:** Review the main development guide

### Development Questions?

If you're stuck on:
- Setting up your environment
- Understanding the architecture
- Implementing a feature
- Writing tests

Open a GitHub Discussion or comment on the relevant issue. The maintainers and community are here to help!

### Code of Conduct

Be respectful, collaborative, and constructive. We're all working together to help parishes celebrate beautiful liturgies.

---

## Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Your work helps parishes around the world celebrate the sacraments beautifully. Thank you for contributing to Outward Sign!

---

**Ready to contribute?** Find a [good first issue](https://github.com/CatholicOS/outwardsign/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) and get started today!
