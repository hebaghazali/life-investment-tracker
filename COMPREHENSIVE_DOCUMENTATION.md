# Life Investment Tracker - Comprehensive Technical Documentation

> **Last Updated**: November 29, 2025  
> **Version**: 1.5.0  
> **Status**: ✅ Production Ready | ✅ Full Feature Set Complete

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [Application Structure](#application-structure)
7. [Feature Breakdown](#feature-breakdown)
8. [Data Flow & Patterns](#data-flow--patterns)
9. [API Reference (Server Actions)](#api-reference-server-actions)
10. [Component Architecture](#component-architecture)
11. [Deployment & Configuration](#deployment--configuration)
12. [PWA Support](#pwa-support)
13. [Development Guidelines](#development-guidelines)

---

## Project Overview

### What Is This Application?

**Life Investment Tracker** is a personal journaling application that helps users track how they invest their time and energy across six core life dimensions on a daily basis.

### Core Concept

Instead of traditional journaling, users quantify their daily "investments" in:
- **Career**: Work, skills development, money-making activities
- **Health**: Physical fitness, exercise, nutrition
- **Relationships**: Family, friends, social connections
- **Wellbeing**: Mental health, emotional balance, self-care
- **Meaning**: Values, purpose, spirituality, contribution
- **Environment**: Living space, organization, surroundings

Each category is scored 0-3 daily, creating a quantitative record of life priorities over time.

### Key Features

✅ **Multi-User Support**: Full authentication with user data isolation  
✅ **Daily Entry Tracking**: Log investments, mood, energy, and reflections  
✅ **Visual Calendar**: Month view with intensity heatmap  
✅ **Tag System**: Categorize days (deep-work, social, rest, etc.)  
✅ **MVD Tracking**: Mark "Minimum Viable Days"  
✅ **Historical View**: Browse and edit past entries  
✅ **Insights Dashboard**: Comprehensive analytics with correlations and narrative summaries  
✅ **Demo Account Protection**: Middleware-based demo account restrictions  
✅ **Route Protection**: Next.js middleware for authentication

---

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │  Today Page    │  │ Calendar Page  │  │  Day Detail Page │ │
│  │  (Entry Form)  │  │  (Month View)  │  │   (Read/Edit)    │ │
│  └────────┬───────┘  └───────┬────────┘  └────────┬─────────┘ │
│           │                   │                     │           │
│           └───────────────────┴─────────────────────┘           │
│                               │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                │ Server Actions (RPC-style)
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js App Server                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Server Actions Layer                        │  │
│  │  - saveDayEntry()   - getDayEntry()                      │  │
│  │  - getAllEntries()  - clearDayEntry()                    │  │
│  │  - getEntriesForMonth()                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Authentication Layer                          │  │
│  │  - requireUser()    → Enforces auth                      │  │
│  │  - getCurrentUser() → Gets user or null                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Prisma ORM Layer                            │  │
│  │  - Type-safe database queries                            │  │
│  │  - Automatic query filtering by userId                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Neon PostgreSQL Database                       │
│                                                                  │
│  Tables:                                                         │
│  - DayEntry              (user entries)                          │
│  - Investment            (category scores)                       │
│  - InvestmentCategory    (category metadata)                     │
└─────────────────────────────────────────────────────────────────┘

                                +
┌─────────────────────────────────────────────────────────────────┐
│                  Neon Auth / Stack Auth                          │
│                  (External Identity Provider)                    │
│                                                                  │
│  - User Management                                               │
│  - Session Handling                                              │
│  - Password Security                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Server-First Architecture**: All data mutations happen server-side via Server Actions
2. **Zero-Trust Security**: Every action requires authentication
3. **User Data Isolation**: All queries automatically filtered by `userId`
4. **Type Safety**: Full TypeScript coverage from DB to UI
5. **Progressive Enhancement**: Works with JavaScript disabled (forms still submit)

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.5 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | 4.1.17 | Utility-first styling |
| **Radix UI** | Various | Accessible component primitives |
| **Lucide React** | 0.555.0 | Icon library |
| **date-fns** | 4.1.0 | Date manipulation |
| **Sonner** | 2.0.7 | Toast notifications |
| **Recharts** | 2.15.4 | Chart library for insights |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Prisma** | 6.19.0 | ORM & schema management |
| **PostgreSQL** | Latest | Primary database |
| **Stack Auth** | 2.8.54 | Authentication provider |
| **server-only** | 0.0.1 | Prevent client imports |

### Development Tools

- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **tsx**: TypeScript execution
- **pnpm**: Package management

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         DayEntry                             │
│─────────────────────────────────────────────────────────────│
│ id                String    @id @default(cuid())            │
│ userId            String    // Neon Auth user ID            │
│ date              DateTime  // Normalized to UTC midnight   │
│ mood              Int?      // 1-5 scale                    │
│ energy            Int?      // 1-5 scale                    │
│ note              String?   // Reflection text              │
│ isMinimumViableDay Boolean  @default(false)                 │
│ tags              String    @default("[]") // JSON array    │
│ createdAt         DateTime  @default(now())                 │
│ updatedAt         DateTime  @updatedAt                      │
│                                                              │
│ @@unique([userId, date])  ← One entry per user per day     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ 1:N
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                        Investment                            │
│─────────────────────────────────────────────────────────────│
│ id          String   @id @default(cuid())                   │
│ dayId       String   // FK to DayEntry                      │
│ categoryId  String   // FK to InvestmentCategory            │
│ score       Int      // 0-3                                 │
│ comment     String?  // Optional note                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ N:1
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                   InvestmentCategory                         │
│─────────────────────────────────────────────────────────────│
│ id          String   @id @default(cuid())                   │
│ name        String   @unique // "career", "health", etc.    │
│ displayName String   // "Career", "Health", etc.            │
│ description String?  // Category explanation                │
│ color       String   // Hex color for UI                    │
│ icon        String?  // Icon identifier                     │
│ createdAt   DateTime @default(now())                        │
│ updatedAt   DateTime @updatedAt                             │
└─────────────────────────────────────────────────────────────┘
```

### Table Details

#### DayEntry

Primary entity representing a single day's journal entry.

**Key Fields:**
- `userId`: References external Neon Auth user (not a Prisma relation)
- `date`: Stored as UTC midnight (`YYYY-MM-DDT00:00:00.000Z`)
- `tags`: JSON-serialized array stored as string
- `isMinimumViableDay`: Boolean flag for special tracking

**Constraints:**
- `@@unique([userId, date])`: Enforces one entry per user per day
- Allows multiple users to have entries for the same date

**Relationships:**
- One-to-many with `Investment`
- Cascade delete: Deleting a DayEntry removes all investments

#### Investment

Stores the score for a specific category on a specific day.

**Design Note:**
Each DayEntry typically has 6 Investment records (one per category), but the schema allows flexibility.

**Relationships:**
- Many-to-one with `DayEntry`
- Many-to-one with `InvestmentCategory`

#### InvestmentCategory

Master data table for investment categories.

**Purpose:**
- Stores metadata (colors, icons, descriptions)
- Enables flexible category management
- Seeded via migration, not user-created

**Seeded Categories:**
1. Career (💼)
2. Health (❤️)
3. Relationships (👥)
4. Wellbeing (🧘)
5. Meaning (✨)
6. Environment (🏡)

---

## Authentication System

### Overview

The application uses **Neon Auth** (powered by Stack Auth) for user management. This is an **external identity provider** model where user data lives outside the application database.

### Architecture Diagram

```
User Browser
     ↓
Stack Auth SDK (Client)
     ↓
Stack Auth Provider (External)
     ↓
Verified User Session
     ↓
stackServerApp.getUser()
     ↓
requireUser() / getCurrentUser()
     ↓
Server Actions (userId filtering)
     ↓
Prisma Queries (scoped to user)
```

### Key Files

#### `lib/stack.ts`

Initializes Stack Auth server configuration.

```typescript
import "server-only";
import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    home: "/",
    afterSignIn: "/today",
    afterSignUp: "/today",
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
  },
});
```

#### `lib/auth.ts`

Provides authentication helpers.

**Functions:**

```typescript
// Get current user (returns null if not authenticated)
export async function getCurrentUser(): Promise<User | null>

// Require authentication (throws if not authenticated)
export async function requireUser(): Promise<User>

// Development helper (remove in production)
export async function getDevUser(): Promise<User>
```

**Return Type:**
```typescript
{
  id: string;           // User ID from Neon Auth
  email: string | null;
  displayName: string | null;
}
```

### Authentication Flow

#### Sign Up Flow

```
1. User visits /handler/sign-up
   ↓
2. Stack Auth renders sign-up form
   ↓
3. User submits credentials
   ↓
4. Stack Auth creates user account
   ↓
5. Email verification sent (optional)
   ↓
6. User redirected to /today
   ↓
7. Session cookie set
```

#### Sign In Flow

```
1. User visits /handler/sign-in
   ↓
2. Stack Auth renders sign-in form
   ↓
3. User submits credentials
   ↓
4. Stack Auth validates credentials
   ↓
5. Session cookie set
   ↓
6. User redirected to /today
```

#### Protected Action Flow

```
1. Client calls server action (e.g., saveDayEntry)
   ↓
2. Server action calls requireUser()
   ↓
3. requireUser() calls stackServerApp.getUser()
   ↓
4. Stack Auth validates session cookie
   ↓
5a. Valid → Returns user object
5b. Invalid → Throws "Authentication required"
   ↓
6. Action proceeds with user.id
   ↓
7. Database queries filtered by userId
```

### Security Model

#### Data Isolation Strategy

**Principle:** Every database query MUST include `userId` filter.

```typescript
// ❌ NEVER: Returns all users' data
await prisma.dayEntry.findMany();

// ✅ ALWAYS: Returns only current user's data
const user = await requireUser();
await prisma.dayEntry.findMany({
  where: { userId: user.id }
});
```

#### Route Protection & Middleware

The application uses **Next.js middleware** for:
1. **Demo Account Protection**: Prevents demo account from modifying account settings
2. **Future Auth Guards**: Framework ready for automatic route protection

**Implementation:** `middleware.ts`

The middleware intercepts Stack Auth handler routes and blocks account-level operations for the demo account while allowing regular users full access.

**Protected Operations for Demo Account:**
- Account settings modifications
- Email verification changes
- Password reset/change
- Account deletion

**Demo Account:**
- Email: `test@example.com`
- Allows: Normal app usage (entries, calendar, insights)
- Blocks: Account mutations via middleware redirect

### Environment Variables

```env
# Required for production
NEXT_PUBLIC_STACK_PROJECT_ID="proj_..."
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="pkey_..."
STACK_SECRET_SERVER_KEY="skey_..."

# Database
DATABASE_URL="postgresql://..."

# Demo Account (defined in lib/constants.ts)
# DEMO_ACCOUNT_EMAIL="test@example.com"
```

### Demo Account System

The application includes a demo account feature that allows public testing while protecting account integrity.

**Key Files:**
- `lib/constants.ts`: Defines `DEMO_ACCOUNT_EMAIL`
- `lib/demoGuard.ts`: Helper functions (`isDemoEmail`, `isDemoUser`)
- `middleware.ts`: Enforces demo account restrictions

**How It Works:**
```typescript
// Check if user is demo account
const isDemoAccount = user.primaryEmail?.toLowerCase() === DEMO_ACCOUNT_EMAIL.toLowerCase();

// Block account mutations for demo
if (isDemoAccount && isBlockedPath) {
  return NextResponse.redirect('/today');
}
```

---

## Application Structure

### Directory Tree

```
life-investment-tracker/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions (API layer)
│   │   ├── dayEntry.ts           # CRUD operations for entries
│   │   └── insights.ts           # Insights data aggregation
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/    # Legacy (unused)
│   ├── auth/
│   │   ├── login/                # Legacy (unused)
│   │   └── register/             # Legacy (unused)
│   ├── calendar/                 # Calendar route
│   │   ├── CalendarClient.tsx    # Client component (state mgmt)
│   │   └── page.tsx              # Server component (data loading)
│   ├── day/
│   │   └── [date]/               # Dynamic day detail route
│   │       ├── DayPageClient.tsx # Client component
│   │       └── page.tsx          # Server component
│   ├── handler/
│   │   └── [...stack]/           # Stack Auth handler routes
│   │       ├── AuthPageWrapper.tsx # Auth page wrapper component
│   │       ├── loading.tsx       # Loading state
│   │       └── page.tsx          # Auth pages (sign-in, sign-up)
│   ├── insights/                 # Analytics and insights page
│   │   ├── InsightsPageClient.tsx # Client component (charts, filters)
│   │   └── page.tsx              # Server component (data loading)
│   ├── today/                    # Today's entry route
│   │   ├── page.tsx              # Server component
│   │   └── TodayForm.tsx         # Client form component
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout (wraps with providers)
│   ├── not-found.tsx             # 404 page
│   └── page.tsx                  # Home page (redirects to /today)
│
├── components/                   # React components
│   ├── AuthLoadingOverlay.tsx    # Loading overlay for auth operations
│   ├── calendar/                 # Calendar-specific components
│   │   ├── DayCell.tsx           # Single day in calendar grid
│   │   ├── DayDetailModal.tsx    # Edit modal
│   │   ├── DayPreviewDrawer.tsx  # Quick view drawer
│   │   └── MonthCalendar.tsx     # Main calendar component
│   ├── day/                      # Day detail page components
│   │   ├── DayInvestments.tsx    # Investment display
│   │   ├── DayKeyMetrics.tsx     # Mood/energy display
│   │   ├── DayMVDIndicator.tsx   # MVD badge
│   │   ├── DayReflection.tsx     # Note display
│   │   └── DayTags.tsx           # Tag display
│   ├── insights/                 # Insights page components
│   │   ├── CategoryBalanceChart.tsx       # Category investment chart
│   │   ├── InsightsConsistencySection.tsx # Streaks and consistency
│   │   ├── InsightsCorrelationsSection.tsx # Pattern correlations
│   │   ├── InsightsMvdSection.tsx         # MVD analytics
│   │   ├── InsightsNarrativeSummary.tsx   # AI-like narrative summary
│   │   ├── InsightsTagsSection.tsx        # Tag usage analytics
│   │   └── MoodEnergyChart.tsx            # Mood/energy trends
│   ├── layout/                   # Layout components
│   │   └── Header.tsx            # Global header (nav + auth)
│   ├── today/                    # Today page form components
│   │   ├── InvestmentCategory.tsx    # Single category input
│   │   ├── MoodEnergySelector.tsx    # 1-5 selector
│   │   ├── MVDToggle.tsx             # MVD switch
│   │   ├── ReflectionNote.tsx        # Textarea for note
│   │   └── TagSelector.tsx           # Tag checkboxes
│   └── ui/                       # Reusable UI primitives (Radix)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── chart.tsx             # Recharts wrapper components
│       ├── dialog.tsx
│       ├── label.tsx
│       ├── sheet.tsx
│       ├── switch.tsx
│       └── textarea.tsx
│
├── contexts/                     # React contexts
│   └── AuthLoadingContext.tsx    # Auth loading state management
│
├── hooks/                        # Custom React hooks
│   └── useDeleteDay.ts           # Hook for deleting entries
│
├── lib/                          # Utilities and shared logic
│   ├── auth.ts                   # Authentication helpers
│   ├── constants.ts              # App constants (category colors, demo email)
│   ├── dateUtils.ts              # Date normalization
│   ├── demoGuard.ts              # Demo account helper functions
│   ├── insights.ts               # Insights calculation utilities
│   ├── insightsSummary.ts        # Narrative summary generators
│   ├── prisma.ts                 # Prisma client singleton
│   ├── stack.ts                  # Stack Auth configuration
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utility functions (cn, etc.)
│
├── prisma/                       # Database schema and migrations
│   ├── migrations/               # Migration history
│   │   ├── 20251128141425_init/
│   │   ├── 20251128164524_add_user_id_to_day_entry/
│   │   └── 20251128171423_seed_investment_categories/
│   ├── schema.prisma             # Prisma schema definition
│   └── seed.ts                   # Database seeding script
│
├── public/                       # Static assets
│   ├── favicon.ico
│   ├── logo.png
│   └── robots.txt
│
├── AUTH_ARCHITECTURE.md                # Auth system documentation
├── COMPREHENSIVE_DOCUMENTATION.md      # This file
├── IMPLEMENTATION_SUMMARY.md           # Implementation notes
├── INSIGHTS_V1_IMPLEMENTATION_SUMMARY.md   # Insights v1 implementation
├── INSIGHTS_V1.5_IMPLEMENTATION_SUMMARY.md # Insights v1.5 upgrade
├── NEON_AUTH_SETUP.md                  # Auth setup guide
├── QUICK_START.md                      # Quick start guide
├── README.md                           # Main readme
├── components.json                     # shadcn/ui configuration
├── middleware.ts                       # Next.js middleware (demo guard)
├── next.config.js                      # Next.js configuration
├── package.json                        # Dependencies
├── postcss.config.mjs                  # PostCSS configuration
├── tailwind.config.ts                  # Tailwind configuration
├── tsconfig.json                       # TypeScript configuration
└── pnpm-lock.yaml                      # Lockfile
```

### Key Patterns

#### Server/Client Component Split

The app uses the **Server Component by default** pattern:

- **Server Components** (page.tsx): Fetch data, handle auth
- **Client Components** (ClientComponent.tsx): Interactivity, forms, state

```tsx
// app/today/page.tsx (Server Component)
export default async function TodayPage() {
  const user = await getCurrentUser();
  const entry = await getDayEntry(today);
  
  return <TodayForm initialEntry={entry} />;
}

// app/today/TodayForm.tsx (Client Component)
"use client";
export function TodayForm({ initialEntry }) {
  const [mood, setMood] = useState(initialEntry?.mood);
  // ... interactive form logic
}
```

#### Server Actions Pattern

All data mutations use Next.js Server Actions (not API routes).

**Benefits:**
- Type-safe RPC-style calls
- No need for API endpoints
- Automatic serialization
- Progressive enhancement

```tsx
// Client Component
"use client";
import { saveDayEntry } from "@/app/actions/dayEntry";

function Form() {
  const handleSave = async () => {
    await saveDayEntry({ date, mood, energy, ... });
  };
}
```

---

## Feature Breakdown

### 1. Today Page (`/today`)

**Purpose:** Log today's investments and metrics.

**Components:**
- `TodayForm`: Main form container
- `InvestmentCategory`: Score selector for each category (0-3)
- `MoodEnergySelector`: 1-5 scale selector
- `ReflectionNote`: Textarea for notes
- `TagSelector`: Multi-select for tags
- `MVDToggle`: Checkbox for Minimum Viable Day

**User Flow:**
```
1. User lands on /today
   ↓
2. Server fetches existing entry for today (if any)
   ↓
3. Form pre-fills with existing data
   ↓
4. User adjusts scores, mood, energy, note, tags
   ↓
5. User clicks "Save Today"
   ↓
6. Client calls saveDayEntry() server action
   ↓
7. Server validates auth and upserts entry
   ↓
8. Page revalidates, toast shows success
```

**State Management:**
- Local state for form inputs
- `useTransition` for pending state
- Toast notifications for feedback

**Server Action:**
- `saveDayEntry()`: Creates or updates entry for current user and date

### 2. Calendar Page (`/calendar`)

**Purpose:** View monthly overview of entries with intensity visualization.

**Components:**
- `MonthCalendar`: Main calendar container
- `DayCell`: Individual day in grid
  - Shows day number
  - Color-coded intensity (based on total investment score)
  - MVD badge if applicable
- `DayPreviewDrawer`: Quick view when clicking a day
- `DayDetailModal`: Full edit modal

**User Flow:**
```
1. User visits /calendar
   ↓
2. Server fetches entries for current month
   ↓
3. Calendar renders with color-coded days
   ↓
4. User clicks a day
   ↓
5. Preview drawer opens showing entry details
   ↓
6. User can:
   - Edit (opens full modal)
   - Delete (confirms and removes entry)
   - Close preview
   ↓
7. User navigates months with prev/next buttons
   ↓
8. Client fetches new month data via server action
```

**Intensity Color Coding:**
```typescript
Total Score | Color Class
------------|------------
0           | bg-intensity-none (light gray)
1-6         | bg-intensity-low (light blue)
7-12        | bg-intensity-medium (medium blue)
13-18       | bg-intensity-high (dark blue)
```

**Server Actions:**
- `getEntriesForMonth(year, month)`: Fetches entries for date range
- `clearDayEntry(date)`: Deletes an entry

### 3. Day Detail Page (`/day/[date]`)

**Purpose:** View and edit a specific day's entry.

**Route:** `/day/2024-11-28` (dynamic date parameter)

**Components:**
- `DayPageClient`: Client wrapper for interactivity
- `DayInvestments`: Read-only investment display
- `DayKeyMetrics`: Mood and energy display
- `DayReflection`: Note display
- `DayTags`: Tag badges
- `DayMVDIndicator`: MVD status

**User Flow:**
```
1. User navigates to /day/[date] (from calendar or direct link)
   ↓
2. Server validates date format (YYYY-MM-DD)
   ↓
3. Server fetches entry for that date
   ↓
4. If entry exists → Render details
   If no entry → Show empty state
   ↓
5. User can edit by opening modal (same form as Today page)
```

**Date Validation:**
- Regex check for `YYYY-MM-DD` format
- Date validity check (e.g., rejects Feb 30)
- 404 response for invalid dates

**Server Actions:**
- `getDayEntry(date)`: Fetches single entry

### 4. Insights Page (`/insights`)

**Status:** ✅ Fully Implemented (v1.5)

**Purpose:** Comprehensive analytics dashboard with visual trends, correlations, and narrative summaries.

**Components:**
- `InsightsPageClient`: Main container with sticky filters
- `CategoryBalanceChart`: Radar chart of investment distribution
- `MoodEnergyChart`: Line chart showing mood/energy trends over time
- `InsightsNarrativeSummary`: Rule-based narrative insights (3-5 sentences)
- `InsightsConsistencySection`: Streak tracking and consistency metrics
- `InsightsMvdSection`: MVD frequency and patterns
- `InsightsTagsSection`: Tag usage analytics
- `InsightsCorrelationsSection`: Category-mood, tag-mood/energy, and MVD correlations

**Features:**

**1. Time Range Filters (Sticky Bar):**
- Last 7 days
- Last 30 days
- Last 90 days
- All time
- Sticky positioning with backdrop blur

**2. Summary Cards (6 metrics):**
- Total logged days
- Average total investment score
- Average mood (1-5 scale)
- Average energy (1-5 scale)
- MVD count
- Unique tags used

**3. Narrative Summary:**
- Rule-based text generation (no AI)
- 3-5 contextual sentences
- Analyzes mood, energy, category focus, MVD patterns, tag usage
- Unlocks at 3+ logged days
- Thresholds: High (≥4), Balanced (2.5-4), Low (≤2.5)

**4. Visual Charts:**
- **Mood & Energy Trends**: Line chart with date on X-axis
- **Category Balance**: Radar chart showing investment distribution
- Recharts-powered with tooltips and animations

**5. Collapsible Sections:**
- **Streaks & Consistency**: Longest streak, current streak, 7-day consistency
- **MVD Insights**: MVD frequency, percentage, patterns
- **Tags Overview**: Top 3 tags + full list with counts
- **Correlations**: 
  - Category ↔ Mood patterns
  - Tag ↔ Mood & Energy patterns
  - MVD vs Non-MVD comparisons

**6. Correlation Analysis:**
- Compares above-average vs below-average investment impact on mood
- Shows mood/energy averages per tag
- Compares MVD vs regular days
- Requires 5+ logged days, 2+ days per group
- Color-coded deltas (green for positive, amber for negative)

**User Flow:**
```
1. User visits /insights
   ↓
2. Server fetches last 30 days of data via getInsightsData()
   ↓
3. Client renders summary cards and narrative
   ↓
4. User changes time range filter
   ↓
5. Client filters data (useMemo) and re-renders
   ↓
6. User expands/collapses sections as needed
   ↓
7. Charts update with smooth animations
```

**Server Actions:**
- `getInsightsData(from, to)`: Fetches entries and builds insights

**Utilities:**
- `lib/insights.ts`: Calculation functions (streaks, correlations, aggregates)
- `lib/insightsSummary.ts`: Narrative summary generators

**Empty States:**
- No data: Link to Today/Calendar pages
- Insufficient data for correlations: "Log a few more days"
- Insufficient data for summaries: "Log at least 3 days to unlock"

---

## Data Flow & Patterns

### Create Entry Flow (Detailed)

```
┌─────────────┐
│   Browser   │
│ TodayForm   │
└──────┬──────┘
       │ 1. User clicks "Save Today"
       │    Form state: { date, mood, energy, investments, ... }
       ↓
┌──────────────────────────────────────────────────────────────┐
│ Server Action: saveDayEntry()                                 │
│                                                                │
│ Step 1: Authentication                                         │
│   const user = await requireUser();                           │
│   // Throws if not authenticated                              │
│                                                                │
│ Step 2: Date Normalization                                    │
│   const dateObj = normalizeDayDate(input.date);              │
│   // "2024-11-28" → Date("2024-11-28T00:00:00.000Z")        │
│                                                                │
│ Step 3: Category ID Lookup                                    │
│   const categories = await prisma.investmentCategory         │
│     .findMany();                                              │
│   const categoryMap = { "career": "cat_id_1", ... };         │
│                                                                │
│ Step 4: Transaction                                            │
│   await prisma.$transaction(async (tx) => {                  │
│     // Delete existing investments (if updating)             │
│     await tx.investment.deleteMany({                         │
│       where: { dayId: existingEntry.id }                     │
│     });                                                       │
│                                                                │
│     // Upsert entry                                           │
│     await tx.dayEntry.upsert({                               │
│       where: {                                                │
│         userId_date: { userId, date }                        │
│       },                                                      │
│       create: { userId, date, mood, energy, ... },          │
│       update: { mood, energy, ... }                          │
│     });                                                       │
│   });                                                         │
│                                                                │
│ Step 5: Revalidation                                          │
│   revalidatePath("/today");                                  │
│   revalidatePath("/calendar");                               │
│   revalidatePath(`/day/${date}`);                            │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ PostgreSQL Database                                          │
│                                                              │
│ 1. Check unique constraint (userId, date)                   │
│ 2. Insert or update DayEntry row                            │
│ 3. Insert Investment rows (6 total, one per category)       │
│ 4. Commit transaction                                        │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Browser Response                                             │
│                                                              │
│ - Toast notification: "Today's entry has been saved"        │
│ - Page auto-refreshes with new data                         │
└─────────────────────────────────────────────────────────────┘
```

### Read Entries Flow (Calendar)

```
┌─────────────┐
│   Browser   │
│  Calendar   │
└──────┬──────┘
       │ 1. User navigates to /calendar
       │ 2. User clicks "Next Month" button
       ↓
┌──────────────────────────────────────────────────────────────┐
│ Server Action: getEntriesForMonth(year, month)               │
│                                                                │
│ Step 1: Authentication                                         │
│   const user = await requireUser();                           │
│                                                                │
│ Step 2: Date Range Calculation                                │
│   const startDate = new Date(Date.UTC(year, month, 1));      │
│   const endDate = new Date(Date.UTC(year, month+1, 0));      │
│                                                                │
│ Step 3: Query with Includes                                    │
│   const entries = await prisma.dayEntry.findMany({           │
│     where: {                                                  │
│       userId: user.id,           // 🔒 Automatic isolation   │
│       date: { gte: startDate, lte: endDate }                 │
│     },                                                        │
│     include: {                                                │
│       investments: {                                          │
│         include: { category: true }  // Eager load           │
│       }                                                       │
│     }                                                         │
│   });                                                         │
│                                                                │
│ Step 4: Transform Data                                        │
│   return entries.map(entry => ({                             │
│     id: entry.id,                                             │
│     date: entry.date.toISOString().split("T")[0],           │
│     investments: entry.investments.map(inv => ({             │
│       category: inv.category.name,  // "career" not ID      │
│       score: inv.score                                        │
│     })),                                                      │
│     tags: JSON.parse(entry.tags)                             │
│   }));                                                        │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                      │
│                                                              │
│ 1. Receive entries array                                     │
│ 2. Render calendar grid                                      │
│ 3. Calculate intensity for each day                          │
│ 4. Apply color coding                                        │
└─────────────────────────────────────────────────────────────┘
```

### Constants & Category Colors

**File:** `lib/constants.ts`

The application defines consistent category colors and demo account settings:

```typescript
export const CATEGORY_COLORS: Record<InvestmentCategory, string> = {
  career: "hsl(200, 98%, 39%)",      // Blue
  health: "hsl(142, 71%, 45%)",      // Green
  relationships: "hsl(280, 65%, 60%)", // Purple
  wellbeing: "hsl(45, 93%, 47%)",    // Yellow/Gold
  meaning: "hsl(16, 90%, 55%)",      // Orange
  environment: "hsl(174, 72%, 56%)"  // Teal
};

export const DEMO_ACCOUNT_EMAIL = "test@example.com";
```

**Usage:**
- Charts consistently use `CATEGORY_COLORS` for visual representation
- Insights components reference these colors for category-specific styling
- Demo guard functions check against `DEMO_ACCOUNT_EMAIL`

### Investment Category Hybrid Model

**Problem:** How to balance type safety with database flexibility?

**Solution:** Hybrid approach with string enum + relational table + consistent colors.

```typescript
// TypeScript (Client/Server Shared)
type InvestmentCategory = 
  | "career" 
  | "health" 
  | "relationships" 
  | "wellbeing" 
  | "meaning" 
  | "environment";

// Prisma Schema (Database)
model InvestmentCategory {
  id          String   @id
  name        String   @unique  // "career", "health", etc.
  displayName String             // "Career", "Health", etc.
  color       String             // "#3b82f6"
  icon        String?            // "briefcase"
  // ...
}
```

**Mapping in Server Actions:**

```typescript
// When saving
const categoryMap = new Map();
const categories = await prisma.investmentCategory.findMany();
categories.forEach(cat => categoryMap.set(cat.name, cat.id));

const investmentData = input.investments.map(inv => ({
  categoryId: categoryMap.get(inv.category), // "career" → "cat_abc123"
  score: inv.score
}));

// When reading
const investments = entry.investments.map(inv => ({
  category: inv.category.name,  // "cat_abc123" → "career"
  score: inv.score
}));
```

**Benefits:**
- ✅ Type safety in components (autocomplete, validation)
- ✅ Rich metadata in database (colors, icons)
- ✅ Efficient querying and filtering
- ✅ Easy to add new category properties without code changes

---

## API Reference (Server Actions)

All server actions are in `app/actions/dayEntry.ts`.

### `saveDayEntry(input: SaveDayEntryInput)`

Creates or updates a day entry for the authenticated user.

**Authentication:** Required (`requireUser()`)

**Input Type:**
```typescript
interface SaveDayEntryInput {
  date: string;               // "YYYY-MM-DD"
  mood?: number | null;       // 1-5
  energy?: number | null;     // 1-5
  note?: string | null;
  isMinimumViableDay?: boolean;
  investments: {
    category: InvestmentCategory;
    score: number;            // 0-3
    comment?: string | null;
  }[];
  tags: string[];
}
```

**Behavior:**
- Uses `upsert` with `userId_date` unique constraint
- Creates new entry if none exists for user + date
- Updates existing entry if found
- Deletes old investments and creates new ones (transaction)
- Revalidates relevant paths

**Errors:**
- Throws if not authenticated
- Throws if categories not seeded

---

### `getDayEntry(date: string)`

Fetches a single day entry for the authenticated user.

**Authentication:** Required (`requireUser()`)

**Parameters:**
- `date`: ISO date string ("2024-11-28")

**Returns:** `DayEntry | null`

**Return Type:**
```typescript
interface DayEntry {
  id: string;
  date: string;
  mood?: number | null;
  energy?: number | null;
  note?: string | null;
  isMinimumViableDay?: boolean | null;
  investments: Investment[];
  tags: string[];
}
```

---

### `getEntriesForMonth(year: number, month: number)`

Fetches all entries for a specific month for the authenticated user.

**Authentication:** Required (`requireUser()`)

**Parameters:**
- `year`: 2024
- `month`: 0-11 (0 = January)

**Returns:** `DayEntry[]`

**Behavior:**
- Calculates UTC date range for month
- Filters by userId and date range
- Eager loads investments and categories
- Orders by date ascending

---

### `getAllEntries()`

Fetches all entries for the authenticated user.

**Authentication:** Required (`requireUser()`)

**Returns:** `DayEntry[]`

**Behavior:**
- No date filtering (returns full history)
- Orders by date descending (newest first)
- Useful for insights/analytics

---

### `getInsightsData(range: { from: Date; to: Date })`

**File:** `app/actions/insights.ts`

Fetches and aggregates insights data for the authenticated user within a date range.

**Authentication:** Required (`requireUser()`)

**Parameters:**
- `range.from`: Start date (inclusive)
- `range.to`: End date (inclusive)

**Returns:** `InsightsData`

**Return Type:**
```typescript
interface InsightsData {
  days: DaySummary[];
  aggregates: {
    totalDays: number;
    avgTotalScore: number;
    avgMood: number | null;
    avgEnergy: number | null;
    mvdCount: number;
    uniqueTags: string[];
  };
}

interface DaySummary {
  date: string;
  totalScore: number;
  mood: number | null;
  energy: number | null;
  isMinimumViableDay: boolean;
  tags: string[];
  investments: { category: InvestmentCategory; score: number }[];
}
```

**Behavior:**
- Fetches day entries with eager-loaded investments
- Transforms to `DayEntry` type
- Calls `buildInsightsFromEntries()` to calculate aggregates
- Used by Insights page for all analytics

**Calculation Utilities:**
- `lib/insights.ts`: Core calculation functions
  - `buildInsightsFromEntries()`: Main aggregation function
  - `computeStreaks()`: Calculates longest and current streaks
  - `computeCategoryMoodCorrelations()`: Category-mood patterns
  - `computeTagMoodEnergyCorrelations()`: Tag-mood/energy patterns
  - `computeMvdCorrelations()`: MVD vs non-MVD comparisons
- `lib/insightsSummary.ts`: Narrative summary generators
  - `generateNarrativeSummary()`: Main summary generator
  - `generateMoodSummary()`: Mood pattern analysis
  - `generateEnergySummary()`: Energy pattern analysis
  - `generateCategorySummary()`: Investment focus patterns
  - `generateMvdSummary()`: MVD usage patterns
  - `generateTagSummary()`: Tag frequency analysis

---

### `clearDayEntry(date: string)`

Deletes a day entry for the authenticated user.

**Authentication:** Required (`requireUser()`)

**Parameters:**
- `date`: ISO date string ("2024-11-28")

**Behavior:**
- Finds entry by userId and date
- Deletes entry (cascade removes investments)
- No-op if entry doesn't exist
- Revalidates relevant paths

---

## Component Architecture

### Component Hierarchy

```
app/layout.tsx (Root)
  ├─ AuthLoadingProvider
  │   ├─ StackProvider
  │   │   ├─ StackTheme
  │   │   │   └─ children
  │   ├─ Header
  │   │   ├─ Navigation Links
  │   │   └─ UserButton / Sign In Link
  │   └─ AuthLoadingOverlay (conditional)
  └─ Toaster (Sonner)

app/today/page.tsx
  └─ TodayForm
      ├─ InvestmentCategory (x6)
      │   └─ Score buttons (0-3)
      ├─ MoodEnergySelector (x2)
      │   └─ Number buttons (1-5)
      ├─ ReflectionNote
      │   └─ Textarea
      ├─ TagSelector
      │   └─ Tag checkboxes
      ├─ MVDToggle
      │   └─ Switch
      └─ Save Button

app/calendar/page.tsx
  └─ CalendarClient
      └─ MonthCalendar
          ├─ Month navigation
          ├─ DayCell (x35-42)
          ├─ DayPreviewDrawer
          │   ├─ DayInvestments
          │   ├─ DayKeyMetrics
          │   ├─ DayReflection
          │   ├─ DayTags
          │   └─ Action buttons
          └─ DayDetailModal
              └─ (Same form as Today page)

app/day/[date]/page.tsx
  └─ DayPageClient
      ├─ DayInvestments
      ├─ DayKeyMetrics
      ├─ DayMVDIndicator
      ├─ DayReflection
      └─ DayTags

app/insights/page.tsx
  └─ InsightsPageClient
      ├─ Sticky Filter Bar (7/30/90/all time)
      ├─ Summary Cards (6 metrics)
      ├─ InsightsNarrativeSummary
      ├─ MoodEnergyChart
      │   └─ ChartContainer + Recharts Line
      ├─ CategoryBalanceChart
      │   └─ ChartContainer + Recharts Radar
      ├─ InsightsConsistencySection (collapsible)
      │   └─ Streak and consistency metrics
      ├─ InsightsMvdSection (collapsible)
      │   └─ MVD frequency and patterns
      ├─ InsightsTagsSection (collapsible)
      │   └─ Tag usage and top tags
      └─ InsightsCorrelationsSection (collapsible)
          ├─ Category ↔ Mood patterns
          ├─ Tag ↔ Mood & Energy patterns
          └─ MVD vs Non-MVD comparisons
```

### Key Component Patterns

#### Controlled Components

All form inputs are controlled components:

```tsx
function MoodEnergySelector({ value, onChange }) {
  return (
    <div>
      {[1, 2, 3, 4, 5].map(num => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={value === num ? 'active' : ''}
        >
          {num}
        </button>
      ))}
    </div>
  );
}
```

#### Composition Pattern

Complex forms are built from small, reusable components:

```tsx
<TodayForm>
  <InvestmentCategory category="career" />
  <InvestmentCategory category="health" />
  <MoodEnergySelector label="Mood" />
  <MoodEnergySelector label="Energy" />
  <ReflectionNote />
  <TagSelector />
  <MVDToggle />
</TodayForm>
```

#### Context Pattern

Global state managed through React Context:

```tsx
// AuthLoadingContext provides auth loading state
const { isSigningOut, setIsSigningOut } = useAuthLoading();

// Used in Header component for sign-out flow
const handleSignOut = () => {
  setIsSigningOut(true);
  await signOut();
  setIsSigningOut(false);
};
```

#### Chart Components

Insights uses Recharts wrapped in shadcn/ui chart primitives:

```tsx
<ChartContainer config={chartConfig}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line type="monotone" dataKey="mood" stroke="var(--color-mood)" />
    <Line type="monotone" dataKey="energy" stroke="var(--color-energy)" />
  </LineChart>
</ChartContainer>
```

#### Client/Server Boundary

Clear separation between data fetching and interactivity:

```tsx
// page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData();  // Happens on server
  return <ClientComponent data={data} />;
}

// ClientComponent.tsx (Client Component)
"use client";
export function ClientComponent({ data }) {
  const [state, setState] = useState(data);  // Client interactivity
  return <div>{/* ... */}</div>;
}
```

---

## Deployment & Configuration

### Environment Setup

#### Development

```bash
# Clone repository
git clone <repo-url>
cd life-investment-tracker

# Install dependencies
pnpm install

# Set up database
cp .env.example .env
# Edit .env and add DATABASE_URL

# Run migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed

# Start dev server
pnpm dev
```

#### Production (Vercel)

```bash
# Build application
pnpm build

# Environment variables to set in Vercel dashboard:
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_STACK_PROJECT_ID="..."
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="..."
STACK_SECRET_SERVER_KEY="..."

# Deploy
vercel --prod
```

### Database Migrations

#### Creating a Migration

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
pnpm db:migrate

# This will:
# - Generate SQL migration file
# - Apply migration to database
# - Regenerate Prisma client
```

#### Applying Migrations (Production)

```bash
# Option A: Run migrations as part of deploy
pnpm db:migrate

# Option B: Push schema directly (no migration files)
pnpm db:push
```

### Scripts Reference

```json
{
  "dev": "next dev",                    // Start dev server (port 3000)
  "build": "next build",                // Build for production
  "start": "next start",                // Start production server
  "lint": "next lint",                  // Run ESLint
  "db:generate": "prisma generate",     // Regenerate Prisma client
  "db:migrate": "prisma migrate dev",   // Create and apply migrations
  "db:push": "prisma db push",          // Push schema (no migrations)
  "db:studio": "prisma studio",         // Open Prisma Studio GUI
  "db:seed": "tsx prisma/seed.ts",      // Seed database with sample data
  "postinstall": "prisma generate"      // Auto-run after npm install
}
```

---

## PWA Support

### Overview

The Life Investment Tracker is a **Progressive Web App (PWA)**, which means it can be installed on mobile devices and desktops, providing an app-like experience with fast loading and basic offline capabilities.

### Key PWA Features

✅ **Installable**: Add to home screen on iOS and Android  
✅ **Offline Shell**: Core app UI cached for fast loads  
✅ **App-like Experience**: Runs in standalone mode without browser chrome  
✅ **Fast Loading**: Static assets cached for instant access  
⚠️ **Limited Offline Editing**: Data mutations require network connection (future enhancement)

### Web App Manifest

**Location**: `public/manifest.webmanifest`

The manifest defines how the app appears when installed:

```json
{
  "name": "Life Investment Tracker",
  "short_name": "LifeInvest",
  "description": "Track how you invest in your life each day",
  "start_url": "/today",
  "display": "standalone",
  "background_color": "#f0f6f9",
  "theme_color": "#0891b2",
  "orientation": "portrait-primary",
  "scope": "/",
  "categories": ["productivity", "lifestyle", "health"],
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "purpose": "any" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "purpose": "any" },
    { "src": "/icons/icon-maskable-192x192.png", "sizes": "192x192", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512x512.png", "sizes": "512x512", "purpose": "maskable" }
  ]
}
```

**Key Properties**:
- `start_url`: Opens to `/today` when launched from home screen
- `display: standalone`: Hides browser UI for app-like feel
- `theme_color`: Matches primary color (`#0891b2`)
- `background_color`: Matches app background (`#f0f6f9`)
- `icons`: Multiple sizes and maskable variants for Android adaptive icons

### Service Worker

**Location**: `public/sw.js`

The service worker implements intelligent caching strategies to enable offline functionality and fast loading.

#### Caching Strategies

The service worker uses three different caching strategies based on resource type:

**1. Cache-First (Static Assets)**

Used for: JavaScript, CSS, fonts, images, icons

```
Request → Check Cache → Return Cached → (Background: Fetch & Update Cache)
                ↓ (if miss)
          Fetch Network → Cache → Return
```

**Files Cached**:
- All static assets (`.js`, `.css`, `.woff2`, `.png`, `.jpg`, etc.)
- PWA icons and manifest
- App logo

**2. Network-First with Cache Fallback (HTML/Routes)**

Used for: Page navigation, HTML documents, dynamic routes

```
Request → Fetch Network → Cache → Return
              ↓ (if fails)
          Check Cache → Return
              ↓ (if miss)
          Show Offline Page
```

**Routes Cached**:
- `/` (home)
- `/today`
- `/calendar`
- `/insights`
- `/day/[date]` patterns

**3. Stale-While-Revalidate (API/Data)**

Used for: API routes and data fetching

```
Request → Return Cache (if available) + Background Fetch → Update Cache
              ↓ (if no cache)
          Wait for Network → Cache → Return
```

#### Cache Versioning

The service worker uses a versioned cache name to enable cache invalidation on deployments:

```javascript
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `life-investment-tracker-${CACHE_VERSION}`;
```

When a new version is deployed:
1. New service worker installs with new `CACHE_VERSION`
2. On activation, old caches are automatically deleted
3. Users get fresh assets on next page load

#### Authentication & Special Routes

The service worker **skips caching** for:
- `/api/auth/*` (Stack Auth endpoints)
- `/handler/*` (Stack Auth handlers)
- Non-GET requests (POST, PUT, DELETE)
- Non-HTTP(S) requests

This ensures authentication flows work correctly and mutations always hit the server.

#### Offline Page

If a user navigates to an uncached page while offline, they see a custom offline page with:
- Branded styling matching the app theme
- Clear "You're Offline" message
- Retry button to refresh when connection returns

### Service Worker Registration

**Component**: `components/ServiceWorkerRegister.tsx`

A client-only component that registers the service worker on app load:

```tsx
"use client";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[PWA] Service Worker registered");
          registration.update(); // Check for updates
        });
    }
  }, []);
  return null;
}
```

**Key Points**:
- Only registers in **production** (disabled in development)
- Automatically checks for updates on page load
- Listens for service worker updates and controller changes
- Integrated into `app/layout.tsx` for global registration

### PWA Meta Tags

**Location**: `app/layout.tsx`

The root layout includes necessary PWA meta tags:

```tsx
export const metadata: Metadata = {
  title: "Life Investment Tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeInvest",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export const viewport = {
  themeColor: "#0891b2",
};
```

These tags enable:
- iOS "Add to Home Screen" with proper icon and title
- Android theme color in status bar
- Proper manifest linking

### PWA Icons

**Location**: `public/icons/`

PWA requires multiple icon sizes and formats:

| File | Size | Purpose |
|------|------|---------|
| `icon-192x192.png` | 192×192 | Standard app icon (Android, Chrome) |
| `icon-512x512.png` | 512×512 | High-res app icon |
| `icon-maskable-192x192.png` | 192×192 | Adaptive icon (Android safe zone) |
| `icon-maskable-512x512.png` | 512×512 | High-res adaptive icon |
| `apple-touch-icon.png` | 180×180 | iOS home screen icon |

**Regenerating Icons**: Run `node scripts/generate-icons.js` to regenerate all icons from `public/logo.png`.

### Offline Detection Hook

**Location**: `hooks/useOnlineStatus.ts`

A custom hook to detect online/offline status:

```tsx
const isOnline = useOnlineStatus();

if (!isOnline) {
  toast.warning("You are offline. Changes will not be saved.");
}
```

The hook:
- Listens to browser `online` and `offline` events
- Returns boolean `isOnline` state
- Can be used to show offline indicators or disable features

### Offline Data Sync (Phase 2)

The app now supports **offline editing** for day entries on `/today` and `/day/[date]` pages:

✅ **Offline Queue**:
- Day entries saved while offline are stored in localStorage
- Entries automatically sync when connection is restored
- "Pending sync" indicator shows which entries haven't synced yet
- Last-write-wins conflict resolution (no merge conflicts)

**How It Works**:

1. **When Offline**: If you save an entry and the network is unavailable, the app stores it locally and shows a toast: "Saved locally. Will sync when you are back online."

2. **Visual Indicator**: A small badge appears next to the date showing "Pending sync" with a wifi-off icon.

3. **Automatic Sync**: When your connection returns, the app automatically detects it and syncs all pending entries to the server.

4. **Sync Confirmation**: After successful sync, a toast shows: "Synced X offline entry/entries"

**Technical Implementation**:
- **Storage**: localStorage with namespace `lit_offline_entries_v1`
- **Structure**: Entries keyed by `userId` and `date` for multi-user support
- **Hook**: `useOfflineSync()` monitors online/offline events
- **Provider**: `<OfflineSyncProvider />` in root layout enables app-wide sync

**Conflict Resolution**:
- Simple "last write wins" strategy
- Latest saved version (offline or online) is the source of truth
- No complex merge logic needed for this use case

### Current Limitations

⚠️ **Read Operations Still Require Internet**:
- Viewing entries/calendar/insights requires network connection
- Only write operations (saving entries) work offline
- Future enhancement: IndexedDB for full offline read capability

⚠️ **No Background Sync API**:
- Sync happens when app is open and online
- No periodic background sync for updates
- Future enhancement: Background Sync API integration

⚠️ **Limited Push Notifications**:
- No push notification support yet
- Future enhancement: daily reminder notifications

### Testing PWA Locally

#### Development Mode

The service worker is **disabled in development** to avoid caching issues. To test PWA features locally:

1. **Build for production**:
   ```bash
   npx pnpm build
   ```

2. **Run production build**:
   ```bash
   npx pnpm start
   ```

3. **Open in browser**:
   ```
   http://localhost:3000
   ```

#### Chrome DevTools

**Validate Manifest**:
1. Open DevTools → Application → Manifest
2. Check all fields are correct
3. Verify icons load properly

**Check Service Worker**:
1. Open DevTools → Application → Service Workers
2. Verify registration status
3. Test "Update on reload" and "Bypass for network"

**Test Offline Data Sync**:
1. Navigate to `/today` or any `/day/[date]` page
2. Open DevTools → Network
3. Enable "Offline" throttling
4. Fill out the form and click Save
5. Verify toast: "Saved locally. Will sync when you are back online."
6. Verify "Pending sync" badge appears
7. Reload the page (form should still show offline data)
8. Disable "Offline" throttling (go back online)
9. Verify toast: "Synced 1 offline entry"
10. Verify badge disappears
11. Check database - entry should be persisted

**Check localStorage Queue**:
1. Open DevTools → Application → Local Storage
2. Find key: `lit_offline_entries_v1`
3. View pending entries structure:
   ```json
   {
     "userId123": {
       "2024-11-29": {
         "date": "2024-11-29",
         "mood": 4,
         "energy": 3,
         "investments": [...],
         "tags": [...],
         "lastUpdatedAt": "2024-11-29T12:00:00.000Z"
       }
     }
   }
   ```

**Test Offline Mode**:
1. Open DevTools → Network
2. Enable "Offline" throttling
3. Navigate to different pages
4. Verify cached pages load correctly

**Lighthouse Audit**:
1. Open DevTools → Lighthouse
2. Select "Progressive Web App"
3. Run audit
4. Should score 90+ for PWA criteria

#### Mobile Testing

**Android (Chrome)**:
1. Open site in Chrome
2. Tap menu → "Add to Home screen"
3. Confirm installation
4. Launch from home screen
5. Should open in standalone mode

**iOS (Safari)**:
1. Open site in Safari
2. Tap share button
3. Select "Add to Home Screen"
4. Confirm
5. Launch from home screen
6. Note: iOS has limited PWA support (no background sync, etc.)

### Deployment Considerations

**Vercel Deployment**:
- Service worker is served statically from `public/sw.js`
- No special configuration needed
- Cache headers handled automatically

**Cache Invalidation**:
- Increment `CACHE_VERSION` in `public/sw.js` before deploying
- Old caches are automatically cleared on next visit
- Users may need to refresh twice to see updates

**HTTPS Requirement**:
- Service workers require HTTPS in production
- Vercel provides HTTPS by default
- Localhost works without HTTPS in development

---

## Development Guidelines

### Adding a New Feature

#### Example: Adding "Gratitude" Field

**1. Update Database Schema**

```prisma
// prisma/schema.prisma
model DayEntry {
  // ... existing fields
  gratitude String? // Add new field
}
```

**2. Create Migration**

```bash
pnpm db:migrate
# Name: add_gratitude_field
```

**3. Update Types**

```typescript
// lib/types.ts
export interface DayEntry {
  // ... existing fields
  gratitude?: string | null;
}
```

**4. Update Server Action**

```typescript
// app/actions/dayEntry.ts
export interface SaveDayEntryInput {
  // ... existing fields
  gratitude?: string | null;
}

export async function saveDayEntry(input: SaveDayEntryInput) {
  await prisma.dayEntry.upsert({
    create: {
      // ... existing fields
      gratitude: input.gratitude,
    },
    update: {
      // ... existing fields
      gratitude: input.gratitude,
    }
  });
}
```

**5. Create Component**

```tsx
// components/today/GratitudeInput.tsx
"use client";

interface GratitudeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function GratitudeInput({ value, onChange }: GratitudeInputProps) {
  return (
    <div>
      <label>What are you grateful for?</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
```

**6. Add to Form**

```tsx
// app/today/TodayForm.tsx
const [gratitude, setGratitude] = useState(initialEntry?.gratitude || "");

return (
  <Card>
    {/* ... existing fields */}
    <GratitudeInput value={gratitude} onChange={setGratitude} />
  </Card>
);
```

### Code Style Guidelines

#### File Naming

- Components: PascalCase (`DayCell.tsx`)
- Utilities: camelCase (`dateUtils.ts`)
- Pages: lowercase (`page.tsx`)

#### Component Organization

```tsx
// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types
interface Props {
  value: string;
}

// 3. Component
export function Component({ value }: Props) {
  // 3a. Hooks
  const [state, setState] = useState();
  
  // 3b. Handlers
  const handleClick = () => { };
  
  // 3c. Render
  return <div>{/* ... */}</div>;
}
```

#### Server Action Guidelines

```typescript
// Always start with authentication
const user = await requireUser();

// Use transactions for multi-step operations
await prisma.$transaction(async (tx) => {
  // Multiple operations here
});

// Always revalidate affected paths
revalidatePath("/path");
```

### Testing Strategy

**Current State:** No automated tests

**Recommended Additions:**
1. **Unit Tests**: Server action logic
2. **Integration Tests**: Database operations
3. **E2E Tests**: Critical user flows
4. **Type Tests**: Ensure type safety

### Performance Considerations

#### Database Optimization

- ✅ Compound unique index on `(userId, date)` enables fast lookups
- ✅ Eager loading with `include` prevents N+1 queries
- ✅ Date range queries use indexed fields

#### Future Optimizations

- Consider pagination for `getAllEntries()` as data grows
- Add database indexes on frequently queried fields
- Implement caching for investment categories (rarely change)
- Use React Server Components for automatic code splitting

---

## Known Limitations & Future Work

### Current Limitations

1. **Limited Route Protection**: Middleware only protects demo account, not general auth routing
2. **No Data Export**: Users can't export their data (JSON, CSV, PDF)
3. **No Mobile App**: Web-only (responsive, but not native)
4. **No Offline Support**: Requires internet connection
5. **Single-Tenant Only**: No team/organization features
6. **No Custom Date Ranges**: Insights limited to preset ranges (7/30/90 days, all time)
7. **No Comparison Views**: Can't compare two time periods side by side

### Planned Enhancements

#### Short Term
- [ ] Add middleware for automatic auth route protection (non-demo users)
- [ ] Add data export (JSON, CSV, PDF)
- [ ] Improve mobile UX (touch gestures for calendar)
- [ ] Add keyboard shortcuts
- [ ] Custom date range picker for insights

#### Medium Term
- [ ] Weekly/monthly email summaries
- [ ] Goal setting and tracking (target scores per category)
- [ ] Reminder notifications (push/email)
- [ ] Dark mode toggle (currently auto from system)
- [ ] Period comparison view (compare two date ranges)
- [ ] Advanced statistical correlations (Pearson/Spearman coefficients)

#### Long Term
- [ ] AI-powered insights and predictions (optional)
- [ ] Multi-tenant support (teams, families)
- [ ] Public sharing (anonymous or with shareable link)
- [ ] Integration with calendar apps (Google Calendar, Outlook)
- [ ] Mobile apps (React Native or PWA)
- [ ] Voice input for daily entries
- [ ] Wearable integration (mood/energy from fitness trackers)

---

## Glossary

**DayEntry**: A record representing one day's journal entry for one user.

**Investment**: A score (0-3) for a specific category on a specific day.

**InvestmentCategory**: One of six life dimensions (career, health, etc.).

**MVD (Minimum Viable Day)**: A flag indicating a "good enough" day despite low scores.

**Server Action**: A Next.js feature for calling server-side functions from client components.

**Stack Auth**: The authentication provider used by Neon Auth.

**Neon Auth**: Neon's managed authentication service (wraps Stack Auth).

**Upsert**: Database operation that creates if not exists, updates if exists.

**Revalidation**: Next.js cache invalidation to show fresh data.

**Insights**: Analytics dashboard showing trends, correlations, and patterns.

**Narrative Summary**: Rule-based text generation providing contextual insights (3-5 sentences).

**Correlations**: Statistical patterns showing relationships between categories, tags, mood, and energy.

**Streak**: Consecutive days with logged entries.

**Demo Account**: Protected test account (test@example.com) with restricted permissions.

**Middleware**: Next.js server-side request interceptor for auth and route protection.

**ChartContainer**: Recharts wrapper component from shadcn/ui for consistent chart styling.

---

## Additional Resources

### Documentation Files

- **README.md**: Quick start and overview
- **AUTH_ARCHITECTURE.md**: Detailed auth system documentation
- **IMPLEMENTATION_SUMMARY.md**: Core features implementation changelog
- **INSIGHTS_V1_IMPLEMENTATION_SUMMARY.md**: Insights v1.0 implementation details
- **INSIGHTS_V1.5_IMPLEMENTATION_SUMMARY.md**: Insights v1.5 upgrade (correlations, summaries)
- **NEON_AUTH_SETUP.md**: Auth setup instructions
- **QUICK_START.md**: Fast setup guide
- **COMPREHENSIVE_DOCUMENTATION.md**: This file (complete technical reference)

### External Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stack Auth Documentation](https://docs.stack-auth.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Recharts Documentation](https://recharts.org/en-US/)
- [date-fns Documentation](https://date-fns.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-28 | Initial implementation with core features | - |
| 2025-11-28 | Added Neon Auth integration | - |
| 2025-11-28 | Fixed investment category mapping | - |
| 2025-11-28 | Created comprehensive documentation | - |
| 2025-11-29 | Implemented Insights v1.0 (charts, metrics, streaks) | - |
| 2025-11-29 | Implemented Insights v1.5 (correlations, narrative summaries) | - |
| 2025-11-29 | Added middleware for demo account protection | - |
| 2025-11-29 | Added AuthLoadingContext and loading overlays | - |
| 2025-11-29 | Updated documentation to v1.5 | - |

---

**Document Version:** 1.5.0  
**Last Updated:** November 29, 2025  
**Status:** ✅ Production Ready - Full Feature Set Documented

