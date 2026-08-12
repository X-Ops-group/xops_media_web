import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { ArticleFeed } from "../components/ArticleCard";
import { CATEGORIES, articlesByCategory, type Lang } from "../content";

export function Category({ lang }: { lang: Lang }) {
  const { slug } = useParams();
  const cat = CATEGORIES.find((c) => c.lang === lang && (lang === "es" ? c.slugEs : c.slugEn) === slug);
  const articles = cat ? articlesByCategory(cat.id) : [];

  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <AdSlot variant="leaderboard" id={`category-${slug}-top`} />
        <h1 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>
          {cat ? (lang === "es" ? cat.labelEs : cat.labelEn) : slug}
        </h1>
        {!cat && <p>{lang === "es" ? "Categoría no encontrada." : "Category not found."}</p>}
        {cat && articles.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>{lang === "es" ? "Todavía no hay artículos en esta categoría." : "No articles in this category yet."}</p>
        )}
        {cat && articles.length > 0 && <ArticleFeed articles={articles} lang={lang} />}
      </main>
      <Footer lang={lang} />
    </>
  );
}
