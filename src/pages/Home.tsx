import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { ArticleFeed } from "../components/ArticleCard";
import { Sidebar } from "../components/Sidebar";
import { ConferenceRail } from "../components/ConferenceRail";
import { useSEO } from "../components/useSEO";
import { homeMeta } from "../seo";
import {
  allArticles,
  coverUrlFor,
  ROUTE_SEGMENTS,
  topicByNicheId,
  type Lang,
} from "../content";

/**
 * Home portada (Task 39 — hero + sidebar integration).
 *
 * Capas en orden vertical, replicando el ritmo del patrón "broadsheet" que
 * pide el plan (Task 17) y la rejilla 2-col del CategoryPage ya en producción:
 *
 *   1. Header (skip-link ya viene del Header — Task 14)
 *   2. Leaderboard ad (mantiene la posición de Task 8; Task 17 lo bajará al
 *      terminar el lead, fuera de alcance aquí)
 *   3. Hero — el artículo más reciente, en grande. <h1> de página + título
 *      del lead como <h2>. Un solo <h1> por página (regla de a11y).
 *   4. ConferenceRail — tira horizontal con CFP + 3 talks (Task 38). Si la
 *      fuente está vacía, no renderiza.
 *   5. Rejilla 2-col: ArticleFeed (resto) + <aside Sidebar>. En <900px se
 *      apila (Sidebar debajo, igual que en CategoryPage).
 *   6. Footer.
 *
 * El Sidebar y el ConferenceRail son componentes ya entregados en Tasks 36-38;
 * aquí sólo se montan en la portada. Los strings visibles son bilingües (ES/EN).
 */
export function Home({ lang }: { lang: Lang }) {
  const articles = allArticles();
  useSEO(homeMeta(lang), lang);

  const lead = articles[0];
  const rest = articles.slice(1);
  const hasFeed = rest.length > 0;

  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <AdSlot variant="leaderboard" id="home-top" />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        {lead ? (
          <section
            aria-label={lang === "es" ? "Noticia destacada" : "Featured story"}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--surface-0)",
              borderRadius: 12,
              padding: "1.5rem",
              margin: "0 0 1.75rem",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--media-accent-light)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.6rem",
              }}
            >
              {lang === "es" ? "Lo último" : "Latest"}
            </div>
            <h1
              style={{
                margin: "0 0 0.65rem",
                fontSize: "clamp(1.6rem, 4.5vw, 2.1rem)",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              {lang === "es" ? "Las últimas noticias de DevSecOps y X-Ops" : "The latest in DevSecOps and X-Ops"}
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: "0 0 1.4rem",
                fontSize: "1rem",
                lineHeight: 1.55,
                maxWidth: "62ch",
              }}
            >
              {lang === "es"
                ? "Curado por Argos, redactado por Seshat, aprobado por un humano antes de publicarse."
                : "Curated by Argos, drafted by Seshat, human-approved before it ever publishes."}
            </p>
            <LeadCard article={lead} lang={lang} />
          </section>
        ) : (
          <h1
            style={{
              fontSize: "1.7rem",
              marginBottom: "0.25rem",
            }}
          >
            {lang === "es" ? "Las últimas noticias de DevSecOps y X-Ops" : "The latest in DevSecOps and X-Ops"}
          </h1>
        )}

        {/* ── ConferenceRail ───────────────────────────────────────────── */}
        <ConferenceRail lang={lang} />

        {/* ── Feed + sidebar ───────────────────────────────────────────── */}
        {!lead ? (
          <p style={{ color: "var(--text-muted)" }}>
            {lang === "es" ? "Todavía no hay artículos aprobados." : "No approved articles yet."}
          </p>
        ) : hasFeed ? (
          <div className="home-grid">
            <ArticleFeed articles={rest} lang={lang} />
            <Sidebar lang={lang} />
          </div>
        ) : null}
      </main>
      <Footer lang={lang} />
    </>
  );
}

/** Tarjeta del artículo destacado. Apila cover encima del texto en <560px para
 *  que la imagen nunca quede minúscula al lado del copy. */
function LeadCard({ article, lang }: { article: import("../content").Article; lang: Lang }) {
  const title = lang === "es" ? article.title_es : article.title_en;
  const body = lang === "es" ? article.body_es : article.body_en;
  const cat = topicByNicheId(article.niche_id);
  const cover = coverUrlFor(article);
  const excerpt = body.slice(0, 280).trim() + (body.length > 280 ? "…" : "");
  const catLabel = cat ? (lang === "es" ? cat.labelEs : cat.labelEn) : article.niche_id;

  return (
    <Link
      to={`/${lang}/${ROUTE_SEGMENTS[lang].article}/${article.slug}`}
      className="lead-card"
      style={{
        display: "grid",
        gridTemplateColumns: cover ? "minmax(0, 1.2fr) minmax(0, 1fr)" : "1fr",
        gap: "1.25rem",
        alignItems: "start",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {cover && (
        <img
          src={cover}
          alt={title}
          loading="lazy"
          className="lead-card-media"
          style={{
            width: "100%",
            height: "auto",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: 8,
            display: "block",
          }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--media-accent-light)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.5rem",
          }}
        >
          {catLabel}
        </div>
        <h2
          style={{
            margin: "0 0 0.55rem",
            fontSize: "clamp(1.2rem, 2.6vw, 1.5rem)",
            lineHeight: 1.25,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            margin: "0 0 0.75rem",
            lineHeight: 1.55,
            fontSize: "0.98rem",
          }}
        >
          {excerpt}
        </p>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {new Date(article.published_at).toLocaleDateString(
            lang === "es" ? "es-ES" : "en-US",
            { year: "numeric", month: "long", day: "numeric" },
          )}
        </div>
      </div>
    </Link>
  );
}
