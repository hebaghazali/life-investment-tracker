# Life Investment Tracker

A small personal web app that helps you track how you invest in different life areas every day, and visualize your progress on a monthly calendar.

Tech stack:

* Next.js (App Router, TypeScript)
* Prisma ORM
* SQLite in development, PostgreSQL in production
* Tailwind CSS for styling

The goal is a calm, low friction tool that you can actually use daily, not a productivity monster or public SaaS.

---

## 1. Concept and Goals

### 1.1 Problem

Paper journaling and scattered notes make it hard to answer questions like:

* Am I consistently investing in my career or just reacting to work?
* Is my health getting attention, or am I sacrificing it for other goals?
* Which months feel off and why?

We want a simple system that:

* Captures daily investment in life areas with very low friction
* Visualizes consistency and balance on a calendar
* Encourages gentle reflection, not self punishment

### 1.2 Core idea

Each day you log:

* Small numeric scores for a few categories (career, health, relationships, wellbeing, etc)
* Mood and energy (1 to 5)
* One short reflection

The app then:

* Shows a monthly calendar where each day is colored based on your investment or mood
* Lets you click any day to see or edit details
* Eventually provides simple summaries and trends

### 1.3 Primary goals

* Be extremely quick to update
* Make consistency visible at a glance
* Stay private and personal
* Be easy to extend later (more metrics, charts, exports)

### 1.4 Non goals

* No public profiles
* No social features
* No complex gamification or streak shaming
* No multi tenant SaaS setup in v1

---

## 2. Tech Stack and Architecture

### 2.1 Frontend

* Next.js (App Router)
* TypeScript
* Server Components where possible, Client Components only when needed for interactivity
* Tailwind CSS for layout and styling

### 2.2 Backend

* Next.js server actions and/or route handlers for data access
* Prisma ORM for database access
* SQLite for local development
* PostgreSQL in production (Neon, Supabase, Railway or similar)

### 2.3 High level architecture

* Single Next.js app that serves both frontend and backend
* Minimal API surface, mostly server actions for mutations
* Prisma as the single source of truth for the data model
* App is intentionally monolithic and simple

---

## 3. Features and UX

### 3.1 Core features for v1

1. **Today page**

   * Shows current date
   * Inputs for:

     * Category scores (0 to 3)
     * Mood (1 to 5)
     * Energy (1 to 5)
     * One short reflection text
   * Submit button that saves the day entry

2. **Calendar page**

   * Monthly calendar grid (current month)
   * Each day shows:

     * Color intensity based on total investment or mood
   * Clicking a day opens the details (view or edit)

3. **Basic navigation**

   * Header with links:

     * Today
     * Calendar
     * Future Insights (placeholder)

### 3.2 UX principles

* Focus on speed and simplicity
* One line reflections only, no long journaling required
* Missed days are neutral, not treated as failure
* Calendar is the visual reward

---

## 4. Data Model (Prisma)

Initial Prisma schema:

```prisma
model DayEntry {
  id          String        @id @default(cuid())
  date        DateTime      @unique
  mood        Int?          // 1 to 5
  energy      Int?          // 1 to 5
  note        String?       // short reflection for the day
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  investments Investment[]
}

model Investment {
  id       String   @id @default(cuid())
  dayId    String
  day      DayEntry @relation(fields: [dayId], references: [id])
  category String   // "career", "health", "relationships", "wellbeing", "meaning", "environment"
  score    Int      // 0 to 3
  comment  String?  // optional short comment
}
```

For v1, categories are handled in code as a fixed list, not as a separate table.

Recommended category constants:

```ts
export const INVESTMENT_CATEGORIES = [
  "career",        // career, money, skills
  "health",        // physical health
  "relationships", // family, friends, social
  "wellbeing",     // mental and emotional health
  "meaning",       // values, spirituality, purpose
  "environment",   // order, decluttering, surroundings
] as const;
```

---

## 5. Pages and Routes

Using Next.js App Router under `app/`:

