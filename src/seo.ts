import type { Article, Category, Lang } from "./content";
import { CATEGORIES } from "./content";

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

export function categoryMeta(lang: Lang, cat: Category): PageMeta {
  const label = lang === "es" ? cat.labelEs : cat.labelEn;
  const slug = lang === "es" ? cat.slugEs : cat.slugEn;
  const otherLang: Lang = lang === "es" ? "en" : "es";
  const otherCat = CATEGORIES.find((c) => c.lang === otherLang && c.id.startsWith(cat.id.split("-")[0]));
  const title = `${label} — ${lang === "es" ? "X-Ops Media" : "X-Ops Media"}`;
  const description =
    lang === "es"
      ? `Últimas noticias de ${label} — curadas, investigadas y aprobadas por un humano.`
      : `The latest ${label} news — curated, researched, and human-approved.`;
  return {
    title,
    description,
    canonical: `${SITE_URL}/${lang}/categoria/${slug}`,
    alternateUrl: otherCat ? `${SITE_URL}/${otherLang}/categoria/${otherLang === "es" ? otherCat.slugEs : otherCat.slugEn}` : `${SITE_URL}/${otherLang}`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: `${SITE_URL}/${lang}/categoria/${slug}`,
      },
    ],
  };
}

export function articleMeta(lang: Lang, article: Article, cat: Category | undefined): PageMeta {
  const title = lang === "es" ? article.title_es : article.title_en;
  const body = lang === "es" ? article.body_es : article.body_en;
  const description = body.slice(0, 155).trim() + "…";
  const url = `${SITE_URL}/${lang}/articulo/${article.slug}`;
  const otherLang: Lang = lang === "es" ? "en" : "es";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    datePublished: article.published_at,
    dateModified: article.published_at,
    inLanguage: lang,
    image: article.cover_asset_key ? [article.cover_asset_key] : undefined,
    articleSection: cat ? (lang === "es" ? cat.labelEs : cat.labelEn) : article.niche_id,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.jpeg` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "es" ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
      cat
        ? {
            "@type": "ListItem",
            position: 2,
            name: lang === "es" ? cat.labelEs : cat.labelEn,
            item: `${SITE_URL}/${lang}/categoria/${lang === "es" ? cat.slugEs : cat.slugEn}`,
          }
        : null,
      { "@type": "ListItem", position: cat ? 3 : 2, name: title, item: url },
    ].filter(Boolean),
  };

  return {
    title: `${title} — X-Ops Media`,
    description,
    canonical: url,
    alternateUrl: `${SITE_URL}/${otherLang}/articulo/${article.slug}`,
    jsonLd: [jsonLd, breadcrumb],
  };
}

export { SITE_URL, SITE_NAME };
