import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { useSEO } from "../components/useSEO";
import type { Lang } from "../content";

/**
 * One edition of The Week in X-Ops. The shape mirrors what Task 30's
 * `weekly-brief` workflow emits and `content-sync` (Task 32) drops at
 * `src/content/briefs.json`. We tolerate the file being absent because
 * the sync workflow may not have run on first deploy — the page renders
 * a bilingual placeholder rather than throwing.
 */
export interface WeeklyBrief {
  edition: string; // URL slug, e.g. "2026-08-10"
  number: number; // sequential edition number
  period_start: string; // ISO date
  period_end: string; // ISO date
  headline_es: string;
  headline_en: string;
  summary_es?: string;
  summary_en?: string;
  articles: Array<{
    slug: string;
    title_es: string;
    title_en: string;
  }>;
}

interface BriefsFile {
  briefs: WeeklyBrief[];
}

/**
 * Eager glob of the JSON the content-sync workflow writes. We treat the
 * absence of the file (no glob match) the same as an empty array — the
 * archive is rendered with a "Coming soon" placeholder so deploys don't
 * crash before the sync has run at least once. Exported so `BriefPage`
 * can resolve a single edition without duplicating the loader.
 */
export function loadBriefs(): WeeklyBrief[] | null {
  const modules = import.meta.glob<{ briefs?: WeeklyBrief[] } | WeeklyBrief[]>(
    "../content/briefs.json",
    { eager: true },
  );
  const entry = modules["../content/briefs.json"] as
    | BriefsFile
    | WeeklyBrief[]
    | undefined;
  if (!entry) return null;
  if (Array.isArray(entry)) return entry;
  return entry.briefs ?? [];
}

function formatPeriod(b: WeeklyBrief, lang: Lang): string {
  const start = new Date(b.period_start);
  const end = new Date(b.period_end);
  const locale = lang === "es" ? "es-ES" : "en-US";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const sameYear = start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString(locale, opts);
  const endStr = end.toLocaleDateString(locale, {
    ...opts,
    year: "numeric",
  });
  // Spanish locale includes the year on the first element when not the same year.
  return sameYear ? `${startStr} – ${endStr}` : `${startStr} – ${endStr}`;
}

export function BriefArchivePage({ lang }: { lang: Lang }) {
  const briefs = loadBriefs();
  const isEs = lang === "es";
  const segment = isEs ? "resumen-semanal" : "weekly-brief";

  // Newest first — `edition` is a date slug (e.g. "2026-08-10"), so a
  // descending string sort gives the right order even if the source JSON
  // arrives in arbitrary order.
  const sortedBriefs = briefs ? [...briefs].sort((a, b) => b.edition.localeCompare(a.edition)) : null;

  useSEO(
    {
      title: isEs
        ? "Resumen semanal — Archivo — X-Ops Media"
        : "The Week in X-Ops — Archive — X-Ops Media",
      description: isEs
        ? "Cada semana, las piezas seleccionadas por la redacción de X-Ops Media: análisis, vulnerabilidades activas y contexto editorial."
        : "Every week, the X-Ops Media editorial picks: analyses, actively exploited vulnerabilities, and editorial context.",
      canonical: `https://xops.media/${lang}/${segment}`,
      alternateUrl: `https://xops.media/${isEs ? "en" : "es"}/${isEs ? "weekly-brief" : "resumen-semanal"}`,
      jsonLd: [],
    },
    lang,
  );

  return (
    <>
      <Header lang={lang} />
      <a className="skip-link" href="#main">
        {isEs ? "Saltar al contenido" : "Skip to content"}
      </a>
      <main
        id="main"
        style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}
      >
        <AdSlot variant="leaderboard" id={`brief-archive-${lang}-top`} />

        <p
          style={{
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            fontSize: "0.85rem",
            marginBottom: "0.25rem",
          }}
        >
          {isEs ? "Resumen semanal" : "The Week in X-Ops"}
        </p>
        <h1 style={{ fontSize: "1.8rem", lineHeight: 1.2, marginBottom: "0.5rem" }}>
          {isEs ? "Archivo de ediciones" : "Edition archive"}
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "2rem",
            maxWidth: "60ch",
          }}
        >
          {isEs
            ? "Cada viernes publicamos una selección de lo más relevante de la semana en seguridad operativa, cadena de suministro e infraestructura."
            : "Every Friday we publish a curated selection of the week's most relevant operational security, supply chain, and infrastructure stories."}
        </p>

        {briefs === null && (
          <section
            aria-label={isEs ? "Archivo pendiente" : "Archive pending"}
            style={{
              border: "1px solid var(--surface-0)",
              borderRadius: 12,
              padding: "2rem",
              background: "var(--card-bg)",
            }}
          >
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                letterSpacing: "0.04em",
                marginBottom: "0.5rem",
              }}
            >
              {isEs ? "Próximamente" : "Coming soon"}
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              {isEs
                ? "El archivo se está poblando con las primeras ediciones del resumen semanal."
                : "The archive is being populated with the first weekly brief editions."}
            </p>
          </section>
        )}

        {briefs !== null && briefs.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>
            {isEs
              ? "Todavía no hay ediciones publicadas."
              : "No editions published yet."}
          </p>
        )}

        {sortedBriefs !== null && sortedBriefs.length > 0 && (
          <nav aria-label={isEs ? "Ediciones del resumen semanal" : "Weekly brief editions"}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {sortedBriefs.map((b) => {
                const headline = isEs ? b.headline_es : b.headline_en;
                return (
                  <li
                    key={b.edition}
                    style={{
                      border: "1px solid var(--surface-0)",
                      borderRadius: 12,
                      background: "var(--card-bg)",
                      padding: "1.25rem 1.4rem",
                    }}
                  >
                    <article>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.8rem",
                          letterSpacing: "0.04em",
                          marginBottom: "0.35rem",
                        }}
                      >
                        {isEs ? "Edición" : "Edition"} #{b.number} ·{" "}
                        {formatPeriod(b, lang)}
                      </p>
                      <h2
                        style={{
                          fontSize: "1.15rem",
                          lineHeight: 1.3,
                          margin: 0,
                          marginBottom: "0.5rem",
                        }}
                      >
                        <Link
                          to={`/${lang}/${segment}/${b.edition}`}
                          style={{
                            color: "var(--media-accent-light)",
                            textDecoration: "none",
                          }}
                        >
                          {headline}
                        </Link>
                      </h2>
                      {b.articles.length > 0 && (
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.9rem",
                            margin: 0,
                          }}
                        >
                          {isEs
                            ? `${b.articles.length} pieza${b.articles.length === 1 ? "" : "s"} seleccionada${b.articles.length === 1 ? "" : "s"}`
                            : `${b.articles.length} selected piece${b.articles.length === 1 ? "" : "s"}`}
                        </p>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
