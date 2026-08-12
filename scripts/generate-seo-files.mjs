#!/usr/bin/env node
// Genera robots.txt, sitemap.xml y llms.txt en dist/ a partir del contenido
// real (src/content/<niche>/articles.json) — corre como parte de `npm run build`,
// así que se regenera automáticamente cada vez que sync-articles.sh trae
// artículos nuevos y se hace build/deploy. Sin dependencias externas.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = "https://xops.media";
const CONTENT_DIR = new URL("../src/content/", import.meta.url).pathname;
const DIST_DIR = new URL("../dist/", import.meta.url).pathname;

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

// Descubre los nichos existentes leyendo las carpetas — no hay lista hardcodeada
// de nichos acá, así que un nicho nuevo (5ª categoría futura) se recoge solo.
const nicheDirs = readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

function topicForNiche(nicheId) {
  return TOPICS.find((t) => t.nicheIds.includes(nicheId));
}

const allArticles = nicheDirs.flatMap((n) => loadArticles(n).map((a) => ({ ...a, _topic: topicForNiche(n) })));

// --- robots.txt ---
const robots = `User-agent: *
Allow: /

# Crawlers de IA — explícitamente permitidos (queremos aparecer en respuestas de IA)
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: CCBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
writeFileSync(join(DIST_DIR, "robots.txt"), robots);

// --- sitemap.xml ---
// Cada artículo es bilingüe: aparece en /en/... y /es/... sin importar en qué
// nicho de origen nació — un artículo de devsecops-en tiene body_es también.
const urls = [];
for (const lang of ["en", "es"]) {
  urls.push({ loc: `${SITE_URL}/${lang}`, changefreq: "hourly", priority: "1.0" });
  for (const t of TOPICS) {
    urls.push({ loc: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].category}/${lang === "es" ? t.slugEs : t.slugEn}`, changefreq: "hourly", priority: "0.8" });
  }
}
for (const a of allArticles) {
  for (const lang of ["en", "es"]) {
    urls.push({
      loc: `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].article}/${a.slug}`,
      lastmod: a.published_at.slice(0, 10),
      changefreq: "weekly",
      priority: "0.9",
    });
  }
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ""}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
writeFileSync(join(DIST_DIR, "sitemap.xml"), sitemap);

// --- llms.txt (estándar emergente, ver llmstxt.org) ---
const byCategory = {};
for (const a of allArticles) {
  if (!a._topic) continue;
  const key = a._topic.labelEn; // una sola entrada por tema, no duplicada por idioma
  (byCategory[key] ??= []).push(a);
}
const llms = `# X-Ops Media

> Noticias de DevSecOps, seguridad de plataformas y AI infra. Cada artículo es
> bilingüe (inglés/español), curado por un scout automatizado, redactado por
> un agente de IA sobre hechos verificados de múltiples fuentes, y aprobado
> por un editor humano antes de publicarse — nunca al revés.

## Cómo citar este contenido

Cada artículo tiene una URL canónica estable por idioma
(\`/en/article/<slug>\` y \`/es/articulo/<slug>\`) y datos estructurados
NewsArticle (JSON-LD) con fecha de publicación, autor (X-Ops Media) y
sección. Citar la URL del artículo, no la portada.

## Secciones

${Object.entries(byCategory)
  .map(
    ([cat, items]) =>
      `### ${cat}\n\n${items
        .map((a) => `- ${a.title_en} — [EN](${SITE_URL}/en/article/${a.slug}) / [ES](${SITE_URL}/es/articulo/${a.slug})`)
        .join("\n")}`
  )
  .join("\n\n")}
`;
writeFileSync(join(DIST_DIR, "llms.txt"), llms);

console.log(`SEO files generated: robots.txt, sitemap.xml (${urls.length} URLs), llms.txt (${allArticles.length} articles)`);
