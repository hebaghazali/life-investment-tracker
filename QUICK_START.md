# Quick Start - Neon Auth Integration

## ✅ What's Done

All code is implemented and working. Database is migrated. Just need Neon Auth credentials to go live.

---

## 🚀 To Get Started (2 Options)

### Option 1: Use Dev Mode (Test Without Real Auth)

**For development/testing before Neon Auth is set up:**

1. In any file where you need auth, use:
   ```ts
   import { getDevUser } from "@/lib/auth";
   const user = await getDevUser(); // Returns { id: "dev-user" }
   ```

2. Start the app:
   ```bash
   pnpm dev
   ```

3. Everything works with a mock "dev-user"

⚠️ **Remember to switch back to `requireUser()` once auth is set up!**

---

### Option 2: Set Up Real Auth (Production Ready)

1. **Get Neon Auth Credentials**
   - Go to Neon Console → Your Project → Auth
   - Or contact Neon support
   - Get your Stack Auth keys

2. **Add to `.env`**
   ```env
   NEXT_PUBLIC_STACK_PROJECT_ID="proj_..."
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="pkey_..."
   STACK_SECRET_SERVER_KEY="skey_..."
   ```

3. **Start the app**
   ```bash
   pnpm dev
   ```

4. **Test**
   - Visit http://localhost:3000/handler/sign-up
   - Create an account
   - Sign in
   - Use the app!

---

## 🔑 Key Changes Made

### Database
- `userId` added to `DayEntry`
- One entry per user per day enforced
- All existing data assigned to `"dev-user"`

### Code
- All server actions require authentication
- All queries filtered by `userId`
- Header shows sign-in/user button
- Stack Auth fully integrated

---

## 📝 Usage Examples

### In Server Actions
```ts
"use server";
import { requireUser } from "@/lib/auth";

export async function myAction() {
  const user = await requireUser(); // Throws if not authenticated
  
  // Use user.id in queries
  await prisma.dayEntry.findMany({
    where: { userId: user.id }
  });
}
```

### In Server Components
```ts
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/handler/sign-in");
  
  return <div>Hello {user.displayName}</div>;
}
```

### In Client Components
```tsx
"use client";
import { useUser } from "@stackframe/stack";

export function MyComponent() {
  const user = useUser();
  return user ? <div>{user.displayName}</div> : <div>Not signed in</div>;
}
```

---

## 🧪 Testing

```bash
# 1. Sign up
http://localhost:3000/handler/sign-up

# 2. Sign in
http://localhost:3000/handler/sign-in

# 3. Use app
http://localhost:3000/today

# 4. Check user button in header
# Should show your profile/sign out option
```

---

## 📚 Documentation

- **Full Details**: `IMPLEMENTATION_SUMMARY.md`
- **Setup Guide**: `NEON_AUTH_SETUP.md`

---

## 💡 Pro Tips

1. **Route Protection**: Consider adding middleware to auto-redirect unauthenticated users

2. **Dev vs Prod**: 
   - Dev: Use `getDevUser()` for quick testing
   - Prod: Always use `requireUser()` or `getCurrentUser()`

3. **Multi-User Testing**: 
   - Open incognito window
   - Sign in as different user
   - Verify data isolation

4. **Existing Data**:
   - All old entries belong to "dev-user"
   - Consider cleaning up test data
   - Or assign to a real user

---

## ❓ Need Help?

Check the full documentation files:
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `NEON_AUTH_SETUP.md` - How to configure

---

**Status: Ready to Use!** 🎉

Choose Option 1 (dev mode) or Option 2 (real auth) and start coding!

