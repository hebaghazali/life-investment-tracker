# Neon Auth Setup Guide

This document explains how to complete the Neon Auth integration for the Life Investment Tracker.

## What Was Done

✅ **Schema Updated**
- Added `userId` field to `DayEntry` model
- Changed unique constraint from `date` alone to `@@unique([userId, date])`
- One entry per user per day is now enforced

✅ **Migration Created**
- Added `userId` column to existing table
- Backfilled existing entries with `"dev-user"` as default userId
- Updated constraints properly

✅ **Dependencies Installed**
- `@stackframe/stack` - Stack Auth SDK (Neon Auth's identity provider)
- `server-only` - Ensures server-side code doesn't leak to client

✅ **Auth Infrastructure**
- Created `lib/stack.ts` - Stack Auth server configuration
- Created `lib/auth.ts` - Auth helper functions
- Updated `app/layout.tsx` - Added StackProvider wrapper
- Created `app/handler/[...stack]/page.tsx` - Auth handler routes

✅ **Server Actions Updated**
- All day entry actions now require authentication
- All queries are filtered by `userId`
- New entries automatically include the user's ID

## What You Need to Do Next

### 1. Provision Neon Auth

You need to set up Neon Auth for your project. This will create the integration with Stack Auth.

**Option A: Use Neon Console** (Recommended)
- Go to your Neon project dashboard
- Navigate to "Auth" section
- Follow the setup wizard to provision Neon Auth
- This will generate your Stack Auth credentials

**Option B: Contact Neon Support**
- Ask them to enable Neon Auth for your project
- They'll provide you with Stack Auth credentials

### 2. Configure Environment Variables

After provisioning, add these to your `.env` file:

```env
# Neon Auth / Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID="your_project_id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_publishable_key"
STACK_SECRET_SERVER_KEY="your_secret_key"
```

### 3. Test Authentication

1. Start your dev server: `pnpm dev`
2. Navigate to `/handler/sign-in` to test sign-in
3. Navigate to `/handler/sign-up` to test registration
4. Try creating a day entry - it should now be tied to your user

### 4. Development Mode (Before Neon Auth is Set Up)

If you want to test the app before provisioning Neon Auth, you can use the development helper:

In any server action or server component, temporarily replace:
```ts
const user = await requireUser();
```

With:
```ts
const user = await getDevUser(); // Returns { id: "dev-user" }
```

This allows you to test the user-scoped functionality without actual auth.

**⚠️ Important**: Remove all `getDevUser()` calls once Neon Auth is configured!

## Using Authentication in Your Code

### In Server Components

```tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/handler/sign-in");
  }
  
  return <div>Welcome, {user.displayName || user.email}!</div>;
}
```

### In Server Actions

```ts
"use server";

import { requireUser } from "@/lib/auth";

export async function myAction() {
  const user = await requireUser(); // Throws error if not authenticated
  
  // Use user.id for database queries
  const entries = await prisma.dayEntry.findMany({
    where: { userId: user.id },
  });
  
  return entries;
}
```

### In Client Components

```tsx
"use client";

import { useUser } from "@stackframe/stack";

export function MyComponent() {
  const user = useUser();
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return <div>Hello, {user.displayName}</div>;
}
```

## Key Points

1. **No User Model in Prisma**: We're using Neon Auth's user management, so there's no `User` model in your Prisma schema. The `userId` in `DayEntry` references Neon Auth users.

2. **Compound Unique Key**: The `@@unique([userId, date])` ensures each user can have only one entry per day, but multiple users can have entries for the same date.

3. **Existing Data**: All existing entries have been assigned to userId `"dev-user"`. You may want to delete these test entries once you start using real users.

4. **Automatic Filtering**: All server actions now automatically filter data by the authenticated user's ID, so users can only see their own data.

## Troubleshooting

**Error: "Authentication required"**
- Make sure you're signed in
- Check that environment variables are set correctly
- Verify Stack Auth is properly initialized

**Can't access /handler/sign-in**
- Ensure `@stackframe/stack` is installed
- Check that `StackProvider` is in your root layout
- Verify the handler route exists at `app/handler/[...stack]/page.tsx`

**Data not showing up**
- Check that you're signed in with the same user who created the data
- Remember: all queries are now filtered by userId
- Existing "dev-user" data won't show for real authenticated users

## Next Steps

After authentication is working:
1. Update the Header component to show user info and sign out button
2. Add protected route middleware if needed
3. Consider adding user profile page
4. Test multi-user scenarios

