import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  loadConference,
  loadAuthors,
  articlesByAuthor,
  type Lang,
} from "../content";

const EXTERNAL = "noopener noreferrer";

/**
 * Sidebar editorial (Task 16 Step 6 / Task 38).
 *
 * Bloque vertical de descubrimiento, según el informe de auditoría del
 * 2026-08-13 (Hallazgo H5: "No existe sidebar ni descubrimiento"). Sigue el
 * orden de Hackplayers como referencia válida:
 *
 *   1. Banner de CFP si `call_for_papers_open === true`, con cuenta atrás
 *   2. Talks recientes de X-Ops Conference
 *   3. Autores activos (top 3 por nº de artículos)
 *
 * El informe advierte explícitamente: "sidebar demasiado largo en móvil"
 * — patrón a no copiar. Por eso en <900px este componente **no se apila al
 * final del artículo**: se omite por completo. Las piezas que ofrece
 * (talks recientes, autores activos) ya están cubiertas por
 * `RelatedArticles` y el footer en el flujo del artículo, y la portada no
 * tiene viewport angosto como problema. El consumidor decide dónde y si lo
 * renderiza (Home/Category no lo necesitan; ArticlePage sí en >=900px).
 *
 * Si el JSON de conference o authors está ausente, las secciones afectadas
 * no se renderizan — sin error, sin hueco.
 */
export function Sidebar({ lang }: { lang: Lang }) {
  const conf = loadConference();
  const authors = loadAuthors();

  // Top 3 autores por nº de artículos publicados (excluye autores sin piezas).
  const topAuthors = authors
    .map((a) => ({ author: a, count: articlesByAuthor(a.slug).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const headingStyle: CSSProperties = {
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: "0.65rem",
  };

  return (
    <aside
      aria-label={lang === "es" ? "Descubrimiento" : "Discovery"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {/* ── CFP banner (sólo si está abierto) ──────────────────────────── */}
      {conf?.next_edition.call_for_papers_open && (
        <section
          aria-label={lang === "es" ? "Call for Papers abierto" : "Call for Papers open"}
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--surface-0)",
            borderLeft: "3px solid var(--media-accent)",
            borderRadius: 8,
            padding: "0.9rem 1rem",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--media-accent-light)",
              marginBottom: "0.3rem",
            }}
          >
            {lang === "es" ? "CFP abierto" : "CFP open"}
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.3, marginBottom: "0.3rem" }}>
            {conf.event_name}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.6rem" }}>
            {lang === "es"
              ? `Cierre ${new Date(conf.next_edition.cfp_deadline).toLocaleDateString(
                  "es-ES",
                  { year: "numeric", month: "long", day: "numeric" },
                )}`
              : `Closes ${new Date(conf.next_edition.cfp_deadline).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" },
                )}`}
          </div>
          <a
            href={conf.next_edition.cfp_url || conf.links.cfp}
            target="_blank"
            rel={EXTERNAL}
            style={{
              display: "inline-block",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--media-accent-light)",
              textDecoration: "none",
            }}
          >
            {lang === "es" ? "Enviar propuesta →" : "Submit proposal →"}
          </a>
        </section>
      )}

      {/* ── Talks recientes ───────────────────────────────────────────── */}
      {conf && conf.recent_talks && conf.recent_talks.length > 0 && (
        <nav
          aria-label={
            lang === "es"
              ? "Charlas recientes de X-Ops Conference"
              : "Recent talks from X-Ops Conference"
          }
        >
          <div style={headingStyle}>
            {lang === "es" ? "Charlas recientes" : "Recent talks"}
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.65rem",
            }}
          >
            {conf.recent_talks.slice(0, 2).map((talk, i) => (
              <li key={`${talk.date}-${i}`}>
                <a
                  href={talk.video_url}
                  target="_blank"
                  rel={EXTERNAL}
                  style={{
                    display: "block",
                    fontSize: "0.88rem",
                    fontWeight: 500,
                    lineHeight: 1.35,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    borderLeft: "2px solid var(--surface-0)",
                    paddingLeft: "0.6rem",
                  }}
                >
                  {talk.title}
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "0.15rem",
                      fontWeight: 400,
                    }}
                  >
                    {talk.speaker}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* ── Autores activos ───────────────────────────────────────────── */}
      {topAuthors.length > 0 && (
        <nav
          aria-label={lang === "es" ? "Autores activos" : "Active authors"}
        >
          <div style={headingStyle}>
            {lang === "es" ? "Autores activos" : "Active authors"}
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
            }}
          >
            {topAuthors.map(({ author, count }) => (
              <li key={author.slug}>
                <Link
                  to={`/${lang}/author/${author.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>{author.display_name}</span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      background: "var(--surface-0)",
                      padding: "0.1rem 0.45rem",
                      borderRadius: 999,
                    }}
                  >
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  );
}