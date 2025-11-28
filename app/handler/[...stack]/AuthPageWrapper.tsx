"use client";

import { useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNT_EMAIL } from "@/lib/constants";

interface AuthPageWrapperProps {
  children: ReactNode;
}

function DemoAccountNotice() {
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = usePathname();
  
  // Only show on sign-in page
  const isSignInPage = pathname?.includes('/handler/sign-in');
  
  if (!isSignInPage || isDismissed) {
    return null;
  }

  return (
    <Card className="mx-auto mb-6 max-w-md border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
              Quick demo login
            </h3>
            <p className="mb-3 text-sm text-blue-800 dark:text-blue-200">
              You can explore the app using our demo account:
            </p>
            <div className="rounded-md bg-white/60 p-3 font-mono text-sm dark:bg-blue-900/30">
              <div className="mb-1">
                <span className="text-blue-700 dark:text-blue-300">Email:</span>{" "}
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {DEMO_ACCOUNT_EMAIL}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Password:</span>{" "}
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  password123
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="h-6 px-2 text-blue-700 hover:bg-blue-100 hover:text-blue-900 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-100"
          >
            Got it
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  
  const isDemoUser = user?.primaryEmail === DEMO_ACCOUNT_EMAIL;
  const isAccountSettingsPage = pathname?.includes('/handler/account-settings');
  
  // Block demo user from accessing account settings where they could change password
  useEffect(() => {
    if (isDemoUser && isAccountSettingsPage) {
      router.push('/today');
    }
  }, [isDemoUser, isAccountSettingsPage, router]);
  
  // Don't render account settings for demo user (prevents flash before redirect)
  if (isDemoUser && isAccountSettingsPage) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="p-6 text-center">
            <h2 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-100">
              Demo Account Restriction
            </h2>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Account settings are disabled for the demo account to keep it accessible for everyone. 
              Redirecting you back...
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <DemoAccountNotice />
      {children}
    </div>
  );
}

