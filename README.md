# Life Investment Journal

A personal journaling app to track how you invest in different areas of your life each day - career, health, relationships, wellbeing, meaning, and environment.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (development) / PostgreSQL (production-ready)
- **ORM**: Prisma

## Features

- **Today**: Log your daily investments across 6 life categories (0-3 score each)
- **Calendar**: View your investment history with intensity heatmap
- **Insights**: (Coming soon) Analytics and trends

Each entry can include:
- Investment scores for each category
- Mood and energy levels (1-5)
- Reflection notes
- Tags for categorization
- Minimum Viable Day (MVD) marker

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd life-investment-journal
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up the environment:
   ```bash
   # Create .env file with database URL
   echo 'DATABASE_URL="file:./dev.db"' > .env
   ```

4. Initialize the database:
   ```bash
   pnpm db:push
   ```

5. (Optional) Seed with sample data:
   ```bash
   pnpm db:seed
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   │   └── dayEntry.ts    # CRUD operations for entries
│   ├── calendar/          # Calendar page
│   ├── insights/          # Insights page
│   ├── today/             # Today page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home (redirects to /today)
├── components/            # React components
│   ├── calendar/          # Calendar-specific components
│   ├── layout/            # Layout components (Header)
│   ├── today/             # Today page components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities
│   ├── prisma.ts          # Prisma client singleton
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Utility functions
├── prisma/                # Database
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
└── public/                # Static assets
```

## Database Schema

### DayEntry
- `id`: Unique identifier (CUID)
- `date`: Date of the entry (unique)
- `mood`: Mood level (1-5, optional)
- `energy`: Energy level (1-5, optional)
- `note`: Reflection note (optional)
- `isMinimumViableDay`: MVD flag
- `tags`: JSON array of tags
- `investments`: Related Investment records

### Investment
- `id`: Unique identifier (CUID)
- `dayId`: Reference to DayEntry
- `category`: Investment category (career, health, etc.)
- `score`: Score (0-3)
- `comment`: Optional comment

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed database with sample data |

## Production Deployment

For production, update `DATABASE_URL` in your environment to point to a PostgreSQL database:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

Then update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

And run:
```bash
pnpm db:generate
pnpm db:push
```

## License

MIT
