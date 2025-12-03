# Parishioner Mobile App - Vision Document

**Created:** 2025-12-03
**Status:** Vision (awaiting technical requirements)
**Agent:** brainstorming-agent

---

## Executive Summary

We're building a **native mobile app** (iOS + Android) that puts parishioners' ministry schedules in their pocket with an AI assistant to help them manage their commitments. The app answers the fundamental questions every ministry volunteer has: "When am I scheduled?" and "What do I need to do?"

**The Problem:**
Ministry coordinators struggle to communicate schedules to volunteers. Parishioners juggle ministry commitments alongside work, family, and personal obligations. They need to see their schedule at a glance, mark when they're unavailable, and get help navigating their commitments without learning complex software.

**The Solution:**
A simple, beautiful mobile app with three tabs: **Calendar** (your schedule), **Chat** (AI assistant), and **Notifications** (ministry messages). Calendar is your home base. AI chat helps you navigate. Push notifications keep you informed.

**Why This Matters:**
Ministry volunteers are the lifeblood of parish life. Making their participation easier means more engaged parishioners, less stress for coordinators, and more joyful ministry. This app respects their time and meets them where they are—on their phones.

---

## User Personas

### Sister Bella (Primary Persona)
- **Role:** Lector (reader at Mass)
- **Age:** Late 50s
- **Tech Comfort:** Low (uses phone for calls, texts, basic apps)
- **Language:** English
- **Pain Points:**
  - "When am I scheduled to read?"
  - "How do I tell them I'm on vacation?"
  - "What readings do I have this Sunday?"
- **Goals:**
  - See schedule at a glance
  - Mark blackout dates easily
  - Prepare for upcoming commitments
- **Success Story:** "I can check my phone Saturday night and see I'm reading tomorrow at 10am Mass. I know exactly what readings I have. No stress."

### Maria (Secondary Persona)
- **Role:** Extraordinary Minister of Holy Communion
- **Age:** Mid 30s
- **Tech Comfort:** Medium (uses social media, shopping apps)
- **Language:** Spanish
- **Pain Points:**
  - "I need to see my schedule while I'm planning my week"
  - "I want to block out dates when my kids have activities"
  - "I don't want to miss important messages from the coordinator"
- **Goals:**
  - Integrate ministry schedule with family calendar
  - Quick way to mark unavailability
  - Stay connected without feeling overwhelmed
- **Success Story:** "I get a notification Friday reminding me I'm scheduled Sunday. I can see all my commitments for the month. When I need to block a date, I do it in 10 seconds."

### Jen (Tertiary Persona)
- **Role:** Ministry Leader (Lector Coordinator)
- **Age:** Early 40s
- **Tech Comfort:** High (uses project management tools at work)
- **Language:** English
- **Pain Points:**
  - "Half my volunteers don't know when they're scheduled"
  - "People forget to tell me they're unavailable"
  - "I spend too much time answering basic questions"
- **Goals:**
  - Volunteers see their schedule automatically
  - Easy way for volunteers to communicate availability
  - Reduce administrative burden
- **Success Story:** "Since the app launched, I get way fewer 'When am I scheduled?' texts. People mark their blackout dates in the app. It's made my life so much easier."

---

## The Mental Model

