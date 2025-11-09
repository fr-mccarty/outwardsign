# Outward Sign

> Plan, Communicate, and Celebrate Sacraments and Sacramentals in a Catholic Parish

Outward Sign is a comprehensive sacrament and sacramental management tool designed to help Catholic parishes plan, prepare, and celebrate liturgical events with excellence and beauty.

**Free & Open Source** • This project is completely free to use and open source, built for the Catholic community to serve parishes worldwide without barriers or cost.

## 📖 Purpose

The Sacraments and Sacramentals are the core activity of the Catholic Parish—their proper celebration at every step is the evangelizing work of parishes. However, coordinating these sacred moments often involves juggling multiple tools, endless email chains, scattered documents, and last-minute scrambling to ensure everything is ready for the celebration.

Outward Sign addresses this challenge by providing a unified platform where parish staff, presiders, and families can collaborate seamlessly throughout the entire preparation process. From the initial planning stages through to having a beautifully formatted script ready in the sacristy, every detail is organized, accessible, and designed to serve the beauty and sanctity of each sacramental celebration.

This tool recognizes that when we prepare sacraments and sacramentals with care, attention to detail, and clear communication, we create moments of profound spiritual significance—not just for the individuals participating in the celebration, but for the entire parish community and as a witness to the world.

## 🌟 Philosophy

- **Collaboration is Essential:** Working together as a parish staff and with the participants in each sacrament and sacramental creates joy for individuals and beauty for the world
- **Communication Builds Beauty:** Clear communication with individuals, staff, support staff, and the broader community enhances every sacramental experience
- **Preparation Enables Excellence:** Being fully prepared means having the summary and script printed and ready in the sacristy for the presider to confidently lead the celebration

## ✨ Features

- **Sacrament & Sacramental Planning:** Manage weddings, funerals, baptisms, presentations, and quinceañeras with dedicated workflows for each celebration type
- **Shared Preparation:** Collaborate with presiders, staff, and families throughout the entire preparation process
- **Calendar Integration:** Export events to .ics feeds for seamless scheduling across parish systems
- **Print & Export:** Generate professional liturgical scripts and readings documentation (PDF/Word)
- **Multilingual Support:** Full English and Spanish language support throughout the application, including the public homepage with language selector, liturgical content, and all user interfaces for diverse parish communities
- **Liturgical Calendar:** Integration with global Catholic liturgical calendar data

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

### 7. Seed the Database

Populate the database with initial liturgical calendar data:

```bash
npm run seed
```

This will seed:
- Liturgical calendar events for 2025 and 2026 (English)
- Any other configured seeders

### 8. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 9. Create Your First User

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
- `npm test` - Run Playwright tests
- `npm run test:ui` - Run tests with Playwright UI
- `npm run seed` - Run all database seeders

### Testing

This project uses Playwright for end-to-end testing.

**Run tests:**
```bash
npm test
```

**Run tests with UI:**
```bash
npm run test:ui
```

**Run tests in headed mode (see browser):**
```bash
npm run test:headed
```

**Set up test user:**
```bash
npm run test:setup
```

