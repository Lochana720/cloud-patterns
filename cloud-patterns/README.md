# Cloud Patterns

An interactive field guide to 14 cloud design patterns: Circuit Breaker, Retry, Bulkhead, Rate Limiting, Cache-Aside, CQRS, Event Sourcing, Sharding, Pub/Sub, Queue-Based Load Leveling, Saga, API Gateway, Strangler Fig and Sidecar.

Each pattern page has an animated architecture diagram, the problem and solution, step-by-step flow, when to use or avoid it, and the AWS, Azure, Google Cloud and open-source tools that implement it.

## Features

- **Live circuit breaker simulator** on the home page (closed → open → half-open state machine)
- **Data-driven SVG diagrams** with animated request packets, generated from `src/data/patterns.ts`
- **Command palette search** (Ctrl K or `/`) across patterns and cloud services
- **Filter by group** and text filter on the pattern index
- **Light and dark themes**, saved per browser, no flash on load
- **Fully static (SSG)**: every page is pre-rendered at build time
- **SEO**: per-page metadata, sitemap.xml, robots.txt, Open Graph image, JSON-LD
- **Accessibility**: skip link, keyboard focus styles, ARIA on diagrams and palette, reduced-motion support
- **Security headers** set in `next.config.ts`
- **CI** with GitHub Actions (type-check + build on every push)

## Tech stack (all free)

| Layer | Tool |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript |
| Hosting | Vercel (Hobby plan) |
| CI | GitHub Actions |
| Fonts | Google Fonts (Archivo, Source Serif 4) |

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel (free)

1. Push this folder to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/cloud-patterns.git
   git push -u origin main
   ```
2. Sign in at [vercel.com](https://vercel.com) with GitHub and choose **Add New → Project**.
3. Import the `cloud-patterns` repo. Vercel detects Next.js automatically; keep the defaults and click **Deploy**.
4. Optional: in **Settings → Environment Variables**, set `NEXT_PUBLIC_SITE_URL` to your final URL (for example `https://cloud-patterns.vercel.app`) so the sitemap and social cards use it.

Every push to `main` redeploys automatically, and pull requests get preview URLs.

## Add a new pattern

Add an object to the `patterns` array in `src/data/patterns.ts`. The page, sitemap entry, search result and diagram are generated from it.

Diagram nodes sit on a 640 × 300 canvas (`x`, `y` are the node centre). Node kinds: `client`, `service`, `store`, `queue`, `gateway`, `faulty`. Edges can be `dashed`, animated with `flow`, and coloured as failures with `tone: "fault"`.

## Project structure

```
src/
  app/
    layout.tsx              header, footer, theme script, palette
    page.tsx                home: hero, simulator, index
    patterns/[slug]/page.tsx  pattern detail (statically generated)
    sitemap.ts, robots.ts, opengraph-image.tsx, not-found.tsx
  components/
    BreakerSimulator.tsx    interactive state machine
    Diagram.tsx             SVG renderer for pattern diagrams
    PatternIndex.tsx        filterable list
    CommandPalette.tsx      Ctrl K search
  data/
    patterns.ts             all content
    types.ts
```
