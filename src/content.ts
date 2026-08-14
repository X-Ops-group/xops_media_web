export interface Article {
  id: string;
  niche_id: string;
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  slug: string;
  cover_asset_key: string | null;
  source_urls: { url: string; name: string }[];
  published_at: string;
  // ── Fase 2: editorial authorship + format + urgency + tags ───────────────
  // All optional so existing articles (and articles not yet re-emitted by the
  // backfill) keep working. Defaults are applied via `withDefaults(article)`
  // when consumed by UI components.
  author_slug?: string;
  editor_slug?: string;
  format?: ArticleFormat;
  urgency?: ArticleUrgency;
  dek_es?: string;
  dek_en?: string;
  updated_at?: string; // ISO timestamp; absent means article never updated
  primary_tag?: string;
  topics?: string[]; // ids from TOPICS (security, cloud-native, platform, sre, ai-infra)
  /** Editorial meta description for SERP snippets (EN/ES). When present, used
   * by prerender + seo.ts INSTEAD of auto-deriving from the body. Length is
   * editor-controlled; the prerender pipeline caps at 155 chars on a sentence
   * boundary. Optional — defaults to deriving from `body_es` / `body_en` if
   * missing. See withDefaults. */
  meta_description_es?: string;
  meta_description_en?: string;
  tags?: { id: string; label: string; kind?: string }[];
}

export type ArticleFormat =
  | "news"
  | "exploit"
  | "explainer"
  | "analysis"
  | "field-notes"
  | "conference-recap";

export type ArticleUrgency =
  | "normal"
  | "elevated"
  | "critical"
  | "actively-exploited";

export interface Author {
  slug: string;
  display_name: string;
  role: "writer" | "editor" | "both";
  bio_es: string;
  bio_en: string;
  links: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    mastodon?: string;
  };
  credentials: string[];
  avatar?: string;
}

export function roleLabel(role: Author["role"], lang: Lang): string {
  if (lang === "es") {
    if (role === "writer") return "Redactor";
    if (role === "editor") return "Editor";
    return "Redactor y editor";
  }
  if (role === "writer") return "Writer";
  if (role === "editor") return "Editor";
  return "Writer & editor";
}

export interface ConferenceTalk {
  title: string;
  speaker: string;
  date: string;
  video_url: string;
  summary_es: string;
  summary_en: string;
}

export interface Conference {
  event_name: string;
  tagline_es: string;
  tagline_en: string;
  next_edition: {
    date: string;
    location: string;
    cfp_url: string;
    call_for_papers_open: boolean;
    cfp_deadline: string;
  };
  recent_talks: ConferenceTalk[];
  links: {
    main: string;
    cfp: string;
    schedule: string;
    archive: string;
  };
}

export interface Page {
  slug: "about" | "methodology" | "ethics" | "contact";
  title_es: string;
  title_en: string;
  meta_description_es: string;
  meta_description_en: string;
  body_es: string;
  body_en: string;
}

// ── Bilingual editorial taxonomy (DB-aligned) ──────────────────────────────
// `id` is the value that lands in Article.topics[]. The slug/label pair is
// for URLs and human-readable chips. Distinct from the legacy TOPICS array
// below (editorial categories `devsecops` / `x-ops`); both coexist.
export const TOPICS: {
  id: string;
  label: { es: string; en: string };
  slug: { es: string; en: string };
}[] = [
  {
    id: "security",
    label: { es: "Ciberseguridad", en: "Cybersecurity" },
    slug: { es: "seguridad", en: "security" },
  },
  {
    id: "cloud-native",
    label: { es: "Cloud-native", en: "Cloud-native" },
    slug: { es: "cloud-native", en: "cloud-native" },
  },
  {
    id: "platform",
    label: { es: "Platform", en: "Platform" },
    slug: { es: "plataforma", en: "platform" },
  },
  { id: "sre", label: { es: "SRE", en: "SRE" }, slug: { es: "sre", en: "sre" } },
  {
    id: "ai-infra",
    label: { es: "IA Infra", en: "AI Infra" },
    slug: { es: "ia-infra", en: "ai-infra" },
  },
];

export function topicById(id: string): (typeof TOPICS)[number] | undefined {
  return TOPICS.find((t) => t.id === id);
}

export const FORMATS = [
  "news",
  "exploit",
  "explainer",
  "analysis",
  "field-notes",
  "conference-recap",
] as const;

export const FORMAT_LABELS: Record<(typeof FORMATS)[number], { es: string; en: string }> = {
  news: { es: "Noticia", en: "News" },
  exploit: { es: "Exploit", en: "Exploit" },
  explainer: { es: "Explainer", en: "Explainer" },
  analysis: { es: "Análisis", en: "Analysis" },
  "field-notes": { es: "Field Notes", en: "Field Notes" },
  "conference-recap": { es: "Crónica", en: "Conference Recap" },
};

