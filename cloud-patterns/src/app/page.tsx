import Link from "next/link";
import BreakerSimulator from "@/components/BreakerSimulator";
import PatternIndex from "@/components/PatternIndex";
import { patterns } from "@/data/patterns";

export default function Home() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-20">
        <div>
          <h1 className="display text-[2.75rem] sm:text-6xl lg:text-[4.25rem]">
            Design for the day something breaks.
          </h1>
          <p className="prose-serif mt-6 text-ink-soft sm:text-xl">
            A field guide to {patterns.length} cloud design patterns. Each one explains the problem it solves, how it
            works step by step, and which AWS, Azure and Google Cloud services you can build it with.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#patterns"
              className="rounded-full bg-blue px-5 py-3 font-semibold text-paper hover:opacity-90"
            >
              Browse the patterns
            </Link>
            <Link
              href="/patterns/circuit-breaker"
              className="rounded-full border border-line px-5 py-3 font-semibold hover:border-blue"
            >
              Start with Circuit Breaker
            </Link>
          </div>
        </div>
        <BreakerSimulator />
      </section>

      <PatternIndex />
    </>
  );
}
