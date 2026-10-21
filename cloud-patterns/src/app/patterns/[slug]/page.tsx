import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Diagram from "@/components/Diagram";
import { getPattern, patterns } from "@/data/patterns";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return patterns.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPattern(slug);
  if (!p) return {};
  return {
    title: `${p.name} pattern`,
    description: p.summary,
    alternates: { canonical: `/patterns/${p.slug}` },
    openGraph: { title: `${p.name} pattern`, description: p.summary },
  };
}

const providers = [
  { key: "aws", label: "AWS" },
  { key: "azure", label: "Microsoft Azure" },
  { key: "gcp", label: "Google Cloud" },
  { key: "openSource", label: "Open source" },
] as const;

export default async function PatternPage({ params }: Props) {
  const { slug } = await params;
  const p = getPattern(slug);
  if (!p) notFound();

  const i = patterns.findIndex((x) => x.slug === p.slug);
  const prev = patterns[i - 1];
  const next = patterns[i + 1];
  const related = p.related.map(getPattern).filter((r) => r !== undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${p.name} pattern`,
    description: p.summary,
    about: p.category,
  };

  return (
    <article className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
        <Link href="/#patterns" className="hover:text-ink hover:underline">
          All patterns
        </Link>
        <span aria-hidden> / </span>
        <span>{p.category}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <h1 className="display text-5xl sm:text-6xl">{p.name}</h1>
        <p className="prose-serif mt-5 text-xl text-ink-soft">{p.summary}</p>
      </header>

      <figure className="drafting-grid mt-10 rounded-2xl border border-line bg-surface/70 p-3 sm:p-6">
        <Diagram pattern={p} />
        <figcaption className="mt-2 flex flex-wrap gap-x-5 gap-y-1 px-2 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" /> Request in flight
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-fault" /> Failing path
          </span>
          <span>Dashed lines are asynchronous or fallback paths.</span>
        </figcaption>
      </figure>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold" style={{ fontStretch: "110%" }}>
              The problem
            </h2>
            <p className="prose-serif mt-3">{p.problem}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold" style={{ fontStretch: "110%" }}>
              The solution
            </h2>
            {p.solution.map((para) => (
              <p key={para.slice(0, 24)} className="prose-serif mt-3">
                {para}
              </p>
            ))}
          </section>

          <section>
            <h2 className="text-2xl font-bold" style={{ fontStretch: "110%" }}>
              How it works
            </h2>
            <ol className="mt-4 max-w-[66ch] space-y-3">
              {p.steps.map((s, n) => (
                <li key={s} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-blue text-sm font-bold text-blue">
                    {n + 1}
                  </span>
                  <span className="font-serif text-[17px] leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold" style={{ fontStretch: "110%" }}>
              Where to find it
            </h2>
            <p className="mt-2 text-ink-soft">Managed services and libraries that implement this pattern.</p>
            <table className="mt-5 w-full border-collapse text-left">
              <tbody>
                {providers.map(({ key, label }) => (
                  <tr key={key} className="border-t border-line align-top last:border-b">
                    <th scope="row" className="w-36 py-3.5 pr-4 font-semibold sm:w-44">
                      {label}
                    </th>
                    <td className="py-3.5 font-serif text-[17px]">{p.services[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-xl border-l-4 border-ok bg-surface p-5">
            <h2 className="font-bold">Use it when</h2>
            <ul className="mt-3 space-y-2.5 font-serif text-[16px] leading-snug">
              {p.useWhen.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border-l-4 border-fault bg-surface p-5">
            <h2 className="font-bold">Think twice when</h2>
            <ul className="mt-3 space-y-2.5 font-serif text-[16px] leading-snug">
              {p.avoidWhen.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </section>
          {related.length > 0 && (
            <section>
              <h2 className="font-bold">Often used with</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/patterns/${r.slug}`}
                      className="inline-block rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:border-blue hover:text-blue"
                    >
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <nav aria-label="More patterns" className="mt-20 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/patterns/${prev.slug}`} className="group">
            <span className="text-sm text-ink-soft">Previous</span>
            <span className="block text-xl font-bold group-hover:text-blue">{prev.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/patterns/${next.slug}`} className="group sm:text-right">
            <span className="text-sm text-ink-soft">Next</span>
            <span className="block text-xl font-bold group-hover:text-blue">{next.name}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
