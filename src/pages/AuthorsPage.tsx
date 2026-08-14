import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { useSEO } from "../components/useSEO";
import { loadAuthors, roleLabel, type Lang, type Author } from "../content";

function authorBio(author: Author, lang: Lang): string {
  const full = lang === "es" ? author.bio_es : author.bio_en;
  return full.slice(0, 200).trim() + (full.length > 200 ? "…" : "");
}

export function AuthorsPage({ lang }: { lang: Lang }) {
  const authors = [...loadAuthors()].sort((a, b) =>
    a.display_name.localeCompare(b.display_name, lang === "es" ? "es" : "en"),
  );

  useSEO(
    {
      title:
        lang === "es"
          ? "Autores — X-Ops Media"
          : "Authors — X-Ops Media",
      description:
        lang === "es"
          ? "El equipo editorial de X-Ops Media: redactores y editores que firman y revisan cada artículo."
          : "The X-Ops Media editorial team: the writers and editors who file and review every article.",
      canonical: `https://xops.media/${lang}/authors`,
      alternateUrl: `https://xops.media/${lang === "es" ? "en" : "es"}/authors`,
      jsonLd: [],
    },
    lang,
  );

  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <AdSlot variant="leaderboard" id="authors-top" />
        <h1 style={{ fontSize: "1.7rem", marginBottom: "0.5rem" }}>
          {lang === "es" ? "Autores" : "Authors"}
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.75rem" }}>
          {lang === "es"
            ? "El equipo editorial que firma y revisa los artículos de X-Ops Media."
            : "The editorial team that files and reviews every X-Ops Media article."}
        </p>

        <nav aria-label={lang === "es" ? "Listado de autores" : "Author list"}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {authors.map((a) => {
              const bio = authorBio(a, lang);
              return (
                <li
                  key={a.slug}
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--surface-0)",
                    borderRadius: 12,
                    padding: "1.4rem",
                    display: "flex",
                    gap: "1.25rem",
                  }}
                >
                  {a.avatar && (
                    <img
                      src={a.avatar}
                      alt={a.display_name}
                      loading="lazy"
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                        <Link
                          to={`/${lang}/author/${a.slug}`}
                          style={{ color: "var(--text-primary)", textDecoration: "none" }}
                        >
                          {a.display_name}
                        </Link>
                      </h2>
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
                        {roleLabel(a.role, lang)}
                      </span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", margin: "0.5rem 0 0", lineHeight: 1.55, fontSize: "0.95rem" }}>
                      {bio}
                    </p>
                    {a.links.github && (
                      <div style={{ marginTop: "0.6rem", fontSize: "0.85rem" }}>
                        <a
                          href={a.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--media-accent-light)", textDecoration: "underline" }}
                        >
                          GitHub
                        </a>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </main>
      <Footer lang={lang} />
    </>
  );
}
