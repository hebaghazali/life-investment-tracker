"use client";

import { useAuthLoading } from "@/contexts/AuthLoadingContext";
import { Loader2 } from "lucide-react";

export function AuthLoadingOverlay() {
  const { isSigningOut, isSigningIn } = useAuthLoading();

  if (!isSigningOut && !isSigningIn) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            {isSigningOut ? "Signing you out..." : "Signing you in..."}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSigningOut 
              ? "Please wait while we sign you out" 
              : "Please wait while we authenticate your account"}
          </p>
        </div>
      </div>
    </div>
  );
}

