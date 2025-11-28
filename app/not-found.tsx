import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found</p>
      <Link
        href="/today"
        className="mt-4 text-primary hover:underline"
      >
        Go back to today
      </Link>
    </div>
  );
}

