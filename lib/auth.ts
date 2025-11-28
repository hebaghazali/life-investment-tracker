import { stackServerApp } from "./stack";

/**
 * Gets the currently authenticated user from Neon Auth (Stack Auth).
 * 
 * @returns User object with id, or null if not authenticated
 * 
 * Usage in Server Components:
 *   const user = await getCurrentUser();
 *   if (!user) redirect('/auth/login');
 * 
 * Usage in Server Actions:
 *   const user = await getCurrentUser();
 *   if (!user) throw new Error('Unauthorized');
 */
export async function getCurrentUser() {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.primaryEmail,
      displayName: user.displayName,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Gets the current user or throws an error if not authenticated.
 * Use this when you want to enforce authentication.
 * 
 * @throws Error if user is not authenticated
 */
export async function requireUser() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
}

/**
 * Development helper: Returns a fixed user ID for local development
 * when Neon Auth is not yet configured.
 * 
 * Remove or comment out after Neon Auth is properly configured.
 */
export async function getDevUser() {
  return {
    id: "dev-user",
    email: "dev@example.com",
    displayName: "Dev User",
  };
}

