# Parishioner Portal

> **Purpose:** Technical documentation for the Parishioner Portal - a separate web application for parishioners to view their ministry schedules, chat with an AI assistant, and receive notifications.
>
> **Status:** Phase 1 Complete (Web App)
> **Target Users:** Ministry volunteers, parishioners, family members

**Last Updated:** 2025-12-04

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Authentication System](#authentication-system)
- [Database Schema](#database-schema)
- [Features](#features)
  - [Calendar Tab](#calendar-tab)
  - [Chat Tab](#chat-tab)
  - [Notifications Tab](#notifications-tab)
- [Security](#security)
- [File Structure](#file-structure)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Testing](#testing)
- [Future Enhancements (Phase 2)](#future-enhancements-phase-2)

---

## Overview

The Parishioner Portal is a **responsive web application** that provides parishioners with a simple, mobile-friendly interface to:
- View their ministry schedule and parish events
- Communicate with an AI assistant powered by Claude
- Receive and manage notifications from ministry coordinators

**Key Differences from Staff Application:**
- **Separate authentication** - Magic link via email (no password required)
- **Separate route structure** - `/parishioner/*` routes
- **Simplified permissions** - Person-scoped access (not role-based)
- **Mobile-first design** - Optimized for phone browsers
- **Progressive Web App** - Can be added to home screen

**Access URL:**
```
https://your-parish.outwardsign.church/parishioner/login?parish=<parish-id>
```

---

## Architecture

### Technology Stack

**Frontend:**
- Next.js 15 with App Router
- React Server Components
- Tailwind CSS (semantic tokens for dark mode)
- Responsive design (mobile-first)

**Backend:**
- Server Actions for all data operations
- Supabase (PostgreSQL) with service role access
- Custom session management (HTTP-only cookies)

**External Services:**
- AWS SES (email delivery for magic links)
- Anthropic Claude API (AI chat assistant)

### Design Patterns

**3-Tab Navigation:**
1. **Calendar** - Default home tab
2. **Chat** - AI assistant
3. **Notifications** - Message inbox

**Responsive Layouts:**
- Mobile: Bottom tab bar, full-screen content
- Tablet/Desktop: Larger layouts with more visible content

**Progressive Web App (PWA):**
- Manifest file: `/public/manifest.json`
- Service worker: `/public/sw.js`
- "Add to Home Screen" capability
- Offline fallback (cached content)

---

## Authentication System

### Overview

The Parishioner Portal uses **magic link authentication** (email-only) with HTTP-only cookies for session management. This is completely separate from the Supabase Auth system used by parish staff.

### Magic Link Flow

```
1. User enters email on login page
   ↓
2. Server generates random token (32 chars)
   ↓
3. Token is hashed with bcrypt (10 rounds)
   ↓
4. Hashed token stored in parishioner_auth_sessions table
   ↓
5. Magic link email sent via AWS SES
   ↓
6. User clicks link in email
   ↓
7. Server verifies token and creates session
   ↓
8. Session ID stored in HTTP-only cookie
   ↓
9. User accesses portal pages
```

### Authentication Functions

**Location:** `src/lib/parishioner-auth/actions.ts`

```typescript
// Generate magic link and send email
export async function generateMagicLink(email: string, parishId: string)

// Verify magic link token and create session
export async function verifyMagicLink(token: string, personId: string)

// Get current session from cookie
export async function getParishionerSession()

// Logout and clear session
export async function logout()
```

### Session Management

**Session Cookie:**
- Name: `parishioner_session_id`
- HTTP-only: Yes (prevents XSS)
- Secure: Yes (HTTPS only)
- SameSite: Lax
- Max-Age: 30 days

**Session Cleanup:**
- Database function: `cleanup_expired_auth_sessions()`
- Scheduled: Daily cron job at 3 AM
- Removes sessions older than expiry date

### Security Features

1. **Bcrypt Token Hashing** (10 rounds) - Prevents brute force if database compromised
2. **HTTP-Only Cookies** - Prevents XSS attacks
3. **Timing-Safe Comparison** - Prevents timing attacks during token verification
4. **48-Hour Magic Link Expiry** - Limits token lifetime
5. **Rate Limiting** - 5 magic link requests per 15 minutes per email
6. **CSRF Protection** - All server actions require CSRF token

---

## Database Schema

### Tables

**1. families**
```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id),
  family_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**2. family_members**
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  relationship TEXT, -- 'parent', 'child', 'spouse', etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, person_id)
);
```

**3. parishioner_auth_sessions**
```sql
CREATE TABLE parishioner_auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  token TEXT NOT NULL, -- Bcrypt hashed
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_parishioner_sessions_person ON parishioner_auth_sessions(person_id);
CREATE INDEX idx_parishioner_sessions_token ON parishioner_auth_sessions(token);
```

**4. parishioner_notifications**
```sql
CREATE TABLE parishioner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ministry', 'schedule', 'reminder', 'general'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_parishioner_notifications_person ON parishioner_notifications(person_id);
CREATE INDEX idx_parishioner_notifications_read ON parishioner_notifications(is_read);
```

**5. parishioner_calendar_event_visibility**
```sql
CREATE TABLE parishioner_calendar_event_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(person_id, event_id)
);

CREATE INDEX idx_calendar_visibility_person ON parishioner_calendar_event_visibility(person_id);
```

**6. ai_chat_conversations**
```sql
CREATE TABLE ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]', -- Array of {role, content} objects
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_conversations_person ON ai_chat_conversations(person_id);
```

**7. people (existing table - added columns)**
```sql
ALTER TABLE people ADD COLUMN parishioner_portal_enabled BOOLEAN DEFAULT false;
ALTER TABLE people ADD COLUMN preferred_language TEXT DEFAULT 'en';
```

### Database Functions

**1. get_person_family_data(person_id UUID)**

Retrieves family data for AI chat context.

```sql
CREATE OR REPLACE FUNCTION get_person_family_data(person_id_param UUID)
RETURNS TABLE (
  family_id UUID,
  family_name TEXT,
  family_members JSONB
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id AS family_id,
    f.family_name,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'full_name', p.full_name,
          'relationship', fm.relationship
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'::jsonb
    ) AS family_members
  FROM families f
  JOIN family_members fm ON fm.family_id = f.id
  LEFT JOIN people p ON p.id = fm.person_id
  WHERE f.id IN (
    SELECT family_id FROM family_members WHERE person_id = person_id_param
  )
  GROUP BY f.id, f.family_name;
END;
$$ LANGUAGE plpgsql;
```

**2. cleanup_expired_auth_sessions()**

Removes expired parishioner auth sessions.

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_auth_sessions()
RETURNS INTEGER SECURITY DEFINER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM parishioner_auth_sessions
  WHERE expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

### RLS Policies

All tables have RLS enabled with service role-only access. Permission checks are enforced in server actions, not at the database level, because parishioner sessions use cookies instead of JWT claims.

---

## Features

### Calendar Tab

**Purpose:** View ministry schedule and parish events at a glance.

**File:** `src/app/(parishioner)/parishioner/(portal)/calendar/page.tsx`

**Features:**
1. **Month Calendar View** - Visual calendar with event indicators
2. **Agenda List** - Upcoming commitments in chronological order
3. **Event Types:**
   - Ministry commitments (masses, weddings, funerals, etc.)
   - Family events (baptisms, weddings where family member is participant)
   - Parish events (made visible by coordinators)
4. **Visual Indicators:**
   - Blue dot: Scheduled commitment
   - Red dot: Blackout date (unavailable)
5. **Responsive Design:**
   - Mobile: Collapsible month calendar, single-column agenda
   - Desktop: Side-by-side calendar and agenda

**Server Actions:**
```typescript
// src/app/(parishioner)/parishioner/(portal)/calendar/actions.ts
export async function getCalendarEvents(personId: string, startDate: string, endDate: string)
```

**Data Sources:**
- Ministry role assignments (from mass_roles, wedding_roles, etc.)
- Family events (from family_members table)
- Visible parish events (from parishioner_calendar_event_visibility)

---

### Chat Tab

**Purpose:** AI assistant for schedule queries and availability management.

**File:** `src/app/(parishioner)/parishioner/(portal)/chat/page.tsx`

**Features:**
1. **Conversational Interface** - Chat with Claude AI
2. **Context-Aware Responses** - AI knows user's schedule, ministries, and family
3. **Tool Use:**
   - `get_ministry_schedule` - Fetch upcoming ministry commitments
   - `get_family_data` - Retrieve family member information
   - `mark_unavailable` - Mark blackout dates (future)
4. **Conversation History** - Messages stored in database
5. **Voice Input** - Web Speech API (optional, browser-dependent)

**Server Actions:**
```typescript
// src/app/(parishioner)/parishioner/(portal)/chat/actions.ts
export async function sendChatMessage(personId: string, conversationId: string, message: string)
```

**Claude API Integration:**
- Model: `claude-3-5-sonnet-20241022`
- Max tokens: 1024
- Tools: Custom functions for schedule/family data
- Streaming: No (responses returned complete)

**Example Conversations:**
- "When am I scheduled next?"
- "What are my readings this Sunday?"
- "Show me all my commitments in January"
- "Mark me unavailable December 20-30" (future)

---

### Notifications Tab

**Purpose:** Receive and manage notifications from ministry coordinators.

**File:** `src/app/(parishioner)/parishioner/(portal)/notifications/page.tsx`

**Features:**
1. **Notification List** - Chronological list of notifications
2. **Notification Types:**
   - `ministry` - Messages from ministry coordinators
   - `schedule` - Schedule updates and changes
   - `reminder` - Upcoming commitment reminders
   - `general` - General parish announcements
3. **Read/Unread Status** - Visual indicator for new notifications
4. **Delete Notifications** - Remove notifications
5. **Mark as Read** - Mark notifications as read

**Server Actions:**
```typescript
// src/app/(parishioner)/parishioner/(portal)/notifications/actions.ts
export async function getNotifications(personId: string)
export async function markNotificationAsRead(notificationId: string, personId: string)
export async function deleteNotification(notificationId: string, personId: string)
export async function createNotification(personId: string, title: string, message: string, type: string)
```

**Notification Badge:**
- Unread count displayed on Notifications tab
- Updates in real-time when notifications are read/deleted

---

## Security

### CSRF Protection

**Implementation:** `src/lib/csrf.ts`

All server actions in the parishioner portal are protected by CSRF tokens.

```typescript
// Generate CSRF token on login
const csrfToken = await generateCsrfToken(personId)
// Store in cookie: parishioner_csrf_token

// Verify on every server action
const isValid = await verifyCsrfToken(csrfToken, personId)
if (!isValid) {
  throw new Error('Invalid CSRF token')
}
```

**Token Format:**
- Random 32-character string
- Hashed with crypto.timingSafeEqual for comparison
- Stored in HTTP-only cookie

### Rate Limiting

**Implementation:** `src/lib/rate-limit.ts`

Rate limits protect against abuse and DoS attacks.

**Limits:**
- Magic link generation: 5 requests per 15 minutes per email
- Chat messages: 20 requests per minute per person
- Notifications: 30 requests per minute per person
- Calendar events: 60 requests per minute per person

**Storage:** In-memory Map (resets on server restart)

**Future Enhancement:** Redis-backed rate limiting for distributed systems

### Session Security

1. **HTTP-Only Cookies** - JavaScript cannot access session ID
2. **Secure Flag** - Cookies only sent over HTTPS
3. **SameSite: Lax** - Prevents CSRF on POST requests from external sites
4. **Token Hashing** - Tokens hashed with bcrypt before storage
5. **Timing-Safe Comparison** - Prevents timing attacks during verification

### Permission Enforcement

**Server actions verify session before data access:**

```typescript
const session = await getParishionerSession()
if (!session || session.personId !== requiredPersonId) {
  console.error('Unauthorized access attempt')
  return []
}

// Use service_role client with explicit filtering
const supabase = createServiceRoleClient()
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('person_id', session.personId)
```

**Why service role?** RLS policies assume JWT claims from Supabase Auth. Parishioner sessions use cookies, so we bypass RLS and enforce permissions explicitly in code.

---

## File Structure

```
src/
├── app/
│   └── (parishioner)/
│       ├── layout.tsx                 # Parishioner layout with PWA manifest
│       └── parishioner/
│           ├── login/
│           │   ├── page.tsx           # Magic link login form
│           │   └── verify/
│           │       └── page.tsx       # Magic link verification
│           └── (portal)/
│               ├── layout.tsx         # Portal layout with tabs
│               ├── calendar/
│               │   ├── page.tsx       # Calendar view
│               │   ├── calendar-view.tsx  # Client component
│               │   └── actions.ts     # Server actions
│               ├── chat/
│               │   ├── page.tsx       # Chat view
│               │   ├── chat-view.tsx  # Client component
│               │   └── actions.ts     # Server actions
│               └── notifications/
│                   ├── page.tsx       # Notifications view
│                   ├── notifications-view.tsx  # Client component
│                   └── actions.ts     # Server actions
├── lib/
│   ├── parishioner-auth/
│   │   └── actions.ts                 # Auth functions
│   ├── csrf.ts                        # CSRF protection
│   ├── rate-limit.ts                  # Rate limiting
│   ├── email.ts                       # Email sending (AWS SES)
│   └── env-validation.ts              # Environment variable validation
└── components/
    └── parishioner/
        ├── bottom-tabs.tsx            # Mobile bottom tab navigation
        └── parishioner-header.tsx     # Portal header
```

**Database Migrations:**
```
supabase/migrations/
├── 20251203000001_create_families_table.sql
├── 20251203000002_create_family_members_table.sql
├── 20251203000003_create_parishioner_auth_sessions_table.sql
├── 20251203000004_create_parishioner_notifications_table.sql
├── 20251203000005_create_parishioner_calendar_event_visibility_table.sql
├── 20251203000006_create_ai_chat_conversations_table.sql
├── 20251203000007_add_portal_columns_to_people.sql
└── 20251203000008_create_parishioner_portal_functions.sql
```

**PWA Files:**
```
public/
├── manifest.json                      # PWA manifest
├── sw.js                              # Service worker
├── icon.svg                           # SVG icon
├── icon-192x192-placeholder.txt       # Placeholder (replace with PNG)
└── icon-512x512-placeholder.txt       # Placeholder (replace with PNG)
```

---

## Environment Variables

**Required for Parishioner Portal:**

```env
# AWS SES (Email Delivery)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Anthropic Claude API (AI Chat)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Application URL (for magic links)
NEXT_PUBLIC_APP_URL=https://your-parish.outwardsign.church

# Supabase (required for all features)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Validation:**
Environment variables are validated on module load in `src/lib/env-validation.ts`. The app will throw a clear error if required variables are missing.

---

## API Routes

The Parishioner Portal does not use traditional API routes. All data operations use Next.js Server Actions.

**Server Action Locations:**
- `/src/app/(parishioner)/parishioner/(portal)/calendar/actions.ts` - Calendar data
- `/src/app/(parishioner)/parishioner/(portal)/chat/actions.ts` - AI chat
- `/src/app/(parishioner)/parishioner/(portal)/notifications/actions.ts` - Notifications
- `/src/lib/parishioner-auth/actions.ts` - Authentication

**Benefits of Server Actions:**
- Type-safe communication between client and server
- No need to define API routes
- Automatic serialization/deserialization
- Built-in error handling
- Works with React Server Components

---

## Testing

**Test Coverage:** 44 tests across 4 test files

**Test Files:**
1. `tests/parishioner-auth.spec.ts` (11 tests) - Authentication flow
2. `tests/parishioner-calendar.spec.ts` (11 tests) - Calendar view and events
3. `tests/parishioner-chat.spec.ts` (13 tests) - AI chat and tool use
4. `tests/parishioner-notifications.spec.ts` (9 tests) - Notification CRUD

**Test Helper:** `tests/helpers/parishioner-auth.ts`
- `setupParishionerAuth()` - Create magic link and authenticate
- Cleanup functions to prevent data leakage between tests

**Running Tests:**
```bash
npm run test                    # Run all tests
npm run test parishioner-auth   # Run auth tests only
npm run test parishioner-calendar  # Run calendar tests only
```

**Test Patterns:**
- Clean state between tests (no shared authentication)
- Role-based selectors (getByRole, getByLabel, getByTestId)
- Proper async/await usage
- Cleanup functions after each test

**For complete testing guide, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)**

---

## Future Enhancements (Phase 2)

### Phase 2: Native Mobile App

**Timeline:** 8-12 weeks after Phase 1
**Cost:** $30-40K additional

**Features:**
1. **Convert to React Native/Expo** - Reuse web app logic
2. **Push Notifications** - Native mobile push (not possible in web)
3. **App Store Distribution** - Publish to iOS App Store and Google Play
4. **Offline Mode** - Better offline support than PWA
5. **Native Calendar Integration** - Add events to device calendar
6. **Biometric Authentication** - Face ID / Touch ID support

**For complete mobile app vision, see `/requirements/2025-12-03-parishioner-mobile-app-vision.md`**

### Additional Enhancements

**Before Production:**
1. Add CSRF protection middleware (currently per-action)
2. Configure session cleanup cron job in `vercel.json`
3. Add global rate limiting middleware
4. Replace PWA icon placeholders with actual icons
5. Test in staging with real email sending
6. Add error monitoring (Sentry or similar)

**Nice to Have:**
1. SMS authentication (in addition to email)
2. Admin UI for portal management (toggle parishioner_portal_enabled)
3. Language preference persistence (currently localStorage only)
4. Voice input language selection (currently hardcoded to en-US)
5. Family data sharing opt-in/opt-out controls

**Related Documentation:**
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing patterns and authentication
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data flow and authentication patterns
- [USER_PERMISSIONS.md](./USER_PERMISSIONS.md) - Role-based access control

---

## Summary

The Parishioner Portal provides a simple, mobile-friendly interface for parishioners to manage their ministry schedules with AI assistance. Built as a responsive web app with PWA capabilities, it uses magic link authentication for passwordless access and integrates with Claude AI for conversational schedule management.

**Key Strengths:**
- Simple authentication (no passwords)
- Mobile-first design
- AI-powered assistance
- Secure session management
- Comprehensive test coverage

**Next Steps:**
- Deploy to staging for real-world testing
- Add remaining security hardening (CSRF middleware, global rate limiting)
- Gather user feedback from pilot parishes
- Plan Phase 2 native mobile app if demand warrants investment
