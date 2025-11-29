"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@stackframe/stack";
import { isDemoUser } from "@/lib/demoGuard";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";

const navLinks = [
  { href: "/today", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/insights", label: "Insights" },
];

export function Header() {
  const pathname = usePathname();
  const user = useUser();
  const { setIsSigningOut } = useAuthLoading();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    // Stack Auth will handle the redirect, loading state persists until unmount
    await user?.signOut();
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-3 md:px-6 lg:px-8">
        {/* Mobile: Two-row layout, Desktop: Single row */}
        <div className="flex min-h-16 flex-col items-start justify-center gap-2 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:gap-0 md:py-0">
          <h1 className="text-lg font-semibold text-foreground md:text-xl">
            Life Investment Journal
          </h1>

          <nav className="flex w-full flex-wrap items-center gap-3 md:w-auto md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "py-2 text-sm font-medium transition-colors hover:text-foreground",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="ml-auto md:ml-4">
              {user ? (
                isDemoUser(user) ? (
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 dark:border-amber-900 dark:bg-amber-950/30 md:gap-2 md:px-3 md:py-1.5">
                      <Lock className="h-3 w-3 text-amber-700 dark:text-amber-300 md:h-3.5 md:w-3.5" />
                      <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                        Demo Mode
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="cursor-pointer text-xs md:text-sm"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <UserButton />
                )
              ) : (
                <Link
                  href="/handler/sign-in"
                  className="py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

