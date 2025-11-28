import { DEMO_ACCOUNT_EMAIL } from "./constants";

/**
 * Checks if an email address belongs to the demo account.
 * 
 * @param email - Email address to check (can be null or undefined)
 * @returns true if the email matches the demo account email
 */
export function isDemoEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === DEMO_ACCOUNT_EMAIL.toLowerCase();
}

/**
 * Checks if a user object represents the demo account.
 * 
 * @param user - User object with email or primaryEmail property
 * @returns true if the user is the demo account
 */
export function isDemoUser(user: { email?: string | null; primaryEmail?: string | null } | null | undefined): boolean {
  if (!user) return false;
  const email = user.primaryEmail || user.email;
  return isDemoEmail(email);
}

