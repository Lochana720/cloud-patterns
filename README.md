Cloud Patterns

An interactive field guide to 14 cloud design patterns: Circuit Breaker, Retry, Bulkhead, Rate Limiting, Cache-Aside, CQRS, Event Sourcing, Sharding, Pub/Sub, Queue-Based Load Leveling, Saga, API Gateway, Strangler Fig and Sidecar.

Each pattern page has an animated architecture diagram, the problem and solution, step-by-step flow, when to use or avoid it, and the AWS, Azure, Google Cloud and open-source tools that implement it.

 Features

Live circuit breaker simulator** on the home page (closed → open → half-open state machine)
Data-driven SVG diagrams with animated request packets, generated from `src/data/patterns.ts`
Command palette search (Ctrl K or `/`) across patterns and cloud services
Filter by group and text filter on the pattern index
Light and dark themes, saved per browser, no flash on load
Fully static (SSG): every page is pre-rendered at build time
SEO: per-page metadata, sitemap.xml, robots.txt, Open Graph image, JSON-LD
Accessibility: skip link, keyboard focus styles, ARIA on diagrams and palette, reduced-motion support
Security headers set in `next.config.ts`
CI with GitHub Actions (type-check + build on every push)

 Tech stack (all free)

| Layer | Tool |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript |
| Hosting | Vercel (Hobby plan) |
| CI | GitHub Actions |
| Fonts | Google Fonts (Archivo, Source Serif 4) |


1. Sign in at [vercel.com](https://vercel.com) with GitHub and choose **Add New → Project.
2. Import the `cloud-patterns` repo. Vercel detects Next.js automatically; keep the defaults and click Deploy.
3. Optional: in **Settings → Environment Variables, set `NEXT_PUBLIC_SITE_URL` to your final URL (for example `https://cloud-patterns.vercel.app`) so the sitemap and social cards use it.

Every push to `main` redeploys automatically, and pull requests get preview URLs.

 Add a new pattern

Add an object to the `patterns` array in `src/data/patterns.ts`. The page, sitemap entry, search result and diagram are generated from it.

Diagram nodes sit on a 640 × 300 canvas (`x`, `y` are the node centre). Node kinds: `client`, `service`, `store`, `queue`, `gateway`, `faulty`. Edges can be `dashed`, animated with `flow`, and coloured as failures with `tone: "fault"`.

