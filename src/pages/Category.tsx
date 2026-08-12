import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { ArticleFeed } from "../components/ArticleCard";
import { useSEO } from "../components/useSEO";
import { categoryMeta, homeMeta } from "../seo";
import { topicBySlug, articlesByTopic, type Lang } from "../content";

export function Category({ lang }: { lang: Lang }) {
  const { slug } = useParams();
  const topic = slug ? topicBySlug(lang, slug) : undefined;
  const articles = topic ? articlesByTopic(topic.id) : [];
  useSEO(topic ? categoryMeta(lang, topic) : homeMeta(lang), lang);

  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <AdSlot variant="leaderboard" id={`category-${slug}-top`} />
        <h1 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>
          {topic ? (lang === "es" ? topic.labelEs : topic.labelEn) : slug}
        </h1>
        {!topic && <p>{lang === "es" ? "Categoría no encontrada." : "Category not found."}</p>}
        {topic && articles.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>{lang === "es" ? "Todavía no hay artículos en esta categoría." : "No articles in this category yet."}</p>
        )}
        {topic && articles.length > 0 && <ArticleFeed articles={articles} lang={lang} />}
      </main>
      <Footer lang={lang} />
    </>
  );
}
