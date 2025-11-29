"use client";

import dynamic from "next/dynamic";

// Dynamically import OfflineSyncProvider to prevent SSR issues
// It only needs to run on the client side
const OfflineSyncProvider = dynamic(
  () => import("@/components/OfflineSyncProvider").then((mod) => ({ default: mod.OfflineSyncProvider })),
  { ssr: false }
);

/**
 * Wrapper component for OfflineSyncProvider that handles dynamic import
 * This is needed because dynamic imports with ssr: false can't be used
 * directly in Server Components (like app/layout.tsx)
 */
export function OfflineSyncProviderWrapper() {
  return <OfflineSyncProvider />;
}

