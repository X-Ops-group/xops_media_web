import { Link } from "react-router-dom";
import { loadConference, type Lang } from "../content";

const EXTERNAL = "noopener noreferrer";

export function Footer({ lang }: { lang: Lang }) {
  const conf = loadConference();
  const year = new Date().getFullYear();

  // Placeholder target for routes that don't exist yet. Using the about page
  // keeps the link in-app; aria-disabled signals "this is a placeholder"
  // while keeping the focus ring for keyboard users.
  const soon = (label: string) => (
    <Link
      to={`/${lang}/about`}
      aria-disabled="true"
      title={
        lang === "es"
          ? "Próximamente — disponible en una próxima fase"
          : "Coming soon — available in a later phase"
      }
      style={{
        color: "var(--text-muted)",
        cursor: "not-allowed",
        textDecoration: "none",
      }}
      onClick={(e) => e.preventDefault()}
    >
      {label}
    </Link>
  );

  const linkStyle = {
    color: "var(--text-secondary)",
    textDecoration: "none",
  };
  const headingStyle = {
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    marginBottom: "0.75rem",
  };

  return (
    <footer
      style={{
        borderTop: "1px solid var(--surface-0)",
        marginTop: "3rem",
        padding: "2.5rem 1.5rem 1.5rem",
        background: "var(--surface-2)",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Column 1 — Media */}
        <nav aria-label="X-Ops Media" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
          <div style={headingStyle}>
            {lang === "es" ? "Media" : "Media"}
          </div>
          <Link to={`/${lang}/quienes-somos`} style={linkStyle}>
            {lang === "es" ? "Quiénes somos" : "About"}
          </Link>
          {soon(lang === "es" ? "Estándares" : "Standards")}
          {soon(lang === "es" ? "Correcciones" : "Corrections")}
          {soon(lang === "es" ? "Política de IA" : "AI Policy")}
          {soon(lang === "es" ? "Autores" : "Authors")}
          {soon(lang === "es" ? "Archivo" : "Archive")}
          <a href="/rss.xml" style={linkStyle} target="_blank" rel={EXTERNAL}>
            RSS
          </a>
        </nav>

        {/* Column 2 — Conference */}
        <nav aria-label="X-Ops Conference" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
          <div style={headingStyle}>
            {lang === "es" ? "Conferencia" : "Conference"}
          </div>
          <a href={conf.links.main} style={linkStyle} target="_blank" rel={EXTERNAL}>
            {lang === "es" ? "Web principal" : "Main site"}
          </a>
          <a href={conf.next_edition.cfp_url || conf.links.cfp} style={linkStyle} target="_blank" rel={EXTERNAL}>
            {lang === "es" ? "Call for Papers" : "CFP"}
          </a>
          <a href={conf.links.schedule} style={linkStyle} target="_blank" rel={EXTERNAL}>
            {lang === "es" ? "Programa" : "Schedule"}
          </a>
          <a href={conf.links.archive} style={linkStyle} target="_blank" rel={EXTERNAL}>
            {lang === "es" ? "Ediciones anteriores" : "Archive"}
          </a>
        </nav>

        {/* Column 3 — Consulting */}
        <nav aria-label="X-Ops Consulting" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
          <div style={headingStyle}>
            {lang === "es" ? "Consultoría" : "Consulting"}
          </div>
          <a href="https://xops-consulting.com" style={linkStyle} target="_blank" rel={EXTERNAL}>
            {lang === "es" ? "X-Ops Consulting" : "X-Ops Consulting"}
          </a>
          <a href="https://xops-consulting.com/services" style={linkStyle} target="_blank" rel={EXTERNAL}>
            {lang === "es" ? "Servicios" : "Services"}
          </a>
          <a href="https://xops-consulting.com/contact" style={linkStyle} target="_blank" rel={EXTERNAL}>
            {lang === "es" ? "Contacto" : "Contact"}
          </a>
        </nav>

        {/* Column 4 — Legal + Social */}
        <nav aria-label="Legal" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
          <div style={headingStyle}>
            {lang === "es" ? "Legal" : "Legal"}
          </div>
          <Link to={`/${lang}/legal`} style={linkStyle}>
            {lang === "es" ? "Aviso legal / Privacidad" : "Legal / Privacy"}
          </Link>
          <Link to={`/${lang}/cookies`} style={linkStyle}>
            {lang === "es" ? "Política de cookies" : "Cookie Policy"}
          </Link>
          <div style={{ ...headingStyle, marginTop: "0.75rem" }}>
            {lang === "es" ? "Social" : "Social"}
          </div>
          <a href="https://twitter.com/xopsmedia" style={linkStyle} target="_blank" rel={EXTERNAL}>
            Twitter
          </a>
          <a href="https://github.com/xops" style={linkStyle} target="_blank" rel={EXTERNAL}>
            GitHub
          </a>
        </nav>
      </div>

      <div
        style={{
          maxWidth: 960,
          margin: "2rem auto 0",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--surface-0)",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <span>© {year} X-Ops Media · {lang === "es" ? "Todos los derechos reservados" : "All rights reserved"}.</span>
        <span>X-Ops Group</span>
      </div>
    </footer>
  );
}
