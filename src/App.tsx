import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { Category } from "./pages/Category";
import { ArticlePage } from "./pages/ArticlePage";
import { NotFound } from "./pages/NotFound";
import { AuthorsPage } from "./pages/AuthorsPage";
import { AuthorDetailPage } from "./pages/AuthorDetailPage";
import { SeriesPage } from "./pages/SeriesPage";
import { BriefArchivePage } from "./pages/BriefArchivePage";
import { BriefPage } from "./pages/BriefPage";
import { ExploitWatchPage } from "./pages/ExploitWatchPage";
import "./theme.css";
import type { Lang } from "./content";

// Inline stubs for pages that other agents own (Tasks 38–42). Each stub keeps
// the route alive so links/SEO work end-to-end while the owning agent fills
// in the real component. They render a small bilingual placeholder.
const Stub = ({ name, lang }: { name: string; lang: Lang }) => (
  <div className="page-stub" style={{ padding: "2rem 1.5rem", maxWidth: 720, margin: "0 auto" }}>
    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
      {lang === "es" ? "Próximamente" : "Coming soon"}
    </p>
    <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{name}</h1>
    <p style={{ color: "var(--text-secondary)" }}>
      {lang === "es"
        ? "Esta página está pendiente de implementación."
        : "This page is pending implementation."}
    </p>
  </div>
);

// Per-language route segments. Hardcoded here (not in content.ts) because
// ROUTE_SEGMENTS is still owned by the content layer; if we add new keys to it
// here we risk colliding with whoever extends it next. Other agents (Tasks 40,
// 41, 42) should reuse these constants when they read segments back.
const SEGMENTS = {
  en: {
    category: "category",
    article: "article",
    authors: "authors",
    author: "author",
    about: "about",
    methodology: "methodology",
    ethics: "ethics",
    contact: "contact",
    weeklyBrief: "weekly-brief",
    exploitWatch: "exploit-watch",
    series: "series",
    tags: "tags",
    archive: "archive",
    conference: "conference",
  },
  es: {
    category: "categoria",
    article: "articulo",
    authors: "autores",
    author: "autor",
    about: "quienes-somos",
    methodology: "metodologia",
    ethics: "etica",
    contact: "contacto",
    weeklyBrief: "resumen-semanal",
    exploitWatch: "exploits-activos",
    series: "serie",
    tags: "etiqueta",
    archive: "archivo",
    conference: "conferencia",
  },
} as const;

// Detects the intended locale for an unmatched path so the 404 page reads in
// the right language even when nothing under /en or /es matched (T39 F1).
function detectLang(pathname: string): Lang {
  return pathname.startsWith("/es") ? "es" : "en";
}

// Wrapper so the wildcard route can read the current path (Route.element is
// constructed once, outside render, so it can't take pathname as a prop).
function NotFoundRoute() {
  const location = useLocation();
  return <NotFound lang={detectLang(location.pathname)} />;
}

// 16 routes per language (EN + ES) + the bare-locale redirect + a 404 wildcard.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en" replace />} />

      {/* EN */}
      <Route path={`/en/${SEGMENTS.en.category}/:slug`} element={<Category lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.article}/:slug`} element={<ArticlePage lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.authors}`} element={<AuthorsPage lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.author}/:slug`} element={<AuthorDetailPage lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.about}`} element={<Stub name="About" lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.methodology}`} element={<Stub name="Methodology" lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.ethics}`} element={<Stub name="Ethics" lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.contact}`} element={<Stub name="Contact" lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.weeklyBrief}`} element={<BriefArchivePage lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.weeklyBrief}/:edition`} element={<BriefPage lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.exploitWatch}`} element={<ExploitWatchPage lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.series}/:format`} element={<SeriesPage lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.tags}/:tag`} element={<Stub name="Tag" lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.archive}`} element={<Stub name="Archive" lang="en" />} />
      <Route path={`/en/${SEGMENTS.en.conference}`} element={<Stub name="Conference" lang="en" />} />
      <Route path="/en" element={<Home lang="en" />} />

      {/* ES */}
      <Route path={`/es/${SEGMENTS.es.category}/:slug`} element={<Category lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.article}/:slug`} element={<ArticlePage lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.authors}`} element={<AuthorsPage lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.author}/:slug`} element={<AuthorDetailPage lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.about}`} element={<Stub name="Quiénes somos" lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.methodology}`} element={<Stub name="Metodología" lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.ethics}`} element={<Stub name="Ética" lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.contact}`} element={<Stub name="Contacto" lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.weeklyBrief}`} element={<BriefArchivePage lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.weeklyBrief}/:edition`} element={<BriefPage lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.exploitWatch}`} element={<ExploitWatchPage lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.series}/:format`} element={<SeriesPage lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.tags}/:tag`} element={<Stub name="Etiqueta" lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.archive}`} element={<Stub name="Archivo" lang="es" />} />
      <Route path={`/es/${SEGMENTS.es.conference}`} element={<Stub name="Conferencia" lang="es" />} />
      <Route path="/es" element={<Home lang="es" />} />

      {/* 404 wildcard — a single catch-all, declared last, after every named
          route. The previous /en/* and /es/* wildcards shadowed every named
          locale-scoped route (declared before the named routes above, and a
          "/*" wildcard ranks no lower than a fully static named route in
          React Router's specificity scoring) — /en/exploit-watch and every
          other /en/<slug> route 404'd (T39 F1). One wildcard, last, fixes
          it: named routes above always win because they're strictly more
          specific than "*". */}
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}