### Calendar = Home Base
The Calendar tab is where parishioners live. It's their default view, their home screen, their answer to "What's happening?" Every time they open the app, they see:
- Alert banner (if there's something urgent)
- Small month calendar with visual indicators
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

## The Opening Experience

When a parishioner opens the app, here's what they see:

```
┌─────────────────────────────────────┐
│  📅 Calendar Tab (Active)           │
├─────────────────────────────────────┤
│                                     │
│  [🔔 Alert Banner - Dismissible]    │
│  ⚠️ You're scheduled tomorrow!      │
│  10am Mass - First Reading          │
│  [View Details →]                   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📅 December 2025         [Today ↓] │
│  ┌────────────────────────────┐    │
│  │ S  M  T  W  T  F  S        │    │
│  │ 1  2  3  4  5  6  7        │    │
│  │ 8  9 🔵 11 12 13 14        │    │
│  │ 15 16 17 18 19🔴 21        │    │
│  │ 22 23 24 25 26 27 28       │    │
│  │ 29 30 31                   │    │
│  └────────────────────────────┘    │
│  🔵 Scheduled  🔴 Unavailable       │
│  [∧ Collapse Month]                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📋 Your Upcoming Schedule          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Sunday, Dec 10            │   │
│  │ 10:00 AM - First Reading     │   │
│  │ Ministry: Lector             │   │
│  │ [View Details →]             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Sunday, Dec 17            │   │
│  │ 5:30 PM - Communion Minister│   │
│  │ Ministry: EMHC               │   │
│  │ [View Details →]             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📅 Christmas Eve             │   │
│  │ 11:00 PM - Second Reading    │   │
│  │ Ministry: Lector             │   │
│  │ [View Details →]             │   │
│  └─────────────────────────────┘   │
│                                     │
│         [💬 Ask AI]                 │
│                                     │
├─────────────────────────────────────┤
│ [📅 Calendar] [💬 Chat] [🔔 (2)]   │
└─────────────────────────────────────┘
```

**Key Elements:**

1. **Alert Banner** (Top, Dismissible)
   - Shows most urgent/relevant info
   - "You're scheduled tomorrow!"
   - "New message from Lector Coordinator"
   - "Don't forget: Christmas Eve Midnight Mass"
   - Appears only when there's something timely
   - User can dismiss (doesn't reappear for that item)

2. **Hybrid Calendar View**
   - **Small Month Calendar:** Visual overview with dots
     - 🔵 Blue dots = Scheduled commitments
     - 🔴 Red dots = Blackout dates (unavailable)
     - Tapping a date scrolls agenda to that date
   - **Collapsible:** [∧] button minimizes month to give more space to agenda
   - **Today Button:** Quick jump back to today

3. **Agenda List** (Scrollable)
   - Cards showing upcoming commitments
   - Date, time, ministry, role
   - [View Details →] opens full commitment view
   - Infinite scroll (loads more as you scroll)

4. **Floating Chat Button** (Bottom Right)
   - 💬 "Ask AI" button
   - Always visible on Calendar tab
   - Tapping opens Chat tab

5. **Bottom Tab Navigation**
   - 📅 Calendar (default, active)
   - 💬 Chat
   - 🔔 Notifications (badge shows unread count)

---

## Tab-by-Tab Breakdown

### Tab 1: Calendar (Default Home)

**Purpose:** Show parishioners their ministry schedule at a glance.

**Visual Structure:**
- Alert banner (when relevant)
- Hybrid month + agenda view
- Floating "Ask AI" button

**User Actions:**
- Scroll agenda to see commitments
- Tap date in month to jump to that date
- Tap commitment card to see full details
- Collapse/expand month calendar
- Tap "Ask AI" to open Chat tab

**What's Shown in Agenda Cards:**
- Date and time (formatted prettily: "Sunday, Dec 10 at 10:00 AM")
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

**Visual Structure:**
```
┌─────────────────────────────────────┐
│  💬 Chat with AI Assistant          │
├─────────────────────────────────────┤
│                                     │
│  [Quick Actions - Tappable Pills]   │
│  [📅 View Calendar]                 │
│  [📋 My Schedule]                   │
│  [🚫 Blackout Dates]                │
│  [💬 Messages]                      │
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
│  👤 [Voice input 🎤]                │
│                                     │
├─────────────────────────────────────┤
│ [📅 Calendar] [💬 Chat] [🔔 (2)]   │
└─────────────────────────────────────┘
```

**Key Features:**

1. **Quick Action Pills** (Top)
   - Pre-written prompts for common tasks
   - Tapping sends that prompt to AI
   - Examples:
     - "View Calendar" → Opens Calendar tab
     - "My Schedule" → "Show me my upcoming commitments"
     - "Blackout Dates" → "Show me my unavailable dates"
     - "Messages" → Opens Notifications tab

2. **Conversational Interface**
   - User types or speaks
   - AI responds with helpful info
   - AI can deep-link to Calendar tab or specific dates
   - Responses are concise and actionable

3. **Voice Input** (Bottom)
   - 🎤 Microphone button
   - Tap to speak, release to send
   - Especially helpful for low-tech users like Sister Bella

4. **Context-Aware Responses**
   - AI knows your schedule
   - AI knows your ministries
   - AI can answer: "When am I scheduled?" "What are my readings?" "Mark me unavailable December 20-30"

**Example Conversations:**

**Sister Bella:**
- "What are my readings this Sunday?"
- → AI shows readings with option to view full text

**Maria:**
- "Block me out the week of Christmas"
- → AI confirms dates and marks them as unavailable

**Power User:**
- "Show me all my commitments in January"
- → AI lists them with option to view in Calendar

---

### Tab 3: Notifications (Inbox)

**Purpose:** Central inbox for ministry messages, schedule updates, and reminders.

**Visual Structure:**
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

**Important:** No inline replies. If coordinators need responses, they use other channels (email, phone). This is a one-way communication tool for now.

---

## Push Notification Smart Behavior

Push notifications open the app to the most contextually relevant view:

### Notification Type → Opens To

| Notification Type | Opens To | Why |
|-------------------|----------|-----|
| Event reminder ("You're scheduled tomorrow!") | **Calendar tab**, scrolled to that date | User needs to see what they're scheduled for |
| Schedule update ("You've been scheduled...") | **Calendar tab**, scrolled to that date | User wants to see new commitment in context |
| Ministry message ("Training next Saturday") | **Notifications tab** | Message is the focus, not a specific date |
| General reminder ("Mark your blackout dates") | **Notifications tab** | No specific date to show |

**Why Smart Behavior?**
- Saves users a step (don't have to navigate after opening)
- Provides immediate context (show the relevant info)
- Feels intelligent and helpful

**Implementation Note for Requirements Phase:**
- Notification payload includes `openTo` parameter
- App checks parameter on launch and navigates accordingly

---

## Key User Flows

### Flow 1: Sister Bella Checks Her Schedule (Saturday Evening)

**Context:** Sister Bella wants to know if she's reading at Mass tomorrow.

**Steps:**
1. Opens app (lands on Calendar tab)
2. Sees alert banner: "⚠️ You're scheduled tomorrow! 10am Mass - First Reading"
3. Taps [View Details →] on banner
4. Sees full commitment card with readings
5. Taps [View Readings] to see Scripture text
6. Feels prepared and confident

**Success:** Sister Bella knows exactly when she's scheduled and what she's reading—all in under 30 seconds.

---

### Flow 2: Maria Marks Vacation Dates (Planning Her Week)

**Context:** Maria's family is going to visit grandparents December 20-30. She needs to tell the parish she's unavailable.

**Steps:**
1. Opens app (lands on Calendar tab)
2. Taps "💬 Ask AI" button
3. AI chat opens with quick actions
4. Says (via voice): "Block me out December 20 through 30"
5. AI confirms: "Marking you unavailable Dec 20-30. Should I notify your coordinators?"
6. Maria: "Yes"
7. AI: "Done! Your coordinators have been notified."
8. Returns to Calendar tab—red dots appear on those dates

**Success:** Maria blocked out 11 days in under a minute using natural language. No forms, no clicking through calendars.

---

### Flow 3: New User First Opens App

**Context:** First-time user just installed the app and logs in.

**Steps:**
1. Opens app (lands on Calendar tab)
2. Sees welcome message: "Welcome to Outward Sign! We've loaded your ministry schedule."
3. Month calendar shows blue dots on scheduled dates
4. Agenda shows first 3 upcoming commitments
5. Alert banner: "💡 Tip: Tap 💬 Ask AI to get help anytime"
6. User scrolls agenda, sees all commitments
7. Taps "Ask AI" to explore

**Success:** User immediately sees their schedule and understands the app's purpose without a tutorial.

---

### Flow 4: Ministry Coordinator Sends Broadcast Message

**Context:** Jen (Lector Coordinator) needs to remind all lectors about training.

**Steps (Coordinator Side - Web App):**
1. Logs into Outward Sign web app
2. Goes to Lectors module
3. Clicks "Send Message to All Lectors"
4. Writes: "Reminder: Training session next Saturday at 9am in parish hall"
5. Sends message

**Steps (Parishioner Side - Mobile App):**
1. Push notification arrives: "📬 New message from Lector Coordinator"
2. Taps notification
3. App opens to Notifications tab
4. Sees full message at top of inbox

**Success:** Jen reaches all lectors instantly. Parishioners get notified and can read the message in one tap.

---

### Flow 5: Parishioner Gets Reminder for Tomorrow's Commitment

**Context:** It's Saturday at 5pm. Maria is scheduled for Sunday 10am Mass.

**Steps:**
1. Push notification arrives: "⏰ Reminder: You're scheduled tomorrow at 10am Mass (EMHC)"
2. Maria taps notification
3. App opens to Calendar tab, scrolled to Sunday
4. Sees commitment card highlighted
5. Taps [View Details] to see full info
6. Sees station assignment (Communion Station 2)

**Success:** Maria gets reminded automatically. One tap shows her exactly what she's doing tomorrow.

---

## Design Principles

### 1. Visual First, AI as Helper
The calendar shows your schedule immediately. You don't need to ask AI—it's right there. AI is available when you want to dig deeper, ask questions, or take quick actions.

**Why:** Not everyone will use AI chat. The app must work perfectly without it.

### 2. Respect the User's Intelligence
Don't over-explain. Don't hide functionality behind tutorials. Show the schedule, provide clear labels, and let users explore.

**Example:** No forced onboarding tour. The interface is self-explanatory.

### 3. Mobile-First, Touch-Optimized
Everything is designed for thumbs:
- Large touch targets (minimum 44x44pt)
- Bottom navigation for easy reach
- Floating action button in thumb zone
- Swipe gestures where natural

### 4. Bilingual by Default
English and Spanish are first-class citizens. Every screen, every label, every message appears in the user's chosen language.

**Why:** Many parishioners are Spanish speakers. Language choice should be effortless.

### 5. Proactive, Not Reactive
Alert banners surface important info before users ask. Push notifications remind them proactively. The app anticipates needs.

**Example:** "You're scheduled tomorrow!" banner appears automatically.

### 6. Simple by Design, Powerful When Needed
The core experience is dead simple: see your schedule, mark when you're unavailable. But power users can dive deeper with AI chat, detailed views, and full readings.

**Why:** Sister Bella and Maria both succeed with the same app.

---

## Success Criteria

### User Outcomes

**For Parishioners:**
- [ ] Can see their ministry schedule in < 5 seconds of opening app
- [ ] Can mark unavailability in < 30 seconds
- [ ] Receive timely reminders about upcoming commitments
- [ ] Never miss a ministry message from coordinators
- [ ] Feel confident and prepared for ministry duties

**For Ministry Coordinators:**
- [ ] Fewer "When am I scheduled?" inquiries
- [ ] More volunteers mark blackout dates proactively
- [ ] Broadcast messages reach volunteers reliably
- [ ] Less time spent on administrative communication

### Technical Success

- [ ] App loads Calendar tab in < 2 seconds
- [ ] Push notifications deliver within 1 minute
- [ ] Works offline (shows last-loaded schedule)
- [ ] Handles 100+ commitments per user smoothly
- [ ] Available on iOS App Store and Google Play Store

### Engagement Metrics

- [ ] 70%+ of users open app at least weekly
- [ ] 50%+ of users interact with AI chat at least once
- [ ] 90%+ of push notifications are opened
- [ ] Average session length: 30-60 seconds (quick and efficient)

---

## What's In Scope (MVP)

### Core Features (Must Have)

**Calendar Tab:**
- Hybrid month + agenda view
- Alert banner for urgent items
- Visual indicators (blue dots for scheduled, red for unavailable)
- Collapsible month calendar
- Upcoming commitments in agenda list
- Floating "Ask AI" button

**Chat Tab:**
- AI conversational interface
- Quick action pills
- Voice input (🎤)
- Deep links to Calendar tab
- Bilingual support (English & Spanish)

**Notifications Tab:**
- Inbox for ministry messages
- Schedule update notifications
- Reminder notifications
- Badge count on tab
- Mark as read/delete

**Push Notifications:**
- Event reminders (free via FCM/APNs)
- Ministry messages
- Schedule updates
- Smart behavior (context-aware opening)

**User Actions:**
- View schedule
- View commitment details
- Mark blackout dates (via AI chat)
- Read ministry messages
- Dismiss alert banner

**Authentication:**
- Secure login via existing Outward Sign accounts
- Session management
- Logout

### MVP Constraints

**What We're NOT Building in MVP:**

- ❌ Web app equivalent (this is mobile-only for now)
- ❌ In-app replies to ministry messages (one-way communication)
- ❌ Calendar export to Google/Apple Calendar (future)
- ❌ Detailed analytics dashboard (future)
- ❌ Multiple ministry profiles (single user = single parishioner)
- ❌ Admin features in mobile app (coordinators use web app)
- ❌ Video/image attachments in messages (text only)
- ❌ Multi-parish support (single parish per user)

---

## What's Out of Scope (Future Enhancements)

### Phase 2 (Post-MVP)

**Calendar Enhancements:**
- Week view option
- Filter by ministry
- Export schedule to Apple/Google Calendar
- "Swap shifts" with other volunteers

**AI Chat Enhancements:**
- Proactive suggestions ("You haven't marked blackout dates for summer yet")
- Natural language schedule changes ("Move me from 10am to 5pm")
- Ask about other parishioners' schedules (if permitted)

**Notifications Enhancements:**
- In-app replies to ministry messages
- Rich media (images, PDFs)
- Notification preferences (timing, frequency)

**Social Features:**
- See who else is scheduled with you
- Contact other volunteers directly
- Ministry group chat

**Offline Mode:**
- Full offline support (not just cached data)
- Queue actions for when online (mark blackout dates offline)

### Phase 3 (Long-Term Vision)

**Multi-Parish Support:**
- Switch between parishes
- Sync schedules across parishes

**Apple Watch / Wear OS:**
- Glanceable schedule on wrist
- Quick reminders

**Siri / Google Assistant Integration:**
- "Hey Siri, when am I scheduled next?"
- "Hey Google, mark me unavailable December 20-30"

**Advanced Personalization:**
- Custom alert timing
- Ministry-specific preferences
- Accessibility features (larger text, high contrast)

---

## Integration Points with Existing System

### Outward Sign Web App (Coordinator Side)

**What Coordinators Do in Web App:**
- Schedule parishioners for ministry duties
- View availability (blackout dates marked by parishioners in mobile app)
- Send broadcast messages to ministries
- Manage ministry rosters

**How Mobile App Connects:**
- Mobile app reads schedules created by coordinators
- Blackout dates marked in mobile app update web app database
- Messages sent from web app appear in mobile app Notifications tab
- Single source of truth: Supabase database

### Existing Data Models

**Tables Used by Mobile App:**
- `users` - Parishioner accounts
- `parishes` - Parish info
- `ministries` - Ministry types (Lector, EMHC, etc.)
- `ministry_members` - Which parishioners are in which ministries
- `ministry_events` - Scheduled commitments
- `blackout_dates` - When parishioners are unavailable
- `ministry_messages` - Messages from coordinators
- `notifications` - System notifications

**No New Tables Required for MVP** - Mobile app uses existing data structures.

---

## Visual Design Philosophy

### Color Palette
- **Primary Blue** - Trust, spirituality, calm
- **Red/Orange for Urgency** - Alerts, upcoming commitments
- **Green for Confirmation** - Success states
- **Neutral Grays** - Background, secondary text
- **High Contrast** - Accessibility-first design

### Typography
- **System Fonts** - Native iOS/Android fonts (San Francisco / Roboto)
- **Clear Hierarchy** - Headings, body, metadata
- **Readable Sizes** - Minimum 16pt for body text

### Iconography
- **Simple, Universal Icons** - Calendar 📅, Chat 💬, Bell 🔔
- **Meaningful Indicators** - Blue dots (scheduled), red dots (unavailable)
- **Consistent Style** - Same icon library throughout app

### Spacing & Layout
- **Generous White Space** - Room to breathe
- **Card-Based Design** - Each commitment is a card
- **Thumb-Friendly Zones** - Primary actions in bottom half of screen

---

## Technical Philosophy (High-Level)

### Native vs. Cross-Platform
**Decision: React Native** (single codebase for iOS + Android)

**Why:**
- Share business logic between platforms
- Faster development (one team, two apps)
- Native performance and feel
- Reuse TypeScript/React knowledge from web app

### Backend Architecture
**Decision: Leverage existing Supabase backend**

**Why:**
- No new API development required
- RLS policies already enforce permissions
- Real-time subscriptions for live updates
- PostgreSQL for complex queries

### Offline Strategy
**Decision: Cache-first with smart sync**

**Why:**
- Parishioners may open app in church (spotty wifi)
- Schedule doesn't change frequently
- Critical data loads fast from cache

### Push Notifications
**Decision: Free native push (FCM + APNs)**

**Why:**
- No third-party service costs
- Reliable delivery
- Full control over notification behavior

---

## Open Questions for Requirements Phase

### Technical Unknowns

1. **AI Integration:**
   - Should we use Claude API directly, or proxy through our backend?
   - How do we handle API costs at scale?
   - What's the fallback if AI is unavailable?

2. **Real-Time Updates:**
   - Do we use Supabase real-time subscriptions?
   - How often do we poll for schedule updates?
   - What's the balance between freshness and battery life?

3. **Voice Input:**
   - Native speech-to-text, or third-party service?
   - How do we handle multi-language voice input?
   - What's the UX for voice input failures?

4. **Push Notification Limits:**
   - How many push notifications per day is too many?
   - Should we batch notifications?
   - How do users customize notification preferences?

5. **Offline Mode:**
   - How much data do we cache locally?
   - What actions are allowed offline?
   - How do we sync when reconnected?

### UX Unknowns

1. **Alert Banner Persistence:**
   - How long does an alert banner stay visible?
   - What triggers a new alert banner?
   - Can multiple alerts stack, or only one at a time?

2. **Agenda List Pagination:**
   - How many commitments do we load initially?
   - When do we load more (infinite scroll threshold)?
   - Do we show "Load More" button, or auto-load?

3. **Month Calendar Interactivity:**
   - Can users add blackout dates by tapping dates in month view?
   - Or is AI chat the only way to add blackout dates?
   - Should tapping a red dot show blackout details?

4. **Commitment Detail View:**
   - What info appears on detail screen?
   - Can users edit/cancel from detail screen?
   - Do we show other people scheduled at same time?

5. **Bilingual UX:**
   - Where does language switcher live?
   - Can user switch language mid-session?
   - Do we auto-detect language from phone settings?

### Product Unknowns

1. **User Onboarding:**
   - Do new users get a brief tutorial?
   - Or do we rely on self-explanatory UI?
   - How do we handle users with no upcoming commitments?

2. **Ministry Message Threading:**
   - Are messages flat (inbox), or threaded (conversations)?
   - Can users search message history?
   - Do messages expire after a certain time?

3. **Blackout Date Management:**
   - Can users see all their blackout dates in a list?
   - Can they edit or delete blackout dates?
   - Do we notify coordinators when blackout dates are added?

4. **AI Chat Limitations:**
   - What can AI do vs. not do?
   - How do we communicate AI capabilities to users?
   - What happens when AI can't answer a question?

5. **Notification Preferences:**
   - Can users turn off certain notification types?
   - Do we send email if push notification fails?
   - What's the default notification schedule?

---

## Next Steps

### Immediate: Hand Off to Requirements Agent

This vision document captures the creative, user-centered design for the Parishioner Mobile App. Next, the **requirements-agent** will:

1. **Analyze technical implications** - How do we build this?
2. **Define data requirements** - What APIs, database queries, and data flows are needed?
3. **Specify component structure** - Break down into screens, components, and modules
4. **Address open questions** - Resolve technical and UX unknowns
5. **Create implementation roadmap** - Phased development plan

### User Approval Checkpoint

Before moving to development:
- [ ] User confirms vision matches their intent
- [ ] User approves MVP scope
- [ ] User acknowledges Phase 2/3 features are deferred
- [ ] User is ready for technical requirements analysis

---

## Summary: What We're Building

A **native mobile app** that puts ministry schedules in parishioners' pockets with three simple tabs:

1. **📅 Calendar** - Your schedule at a glance (default home)
2. **💬 Chat** - AI assistant for questions and quick actions
3. **🔔 Notifications** - Inbox for ministry messages and reminders

**For:** Catholic parishioners volunteering in ministries (Lectors, EMHCs, Ushers, etc.)

**Why:** So they always know when they're scheduled, can easily mark unavailability, and stay connected with coordinators.

**Success looks like:** Sister Bella checking her phone Saturday night and knowing exactly when she's reading tomorrow—stress-free and prepared.

---

**Status:** ✅ Vision Complete - Ready for Requirements Phase

**Created by:** brainstorming-agent
**Date:** 2025-12-03
**Next Agent:** requirements-agent
