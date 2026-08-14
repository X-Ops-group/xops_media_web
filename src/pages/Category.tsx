import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { ArticleFeed } from "../components/ArticleCard";
import { useSEO } from "../components/useSEO";
import { categoryMeta, homeMeta } from "../seo";
import {
  topicBySlug,
  articlesByTopic,
  articlesByEditorialTopic,
  loadAuthors,
  TOPICS,
  type Lang,
} from "../content";

/**
 * Union of (legacy niche mapping for this category) and (any article whose
 * editorial `topics[]` includes this category's primary editorial topic).
 *
 * Why the union: the legacy route /en/category/devsecops historically filtered
 * by niche_id, but switching the locale to /es/categoria/devsecops then
 * matched articles in `devsecops-es` ONLY — so the same category page
 * mysteriously showed 0 posts in one language and 5 in the other (bug noted
 * in the content.ts comment block above `LEGACY_CATEGORIES`). `articlesByTopic`
 * already fixes that for the niche mapping; we additionally union in any
 * article tagged with the new editorial `topics[]` so that, e.g., an article
 * born under niche `xopsyou-en` but tagged `topic_id=security` still surfaces
 * on the DevSecOps category page.
 *
 * When a topic-pill filter is active, we narrow this union to articles that
 * ALSO carry that editorial topic in their `topics[]`.
 */
function articlesForCategory(
  legacyTopicId: string,
  editorialTopicFilter: string | null,
): ReturnType<typeof articlesByTopic> {
  const legacy = articlesByTopic(legacyTopicId);
  if (!editorialTopicFilter) return legacy;
  const editorial = articlesByEditorialTopic(editorialTopicFilter);
  const ids = new Set(editorial.map((a) => a.id));
  return legacy.filter((a) => ids.has(a.id));
}

const ROLE_LABEL: Record<"writer" | "editor" | "both", { es: string; en: string }> = {
  writer: { es: "Redactor", en: "Writer" },
  editor: { es: "Editor", en: "Editor" },
  both: { es: "Redactor y editor", en: "Writer & editor" },
};

export function Category({ lang }: { lang: Lang }) {
  const { slug } = useParams();
  const topic = slug ? topicBySlug(lang, slug) : undefined;
  useSEO(topic ? categoryMeta(lang, topic) : homeMeta(lang), lang);

  // null = "All" pill (no editorial-topic filter active).
  const [activeEditorialTopic, setActiveEditorialTopic] = useState<string | null>(null);

  // Articles for the (category ∩ optional editorial-topic-filter).
  const articles = useMemo(() => {
    if (!topic) return [];
    return articlesForCategory(topic.id, activeEditorialTopic);
  }, [topic, activeEditorialTopic]);

  // Authors with articles in the currently-displayed set, sorted by count desc.
  const authorSidebar = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      if (!a.author_slug) continue;
      counts.set(a.author_slug, (counts.get(a.author_slug) ?? 0) + 1);
    }
    if (counts.size === 0) return [];
    const all = loadAuthors();
    return all
      .filter((au) => counts.has(au.slug))
      .map((au) => ({ author: au, count: counts.get(au.slug) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.author.display_name.localeCompare(b.author.display_name));
  }, [articles]);

  return (
    <>
      <Header lang={lang} />
      <main className="category-page" style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <AdSlot variant="leaderboard" id={`category-${slug}-top`} />

        <header style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "1.6rem", margin: "0 0 0.5rem" }}>
            {topic ? (lang === "es" ? topic.labelEs : topic.labelEn) : slug}
          </h1>
          {!topic && (
            <p style={{ color: "var(--text-muted)" }}>
              {lang === "es" ? "Categoría no encontrada." : "Category not found."}
            </p>
          )}
        </header>

        {topic && (
          <>
            {/* Topics strip — horizontal pills of editorial topics. Keyboard-
                focusable <button> elements inside an aria-labelled <nav>. */}
            <nav
              aria-label={lang === "es" ? "Filtrar por tema editorial" : "Filter by editorial topic"}
              className="topic-strip"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                margin: "0 0 1.5rem",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveEditorialTopic(null)}
                aria-pressed={activeEditorialTopic === null}
                className={`topic-pill${activeEditorialTopic === null ? " topic-pill-active" : ""}`}
                style={pillStyle(activeEditorialTopic === null)}
              >
                {lang === "es" ? "Todos" : "All"}
              </button>
              {TOPICS.map((t) => {
                const active = activeEditorialTopic === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveEditorialTopic(t.id)}
                    aria-pressed={active}
                    className={`topic-pill${active ? " topic-pill-active" : ""}`}
                    style={pillStyle(active)}
                  >
                    {t.label[lang]}
                  </button>
                );
              })}
            </nav>

            <div className="category-grid">
              <section style={{ minWidth: 0 }}>
                {articles.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>
                    {activeEditorialTopic
                      ? (lang === "es"
                          ? "No hay artículos en esta categoría con ese tema."
                          : "No articles in this category with that topic.")
                      : (lang === "es"
                          ? "Todavía no hay artículos en esta categoría."
                          : "No articles in this category yet.")}
                  </p>
                ) : (
                  <ArticleFeed articles={articles} lang={lang} />
                )}
              </section>

              <aside
                aria-label={lang === "es" ? "Autores en esta categoría" : "Authors in this category"}
                className="category-sidebar"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--surface-0)",
                  borderRadius: 12,
                  padding: "1.25rem",
                  alignSelf: "start",
                  position: "sticky",
                  top: "1rem",
                }}
              >
                <h2 style={{ fontSize: "0.95rem", margin: "0 0 0.85rem", color: "var(--text-primary)" }}>
                  {lang === "es" ? "Autores" : "Authors"}
                </h2>
                {authorSidebar.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                    {lang === "es" ? "Sin autores todavía." : "No authors yet."}
                  </p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    {authorSidebar.map(({ author, count }) => (
                      <li key={author.slug}>
                        <Link
                          to={`/${lang}/${lang === "es" ? "autor" : "author"}/${author.slug}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "0.5rem",
                            color: "var(--text-primary)",
                            padding: "0.4rem 0.55rem",
                            borderRadius: 8,
                            background: "var(--surface-0)",
                          }}
                        >
                          <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                            <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>{author.display_name}</span>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                marginTop: "0.1rem",
                              }}
                            >
                              {ROLE_LABEL[author.role][lang]}
                            </span>
                          </span>
                          <span
                            aria-label={
                              lang === "es"
                                ? `${count} artículo${count === 1 ? "" : "s"}`
                                : `${count} article${count === 1 ? "" : "s"}`
                            }
                            style={{
                              background: "var(--media-accent)",
                              color: "var(--text-primary)",
                              borderRadius: 999,
                              padding: "0.15rem 0.55rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}

/**
 * Pill style. Active = `--media-accent` background, light text. Inactive =
 * `--surface-1` background, muted text. Both share padding/border-radius so
 * the strip reads as a single visual row.
 */
function pillStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? "var(--media-accent)" : "var(--surface-1)",
    color: active ? "var(--text-primary)" : "var(--text-secondary)",
    border: active ? "1px solid var(--media-accent)" : "1px solid var(--surface-0)",
    borderRadius: 999,
    padding: "0.4rem 0.95rem",
    fontSize: "0.85rem",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    lineHeight: 1.2,
    transition: "background 120ms ease, color 120ms ease",
  };
}