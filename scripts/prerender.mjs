#!/usr/bin/env node
// Pre-renderiza cada ruta a HTML estático real (contenido en el response inicial,
// no solo tras ejecutar JS) — clave para crawlers de IA que no ejecutan JS
// (GPTBot, CCBot y varios más lo confirman públicamente). El bundle de React
// sigue cargando después y toma control normal de la página (interactividad
// intacta); esto solo asegura que el <body> inicial ya tenga el contenido real.
//
// Corre como parte de `npm run build`, después de generate-seo-files.mjs y
// generate-rss.mjs, así que se regenera automáticamente con cada sync.
//
// COVERAGE — walks all 32 routes (16 EN + 16 ES):
//   - Home / Article / Category / Authors / Author detail / Series
//   - Static pages (about / methodology / ethics / contact)
//   - Brief archive / Brief edition / Exploit Watch / Tag / Archive / Conference
//   - 404 (en + es)
//
// SECURITY
// --------
// - This script writes *static* HTML to disk by interpolating content
//   fields into a fixed template. It does NOT eval Node with user input
//   and does NOT load env secrets — see Hard Constraints in Task 43 brief.
// - `esc()` HTML-escapes every interpolated value, including the body
//   excerpt used for description / bodyHtml. JSON-LD objects are passed
//   through `JSON.stringify`, which is safe because the values are already
//   our own (titles, slugs, dates), not user-generated markup.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";

const SITE_URL = "https://xops.media";
const DIST_DIR = new URL("../dist/", import.meta.url).pathname;
const CONTENT_DIR = new URL("../src/content/", import.meta.url).pathname;

const ROUTE_SEGMENTS = {
  en: {
    category: "category",
    article: "article",
    authors: "authors",
    author: "author",
    about: "about",
    methodology: "methodology",
    ethics: "ethics",
    contact: "contact",
    weeklyBrief: "weekly-brief",
    exploitWatch: "exploit-watch",
    series: "series",
    tags: "tags",
    archive: "archive",
    conference: "conference",
  },
  es: {
    category: "categoria",
    article: "articulo",
    authors: "autores",
    author: "autor",
    about: "quienes-somos",
    methodology: "metodologia",
    ethics: "etica",
    contact: "contacto",
    weeklyBrief: "resumen-semanal",
    exploitWatch: "exploits-activos",
    series: "serie",
    tags: "etiqueta",
    archive: "archivo",
    conference: "conferencia",
  },
};

const TOPICS = [
  { id: "devsecops", nicheIds: ["devsecops-en", "devsecops-es"], slugEs: "devsecops", slugEn: "devsecops", labelEs: "DevSecOps", labelEn: "DevSecOps" },
  { id: "x-ops", nicheIds: ["xopsyou-en", "xopsyou-es"], slugEs: "x-ops", slugEn: "x-ops", labelEs: "X-Ops", labelEn: "X-Ops" },
];

