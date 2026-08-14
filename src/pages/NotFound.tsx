import { Link } from "react-router-dom";
import type { Lang } from "../content";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function NotFound({ lang }: { lang: Lang }) {
  const isEs = lang === "es";
  return (
    <>
      <Header lang={lang} />
      {/* Skip link for keyboard users — same convention as the rest of the site. */}
      <a className="skip-link" href="#main">
        {isEs ? "Saltar al contenido" : "Skip to content"}
      </a>
      <main
        id="main"
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "3rem 1.5rem",
          minHeight: "60vh",
        }}
      >
        <p
          style={{
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            fontSize: "0.85rem",
            marginBottom: "0.5rem",
          }}
        >
          {isEs ? "404 / Página no encontrada" : "404 / Page not found"}
        </p>
        <h1
          style={{
            fontSize: "2rem",
            lineHeight: 1.2,
            marginBottom: "1rem",
          }}
        >
          {isEs
            ? "No encontramos esa página."
            : "We couldn't find that page."}
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {isEs
            ? "Puede que el enlace esté roto o que la URL haya cambiado. Vuelve a la portada o explora las categorías para encontrar lo que buscas."
            : "The link may be broken or the URL may have changed. Head back to the home page or browse the categories to find what you're looking for."}
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            to={`/${lang}`}
            style={{
              display: "inline-block",
              padding: "0.6rem 1rem",
              borderRadius: 6,
              background: "var(--media-accent)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {isEs ? "Ir a la portada" : "Go to the home page"}
          </Link>
          <Link
            to={`/${lang}/category/devsecops`}
            style={{
              display: "inline-block",
              padding: "0.6rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--text-muted)",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {isEs ? "Ver DevSecOps" : "Browse DevSecOps"}
          </Link>
          <Link
            to={`/${lang}/category/x-ops`}
            style={{
              display: "inline-block",
              padding: "0.6rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--text-muted)",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {isEs ? "Ver X-Ops" : "Browse X-Ops"}
          </Link>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
