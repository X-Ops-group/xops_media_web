import articlesData from "./content/articles.json";

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

// D1 del ADR-004: el contenido vive como código en git. src/content/articles.json
// se genera con scripts/sync-articles.sh (lee content_factory.articles, status='approved')
// y se comitea al repo — Vercel builda y despliega automáticamente al detectar el push.
export function fetchArticles(): Promise<Article[]> {
  return Promise.resolve((articlesData as { articles: Article[] }).articles);
}

export const NICHE_LABELS: Record<string, { es: string; en: string }> = {
  "devsecops-en": { es: "DevSecOps for all", en: "DevSecOps for all" },
  "devsecops-es": { es: "DevSecOps para todos", en: "DevSecOps para todos" },
  "xopsyou-en": { es: "X-Ops for you", en: "X-Ops for you" },
  "xopsyou-es": { es: "X-Ops for you", en: "X-Ops for you" },
};