export const FORMAT_DESCRIPTIONS: Record<(typeof FORMATS)[number], { es: string; en: string }> = {
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

export const FORMAT_COLORS: Record<(typeof FORMATS)[number], string> = {
  news: "#3b82f6",
  exploit: "#ef4444",
  explainer: "#10b981",
  analysis: "#8b5cf6",
  "field-notes": "#f59e0b",
  "conference-recap": "#ec4899",
};

export const URGENCY_LEVELS = [
  "normal",
  "elevated",
  "critical",
  "actively-exploited",
] as const;

export const URGENCY_COLORS: Record<(typeof URGENCY_LEVELS)[number], string> = {
  normal: "#6b7280",
  elevated: "#f59e0b",
  critical: "#ef4444",
  "actively-exploited": "#dc2626",
};

export type Lang = "es" | "en";

// Segmentos de ruta bilingües: en inglés se navega en inglés (/en/category/.., /en/article/..),
// en español en español (/es/categoria/.., /es/articulo/..).
export const ROUTE_SEGMENTS: Record<Lang, { category: string; article: string }> = {
  en: { category: "category", article: "article" },
  es: { category: "categoria", article: "articulo" },
};

// Legacy editorial-category taxonomy (devsecops / x-ops) — preserved alongside
// TOPICS. Kept as the `niche_id`-based filter for backwards compatibility with
// the existing routes and components. The new article-level `topics` field
// uses the TOPICS constant above.
export interface Topic {
  id: string; // slug estable, independiente del idioma (= categoría)
  nicheIds: string[]; // los niches (uno por idioma de origen) que caen bajo este tema
  slugEs: string;
  slugEn: string;
  labelEs: string;
  labelEn: string;
}

// Las 2 categorías reales = tema editorial, no nicho de origen. Un artículo
// nacido en devsecops-en sigue siendo "DevSecOps" al verlo en español —
// el contenido es bilingüe, la categoría no depende de en qué idioma nació
// (bug reportado: cambiar a ES en la categoría DevSecOps mostraba 0 posts
// porque antes se filtraba por niche_id exacto, no por tema).
export const LEGACY_CATEGORIES: Topic[] = [
  { id: "devsecops", nicheIds: ["devsecops-en", "devsecops-es"], slugEs: "devsecops", slugEn: "devsecops", labelEs: "DevSecOps", labelEn: "DevSecOps" },
  { id: "x-ops", nicheIds: ["xopsyou-en", "xopsyou-es"], slugEs: "x-ops", slugEn: "x-ops", labelEs: "X-Ops", labelEn: "X-Ops" },
];

export function categoriesForLang(_lang: Lang): Topic[] {
  return LEGACY_CATEGORIES;
}

export function topicByNicheId(nicheId: string): Topic | undefined {
  return LEGACY_CATEGORIES.find((t) => t.nicheIds.includes(nicheId));
}

export function topicBySlug(lang: Lang, slug: string): Topic | undefined {
  return LEGACY_CATEGORIES.find(
    (t) => (lang === "es" ? t.slugEs : t.slugEn) === slug,
  );
}

function loadJson(niche: string): { articles: Article[] } {
  const modules = import.meta.glob("./content/*/articles.json", { eager: true }) as Record<
    string,
    { articles: Article[] }
  >;
  const entry = Object.entries(modules).find(([path]) => path.includes(`/${niche}/`));
  return entry ? entry[1] : { articles: [] };
}

function loadAllNicheIds(): string[] {
  const modules = import.meta.glob("./content/*/articles.json", { eager: true }) as Record<string, unknown>;
  return Object.keys(modules).map((p) => p.split("/").slice(-2, -1)[0]);
}

// Static editorial metadata (authors, conference, static pages). All loaded
// eagerly at build time — the directory is tiny (3 files) so a per-file
// import.meta.glob keeps each loader obvious to read.
type StaticModules = {
  authors: { authors: Author[] };
  conference: Conference;
  pages: { pages: Page[] };
};

function loadStaticModules(): StaticModules {
  const modules = import.meta.glob("./content/_static/*.json", {
    eager: true,
  }) as Record<string, unknown>;
  const authors = (modules["./content/_static/authors.json"] ?? { authors: [] }) as {
    authors: Author[];
  };
  const conference = (modules["./content/_static/conference.json"] ?? null) as Conference | null;
  const pages = (modules["./content/_static/pages.json"] ?? { pages: [] }) as {
    pages: Page[];
  };
  return {
    authors,
    // conference.json is required; if it's missing we hand back an empty shell
    // so consumers don't crash on first deploy (Task 11 Step 7 of the plan).
    conference: conference ?? {
      event_name: "X-Ops Conference",
      tagline_es: "",
      tagline_en: "",
      next_edition: {
        date: "",
        location: "",
        cfp_url: "",
        call_for_papers_open: false,
        cfp_deadline: "",
      },
      recent_talks: [],
      links: { main: "", cfp: "", schedule: "", archive: "" },
    },
    pages,
  };
}

export function loadAuthors(): Author[] {
  return loadStaticModules().authors.authors;
}

export function loadConference(): Conference {
  return loadStaticModules().conference;
}

export function loadPage(
  slug: Page["slug"],
  lang: Lang,
): { title: string; body: string; meta_description: string } | undefined {
  const page = loadStaticModules().pages.pages.find((p) => p.slug === slug);
  if (!page) return undefined;
  return {
    title: lang === "es" ? page.title_es : page.title_en,
    body: lang === "es" ? page.body_es : page.body_en,
    meta_description:
      lang === "es" ? page.meta_description_es : page.meta_description_en,
  };
}

// Mapeo de `articles.json` `cover_asset_key` (slug relativo tipo
// "teamcity-cve-2026-63077-rce") a URL servida por Vite desde `public/`.
// Las portadas viven en `public/covers/<slug>.png` y se sirven en raíz como
// `/covers/<slug>.png` — Vite las copia tal cual al dist, sin hashear (son
// assets estáticos referenciados por nombre desde articles.json; cambiarles
// el nombre rompería el contrato).
//
// Si la portada está ausente del repo (artículo sin portada aún), el slug
// simplemente no aparece en el map y `coverUrlFor()` devuelve null — el
// componente ArticleCard/ArticlePage trata null como "no hay portada".
const COVER_SLUGS = [
  "teamcity-cve-2026-63077-rce",
  "kvm-nested-virtualization-isolation-flaw",
  "metabase-zero-day-sql-injection",
  "cve-2026-20316-cisco-secure-fmc",
  "veeam-terraform-django-security-patches",
] as const;

const COVER_MAP: Record<string, string> = Object.fromEntries(
  COVER_SLUGS.map((slug) => [slug, `/covers/${slug}.png` as string])
);

/**
 * Resuelve el `cover_asset_key` de un artículo a la URL servida por Vite.
 * Devuelve null si el artículo no tiene cover o si el slug no se encuentra
 * en el repositorio de assets (p.ej. portada pendiente de añadir).
 */
export function coverUrlFor(article: Pick<Article, "cover_asset_key">): string | null {
  if (!article.cover_asset_key) return null;
  return COVER_MAP[article.cover_asset_key] ?? null;
}

export function allArticles(): Article[] {
  return loadAllNicheIds()
    .flatMap((n) => loadJson(n).articles)
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
}

/**
 * Returns an Article with sensible defaults applied for any missing Fase 2
 * editorial fields. Use this when handing an article off to a UI component
 * that needs `format`, `urgency`, etc. — avoids `?? 'news'` boilerplate at
 * every call site and centralises the contract of "what does missing mean".
 */
export function withDefaults(article: Article): Article & {
  format: ArticleFormat;
  urgency: ArticleUrgency;
  topics: string[];
  tags: NonNullable<Article["tags"]>;
  updated_at: string;
} {
  return {
    ...article,
    format: article.format ?? "news",
    urgency: article.urgency ?? "normal",
    topics: article.topics ?? [],
    tags: article.tags ?? [],
    updated_at: article.updated_at ?? article.published_at,
  };
}

// Legacy editor-category filter (devsecops / x-ops). Filters by niche_id.
export function articlesByTopic(topicId: string): Article[] {
  const topic = LEGACY_CATEGORIES.find((t) => t.id === topicId);
  if (!topic) return [];
  return allArticles().filter((a) => topic.nicheIds.includes(a.niche_id));
}

// New article-level topics filter (security / cloud-native / platform / sre /
// ai-infra). Filters by Article.topics[] — distinct from `articlesByTopic`,
// which still serves the legacy editorial categories.
export function articlesByEditorialTopic(topicId: string): Article[] {
  return allArticles().filter((a) => a.topics?.includes(topicId) ?? false);
}

export function findArticleBySlug(slug: string): Article | undefined {
  return allArticles().find((a) => a.slug === slug);
}

export function articleById(id: string): Article | undefined {
  return allArticles().find((a) => a.id === id);
}

export function articlesByAuthor(authorSlug: string): Article[] {
  return allArticles().filter((a) => a.author_slug === authorSlug);
}

export function articlesByEditor(editorSlug: string): Article[] {
  return allArticles().filter((a) => a.editor_slug === editorSlug);
}

export function articlesByFormat(format: ArticleFormat): Article[] {
  return allArticles().filter((a) => (a.format ?? "news") === format);
}

export function articlesByUrgency(urgency: ArticleUrgency): Article[] {
  return allArticles().filter((a) => (a.urgency ?? "normal") === urgency);
}

export function articlesByTag(tagId: string): Article[] {
  return allArticles().filter((a) =>
    a.tags?.some((t) => t.id === tagId) ?? false,
  );
}

/**
 * Join on author_slug. Returns undefined if the article has no author_slug
 * or the slug isn't in authors.json — the byline component should render
 * "X-Ops Media editorial team" in that case rather than crashing.
 */
export function authorByArticle(article: Article): Author | undefined {
  if (!article.author_slug) return undefined;
  return loadAuthors().find((a) => a.slug === article.author_slug);
}