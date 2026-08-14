#!/usr/bin/env node
// Generates public/rss.xml + public/feed.json from approved articles.
//
// SOURCE-OF-TRUTH & DRAFT FILTERING
// ---------------------------------
// Articles live under src/content/<niche>/articles.json. Every article in
// that file is treated as `status='approved'` (the legacy pipeline does not
// emit drafts to disk — drafts only ever exist in the Telegram bot draft
// channel). This file deliberately does NOT read from any other path, so
// drafts cannot leak into the feed.
//
// If a future schema adds a `status` field, this filter must respect it:
//   const approved = allArticles.filter((a) => (a.status ?? "approved") === "approved");
//
// SECURITY
// --------
// - XML-escapes all untrusted strings (titles, summaries, author names).
// - No remote fetches, no env secrets, no tokens. The user's CLAUDE.md
//   mandates Vault for credentials; this script never reads from Vault and
//   emits no token-bearing URLs.
// - Generated `og:image` URLs use the public `/covers/...` path that ships
//   in `dist/`, not a CDN with signed tokens.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = "https://xops.media";
const CONTENT_DIR = new URL("../src/content/", import.meta.url).pathname;
const PUBLIC_DIR = new URL("../public/", import.meta.url).pathname;
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

function topicForNiche(nicheId) {
  return TOPICS.find((t) => t.nicheIds.includes(nicheId));
}

const nicheDirs = readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const allArticles = nicheDirs
  .flatMap((n) => loadArticles(n).map((a) => ({ ...a, topic: topicForNiche(n) })))
  .sort((a, b) => b.published_at.localeCompare(a.published_at));

// ── XML escape ────────────────────────────────────────────────────────────
function xmlEscape(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function plainExcerpt(s, max = 280) {
  return String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// ── Cover URL (mirror of content.ts coverUrlFor logic, no node-ts loader) ──
function coverUrlFor(article) {
  if (!article.cover_asset_key) return null;
  return `${SITE_URL}/covers/${article.cover_asset_key}.jpeg`;
}

// ── Build a feed item for one language ────────────────────────────────────
function buildItem(a, lang) {
  const otherLang = lang === "es" ? "en" : "es";
  const isEs = lang === "es";
  const title = isEs ? a.title_es : a.title_en;
  const body = isEs ? a.body_es : a.body_en;
  const summary = plainExcerpt(body, 280);
  const url = `${SITE_URL}/${lang}/${ROUTE_SEGMENTS[lang].article}/${a.slug}`;
  const cover = coverUrlFor(a);
  const categoryLabel = a.topic ? (isEs ? a.topic.labelEs : a.topic.labelEn) : "News";
  return {
    title,
    link: url,
    guid: `${url}#${lang}`,
    pubDate: new Date(a.published_at).toUTCString(),
    description: summary,
    category: categoryLabel,
    cover,
    authorName: "X-Ops Media",
    authorEmail: "tips@xops.media",
    otherLink: `${SITE_URL}/${otherLang}/${ROUTE_SEGMENTS[otherLang].article}/${a.slug}`,
  };
}

// ── RSS 2.0 + iTunes extensions ───────────────────────────────────────────
function buildRss(lang, items, title, description) {
  const lastBuild = items[0]?.pubDate ?? new Date().toUTCString();
  const xmllang = lang === "es" ? "es-es" : "en-us";
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xml:lang="${xmllang}">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${SITE_URL}/${lang}</link>
    <atom:link href="${SITE_URL}/${lang}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(description)}</description>
    <language>${lang === "es" ? "es-es" : "en-us"}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>X-Ops Media build pipeline</generator>
    <managingEditor>tips@xops.media (X-Ops Media)</managingEditor>
    <webMaster>tips@xops.media (X-Ops Media)</webMaster>
    <itunes:summary>${xmlEscape(description)}</itunes:summary>
    <itunes:author>X-Ops Media</itunes:author>
    <itunes:explicit>no</itunes:explicit>
    <image>
      <url>${SITE_URL}/logo.jpeg</url>
      <title>${xmlEscape(title)}</title>
      <link>${SITE_URL}/${lang}</link>
    </image>
${items
  .map((it) => `    <item>
      <title>${xmlEscape(it.title)}</title>
      <link>${it.link}</link>
      <guid isPermaLink="true">${xmlEscape(it.guid)}</guid>
      <pubDate>${it.pubDate}</pubDate>
      <description>${xmlEscape(it.description)}</description>
      <category>${xmlEscape(it.category)}</category>
      <author>tips@xops.media (${xmlEscape(it.authorName)})</author>
      <itunes:summary>${xmlEscape(it.description)}</itunes:summary>
      <itunes:author>${xmlEscape(it.authorName)}</itunes:author>
      ${it.cover ? `<itunes:image href="${xmlEscape(it.cover)}" />` : ""}
      <content:encoded><![CDATA[${it.description}]]></content:encoded>
    </item>`)
  .join("\n")}
  </channel>
</rss>
`;
}

// ── JSON Feed 1.1 ─────────────────────────────────────────────────────────
function buildJsonFeed(lang, items, title, description) {
  const xd = `${SITE_URL}/${lang === "es" ? "en" : "es"}/feed.json`;
  return {
    version: "https://jsonfeed.org/version/1.1",
    title,
    home_page_url: `${SITE_URL}/${lang}`,
    feed_url: `${SITE_URL}/${lang}/feed.json`,
    language: lang === "es" ? "es-ES" : "en-US",
    description,
    authors: [{ name: "X-Ops Media", url: SITE_URL }],
    _links: { self: `${SITE_URL}/${lang}/feed.json`, alternate: xd },
    items: items.map((it) => ({
      id: it.guid,
      url: it.link,
      external_url: it.link,
      title: it.title,
      content_text: it.description,
      content_html: `<p>${it.description.replace(/[<>&]/g, (c) =>
        c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;")}</p>`,
      summary: it.description,
      date_published: new Date(it.pubDate).toISOString(),
      date_modified: new Date(it.pubDate).toISOString(),
      authors: [{ name: it.authorName, url: SITE_URL }],
      tags: [it.category],
      ...(it.cover ? { image: it.cover, banner_image: it.cover } : {}),
      _x_ops_alternate_language: it.otherLink,
    })),
  };
}

