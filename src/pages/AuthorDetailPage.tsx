import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { ArticleFeed } from "../components/ArticleCard";
import { useSEO } from "../components/useSEO";
import { loadAuthors, articlesByAuthor, roleLabel, type Lang } from "../content";

export function AuthorDetailPage({ lang }: { lang: Lang }) {
  const { slug } = useParams();
  const author = slug ? loadAuthors().find((a) => a.slug === slug) : undefined;
  const articles = author ? articlesByAuthor(author.slug) : [];

  useSEO(
    author
      ? {
          title:
            lang === "es"
              ? `${author.display_name} — X-Ops Media`
              : `${author.display_name} — X-Ops Media`,
          description:
            lang === "es"
              ? author.bio_es.slice(0, 160)
              : author.bio_en.slice(0, 160),
          canonical: `https://xops.media/${lang}/author/${author.slug}`,
          alternateUrl: `https://xops.media/${lang === "es" ? "en" : "es"}/author/${author.slug}`,
          jsonLd: [],
        }
      : {
          title:
            lang === "es" ? "Autor no encontrado — X-Ops Media" : "Author not found — X-Ops Media",
          description:
            lang === "es"
              ? "El autor solicitado no existe en X-Ops Media."
              : "The requested author is not part of X-Ops Media.",
          canonical: `https://xops.media/${lang}/author/${slug ?? ""}`,
          alternateUrl: `https://xops.media/${lang === "es" ? "en" : "es"}/authors`,
          jsonLd: [],
        },
    lang,
  );

  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <Link to={`/${lang}/authors`} style={{ color: "var(--media-accent-light)", fontSize: "0.9rem" }}>
          &larr; {lang === "es" ? "Todos los autores" : "All authors"}
        </Link>

        {!author && (
          <section style={{ marginTop: "1.5rem" }}>
            <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
              {lang === "es" ? "Autor no encontrado" : "Author not found"}
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {lang === "es"
                ? "No tenemos un autor con ese identificador en X-Ops Media."
                : "We don't have an author with that slug in X-Ops Media."}
            </p>
          </section>
        )}

        {author && (
          <article style={{ marginTop: "1.25rem" }}>
            <header style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              {author.avatar && (
                <img
                  src={author.avatar}
                  alt={author.display_name}
                  loading="eager"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: "1.9rem", lineHeight: 1.2, marginBottom: "0.4rem" }}>
                  {author.display_name}
                </h1>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--media-accent-light)",
                    border: "1px solid var(--surface-0)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: 999,
                  }}
                >
                  {roleLabel(author.role, lang)}
                </span>
              </div>
            </header>

            <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, fontSize: "1.05rem" }}>
              {lang === "es" ? author.bio_es : author.bio_en}
            </p>

            {(author.links.github || author.links.linkedin || author.links.twitter || author.links.mastodon) && (
              <nav
                aria-label={lang === "es" ? "Enlaces del autor" : "Author links"}
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  fontSize: "0.9rem",
                }}
              >
                {author.links.github && (
                  <a href={author.links.github} target="_blank" rel="noopener noreferrer" style={{ color: "var(--media-accent-light)", textDecoration: "underline" }}>
                    GitHub
                  </a>
                )}
                {author.links.linkedin && (
                  <a href={author.links.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--media-accent-light)", textDecoration: "underline" }}>
                    LinkedIn
                  </a>
                )}
                {author.links.twitter && (
                  <a href={author.links.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "var(--media-accent-light)", textDecoration: "underline" }}>
                    Twitter
                  </a>
                )}
                {author.links.mastodon && (
                  <a href={author.links.mastodon} target="_blank" rel="noopener noreferrer" style={{ color: "var(--media-accent-light)", textDecoration: "underline" }}>
                    Mastodon
                  </a>
                )}
              </nav>
            )}

            <AdSlot variant="leaderboard" id={`author-${author.slug}-top`} />

            <section aria-labelledby="articles-heading" style={{ marginTop: "2rem" }}>
              <h2
                id="articles-heading"
                style={{ fontSize: "1.25rem", marginBottom: "1rem", borderTop: "1px solid var(--surface-0)", paddingTop: "1.5rem" }}
              >
                {lang === "es"
                  ? `Artículos de ${author.display_name}`
                  : `Articles by ${author.display_name}`}
              </h2>
              {articles.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>
                  {lang === "es"
                    ? "Este autor todavía no tiene artículos publicados."
                    : "This author has no published articles yet."}
                </p>
              ) : (
                <ArticleFeed articles={articles} lang={lang} />
              )}
            </section>
          </article>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
