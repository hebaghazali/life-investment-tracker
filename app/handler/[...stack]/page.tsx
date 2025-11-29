import { Suspense } from "react";
import { 
  StackHandler,
  CredentialSignIn,
  CredentialSignUp,
  OAuthButtonGroup
} from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import { AuthPageWrapper } from "./AuthPageWrapper";

export default async function Handler(props: any) {
  // Await params in Next.js 15+
  const params = await props.params;
  
  // Check if this is a sign-in or sign-up page
  const isSignIn = params?.stack?.[0] === "sign-in";
  const isSignUp = params?.stack?.[0] === "sign-up";
  
  // For sign-in and sign-up pages, use custom layout with form first, then OAuth
  if (isSignIn || isSignUp) {
    return (
      <AuthPageWrapper>
        <Suspense fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-lg text-muted-foreground">Loading...</div>
            </div>
          </div>
        }>
          <div className="flex min-h-screen items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold">
                  {isSignIn ? "Sign in to your account" : "Create a new account"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isSignIn 
                    ? (
                      <>
                        Don't have an account?{" "}
                        <a 
                          href="/handler/sign-up" 
                          className="font-medium text-primary hover:underline"
                        >
                          Sign up
                        </a>
                      </>
                    )
                    : (
                      <>
                        Already have an account?{" "}
                        <a 
                          href="/handler/sign-in" 
                          className="font-medium text-primary hover:underline"
                        >
                          Sign in
                        </a>
                      </>
                    )
                  }
                </p>
              </div>
              
              {/* Email/Password form first */}
              <div className="space-y-4">
                {isSignIn ? <CredentialSignIn /> : <CredentialSignUp />}
              </div>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              {/* OAuth buttons at the bottom */}
              <OAuthButtonGroup type={isSignIn ? "sign-in" : "sign-up"} />
            </div>
          </div>
        </Suspense>
      </AuthPageWrapper>
    );
  }
  
  // For other auth pages (account-settings, etc.), use default StackHandler
  return (
    <AuthPageWrapper>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-lg text-muted-foreground">Loading...</div>
          </div>
        </div>
      }>
        <StackHandler fullPage app={stackServerApp} {...props} />
      </Suspense>
    </AuthPageWrapper>
  );
}

