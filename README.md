# Outward Sign

> **For New Developers:** This README helps you understand what Outward Sign is, why it exists, and how to set up a local development environment to start contributing. Jump to [Getting Started](#-getting-started) to begin.

---

> Plan, Communicate, and Celebrate Sacraments and Sacramentals in a Catholic Parish

Outward Sign is a comprehensive sacrament and sacramental management tool designed to help Catholic parishes plan, prepare, and celebrate liturgical events with excellence and beauty.

**Free & Open Source** • This project is completely free to use and open source, built for the Catholic community to serve parishes worldwide without barriers or cost.

## 📖 Purpose

### What is a Sacrament?

From the Catholic perspective, a sacrament is traditionally defined as:

**"An outward sign instituted by Christ to give grace"**

The Catechism of the Catholic Church (CCC 1131) further clarifies:

> *"The sacraments are efficacious signs of grace, instituted by Christ and entrusted to the Church, by which divine life is dispensed to us."*

The name "Outward Sign" directly references this theological definition, highlighting that the sacraments are visible, communal celebrations that manifest invisible grace in the life of the Church.

### Why This Tool Matters

The Sacraments and Sacramentals are the core activity of the Catholic Parish—their proper celebration at every step is the evangelizing work of parishes. However, coordinating these sacred moments often involves juggling multiple tools, endless email chains, scattered documents, and last-minute scrambling to ensure everything is ready for the celebration.

Outward Sign addresses this challenge by providing a unified platform for organizing every aspect of sacramental preparation. From the initial planning stages through to having a beautifully formatted script ready in the sacristy, every detail is organized, accessible, and designed to serve the beauty and sanctity of each sacramental celebration.

This tool recognizes that when we prepare sacraments and sacramentals with care, attention to detail, and clear communication, we create moments of profound spiritual significance—not just for the individuals participating in the celebration, but for the entire parish community and as a witness to the world.

## 🌟 Philosophy

- **Organization is Essential:** Careful organization of each sacrament and sacramental creates joy for individuals and beauty for the world
- **Communication Builds Beauty:** Clear communication with individuals and the broader community enhances every sacramental experience
- **Preparation Enables Excellence:** Being fully prepared means having the summary and script printed and ready in the sacristy for the presider to confidently lead the celebration

## ✨ Features

- **Sacrament & Sacramental Planning:** Manage weddings, funerals, baptisms, presentations, and quinceañeras with dedicated workflows for each celebration type
- **Complete Preparation Tools:** Organize all aspects of sacramental preparation from initial planning to printed scripts
- **Parish Calendar:** Unified calendar view showing all sacramental events and parish activities
- **Print & Export:** Generate professional liturgical scripts and readings documentation (PDF/Word export for all sacraments)
- **Data Export:** Download parish directory as CSV from the People page for easy data management and backup
- **Multilingual Support:** Full English and Spanish language support throughout the application, including the public homepage with language selector, liturgical content, and all user interfaces for diverse parish communities
- **Liturgical Calendar Integration:** Built-in Catholic liturgical calendar data with global observances, feasts, and solemnities

## 🎨 Sacrament & Sacramental Icons

Each sacrament and sacramental type uses a consistent icon throughout the application. All icons are from **Lucide React**.

| Module | Lucide React Component |
|--------|------------------------|
| **Weddings** | `VenusAndMars` |
| **Funerals** | `Cross` |
| **Baptisms** | `Droplet` |
| **Presentations** | `HandHeartIcon` |
| **Quinceañeras** | `BookHeart` |
| **Confirmations** | `Flame` *(future)* |

**Source of Truth:** The main sidebar (`src/components/main-sidebar.tsx`) defines the official icon for each module. Always reference this file when creating new features or documentation to ensure consistency across the application.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router) with TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with server-side session management
- **UI Framework:** React 19 with Radix UI primitives
- **Styling:** Tailwind CSS 4 with dark mode support
- **Icons:** Lucide React
- **Testing:** Playwright
- **Deployment:** Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/downloads))
- **Supabase Account** ([Sign up](https://supabase.com))
- **Supabase CLI** ([Installation Guide](https://supabase.com/docs/guides/cli/getting-started))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/outwardsign.git
cd outwardsign
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** > **API** in your Supabase dashboard
3. Copy your **Project URL** and **anon/public key**

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
# Update these with your Supabase details from your project settings > API
# https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

### 5. Link to Supabase Project

Link your local project to your Supabase project:

```bash
supabase link --project-ref your-project-ref
```

You can find your project reference ID in your Supabase project settings.

### 6. Run Database Migrations

Push the database migrations to your Supabase project:

```bash
supabase db push
```

This will create all necessary tables, functions, and Row-Level Security (RLS) policies.

### 7. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Create Your First User

On first visit, you'll be directed to the authentication page. You can:

1. **Sign up** with an email and password
2. Your first user will need to be assigned appropriate roles through the Supabase dashboard
3. Navigate to **Authentication** > **Users** in Supabase to manage user roles and permissions

**Role Hierarchy:**
- `super-admin` - Billing settings, parish ownership
- `admin` - Parish settings and management
- `staff` - Create, read, update, delete records (default role)
- `parishioner` - Read-only access to their own records

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Playwright tests (with automatic setup/cleanup)
- `npm run test:headed` - Run tests in headed mode (see browser)
- `npm run test:ui` - Run tests with Playwright UI (for debugging)
- `npm run seed` - Run all database seeders

### Testing

This project uses Playwright for end-to-end testing with **automatic test user setup and cleanup**.

**Standard Command (Use This):**
```bash
npm test
```

This automatically:
1. Creates a temporary test user and parish
2. Runs all Playwright tests with authentication
3. Cleans up all test data when complete

**Alternative Commands:**

**See tests run in browser:**
```bash
npm run test:headed
```

**Debug with Playwright UI:**
```bash
npm run test:ui
```

**⚠️ Important:** Always use `npm test` (not `npx playwright test` directly). The npm command handles all the automatic setup and cleanup.

**How it works:**
- `npm test` runs `scripts/run-tests-with-temp-user.js`
- **Dynamic credentials** are generated for each test run (unique email with timestamp)
- Each test run starts with a completely fresh, isolated test environment
- All test data (user, parish, events, etc.) is automatically deleted after tests complete
- **Guaranteed test isolation** - no data contamination between runs
- No manual setup or cleanup required!

#### Writing Tests (CRITICAL)

**⚠️ IMPORTANT:** All tests are pre-authenticated automatically. **DO NOT** create custom authentication functions in your tests.

**The authentication flow:**
1. `npm test` generates **unique credentials** (e.g., `test-staff-1732894756321-45678@outwardsign.test`)
2. `setup-test-user.js` creates a test user and parish with those credentials
3. `auth.setup.ts` logs in as that user and saves the session state to `playwright/.auth/staff.json`
4. **YOUR TESTS** automatically use that authenticated session (configured in `playwright.config.ts`)
5. After tests complete, all test data is automatically cleaned up

**Benefits of dynamic credentials:**
- ✅ Fresh database state every test run
- ✅ No leftover data from previous runs
- ✅ Can run multiple test suites in parallel (different credentials each time)
- ✅ Automatic cleanup ensures no orphaned test data

**✅ CORRECT Pattern - Use the Test Template:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('My Module Tests', () => {
  test('should do something', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Start by navigating directly to the page you need
    await page.goto('/my-module');

    // Your test logic here...
  });
});
```

**❌ WRONG Pattern - DO NOT DO THIS:**
```typescript
// ❌ DO NOT create setupTestUser() functions
// ❌ DO NOT navigate to /signup or /login in tests
// ❌ DO NOT try to authenticate manually

async function setupTestUser(page: any) {  // ← WRONG!
  await page.goto('/signup');              // ← WRONG!
  await page.fill('input[type="email"]', testEmail);
  // ... This is unnecessary and causes test failures!
}
```

**Test Template:**
- Copy `tests/TEST_TEMPLATE.spec.ts` to create new test files
- See `tests/presentation.spec.ts` for a reference implementation
- See `tests/events.spec.ts` for how tests should be structured

**Key Points:**
- Tests are **already authenticated** - just navigate to pages you need to test
- Use `page.goto('/your-page')` to start each test
- Trust the test infrastructure - it handles all authentication automatically
- Each test run gets a fresh, isolated environment
- All test data is cleaned up automatically

## 📁 Project Structure

```
outwardsign/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (main)/         # Main application pages
│   │   ├── api/            # API routes
│   │   └── print/          # Print-optimized views
│   ├── components/         # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and actions
│   │   ├── actions/        # Server Actions for data operations
│   │   ├── content-builders/ # Liturgy document builders
│   │   └── renderers/      # Content renderers (HTML, PDF)
│   └── utils/              # Helper utilities
├── supabase/
│   └── migrations/         # Database migration files
├── scripts/                # Utility scripts (seeding, etc.)
├── tests/                  # Playwright test files
└── public/                 # Static assets
```

## Database Management

For detailed information on database management, migrations, resets, seeding, and liturgical calendar data, see **[DATABASE.md](./docs/DATABASE.md)**.

## 🔍 Troubleshooting

### Common Issues

**Issue: `supabase: command not found`**
- Solution: Install the Supabase CLI following the [installation guide](https://supabase.com/docs/guides/cli/getting-started)

**Issue: Authentication errors on localhost**
- Verify that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are correct
- Check that your Supabase project is active and not paused
- Ensure you're using `.env.local` (not just `.env`)

**Issue: Port 3000 already in use**
- Stop other applications using port 3000
- Or run on a different port: `npm run dev -- -p 3001`

For database-related issues (migrations, seeding), see **[DATABASE.md](./docs/DATABASE.md)**.

For additional help, check the [GitHub Issues](https://github.com/yourusername/outwardsign/issues) or open a new issue.

## 💝 Free & Open Source

**Outward Sign is completely free and always will be.**

This project is open source and built for the Catholic community. We believe that every parish, regardless of size or budget, should have access to excellent tools for celebrating the sacraments and sacramentals.

**What this means:**
- ✅ **No subscription fees** - Use all features without any cost
- ✅ **No hidden charges** - Export, print, and use unlimited sacraments
- ✅ **Open source code** - Review, modify, and contribute to the codebase
- ✅ **Community-driven** - Built by and for Catholic parishes worldwide
- ✅ **Self-hostable** - Run on your own infrastructure if desired
- ✅ **Transparent development** - All code and development happens in the open

**Why free and open source?**

The sacraments are at the heart of Catholic parish life. We believe tools that serve the Church's mission should be accessible to all parishes, from small rural communities to large urban centers. By making Outward Sign free and open source, we remove barriers and enable parishes everywhere to celebrate sacraments with excellence and beauty.

**License:** MIT License - See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to Outward Sign:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Development Guidelines:**
- Follow the TypeScript patterns established in existing components
- Maintain responsive design across all new components
- Write tests for new features
- Update documentation as needed

For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md).

## 📚 Documentation

### Core Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive development guide with architecture, patterns, and conventions

### Development Resources

The `docs/` directory contains in-depth documentation on specialized topics:

- **[DATABASE.md](./docs/DATABASE.md)** - Database management, migrations, and seeding
- **[MODULE_CHECKLIST.md](./docs/MODULE_CHECKLIST.md)** - Step-by-step checklist for creating new modules
- **[FORMS.md](./docs/FORMS.md)** - Form implementation guidelines and patterns
- **[COMPONENT_REGISTRY.md](./docs/COMPONENT_REGISTRY.md)** - Comprehensive component catalog
- **[STYLES.md](./docs/STYLES.md)** - Styling guidelines and theme tokens
- **[PERSONA.md](./docs/PERSONA.md)** - User personas and use cases

### Testing Documentation

- **[TESTING_QUICKSTART.md](./docs/TESTING_QUICKSTART.md)** - Quick setup guide for running tests
- **[TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)** - Comprehensive guide for writing tests
- **[TESTING_ARCHITECTURE.md](./docs/TESTING_ARCHITECTURE.md)** - Testability patterns and standards

### External Resources

- **[Supabase Documentation](https://supabase.com/docs)** - Database and authentication reference
- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[Playwright Documentation](https://playwright.dev/docs/intro)** - Testing framework reference

## 🤝 A Collaborative Effort

**Outward Sign** is a collaborative project between **[CatholicOS](https://catholicos.org)** and **[Lolek Productions](https://lolek.com)**.

- **CatholicOS** - Building open-source software for Catholic parishes
- **Lolek Productions** - Creating digital tools that serve the Church

Together, we're working to provide parishes worldwide with excellent, free, and open-source tools for celebrating the sacraments with beauty and excellence.

## 🙏 Acknowledgments

- Liturgical calendar data provided by [John Romano D'Orazio's Liturgical Calendar API](https://litcal.johnromanodorazio.com)
- Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com), and [Tailwind CSS](https://tailwindcss.com)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Website:** [outwardsign.church](https://outwardsign.church)
**Made with ❤️ for Catholic parishes**