// ── Emit both feeds for both languages ────────────────────────────────────
const labels = {
  en: { title: "X-Ops Media", desc: "Curated DevSecOps, container security, platform engineering and AI infra news — human-approved before it ever publishes." },
  es: { title: "X-Ops Media", desc: "Noticias curadas de DevSecOps, seguridad de contenedores, plataformas y AI infra — investigadas, redactadas y aprobadas por un humano antes de publicarse." },
};

// Output to BOTH public/ (so they appear in git for future static hosting) and
// dist/ (so they are live after `npm run build`). Vite copies `public/*` →
// `dist/*` only at build time; writing directly to dist/ ensures the feed is
// live even if someone deploys dist/ without re-running `vite build`.
mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(DIST_DIR, { recursive: true });

const summary = { rss: 0, json: 0 };
for (const lang of ["en", "es"]) {
  const items = allArticles.map((a) => buildItem(a, lang));
  const rss = buildRss(lang, items, labels[lang].title, labels[lang].desc);
  const jf = buildJsonFeed(lang, items, labels[lang].title, labels[lang].desc);

  // Per-language feed files at predictable paths for crawlers
  const rssPublic = join(PUBLIC_DIR, `${lang}.rss.xml`);
  const jsonPublic = join(PUBLIC_DIR, `${lang}.feed.json`);
  const rssDist = join(DIST_DIR, `${lang}.rss.xml`);
  const jsonDist = join(DIST_DIR, `${lang}.feed.json`);
  writeFileSync(rssPublic, rss);
  writeFileSync(jsonPublic, JSON.stringify(jf, null, 2));
  writeFileSync(rssDist, rss);
  writeFileSync(jsonDist, JSON.stringify(jf, null, 2));

  // Also write default (`/rss.xml`, `/feed.json`) pointing to the English
  // variant — the canonical feed for any crawler that asks for `/rss.xml`.
  if (lang === "en") {
    writeFileSync(join(PUBLIC_DIR, "rss.xml"), rss);
    writeFileSync(join(PUBLIC_DIR, "feed.json"), JSON.stringify(jf, null, 2));
    writeFileSync(join(DIST_DIR, "rss.xml"), rss);
    writeFileSync(join(DIST_DIR, "feed.json"), JSON.stringify(jf, null, 2));
  }

  summary.rss += items.length;
  summary.json += items.length;
}

console.log(`RSS/JSON feeds generated: ${summary.rss} items in rss.xml + en.rss.xml + es.rss.xml; ${summary.json} items in feed.json + en.feed.json + es.feed.json. Source: ${allArticles.length} approved articles.`);