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

// D1 del ADR-004: el contenido vive como código en git — este fetch client-side
// es el paso intermedio antes del sync a MDX; hoy lee directo del pipeline vivo.
const FEED_URL = "http://100.126.250.117:5678/webhook/articles-feed";

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`articles-feed respondió ${res.status}`);
  const data = await res.json();
  return data.articles as Article[];
}

export const NICHE_LABELS: Record<string, { es: string; en: string }> = {
  "devsecops-en": { es: "DevSecOps for all", en: "DevSecOps for all" },
  "devsecops-es": { es: "DevSecOps para todos", en: "DevSecOps para todos" },
  "xopsyou-en": { es: "X-Ops for you", en: "X-Ops for you" },
  "xopsyou-es": { es: "X-Ops for you", en: "X-Ops for you" },
};
