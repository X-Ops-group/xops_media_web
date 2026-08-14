import type { Article, Topic, Lang, Author, Page } from "./content";
import { ROUTE_SEGMENTS, coverUrlFor } from "./content";

const SITE_URL = "https://xops.media";
const SITE_NAME = "X-Ops Media";

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  /** Same page in the other language (hreflang x-default-like behavior). */
  alternateUrl: string;
  /** Optional Open Graph image URL (absolute, public CDN — never a token URL). */
  ogImage?: string;
  /** JSON-LD structured-data objects to inject as <script type="application/ld+json">. */
  jsonLd: object[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Strip HTML tags / collapse whitespace for meta-description previews. */
export function plainExcerpt(s: string, max = 160): string {
  return String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .replace(/[&<>"']/g, (c) =>
      c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
    );
}

/** HTML-escape (defense-in-depth: meta description shouldn't echo raw user content). */
export function escapeAttr(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

/**
 * Append the " — X-Ops Media" brand suffix to a page title ONLY if it fits
 * inside the SERP-friendly 60-char budget. Past 60 chars, Google truncates
 * the title in the result snippet and the brand gets dropped on the floor —
 * better to drop the brand and keep the title whole (T43 review F3).
 *
 * Example: brandTitle("CVE-2026-63077: Critical TeamCity RCE") → "… — X-Ops Media"
 * because the bare title (45 chars) leaves 15 for the suffix; the long form
 * "CVE-2026-20316 in Cisco Secure Firewall Management Center" alone is 56
 * chars, which leaves only 12 — fits — so the suffix stays.
 */
export function brandTitle(title: string): string {
  const SUFFIX = ` — ${SITE_NAME}`;
  if (title.length + SUFFIX.length <= 60) return `${title}${SUFFIX}`;
  return title;
}

// ── JSON-LD builders ───────────────────────────────────────────────────────

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

function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["en", "es"],
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/logo.jpeg` },
  };
}

function breadcrumbJsonLd(_lang: Lang, trail: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: t.item,
    })),
  };
}

function newsArticleJsonLd(
  lang: Lang,
  article: Article,
  topic: Topic | undefined,
  author: Author | undefined,
) {
  const otherLang = lang === "es" ? "en" : "es";
  const title = lang === "es" ? article.title_es : article.title_en;
  const description = plainExcerpt(lang === "es" ? article.body_es : article.body_en, 200);
  const cover = coverUrlFor(article);
  const authorObj = author
    ? { "@type": "Person", name: author.display_name, url: `${SITE_URL}/${otherLang}/author/${author.slug}` }
    : { "@type": "Organization", name: SITE_NAME, url: SITE_URL };
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    datePublished: article.published_at,
    dateModified: article.updated_at ?? article.published_at,
    inLanguage: lang,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].article}/${article.slug}`,
    },
    url: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].article}/${article.slug}`,
    image: cover ? [cover] : [`${SITE_URL}/logo.jpeg`],
    articleSection: topic ? (lang === "es" ? topic.labelEs : topic.labelEn) : undefined,
    keywords: article.tags?.map((t) => t.label).join(", ") || undefined,
    author: authorObj,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.jpeg` },
    },
  };
}

function personJsonLd(lang: Lang, author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.display_name,
    url: `${SITE_URL}/${lang}/author/${author.slug}`,
    sameAs: Object.values(author.links).filter(Boolean) as string[],
    description: plainExcerpt(lang === "es" ? author.bio_es : author.bio_en, 300),
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    knowsAbout: author.credentials,
    image: author.avatar ? `${SITE_URL}${author.avatar}` : undefined,
  };
}

function collectionPageJsonLd(lang: Lang, topic: Topic) {
  const slug = lang === "es" ? topic.slugEs : topic.slugEn;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: lang === "es" ? topic.labelEs : topic.labelEn,
    url: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}`,
    inLanguage: lang,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}

// ── Meta helpers ───────────────────────────────────────────────────────────

export function homeMeta(lang: Lang): PageMeta {
  const isEs = lang === "es";
  return {
    title: isEs
      ? brandTitle("Noticias de DevSecOps, X-Ops y AI Infra")
      : brandTitle("DevSecOps, X-Ops and AI Infra News"),
    description: isEs
      ? "Noticias curadas de DevSecOps, seguridad de contenedores, plataformas y AI infra — investigadas, redactadas y aprobadas por un humano antes de publicarse."
      : "Curated DevSecOps, container security, platform engineering and AI infra news — researched, drafted, and human-approved before it ever publishes.",
    canonical: `${SITE_URL}/${lang}`,
    alternateUrl: `${SITE_URL}/${lang === "es" ? "en" : "es"}`,
    ogImage: `${SITE_URL}/logo.jpeg`,
    jsonLd: [orgJsonLd(), webSiteJsonLd()],
  };
}

export function categoryMeta(lang: Lang, topic: Topic): PageMeta {
  const isEs = lang === "es";
  const slug = isEs ? topic.slugEs : topic.slugEn;
  const otherLang = isEs ? "en" : "es";
  const otherSlug = isEs ? topic.slugEn : topic.slugEs;
  const label = isEs ? topic.labelEs : topic.labelEn;
  const url = `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}`;
  return {
    title: brandTitle(label),
    description: isEs ? `Últimas noticias de ${label}.` : `The latest ${label} news.`,
    canonical: url,
    alternateUrl: `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].category}/${otherSlug}`,
    ogImage: `${SITE_URL}/logo.jpeg`,
    jsonLd: [
      collectionPageJsonLd(lang, topic),
      breadcrumbJsonLd(lang, [
        { name: isEs ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
        { name: label, item: url },
      ]),
    ],
  };
}

export function articleMeta(lang: Lang, article: Article, topic?: Topic, author?: Author): PageMeta {
  const isEs = lang === "es";
  const otherLang = isEs ? "en" : "es";
  const title = isEs ? article.title_es : article.title_en;
  const body = isEs ? article.body_es : article.body_en;
  const description = plainExcerpt(body, 200);
  const url = `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].article}/${article.slug}`;
  const cover = coverUrlFor(article);

  return {
    title: brandTitle(title),
    description,
    canonical: url,
    alternateUrl: `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].article}/${article.slug}`,
    ogImage: cover ?? `${SITE_URL}/logo.jpeg`,
    jsonLd: [
      newsArticleJsonLd(lang, article, topic, author),
      breadcrumbJsonLd(lang, [
        { name: isEs ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
        ...(topic
          ? [
              {
                name: isEs ? topic.labelEs : topic.labelEn,
                item: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${isEs ? topic.slugEs : topic.slugEn}`,
              },
            ]
          : []),
        { name: title, item: url },
      ]),
    ],
  };
}

