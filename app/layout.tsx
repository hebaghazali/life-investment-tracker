import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import { AuthLoadingProvider } from "@/contexts/AuthLoadingContext";
import { AuthLoadingOverlay } from "@/components/AuthLoadingOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Investment Journal",
  description:
    "Track how you invest in your life each day - career, health, relationships, wellbeing, and more",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <AuthLoadingProvider>
              <AuthLoadingOverlay />
              <div className="min-h-screen bg-background">
                <Suspense fallback={
                  <header className="border-b border-border bg-card">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                      <div className="flex h-16 items-center justify-between">
                        <h1 className="text-xl font-semibold text-foreground">
                          Life Investment Journal
                        </h1>
                        <nav className="flex items-center gap-6">
                          <div className="ml-4 text-sm text-muted-foreground">Loading...</div>
                        </nav>
                      </div>
                    </div>
                  </header>
                }>
                  <Header />
                </Suspense>
                <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                  {children}
                </main>
              </div>
              <Toaster position="bottom-right" />
            </AuthLoadingProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}

