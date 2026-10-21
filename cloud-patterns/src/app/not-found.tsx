import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <h1 className="display text-5xl">That page isn&apos;t here.</h1>
      <p className="prose-serif mt-5 text-ink-soft">
        The link may be old, or the pattern may have a different name. Press Ctrl K to search, or go back to the full
        list.
      </p>
      <Link href="/#patterns" className="mt-8 inline-block rounded-full bg-blue px-5 py-3 font-semibold text-paper">
        See all patterns
      </Link>
    </div>
  );
}
