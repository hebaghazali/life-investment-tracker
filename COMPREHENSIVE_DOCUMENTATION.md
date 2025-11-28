# Life Investment Tracker - Comprehensive Technical Documentation

> **Last Updated**: November 28, 2025  
> **Version**: 1.0.0  
> **Status**: ✅ Core Features Complete | 🔄 Auth Integration Ready

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
12. [Development Guidelines](#development-guidelines)

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
🔜 **Insights Dashboard**: Analytics and trends (planned)

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

#### Route Protection

Currently, routes are **not** automatically protected by middleware. Authentication is enforced at the **data layer** (server actions throw errors if not authenticated).

**Future Enhancement:**
Consider adding Next.js middleware for automatic route protection:

```typescript
// middleware.ts (not implemented yet)
export async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect('/handler/sign-in');
  }
}
```

### Environment Variables

```env
# Required for production
NEXT_PUBLIC_STACK_PROJECT_ID="proj_..."
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="pkey_..."
STACK_SECRET_SERVER_KEY="skey_..."

# Database
DATABASE_URL="postgresql://..."
```

---

## Application Structure

### Directory Tree

```
life-investment-tracker/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions (API layer)
│   │   └── dayEntry.ts           # CRUD operations for entries
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
│   │       ├── loading.tsx       # Loading state
│   │       └── page.tsx          # Auth pages (sign-in, sign-up)
│   ├── insights/                 # Future analytics page
│   │   └── page.tsx
│   ├── today/                    # Today's entry route
│   │   ├── page.tsx              # Server component
│   │   └── TodayForm.tsx         # Client form component
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout (wraps with providers)
│   ├── not-found.tsx             # 404 page
│   └── page.tsx                  # Home page (redirects to /today)
│
├── components/                   # React components
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
│       ├── dialog.tsx
│       ├── label.tsx
│       ├── sheet.tsx
│       ├── switch.tsx
│       └── textarea.tsx
│
├── hooks/                        # Custom React hooks
│   └── useDeleteDay.ts           # Hook for deleting entries
│
├── lib/                          # Utilities and shared logic
│   ├── auth.ts                   # Authentication helpers
│   ├── dateUtils.ts              # Date normalization
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
├── AUTH_ARCHITECTURE.md          # Auth system documentation
├── IMPLEMENTATION_SUMMARY.md     # Implementation notes
├── NEON_AUTH_SETUP.md            # Auth setup guide
├── QUICK_START.md                # Quick start guide
├── README.md                     # Main readme
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── pnpm-lock.yaml                # Lockfile
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

**Status:** 🔜 Not yet implemented

**Planned Features:**
- Total investment score trends
- Category distribution charts
- Mood/energy correlations
- MVD frequency
- Streak tracking
- Tag analytics

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

### Investment Category Hybrid Model

**Problem:** How to balance type safety with database flexibility?

**Solution:** Hybrid approach with string enum + relational table.

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
  ├─ StackProvider
  │   ├─ StackTheme
  │   │   └─ children
  └─ Header
      ├─ Navigation Links
      └─ UserButton / Sign In Link

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

1. **No Route Protection Middleware**: Pages don't automatically redirect unauthenticated users
2. **No Insights Page**: Analytics dashboard not implemented
3. **No Data Export**: Users can't export their data
4. **No Mobile App**: Web-only (responsive, but not native)
5. **No Offline Support**: Requires internet connection
6. **Single-Tenant Only**: No team/organization features

### Planned Enhancements

#### Short Term
- [ ] Add middleware for automatic route protection
- [ ] Implement insights dashboard with charts
- [ ] Add data export (JSON, CSV)
- [ ] Improve mobile UX (touch gestures for calendar)
- [ ] Add keyboard shortcuts

#### Medium Term
- [ ] Streak tracking ("Don't break the chain")
- [ ] Weekly/monthly summaries
- [ ] Goal setting and tracking
- [ ] Reminder notifications
- [ ] Dark mode toggle (auto from system)

#### Long Term
- [ ] AI-powered insights and suggestions
- [ ] Multi-tenant (teams, families)
- [ ] Public sharing (anonymous or with link)
- [ ] Integration with calendar apps
- [ ] Mobile apps (React Native)

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

---

## Additional Resources

### Documentation Files

- **README.md**: Quick start and overview
- **AUTH_ARCHITECTURE.md**: Detailed auth system documentation
- **IMPLEMENTATION_SUMMARY.md**: Implementation changelog
- **NEON_AUTH_SETUP.md**: Auth setup instructions
- **QUICK_START.md**: Fast setup guide

### External Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stack Auth Documentation](https://docs.stack-auth.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-28 | Initial implementation | - |
| 2025-11-28 | Added Neon Auth integration | - |
| 2025-11-28 | Fixed investment category mapping | - |
| 2025-11-28 | Created comprehensive documentation | - |

---

**Document Version:** 1.0.0  
**Last Updated:** November 28, 2025  
**Status:** ✅ Current Implementation Documented

