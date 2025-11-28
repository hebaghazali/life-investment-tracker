import { Suspense } from "react";
import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";

export default function Handler(props: any) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <StackHandler fullPage app={stackServerApp} {...props} />
    </Suspense>
  );
}