const STATIC_PAGES = [
  { slug: "about", titleEn: "About us", titleEs: "Quiénes somos",
    descEn: "X-Ops Media is the editorial line of X-Ops Group. Meet the team, our editorial line, and how we produce every piece of content.",
    descEs: "X-Ops Media es la línea editorial de X-Ops Group. Conoce al equipo, la línea editorial y cómo se produce el contenido." },
  { slug: "methodology", titleEn: "Methodology", titleEs: "Metodología",
    descEn: "How we research: minimum number of sources, cross-verification, editorial review, and publication criteria at X-Ops Media.",
    descEs: "Cómo investigamos: número mínimo de fuentes, verificación cruzada, revisión editorial y criterios de publicación en X-Ops Media." },
  { slug: "ethics", titleEn: "Ethics", titleEs: "Ética",
    descEn: "How X-Ops Media separates editorial from consulting, anonymizes field notes, and discloses conflicts of interest.",
    descEs: "Cómo X-Ops Media separa la línea editorial de la consultoría, anonimiza las notas de campo y declara conflictos de interés." },
  { slug: "contact", titleEn: "Contact", titleEs: "Contacto",
    descEn: "How to send a tip, a vulnerability, or a correction to the X-Ops Media editorial team.",
    descEs: "Cómo enviar una noticia, una vulnerabilidad o una corrección al equipo editorial de X-Ops Media." },
  { slug: "weekly-brief", titleEn: "Weekly brief archive", titleEs: "Archivo del resumen semanal",
    descEn: "Weekly briefings from the X-Ops Media editorial team: what to patch, what to read, what to ignore.",
    descEs: "Resúmenes semanales del equipo editorial de X-Ops Media: qué parchear, qué leer, qué ignorar." },
  { slug: "exploit-watch", titleEn: "Exploit Watch", titleEs: "Exploits activos",
    descEn: "Actively exploited vulnerabilities reported on by X-Ops Media.",
    descEs: "Vulnerabilidades explotadas activamente cubiertas por X-Ops Media." },
  { slug: "archive", titleEn: "Archive", titleEs: "Archivo",
    descEn: "The complete archive of X-Ops Media articles, sorted by date.",
    descEs: "El archivo completo de artículos de X-Ops Media, ordenado por fecha." },
  { slug: "conference", titleEn: "X-Ops Conference", titleEs: "X-Ops Conference",
    descEn: "X-Ops Conference is our annual security conference. Schedule, talks, and CFP.",
    descEs: "X-Ops Conference es nuestra conferencia anual de seguridad. Agenda, charlas y CFP." },
];

function loadArticles(nicheId) {
  try {
    return JSON.parse(readFileSync(join(CONTENT_DIR, nicheId, "articles.json"), "utf-8")).articles ?? [];
  } catch {
    return [];
  }
}

function topicForNiche(nicheId) {
  return TOPICS.find((t) => t.nicheIds.includes(nicheId));
}

const nicheDirs = readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const allArticles = nicheDirs
  .flatMap((n) => loadArticles(n).map((a) => ({ ...a, topic: topicForNiche(n) })))
  .sort((a, b) => b.published_at.localeCompare(a.published_at));

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const TEMPLATE = readFileSync(join(DIST_DIR, "index.html"), "utf-8");

function writePage(routePath, { title, description, canonical, alternate, lang, jsonLd, bodyHtml, ogImage }) {
  let html = TEMPLATE;
  html = html.replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    "</head>",
    `  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="alternate" hreflang="${lang === "es" ? "en" : "es"}" href="${esc(alternate)}" />
  <link rel="alternate" hreflang="${lang}" href="${esc(canonical)}" />
  <link rel="alternate" hreflang="x-default" href="${esc(`${SITE_URL}/en`)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:site_name" content="X-Ops Media" />
  <meta property="og:locale" content="${lang === "es" ? "es_ES" : "en_US"}" />
  <meta property="og:type" content="${jsonLd.some((o) => o["@type"] === "NewsArticle") ? "article" : "website"}" />
  ${ogImage ? `<meta property="og:image" content="${esc(ogImage)}" />\n  <meta name="twitter:image" content="${esc(ogImage)}" />\n  ` : ""}<meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
${jsonLd.map((obj) => `  <script type="application/ld+json">${JSON.stringify(obj)}</script>`).join("\n")}
</head>`
  );
  html = html.replace('<html lang="en">', `<html lang="${lang}">`);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);

  const outPath = join(DIST_DIR, routePath, "index.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
}

function topicLabel(topic, lang) {
  if (!topic) return "";
  return lang === "es" ? topic.labelEs : topic.labelEn;
}

