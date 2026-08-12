import { Routes, Route, Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchArticles, NICHE_LABELS, type Article } from "./api";
import "./theme.css";

type Lang = "es" | "en";

function Header({ lang }: { lang: Lang }) {
  return (
    <header style={{ borderBottom: "1px solid var(--surface-0)", padding: "1.25rem 1.5rem" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to={lang === "es" ? "/es" : "/"} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src="/logo.jpeg" alt="X-Ops Media" style={{ height: 36, borderRadius: 6 }} />
          <span style={{ fontWeight: 700, letterSpacing: "-0.01em", fontSize: "1.15rem" }}>X-Ops Media</span>
        </Link>
        <nav style={{ display: "flex", gap: "1rem", fontSize: "0.9rem" }}>
          <Link to="/" style={{ color: lang === "en" ? "var(--media-accent-light)" : "var(--text-secondary)" }}>EN</Link>
          <Link to="/es" style={{ color: lang === "es" ? "var(--media-accent-light)" : "var(--text-secondary)" }}>ES</Link>
        </nav>
      </div>
    </header>
  );
}

function ArticleCard({ a, lang }: { a: Article; lang: Lang }) {
  const title = lang === "es" ? a.title_es : a.title_en;
  const body = lang === "es" ? a.body_es : a.body_en;
  const niche = NICHE_LABELS[a.niche_id]?.[lang] ?? a.niche_id;
  const excerpt = body.slice(0, 220).trim() + (body.length > 220 ? "…" : "");
  return (
    <Link
      to={`/${lang === "es" ? "es/" : ""}articulo/${a.slug}`}
      style={{
        display: "block",
        background: "var(--card-bg)",
        border: "1px solid var(--surface-0)",
        borderRadius: 12,
        padding: "1.5rem",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ fontSize: "0.75rem", color: "var(--media-accent-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
        {niche}
      </div>
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.3rem", lineHeight: 1.3 }}>{title}</h2>
      <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{excerpt}</p>
      <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        {new Date(a.published_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
      </div>
    </Link>
  );
}

function Home({ lang }: { lang: Lang }) {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles().then(setArticles).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>
          {lang === "es" ? "Las últimas noticias de DevSecOps y X-Ops" : "The latest in DevSecOps and X-Ops"}
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          {lang === "es"
            ? "Curado por Argos, redactado por Seshat, aprobado por un humano — antes de publicarse."
            : "Curated by Argos, drafted by Seshat, human-approved — before it ever publishes."}
        </p>
        {error && <p style={{ color: "#ff6b80" }}>Error: {error}</p>}
        {!articles && !error && <p style={{ color: "var(--text-muted)" }}>{lang === "es" ? "Cargando…" : "Loading…"}</p>}
        {articles && articles.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>{lang === "es" ? "Todavía no hay artículos aprobados." : "No approved articles yet."}</p>
        )}
        {articles?.map((a) => <ArticleCard key={a.id} a={a} lang={lang} />)}
      </main>
    </>
  );
}

function ArticlePage({ lang }: { lang: Lang }) {
  const { slug } = useParams();
  const [articles, setArticles] = useState<Article[] | null>(null);

  useEffect(() => {
    fetchArticles().then(setArticles).catch(() => setArticles([]));
  }, []);

  const article = articles?.find((a) => a.slug === slug);

  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <Link to={lang === "es" ? "/es" : "/"} style={{ color: "var(--media-accent-light)", fontSize: "0.9rem" }}>
          &larr; {lang === "es" ? "Volver" : "Back"}
        </Link>
        {!articles && <p style={{ color: "var(--text-muted)", marginTop: "1.5rem" }}>{lang === "es" ? "Cargando…" : "Loading…"}</p>}
        {articles && !article && <p style={{ marginTop: "1.5rem" }}>{lang === "es" ? "Artículo no encontrado." : "Article not found."}</p>}
        {article && (
          <article style={{ marginTop: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--media-accent-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              {NICHE_LABELS[article.niche_id]?.[lang] ?? article.niche_id}
            </div>
            <h1 style={{ fontSize: "2rem", lineHeight: 1.25, marginBottom: "0.5rem" }}>
              {lang === "es" ? article.title_es : article.title_en}
            </h1>
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
              {new Date(article.published_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", lineHeight: 1.75, color: "var(--text-primary)" }}>
              {(lang === "es" ? article.body_es : article.body_en).split("\n\n").map((p, i) => (
                <p key={i} style={{ marginBottom: "1.25rem" }}>{p}</p>
              ))}
            </div>
          </article>
        )}
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home lang="en" />} />
      <Route path="/articulo/:slug" element={<ArticlePage lang="en" />} />
      <Route path="/es" element={<Home lang="es" />} />
      <Route path="/es/articulo/:slug" element={<ArticlePage lang="es" />} />
    </Routes>
  );
}