### 5.1 `/` or `/today`

**Purpose:** Main daily logging page.

* Shows:

  * Today header (date in friendly format)
  * Category list with score controls
  * Mood and energy inputs
  * Short text field for reflection
* On load:

  * Fetch or create the DayEntry for today
* On save:

  * Use a server action to upsert the entry and investments

Suggested server action:

```ts
// app/today/actions.ts
export async function saveDayEntry(input: SaveDayEntryInput): Promise<void> { ... }
```

### 5.2 `/calendar`

**Purpose:** Monthly overview of all entries.

* Default to current month
* For each day:

  * Render a small cell with:

    * Background color based on investment or mood
* On click:

  * Show a side panel or modal with details of that day
  * Allow editing using the same saveDayEntry action

Implementation approach:

* Server component that fetches all DayEntry records in the month and passes them to a calendar component
* Simple month navigation can be added later with query params `?month=YYYY-MM`

### 5.3 `/insights` (future)

Placeholder for:

* Weekly summaries
* Trend charts
* Aggregated metrics

Not required for v1, but keep in mind when structuring code.

---

## 6. Styling and UI Theme

### 6.1 Visual theme

Goal: Calm and reassuring, not aggressive productivity.

Rough Tailwind direction:

* Background: `bg-slate-50` or `bg-zinc-50`
* Surface: `bg-white` with `rounded-2xl` and `shadow-sm`
* Primary: muted green or blue, for example:

  * `text-emerald-700` or `text-sky-700`
  * `bg-emerald-500` or `bg-sky-500` for emphasis
* Text:

  * `text-zinc-900` for main text
  * `text-zinc-500` for hints and labels

### 6.2 Calendar coloring

You can compute a "day intensity" as:

* Sum of all investment scores for that day, or
* Mood score, or
* A combination of both

Map that intensity to classes like:

* 0 or no data: `bg-zinc-100`
* Low: `bg-emerald-100`
* Medium: `bg-emerald-200`
* High: `bg-emerald-300` or `bg-emerald-400`

Keep the text inside calendar cells readable, use `text-zinc-800` or similar.

---

## 7. Development Setup

### 7.1 Prerequisites

* Node.js LTS
* pnpm or npm or yarn
* `DATABASE_URL` environment variable for Prisma

  * For local dev, SQLite is enough

### 7.2 Steps

1. **Create Next.js app**

   ```bash
   npx create-next-app@latest life-investment-tracker --typescript --tailwind
   ```

2. **Install Prisma**

   ```bash
   cd life-investment-tracker
   pnpm add -D prisma
   pnpm add @prisma/client
   ```

3. **Initialize Prisma**

   ```bash
   npx prisma init
   ```

   * Set `DATABASE_URL` in `.env`, for example:

     ```env
     DATABASE_URL="file:./dev.db"
     ```

   * Replace `schema.prisma` models with the DayEntry and Investment models above.

4. **Run migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start dev server**

   ```bash
   pnpm dev
   ```

---

## 8. Coding Guidelines

For AI assistants (Cursor, Copilot, etc) and future you:

* Prefer server actions for mutations instead of overcomplicating with many API routes, unless there is a clear need.

* Keep components small and focused:

  * One component for the Today form
  * One component for the Calendar grid
  * Helper components for calendar cells and dialogs

* Keep logic for computing "day intensity" in a separate utility, for example:

  ```ts
  // lib/scoring.ts
  export function calculateDayIntensity(entry: DayEntryWithInvestments): number { ... }
  ```

* Use TypeScript types for DayEntry and Investment fetched from Prisma, do not redefine them manually.

* Stick to Tailwind for layout and styling, avoid separate CSS files unless necessary.

---

## 9. Future Enhancements

Not for v1, but good to keep in mind:

* Authentication for multi device use
* Charts for mood, energy, and per category investment over time
* CSV or JSON export for personal analysis in Python
* Weekly summary generator
* Tags for days (rest, deep work, social, etc)
