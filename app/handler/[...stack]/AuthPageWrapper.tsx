"use client";

import { useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DEMO_ACCOUNT_EMAIL } from "@/lib/constants";
import { Info, Copy, Check } from "lucide-react";

interface AuthPageWrapperProps {
  children: ReactNode;
}

const DEMO_PASSWORD = "password123";

function DemoAccountDialog() {
  const pathname = usePathname();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  
  // Only show on sign-in page
  const isSignInPage = pathname?.includes('/handler/sign-in');
  
  // Reset animation on mount
  useEffect(() => {
    if (isSignInPage) {
      setShouldAnimate(true);
      // Remove animation class after it completes
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [isSignInPage]);
  
  if (!isSignInPage) {
    return null;
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button 
          className={`
            inline-flex items-center gap-1.5 px-3 py-1 text-sm 
            rounded-full cursor-pointer
            bg-blue-50 text-blue-700 border border-blue-200
            hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300
            dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900
            dark:hover:bg-blue-900/50 dark:hover:text-blue-200 dark:hover:border-blue-800
            transition-all duration-200
            shadow-sm
            ${shouldAnimate ? 'animate-gentle-pulse-once' : ''}
          `.trim().replace(/\s+/g, ' ')}
        >
          <Info className="h-4 w-4" />
          <span>Use demo account</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Demo Login</DialogTitle>
          <DialogDescription>
            You can explore the app using our demo account:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">
                {DEMO_ACCOUNT_EMAIL}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(DEMO_ACCOUNT_EMAIL, 'email')}
                className="h-9 w-9 p-0"
              >
                {copiedField === 'email' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy email</span>
              </Button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">
                {DEMO_PASSWORD}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(DEMO_PASSWORD, 'password')}
                className="h-9 w-9 p-0"
              >
                {copiedField === 'password' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy password</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  
  const isDemoUser = user?.primaryEmail === DEMO_ACCOUNT_EMAIL;
  const isAccountSettingsPage = pathname?.includes('/handler/account-settings');
  const isSignInPage = pathname?.includes('/handler/sign-in');
  
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
      {/* Compact demo account link positioned at top - only on sign-in page */}
      {isSignInPage && (
        <div className="absolute top-4 right-4 z-10">
          <DemoAccountDialog />
        </div>
      )}
      {children}
    </div>
  );
}

