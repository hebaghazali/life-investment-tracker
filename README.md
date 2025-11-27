# Life Investment Tracker

A calm, personal web app that helps you track how you invest in different life areas every day and visualize your progress on a monthly calendar.

## Tech Stack

- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Prisma ORM** for database access
- **SQLite** for local development (PostgreSQL ready for production)

## Features

### Today Page
- Quick daily logging interface
- Track investments across 6 life categories (career, health, relationships, wellbeing, meaning, environment)
- Rate each category from 0-3
- Log mood and energy (1-5)
- Add a short daily reflection note
- Auto-saves to your local database

### Calendar Page
- Monthly calendar view of all your entries
- Visual intensity indicators using color coding
- Month navigation (previous/next)
- Quick stats: days logged, high mood days, average intensity
- Legend showing intensity levels

### Design Philosophy
- Low friction: complete an entry in under a minute
- Calm aesthetics: muted greens and blues, no aggressive colors
- Private and local: all data stays on your machine (SQLite)
- No authentication needed: single-user app
- Server-first architecture using Next.js Server Components

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, pnpm, or yarn

### Installation

1. **Clone or download this repository**

```bash
cd life-investment-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up the database**

The `.env` file should already be configured with:
```
DATABASE_URL="file:./dev.db"
```

Run Prisma migrations to create the database:

```bash
npm run db:migrate
```

This will create a `dev.db` SQLite file in the `prisma` directory with the required tables.

4. **Start the development server**

```bash
npm run dev
```

5. **Open the app**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
life-investment-tracker/
├── app/
│   ├── calendar/
│   │   └── page.tsx          # Calendar view with monthly grid
│   ├── today/
│   │   ├── actions.ts        # Server actions for saving entries
│   │   ├── page.tsx          # Today page (server component)
│   │   └── TodayForm.tsx     # Client form component
│   ├── globals.css
│   ├── layout.tsx            # Root layout with navigation
│   └── page.tsx              # Home page (redirects to /today)
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   ├── constants.ts          # Investment categories and labels
│   ├── types.ts              # TypeScript types
│   └── scoring.ts            # Day intensity calculation
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── dev.db                # SQLite database (created after migration)
└── package.json
```

## Data Model

### DayEntry
- `id`: Unique identifier (cuid)
- `date`: Date of the entry (unique, normalized to start of day)
- `mood`: Optional mood rating (1-5)
- `energy`: Optional energy rating (1-5)
- `note`: Optional short reflection text
- `investments`: Related Investment records

### Investment
- `id`: Unique identifier (cuid)
- `dayId`: Reference to DayEntry
- `category`: One of the 6 life categories
- `score`: Investment score (0-3)
- `comment`: Optional comment for this investment

## Customization

### Adding or Changing Categories

Edit `lib/constants.ts`:

```typescript
export const INVESTMENT_CATEGORIES = [
  "career",
  "health",
  // Add your own categories here
] as const;

export const CATEGORY_LABELS = {
  career: "Your Custom Label",
  health: "Another Label",
  // Add labels for your categories
};
```

### Changing Colors

The app uses Tailwind CSS. Main color classes:
- Primary: `emerald-*` (green)
- Secondary: `sky-*` (blue)
- Background: `slate-50` or `zinc-50`

Edit these in the component files or update `tailwind.config.ts` for global theme changes.

## Deployment (Production)

### Using PostgreSQL

1. Create a PostgreSQL database (e.g., on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))

2. Update `.env` with your PostgreSQL connection string:

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. Update `prisma/schema.prisma` datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Run migrations:

```bash
npx prisma migrate deploy
```

### Deploy to Vercel

1. Push your code to GitHub

2. Import your repository on [Vercel](https://vercel.com)

3. Add your `DATABASE_URL` environment variable in Vercel settings

4. Deploy!

## Future Enhancements

Ideas for v2 and beyond:
- Click on calendar days to view/edit past entries
- Weekly and monthly summary charts
- Export data to CSV or JSON
- Tags for days (rest day, deep work, social, etc.)
- Trends and insights page
- Dark mode
- Mobile app version

## Philosophy

This app is intentionally simple and personal. It's designed to:
- Encourage daily reflection without overwhelming you
- Make consistency visible at a glance
- Stay private (no cloud services required in local mode)
- Be easy to extend as your tracking needs evolve

There are no streaks, no gamification, no social features. Just you and your data.

## License

MIT - feel free to use this for personal or educational purposes.

---

Built with Next.js, Prisma, and Tailwind CSS.

