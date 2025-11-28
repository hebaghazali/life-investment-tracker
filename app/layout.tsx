import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
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
        <div className="min-h-screen bg-background">
          <Header />
          <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

