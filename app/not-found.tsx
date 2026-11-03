import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">404</p>
      <h1 className="text-3xl font-bold md:text-5xl">This page does not exist.</h1>
      <p className="max-w-md text-muted-foreground">
        Probably one of the bugs I created. Head back to the start.
      </p>
      <Link
        href="/"
        className="rounded-full border border-border px-6 py-2 text-sm transition-colors hover:bg-accent"
      >
        Back home
      </Link>
    </main>
  );
}
