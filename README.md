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

- **Sacrament & Sacramental Planning:** Manage Masses, weddings, funerals, baptisms, presentations, and quinceañeras with dedicated workflows for each celebration type
- **Mass Scheduling System:** Bulk scheduling wizard for creating multiple Masses over date ranges with automatic minister assignment based on preferences and availability
- **Mass Role Management:** Dedicated system for managing liturgical roles (Lectors, EMHCs, Altar Servers, Cantors, Ushers) with templates, preferences, and blackout dates
- **Mass Intentions:** Track and manage Mass intention requests with dedicated workflow for requesting, confirming, and fulfilling intentions
- **Team Management:** Role-based permission system with parish invitations for admins, staff, ministry-leaders, and parishioners with configurable module-level access
- **Ministry Groups:** Organize parish ministries and committees with role-based membership tracking through the group member directory
- **Complete Preparation Tools:** Organize all aspects of sacramental preparation from initial planning to printed scripts
- **Parish Calendar:** Unified calendar view showing all sacramental events and parish activities with liturgical calendar integration
- **Print & Export:** Generate professional liturgical scripts and readings documentation (PDF/Word export for all sacraments)
- **Data Export:** Download parish directory as CSV from the People page for easy data management and backup
- **Multilingual Support:** Full English and Spanish language support throughout the application, including the public homepage with language selector, liturgical content (English, Spanish, Latin), and all user interfaces for diverse parish communities
- **Liturgical Calendar Integration:** Built-in Catholic liturgical calendar data with global observances, feasts, and solemnities

## 🎨 Sacrament & Sacramental Icons

Each sacrament and sacramental type uses a consistent icon throughout the application. All icons are from **Lucide React**.

