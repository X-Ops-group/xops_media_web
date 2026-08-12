import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { ArticleFeed } from "../components/ArticleCard";
import { useSEO } from "../components/useSEO";
import { homeMeta } from "../seo";
import { allArticles, type Lang } from "../content";

export function Home({ lang }: { lang: Lang }) {
  const articles = allArticles();
  useSEO(homeMeta(lang), lang);
  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <AdSlot variant="leaderboard" id="home-top" />
        <h1 style={{ fontSize: "1.7rem", marginBottom: "0.25rem" }}>
          {lang === "es" ? "Las últimas noticias de DevSecOps y X-Ops" : "The latest in DevSecOps and X-Ops"}
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.75rem" }}>
          {lang === "es"
            ? "Curado por Argos, redactado por Seshat, aprobado por un humano — antes de publicarse."
            : "Curated by Argos, drafted by Seshat, human-approved — before it ever publishes."}
        </p>
        {articles.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>{lang === "es" ? "Todavía no hay artículos aprobados." : "No approved articles yet."}</p>
        ) : (
          <ArticleFeed articles={articles} lang={lang} />
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
