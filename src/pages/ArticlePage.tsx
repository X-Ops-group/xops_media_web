import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { useSEO } from "../components/useSEO";
import { articleMeta, homeMeta } from "../seo";
import { findArticleBySlug, categoryById, type Lang } from "../content";

export function ArticlePage({ lang }: { lang: Lang }) {
  const { slug } = useParams();
  const article = slug ? findArticleBySlug(slug) : undefined;
  const cat = article ? categoryById(article.niche_id) : undefined;
  const paragraphs = article ? (lang === "es" ? article.body_es : article.body_en).split("\n\n") : [];
  const midpoint = Math.ceil(paragraphs.length / 2);
  useSEO(article ? articleMeta(lang, article, cat) : homeMeta(lang), lang);

  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <Link to={`/${lang}`} style={{ color: "var(--media-accent-light)", fontSize: "0.9rem" }}>
          &larr; {lang === "es" ? "Volver" : "Back"}
        </Link>

        {!article && <p style={{ marginTop: "1.5rem" }}>{lang === "es" ? "Artículo no encontrado." : "Article not found."}</p>}

        {article && (
          <article style={{ marginTop: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--media-accent-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              {cat ? (lang === "es" ? cat.labelEs : cat.labelEn) : article.niche_id}
            </div>
            <h1 style={{ fontSize: "1.9rem", lineHeight: 1.25, marginBottom: "0.5rem" }}>
              {lang === "es" ? article.title_es : article.title_en}
            </h1>
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              {new Date(article.published_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>

            <AdSlot variant="leaderboard" id={`article-${article.slug}-top`} />

            <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.08rem", lineHeight: 1.75 }}>
              {paragraphs.map((p, i) => (
                <div key={i}>
                  <p style={{ marginBottom: "1.2rem" }}>{p}</p>
                  {i + 1 === midpoint && paragraphs.length > 1 && (
                    <AdSlot variant="in-article" id={`article-${article.slug}-mid`} />
                  )}
                </div>
              ))}
            </div>
          </article>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