| Module | Lucide React Component |
|--------|------------------------|
| **Masses** | `CirclePlus` |
| **Weddings** | `VenusAndMars` |
| **Funerals** | `Cross` |
| **Baptisms** | `Droplet` |
| **Presentations** | `HandHeartIcon` |
| **Quinceañeras** | `BookHeart` |
| **Groups** | `Users` |
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
- **Docker Desktop** ([Download](https://docs.docker.com/desktop/)) - Required for running local Supabase
  - After installation, **launch Docker Desktop** and keep it running during development
  - Verify it's running by checking for the Docker icon in your system tray (Windows/Linux) or menu bar (macOS)
- **Supabase CLI** ([Installation Guide](https://supabase.com/docs/guides/cli/getting-started)) - Install accoreding to your operating seystem

> **Note:** You do NOT need a Supabase cloud account to contribute. All development is done locally using Docker.

## 🚀 Getting Started

This guide will help you set up a local development environment to contribute to Outward Sign. All development and testing is done locally using Docker—no cloud setup required.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/outwardsign.git
cd outwardsign
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Local Supabase Instance

Make sure Docker Desktop is running, then start Supabase services:

```bash
# Start all Supabase services in Docker containers
supabase start
```

> **First time?** The `supabase start` command will download Docker images (this may take a few minutes). The `supabase` folder already exists in the repo with configuration and migrations, so you don't need to run `supabase init`.

Once complete, you'll see output with your local credentials:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJh......
service_role key: eyJh......
```

### 4. Configure Environment Variables

Your local Supabase instance generates credentials automatically—you just need to plug them into the right spots.

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

Now grab your local credentials:

```bash
supabase status -o env
```

This outputs your local Supabase configuration. **Map these values** to your `.env.local` file:

```env
# Local Supabase credentials (from `supabase status -o env`)
# Map the keys as follows:
#   ANON_KEY → NEXT_PUBLIC_SUPABASE_ANON_KEY
#   API_URL → NEXT_PUBLIC_SUPABASE_URL
#   SERVICE_ROLE_KEY → SUPABASE_SERVICE_ROLE_KEY

NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci...your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci...your-service-role-key-here"
```

> **What are these keys?**
> - **Anon Key** - Used by the frontend for authenticated requests (respects Row Level Security policies)
> - **Service Role Key** - Used by server-side code to bypass RLS when needed (use carefully!)
> - **API URL** - Points to your local Supabase API endpoint

> **Tip:** Run `supabase status -o env` anytime to retrieve your local credentials. The keys are stable across restarts (unless you reset with `--no-backup`).

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First User

On first visit to [http://localhost:3000](http://localhost:3000), you'll be directed to the authentication page:

1. **Sign up** with any email and password (emails are caught by the local mail catcher at [http://localhost:54324](http://localhost:54324))
2. Your user is automatically created in the local database
3. Navigate to [http://localhost:54323](http://localhost:54323) (Supabase Studio) > **Authentication** > **Users** to manage roles

**Role Hierarchy:**
- `super-admin` - Billing settings, parish ownership
- `admin` - Parish settings and management
- `staff` - Create, read, update, delete records (default role)
- `parishioner` - Read-only access to their own records

### 7. Explore Supabase Studio

Visit [http://localhost:54323](http://localhost:54323) to access the Supabase Studio dashboard for your local instance. Here you can:
- View and edit database tables
- Manage authentication users
- Run SQL queries
- View logs and monitor performance

### 8. Stopping Local Supabase

When you're done developing:

```bash
# Stop services (preserves your local database)
supabase stop

# Stop and reset all data (clean slate for next session)
supabase stop --no-backup
```

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
- `npm run db:fresh` - Reset the database (drop all data, re-run migrations) and seed with development data

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

## Team Management

Outward Sign includes a robust team management system with role-based permissions and invitation workflows. Parish administrators can invite team members, assign roles (admin, staff, ministry-leader, parishioner), and configure module access for ministry leaders. For detailed information on team structure, invitation workflows, permissions, and database schema, see **[TEAM_MANAGEMENT.md](./docs/TEAM_MANAGEMENT.md)**.

## 🔍 Troubleshooting

### Common Issues

**Issue: `supabase: command not found`**
- Solution: Install the Supabase CLI following the [installation guide](https://supabase.com/docs/guides/cli/getting-started)
- Verify installation: `supabase --version`

**Issue: Docker not running**
- Make sure Docker Desktop is installed and running before executing `supabase start`
- Check Docker Desktop's status in your system tray/menu bar
- Try restarting Docker Desktop if containers fail to start

**Issue: `supabase start` fails or containers are unhealthy**
- Run `supabase stop --no-backup` to clean up
- Restart Docker Desktop
- Run `supabase start` again
- If issues persist, run `docker ps` to check container status

**Issue: Port conflicts (54321, 54322, 54323, 54324)**
- Check if you have other Supabase instances running: `supabase stop`
- Check what's using the ports: `lsof -i :54321` (macOS/Linux) or `netstat -ano | findstr :54321` (Windows)
- Stop conflicting services or use different ports by editing `supabase/config.toml`

**Issue: Authentication errors on localhost**
- Verify that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are correct
- Check `supabase status` to get the correct local credentials
- Ensure you're using `.env.local` (not just `.env`)
- Restart your Next.js dev server after changing environment variables

**Issue: Port 3000 already in use**
- Stop other applications using port 3000
- Or run on a different port: `npm run dev -- -p 3001`

**Issue: Database migrations not applied**
- Run `npm run db:fresh` to reset and reapply all migrations
- Check migration files in `supabase/migrations/` for syntax errors
- Verify Supabase is running: `supabase status`

**Issue: Tests failing with authentication errors**
- Make sure Supabase is running locally: `supabase start`
- Verify `.env.local` has correct local credentials
- Try running `npm test` (not `npx playwright test` directly)

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

Contributions are welcome! Outward Sign is built by and for the Catholic community. Whether you're fixing bugs, adding features, improving documentation, or writing tests, your contributions help parishes worldwide.

### How to Contribute

#### 1. Set Up Your Development Environment

Follow the [Getting Started](#-getting-started) guide above to:
- Clone the repository
- Install dependencies
- Start local Supabase with Docker
- Run the development server
- Run tests to verify everything works

#### 2. Make Your Changes

1. **Fork the repository** to your GitHub account
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our development guidelines:
   - Follow TypeScript patterns from existing components
   - Maintain responsive design across all new components
   - Write tests for new features (see [Testing](#testing) section)
   - Update documentation as needed
4. **Test your changes** locally:
   ```bash
   npm test           # Run all tests
   npm run build      # Verify production build
   npm run lint       # Check code style
   ```

#### 3. Submit Your Pull Request

1. **Commit your changes** with clear, descriptive messages:
   ```bash
   git add .
   git commit -m "Add feature: Brief description of what you did"
   ```
2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Open a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Explain what changes you made and why
   - Include screenshots for UI changes

#### 4. Review Process

- Maintainers will review your PR and may request changes
- Make any requested updates by pushing new commits to your branch
- Once approved, maintainers will merge your PR
- Your contribution will be included in the next release!

### Development Guidelines

- **Follow existing patterns** - Review similar features before implementing
- **Write tests** - All new features should include Playwright tests
- **Document your work** - Update README.md, CLAUDE.md, or docs/ as needed
- **Keep PRs focused** - One feature or fix per pull request
- **Test locally** - Always run tests and verify your changes work before submitting
- **Ask questions** - Open an issue if you're unsure about an approach

### Need Help?

- **Development Guide:** See [CLAUDE.md](./CLAUDE.md) for comprehensive development patterns
- **Questions:** Open a [GitHub Discussion](https://github.com/yourusername/outwardsign/discussions)
- **Bugs:** Report issues on [GitHub Issues](https://github.com/yourusername/outwardsign/issues)

**Note:** All development and testing is done locally. You don't need a cloud Supabase account to contribute—just Docker and the Supabase CLI.

## 📚 Documentation

> **📋 Documentation Types:**
> - **Developer/AI Documentation** (below) - Technical documentation for developers and AI agents building the application. Includes architecture, patterns, API references, and implementation guidelines.
> - **User Documentation** (separate, public-facing) - End-user help guides and tutorials for parish staff using Outward Sign. This is NOT part of the repository documentation.

### Core Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive development guide with architecture, patterns, and conventions

### Development Resources

The `docs/` directory contains in-depth developer/AI documentation on specialized topics:

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
