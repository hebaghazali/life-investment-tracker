# Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Neon Auth (Stack Auth)                   │
│                    Identity Provider (External)              │
│         - User Management                                    │
│         - Password Storage                                   │
│         - Session Management                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ provides user.id
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    Your Next.js App                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ lib/auth.ts                                          │  │
│  │  - getCurrentUser()   → user object or null         │  │
│  │  - requireUser()      → user object or throw error  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Server Actions (app/actions/dayEntry.ts)            │  │
│  │                                                      │  │
│  │  const user = await requireUser();                  │  │
│  │                                                      │  │
│  │  prisma.dayEntry.findMany({                         │  │
│  │    where: { userId: user.id }  ← filters by user   │  │
│  │  });                                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Neon Postgres Database                               │  │
│  │                                                      │  │
│  │  DayEntry Table:                                    │  │
│  │  ┌─────┬────────┬────────┬──────┬────────┐         │  │
│  │  │ id  │ userId │  date  │ mood │ energy │         │  │
│  │  ├─────┼────────┼────────┼──────┼────────┤         │  │
│  │  │ c1  │ user-1 │ Nov 28 │  4   │   3    │         │  │
│  │  │ c2  │ user-2 │ Nov 28 │  5   │   4    │  ← Different users   │
│  │  │ c3  │ user-1 │ Nov 27 │  3   │   2    │  ← Same day OK      │
│  │  └─────┴────────┴────────┴──────┴────────┘         │  │
│  │                                                      │  │
│  │  UNIQUE(userId, date) ← One entry per user per day │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Creating a Day Entry

```
1. User clicks "Save" on Today page
   ↓
2. Client calls saveDayEntry(data)
   ↓
3. Server Action:
   const user = await requireUser();
   // → If not authenticated: throws error
   // → If authenticated: gets { id, email, displayName }
   ↓
4. Create entry with userId:
   prisma.dayEntry.create({
     data: {
       userId: user.id,  ← Automatically scoped to user
       date: "2024-11-28",
       mood: 4,
       ...
     }
   });
   ↓
5. Database enforces UNIQUE(userId, date)
   // → Each user can have only one entry per day
   // → Different users can have entries for same day
   ↓
6. Success! Entry saved for this user only
```

---

## Data Flow: Reading Entries

```
1. User views Calendar page
   ↓
2. Server Component/Action:
   const user = await getCurrentUser();
   if (!user) redirect("/handler/sign-in");
   ↓
3. Query filtered by userId:
   prisma.dayEntry.findMany({
     where: {
       userId: user.id,  ← Automatic isolation
       date: { gte: startDate, lte: endDate }
     }
   });
   ↓
4. Returns ONLY this user's entries
   // → User A never sees User B's data
   // → No additional filtering needed in UI
   ↓
5. Display entries on calendar
```

---

## Key Design Decisions

### 1. No Prisma User Model ❌

**Why Not?**
```prisma
// ❌ We did NOT do this:
model User {
  id         String     @id
  email      String
  name       String
  dayEntries DayEntry[]
}
```

**Reason:**
- Neon Auth already manages users
- No need to duplicate user data
- Simpler schema
- Single source of truth for user info

---

### 2. userId as String ✅

**Why?**
```prisma
// ✅ We DID do this:
model DayEntry {
  userId String  // References Neon Auth user (not a Prisma relation)
  // ...
}
```

**Reason:**
- userId is just a reference to external auth system
- No foreign key needed
- Flexible if auth provider changes
- Simpler queries

---

### 3. Compound Unique Key ✅

**Why?**
```prisma
@@unique([userId, date])  // Not just @unique on date
```

**What It Means:**
```
✅ Allowed:
- User A: Nov 28 entry
- User B: Nov 28 entry  ← Same date, different user

❌ Prevented:
- User A: Nov 28 entry #1
- User A: Nov 28 entry #2  ← Same user, same date
```

---

## Security Guarantees

### Automatic Data Isolation

Every query is automatically filtered:

```ts
// ❌ NEVER do this:
prisma.dayEntry.findMany();  // Returns ALL users' data!

// ✅ ALWAYS do this:
const user = await requireUser();
prisma.dayEntry.findMany({
  where: { userId: user.id }  // Only this user's data
});
```

### All Actions Protected

