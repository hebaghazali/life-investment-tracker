# Life Investment Journal

A personal journaling app to track how you invest in different areas of your life each day - career, health, relationships, wellbeing, meaning, and environment.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via managed providers like Neon, Supabase, or Railway)
- **ORM**: Prisma
- **Authentication**: Neon Auth (Stack Auth)

## Features

- **Multi-User Support**: Each user has their own isolated data via Neon Auth
- **Today**: Log your daily investments across 6 life categories (0-3 score each)
- **Calendar**: View your investment history with intensity heatmap
- **Insights**: (Coming soon) Analytics and trends

Each entry can include:
- Investment scores for each category
- Mood and energy levels (1-5)
- Reflection notes
- Tags for categorization
- Minimum Viable Day (MVD) marker

### Authentication

The app uses **Neon Auth** (powered by Stack Auth) for user management. Features:
- Secure sign-up and sign-in
- Email verification
- Password reset
- User profile management
- Automatic data isolation (each user only sees their own entries)

See [NEON_AUTH_SETUP.md](./NEON_AUTH_SETUP.md) for setup instructions.

### Progressive Web App (PWA)

The app is installable as a Progressive Web App, providing an app-like experience on mobile and desktop:

📱 **Install on Mobile**:
- **Android (Chrome)**: Tap the menu (⋮) → "Add to Home screen" → Confirm
- **iOS (Safari)**: Tap the Share button → "Add to Home Screen" → Confirm

💻 **Install on Desktop**:
- **Chrome/Edge**: Click the install icon in the address bar → "Install"

✨ **PWA Features**:
- **Offline Access**: Core app UI loads even without internet
- **Fast Loading**: Static assets cached for instant access
- **App-like Feel**: Runs in standalone mode without browser UI
- **Home Screen Icon**: Launch directly from your device's home screen

⚠️ **Current Limitations**:
- Creating or editing entries requires an internet connection
- Offline data sync coming in a future update

For technical details, see the [PWA Support section in COMPREHENSIVE_DOCUMENTATION.md](./COMPREHENSIVE_DOCUMENTATION.md#pwa-support).

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

3. **Database Setup** (PostgreSQL):
   
   The app uses **PostgreSQL** as the primary database. **Note**: Earlier versions used SQLite for local development; that data is not automatically migrated. This is a personal project, so you can simply re-enter data as needed.
   
   **Option A: Using a Managed Provider (Recommended)**
   
   Create a free PostgreSQL database using one of these providers:
   - **[Neon](https://neon.tech)** - Serverless Postgres with generous free tier
   - **[Supabase](https://supabase.com)** - Open-source Firebase alternative
   - **[Railway](https://railway.app)** - Simple deployment platform
   
   After creating your database:
   
   a. Copy the connection string provided by your provider
   
   b. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   
   c. Update the `DATABASE_URL` in your `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   ```
   
   **Option B: Local PostgreSQL**
   
   If you have PostgreSQL installed locally:
   ```bash
   # Create a local database
   createdb life_investment_tracker
   
   # Add to .env
   echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/life_investment_tracker"' > .env
   ```

4. Run database migrations:
   ```bash
   pnpm db:migrate
   ```
   
   Or if you prefer to push schema without migrations:
   ```bash
   pnpm db:push
   ```

5. **Configure Authentication** (Required for multi-user support):
   
   The app uses Neon Auth for user authentication. You have two options:
   
   **Option A: Development Mode** (Quick start without auth)
   - The app will work with a mock user (`dev-user`)
   - Perfect for testing the UI and features
   - See [QUICK_START.md](./QUICK_START.md) for details
   
   **Option B: Production Auth Setup**
   - Provision Neon Auth from your Neon Console
   - Add these to your `.env`:
     ```env
     NEXT_PUBLIC_STACK_PROJECT_ID="proj_..."
     NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="pkey_..."
     STACK_SECRET_SERVER_KEY="skey_..."
     ```
   - Full instructions in [NEON_AUTH_SETUP.md](./NEON_AUTH_SETUP.md)

6. (Optional) Seed with sample data:
   ```bash
   pnpm db:seed
   ```

7. Start the development server:
   ```bash
   pnpm dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
- `userId`: User identifier from Neon Auth
- `date`: Date of the entry
- `mood`: Mood level (1-5, optional)
- `energy`: Energy level (1-5, optional)
- `note`: Reflection note (optional)
- `isMinimumViableDay`: MVD flag
- `tags`: JSON array of tags
- `investments`: Related Investment records
- **Unique Constraint**: `(userId, date)` - One entry per user per day

### Investment
- `id`: Unique identifier (CUID)
- `dayId`: Reference to DayEntry
- `categoryId`: Reference to InvestmentCategory
- `score`: Score (0-3)
- `comment`: Optional comment

### InvestmentCategory
- `id`: Unique identifier (CUID)
- `name`: Category name (career, health, relationships, etc.)
- `displayName`: Human-readable name
- `description`: Category description
- `color`: UI color
- `icon`: Icon identifier

See [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) for detailed authentication architecture.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations (creates migration files) |
| `pnpm db:push` | Push schema to database (without migrations) |
| `pnpm db:studio` | Open Prisma Studio to explore data |
| `pnpm db:seed` | Seed database with sample data |

## Production Deployment

The app is already configured for PostgreSQL. For production deployment (e.g., Vercel, Railway):

1. Set the `DATABASE_URL` environment variable in your deployment platform to your production PostgreSQL connection string.

2. The deployment platform will automatically run `postinstall` script (`prisma generate`).

3. Run migrations on first deploy:
   ```bash
   pnpm db:migrate
   ```
   
   Or use `db:push` for quick deployments:
   ```bash
   pnpm db:push
   ```

**Note**: For Vercel deployments with Prisma, migrations are typically run locally and committed to git, then applied automatically during deployment. See [Prisma's deployment docs](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel) for best practices.

## License

MIT
