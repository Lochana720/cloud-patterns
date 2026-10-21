/**
 * Public URL of the site, used for canonical links, the sitemap and social cards.
 * Set NEXT_PUBLIC_SITE_URL in Vercel once you have a domain.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
