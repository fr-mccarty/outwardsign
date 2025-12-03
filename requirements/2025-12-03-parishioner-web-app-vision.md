# Phase 1: Parishioner Web App - Vision Document

**Created:** 2025-12-03
**Status:** Ready for Development
**Vision by:** brainstorming-agent
**Technical Requirements by:** requirements-agent
**Phase:** 1 of 2 (Web App First, Native Mobile Later)

---

## Executive Summary

We're building a **responsive web application** that parishioners can access from any device (desktop, tablet, or mobile browser) to manage their ministry schedules with an AI assistant. This is Phase 1—validate the concept, test AI engagement, and deliver value quickly before investing in native mobile apps.

**The Problem:**
Ministry coordinators struggle to communicate schedules to volunteers. Parishioners juggle ministry commitments alongside work, family, and personal obligations. They need to see their schedule at a glance, mark when they're unavailable, and get help navigating their commitments without learning complex software.

**The Solution:**
A responsive web portal with three tabs: **Calendar** (your schedule), **Chat** (AI assistant), and **Notifications** (ministry messages). Works on any device, accessible via browser, with magic link authentication.

**Why Start with Web App?**
- **Lower Risk** - Validate concept before $50K+ native app investment
- **Faster to Market** - Launch in 6-8 weeks vs. 12-16 weeks
- **Cheaper** - $10-15K vs. $50K+
- **Mobile-Ready Now** - Responsive design works on phones today
- **Test AI Chat** - See if users actually engage with AI before committing to native
- **Reusable Design** - Web UI/UX informs Phase 2 native app

**Timeline:** 6-8 weeks
**Cost:** $10-15K
**Tech Stack:** Next.js, React, Supabase (existing stack - no new infrastructure)

---

## Phasing Strategy (CONFIRMED)

### Phase 1: Web App (THIS DOCUMENT)
- Responsive web application (works on desktop, tablet, mobile browsers)
- 3-tab structure: Calendar | Chat | Notifications
- AI chat with Claude
- Email/SMS magic links for access
- Built with Next.js/React (existing stack)
- Timeline: 6-8 weeks
- Cost: $10-15K

### Phase 2: Native Mobile App (FUTURE)
- Convert web app to React Native/Expo
- Add push notifications (native capability)
- Publish to iOS/Android app stores
- Timeline: 8-12 weeks after Phase 1
- Cost: $30-40K additional
- **Note:** Existing mobile app vision document (`2025-12-03-parishioner-mobile-app-vision.md`) covers Phase 2

---

## User Personas

### Sister Bella (Primary Persona - Desktop User)
- **Role:** Lector (reader at Mass)
- **Age:** Late 50s
- **Tech Comfort:** Low (uses computer for email, basic web browsing)
- **Primary Device:** Desktop computer at home
- **Language:** English
- **Pain Points:**
  - "When am I scheduled to read?"
  - "How do I tell them I'm on vacation?"
  - "What readings do I have this Sunday?"
- **Goals:**
  - See schedule at a glance on her computer
  - Mark blackout dates easily
  - Prepare for upcoming commitments
- **Success Story:** "I check the website Saturday night and see I'm reading tomorrow at 10am Mass. I know exactly what readings I have. No stress."

### Maria (Secondary Persona - Mobile Browser User)
- **Role:** Extraordinary Minister of Holy Communion
- **Age:** Mid 30s
- **Tech Comfort:** Medium (uses social media, shopping apps on phone)
- **Primary Device:** iPhone (mobile browser)
- **Language:** Spanish
- **Pain Points:**
  - "I need to see my schedule while I'm planning my week"
  - "I want to block out dates when my kids have activities"
  - "I don't want to miss important messages from the coordinator"
- **Goals:**
  - Access schedule from her phone anytime
  - Quick way to mark unavailability
  - Stay connected without feeling overwhelmed
- **Success Story:** "I get an SMS Friday reminding me I'm scheduled Sunday. I open the link on my phone and see all my commitments for the month. When I need to block a date, I tell the AI and it's done."

### Jen (Tertiary Persona - Ministry Leader)
- **Role:** Lector Coordinator
- **Age:** Early 40s
- **Tech Comfort:** High (uses project management tools at work)
- **Primary Device:** Desktop/laptop + mobile
- **Language:** English
- **Pain Points:**
  - "Half my volunteers don't know when they're scheduled"
  - "People forget to tell me they're unavailable"
  - "I spend too much time answering basic questions"
- **Goals:**
  - Volunteers see their schedule automatically
  - Easy way for volunteers to communicate availability
  - Reduce administrative burden
- **Success Story:** "Since the portal launched, I get way fewer 'When am I scheduled?' texts. People mark their blackout dates in the portal. It's made my life so much easier."

---

## The Mental Model