For more testing details, see the [Testing section](#testing).

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

### Database Resets

**IMPORTANT:** Database resets are performed via the Supabase UI Dashboard, NOT via CLI commands.

**Workflow:**
1. Go to your Supabase project dashboard
2. Navigate to Database → Reset Database
3. Confirm the reset (this will drop all tables and re-run migrations)
4. After reset completes, run the seed command (see below)

### Seeding the Database

> **Development Note:** During development, it's recommended to seed data directly from the migrations folder rather than using the dynamic API import script (which can be slow). Include seed data in your migration files for faster database resets. The procedure below (using `npm run seed` to fetch from the API) will be the standard approach in production, but for now, seeding from migrations is more efficient.

After resetting the database or running migrations, seed the database with initial data:

```bash
npm run seed
```

This will run all configured seeders defined in `scripts/seed.ts`, including:
- Liturgical calendar events for 2025 (English)
- Liturgical calendar events for 2026 (English)

### Liturgical Calendar Data

The application uses global liturgical calendar data from [John Romano D'Orazio's Liturgical Calendar API](https://litcal.johnromanodorazio.com).

**Current Migrations:**
- `20251109000002_seed_global_liturgical_events_2025_en.sql` - 538 events for 2025
- `20251109000003_seed_global_liturgical_events_2026_en.sql` - 547 events for 2026

#### Creating New Liturgical Calendar Migrations

To create a migration file for a new year (e.g., 2027), use the Task tool with these instructions:

1. **Fetch data from API:**
   ```
   https://litcal.johnromanodorazio.com/api/dev/calendar?locale=en&year=2027
   ```

2. **Parse the JSON** and extract all events from the `litcal` array

3. **Create SQL migration file** at:
   ```
   supabase/migrations/YYYYMMDD000004_seed_global_liturgical_events_2027_en.sql
   ```
   (Increment the sequence number: 000004, 000005, etc.)

4. **Follow this format:**
   ```sql
   -- Seed global_liturgical_events table for year 2027 (locale: en)
   -- Generated from https://litcal.johnromanodorazio.com/api/dev/calendar
   -- Total events: [count]
   -- Generated on: [ISO timestamp]

   INSERT INTO global_liturgical_events (event_key, date, year, locale, event_data)
   VALUES ('EventKey', 'YYYY-MM-DD', 2027, 'en', '{...full JSON...}'::jsonb)
   ON CONFLICT (event_key, date, locale) DO NOTHING;
   ```

5. **Important:**
   - Extract date as YYYY-MM-DD only (from ISO timestamp)
   - Store full event JSON in `event_data` as JSONB
   - Escape single quotes by doubling them (`'` becomes `''`)
   - Use `ON CONFLICT DO NOTHING` for idempotent migrations

6. **Reference existing file** for exact format:
   ```
   supabase/migrations/20251109000002_seed_global_liturgical_events_2025_en.sql
   ```

#### Alternative: Dynamic API Seeding (Future Use)

For production or when SQL migrations become too large, use the TypeScript API import scripts:

```bash
# Seed individual years
npm run seed:liturgical:2025
npm run seed:liturgical:2026

# Custom year and locale
npm run seed:liturgical -- --year=2027 --locale=es

# Run all seeders
npm run seed
```

**Adding New Seeders:**

Edit `scripts/seed.ts` and add to the `seeders` array:

```typescript
{
  name: 'Your Seeder Name',
  command: 'tsx scripts/your-script.ts --args',
  description: 'What this seeder does'
}
```

### Notes

- **Current approach:** Liturgical data is seeded via SQL migrations for faster database resets during development
- **Future approach:** TypeScript scripts (above) fetch from API - useful for production or when migrations become too large
- Data is stored in `global_liturgical_events` table with JSONB for full event data
- Migrations run automatically when database is reset via Supabase UI
- Indexed for efficient date range queries

## 🔍 Troubleshooting

### Common Issues

**Issue: `supabase: command not found`**
- Solution: Install the Supabase CLI following the [installation guide](https://supabase.com/docs/guides/cli/getting-started)

**Issue: Database migration fails**
- Ensure you're linked to the correct Supabase project (`supabase link`)
- Check that your environment variables are correctly set in `.env.local`
- Try resetting the database via the Supabase dashboard and re-running migrations

**Issue: Authentication errors on localhost**
- Verify that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are correct
- Check that your Supabase project is active and not paused
- Ensure you're using `.env.local` (not just `.env`)

**Issue: Seeding fails**
- Make sure migrations have been run first (`supabase db push`)
- Check your internet connection (seeders fetch from external API)
- Verify your Supabase service role key has proper permissions

**Issue: Port 3000 already in use**
- Stop other applications using port 3000
- Or run on a different port: `npm run dev -- -p 3001`

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

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive development guide with architecture, patterns, and conventions
- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Step-by-step checklist for creating new modules
- **[Supabase Documentation](https://supabase.com/docs)** - Database and authentication reference
- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation

## 🙏 Acknowledgments

- Liturgical calendar data provided by [John Romano D'Orazio's Liturgical Calendar API](https://litcal.johnromanodorazio.com)
- Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com), and [Tailwind CSS](https://tailwindcss.com)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Website:** [outwardsign.church](https://outwardsign.church)
**Made with ❤️ for Catholic parishes**