```ts
// Every server action starts with:
const user = await requireUser();

// If not authenticated → Error thrown
// If authenticated → user.id available for queries
```

### UI Shows Auth State

```tsx
// Header Component
const user = useUser();

{user ? (
  <UserButton />  // Shows profile, sign out
) : (
  <Link href="/handler/sign-in">Sign In</Link>
)}
```

---

## Investment Categories - Hybrid Model

### Why Both String Enum AND Database Table?

```
TypeScript/Client Side:
┌──────────────────────────┐
│ type = "career"          │  ← Simple string for type safety
│ type = "health"          │
│ type = "relationships"   │
└──────────────────────────┘
         ↓
    Mapping Layer
    (in server actions)
         ↓
┌──────────────────────────┐
│ InvestmentCategory table │  ← Relational for metadata
│ - id: "abc123"          │
│ - name: "career"        │
│ - displayName: "Career" │
│ - color: "#blue"        │
│ - icon: "briefcase"     │
└──────────────────────────┘
```

**Benefits:**
- Type safety in code (string enum)
- Rich metadata in database (colors, icons, descriptions)
- Efficient querying and filtering
- Easy to extend with new fields

---

## Routes

```
Public Routes:
  /handler/sign-in       → Sign in page
  /handler/sign-up       → Sign up page
  /handler/forgot-password → Password reset

Protected Routes (require auth):
  /today                 → Today's entry form
  /calendar              → Monthly calendar view
  /insights              → Analytics and insights

Auth automatically handles:
  /handler/sign-out      → Sign out
  /handler/verify-email  → Email verification
  /handler/account-settings → User profile
```

---

## Development vs Production

### Development Mode (No Neon Auth Yet)

```ts
// Temporarily use:
import { getDevUser } from "@/lib/auth";
const user = await getDevUser();  // Returns { id: "dev-user" }
```

### Production Mode (With Neon Auth)

```ts
// Use real auth:
import { requireUser } from "@/lib/auth";
const user = await requireUser();  // Gets real user from Stack Auth
```

---

## Migration Path for Existing Data

All existing entries were assigned:
```sql
UPDATE "DayEntry" 
SET "userId" = 'dev-user' 
WHERE "userId" IS NULL;
```

**Options:**
1. Keep as demo data (userId: "dev-user")
2. Delete test data and start fresh
3. Manually reassign to a real user ID after auth is set up

---

## Performance Considerations

### Indexed Queries

The compound unique index provides fast lookups:

```sql
-- Fast: Uses unique index
SELECT * FROM "DayEntry" 
WHERE "userId" = ? AND "date" = ?;

-- Fast: Uses index on userId
SELECT * FROM "DayEntry" 
WHERE "userId" = ? 
ORDER BY "date" DESC;
```

### N+1 Query Prevention

```ts
// ✅ Good: Includes category in one query
const entries = await prisma.dayEntry.findMany({
  include: { 
    investments: {
      include: { category: true }  // Eager load
    }
  }
});

// ❌ Bad: Would cause N+1 queries
const entries = await prisma.dayEntry.findMany();
for (const entry of entries) {
  // Separate query per entry!
  const investments = await prisma.investment.findMany({
    where: { dayId: entry.id }
  });
}
```

---

## Future Enhancements

### 1. Route Middleware
```ts
// middleware.ts
export async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user && request.nextUrl.pathname.startsWith('/today')) {
    return NextResponse.redirect('/handler/sign-in');
  }
}
```

### 2. User Settings Page
```tsx
// app/settings/page.tsx
const user = await getCurrentUser();
// Show profile editing, preferences, etc.
```

### 3. Multi-tenancy / Teams
```prisma
// Future: Add organizations
model DayEntry {
  userId String
  orgId  String?  // Optional: for team/org features
  // ...
}
```

---

## Summary

✅ **Zero-Trust Architecture**: Every action requires authentication
✅ **Automatic Isolation**: Data filtered by userId in all queries  
✅ **No User Duplication**: Neon Auth is single source of truth
✅ **Compound Uniqueness**: One entry per user per day enforced
✅ **Type-Safe Categories**: Hybrid string enum + relational model
✅ **Production Ready**: Just add Neon Auth credentials

**Next Step**: Get your Neon Auth credentials and you're live! 🚀

