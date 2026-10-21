"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Diagram from "@/components/Diagram";
import { categories, patterns } from "@/data/patterns";
import type { Category } from "@/data/types";

export default function PatternIndex() {
  const [filter, setFilter] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((c) => filter === "All" || c.name === filter)
      .map((c) => ({
        ...c,
        items: patterns.filter(
          (p) =>
            p.category === c.name &&
            (!q || `${p.name} ${p.summary} ${p.problem}`.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [filter, query]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section id="patterns" aria-labelledby="index-title" className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col gap-5 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="index-title" className="display text-3xl sm:text-4xl">
            The patterns
          </h2>
          <p className="mt-2 text-ink-soft">
            {total === patterns.length
              ? `${patterns.length} patterns in ${categories.length} groups.`
              : `Showing ${total} of ${patterns.length}.`}
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or problem"
          aria-label="Filter patterns"
          className="w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-blue md:w-72"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by group">
        {(["All", ...categories.map((c) => c.name)] as const).map((name) => {
          const on = filter === name;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(name)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                on ? "border-blue bg-blue text-paper" : "border-line text-ink-soft hover:text-ink"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {groups.length === 0 && (
        <p className="mt-12 font-serif text-lg">
          Nothing matches “{query}”. Try a broader word, such as “failure”, “database” or “traffic”.
        </p>
      )}

      <div className="mt-10 space-y-14">
        {groups.map((g) => (
          <div key={g.name} className="grid gap-6 lg:grid-cols-[15rem_1fr] lg:gap-10">
            <div className="lg:sticky lg:top-6 lg:self-start">
              <h3 className="text-xl font-bold" style={{ fontStretch: "110%" }}>
                {g.name}
              </h3>
              <p className="mt-1 font-serif text-ink-soft">{g.blurb}</p>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {g.items.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/patterns/${p.slug}`}
                    className="group grid items-center gap-4 py-5 sm:grid-cols-[1fr_13rem] sm:gap-8"
                  >
                    <div>
                      <span className="text-lg font-bold group-hover:text-blue group-hover:underline group-hover:underline-offset-4">
                        {p.name}
                      </span>
                      <p className="mt-1 max-w-[60ch] font-serif text-[17px] text-ink-soft">{p.summary}</p>
                    </div>
                    <div className="hidden rounded-lg border border-line bg-surface p-1.5 sm:block">
                      <Diagram pattern={p} animate={false} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
