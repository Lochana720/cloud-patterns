"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { patterns } from "@/data/patterns";

function matches(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return patterns;
  return patterns.filter((p) =>
    [p.name, p.category, p.summary, p.services.aws, p.services.azure, p.services.gcp, p.services.openSource]
      .join(" ")
      .toLowerCase()
      .includes(s),
  );
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => matches(query), [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/patterns/${slug}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Find a pattern"
        className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_60px_-20px_rgba(19,35,63,0.45)]"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          }
          if (e.key === "Enter" && results[active]) go(results[active].slug);
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patterns or services, like “SQS” or “retry”"
          aria-label="Search patterns"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          aria-activedescendant={results[active] ? `opt-${results[active].slug}` : undefined}
          className="w-full border-b border-line bg-transparent px-5 py-4 text-lg outline-none placeholder:text-ink-soft"
        />
        <ul id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-5 py-6 text-ink-soft">
              No pattern matches “{query}”. Try a cloud service name or a problem, like “spikes”.
            </li>
          )}
          {results.map((p, i) => (
            <li
              key={p.slug}
              id={`opt-${p.slug}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(p.slug)}
              className={`cursor-pointer px-5 py-3 ${i === active ? "bg-blue-wash" : ""}`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-semibold">{p.name}</span>
                <span className="shrink-0 text-sm text-ink-soft">{p.category}</span>
              </div>
              <p className="mt-0.5 line-clamp-1 font-serif text-[15px] text-ink-soft">{p.summary}</p>
            </li>
          ))}
        </ul>
        <div className="flex gap-4 border-t border-line px-5 py-2.5 text-xs text-ink-soft">
          <span>↑↓ to move</span>
          <span>Enter to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
