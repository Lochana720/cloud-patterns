"use client";

export default function SearchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-palette"))}
      className="flex h-9 items-center gap-3 rounded-full border border-line pl-3.5 pr-2 text-sm text-ink-soft hover:text-ink"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <span className="hidden sm:inline">Find a pattern</span>
      <kbd className="rounded-full bg-blue-wash px-2 py-0.5 font-sans text-xs text-blue">Ctrl K</kbd>
    </button>
  );
}
