"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@stackframe/stack";
import { isDemoUser } from "@/lib/demoGuard";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/today", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/insights", label: "Insights" },
];

export function Header() {
  const pathname = usePathname();
  const user = useUser();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            Life Investment Journal
          </h1>

          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="ml-4">
              {user ? (
                isDemoUser(user) ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                      <Lock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
                      <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                        Demo Mode
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => user.signOut()}
                      className="text-sm"
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
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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

