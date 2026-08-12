import type { Lang } from "../content";

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer style={{ borderTop: "1px solid var(--surface-0)", marginTop: "3rem", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} X-Ops Media.{" "}
          {lang === "es" ? "Todos los derechos reservados." : "All rights reserved."}
        </div>
        <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          <span>{lang === "es" ? "Quiénes somos" : "About"}</span>
          <span>{lang === "es" ? "Publicidad" : "Advertise"}</span>
          <span>{lang === "es" ? "Aviso legal" : "Legal"}</span>
        </div>
      </div>
    </footer>
  );
}