export function authorMeta(lang: Lang, author: Author): PageMeta {
  const isEs = lang === "es";
  const otherLang = isEs ? "en" : "es";
  const url = `${SITE_URL}/${lang}/author/${author.slug}`;
  const description = plainExcerpt(isEs ? author.bio_es : author.bio_en, 200);
  return {
    title: brandTitle(author.display_name),
    description,
    canonical: url,
    alternateUrl: `${SITE_URL}/${otherLang}/author/${author.slug}`,
    ogImage: author.avatar ? `${SITE_URL}${author.avatar}` : `${SITE_URL}/logo.jpeg`,
    jsonLd: [
      personJsonLd(lang, author),
      breadcrumbJsonLd(lang, [
        { name: isEs ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
        { name: isEs ? "Autores" : "Authors", item: `${SITE_URL}/${lang}/authors` },
        { name: author.display_name, item: url },
      ]),
    ],
  };
}

export function authorsIndexMeta(lang: Lang): PageMeta {
  const isEs = lang === "es";
  return {
    title: brandTitle(isEs ? "Autores" : "Authors"),
    description: isEs
      ? "El equipo editorial de X-Ops Media: redactores y editores que firman y revisan cada artículo."
      : "The X-Ops Media editorial team: the writers and editors who file and review every article.",
    canonical: `${SITE_URL}/${lang}/authors`,
    alternateUrl: `${SITE_URL}/${lang === "es" ? "en" : "es"}/authors`,
    ogImage: `${SITE_URL}/logo.jpeg`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: isEs ? "Autores" : "Authors",
        url: `${SITE_URL}/${lang}/authors`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      },
      breadcrumbJsonLd(lang, [
        { name: isEs ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
        { name: isEs ? "Autores" : "Authors", item: `${SITE_URL}/${lang}/authors` },
      ]),
    ],
  };
}

export function seriesMeta(lang: Lang, format: { id: string; label: string; description: string }): PageMeta {
  const isEs = lang === "es";
  const otherLang = isEs ? "en" : "es";
  const url = `${SITE_URL}/${lang}/series/${format.id}`;
  return {
    title: brandTitle(format.label),
    description: format.description,
    canonical: url,
    alternateUrl: `${SITE_URL}/${otherLang}/series/${format.id}`,
    ogImage: `${SITE_URL}/logo.jpeg`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: format.label,
        url,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      },
      breadcrumbJsonLd(lang, [
        { name: isEs ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
        { name: format.label, item: url },
      ]),
    ],
  };
}

/** Generic page meta for content pages (About, Methodology, Ethics, Contact). */
export function staticPageMeta(lang: Lang, page: Page): PageMeta {
  const isEs = lang === "es";
  const otherLang = isEs ? "en" : "es";
  const segMap: Record<Page["slug"], { en: string; es: string }> = {
    about: { en: "about", es: "quienes-somos" },
    methodology: { en: "methodology", es: "metodologia" },
    ethics: { en: "ethics", es: "etica" },
    contact: { en: "contact", es: "contacto" },
  };
  const seg = isEs ? segMap[page.slug].es : segMap[page.slug].en;
  const title = isEs ? page.title_es : page.title_en;
  const description = isEs ? page.meta_description_es : page.meta_description_en;
  const url = `${SITE_URL}/${lang}/${seg}`;
  return {
    title: brandTitle(title),
    description,
    canonical: url,
    alternateUrl: `${SITE_URL}/${otherLang}/${isEs ? segMap[page.slug].en : segMap[page.slug].es}`,
    ogImage: `${SITE_URL}/logo.jpeg`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        url,
        description,
        inLanguage: lang,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      },
      breadcrumbJsonLd(lang, [
        { name: isEs ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
        { name: title, item: url },
      ]),
    ],
  };
}

export { SITE_URL, SITE_NAME };