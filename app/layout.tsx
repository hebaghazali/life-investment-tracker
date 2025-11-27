import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Investment Tracker",
  description: "Track how you invest in your life every day",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-zinc-900 min-h-screen">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-zinc-900">
                  Life Investment Tracker
                </h1>
                <nav className="flex gap-6">
                  <Link
                    href="/today"
                    className="text-zinc-600 hover:text-emerald-600 transition-colors font-medium"
                  >
                    Today
                  </Link>
                  <Link
                    href="/calendar"
                    className="text-zinc-600 hover:text-emerald-600 transition-colors font-medium"
                  >
                    Calendar
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">
            <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-zinc-200 py-4">
            <div className="max-w-5xl mx-auto px-4 text-center text-sm text-zinc-500">
              Your personal investment tracker
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

