import { Link } from "react-router-dom";
import type { Article, Lang } from "../content";
import { categoryById } from "../content";
import { AdSlot } from "./AdSlot";

export function ArticleCard({ a, lang }: { a: Article; lang: Lang }) {
  const title = lang === "es" ? a.title_es : a.title_en;
  const body = lang === "es" ? a.body_es : a.body_en;
  const cat = categoryById(a.niche_id);
  const excerpt = body.slice(0, 200).trim() + (body.length > 200 ? "…" : "");
  return (
    <Link
      to={`/${lang}/articulo/${a.slug}`}
      style={{
        display: "block",
        background: "var(--card-bg)",
        border: "1px solid var(--surface-0)",
        borderRadius: 12,
        padding: "1.4rem",
      }}
    >
      <div style={{ fontSize: "0.72rem", color: "var(--media-accent-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
        {cat ? (lang === "es" ? cat.labelEs : cat.labelEn) : a.niche_id}
      </div>
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", lineHeight: 1.3 }}>{title}</h2>
      <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.55, fontSize: "0.95rem" }}>{excerpt}</p>
      <div style={{ marginTop: "0.65rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        {new Date(a.published_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
      </div>
    </Link>
  );
}

/** Feed de tarjetas con anuncio nativo intercalado cada `adEvery` items — mismo patrón que elcorreo.ae. */
export function ArticleFeed({ articles, lang, adEvery = 3 }: { articles: Article[]; lang: Lang; adEvery?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      {articles.map((a, i) => (
        <div key={a.id}>
          <ArticleCard a={a} lang={lang} />
          {(i + 1) % adEvery === 0 && i !== articles.length - 1 && <AdSlot variant="native" id={`feed-${i}`} />}
        </div>
      ))}
    </div>
  );
}
