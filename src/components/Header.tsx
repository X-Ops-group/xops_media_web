import { Link } from "react-router-dom";
import { categoriesForLang, ROUTE_SEGMENTS, type Lang } from "../content";

export function Header({ lang }: { lang: Lang }) {
  const cats = categoriesForLang(lang);
  const otherLang: Lang = lang === "es" ? "en" : "es";
  const seg = ROUTE_SEGMENTS[lang];
  return (
    <header style={{ borderBottom: "1px solid var(--surface-0)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.1rem 1.5rem 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to={`/${lang}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img src="/logo.jpeg" alt="X-Ops Media" style={{ height: 34, borderRadius: 6 }} />
            <span style={{ fontWeight: 700, letterSpacing: "-0.01em", fontSize: "1.1rem" }}>X-Ops Media</span>
          </Link>
          <Link
            to={`/${otherLang}`}
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              border: "1px solid var(--surface-0)",
              borderRadius: 6,
              padding: "0.3rem 0.6rem",
            }}
          >
            {otherLang === "es" ? "Español" : "English"}
          </Link>
        </div>
        <nav style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", paddingBottom: "0.85rem", fontSize: "0.9rem" }}>
          <Link to={`/${lang}`} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {lang === "es" ? "Portada" : "Home"}
          </Link>
          {cats.map((c) => (
            <Link
              key={c.id}
              to={`/${lang}/${seg.category}/${lang === "es" ? c.slugEs : c.slugEn}`}
              style={{ color: "var(--text-secondary)" }}
            >
              {lang === "es" ? c.labelEs : c.labelEn}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
