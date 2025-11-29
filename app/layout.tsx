import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import { AuthLoadingProvider } from "@/contexts/AuthLoadingContext";
import { AuthLoadingOverlay } from "@/components/AuthLoadingOverlay";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { OfflineSyncProvider } from "@/components/OfflineSyncProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Investment Tracker",
  description:
    "Track how you invest in your life each day - career, health, relationships, wellbeing, and more",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeInvest",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#0891b2",
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
              <ServiceWorkerRegister />
              <OfflineSyncProvider />
              <AuthLoadingOverlay />
              <div className="min-h-screen bg-background">
                <Suspense fallback={
                  <header className="border-b border-border bg-card">
                    <div className="mx-auto max-w-6xl px-3 md:px-6 lg:px-8">
                      <div className="flex h-16 items-center justify-between">
                        <h1 className="text-lg md:text-xl font-semibold text-foreground">
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
                <main className="mx-auto max-w-4xl px-3 py-4 md:px-6 md:py-8 lg:px-8">
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