### Calendar = Home Base
The Calendar tab is where parishioners live. It's their default view, their home screen, their answer to "What's happening?" Every time they access the portal, they see:
- Alert banner (if there's something urgent)
- Month calendar with visual indicators (responsive layout)
- Agenda list of upcoming commitments

**Why Calendar First?**
- The primary question is "When am I scheduled?"
- Visual calendar provides immediate context
- Returning users want to see their schedule, not navigate to it

### Chat = Helper
The AI assistant is available when you need help:
- "What are my readings this Sunday?"
- "Mark me unavailable December 20-30"
- "When is my next commitment?"

It's not the main interface—it's the helper you call when you need guidance.

**Why Chat as Support?**
- Not everyone will use AI
- Calendar should work perfectly without chat
- AI enhances the experience but isn't required

### Notifications = Inbox
Ministry messages, schedule updates, and reminders land here. It's your inbox for parish communication.

**Why Separate Notifications?**
- Clear mental model: "Messages go here"
- Doesn't clutter the calendar
- Easy to review and catch up

---

## Responsive Design Strategy

### Device Breakpoints

**Mobile Browser (< 768px) - Primary Focus**
- 70%+ of users will access on mobile
- Bottom tab navigation (native app feel)
- Compact calendar view
- Touch-optimized interactions
- Floating chat button

**Tablet (768px - 1024px) - Secondary**
- Side-by-side layouts possible
- Larger touch targets
- More content visible

**Desktop (> 1024px) - Secondary**
- Wide layouts with multiple columns
- Sidebar or top navigation
- Month calendar + agenda side-by-side
- Chat panel option (vs. full tab)

### Navigation Patterns by Device

**Mobile Browser:**
```
┌─────────────────────────────────────┐
│  Content Area                       │
│  (fills screen)                     │
│                                     │
│                                     │
│                                     │
│                      [💬 Floating]  │
├─────────────────────────────────────┤
│ [📅 Calendar] [💬 Chat] [🔔 (2)]   │
└─────────────────────────────────────┘
```
- Bottom tab bar (like native apps)
- Floating chat button on Calendar tab
- Full-screen content area

**Desktop:**
```
┌───────┬─────────────────────────────┐
│       │  Content Area               │
│       │                             │
│ Nav   │                             │
│ Tabs  │                             │
│       │              [💬 Floating]  │
│       │                             │
└───────┴─────────────────────────────┘
```
- Sidebar navigation OR
- Top tab navigation (explore both)
- Floating chat button still present

### Progressive Web App (PWA)

**Recommendation: YES - Include in Phase 1**

**Why:**
- Users can "Add to Home Screen" (acts like native app icon)
- Opens without browser chrome (feels like app)
- Offline fallback (cached schedule)
- Bridges gap until Phase 2 native app ready

**Implementation:**
- PWA manifest with icon, name, colors
- Service worker for offline caching
- Install prompt for mobile users
- "Add to Home Screen" guidance

---

## The Opening Experience

### Mobile Browser (Primary Use Case)

When Maria opens the web app on her iPhone:

```
┌─────────────────────────────────────┐
│  📅 Calendar                        │
├─────────────────────────────────────┤
│                                     │
│  [🔔 Alert Banner - Dismissible]    │
│  ⚠️ You're scheduled tomorrow!      │
│  10am Mass - Communion Minister     │
│  [View Details →]                   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📅 Diciembre 2025       [Hoy ↓]    │
│  ┌────────────────────────────┐    │
│  │ D  L  M  M  J  V  S        │    │
│  │ 1  2  3  4  5  6  7        │    │
│  │ 8  9 🔵 11 12 13 14        │    │
│  │ 15 16 17 18 19🔴 21        │    │
│  │ 22 23 24 25 26 27 28       │    │
│  │ 29 30 31                   │    │
│  └────────────────────────────┘    │
│  🔵 Programado  🔴 No disponible    │
│  [∧ Colapsar mes]                  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📋 Tu Calendario                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Domingo, 10 Dic           │   │
│  │ 10:00 AM - Ministro          │   │
│  │ Ministerio: EMHC             │   │
│  │ [Ver Detalles →]             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Domingo, 17 Dic           │   │
│  │ 5:30 PM - Ministro           │   │
│  │ Ministerio: EMHC             │   │
│  │ [Ver Detalles →]             │   │
│  └─────────────────────────────┘   │
│                                     │
│         [💬 Preguntar AI]           │
│                                     │
├─────────────────────────────────────┤
│ [📅 Calendario] [💬 Chat] [🔔 (2)] │
└─────────────────────────────────────┘
```

### Desktop (Secondary Use Case)

When Sister Bella opens the web app on her computer:

**Option A: Side-by-Side Layout**
```
┌───────┬───────────────┬───────────────────┐
│       │ 📅 Dec 2025   │ 📋 Schedule       │
│       │               │                   │
│ Nav   │  S M T W T F S│ Sun, Dec 10       │
│ Tabs  │  1 2 3 4 5 6 7│ 10am - Lector     │
│       │  8 🔵 ...     │ First Reading     │
│ 📅    │               │                   │
│ 💬    │ 🔵 Scheduled  │ Sun, Dec 17       │
│ 🔔(2) │ 🔴 Unavailable│ 5:30pm - Lector   │
│       │               │ Second Reading    │
│       │               │                   │
│       │  [💬 Ask AI]  │   [💬 Ask AI]     │
└───────┴───────────────┴───────────────────┘
```

**Option B: Full-Width Calendar Tab**
```
┌───────┬───────────────────────────────────┐
│       │  📅 Calendar                      │
│       │                                   │
│       │  [Alert Banner if urgent]         │
│ Nav   │                                   │
│ Tabs  │  [Month Calendar - Larger]        │
│       │                                   │
│ 📅    │  [Agenda List - 2 columns]        │
│ 💬    │                                   │
│ 🔔(2) │         [💬 Ask AI]               │
│       │                                   │
└───────┴───────────────────────────────────┘
```

**Open Question:** Which desktop layout? (To explore in requirements phase)

---

## Tab-by-Tab Breakdown

### Tab 1: Calendar (Default Home)

**Purpose:** Show parishioners their ministry schedule at a glance.

**Responsive Layouts:**

**Mobile:**
- Alert banner (full width, dismissible)
- Compact month calendar (collapsible)
- Agenda list (single column, scrollable)
- Floating "Ask AI" button (bottom right, thumb zone)
- Bottom tab navigation

**Desktop:**
- Alert banner (if urgent)
- Month calendar (larger, left side OR top)
- Agenda list (right side OR below, possibly 2 columns)
- Floating "Ask AI" button OR sidebar chat panel
- Sidebar OR top tab navigation

**User Actions:**
- Scroll agenda to see commitments
- Tap/click date in month to jump to that date
- Tap/click commitment card to see full details
- Collapse/expand month calendar
- Tap/click "Ask AI" to open Chat tab

**What's Shown in Agenda Cards:**
- Date and time (formatted: "Sunday, Dec 10 at 10:00 AM")
- Ministry name (Lector, EMHC, Usher, etc.)
- Role/position (First Reading, Communion Station 2, etc.)
- Visual indicator if it's soon (orange border for < 48 hours)

**What's NOT Shown:**
- Past commitments (only show upcoming)
- Detailed readings or ceremony info (that's in detail view)
- Other people's schedules (only yours)

**Edge Cases:**
- No upcoming commitments: "You're all clear! No upcoming ministry commitments."
- Blackout dates only: Month shows red dots, agenda explains
- New user: Welcome message + prompt to explore

---

### Tab 2: Chat (AI Assistant)

**Purpose:** Help parishioners interact with their schedule conversationally.

**Responsive Layouts:**

**Mobile:**
```
┌─────────────────────────────────────┐
│  💬 Chat with AI Assistant          │
├─────────────────────────────────────┤
│                                     │
│  [Quick Actions - Tappable Pills]   │
│  [📅 View Calendar]                 │
│  [📋 My Schedule]                   │
│  [🚫 Blackout Dates]                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  💬 Hi! I'm your ministry assistant.│
│  I can help you with your schedule, │
│  readings, and availability.        │
│                                     │
│  👤 When am I scheduled next?       │
│                                     │
│  💬 You're scheduled this Sunday    │
│  at 10am Mass for First Reading.    │
│  [View in Calendar →]               │
│                                     │
│  👤 What are the readings?          │
│                                     │
│  💬 First Reading: Isaiah 40:1-5    │
│  [View Full Text →]                 │
│                                     │
├─────────────────────────────────────┤
│  [Type your message...]      [🎤]   │
├─────────────────────────────────────┤
│ [📅 Calendar] [💬 Chat] [🔔 (2)]   │
└─────────────────────────────────────┘
```

**Desktop:**
- Larger chat area (more messages visible)
- Input field at bottom (wider)
- Quick action pills at top
- Voice input 🎤 optional (Web Speech API)

**Key Features:**

1. **Quick Action Pills** (Top)
   - Pre-written prompts for common tasks
   - Tapping sends that prompt to AI
   - Examples:
     - "View Calendar" → Opens Calendar tab
     - "My Schedule" → "Show me my upcoming commitments"
     - "Blackout Dates" → "Show me my unavailable dates"

2. **Conversational Interface**
   - User types or speaks
   - AI responds with helpful info
   - AI can deep-link to Calendar tab or specific dates
   - Responses are concise and actionable

3. **Voice Input (Optional - Web Speech API)**
   - 🎤 Microphone button in input field
   - Click to speak, release to send
   - **Limitation:** Web Speech API is not as robust as native
   - **Progressive Enhancement:** Works on Chrome/Edge, degrades on others

4. **Context-Aware Responses**
   - AI knows your schedule
   - AI knows your ministries
   - AI can answer: "When am I scheduled?" "What are my readings?" "Mark me unavailable December 20-30"

**Example Conversations:**

**Sister Bella (English):**
- "What are my readings this Sunday?"
- → AI shows readings with option to view full text

**Maria (Spanish):**
- "Bloquéame la semana de Navidad"
- → AI confirms dates and marks them as unavailable

**Power User:**
- "Show me all my commitments in January"
- → AI lists them with option to view in Calendar

---

### Tab 3: Notifications (Inbox)

**Purpose:** Central inbox for ministry messages, schedule updates, and reminders.

**Responsive Layouts:**

**Mobile:**
```
┌─────────────────────────────────────┐
│  🔔 Notifications                   │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔵 New                       │   │
│  │ Lector Coordinator           │   │
│  │ "Reminder: You're reading    │   │
│  │ tomorrow at 10am Mass"       │   │
│  │ 2 hours ago                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Schedule Update           │   │
│  │ "You've been scheduled for   │   │
│  │ Christmas Eve 11pm Mass"     │   │
│  │ Yesterday                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💬 Ministry Message          │   │
│  │ EMHC Coordinator             │   │
│  │ "Training session next       │   │
│  │ Saturday at 9am"             │   │
│  │ 3 days ago                   │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [📅 Calendar] [💬 Chat] [🔔 (2)]   │
└─────────────────────────────────────┘
```

**Desktop:**
- Wider notification cards (more content visible)
- Possibly 2-column layout for many notifications
- Filter/sort options at top

**Notification Types:**

1. **Ministry Messages** (from coordinators)
   - Broadcast messages to entire ministry
   - Personal messages to individual parishioners
   - Training announcements, updates, etc.

2. **Schedule Updates**
   - "You've been scheduled for..."
   - "Your schedule has changed..."
   - "You've been removed from..."

3. **Reminders**
   - "You're scheduled tomorrow!"
   - "Upcoming commitment: 2 days away"
   - "Don't forget: Christmas Eve Mass"

**User Actions:**
- Tap notification to see full message
- Mark as read
- Delete notification
- Badge count shows unread count

**Important:** No inline replies. If coordinators need responses, they use other channels (email, phone). This is a one-way communication tool for Phase 1.

---

## Weekly Notification Routing Strategy

### Communication Channels

Parishioners have a `preferred_communication_channel` in their profile:
- **Email** (default, free)
- **SMS** (~$0.01 per message)
- **WhatsApp** (~$0.005-0.05 per message)

### Weekly Reminder Flow

**3 Days Before Commitment:**

1. **System generates reminder** - "You're scheduled Sunday at 10am Mass (Lector)"
2. **Routes based on preference:**
   - Email: Sends email with magic link to web app
   - SMS: Sends text with magic link to web app
   - WhatsApp: Sends WhatsApp message with magic link to web app

3. **User clicks magic link:**
   - Opens web app in browser (desktop or mobile)
   - Authenticates automatically (magic link session)
   - Lands on Calendar tab, sees their schedule

### Magic Link Authentication

**Email Magic Link:**
- User receives: "You're scheduled Sunday! [View Schedule]"
- Click [View Schedule] → Opens web app, authenticated
- Session: 30 days
- Free (no costs)

**SMS Magic Link:**
- User receives: "You're scheduled Sunday! outwardsign.church/ml/[token]"
- Click link → Opens web app in mobile browser, authenticated
- Session: 30 days
- Cost: ~$0.01 per SMS

**WhatsApp Magic Link:**
- User receives WhatsApp message: "You're scheduled Sunday! [View Schedule]"
- Click link → Opens web app in mobile browser, authenticated
- Session: 30 days
- Cost: ~$0.005-0.05 per message

### Cost Considerations

**Email (Free):**
- No cost per message
- Default preference
- Works for most users

**SMS (Paid):**
- Use for users without email or who prefer SMS
- Hispanic families often prefer SMS
- ~$0.01 per message × 4 reminders/month = $0.04/user/month
- 100 SMS users = $4/month

**WhatsApp (Paid):**
- Use for international families or WhatsApp-only users
- ~$0.005-0.05 per message × 4 reminders/month = $0.02-0.20/user/month
- 50 WhatsApp users = $1-10/month

**Phase 1 Recommendation:**
- Email + SMS (skip WhatsApp to keep it simple)
- WhatsApp can be Phase 2 enhancement

---

## Key User Flows

### Flow 1: Sister Bella Checks Her Schedule (Desktop, Saturday Evening)

**Context:** Sister Bella wants to know if she's reading at Mass tomorrow.

**Steps:**
1. Opens browser, navigates to `outwardsign.church/portal`
2. Sees login screen with "Sign in with Email"
3. Enters email, receives magic link
4. Clicks link, lands on Calendar tab
5. Sees alert banner: "⚠️ You're scheduled tomorrow! 10am Mass - First Reading"
6. Clicks [View Details →] on banner
7. Sees full commitment card with readings
8. Clicks [View Readings] to see Scripture text
9. Feels prepared and confident

**Success:** Sister Bella knows exactly when she's scheduled and what she's reading—all in under 2 minutes from her computer.

---

### Flow 2: Maria Marks Vacation Dates (Mobile Browser, Planning Her Week)

**Context:** Maria's family is visiting grandparents December 20-30. She needs to tell the parish she's unavailable.

**Steps:**
1. Receives SMS Friday: "You're scheduled Sunday 10am! [Link]"
2. Clicks link in SMS, opens web app in Safari on iPhone
3. Lands on Calendar tab (already authenticated via magic link)
4. Scrolls agenda, sees upcoming commitments
5. Taps "💬 Ask AI" floating button
6. Says (via voice or types): "Bloquéame del 20 al 30 de diciembre"
7. AI confirms: "Marcándote no disponible 20-30 dic. ¿Notificar coordinadores?"
8. Maria: "Sí"
9. AI: "¡Listo! Tus coordinadores han sido notificados."
10. Returns to Calendar tab—red dots appear on those dates

**Success:** Maria blocked out 11 days in under a minute using natural language on her phone.

---

### Flow 3: First-Time User Opens Web App (Mobile Browser)

**Context:** New parishioner just received their first reminder email/SMS and clicks the magic link.

**Steps:**
1. Clicks magic link in email/SMS
2. Opens web app in mobile browser
3. Sees welcome screen: "Welcome to Outward Sign! We've loaded your ministry schedule."
4. [Continue] button
5. Lands on Calendar tab
6. Sees month calendar with blue dots on scheduled dates
7. Sees agenda with first 3 upcoming commitments
8. Sees tooltip: "💡 Tip: Tap 💬 Ask AI to get help anytime"
9. Scrolls agenda, explores commitments
10. Taps "Ask AI" to see what's possible

**Success:** User immediately sees their schedule and understands the portal's purpose without a tutorial.

---

### Flow 4: Ministry Coordinator Sends Broadcast Message (Web App → Portal)

**Context:** Jen (Lector Coordinator) needs to remind all lectors about training.

**Steps (Coordinator Side - Existing Web App):**
1. Logs into Outward Sign web app (desktop)
2. Goes to Lectors module
3. Clicks "Send Message to All Lectors"
4. Writes: "Reminder: Training session next Saturday at 9am in parish hall"
5. Selects notification method: "Email + SMS + In-Portal"
6. Sends message

**Steps (Parishioner Side - Portal):**
1. Notification arrives (email/SMS): "📬 New message from Lector Coordinator"
2. Clicks link in email/SMS
3. Opens web app, lands on Notifications tab
4. Sees full message at top of inbox
5. Reads message, marks as read

**Success:** Jen reaches all lectors instantly. Parishioners see the message via email/SMS and can read it in the portal.

---

### Flow 5: Parishioner Gets Weekly Reminder (3 Days Before)

**Context:** It's Thursday at 5pm. Maria is scheduled for Sunday 10am Mass.

**Steps:**
1. SMS arrives: "⏰ Recordatorio: Estás programada el domingo a las 10am (EMHC)"
2. SMS includes magic link: "Ver calendario: outwardsign.church/ml/[token]"
3. Maria clicks link
4. Opens web app in mobile browser (authenticated automatically)
5. Lands on Calendar tab, scrolled to Sunday
6. Sees commitment card highlighted with orange border (upcoming)
7. Taps [View Details] to see full info
8. Sees station assignment (Communion Station 2)
9. Mentally prepares for Sunday

**Success:** Maria gets reminded automatically 3 days before. One click shows her exactly what she's doing Sunday.

---

### Flow 6: Desktop User Asks AI for Readings (Desktop, Midweek)

**Context:** Sister Bella wants to prepare for Sunday readings on Wednesday.

**Steps:**
1. Opens web app on desktop computer
2. Lands on Calendar tab (already authenticated via previous magic link)
3. Clicks "💬 Ask AI" floating button
4. Chat tab opens (or chat panel appears on side)
5. Types: "What are my readings this Sunday?"
6. AI responds:
   - "First Reading: Isaiah 40:1-5, 9-11"
   - [View Full Text →]
7. Clicks [View Full Text]
8. Sees full Scripture text in modal or new view
9. Can print or copy text

**Success:** Sister Bella prepares for her reading midweek using conversational AI on her computer.

---

## Design Principles

### 1. Responsive First, Not Mobile-First
We're designing for ALL devices simultaneously. Mobile browsers will be 70%+ of traffic, but desktop users like Sister Bella are equally important.

**Why:** Web app must work perfectly on any screen size, not just be "mobile-adapted."

### 2. Visual First, AI as Helper
The calendar shows your schedule immediately. You don't need to ask AI—it's right there. AI is available when you want to dig deeper, ask questions, or take quick actions.

**Why:** Not everyone will use AI chat. The portal must work perfectly without it.

### 3. Respect the User's Intelligence
Don't over-explain. Don't hide functionality behind tutorials. Show the schedule, provide clear labels, and let users explore.

**Example:** No forced onboarding tour. The interface is self-explanatory.

### 4. Touch-Optimized on Mobile, Mouse-Optimized on Desktop
**Mobile:**
- Large touch targets (minimum 44x44px)
- Bottom navigation for easy reach
- Floating action button in thumb zone
- Swipe gestures where natural

**Desktop:**
- Hover states for all interactive elements
- Click targets can be smaller
- Keyboard navigation support
- Multi-column layouts

### 5. Bilingual by Default
English and Spanish are first-class citizens. Every screen, every label, every message appears in the user's chosen language.

**Why:** Many parishioners are Spanish speakers. Language choice should be effortless.

### 6. Proactive, Not Reactive
Alert banners surface important info before users ask. Email/SMS notifications remind them proactively. The portal anticipates needs.

**Example:** "You're scheduled tomorrow!" banner appears automatically.

### 7. Simple by Design, Powerful When Needed
The core experience is dead simple: see your schedule, mark when you're unavailable. But power users can dive deeper with AI chat, detailed views, and full readings.

**Why:** Sister Bella and Maria both succeed with the same portal.

### 8. Progressive Web App as Bridge to Native
PWA capabilities (Add to Home Screen, offline cache, app-like experience) bridge the gap between web browser and native app.

**Why:** Users get 80% of native app benefits while we validate concept in Phase 1.

---

## Desktop vs. Mobile Experience

### What's Different?

**Mobile Browser (Compact, Touch):**
- Bottom tab navigation (native app feel)
- Compact month calendar (collapsible)
- Single-column agenda list
- Floating chat button (thumb zone)
- Full-screen content
- Touch gestures (swipe, tap)
- Voice input (Web Speech API)

**Desktop (Wide, Mouse):**
- Sidebar OR top tab navigation
- Larger month calendar (always visible?)
- Multi-column agenda OR side-by-side month + agenda
- Chat panel option (vs. full tab)
- Hover states, tooltips
- Keyboard shortcuts
- Wider forms, more content visible

### What's the Same?

**Core Functionality:**
- 3-tab structure (Calendar, Chat, Notifications)
- Alert banner at top
- Hybrid month + agenda view
- AI chat interface
- Notification inbox
- Magic link authentication
- Bilingual support

**Design System:**
- Same colors, typography, spacing
- Same components (scaled for device)
- Same data and content
- Same AI chat behavior

---

## Progressive Web App (PWA) Features

### Phase 1 PWA Capabilities

**Must Have:**
1. **App Manifest**
   - App name, icon, theme color
   - Display mode: "standalone" (hides browser chrome)
   - Start URL: Calendar tab

2. **Service Worker**
   - Cache Calendar tab and recent data
   - Offline fallback: "You're offline. Showing cached schedule."
   - Update cache in background

3. **Add to Home Screen Prompt**
   - Show prompt on mobile after 2-3 visits
   - "Add Outward Sign to your home screen for quick access"
   - Custom icon on user's phone

4. **Offline Support (Basic)**
   - Show last-loaded schedule when offline
   - Disable AI chat (requires internet)
   - Queue actions for when reconnected (stretch goal)

**Nice to Have (Phase 1):**
5. **App-Like Behavior**
   - No browser chrome when opened from home screen
   - Splash screen with Outward Sign logo
   - Native share sheet (share schedule with family)

**Deferred to Phase 2:**
- Push notifications (web push is spotty, native is better)
- Background sync (complex for Phase 1)
- Full offline CRUD (edit schedule offline)

### PWA vs. Native App Comparison

| Feature | PWA (Phase 1) | Native App (Phase 2) |
|---------|---------------|----------------------|
| Install from web browser | ✅ Yes | ❌ No (need app stores) |
| Add to Home Screen | ✅ Yes | ✅ Yes |
| Offline access | ✅ Limited (cached data) | ✅ Full |
| Push notifications | ⚠️ Limited (web push, not reliable) | ✅ Full (FCM/APNs) |
| Access camera/contacts | ⚠️ Limited | ✅ Full |
| Performance | ✅ Good (web) | ✅ Excellent (native) |
| Publish to app stores | ❌ No | ✅ Yes |
| Cost | Low | High |
| Development time | Fast | Slow |

**Phase 1 Strategy:** Use PWA to provide app-like experience while validating concept. Then invest in native app for Phase 2 when we know users engage.

---

## Voice Input Strategy

### Web Speech API (Phase 1)

**What's Possible:**
- Browser-based speech recognition (Chrome, Edge support)
- Microphone button in chat input field
- Converts speech to text in real-time
- Free (no API costs)

**Limitations:**
- **Browser support:** Chrome/Edge ✅, Safari ⚠️, Firefox ❌
- **Accuracy:** Good for simple phrases, struggles with complex speech
- **Language switching:** User must manually switch language
- **Privacy:** Audio processed by browser (Google/Microsoft)
- **Internet required:** No offline support

**Phase 1 Implementation:**
- Add 🎤 microphone button in chat input field
- When clicked, activates Web Speech API
- Shows "Listening..." indicator
- Converts speech to text, displays in input field
- User can edit before sending
- **Progressive enhancement:** Falls back to typing if not supported

**User Experience:**
- Maria (Spanish): Clicks 🎤, says "Bloquéame del 20 al 30 de diciembre"
- Text appears in input field (editable)
- Clicks send or speaks another command
- AI processes text as if typed

### Phase 2 Native App Voice

**Future Enhancements:**
- Native speech recognition (iOS/Android SDKs)
- Better accuracy and language detection
- Offline support
- Siri/Google Assistant integration
- "Hey Siri, ask Outward Sign when I'm scheduled"

**Why Defer:** Web Speech API is "good enough" for Phase 1. Native voice will be much better, but requires native app development.

---

## Success Criteria

### User Outcomes

**For Parishioners:**
- [ ] Can see their ministry schedule in < 10 seconds of opening portal
- [ ] Can mark unavailability in < 60 seconds using AI chat
- [ ] Receive timely reminders 3 days before commitments via email/SMS
- [ ] Never miss a ministry message from coordinators
- [ ] Feel confident and prepared for ministry duties
- [ ] Portal works seamlessly on any device (phone, tablet, desktop)

**For Ministry Coordinators:**
- [ ] Fewer "When am I scheduled?" inquiries (50%+ reduction)
- [ ] More volunteers mark blackout dates proactively (30%+ increase)
- [ ] Broadcast messages reach volunteers reliably (90%+ open rate)
- [ ] Less time spent on administrative communication (2+ hours/week saved)

### Technical Success

- [ ] Portal loads Calendar tab in < 3 seconds on mobile browser (3G connection)
- [ ] Works on iOS Safari, Android Chrome, desktop Chrome/Edge/Firefox/Safari
- [ ] PWA installable on iOS and Android ("Add to Home Screen")
- [ ] Magic links authenticate in < 1 second
- [ ] AI chat responds in < 2 seconds for simple queries
- [ ] Responsive design adapts smoothly from 320px to 1920px+ width
- [ ] Handles 100+ commitments per user without performance issues

### Engagement Metrics (Phase 1 Validation)

- [ ] 50%+ of parishioners access portal within 3 months of launch
- [ ] 70%+ of traffic comes from mobile browsers
- [ ] 30%+ of users use SMS magic links (vs. email)
- [ ] 3+ chat messages per user per month (AI engagement)
- [ ] 80%+ of queries answered successfully by AI (no fallback to coordinator)
- [ ] 90%+ click-through rate on weekly reminder emails/SMS
- [ ] Average session length: 1-2 minutes (quick and efficient)

### AI Chat Validation (Critical for Phase 2 Investment)

- [ ] 80%+ of users try AI chat at least once
- [ ] 50%+ of users use AI chat weekly
- [ ] 80%+ of queries handled successfully without coordinator intervention
- [ ] Positive feedback: "AI was helpful" (NPS > 50)
- [ ] Users understand conversational interface without training

**If AI engagement is LOW (<30% weekly usage), reconsider AI in Phase 2 native app.**
**If AI engagement is HIGH (>50% weekly usage), prioritize AI in Phase 2.**

---

## What's In Scope (MVP - Phase 1)

### Core Features (Must Have for 6-8 Week Launch)

**Calendar Tab:**
- Hybrid month + agenda view (responsive)
- Alert banner for urgent items (dismissible)
- Visual indicators (blue dots for scheduled, red for unavailable)
- Collapsible month calendar (mobile)
- Upcoming commitments in agenda list (infinite scroll)
- Floating "Ask AI" button
- "Jump to Today" button
- Tap date to scroll agenda to that date

**Chat Tab:**
- AI conversational interface (Claude API)
- Quick action pills (View Calendar, My Schedule, Blackout Dates)
- Voice input (Web Speech API - progressive enhancement)
- Deep links to Calendar tab (click AI response → go to Calendar)
- Bilingual support (English & Spanish)
- Context-aware responses (knows user's schedule and ministries)

**Notifications Tab:**
- Inbox for ministry messages
- Schedule update notifications
- Reminder notifications
- Badge count on tab (unread count)
- Mark as read/delete
- Timestamps (relative: "2 hours ago")

**Weekly Reminders (Automated):**
- Send 3 days before commitment
- Route based on `preferred_communication_channel`:
  - Email (free, default)
  - SMS (~$0.01 per message)
- Magic link in email/SMS for instant access
- Content: "You're scheduled [day] at [time] - [ministry]"

**User Actions:**
- View schedule (Calendar tab)
- View commitment details (tap card → detail view)
- Mark blackout dates (via AI chat: "Block me out Dec 20-30")
- Read ministry messages (Notifications tab)
- Dismiss alert banner
- Collapse/expand month calendar
- Switch language (English ↔ Spanish)

**Authentication:**
- Magic link authentication (email + SMS)
- 30-day session
- "Sign in with Email" flow
- "Sign in with SMS" flow
- Logout

**Progressive Web App (PWA):**
- App manifest (icon, name, theme color)
- Service worker (cache Calendar + recent data)
- Add to Home Screen prompt (mobile)
- Offline fallback (show cached schedule)

**Responsive Design:**
- Mobile browser: Bottom tabs, compact calendar, touch-optimized
- Tablet: Medium layouts, larger touch targets
- Desktop: Sidebar/top tabs, multi-column layouts, mouse-optimized
- Breakpoints: 320px (mobile), 768px (tablet), 1024px+ (desktop)

### MVP Constraints

**What We're NOT Building in Phase 1:**

**Feature Deferrals:**
- ❌ Native mobile app (that's Phase 2)
- ❌ Push notifications (web push is unreliable, use email/SMS)
- ❌ In-app replies to ministry messages (one-way communication only)
- ❌ Calendar export to Google/Apple Calendar (future enhancement)
- ❌ "Swap shifts" with other volunteers (future)
- ❌ See who else is scheduled with you (future)
- ❌ WhatsApp magic links (SMS is enough for Phase 1)
- ❌ Full offline CRUD (basic caching only)
- ❌ Multi-parish support (single parish per user)
- ❌ Video/image attachments in messages (text only)

**Technical Decisions:**
- No real-time subscriptions (poll every 30 seconds on active tabs)
- No background sync (require online for actions)
- No native camera/contact access (not needed for Phase 1)
- No app store distribution (PWA only)

---

## What's Out of Scope (Future Enhancements)

### Phase 2 (Native Mobile App - 8-12 Weeks After Phase 1)

**Convert Web App to React Native:**
- iOS and Android native apps
- Publish to App Store and Google Play
- Native push notifications (FCM/APNs)
- Better offline support
- Native voice recognition (Siri/Google Assistant)
- Faster performance
- Native camera/contact access

**Enhanced Features:**
- Week view option in Calendar
- Filter calendar by ministry
- Export schedule to Apple/Google Calendar
- "Swap shifts" with other volunteers
- See who else is scheduled with you
- In-app replies to ministry messages
- Rich media notifications (images, PDFs)
- Notification preferences (timing, frequency)

### Phase 3 (Long-Term Vision)

**Social Features:**
- Ministry group chat
- Contact other volunteers directly
- Public ministry event feed

**Multi-Parish Support:**
- Switch between parishes
- Sync schedules across parishes

**Wearables:**
- Apple Watch / Wear OS app
- Glanceable schedule on wrist

**Voice Assistants:**
- "Hey Siri, when am I scheduled next?"
- "Hey Google, mark me unavailable December 20-30"

**Advanced Personalization:**
- Custom alert timing
- Ministry-specific preferences
- Accessibility features (larger text, high contrast, screen reader)

**Admin Features in Mobile:**
- Coordinators can schedule from mobile app
- Approve blackout dates from mobile
- Reply to parishioner inquiries

---

## Integration Points with Existing Outward Sign System

### Existing Web App (Coordinator Side)

**What Coordinators Do in Web App:**
- Schedule parishioners for ministry duties (existing functionality)
- View availability (blackout dates marked by parishioners in portal)
- Send broadcast messages to ministries (existing functionality)
- Manage ministry rosters (existing functionality)

**How Phase 1 Portal Connects:**
- Portal reads schedules created by coordinators (read-only)
- Blackout dates marked in portal update main database (write)
- Messages sent from web app appear in portal Notifications tab (read-only)
- Single source of truth: Supabase database (shared)

### Existing Data Models

**Tables Used by Portal:**
- `users` - Parishioner accounts (read-only)
- `parishes` - Parish info (read-only)
- `ministries` - Ministry types (Lector, EMHC, etc.) (read-only)
- `ministry_members` - Which parishioners are in which ministries (read-only)
- `ministry_events` - Scheduled commitments (read-only)
- `blackout_dates` - When parishioners are unavailable (read-write)
- `ministry_messages` - Messages from coordinators (read-only)
- `notifications` - System notifications (read-write)

**New Tables Required:**
- `portal_sessions` - Magic link sessions (30-day validity)
- `ai_chat_logs` - AI chat history for debugging and improvement
- `portal_settings` - User preferences (language, notification channel)

**Minimal Database Changes:**
- Add `preferred_communication_channel` to `users` table (email, sms, whatsapp)
- Add `last_portal_access` to `users` table (track engagement)

### Existing API Routes

**Portal will use existing server actions:**
- `getMinistryEventsForUser()` - Fetch user's schedule
- `getBlackoutDatesForUser()` - Fetch unavailable dates
- `createBlackoutDate()` - Mark date unavailable
- `deleteBlackoutDate()` - Remove blackout date
- `getNotificationsForUser()` - Fetch notifications
- `markNotificationRead()` - Mark notification as read

**New Server Actions Required:**
- `generateMagicLink()` - Create email/SMS magic link
- `validateMagicLink()` - Authenticate via magic link
- `sendWeeklyReminders()` - Automated reminder job (cron)
- `sendSMS()` - Send SMS via Twilio
- `chatWithAI()` - Proxy to Claude API with function calling

### Existing Notification System

**Current System:**
- Coordinators can send messages to ministries
- Messages stored in `ministry_messages` table
- No email/SMS notifications yet

**Phase 1 Enhancements:**
- Add email/SMS routing for messages
- Add weekly reminder automation (cron job)
- Add magic link generation for notifications
- Track delivery status (sent, opened, clicked)

---

## Visual Design Philosophy

### Color Palette

**Primary Colors:**
- **Blue** (#2563EB) - Trust, spirituality, calm
- **Purple** (#7C3AED) - Catholic liturgy, spirituality
- **Green** (#10B981) - Confirmation, success
- **Red/Orange** (#F59E0B) - Urgency, upcoming commitments
- **Gray Neutrals** - Background, secondary text

**Semantic Colors:**
- 🔵 Blue dots: Scheduled commitments
- 🔴 Red dots: Blackout dates (unavailable)
- 🟠 Orange border: Upcoming (< 48 hours)
- 🟢 Green: Success states (blackout added)

**Dark Mode:**
- Phase 1: Light mode only (80% of users prefer light for calendars)
- Phase 2: Add dark mode option

### Typography

**Web Fonts:**
- **System Font Stack** (fast, native)
  - `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`
- **Clear Hierarchy:**
  - H1: 24px (mobile), 32px (desktop) - Page titles
  - H2: 20px (mobile), 24px (desktop) - Section titles
  - Body: 16px (mobile & desktop) - Content
  - Small: 14px - Metadata, timestamps

**Readable Sizes:**
- Minimum 16px for body text
- Minimum 14px for metadata
- Line height: 1.5 for readability

### Iconography

**Icons:**
- **Lucide Icons** (existing Outward Sign icon library)
- **Simple, Universal Icons:**
  - 📅 Calendar
  - 💬 Chat
  - 🔔 Bell (Notifications)
  - 🎤 Microphone (Voice)
  - ⚠️ Alert (Warning)
- **Consistent Style:** Stroke-based, 24px, adaptable to color

### Spacing & Layout

**Spacing Scale (Tailwind):**
- 4px (1 unit), 8px (2), 12px (3), 16px (4), 24px (6), 32px (8), 48px (12)

**Layout Principles:**
- **Generous White Space** - Room to breathe, not cramped
- **Card-Based Design** - Each commitment is a card with shadow
- **Touch-Friendly Zones** - 44x44px minimum touch targets on mobile
- **Thumb Zone** - Primary actions in bottom half of screen (mobile)

### Responsive Grid

**Mobile (< 768px):**
- Single column
- Full-width cards
- Bottom tab navigation

**Tablet (768px - 1024px):**
- 2-column grids where appropriate
- Side-by-side month + agenda (landscape)
- Medium spacing

**Desktop (> 1024px):**
- Multi-column layouts
- Sidebar navigation OR top tabs
- Wider forms, more content visible

---

## Technical Philosophy (High-Level)

### Architecture Decisions

**1. Web App (Not Native)**
- **Decision:** Start with web app (Phase 1), convert to native later (Phase 2)
- **Why:**
  - Lower risk, faster development, cheaper
  - Validate concept and AI engagement before big investment
  - Responsive web works on all devices NOW

**2. Next.js 13+ with App Router**
- **Decision:** Use existing Outward Sign tech stack
- **Why:**
  - Leverage existing codebase and patterns
  - Reuse server actions, components, and database layer
  - Team already familiar with Next.js

**3. Supabase Backend**
- **Decision:** Leverage existing Supabase database
- **Why:**
  - No new API development required
  - RLS policies already enforce permissions
  - Real-time subscriptions available (future)
  - PostgreSQL for complex queries

**4. Magic Link Authentication**
- **Decision:** Email + SMS magic links (no password)
- **Why:**
  - Simplest UX for low-tech users
  - No password reset flows
  - No password security risks
  - Session: 30 days (long-lived)

**5. AI Chat with Claude API**
- **Decision:** Claude API (Anthropic) for conversational AI
- **Why:**
  - Function calling for structured actions (mark blackout dates)
  - Bilingual support (English + Spanish)
  - Context-aware responses (user's schedule)
  - Existing Outward Sign relationship with Anthropic

**6. PWA (Progressive Web App)**
- **Decision:** Include PWA capabilities in Phase 1
- **Why:**
  - Add to Home Screen (app-like experience)
  - Offline caching (show last schedule)
  - Fast loading (cached resources)
  - Bridges gap to Phase 2 native app

### Offline Strategy

**Phase 1 Approach: Cache-First with Online Actions**

**What Works Offline:**
- View last-loaded schedule (cached)
- View last-loaded notifications (cached)
- Browse calendar (cached data)

**What Requires Online:**
- AI chat (requires Claude API)
- Mark blackout dates (writes to database)
- Load fresh schedule (fetch from API)
- Send messages (writes to database)

**Phase 2 Enhancement (Native App):**
- Queue actions offline (mark blackout dates, sync later)
- Full offline CRUD
- Background sync

### Email/SMS/WhatsApp Routing

**Phase 1: Email + SMS**
- **Email:** Free (SendGrid or Resend API)
- **SMS:** Paid (~$0.01/message via Twilio)
- **WhatsApp:** Deferred to Phase 2

**Implementation:**
```typescript
// Pseudocode
function sendReminder(user, commitment) {
  const channel = user.preferred_communication_channel;
  const magicLink = generateMagicLink(user);

  if (channel === 'email') {
    sendEmail(user.email, `You're scheduled ${commitment.date}!`, magicLink);
  } else if (channel === 'sms') {
    sendSMS(user.phone, `You're scheduled ${commitment.date}! ${magicLink}`);
  }
}
```

**Cost Management:**
- Default all users to Email (free)
- Only use SMS for users who:
  - Request SMS preference
  - Don't have email
  - Are in Hispanic families (cultural preference)

### AI Chat Function Calling

**Example: Mark Blackout Dates**

**User says:** "Block me out December 20-30"

**AI processes:**
1. Parse intent: `mark_blackout_dates`
2. Extract parameters: `start_date: 2025-12-20, end_date: 2025-12-30`
3. Call function: `createBlackoutDate(user_id, start_date, end_date)`
4. Respond: "Marking you unavailable Dec 20-30. Should I notify your coordinators?"

**User says:** "Yes"

**AI processes:**
1. Parse intent: `notify_coordinators`
2. Call function: `notifyCoordinators(user_id, blackout_dates)`
3. Respond: "Done! Your coordinators have been notified."

**Claude API Function Calling:**
```json
{
  "functions": [
    {
      "name": "mark_blackout_dates",
      "description": "Mark user as unavailable for ministry commitments",
      "parameters": {
        "start_date": "string (YYYY-MM-DD)",
        "end_date": "string (YYYY-MM-DD)"
      }
    },
    {
      "name": "get_user_schedule",
      "description": "Fetch user's upcoming ministry commitments",
      "parameters": {
        "start_date": "string (optional)",
        "end_date": "string (optional)"
      }
    },
    {
      "name": "get_readings",
      "description": "Fetch liturgical readings for a commitment",
      "parameters": {
        "commitment_id": "string"
      }
    }
  ]
}
```

---

## Open Questions for Requirements Phase

### Technical Unknowns

1. **Desktop Navigation Pattern:**
   - Sidebar tabs OR top tab navigation?
   - Side-by-side month + agenda OR stacked?
   - Chat panel on side OR full-screen chat tab?
   - Which layout provides better UX for desktop users?

2. **AI Integration:**
   - Proxy Claude API through backend OR call directly from client?
   - How do we handle API costs at scale? (rate limiting, caching)
   - What's the fallback if AI is unavailable? (show error? disable chat?)
   - How do we log/debug AI conversations?

3. **Magic Link Expiration:**
   - 30-day session is long—security vs. convenience tradeoff?
   - Should magic links be one-time use OR reusable?
   - What happens if user clicks old magic link?

4. **Real-Time Updates:**
   - Do we use Supabase real-time subscriptions (live updates)?
   - OR poll every 30 seconds for new notifications/schedule changes?
   - What's the balance between freshness and server load?

5. **Voice Input:**
   - Web Speech API limitations—worth building in Phase 1?
   - OR defer to Phase 2 native app with better voice support?
   - How do we handle multi-language voice input (English + Spanish)?

6. **PWA Install Prompt:**
   - When do we show "Add to Home Screen" prompt? (2nd visit? 3rd?)
   - How persistent should the prompt be? (dismiss forever? show again?)
   - What devices should we prioritize? (iOS Safari? Android Chrome?)

7. **Notification Batching:**
   - If user has 3 commitments next week, send 3 SMS or 1 batch?
   - What's the cost vs. engagement tradeoff?
   - How do we avoid notification fatigue?

8. **Calendar Data Loading:**
   - Load all commitments at once OR paginate?
   - How far in advance do we load? (3 months? 6 months?)
   - When do we lazy-load more data (scroll threshold)?

### UX Unknowns

1. **Alert Banner Persistence:**
   - How long does an alert banner stay visible after dismissal?
   - What triggers a new alert banner? (24 hours before? new message?)
   - Can multiple alerts stack, or only one at a time?

2. **Month Calendar Interactivity:**
   - Can users add blackout dates by tapping dates in month view?
   - OR is AI chat the only way to add blackout dates?
   - Should tapping a red dot show blackout details?

3. **Commitment Detail View:**
   - What info appears on detail screen? (readings, ceremony details, location?)
   - Can users cancel/request swap from detail screen?
   - Do we show other people scheduled at same time?

4. **Language Switcher:**
   - Where does language switcher live? (Profile menu? Top right?)
   - Can user switch language mid-session (refresh required)?
   - Do we auto-detect language from browser settings?

5. **Bilingual AI Chat:**
   - Can user switch languages mid-chat? ("Respond in Spanish")
   - Does AI detect language automatically from input?
   - OR must user set language preference before chatting?

6. **Empty States:**
   - New user with no commitments—what do we show?
   - User with only blackout dates (no upcoming commitments)?
   - User with no ministries assigned yet?

7. **Notification Preferences:**
   - Can users turn off certain notification types? (reminders yes, ministry messages no?)
   - Where do users manage preferences? (Profile? Settings page?)
   - What's the default preference? (email + SMS? email only?)

8. **Chat History:**
   - Do we persist chat history across sessions?
   - OR start fresh each time user opens Chat tab?
   - Can user clear chat history?

### Product Unknowns

1. **User Onboarding:**
   - Do new users get a brief tutorial? (tooltip tour? welcome modal?)
   - OR do we rely on self-explanatory UI?
   - What's the success metric for onboarding? (complete 1 action? view calendar?)

2. **Blackout Date Management:**
   - Can users see all their blackout dates in a list view?
   - Can they edit or delete blackout dates? (via AI chat? via UI?)
   - Do we notify coordinators automatically when blackout dates are added?

3. **Ministry Message Threading:**
   - Are messages flat (inbox), or threaded (conversations)?
   - Can users search message history?
   - Do messages expire after a certain time? (30 days? 90 days?)

4. **AI Chat Limitations:**
   - What CAN'T AI do? (swap shifts? cancel commitments?)
   - How do we communicate AI capabilities to users? (help text? examples?)
   - What happens when AI can't answer a question? (show error? suggest contacting coordinator?)

5. **Weekly Reminder Timing:**
   - 3 days before is default—should users be able to customize? (1 day? 5 days?)
   - Multiple reminders? (3 days + 1 day before?)
   - What time of day do reminders send? (morning? evening? user preference?)

6. **Phase 1 to Phase 2 Transition:**
   - Do PWA users migrate automatically to native app?
   - Do we sunset web portal when native app launches?
   - OR do we maintain both (web + native) indefinitely?

7. **Analytics & Metrics:**
   - What metrics do we track in Phase 1? (page views? AI chat usage? notification opens?)
   - How do we measure success? (engagement? satisfaction? coordinator time saved?)
   - What's the go/no-go decision for Phase 2? (AI engagement threshold? user adoption rate?)

---

## Next Steps

### Immediate: Hand Off to Requirements Agent

This vision document captures the creative, user-centered design for the **Phase 1 Parishioner Web App**. Next, the **requirements-agent** will:

1. **Analyze technical implications** - How do we build this with Next.js?
2. **Define data requirements** - What APIs, database queries, and data flows are needed?
3. **Specify component structure** - Break down into pages, components, and modules
4. **Address open questions** - Resolve technical and UX unknowns
5. **Create implementation roadmap** - Phased development plan (weeks 1-8)
6. **Specify AI integration** - Claude API function calling, context management
7. **Design responsive layouts** - Mobile, tablet, desktop breakpoints
8. **Plan PWA implementation** - Manifest, service worker, offline strategy
9. **Define magic link system** - Email/SMS routing, session management

### File Management

**Current Files:**
- `/brainstorming/2025-12-03-parishioner-web-app-vision.md` ← THIS DOCUMENT (Phase 1)
- `/brainstorming/2025-12-03-parishioner-mobile-app-vision.md` ← Phase 2 (Future Native App)

**After User Approval:**
- Move THIS document to `/requirements/2025-12-03-parishioner-web-app-vision.md`
- Keep Phase 2 document in `/brainstorming/` for future reference
- requirements-agent will add technical specifications to THIS document in `/requirements/`

### User Approval Checkpoint

Before moving to requirements phase:
- [ ] User confirms Phase 1 web app approach is correct
- [ ] User approves MVP scope (3 tabs, AI chat, magic links, PWA)
- [ ] User acknowledges Phase 2 native app is deferred
- [ ] User approves email + SMS (WhatsApp deferred)
- [ ] User is ready for technical requirements analysis

---

## Summary: What We're Building (Phase 1)

A **responsive web application** that parishioners can access from any device (desktop, tablet, or mobile browser) to manage their ministry schedules with three simple tabs:

1. **📅 Calendar** - Your schedule at a glance (default home)
2. **💬 Chat** - AI assistant for questions and quick actions
3. **🔔 Notifications** - Inbox for ministry messages and reminders

**For:** Catholic parishioners volunteering in ministries (Lectors, EMHCs, Ushers, etc.)

**Why:** So they always know when they're scheduled, can easily mark unavailability, and stay connected with coordinators.

**How:** Responsive web portal built with Next.js + Supabase (existing stack), accessible via magic links (email/SMS), with AI chat (Claude), and PWA capabilities (Add to Home Screen).

**Success looks like:**
- Sister Bella checking the website Saturday night and knowing exactly when she's reading tomorrow—stress-free and prepared (desktop)
- Maria tapping an SMS link, seeing her schedule, and blocking out vacation dates in under a minute—all from her phone (mobile browser)
- Jen (coordinator) getting 50% fewer "When am I scheduled?" inquiries and seeing volunteers proactively mark blackout dates

**Phase 1 Timeline:** 6-8 weeks
**Phase 1 Cost:** $10-15K
**Phase 2 (Native App):** 8-12 weeks after Phase 1, $30-40K additional

---

# TECHNICAL REQUIREMENTS
(Added by requirements-agent on 2025-12-03)

## Overview

This section expands the vision document with comprehensive technical specifications for implementing the Parishioner Web App. The requirements are detailed enough for developer-agent to implement without ambiguity while maintaining flexibility for implementation decisions.

---

## Database Schema

### New Tables Required

#### 1. `families` Table
**Purpose:** Group parishioners into family units for shared calendar access and AI chat context.

TABLE STRUCTURE:
- id: UUID primary key
- parish_id: UUID foreign key to parishes (required)
- family_name: TEXT (e.g., "Smith Family", "Rodriguez Family")
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

RELATIONSHIPS:
- Each family belongs to one parish
- Each family can have multiple family members (via family_members table)

INDEXES:
- parish_id for filtering families by parish
- family_name for search/display

RLS POLICIES:
- Parish members can read families from their parish
- Admin/Staff can create/update/delete families
- Parishioners can only read families they belong to

---

#### 2. `family_members` Table (Junction Table)
**Purpose:** Link people to families, supporting multiple family memberships and roles.

TABLE STRUCTURE:
- id: UUID primary key
- family_id: UUID foreign key to families (required)
- person_id: UUID foreign key to people (required)
- relationship: TEXT (e.g., "parent", "child", "spouse", "extended") - optional
- is_primary_contact: BOOLEAN default false
- created_at: TIMESTAMPTZ

UNIQUE CONSTRAINT:
- (family_id, person_id) - prevent duplicate memberships

RELATIONSHIPS:
- Each family can have many people
- Each person can belong to multiple families (rare but supported)
- Links to existing people table (reuse existing infrastructure)

INDEXES:
- family_id for querying family members
- person_id for reverse lookup (which families does this person belong to)

RLS POLICIES:
- Parish members can read family_members from their parish
- Admin/Staff can create/update/delete family memberships
- Parishioners can only read family_members for families they belong to

---

#### 3. `parishioner_auth_sessions` Table
**Purpose:** Manage magic link authentication sessions for parishioners (separate from staff/admin auth).

TABLE STRUCTURE:
- id: UUID primary key
- token: TEXT unique (magic link token, hashed)
- person_id: UUID foreign key to people (required)
- parish_id: UUID foreign key to parishes (required)
- email_or_phone: TEXT (where the magic link was sent)
- delivery_method: TEXT ('email' or 'sms')
- expires_at: TIMESTAMPTZ (default 30 days from creation)
- last_accessed_at: TIMESTAMPTZ
- is_revoked: BOOLEAN default false
- created_at: TIMESTAMPTZ

RELATIONSHIPS:
- Each session belongs to one person
- Each session belongs to one parish
- Sessions are independent of Supabase auth.users (parishioners use magic links only)

INDEXES:
- token for fast lookup during authentication
- person_id for finding active sessions for a person
- expires_at for cleanup of expired sessions

RLS POLICIES:
- Service role only (no direct access from client)
- Sessions managed via server actions only

SECURITY NOTES:
- Token should be hashed before storage (use bcrypt or similar)
- Include rate limiting for magic link generation (max 3 per hour per person)
- Automatic cleanup of expired sessions (cron job or database function)

---

#### 4. `parishioner_notifications` Table
**Purpose:** Store in-app notifications for parishioners (ministry messages, schedule updates, reminders).

TABLE STRUCTURE:
- id: UUID primary key
- parish_id: UUID foreign key to parishes (required)
- person_id: UUID foreign key to people (required) - recipient
- notification_type: TEXT ('ministry_message', 'schedule_update', 'reminder', 'system')
- title: TEXT (e.g., "You're scheduled tomorrow!")
- message: TEXT (full notification content)
- sender_name: TEXT (e.g., "Lector Coordinator", "System")
- related_entity_type: TEXT optional (e.g., "mass", "group")
- related_entity_id: UUID optional (link to specific mass, group, etc.)
- is_read: BOOLEAN default false
- read_at: TIMESTAMPTZ optional
- created_at: TIMESTAMPTZ

RELATIONSHIPS:
- Each notification belongs to one parish
- Each notification is for one person (recipient)
- Optional link to related entity (mass, group, etc.)

INDEXES:
- person_id for fetching notifications for a user
- parish_id for parish-scoped queries
- is_read for filtering read/unread
- created_at for sorting by recency

RLS POLICIES:
- Parishioners can read only their own notifications
- Admin/Staff/Ministry-Leader can create notifications for parishioners
- Parishioners can update is_read and read_at on their own notifications
- No delete permission for parishioners (preserve audit trail)

---

#### 5. `parishioner_calendar_event_visibility` Table
**Purpose:** Control public/private visibility for calendar events shown to parishioners.

TABLE STRUCTURE:
- id: UUID primary key
- parish_id: UUID foreign key to parishes (required)
- event_id: UUID foreign key to events (required)
- event_source: TEXT ('parish', 'liturgical', 'mass_assignment')
- is_public: BOOLEAN default true
- visible_to_person_ids: UUID[] (specific people who can see private events) - optional
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

UNIQUE CONSTRAINT:
- (event_id, event_source) - one visibility record per event

EVENT SOURCES:
- 'parish': Events from events table (parish calendar)
- 'liturgical': Events from global_liturgical_events table
- 'mass_assignment': Ministry assignments from mass_assignments table

RELATIONSHIPS:
- Links to events table OR global_liturgical_events OR mass_assignments
- Belongs to one parish
- Optionally scoped to specific people (for private events)

INDEXES:
- event_id for fast lookup
- parish_id for parish-scoped queries
- event_source for filtering by source type

RLS POLICIES:
- Admin/Staff/Ministry-Leader can create/update visibility settings
- Parishioners can read visibility settings for events they have access to
- Public events (is_public = true): visible to all parishioners in parish
- Private events (is_public = false): visible only to people in visible_to_person_ids

---

#### 6. `ai_chat_conversations` Table
**Purpose:** Store AI chat conversations for debugging, improvement, and context persistence.

TABLE STRUCTURE:
- id: UUID primary key
- parish_id: UUID foreign key to parishes (required)
- person_id: UUID foreign key to people (required)
- session_id: UUID foreign key to parishioner_auth_sessions (required)
- conversation_history: JSONB (array of messages with role, content, timestamp)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

CONVERSATION_HISTORY STRUCTURE (JSONB):
[
  {
    "role": "user" | "assistant" | "system",
    "content": "message text",
    "timestamp": "ISO timestamp",
    "function_call": { ... } (optional - if AI called a function)
  }
]

RELATIONSHIPS:
- Each conversation belongs to one person
- Each conversation belongs to one parish
- Each conversation is linked to an auth session

INDEXES:
- person_id for retrieving conversation history
- session_id for session-scoped conversations
- created_at for chronological sorting

RLS POLICIES:
- Service role only (no direct access from client)
- Conversations managed via server actions only

DATA RETENTION:
- Keep conversations for 90 days for debugging
- Option to clear conversation history (user privacy)

---

### Modified Tables

#### `people` Table - Add Columns
ADD COLUMNS:
- preferred_communication_channel: TEXT default 'email' ('email', 'sms')
- parishioner_portal_enabled: BOOLEAN default false
- last_portal_access: TIMESTAMPTZ optional

DESCRIPTION:
- preferred_communication_channel: How this person prefers to receive reminders (email or SMS)
- parishioner_portal_enabled: Whether this person has access to parishioner portal
- last_portal_access: Track engagement for metrics

---

#### `person_blackout_dates` Table - Already Exists
NO CHANGES NEEDED - This table already exists and supports marking unavailability.

TABLE STRUCTURE (existing):
- id, person_id, parish_id, start_date, end_date, reason, created_at

USAGE:
- AI chat will create records in this table when parishioners mark blackout dates
- Calendar will read from this table to show red dots on unavailable dates
- Ministry coordinators see blackout dates in main web app

---

### Database Functions

#### Function: `get_person_family_data(person_id UUID)`
**Purpose:** Retrieve all family members and their related data for AI chat context.

RETURNS:
- Person record
- Array of family members (all people in same family/families)
- Array of all mass assignments for person + family members
- Array of all blackout dates for person + family members

LOGIC:
1. Find all families this person belongs to (via family_members)
2. Find all people in those families
3. Fetch all mass_assignments for those people
4. Fetch all person_blackout_dates for those people
5. Return aggregated data as JSONB

USAGE:
- Called by AI chat server action to build context
- Provides family-scoped knowledge base for AI responses

---

#### Function: `cleanup_expired_auth_sessions()`
**Purpose:** Automatically remove expired parishioner auth sessions.

LOGIC:
DELETE FROM parishioner_auth_sessions
WHERE expires_at < NOW()
  OR is_revoked = true

SCHEDULE:
- Run daily via database cron job or scheduled server action

---

## Authentication System

### Magic Link Flow

#### Email Magic Link
FLOW:
1. User visits `/parishioner/login`
2. User enters email address
3. Server action `generateMagicLink(email, parish_id)`:
   - Look up person by email in people table
   - Check if parishioner_portal_enabled = true
   - Generate secure token (crypto.randomBytes(32).toString('hex'))
   - Hash token before storing in parishioner_auth_sessions
   - Create session record with 30-day expiration
   - Send email with magic link: `outwardsign.church/parishioner/auth?token=[token]`
4. User clicks magic link
5. Server validates token (hash and compare)
6. Create browser session (HTTP-only cookie, 30-day expiration)
7. Redirect to `/parishioner/calendar`

---

#### SMS Magic Link
FLOW:
1. User visits `/parishioner/login`
2. User enters phone number
3. Server action `generateMagicLink(phone, parish_id)`:
   - Look up person by phone_number in people table
   - Check if parishioner_portal_enabled = true
   - Generate secure token (crypto.randomBytes(32).toString('hex'))
   - Hash token before storing in parishioner_auth_sessions
   - Create session record with 30-day expiration
   - Send SMS via Twilio: "You're scheduled Sunday! outwardsign.church/parishioner/auth?token=[token]"
4. User clicks magic link in SMS
5. Server validates token (hash and compare)
6. Create browser session (HTTP-only cookie, 30-day expiration)
7. Redirect to `/parishioner/parishioner/calendar`

---

### Session Management

SESSION STORAGE:
- Use HTTP-only cookies (secure, httpOnly, sameSite: 'lax')
- Store session_id in cookie (NOT person_id or token)
- Server looks up session in parishioner_auth_sessions by session_id
- Validate session: check expires_at, is_revoked, person_id

SESSION MIDDLEWARE:
CREATE middleware function: `requireParishionerAuth()`
LOGIC:
1. Read session_id from cookie
2. Look up session in parishioner_auth_sessions
3. Check session is valid (not expired, not revoked)
4. Return person_id and parish_id
5. If invalid: redirect to /parishioner/login

APPLY TO ROUTES:
- All routes under /parishioner/* (except /parishioner/login and /parishioner/auth)

---

### Security Considerations

RATE LIMITING:
- Max 3 magic link requests per email/phone per hour
- Prevent brute force attacks on token generation

TOKEN SECURITY:
- Use crypto.randomBytes(32) for secure random tokens
- Hash tokens before storage (bcrypt with salt)
- Never log or expose raw tokens

SESSION SECURITY:
- HTTP-only cookies (prevent XSS attacks)
- Secure flag (HTTPS only in production)
- SameSite: 'lax' (CSRF protection)
- 30-day expiration (long-lived for UX, revocable for security)

LOGOUT:
- Set is_revoked = true on session
- Clear cookie
- Redirect to /parishioner/login

---

## AI Chat Integration

### Architecture

#### Anthropic Claude API
SERVICE: Claude 3 Sonnet (or latest available model)
INTEGRATION PATTERN:
- Server-side proxy (NEVER call Claude from client)
- Server action: `chatWithAI(message, conversation_id)`
- Store API key in environment variables (never expose to client)

REASON FOR PROXY:
- Protect API key
- Control costs (rate limiting, caching)
- Log conversations for debugging
- Apply business logic (function calling, context injection)

---

### Context Building

#### Family-Scoped Knowledge Base
WHEN USER SENDS MESSAGE:
1. Get person_id from session
2. Call `get_person_family_data(person_id)`
3. Build context prompt:

SYSTEM PROMPT (pseudo-code):
```
You are a helpful ministry assistant for [Parish Name].

User: [Person Full Name]
Families: [List of family names]
Family Members: [List of all family member names]

Upcoming Ministry Commitments:
[For each mass assignment for person + family members:
 - Date, Time, Mass Type, Role, Location]

Blackout Dates:
[For each blackout date for person + family members:
 - Start Date, End Date, Reason, Who (person name)]

Current Date: [Today's date]

You can help with:
- Viewing schedule ("When am I scheduled next?")
- Viewing readings ("What are my readings this Sunday?")
- Marking unavailability ("Block me out December 20-30")
- Answering questions about family members' schedules

Always respond in the user's preferred language (English or Spanish).
Be concise, helpful, and proactive.
```

---

### Function Calling

#### Available Functions

FUNCTION 1: `mark_blackout_dates`
PARAMETERS:
- person_id: UUID (from session)
- start_date: YYYY-MM-DD
- end_date: YYYY-MM-DD
- reason: TEXT (optional)

ACTION:
- Create record in person_blackout_dates table
- Return success message

USAGE:
User: "Block me out December 20-30"
AI: Calls mark_blackout_dates(person_id, '2025-12-20', '2025-12-30', 'Vacation')
AI: Responds "Marking you unavailable Dec 20-30. Should I notify your coordinators?"

---

FUNCTION 2: `get_mass_assignments`
PARAMETERS:
- person_id: UUID (from session)
- start_date: YYYY-MM-DD (optional, default: today)
- end_date: YYYY-MM-DD (optional, default: today + 90 days)

ACTION:
- Fetch mass_assignments for this person within date range
- Return array of assignments with details

USAGE:
User: "Show me my schedule for January"
AI: Calls get_mass_assignments(person_id, '2025-01-01', '2025-01-31')
AI: Lists all assignments with dates, times, roles

---

FUNCTION 3: `get_liturgical_readings`
PARAMETERS:
- mass_assignment_id: UUID
OR
- date: YYYY-MM-DD
- mass_time: TIME

ACTION:
- Fetch readings for specific mass assignment OR mass date/time
- Look up from readings table (linked to mass)
- Return reading references and optional full text

USAGE:
User: "What are my readings this Sunday?"
AI: Identifies next Sunday mass assignment for this person
AI: Calls get_liturgical_readings(mass_assignment_id)
AI: Responds with reading references: "First Reading: Isaiah 40:1-5"

---

FUNCTION 4: `notify_coordinators`
PARAMETERS:
- person_id: UUID
- message: TEXT
- ministry_type: TEXT ('lector', 'emhc', 'usher', etc.) - optional

ACTION:
- Find ministry coordinators for this parish
- Create parishioner_notification records for coordinators
- Send email/SMS to coordinators (if preferred_communication_channel set)

USAGE:
User: "Tell the lector coordinator I can't make it Sunday"
AI: Calls notify_coordinators(person_id, "Can't make Sunday", 'lector')
AI: Responds "I've notified the lector coordinator."

---

### Conversation Persistence

STORE CONVERSATIONS:
- Each message exchange saved to ai_chat_conversations table
- conversation_history JSONB field stores full chat history
- Max history: 50 messages (trim oldest if exceeded)

RETRIEVE HISTORY:
- When user opens Chat tab, load last 10 messages
- Button: "Load More" to fetch older messages

CLEAR HISTORY:
- User can clear conversation history (privacy)
- Confirmation dialog: "This will clear your chat history. Continue?"

---

### Bilingual Support

LANGUAGE DETECTION:
APPROACH 1 (Preferred): User sets language preference in profile
- Read language preference from user_settings or people table
- Pass to Claude as system prompt: "Respond in [English/Spanish]"

APPROACH 2 (Fallback): Auto-detect from input
- Claude can detect language from user input
- System prompt: "Respond in the same language as the user's message"

LANGUAGE SWITCHING:
- User can switch mid-conversation: "Respond in Spanish"
- AI updates language for subsequent responses

---

### Cost Management

RATE LIMITING:
- Max 20 AI messages per user per day
- Show warning at 15 messages: "You have 5 messages remaining today"
- Reset daily at midnight (parish timezone)

CACHING:
- Cache common responses (e.g., "What are my readings this Sunday?")
- Use Redis or in-memory cache for frequently asked questions
- Cache TTL: 1 hour

STREAMING:
- Use Claude streaming API for better UX (show response as it's generated)
- Reduces perceived latency

---

## Calendar System

### Event Layers

#### Layer 1: Parish Events
SOURCE: events table (existing)
DESCRIPTION: Events created by parish staff (e.g., "Parish Picnic", "Choir Practice")
VISIBILITY: Controlled by parishioner_calendar_event_visibility table
VISUAL INDICATOR: Blue dot on calendar, "Parish Event" label

QUERY:
SELECT events WHERE parish_id = [user's parish]
  AND id IN (
    SELECT event_id FROM parishioner_calendar_event_visibility
    WHERE is_public = true
       OR person_id IN [user + family members]
  )

---

#### Layer 2: Liturgical Events
SOURCE: global_liturgical_events table (existing)
DESCRIPTION: Liturgical calendar events (e.g., "Advent Begins", "Easter Sunday")
VISIBILITY: All liturgical events are public (no visibility control)
VISUAL INDICATOR: Purple dot on calendar, "Liturgical Event" label

QUERY:
SELECT global_liturgical_events WHERE locale = [user's language]
  AND date BETWEEN [start_date] AND [end_date]

---

#### Layer 3: Mass Assignments
SOURCE: mass_assignments table (existing)
DESCRIPTION: Ministry/service assignments for this person (e.g., "10am Mass - Lector")
VISIBILITY: User sees only their own assignments + family members' assignments
VISUAL INDICATOR: Orange dot on calendar, "Your Assignment" label

QUERY:
SELECT mass_assignments WHERE person_id IN [user + family members]
  AND mass.date BETWEEN [start_date] AND [end_date]

---

### Visual Indicators

CALENDAR DOTS:
- Blue: Parish events (public)
- Purple: Liturgical events
- Orange: Mass assignments (user's ministry commitments)
- Red: Blackout dates (unavailable)
- Multiple dots: Multiple event types on same day

AGENDA LIST:
Each event card shows:
- Date and time (formatted: "Sunday, Dec 10 at 10:00 AM")
- Event type badge (Parish / Liturgical / Assignment)
- Event title
- Event location (if applicable)
- Ministry role (for assignments)
- Visual border (orange if < 48 hours away)

---

### Public/Private Logic

IMPLEMENTATION:
For each parish event:
1. Check parishioner_calendar_event_visibility table
2. If is_public = true: Show to all parishioners in parish
3. If is_public = false: Show only to people in visible_to_person_ids array
4. If no visibility record exists: Default to public (show to all)

For liturgical events:
- Always public (no visibility control)

For mass assignments:
- Always visible to assigned person + family members
- Never visible to other parishioners

---

## Notification System

### Notification Types

#### 1. Ministry Messages
SOURCE: Created by coordinators in main web app
TRIGGER: Coordinator sends broadcast message to ministry group OR individual parishioner
DELIVERY:
- In-app: Record created in parishioner_notifications table
- Email/SMS: Sent based on preferred_communication_channel
CONTENT:
- Title: "Message from [Coordinator Name]"
- Message: Full message text
- Sender: Ministry name (e.g., "Lector Coordinator")

---

#### 2. Schedule Updates
SOURCE: Automated when mass_assignment created/updated/deleted
TRIGGER: Ministry coordinator changes schedule
DELIVERY:
- In-app: Record created in parishioner_notifications table
- Email/SMS: Sent based on preferred_communication_channel
CONTENT:
- Title: "Schedule Update"
- Message: "You've been scheduled for [Date] at [Time] - [Role]"
OR
- Message: "Your schedule has changed for [Date]"
OR
- Message: "You've been removed from [Date] at [Time]"

---

#### 3. Reminders
SOURCE: Automated cron job
TRIGGER: 3 days before mass assignment
DELIVERY:
- In-app: Record created in parishioner_notifications table
- Email/SMS: Sent based on preferred_communication_channel
CONTENT:
- Title: "Upcoming Assignment"
- Message: "You're scheduled [Day] at [Time] - [Role]"

SCHEDULING:
- Run daily at 6am (parish timezone)
- Find all mass_assignments where mass.date = today + 3 days
- Create reminder notifications for each assignment

---

### In-App Notification Display

NOTIFICATIONS TAB:
- List all notifications (sorted by created_at desc)
- Badge count on tab shows unread count
- Each notification card shows:
  - Type icon (message/schedule/reminder)
  - Title
  - Message (truncated to 100 characters)
  - Sender name
  - Timestamp (relative: "2 hours ago", "Yesterday", "3 days ago")
  - Unread indicator (blue dot)

USER ACTIONS:
- Tap notification: Mark as read, show full message
- Swipe to delete (mobile)
- "Mark all as read" button
- Filter by type (all/messages/schedules/reminders)

---

### Email/SMS Delivery

#### Email Delivery
SERVICE: SendGrid OR Resend (existing Outward Sign email provider)
TEMPLATE:
Subject: [Title]
Body:
---
[Message]

View your schedule: [Magic Link URL]

Sent by [Parish Name]
Unsubscribe: [Link]
---

---

#### SMS Delivery
SERVICE: Twilio
TEMPLATE:
---
[Title]
[Message]
View: [Shortened Magic Link URL]
---

CHARACTER LIMIT: 160 characters (standard SMS)
LONG MESSAGES: Split into multiple SMS or truncate with "View full message: [Link]"

COST TRACKING:
- Log each SMS sent (for billing/analytics)
- Track delivery status (sent, delivered, failed)

---

## UI/UX Components

### Route Structure

NEW ROUTE GROUP: `(parishioner)`
LOCATION: `/src/app/(parishioner)/`

ROUTES:
- `/parishioner/login` - Magic link login page
- `/parishioner/auth?token=[token]` - Magic link validation endpoint
- `/parishioner/calendar` - Calendar tab (default home)
- `/parishioner/chat` - Chat tab
- `/parishioner/notifications` - Notifications tab
- `/parishioner/logout` - Logout endpoint

LAYOUT:
- Shared layout for (parishioner) route group
- Header: Parish name, language switcher, logout button
- Bottom tabs (mobile): Calendar | Chat | Notifications
- Sidebar tabs (desktop): Calendar | Chat | Notifications

---

### 3-Tab Navigation

#### Mobile (< 768px)
BOTTOM TAB BAR (fixed position):
- Tab 1: Calendar icon + "Calendar" label
- Tab 2: Chat icon + "Chat" label
- Tab 3: Bell icon + "Notifications" label (with badge count)

ACTIVE STATE:
- Active tab: Blue background, white icon
- Inactive tabs: Transparent background, gray icon

BEHAVIOR:
- Tapping tab navigates to that route
- Active tab highlighted
- Badge count on Notifications tab (unread count)

---

#### Desktop (> 1024px)
SIDEBAR OR TOP TABS (to be decided during implementation):

OPTION A: Sidebar (Left)
- Vertical tab list
- Parish logo at top
- Calendar | Chat | Notifications tabs
- Logout button at bottom

OPTION B: Top Tabs (Horizontal)
- Horizontal tab bar below header
- Calendar | Chat | Notifications tabs
- Parish logo and logout button in header

DECISION: Developer-agent should explore both options and recommend based on design patterns in existing app

---

### Calendar Tab Components

#### Alert Banner
LOCATION: Top of Calendar tab (above month calendar)
WHEN TO SHOW:
- User has assignment < 24 hours away
- New ministry message (unread)
- Important system notification

CONTENT:
- Icon (warning triangle for urgent, info for normal)
- Message text (e.g., "You're scheduled tomorrow! 10am Mass - Lector")
- Action button: "View Details" (navigates to event detail)
- Dismiss button (X icon)

DISMISSAL:
- User can dismiss banner
- Dismissed state stored in localStorage (per alert ID)
- Alert reappears if new urgent item arrives

---

#### Month Calendar
LAYOUT:
- Standard month grid (7 columns for days of week)
- Current month + navigation arrows (previous/next month)
- "Jump to Today" button
- Visual indicators (colored dots) on dates with events

DOTS:
- Blue: Parish events
- Purple: Liturgical events
- Orange: Mass assignments
- Red: Blackout dates
- Multiple dots: Stack vertically or show count badge

INTERACTIONS:
- Tap date: Scroll agenda list to that date
- Tap dot: Show event preview tooltip (desktop only)

COLLAPSIBLE (Mobile):
- "Collapse" button to hide month calendar (save screen space)
- "Expand" button to show month calendar
- State saved in localStorage

---

#### Agenda List
LAYOUT:
- Chronological list of upcoming events (next 90 days)
- Grouped by date (e.g., "Sunday, Dec 10")
- Each event card shows:
  - Time (if not all-day)
  - Event title
  - Event type badge
  - Location (if applicable)
  - Ministry role (for assignments)
  - Orange border if < 48 hours away

INFINITE SCROLL:
- Load 30 days initially
- Load more as user scrolls (30 days at a time)

EMPTY STATE:
- "You're all clear! No upcoming commitments."
- "Explore Chat to ask about your schedule."

---

#### Floating "Ask AI" Button
POSITION: Bottom right corner (mobile) OR bottom right of content area (desktop)
APPEARANCE: Circular button, chat bubble icon, primary color
BEHAVIOR: Tap to navigate to Chat tab

---

### Chat Tab Components

#### Quick Action Pills
LOCATION: Top of Chat tab (above conversation area)
PILLS:
- "View Calendar" - Opens Calendar tab
- "My Schedule" - Sends "Show me my upcoming commitments" to AI
- "Blackout Dates" - Sends "Show me my unavailable dates" to AI

BEHAVIOR:
- Tap pill: Send pre-written prompt to AI OR navigate to another tab
- Pills scroll horizontally on mobile (if too many)

---

#### Conversation Area
LAYOUT:
- Messages displayed in chat bubbles
- User messages: Right-aligned, blue background
- AI messages: Left-aligned, gray background
- Timestamps below each message (relative time)

SCROLLING:
- Auto-scroll to bottom when new message arrives
- "Load More" button at top to fetch older messages

EMPTY STATE:
- Welcome message: "Hi! I'm your ministry assistant. I can help you with your schedule, readings, and availability."
- Suggested prompts: "When am I scheduled next?" "Mark me unavailable [dates]"

---

#### Input Field
LOCATION: Bottom of Chat tab (fixed position)
COMPONENTS:
- Text input (auto-expand as user types, max 3 lines)
- Send button (paper plane icon)
- Microphone button (🎤) - optional (Web Speech API)

VOICE INPUT (Progressive Enhancement):
- Show microphone button only if Web Speech API supported (Chrome, Edge)
- Tap microphone: Start listening (show "Listening..." indicator)
- User speaks: Convert speech to text, display in input field
- User can edit before sending
- Fallback: Hide microphone button if not supported

---

### Notifications Tab Components

#### Notification List
LAYOUT:
- List of notification cards (sorted by created_at desc)
- Each card shows:
  - Type icon (message/schedule/reminder)
  - Title (bold)
  - Message snippet (100 characters)
  - Sender name
  - Timestamp (relative)
  - Unread indicator (blue dot on left)

INTERACTIONS:
- Tap card: Expand to show full message, mark as read
- Swipe left (mobile): Show delete button
- Tap delete: Remove notification

EMPTY STATE:
- "No notifications yet. We'll let you know when there's something new."

---

#### Filter Buttons
LOCATION: Top of Notifications tab
OPTIONS:
- "All" (default)
- "Messages"
- "Schedules"
- "Reminders"

BEHAVIOR:
- Tap filter: Show only notifications of that type
- Active filter highlighted

---

#### "Mark All as Read" Button
LOCATION: Top right of Notifications tab
BEHAVIOR: Mark all notifications as read, clear badge count

---

### Responsive Design Patterns

#### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

#### Mobile-Specific Patterns
- Bottom tab navigation (fixed position)
- Compact calendar (collapsible)
- Single-column agenda list
- Floating action button (Ask AI)
- Touch-optimized (44x44px minimum tap targets)
- Swipe gestures (e.g., swipe to delete notification)

#### Desktop-Specific Patterns
- Sidebar OR top tab navigation
- Larger month calendar (always visible)
- Multi-column layouts possible (month + agenda side-by-side)
- Hover states on interactive elements
- Keyboard navigation support
- Wider forms and content areas

---

## Server Actions

### Authentication Actions

ACTION: `generateMagicLink(emailOrPhone: string, parishId: string)`
PURPOSE: Generate magic link and send via email or SMS
LOGIC:
1. Determine if emailOrPhone is email or phone (regex)
2. Look up person in people table by email OR phone_number
3. Verify person belongs to parish (parish_id match)
4. Verify parishioner_portal_enabled = true
5. Generate secure token (crypto.randomBytes(32))
6. Hash token (bcrypt)
7. Create session in parishioner_auth_sessions (30-day expiration)
8. If email: Send email with magic link
9. If phone: Send SMS with magic link
10. Return success (don't expose if person exists - security)

ERROR HANDLING:
- Rate limit exceeded: "Too many requests. Please try again later."
- Person not found: "We couldn't find your account. Please contact your parish."
- Portal disabled: "Your account doesn't have portal access. Please contact your parish."

---

ACTION: `validateMagicLink(token: string)`
PURPOSE: Validate magic link token and create browser session
LOGIC:
1. Hash incoming token
2. Look up session in parishioner_auth_sessions by hashed token
3. Verify session is valid (not expired, not revoked)
4. Update last_accessed_at timestamp
5. Create browser session (HTTP-only cookie with session_id)
6. Return person_id and parish_id

ERROR HANDLING:
- Invalid token: Redirect to /parishioner/login with error message
- Expired session: "This link has expired. Please request a new one."
- Revoked session: "This link is no longer valid. Please request a new one."

---

ACTION: `logout()`
PURPOSE: Revoke session and clear cookie
LOGIC:
1. Get session_id from cookie
2. Update is_revoked = true in parishioner_auth_sessions
3. Clear session cookie
4. Redirect to /parishioner/login

---

### Calendar Actions

ACTION: `getCalendarEvents(personId: string, startDate: string, endDate: string)`
PURPOSE: Fetch all calendar events for person (parish, liturgical, assignments)
LOGIC:
1. Verify authentication (session middleware)
2. Get family members for this person (via family_members table)
3. Fetch parish events (from events + parishioner_calendar_event_visibility)
4. Fetch liturgical events (from global_liturgical_events)
5. Fetch mass assignments (from mass_assignments for person + family)
6. Fetch blackout dates (from person_blackout_dates for person)
7. Merge all events into single array with type indicators
8. Return sorted by date

RETURN TYPE:
Array of {
  id, type (parish/liturgical/assignment/blackout), title, date, time,
  location, role (for assignments), is_public, ...
}

---

### Notification Actions

ACTION: `getNotifications(personId: string, limit: number, offset: number)`
PURPOSE: Fetch notifications for person (paginated)
LOGIC:
1. Verify authentication
2. Query parishioner_notifications WHERE person_id = personId
3. Sort by created_at desc
4. Limit and offset for pagination
5. Return array of notifications + total count

---

ACTION: `markNotificationRead(notificationId: string)`
PURPOSE: Mark notification as read
LOGIC:
1. Verify authentication
2. Verify notification belongs to authenticated person
3. Update is_read = true, read_at = NOW()
4. Return success

---

ACTION: `deleteNotification(notificationId: string)`
PURPOSE: Delete notification
LOGIC:
1. Verify authentication
2. Verify notification belongs to authenticated person
3. Delete notification record
4. Return success

---

ACTION: `markAllNotificationsRead(personId: string)`
PURPOSE: Mark all notifications as read for person
LOGIC:
1. Verify authentication
2. Update all notifications WHERE person_id = personId SET is_read = true
3. Return success

---

### AI Chat Actions

ACTION: `chatWithAI(message: string, conversationId: string | null)`
PURPOSE: Send user message to Claude API and return response
LOGIC:
1. Verify authentication
2. Get person_id from session
3. Build AI context (call get_person_family_data function)
4. If conversationId: Load existing conversation history
5. Append user message to conversation history
6. Call Claude API with system prompt + conversation history
7. Process function calls (if AI calls mark_blackout_dates, etc.)
8. Append AI response to conversation history
9. Save conversation to ai_chat_conversations table
10. Return AI response

STREAMING (optional):
- Use Claude streaming API for better UX
- Return ReadableStream to client
- Client displays response as it arrives

ERROR HANDLING:
- API error: "I'm having trouble connecting. Please try again."
- Rate limit: "You've reached your daily message limit. Try again tomorrow."

---

### Blackout Date Actions

ACTION: `createBlackoutDate(personId: string, startDate: string, endDate: string, reason: string | null)`
PURPOSE: Mark person as unavailable for dates
LOGIC:
1. Verify authentication
2. Verify personId matches authenticated person
3. Create record in person_blackout_dates table
4. Optionally notify coordinators (if user requested)
5. Return success

---

ACTION: `deleteBlackoutDate(blackoutDateId: string)`
PURPOSE: Remove blackout date
LOGIC:
1. Verify authentication
2. Verify blackout date belongs to authenticated person
3. Delete record from person_blackout_dates
4. Return success

---

## Testing Requirements

### Authentication Tests
- Magic link generation (email and SMS)
- Token validation (valid, expired, revoked)
- Session creation and validation
- Logout flow
- Rate limiting (max 3 requests per hour)

### Calendar Tests
- Fetch parish events (public and private)
- Fetch liturgical events
- Fetch mass assignments (person + family)
- Fetch blackout dates
- Event filtering by date range
- Multi-layer event display (3 event types on same day)

### AI Chat Tests
- Context building (family-scoped data)
- Function calling (mark blackout dates, get schedule, get readings)
- Conversation persistence
- Rate limiting (max 20 messages per day)
- Bilingual support (English and Spanish)

### Notification Tests
- Create notifications (ministry messages, schedule updates, reminders)
- Mark as read
- Delete notifications
- Badge count calculation

### UI Tests
- Responsive design (mobile, tablet, desktop breakpoints)
- Tab navigation (bottom tabs on mobile, sidebar on desktop)
- Calendar display (month grid, agenda list, dots)
- Chat interface (messages, input field, quick actions)
- Notification list (cards, filters, mark all read)

---

## Documentation Updates

### Module Registry
ADD SECTION: "Parishioner Portal Module"
ROUTE: `/parishioner/*`
DESCRIPTION: "Parishioner-facing web portal for viewing ministry schedules, AI chat assistant, and notifications"
INTERNATIONALIZATION: English and Spanish

### Component Registry
ADD COMPONENTS:
- `ParishionerAuthGuard` - Middleware for parishioner authentication
- `CalendarTab` - Calendar view component
- `ChatTab` - AI chat interface component
- `NotificationsTab` - Notification list component
- `MonthCalendar` - Month grid with event dots
- `AgendaList` - Chronological event list
- `NotificationCard` - Individual notification display
- `MagicLinkLoginForm` - Email/SMS login form

### CLAUDE.md Updates
ADD SECTION: "Parishioner Portal"
REFERENCE: Link to this requirements document
CRITICAL PATTERNS:
- Magic link authentication (separate from staff auth)
- Family-scoped data access
- AI chat integration patterns

---

## Security Considerations

### Authentication
- Magic link tokens hashed before storage (bcrypt)
- HTTP-only cookies (prevent XSS)
- Secure cookies in production (HTTPS only)
- SameSite: 'lax' (CSRF protection)
- Rate limiting on magic link generation (max 3 per hour)
- Session expiration (30 days, but revocable)

### Data Access
- RLS policies enforce family-scoped access
- Parishioners can only see:
  - Their own data + family members' data
  - Public parish events
  - Liturgical events
- Parishioners CANNOT see:
  - Other parishioners' data
  - Private parish events (unless explicitly shared)
  - Ministry coordinator tools

### AI Chat
- API key never exposed to client (server-side proxy)
- Rate limiting (max 20 messages per day)
- Conversation logging for debugging (90-day retention)
- User can clear conversation history (privacy)

### Notifications
- Parishioners can only read/update/delete their own notifications
- No cross-user notification access

---

## Dependencies and Blockers

### External Services Required
1. **Twilio Account** (SMS delivery)
   - Sign up for Twilio account
   - Configure phone number
   - Add credentials to environment variables

2. **Email Service** (SendGrid or Resend)
   - Already exists in Outward Sign? (verify)
   - Configure magic link email template

3. **Anthropic Claude API**
   - Sign up for Claude API account
   - Add API key to environment variables
   - Set up billing/usage limits

### Database Prerequisites
1. **Families Table** - Must be created before parishioner portal
2. **Family Members Table** - Must be created before family-scoped access
3. **Migration for `people` table** - Add preferred_communication_channel, parishioner_portal_enabled, last_portal_access columns

### Codebase Dependencies
1. **Existing mass_assignments table** - Verify structure supports parishioner access
2. **Existing person_blackout_dates table** - Verify structure (already exists)
3. **Existing global_liturgical_events table** - Verify structure (already exists)

---

## Documentation Inconsistencies Found

### 1. User Permissions Documentation
LOCATION: `docs/USER_PERMISSIONS.md`
ISSUE: Parishioner role is defined but parishioner portal is not yet implemented
RESOLUTION: This requirements document defines the implementation for parishioner portal

### 2. Database Schema Documentation
LOCATION: `docs/DATABASE.md`
ISSUE: No mention of family structure or family-scoped access patterns
RESOLUTION: This requirements document defines new tables (families, family_members) and access patterns

### 3. Authentication Patterns
LOCATION: `docs/ARCHITECTURE.md`
ISSUE: Only covers admin/staff/ministry-leader authentication via Supabase Auth
RESOLUTION: This requirements document defines separate magic link authentication for parishioners

---

## Implementation Complexity

COMPLEXITY RATING: High

REASON:
- New authentication system (magic link) separate from existing Supabase Auth
- New database structure (families, family members)
- AI integration (Claude API with function calling and context building)
- Three distinct calendar event layers with complex visibility logic
- Responsive design for mobile, tablet, and desktop
- Bilingual support (English and Spanish)
- Real-time-ish updates for notifications (polling or subscriptions TBD)

MAJOR CHALLENGES:
1. **Family-scoped data access** - Complex RLS policies and data fetching
2. **AI context building** - Efficiently fetching all relevant data for AI prompts
3. **Magic link security** - Ensuring tokens are secure, sessions are validated
4. **Multi-layer calendar** - Merging 3 event sources (parish, liturgical, assignments) with different visibility rules
5. **Responsive navigation** - Bottom tabs (mobile) vs sidebar/top tabs (desktop)
6. **Cost management** - Rate limiting AI messages and SMS delivery

ESTIMATED DEVELOPMENT TIMELINE:
Focus on completing features, not predicting time or cost. Implementation should be broken into phases:
- Phase 1A: Authentication + Database (families, sessions)
- Phase 1B: Calendar (3 event layers, visibility)
- Phase 1C: Notifications (in-app + email/SMS)
- Phase 1D: AI Chat (Claude integration, function calling)
- Phase 1E: UI/UX Polish (responsive design, PWA)

---

## Next Steps

STATUS: Ready for Development

HAND OFF TO: developer-agent

IMPLEMENTATION ORDER (suggested):
1. **Database Schema** - Create migration files for new tables (families, family_members, parishioner_auth_sessions, parishioner_notifications, parishioner_calendar_event_visibility, ai_chat_conversations)
2. **Authentication** - Implement magic link flow (email and SMS)
3. **Calendar** - Build calendar tab with 3 event layers
4. **Notifications** - Build notification system (in-app + email/SMS delivery)
5. **AI Chat** - Integrate Claude API with function calling
6. **UI/UX** - Responsive design, PWA features

DOCUMENTATION TO UPDATE:
- MODULE_REGISTRY.md - Add parishioner portal module
- COMPONENT_REGISTRY.md - Add new components
- USER_PERMISSIONS.md - Update parishioner role with portal capabilities
- ARCHITECTURE.md - Add magic link authentication pattern
- DATABASE.md - Add new tables and relationships

TESTING PRIORITY:
- Authentication (magic links, sessions, security)
- Family-scoped data access (RLS policies)
- AI chat (function calling, context building)
- Calendar event visibility (public/private logic)

OPEN QUESTIONS FOR DEVELOPER:
1. Desktop navigation: Sidebar OR top tabs? (explore both and recommend)
2. Real-time updates: Polling OR Supabase realtime subscriptions?
3. PWA: Include in Phase 1 or defer to Phase 2?
4. Voice input: Web Speech API OR defer to Phase 2 native app?

---

**Requirements Analysis Complete**
**Status:** ✅ Ready for Development
**Technical Requirements Added by:** requirements-agent
**Date:** 2025-12-03
**Next Agent:** developer-agent