function articleSnippet(a, lang) {
  const title = lang === "es" ? a.title_es : a.title_en;
  const body = lang === "es" ? a.body_es : a.body_en;
  return `<article>
    <div>${esc(topicLabel(a.topic, lang))}</div>
    <h1>${esc(title)}</h1>
    <time datetime="${esc(a.published_at)}">${esc(a.published_at.slice(0, 10))}</time>
    ${body
      .split("\n\n")
      .map((p) => `<p>${esc(p)}</p>`)
      .join("\n    ")}
  </article>`;
}

/**
 * Build a 140-160 char meta description for an article. Preferred path uses
 * the editor-controlled `meta_description_{es,en}` field (committed, not
 * derived on the fly). Fallback path: strip any leading `# H1` markdown
 * heading line, then take the first sentence of the first non-empty body
 * paragraph, capped at 155 chars on a sentence boundary.
 *
 * NEVER returns the H1 in the output — both paths strip or skip it.
 */
function articleDescription(a, lang) {
  const editorial = lang === "es" ? a.meta_description_es : a.meta_description_en;
  if (editorial && editorial.trim()) {
    return capAtSentence(editorial.replace(/\s+/g, " ").trim(), 155);
  }
  const body = lang === "es" ? a.body_es : a.body_en;
  // Some articles (notably cve-2026-20316-cisco-secure-fmc) inline the H1 as
  // a standalone `# Title…` paragraph at the very start of the body — that
  // used to leak verbatim into the snippet (T43 review F1). Skip it.
  const candidateParagraph =
    body
      .split("\n\n")
      .map((p) => p.replace(/^\s*#\s+[^\n]+\n?/, "").trim())
      .find((p) => p.length > 0) ?? "";
  const firstSentenceOfParagraph = (candidateParagraph.match(/^[\s\S]*?[.!?](?=\s|$)/) ?? [""])[0].trim();
  return capAtSentence(firstSentenceOfParagraph, 155);
}

/** Cap a string at the last sentence boundary no later than `maxChars`.
 *  If no sentence terminator exists within the window, hard-trim with an
 *  ellipsis so we never return a mid-word cut. */
function capAtSentence(s, maxChars) {
  if (s.length <= maxChars) return s;
  const slice = s.slice(0, maxChars);
  const matches = [...slice.matchAll(/[.!?](?=\s|$)/g)];
  if (matches.length === 0) return slice.replace(/\s+\S*$/, "") + "…";
  const lastEnd = matches[matches.length - 1].index + 1;
  return slice.slice(0, lastEnd).trim();
}

function feedSnippet(articles, lang) {
  const seg = ROUTE_SEGMENTS[lang].article;
  return `<ul>
    ${articles
      .map((a) => {
        const title = lang === "es" ? a.title_es : a.title_en;
        const body = lang === "es" ? a.body_es : a.body_en;
        return `<li><a href="/${lang}/${seg}/${esc(a.slug)}"><h2>${esc(title)}</h2><p>${esc(body.slice(0, 200))}…</p></a></li>`;
      })
      .join("\n    ")}
  </ul>`;
}

function staticPageSnippet({ title, description }, lang) {
  return `<article>
    <h1>${esc(title)}</h1>
    <p>${esc(description)}</p>
    <p>${lang === "es"
      ? "El contenido completo de esta página se renderiza al cargar JavaScript. Esta vista previa es para indexación por buscadores y crawlers."
      : "The full content of this page is rendered when JavaScript loads. This preview is for indexing by search engines and crawlers."}</p>
  </article>`;
}

function breadcrumbJsonLd(lang, trail) {
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

const writtenRoutes = [];

// --- Home (en/es) ---
for (const lang of ["en", "es"]) {
  const title = lang === "es" ? "X-Ops Media — Noticias de DevSecOps, X-Ops y AI Infra" : "X-Ops Media — DevSecOps, X-Ops and AI Infra News";
  const description =
    lang === "es"
      ? "Noticias curadas de DevSecOps, seguridad de contenedores, plataformas y AI infra — investigadas, redactadas y aprobadas por un humano antes de publicarse."
      : "Curated DevSecOps, container security, platform engineering and AI infra news — researched, drafted, and human-approved before it ever publishes.";
  writePage(lang, {
    title,
    description,
    canonical: `${SITE_URL}/${lang}`,
    alternate: `${SITE_URL}/${lang === "es" ? "en" : "es"}`,
    lang,
    ogImage: `${SITE_URL}/logo.jpeg`,
    jsonLd: [
      { "@context": "https://schema.org", "@type": "Organization", name: "X-Ops Media", url: SITE_URL, logo: `${SITE_URL}/logo.jpeg` },
      { "@context": "https://schema.org", "@type": "WebSite", name: "X-Ops Media", url: SITE_URL, inLanguage: ["en", "es"] },
    ],
    bodyHtml: `<h1>${esc(title)}</h1><p>${esc(description)}</p>${feedSnippet(allArticles, lang)}`,
  });
  writtenRoutes.push(`${lang}/`);
}

// --- Category pages (por tema, no por nicho — un artículo devsecops-en también
// aparece en /es/categoria/devsecops porque tiene body_es) ---
for (const topic of TOPICS) {
  for (const lang of ["en", "es"]) {
    const slug = lang === "es" ? topic.slugEs : topic.slugEn;
    const items = allArticles.filter((a) => a.topic?.id === topic.id);
    const label = topicLabel(topic, lang);
    const otherLang = lang === "es" ? "en" : "es";
    const otherSlug = lang === "es" ? topic.slugEn : topic.slugEs;
    const canonical = `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}`;
    const alternate = `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].category}/${otherSlug}`;
    writePage(`${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}`, {
      title: `${label} — X-Ops Media`,
      description: lang === "es" ? `Últimas noticias de ${label}.` : `The latest ${label} news.`,
      canonical,
      alternate,
      lang,
      ogImage: `${SITE_URL}/logo.jpeg`,
      jsonLd: [
        { "@context": "https://schema.org", "@type": "CollectionPage", name: label, url: canonical },
        breadcrumbJsonLd(lang, [
          { name: lang === "es" ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
          { name: label, item: canonical },
        ]),
      ],
      bodyHtml: `<h1>${esc(label)}</h1>${feedSnippet(items, lang)}`,
    });
    writtenRoutes.push(`${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}`);
  }
}

// --- Static pages (about / methodology / ethics / contact / etc.) ---
// Map kebab-case page slugs (e.g. "weekly-brief") to the camelCase keys in
// ROUTE_SEGMENTS (e.g. "weeklyBrief"). The kebab-case slugs match the URL
// segments; the camelCase keys are the in-JS view. Confirmed by reviewer.
const slugToSegKey = {
  "weekly-brief": "weeklyBrief",
  "exploit-watch": "exploitWatch",
};
for (const page of STATIC_PAGES) {
  for (const lang of ["en", "es"]) {
    const segKey = slugToSegKey[page.slug] ?? page.slug;
    const seg = ROUTE_SEGMENTS[lang][segKey];
    const title = lang === "es" ? page.titleEs : page.titleEn;
    const description = lang === "es" ? page.descEs : page.descEn;
    const otherLang = lang === "es" ? "en" : "es";
    const canonical = `${SITE_URL}/${lang}/${seg}`;
    const alternate = `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang][segKey]}`;
    writePage(`${lang}/${seg}`, {
      title: `${title} — X-Ops Media`,
      description,
      canonical,
      alternate,
      lang,
      ogImage: `${SITE_URL}/logo.jpeg`,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          url: canonical,
          description,
          inLanguage: lang,
          isPartOf: { "@type": "WebSite", name: "X-Ops Media", url: SITE_URL },
        },
        breadcrumbJsonLd(lang, [
          { name: lang === "es" ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
          { name: title, item: canonical },
        ]),
      ],
      bodyHtml: staticPageSnippet({ title, description }, lang),
    });
    writtenRoutes.push(`${lang}/${seg}`);
  }
}

// --- Authors index page ---
for (const lang of ["en", "es"]) {
  const seg = ROUTE_SEGMENTS[lang].authors;
  const title = lang === "es" ? "Autores — X-Ops Media" : "Authors — X-Ops Media";
  const description = lang === "es"
    ? "El equipo editorial de X-Ops Media: redactores y editores que firman y revisan cada artículo."
    : "The X-Ops Media editorial team: the writers and editors who file and review every article.";
  const otherLang = lang === "es" ? "en" : "es";
  const canonical = `${SITE_URL}/${lang}/${seg}`;
  const alternate = `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].authors}`;
  writePage(`${lang}/${seg}`, {
    title,
    description,
    canonical,
    alternate,
    lang,
    ogImage: `${SITE_URL}/logo.jpeg`,
    jsonLd: [
      { "@context": "https://schema.org", "@type": "CollectionPage", name: title, url: canonical },
      breadcrumbJsonLd(lang, [
        { name: lang === "es" ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
        { name: lang === "es" ? "Autores" : "Authors", item: canonical },
      ]),
    ],
    bodyHtml: `<h1>${esc(title)}</h1><p>${esc(description)}</p>`,
  });
  writtenRoutes.push(`${lang}/${seg}`);
}

// --- Series pages (per format) ---
const FORMATS = [
  { id: "news", en: "News", es: "Noticia" },
  { id: "exploit", en: "Exploit", es: "Exploit" },
  { id: "explainer", en: "Explainer", es: "Explainer" },
  { id: "analysis", en: "Analysis", es: "Análisis" },
  { id: "field-notes", en: "Field Notes", es: "Field Notes" },
  { id: "conference-recap", en: "Conference Recap", es: "Crónica" },
];
for (const fmt of FORMATS) {
  for (const lang of ["en", "es"]) {
    const seg = ROUTE_SEGMENTS[lang].series;
    const label = lang === "es" ? fmt.es : fmt.en;
    const items = allArticles.filter((a) => (a.format ?? "news") === fmt.id);
    const title = `${label} — X-Ops Media`;
    const description = lang === "es"
      ? `Artículos de la serie ${label} en X-Ops Media.`
      : `${label} articles in X-Ops Media.`;
    const otherLang = lang === "es" ? "en" : "es";
    const canonical = `${SITE_URL}/${lang}/${seg}/${fmt.id}`;
    const alternate = `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].series}/${fmt.id}`;
    writePage(`${lang}/${seg}/${fmt.id}`, {
      title,
      description,
      canonical,
      alternate,
      lang,
      ogImage: `${SITE_URL}/logo.jpeg`,
      jsonLd: [
        { "@context": "https://schema.org", "@type": "CollectionPage", name: label, url: canonical },
        breadcrumbJsonLd(lang, [
          { name: lang === "es" ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
          { name: label, item: canonical },
        ]),
      ],
      bodyHtml: `<h1>${esc(label)}</h1><p>${esc(description)}</p>${feedSnippet(items, lang)}`,
    });
    writtenRoutes.push(`${lang}/${seg}/${fmt.id}`);
  }
}

// --- Tag pages (one per unique primary_tag) ---
const allTags = Array.from(
  new Set(allArticles.flatMap((a) => a.tags?.map((t) => t.id) ?? []).filter(Boolean))
);
for (const tagId of allTags) {
  for (const lang of ["en", "es"]) {
    const seg = ROUTE_SEGMENTS[lang].tags;
    const items = allArticles.filter((a) => a.tags?.some((t) => t.id === tagId));
    const title = lang === "es" ? `Etiqueta ${tagId} — X-Ops Media` : `Tag ${tagId} — X-Ops Media`;
    const description = lang === "es"
      ? `Artículos etiquetados como ${tagId}.`
      : `Articles tagged as ${tagId}.`;
    const otherLang = lang === "es" ? "en" : "es";
    const canonical = `${SITE_URL}/${lang}/${seg}/${tagId}`;
    const alternate = `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].tags}/${tagId}`;
    writePage(`${lang}/${seg}/${tagId}`, {
      title,
      description,
      canonical,
      alternate,
      lang,
      ogImage: `${SITE_URL}/logo.jpeg`,
      jsonLd: [
        { "@context": "https://schema.org", "@type": "CollectionPage", name: title, url: canonical },
        breadcrumbJsonLd(lang, [
          { name: lang === "es" ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
          { name: title, item: canonical },
        ]),
      ],
      bodyHtml: `<h1>${esc(title)}</h1><p>${esc(description)}</p>${feedSnippet(items, lang)}`,
    });
    writtenRoutes.push(`${lang}/${seg}/${tagId}`);
  }
}

// --- Article pages (ambos idiomas por artículo) ---
for (const a of allArticles) {
  for (const lang of ["en", "es"]) {
    const title = lang === "es" ? a.title_es : a.title_en;
    const body = lang === "es" ? a.body_es : a.body_en;
    const otherLang = lang === "es" ? "en" : "es";
    const canonical = `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].article}/${a.slug}`;
    const alternate = `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].article}/${a.slug}`;
    const cover = a.cover_asset_key ? `${SITE_URL}/covers/${a.cover_asset_key}.jpeg` : null;
    writePage(`${lang}/${ROUTE_SEGMENTS[lang].article}/${a.slug}`, {
      title: `${title} — X-Ops Media`,
      description: articleDescription(a, lang),
      canonical,
      alternate,
      lang,
      ogImage: cover,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: title,
          datePublished: a.published_at,
          dateModified: a.updated_at ?? a.published_at,
          inLanguage: lang,
          mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
          url: canonical,
          image: cover ? [cover] : [`${SITE_URL}/logo.jpeg`],
          author: { "@type": "Organization", name: "X-Ops Media", url: SITE_URL },
          publisher: { "@type": "Organization", name: "X-Ops Media", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.jpeg` } },
          articleSection: a.topic ? (lang === "es" ? a.topic.labelEs : a.topic.labelEn) : undefined,
        },
        breadcrumbJsonLd(lang, [
          { name: lang === "es" ? "Portada" : "Home", item: `${SITE_URL}/${lang}` },
          ...(a.topic
            ? [
                {
                  name: lang === "es" ? a.topic.labelEs : a.topic.labelEn,
                  item: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${lang === "es" ? a.topic.slugEs : a.topic.slugEn}`,
                },
              ]
            : []),
          { name: title, item: canonical },
        ]),
      ],
      bodyHtml: articleSnippet(a, lang),
    });
    writtenRoutes.push(`${lang}/${ROUTE_SEGMENTS[lang].article}/${a.slug}`);
  }
}

// --- 404 pages (en + es) ---
for (const lang of ["en", "es"]) {
  const title = lang === "es" ? "Página no encontrada — X-Ops Media" : "Page not found — X-Ops Media";
  const description = lang === "es" ? "La página solicitada no existe." : "The page you requested does not exist.";
  writePage(`${lang}/404`, {
    title,
    description,
    canonical: `${SITE_URL}/${lang}/404`,
    alternate: `${SITE_URL}/${lang === "es" ? "en" : "es"}`,
    lang,
    ogImage: `${SITE_URL}/logo.jpeg`,
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebPage", name: title, url: `${SITE_URL}/${lang}/404` }],
    bodyHtml: `<h1>${esc(title)}</h1><p>${esc(description)}</p>`,
  });
  writtenRoutes.push(`${lang}/404`);
}

console.log(`Prerendered ${writtenRoutes.length} static pages: ${writtenRoutes.slice(0, 6).join(", ")}… (full list in dist/).`);