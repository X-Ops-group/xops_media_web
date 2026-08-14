import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { ArticleFeed } from "../components/ArticleCard";
import { useSEO } from "../components/useSEO";
import {
  articlesByFormat,
  FORMAT_LABELS,
  FORMAT_DESCRIPTIONS,
  FORMAT_COLORS,
  FORMATS,
  type ArticleFormat,
  type Lang,
} from "../content";

function isArticleFormat(s: string | undefined): s is ArticleFormat {
  return !!s && (FORMATS as readonly string[]).includes(s);
}

export function SeriesPage({ lang }: { lang: Lang }) {
  const { format } = useParams();
  const validFormat = isArticleFormat(format) ? format : undefined;
  const articles = validFormat ? articlesByFormat(validFormat) : [];
  const label = validFormat ? FORMAT_LABELS[validFormat][lang] : format;

  useSEO(
    validFormat
      ? {
          title: lang === "es" ? `${label} — X-Ops Media` : `${label} — X-Ops Media`,
          description: FORMAT_DESCRIPTIONS[validFormat][lang],
          canonical: `https://xops.media/${lang}/series/${validFormat}`,
          alternateUrl: `https://xops.media/${lang === "es" ? "en" : "es"}/series/${validFormat}`,
          jsonLd: [],
        }
      : {
          title: lang === "es" ? "Serie no encontrada — X-Ops Media" : "Series not found — X-Ops Media",
          description:
            lang === "es"
              ? "La serie solicitada no existe en X-Ops Media."
              : "The requested series doesn't exist in X-Ops Media.",
          canonical: `https://xops.media/${lang}/series/${format ?? ""}`,
          alternateUrl: `https://xops.media/${lang === "es" ? "en" : "es"}`,
          jsonLd: [],
        },
    lang,
  );

  return (
    <>
      <Header lang={lang} />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}>
        <AdSlot variant="leaderboard" id={`series-${format}-top`} />
        <h1
          style={{
            fontSize: "1.7rem",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            flexWrap: "wrap",
          }}
        >
          {label ?? (lang === "es" ? "Serie no encontrada" : "Series not found")}
          {validFormat && (
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                borderRadius: 4,
                background: FORMAT_COLORS[validFormat],
                boxShadow: "0 0 0 2px rgba(0,0,0,0.05)",
              }}
            />
          )}
        </h1>
        {!validFormat && (
          <p style={{ color: "var(--text-secondary)" }}>
            {lang === "es"
              ? "La serie solicitada no existe en X-Ops Media."
              : "The requested series doesn't exist in X-Ops Media."}
          </p>
        )}
        {validFormat && (
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.75rem" }}>
            {FORMAT_DESCRIPTIONS[validFormat][lang]}
          </p>
        )}

        {validFormat && articles.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>
            {lang === "es"
              ? "Todavía no hay artículos en esta serie."
              : "No articles in this series yet."}
          </p>
        )}
        {validFormat && articles.length > 0 && <ArticleFeed articles={articles} lang={lang} />}
      </main>
      <Footer lang={lang} />
    </>
  );
}
