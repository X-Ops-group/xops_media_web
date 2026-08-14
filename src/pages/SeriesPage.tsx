import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AdSlot } from "../components/AdSlot";
import { ArticleFeed } from "../components/ArticleCard";
import { useSEO } from "../components/useSEO";
import {
  articlesByFormat,
  FORMAT_LABELS,
  FORMATS,
  type ArticleFormat,
  type Lang,
} from "../content";

function isArticleFormat(s: string | undefined): s is ArticleFormat {
  return !!s && (FORMATS as readonly string[]).includes(s);
}

const FORMAT_DESCRIPTIONS: Record<ArticleFormat, { es: string; en: string }> = {
  news: {
    es: "Noticias operativas del día a día en DevSecOps y X-Ops.",
    en: "Day-to-day operational news in DevSecOps and X-Ops.",
  },
  exploit: {
    es: "Análisis de vulnerabilidades con explotación activa y plazos de remediación.",
    en: "Vulnerability analyses with active exploitation and remediation deadlines.",
  },
  explainer: {
    es: "Tutoriales en profundidad para entender un tema de un vistazo.",
    en: "In-depth tutorials to grasp a topic at a glance.",
  },
  analysis: {
    es: "Análisis y columnas de fondo con contexto editorial.",
    en: "Background analysis and editorial columns with context.",
  },
  "field-notes": {
    es: "Notas técnicas desde el terreno: qué funcionó y qué no en operaciones reales.",
    en: "Field notes: what worked and what didn't in real operations.",
  },
  "conference-recap": {
    es: "Recaps en directo y resúmenes de charlas de conferencias.",
    en: "Live recaps and conference-talk summaries.",
  },
};

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
        <h1 style={{ fontSize: "1.7rem", marginBottom: "0.5rem" }}>
          {label ?? (lang === "es" ? "Serie no encontrada" : "Series not found")}
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
