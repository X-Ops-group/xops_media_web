#!/usr/bin/env node
// Pre-renderiza cada ruta a HTML estático real (contenido en el response inicial,
// no solo tras ejecutar JS) — clave para crawlers de IA que no ejecutan JS
// (GPTBot, CCBot y varios más lo confirman públicamente). El bundle de React
// sigue cargando después y toma control normal de la página (interactividad
// intacta); esto solo asegura que el <body> inicial ya tenga el contenido real.
//
// Corre como parte de `npm run build`, después de generate-seo-files.mjs, así
// que se regenera automáticamente con cada sync de artículos nuevos.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";

const SITE_URL = "https://xops.media";
const DIST_DIR = new URL("../dist/", import.meta.url).pathname;
const CONTENT_DIR = new URL("../src/content/", import.meta.url).pathname;

const ROUTE_SEGMENTS = {
  en: { category: "category", article: "article" },
  es: { category: "categoria", article: "articulo" },
};

const TOPICS = [
  { id: "devsecops", nicheIds: ["devsecops-en", "devsecops-es"], slugEs: "devsecops", slugEn: "devsecops", labelEs: "DevSecOps", labelEn: "DevSecOps" },
  { id: "x-ops", nicheIds: ["xopsyou-en", "xopsyou-es"], slugEs: "x-ops", slugEn: "x-ops", labelEs: "X-Ops", labelEn: "X-Ops" },
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
    .replace(/>/g, "&gt;");
}

const TEMPLATE = readFileSync(join(DIST_DIR, "index.html"), "utf-8");

function writePage(routePath, { title, description, canonical, alternate, lang, jsonLd, bodyHtml }) {
  let html = TEMPLATE;
  html = html.replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    "</head>",
    `  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="${lang === "es" ? "en" : "es"}" href="${alternate}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="X-Ops Media" />
  <meta name="twitter:card" content="summary_large_image" />
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
    <time datetime="${a.published_at}">${a.published_at.slice(0, 10)}</time>
    ${body
      .split("\n\n")
      .map((p) => `<p>${esc(p)}</p>`)
      .join("\n    ")}
  </article>`;
}

function feedSnippet(articles, lang) {
  const seg = ROUTE_SEGMENTS[lang].article;
  return `<ul>
    ${articles
      .map((a) => {
        const title = lang === "es" ? a.title_es : a.title_en;
        const body = lang === "es" ? a.body_es : a.body_en;
        return `<li><a href="/${lang}/${seg}/${a.slug}"><h2>${esc(title)}</h2><p>${esc(body.slice(0, 200))}…</p></a></li>`;
      })
      .join("\n    ")}
  </ul>`;
}

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
    jsonLd: [
      { "@context": "https://schema.org", "@type": "Organization", name: "X-Ops Media", url: SITE_URL, logo: `${SITE_URL}/logo.jpeg` },
      { "@context": "https://schema.org", "@type": "WebSite", name: "X-Ops Media", url: SITE_URL },
    ],
    bodyHtml: `<h1>${esc(title)}</h1><p>${esc(description)}</p>${feedSnippet(allArticles, lang)}`,
  });
}

// --- Category pages (por tema, no por nicho — un artículo devsecops-en también
// aparece en /es/categoria/devsecops porque tiene body_es) ---
for (const topic of TOPICS) {
  for (const lang of ["en", "es"]) {
    const slug = lang === "es" ? topic.slugEs : topic.slugEn;
    const items = allArticles.filter((a) => a.topic?.id === topic.id);
    const label = topicLabel(topic, lang);
    writePage(`${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}`, {
      title: `${label} — X-Ops Media`,
      description: lang === "es" ? `Últimas noticias de ${label}.` : `The latest ${label} news.`,
      canonical: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}`,
      alternate: `${SITE_URL}/${lang === "es" ? "en" : "es"}/${ROUTE_SEGMENTS[lang === "es" ? "en" : "es"].category}/${lang === "es" ? topic.slugEn : topic.slugEs}`,
      lang,
      jsonLd: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: label, url: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${slug}` }],
      bodyHtml: `<h1>${esc(label)}</h1>${feedSnippet(items, lang)}`,
    });
  }
}

// --- Article pages (ambos idiomas por artículo) ---
for (const a of allArticles) {
  for (const lang of ["en", "es"]) {
    const title = lang === "es" ? a.title_es : a.title_en;
    const body = lang === "es" ? a.body_es : a.body_en;
    const otherLang = lang === "es" ? "en" : "es";
    writePage(`${lang}/${ROUTE_SEGMENTS[lang].article}/${a.slug}`, {
      title: `${title} — X-Ops Media`,
      description: body.slice(0, 155).trim() + "…",
      canonical: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].article}/${a.slug}`,
      alternate: `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].article}/${a.slug}`,
      lang,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: title,
          datePublished: a.published_at,
          inLanguage: lang,
          author: { "@type": "Organization", name: "X-Ops Media" },
          publisher: { "@type": "Organization", name: "X-Ops Media" },
        },
      ],
      bodyHtml: articleSnippet(a, lang),
    });
  }
}

console.log(`Prerendered ${2 + TOPICS.length * 2 + allArticles.length * 2} static pages.`);
