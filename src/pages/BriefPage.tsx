import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { useSEO } from "../components/useSEO";
import { ROUTE_SEGMENTS, type Lang } from "../content";
import { loadBriefs, type WeeklyBrief } from "./BriefArchivePage";

function formatPeriod(b: WeeklyBrief, lang: Lang): string {
  const start = new Date(b.period_start);
  const end = new Date(b.period_end);
  const locale = lang === "es" ? "es-ES" : "en-US";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString(locale, opts);
  const endStr = end.toLocaleDateString(locale, {
    ...opts,
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export function BriefPage({ lang }: { lang: Lang }) {
  const { edition } = useParams();
  const briefs = loadBriefs();
  const brief = briefs?.find((b) => b.edition === edition);
  const isEs = lang === "es";
  const segment = isEs ? "resumen-semanal" : "weekly-brief";
  const articleSegment = ROUTE_SEGMENTS[lang].article;

  // Sorted editions (newest first) used to compute Prev/Next siblings of the
  // current brief — visible Next/Previous links let readers move through the
  // archive without bouncing back to the index.
  const sortedEditions = briefs
    ? [...briefs].sort((a, b) => b.edition.localeCompare(a.edition))
    : null;
  const currentIndex = sortedEditions
    ? sortedEditions.findIndex((b) => b.edition === edition)
    : -1;
  const prevEdition =
    sortedEditions && currentIndex >= 0 && currentIndex + 1 < sortedEditions.length
      ? sortedEditions[currentIndex + 1]
      : null;
  const nextEdition =
    sortedEditions && currentIndex > 0 ? sortedEditions[currentIndex - 1] : null;

  useSEO(
    brief
      ? {
          title: isEs
            ? `${brief.headline_es} — Resumen semanal — X-Ops Media`
            : `${brief.headline_en} — The Week in X-Ops — X-Ops Media`,
          description: isEs
            ? (brief.summary_es ?? brief.headline_es)
            : (brief.summary_en ?? brief.headline_en),
          canonical: `https://xops.media/${lang}/${segment}/${brief.edition}`,
          alternateUrl: `https://xops.media/${isEs ? "en" : "es"}/${isEs ? "weekly-brief" : "resumen-semanal"}/${brief.edition}`,
          jsonLd: [],
        }
      : {
          title: isEs
            ? "Edición no encontrada — X-Ops Media"
            : "Edition not found — X-Ops Media",
          description: isEs
            ? "La edición solicitada del resumen semanal no existe."
            : "The requested weekly brief edition doesn't exist.",
          canonical: `https://xops.media/${lang}/${segment}/${edition ?? ""}`,
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
        <AdSlot variant="leaderboard" id={`brief-${edition ?? "missing"}-${lang}-top`} />

        <nav
          aria-label={isEs ? "Ruta de navegación" : "Breadcrumb"}
          style={{
            fontSize: "0.85rem",
            letterSpacing: "0.04em",
            color: "var(--text-muted)",
            marginBottom: "1rem",
          }}
        >
          <Link
            to={`/${lang}/${segment}`}
            style={{ color: "var(--media-accent-light)", textDecoration: "none" }}
          >
            {"← "}
            {isEs ? "Volver al archivo" : "Back to archive"}
          </Link>
        </nav>

        {briefs === null && (
          <section
            aria-label={isEs ? "Edición pendiente" : "Edition pending"}
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
                ? "El archivo de ediciones se está poblando con las primeras entregas."
                : "The edition archive is being populated with the first deliveries."}
            </p>
          </section>
        )}

        {briefs !== null && !brief && (
          <article>
            <h1 style={{ fontSize: "1.8rem", lineHeight: 1.2, marginBottom: "0.5rem" }}>
              {isEs ? "Edición no encontrada" : "Edition not found"}
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              {isEs
                ? "La edición solicitada del resumen semanal no existe o todavía no se ha publicado."
                : "The requested weekly brief edition doesn't exist or hasn't been published yet."}
            </p>
            <Link
              to={`/${lang}/${segment}`}
              style={{
                display: "inline-block",
                padding: "0.6rem 1rem",
                borderRadius: 6,
                background: "var(--media-accent)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              {isEs ? "Volver al archivo" : "Back to the archive"}
            </Link>
          </article>
        )}

        {brief && (
          <article>
            <header style={{ marginBottom: "1.75rem" }}>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.04em",
                  marginBottom: "0.35rem",
                }}
              >
                {isEs ? "Edición" : "Edition"} #{brief.number} · {formatPeriod(brief, lang)}
              </p>
              <h1
                style={{
                  fontSize: "1.8rem",
                  lineHeight: 1.2,
                  margin: 0,
                  marginBottom: "0.75rem",
                }}
              >
                {isEs ? brief.headline_es : brief.headline_en}
              </h1>
              {(brief.summary_es || brief.summary_en) && (
                <section aria-labelledby="editor-summary">
                  <h2
                    id="editor-summary"
                    style={{
                      fontSize: "1.15rem",
                      marginBottom: "0.5rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {isEs ? "Resumen editorial" : "Editor's summary"}
                  </h2>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "1rem",
                      margin: 0,
                      maxWidth: "60ch",
                    }}
                  >
                    {isEs ? brief.summary_es : brief.summary_en}
                  </p>
                </section>
              )}
            </header>

            {brief.articles.length > 0 && (
              <section aria-label={isEs ? "Artículos de esta edición" : "Articles in this edition"}>
                <h2
                  style={{
                    fontSize: "1.15rem",
                    marginBottom: "0.75rem",
                    borderTop: "1px solid var(--surface-0)",
                    paddingTop: "1.25rem",
                  }}
                >
                  {isEs ? "Lo que cubrimos esta semana" : "What we covered this week"}
                </h2>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {brief.articles.map((a) => (
                    <li
                      key={a.slug}
                      style={{
                        borderLeft: "3px solid var(--media-accent)",
                        paddingLeft: "0.85rem",
                      }}
                    >
                      <Link
                        to={`/${lang}/${articleSegment}/${a.slug}`}
                        style={{
                          color: "var(--media-accent-light)",
                          textDecoration: "none",
                          fontSize: "1rem",
                          fontWeight: 500,
                        }}
                      >
                        {isEs ? a.title_es : a.title_en}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Prev/Next navigation — readers expect a linear editorial flow
                without bouncing back to the archive. Wrapped in a single <nav>
                with an aria-label so assistive tech announces the relationship. */}
            <nav
              aria-label={isEs ? "Otras ediciones" : "Other editions"}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "space-between",
                marginTop: "2.5rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--surface-0)",
                fontSize: "0.92rem",
              }}
            >
              <div style={{ flex: "1 1 12rem" }}>
                {prevEdition && (
                  <Link
                    to={`/${lang}/${segment}/${prevEdition.edition}`}
                    style={{
                      color: "var(--media-accent-light)",
                      textDecoration: "none",
                    }}
                  >
                    {"← "}
                    {isEs ? "Edición anterior" : "Previous edition"}
                    <span
                      style={{
                        display: "block",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      {formatPeriod(prevEdition, lang)}
                    </span>
                  </Link>
                )}
              </div>
              <div style={{ flex: "1 1 12rem", textAlign: "right" }}>
                {nextEdition && (
                  <Link
                    to={`/${lang}/${segment}/${nextEdition.edition}`}
                    style={{
                      color: "var(--media-accent-light)",
                      textDecoration: "none",
                    }}
                  >
                    {isEs ? "Edición siguiente" : "Next edition"}
                    {" →"}
                    <span
                      style={{
                        display: "block",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      {formatPeriod(nextEdition, lang)}
                    </span>
                  </Link>
                )}
              </div>
            </nav>
          </article>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
