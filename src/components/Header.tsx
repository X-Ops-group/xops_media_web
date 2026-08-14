import { Link } from "react-router-dom";
import { categoriesForLang, ROUTE_SEGMENTS, type Lang } from "../content";
import { EcosystemBar } from "./EcosystemBar";

// Bilingual route segments for the editorial series routes. Mirrors the
// `SEGMENTS` constant in `App.tsx` (Task 35 owns that one); duplicated here
// because importing from `App.tsx` would create a circular dependency —
// `App.tsx` already imports our pages. Keep the values in sync.
const SERIES_SEGMENTS: Record<Lang, { weeklyBrief: string; exploitWatch: string }> = {
  en: { weeklyBrief: "weekly-brief", exploitWatch: "exploit-watch" },
  es: { weeklyBrief: "resumen-semanal", exploitWatch: "exploits-activos" },
};

export function Header({ lang }: { lang: Lang }) {
  const cats = categoriesForLang(lang);
  const otherLang: Lang = lang === "es" ? "en" : "es";
  const seg = ROUTE_SEGMENTS[lang];
  const seriesSeg = SERIES_SEGMENTS[lang];

  const isEs = lang === "es";

  // ≥44×44px touch target per H9 audit. Used on every primary nav link.
  const navLinkBase = {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 44,
    padding: "0 0.75rem",
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
    textDecoration: "none",
  } as const;

  return (
    <>
      {/* Skip link — visible only on keyboard focus. The plan calls this out
          explicitly (Task 14 Step 5): there isn't one today and it's an
          accessibility regression for screen-reader / keyboard users. */}
      <a href="#main" className="skip-link">
        {isEs ? "Saltar al contenido" : "Skip to content"}
      </a>

      <header style={{ borderBottom: "1px solid var(--surface-0)" }}>
        {/* Ecosystem bar: Media · Conference · Consulting · Tools. Lives above
            the editorial masthead so the user always sees the sibling services
            before diving into the publication. */}
        <EcosystemBar lang={lang} />

        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "1.1rem 1.5rem 0",
          }}
        >
          {/* Masthead row: brand + lang switcher. Brand links to the locale
              home (`/${lang}`), not the first category — the wireframe
              explicitly says the masthead is the publication's front door. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <Link
              to={`/${lang}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
              aria-label={isEs ? "X-Ops Media, ir a la portada" : "X-Ops Media, go to home"}
            >
              <img
                src="/logo.jpeg"
                alt=""
                style={{ height: 34, borderRadius: 6 }}
              />
              <span
                style={{
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  fontSize: "1.1rem",
                  fontFamily: "var(--font-serif)",
                }}
              >
                X-Ops Media
              </span>
            </Link>

            <Link
              to={`/${otherLang}`}
              aria-label={
                isEs ? "Cambiar idioma a inglés" : "Switch language to Spanish"
              }
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                border: "1px solid var(--surface-0)",
                borderRadius: 6,
                padding: "0.5rem 0.75rem",
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              {otherLang === "es" ? "Español" : "English"}
            </Link>
          </div>

          {/* Editorial nav. Five topics under the wireframe (legacy devsecops +
              x-ops categories plus the three utilitarian slots — see below),
              then a thin separator and the two recurring series (Weekly Brief,
              Exploit Watch) as the plan groups them. */}
          <nav
            aria-label={isEs ? "Navegación editorial" : "Editorial navigation"}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.25rem",
              marginTop: "1rem",
              paddingBottom: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <Link to={`/${lang}`} style={{ ...navLinkBase, color: "var(--text-primary)", fontWeight: 600 }}>
              {isEs ? "Portada" : "Home"}
            </Link>
            {cats.map((c) => (
              <Link
                key={c.id}
                to={`/${lang}/${seg.category}/${isEs ? c.slugEs : c.slugEn}`}
                style={navLinkBase}
              >
                {isEs ? c.labelEs : c.labelEn}
              </Link>
            ))}
            <Link
              to={`/${lang}/${seriesSeg.weeklyBrief}`}
              style={navLinkBase}
            >
              {isEs ? "Resumen semanal" : "Weekly Brief"}
            </Link>
            <Link
              to={`/${lang}/${seriesSeg.exploitWatch}`}
              style={navLinkBase}
            >
              {isEs ? "Exploits activos" : "Exploit Watch"}
            </Link>
          </nav>

          {/* Section divider before the utility row — visual rhythm that
              matches the wireframe grouping of "series" away from "topics". */}
          <div
            aria-hidden="true"
            style={{
              borderTop: "1px solid var(--surface-0)",
              marginTop: "0.25rem",
            }}
          />
        </div>
      </header>
    </>
  );
}