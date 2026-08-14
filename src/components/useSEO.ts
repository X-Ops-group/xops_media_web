import { useEffect } from "react";
import type { PageMeta } from "../seo";
import type { Lang } from "../content";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute(rel, rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeMetaByKey(attr: "name" | "property", key: string) {
  document.head.querySelectorAll(`meta[${attr}="${key}"]`).forEach((n) => n.remove());
}

function setJsonLd(objects: object[]) {
  document.querySelectorAll('script[data-seo-jsonld="1"]').forEach((n) => n.remove());
  for (const obj of objects) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoJsonld = "1";
    script.textContent = JSON.stringify(obj);
    document.head.appendChild(script);
  }
}

/**
 * Applies title / meta / canonical / hreflang / JSON-LD to <head>.
 * SPA-friendly, no external dependencies. Defensive: anything that looks like
 * raw HTML in `description` is escaped at write time (see `escapeAttr` in
 * `seo.ts`); never echo unescaped user content into meta tags.
 */
export function useSEO(meta: PageMeta, lang: Lang) {
  useEffect(() => {
    document.title = meta.title;
    document.documentElement.lang = lang;

    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", meta.canonical);
    setMeta("property", "og:site_name", "X-Ops Media");
    setMeta("property", "og:locale", lang === "es" ? "es_ES" : "en_US");
    if (meta.ogImage) {
      setMeta("property", "og:image", meta.ogImage);
    } else {
      removeMetaByKey("property", "og:image");
    }
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    if (meta.ogImage) {
      setMeta("name", "twitter:image", meta.ogImage);
    } else {
      removeMetaByKey("name", "twitter:image");
    }

    setLink("canonical", meta.canonical);
    setLink("alternate", meta.alternateUrl, lang === "es" ? "en" : "es");
    setLink("alternate", meta.canonical, lang);
    // x-default — falls back to the English mirror (homepage convention).
    setLink("alternate", `${meta.canonical.split("/").slice(0, 3).join("/")}/en`, "x-default");

    setJsonLd(meta.jsonLd);
  }, [meta, lang]);
}