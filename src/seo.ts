import type { Article, Topic, Lang } from "./content";
import { ROUTE_SEGMENTS, coverUrlFor } from "./content";

const SITE_URL = "https://xops.media";
const SITE_NAME = "X-Ops Media";

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  alternateUrl: string; // la misma página en el otro idioma
  jsonLd: object[];
}

function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpeg`,
    sameAs: [] as string[],
  };
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/en?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function homeMeta(lang: Lang): PageMeta {
  const title =
    lang === "es"
      ? "X-Ops Media — Noticias de DevSecOps, X-Ops y AI Infra"
      : "X-Ops Media — DevSecOps, X-Ops and AI Infra News";
  const description =
    lang === "es"
      ? "Noticias curadas de DevSecOps, seguridad de contenedores, plataformas y AI infra — investigadas, redactadas y aprobadas por un humano antes de publicarse."
      : "Curated DevSecOps, container security, platform engineering and AI infra news — researched, drafted, and human-approved before it ever publishes.";
  return {
    title,
    description,
    canonical: `${SITE_URL}/${lang}`,
    alternateUrl: `${SITE_URL}/${lang === "es" ? "en" : "es"}`,
    jsonLd: [orgJsonLd(), websiteJsonLd()],
  };
}

export function categoryMeta(lang: Lang, topic: Topic): PageMeta {
  const label = lang === "es" ? topic.labelEs : topic.labelEn;
  const slug = lang === "es" ? topic.slugEs : topic.slugEn;
  const otherLang: Lang = lang === "es" ? "en" : "es";
  const title = `${label} — X-Ops Media`;
  const description =
    lang === "es"
      ? `Últimas noticias de ${label} — curadas, investigadas y aprobadas por un humano.`
      : `The latest ${label} news — curated, researched, and human-approved.`;
  return {
    title,
    description,
    canonical: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}`,
    alternateUrl: `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].category}/${otherLang === "es" ? topic.slugEs : topic.slugEn}`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}`,
      },
    ],
  };
}

export function articleMeta(lang: Lang, article: Article, topic: Topic | undefined): PageMeta {
  const title = lang === "es" ? article.title_es : article.title_en;
  const body = lang === "es" ? article.body_es : article.body_en;
  const description = body.slice(0, 155).trim() + "…";
  const url = `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].article}/${article.slug}`;
  const otherLang: Lang = lang === "es" ? "en" : "es";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    datePublished: article.published_at,
    dateModified: article.published_at,
    inLanguage: lang,
    image: coverUrlFor(article) ? [`${SITE_URL}${coverUrlFor(article)}`] : undefined,
    articleSection: topic ? (lang === "es" ? topic.labelEs : topic.labelEn) : article.niche_id,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.jpeg` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "es" ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
      topic
        ? {
            "@type": "ListItem",
            position: 2,
            name: lang === "es" ? topic.labelEs : topic.labelEn,
            item: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${lang === "es" ? topic.slugEs : topic.slugEn}`,
          }
        : null,
      { "@type": "ListItem", position: topic ? 3 : 2, name: title, item: url },
    ].filter(Boolean),
  };

  return {
    title: `${title} — X-Ops Media`,
    description,
    canonical: url,
    alternateUrl: `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].article}/${article.slug}`,
    jsonLd: [jsonLd, breadcrumb],
  };
}

export { SITE_URL, SITE_NAME };
