"use client";

import { useState, ReactNode, useEffect, useRef } from "react";
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
import { isDemoUser } from "@/lib/demoGuard";
import { Info, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";

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
            inline-flex items-center gap-1 px-2 py-1 text-xs
            md:gap-1.5 md:px-3 md:text-sm
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
          <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="whitespace-nowrap">Use demo account</span>
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
  const { setIsSigningIn } = useAuthLoading();
  
  const isDemo = isDemoUser(user);
  const isAccountSettingsPage = pathname?.includes('/handler/account-settings');
  const isSignInPage = pathname?.includes('/handler/sign-in');
  const isSignUpPage = pathname?.includes('/handler/sign-up');
  
  // Track previous user state to detect authentication
  const previousUserRef = useRef(user);
  
  // Detect when user just authenticated and show loading state during redirect
  useEffect(() => {
    const wasUnauthenticated = !previousUserRef.current;
    const isNowAuthenticated = !!user;
    const isOnAuthPage = isSignInPage || isSignUpPage;
    
    // User just logged in or signed up while on an auth page
    if (wasUnauthenticated && isNowAuthenticated && isOnAuthPage) {
      setIsSigningIn(true);
      // Stack Auth will automatically redirect to /today
      // Loading state will remain until component unmounts during navigation
    }
    
    // Update ref for next render
    previousUserRef.current = user;
  }, [user, isSignInPage, isSignUpPage, setIsSigningIn]);
  
  // Block demo user from accessing account settings where they could change password
  useEffect(() => {
    if (isDemo && isAccountSettingsPage) {
      toast.error("Account settings are disabled for the demo account. Please create your own account to access these features.");
      router.push('/today');
    }
  }, [isDemo, isAccountSettingsPage, router]);
  
  // Check if user was redirected due to demo restriction
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo-restricted') === 'true') {
      toast.error("This feature is disabled for the demo account. Please create your own account.");
      // Clean up the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('demo-restricted');
      window.history.replaceState({}, '', url.toString());
    }
  }, [pathname]);
  
  // Don't render account settings for demo user (prevents flash before redirect)
  if (isDemo && isAccountSettingsPage) {
    return (
      <div className="flex min-h-screen items-center justify-center p-3 md:p-4">
        <Card className="max-w-md border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="p-4 text-center md:p-6">
            <h2 className="mb-2 text-base font-semibold text-amber-900 dark:text-amber-100 md:text-lg">
              Demo Account Restriction
            </h2>
            <p className="text-xs text-amber-800 dark:text-amber-200 md:text-sm">
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
        <div className="absolute right-3 top-3 z-10 md:right-4 md:top-4">
          <DemoAccountDialog />
        </div>
      )}
      {children}
    </div>
  );
}

