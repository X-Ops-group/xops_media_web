#!/usr/bin/env node
// Genera robots.txt, sitemap.xml y llms.txt en dist/ a partir del contenido
// real (src/content/<niche>/articles.json) — corre como parte de `npm run build`.
// Sin dependencias externas, solo Node + fs.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = "https://xops.media";
const CONTENT_DIR = new URL("../src/content/", import.meta.url).pathname;
const DIST_DIR = new URL("../dist/", import.meta.url).pathname;

const CATEGORIES = [
  { id: "devsecops-en", slug: "devsecops", lang: "en", label: "DevSecOps" },
  { id: "devsecops-es", slug: "devsecops", lang: "es", label: "DevSecOps" },
  { id: "xopsyou-en", slug: "x-ops", lang: "en", label: "X-Ops" },
  { id: "xopsyou-es", slug: "x-ops", lang: "es", label: "X-Ops" },
];

function loadArticles(nicheId) {
  try {
    const raw = readFileSync(join(CONTENT_DIR, nicheId, "articles.json"), "utf-8");
    return JSON.parse(raw).articles ?? [];
  } catch {
    return [];
  }
}

const allArticles = CATEGORIES.flatMap((c) => loadArticles(c.id).map((a) => ({ ...a, _cat: c })));

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
const urls = [];
for (const lang of ["en", "es"]) {
  urls.push({ loc: `${SITE_URL}/${lang}`, changefreq: "hourly", priority: "1.0" });
  const langCats = CATEGORIES.filter((c) => c.lang === lang);
  for (const c of langCats) {
    urls.push({ loc: `${SITE_URL}/${lang}/categoria/${c.slug}`, changefreq: "hourly", priority: "0.8" });
  }
}
for (const a of allArticles) {
  const lang = a._cat.lang;
  urls.push({ loc: `${SITE_URL}/${lang}/articulo/${a.slug}`, lastmod: a.published_at.slice(0, 10), changefreq: "weekly", priority: "0.9" });
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
  const key = `${a._cat.label} (${a._cat.lang.toUpperCase()})`;
  (byCategory[key] ??= []).push(a);
}
const llms = `# X-Ops Media

> Noticias de DevSecOps, seguridad de plataformas y AI infra. Cada artículo es
> bilingüe (inglés/español), curado por un scout automatizado, redactado por
> un agente de IA sobre hechos verificados de múltiples fuentes, y aprobado
> por un editor humano antes de publicarse — nunca al revés.

## Cómo citar este contenido

Cada artículo tiene una URL canónica estable (\`/en/articulo/<slug>\` o
\`/es/articulo/<slug>\`) y datos estructurados NewsArticle (JSON-LD) con
fecha de publicación, autor (X-Ops Media) y sección. Citar la URL del
artículo, no la portada.

## Secciones

${Object.entries(byCategory)
  .map(([cat, items]) => `### ${cat}\n\n${items.map((a) => `- [${a._cat.lang === "es" ? a.title_es : a.title_en}](${SITE_URL}/${a._cat.lang}/articulo/${a.slug})`).join("\n")}`)
  .join("\n\n")}
`;
writeFileSync(join(DIST_DIR, "llms.txt"), llms);

console.log(`SEO files generated: robots.txt, sitemap.xml (${urls.length} URLs), llms.txt (${allArticles.length} articles)`);
