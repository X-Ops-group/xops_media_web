import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { useSEO } from "../components/useSEO";
import { articleMeta, homeMeta } from "../seo";
import { findArticleBySlug, topicByNicheId, coverUrlFor, type Lang } from "../content";

export function ArticlePage({ lang }: { lang: Lang }) {
  const { slug } = useParams();
  const article = slug ? findArticleBySlug(slug) : undefined;
  const cat = article ? topicByNicheId(article.niche_id) : undefined;
  const cover = article ? coverUrlFor(article) : null;
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
            {cover && (
              <img
                src={cover}
                alt={lang === "es" ? article.title_es : article.title_en}
                loading="eager"
                style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 12, marginBottom: "1.25rem" }}
              />
            )}
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
              {paragraphs.map((p, i) => {
                // Markdown-style headings (# / ##) must not be rendered inside <p>.
                // Detect leading markdown heading marker and emit an <h2> instead
                // so screen readers and crawlers see a real heading instead of
                // the literal "## Section Title" string as visible body text.
                const h2 = /^##\s+(.+?)\s*$/m.exec(p);
                if (h2) {
                  return (
                    <div key={i}>
                      <h2
                        style={{
                          fontFamily: "Georgia, serif",
                          fontSize: "1.35rem",
                          margin: "2rem 0 0.85rem",
                          color: "#F4F7FB",
                          fontWeight: 700,
                          lineHeight: 1.3,
                        }}
                      >
                        {h2[1]}
                      </h2>
                      {i + 1 === midpoint && paragraphs.length > 1 && (
                        <AdSlot variant="in-article" id={`article-${article.slug}-mid`} />
                      )}
                    </div>
                  );
                }
                return (
                  <div key={i}>
                    <p style={{ marginBottom: "1.2rem" }}>{p}</p>
                    {i + 1 === midpoint && paragraphs.length > 1 && (
                      <AdSlot variant="in-article" id={`article-${article.slug}-mid`} />
                    )}
                  </div>
                );
              })}
            </div>
            {article.source_urls && article.source_urls.length > 0 && (
              <section
                aria-labelledby="sources-heading"
                style={{
                  marginTop: "2rem",
                  paddingTop: "1.25rem",
                  borderTop: "1px solid rgba(184,197,214,0.3)",
                  color: "#B8C5D6",
                  fontFamily: "-apple-system, sans-serif",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                <h2
                  id="sources-heading"
                  style={{
                    margin: "0 0 0.75rem",
                    color: "#F4F7FB",
                    fontFamily: "Georgia, serif",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}
                >
                  {lang === "es" ? "Fuentes" : "Sources"}
                </h2>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", listStyle: "disc" }}>
                  {article.source_urls.map((s, i) => (
                    <li key={i} style={{ marginBottom: "0.35rem" }}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#30B0F0", textDecoration: "underline", wordBreak: "break-word" }}
                      >
                        {s.name || s.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
