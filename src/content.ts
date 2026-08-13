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
}

export type Lang = "es" | "en";

// Segmentos de ruta bilingües: en inglés se navega en inglés (/en/category/.., /en/article/..),
// en español en español (/es/categoria/.., /es/articulo/..).
export const ROUTE_SEGMENTS: Record<Lang, { category: string; article: string }> = {
  en: { category: "category", article: "article" },
  es: { category: "categoria", article: "articulo" },
};

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
export const TOPICS: Topic[] = [
  { id: "devsecops", nicheIds: ["devsecops-en", "devsecops-es"], slugEs: "devsecops", slugEn: "devsecops", labelEs: "DevSecOps", labelEn: "DevSecOps" },
  { id: "x-ops", nicheIds: ["xopsyou-en", "xopsyou-es"], slugEs: "x-ops", slugEn: "x-ops", labelEs: "X-Ops", labelEn: "X-Ops" },
];

export function categoriesForLang(_lang: Lang): Topic[] {
  return TOPICS;
}

export function topicByNicheId(nicheId: string): Topic | undefined {
  return TOPICS.find((t) => t.nicheIds.includes(nicheId));
}

export function topicBySlug(lang: Lang, slug: string): Topic | undefined {
  return TOPICS.find((t) => (lang === "es" ? t.slugEs : t.slugEn) === slug);
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

export function articlesByTopic(topicId: string): Article[] {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return [];
  return allArticles().filter((a) => topic.nicheIds.includes(a.niche_id));
}

export function findArticleBySlug(slug: string): Article | undefined {
  return allArticles().find((a) => a.slug === slug);
}
