import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-serif text-5xl">Page not found</h1>
      <p className="mt-4 text-muted">That URL is not on this site.</p>
      <Link href="/" className="mt-8 inline-block text-sm text-accent">
        Back home
      </Link>
    </div>
  );
}
