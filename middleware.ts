import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { DEMO_ACCOUNT_EMAIL } from "@/lib/constants";

/**
 * Middleware to protect demo account from account-level operations.
 * 
 * This middleware intercepts Stack Auth handler routes and blocks
 * account mutation operations for the demo account while allowing
 * regular users full access.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept Stack Auth handler routes
  if (!pathname.startsWith("/handler/")) {
    return NextResponse.next();
  }

  // Get the current user
  const user = await stackServerApp.getUser();

  // If no user, allow the request (for sign-in/sign-up flows)
  if (!user) {
    return NextResponse.next();
  }

  // Check if this is the demo account
  const isDemoAccount = user.primaryEmail?.toLowerCase() === DEMO_ACCOUNT_EMAIL.toLowerCase();

  if (!isDemoAccount) {
    // Regular user - allow all operations
    return NextResponse.next();
  }

  // Demo account - block account mutation operations
  // Block account settings, email change, password change, and account deletion
  const blockedPaths = [
    "/handler/account-settings",
    "/handler/email-verification",
    "/handler/password-reset",
    "/handler/forgot-password",
  ];

  // Check if the current path is blocked for demo account
  const isBlockedPath = blockedPaths.some((blocked) =>
    pathname.startsWith(blocked)
  );

  if (isBlockedPath) {
    // For API requests, return JSON error
    if (request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json(
        {
          error: "Demo account restrictions",
          message:
            "Account settings cannot be changed for the demo account. Please create your own account to access these features.",
        },
        { status: 403 }
      );
    }

    // For page requests, redirect to today page
    const url = request.nextUrl.clone();
    url.pathname = "/today";
    url.searchParams.set("demo-restricted", "true");
    return NextResponse.redirect(url);
  }

  // Check for POST requests to Stack Auth API that might update account
  if (request.method === "POST" && pathname.includes("/handler/")) {
    // Block any POST requests to handler routes for demo account
    // (except sign-out which is allowed)
    if (!pathname.includes("sign-out")) {
      const contentType = request.headers.get("content-type");
      
      // If it's a form submission or API call, check the body for account updates
      if (contentType?.includes("application/json") || contentType?.includes("form")) {
        // Block the request and return error
        return NextResponse.json(
          {
            error: "Demo account restrictions",
            message:
              "Account modifications are disabled for the demo account.",
          },
          { status: 403 }
        );
      }
    }
  }

  // Allow other requests
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on.
 * 
 * We only need to protect Stack Auth handler routes.
 */
export const config = {
  matcher: [
    "/handler/:path*",
  ],
};

