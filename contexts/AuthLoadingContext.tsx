"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthLoadingContextType {
  isSigningOut: boolean;
  setIsSigningOut: (value: boolean) => void;
  isSigningIn: boolean;
  setIsSigningIn: (value: boolean) => void;
}

const AuthLoadingContext = createContext<AuthLoadingContextType | undefined>(undefined);

export function AuthLoadingProvider({ children }: { children: ReactNode }) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  return (
    <AuthLoadingContext.Provider
      value={{
        isSigningOut,
        setIsSigningOut,
        isSigningIn,
        setIsSigningIn,
      }}
    >
      {children}
    </AuthLoadingContext.Provider>
  );
}

export function useAuthLoading() {
  const context = useContext(AuthLoadingContext);
  if (context === undefined) {
    throw new Error("useAuthLoading must be used within AuthLoadingProvider");
  }
  return context;
}

