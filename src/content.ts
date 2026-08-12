export interface Article {
  id: string;
  niche_id: string;
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  slug: string;
  cover_asset_key: string | null;
  published_at: string;
}

export type Lang = "es" | "en";

export interface Category {
  id: string; // = niche_id
  slugEs: string;
  slugEn: string;
  labelEs: string;
  labelEn: string;
  lang: Lang; // idioma nativo del nicho (el contenido siempre es bilingüe, pero la categoría vive en un idioma "home")
}

// Las 4 categorías = los 4 nichos vivos (ADR-004 D2.1). Cada una es su propia
// sección, como las secciones de El Correo del Golfo (Actualidad, Economía, ...).
export const CATEGORIES: Category[] = [
  { id: "devsecops-en", slugEs: "devsecops", slugEn: "devsecops", labelEs: "DevSecOps", labelEn: "DevSecOps", lang: "en" },
  { id: "devsecops-es", slugEs: "devsecops", slugEn: "devsecops", labelEs: "DevSecOps", labelEn: "DevSecOps", lang: "es" },
  { id: "xopsyou-en", slugEs: "x-ops", slugEn: "x-ops", labelEs: "X-Ops", labelEn: "X-Ops", lang: "en" },
  { id: "xopsyou-es", slugEs: "x-ops", slugEn: "x-ops", labelEs: "X-Ops", labelEn: "X-Ops", lang: "es" },
];

export function categoriesForLang(lang: Lang): Category[] {
  return CATEGORIES.filter((c) => c.lang === lang);
}

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

function loadJson(niche: string): { articles: Article[] } {
  const modules = import.meta.glob("./content/*/articles.json", { eager: true }) as Record<
    string,
    { articles: Article[] }
  >;
  const entry = Object.entries(modules).find(([path]) => path.includes(`/${niche}/`));
  return entry ? entry[1] : { articles: [] };
}

export function articlesByCategory(nicheId: string): Article[] {
  return loadJson(nicheId).articles.slice().sort((a, b) => b.published_at.localeCompare(a.published_at));
}

export function allArticles(): Article[] {
  return CATEGORIES.flatMap((c) => articlesByCategory(c.id)).sort((a, b) =>
    b.published_at.localeCompare(a.published_at)
  );
}

export function findArticleBySlug(slug: string): Article | undefined {
  return allArticles().find((a) => a.slug === slug);
}
