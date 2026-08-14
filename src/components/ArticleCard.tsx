import { Link } from "react-router-dom";
import type { Article, Lang } from "../content";
import { topicByNicheId, ROUTE_SEGMENTS, coverUrlFor } from "../content";
import { AdSlot } from "./AdSlot";

export function ArticleCard({ a, lang }: { a: Article; lang: Lang }) {
  const title = lang === "es" ? a.title_es : a.title_en;
  const body = lang === "es" ? a.body_es : a.body_en;
  const cat = topicByNicheId(a.niche_id);
  const cover = coverUrlFor(a);
  const excerpt = body.slice(0, 200).trim() + (body.length > 200 ? "…" : "");
  return (
    <Link
      to={`/${lang}/${ROUTE_SEGMENTS[lang].article}/${a.slug}`}
      className="article-card"
      style={{
        display: "flex",
        gap: "1rem",
        background: "var(--card-bg)",
        border: "1px solid var(--surface-0)",
        borderRadius: 12,
        padding: "1.4rem",
      }}
    >
      {cover && (
        <img
          src={cover}
          alt={title}
          loading="lazy"
          className="article-card-media"
          style={{ objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.72rem", color: "var(--media-accent-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          {cat ? (lang === "es" ? cat.labelEs : cat.labelEn) : a.niche_id}
        </div>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", lineHeight: 1.3 }}>{title}</h2>
        <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.55, fontSize: "0.95rem" }}>{excerpt}</p>
        <div style={{ marginTop: "0.65rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {new Date(a.published_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    </Link>
  );
}

/** Feed de tarjetas con anuncio nativo intercalado cada `adEvery` items — mismo patrón que elcorreo.ae. */
export function ArticleFeed({ articles, lang, adEvery = 3 }: { articles: Article[]; lang: Lang; adEvery?: number }) {
  // Por debajo de adEvery artículos no insertamos ningún slot: un anuncio
  // solitario sobre un feed corto roba más atención de la que compensa.
  const showAds = articles.length >= adEvery;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      {articles.map((a, i) => (
        <div key={a.id}>
          <ArticleCard a={a} lang={lang} />
          {showAds && (i + 1) % adEvery === 0 && i !== articles.length - 1 && <AdSlot variant="native" id={`feed-${i}`} />}
        </div>
      ))}
    </div>
  );
}
