import { loadConference, type Lang } from "../content";

const EXTERNAL = "noopener noreferrer";

/**
 * Tira horizontal que cruza la portada (Task 16 Step 7 / Task 38).
 * Lee de `src/content/conference.json` y muestra el evento próximo + las 3
 * charlas más recientes. Si el JSON está ausente o vacío, no renderiza nada
 * (la cabecera / footer siguen siendo suficientes).
 *
 * Visualmente coherente con la columna "Conference" del Footer: mismo
 * `event_name`, mismo ritmo de tipografía, mismo color de acento en el CTA.
 * Variante apaisada: banner arriba + 3 tarjetas en grid.
 */
export function ConferenceRail({ lang }: { lang: Lang }) {
  const conf = loadConference();
  if (!conf || !conf.recent_talks || conf.recent_talks.length === 0) return null;

  const edition = conf.next_edition;
  const ctaLabel = lang === "es" ? "Enviar charla" : "Submit talk";
  const editionLabel = lang === "es" ? "Próxima edición" : "Next edition";
  const dateLabel = new Date(edition.date).toLocaleDateString(
    lang === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const talksLabel = lang === "es"
    ? "Charlas recientes de X-Ops Conference"
    : "Recent talks from X-Ops Conference";

  const talks = conf.recent_talks.slice(0, 3);

  return (
    <aside
      aria-label={talksLabel}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--surface-0)",
        borderRadius: 12,
        padding: "1.25rem 1.4rem 1.4rem",
        margin: "0 0 1.75rem",
      }}
    >
      {/* Banner superior con la próxima edición */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--surface-0)",
          marginBottom: "1rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--media-accent-light)",
              marginBottom: "0.25rem",
            }}
          >
            {editionLabel}
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: 1.3 }}>
            {conf.event_name} · {edition.location}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
            {dateLabel}
          </div>
        </div>
        <a
          href={edition.cfp_url || conf.links.cfp}
          target="_blank"
          rel={EXTERNAL}
          style={{
            display: "inline-block",
            background: "var(--media-accent)",
            color: "#fff",
            fontSize: "0.85rem",
            fontWeight: 600,
            padding: "0.55rem 0.95rem",
            borderRadius: 6,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {ctaLabel}
        </a>
      </div>

      {/* 3 charlas más recientes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.85rem",
        }}
      >
        {talks.map((talk, i) => (
          <a
            key={`${talk.date}-${i}`}
            href={talk.video_url}
            target="_blank"
            rel={EXTERNAL}
            style={{
              display: "block",
              padding: "0.75rem 0.85rem",
              background: "var(--surface-2)",
              border: "1px solid var(--surface-0)",
              borderRadius: 8,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <div style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.35, marginBottom: "0.35rem" }}>
              {talk.title}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {talk.speaker} · {new Date(talk.date).toLocaleDateString(
                lang === "es" ? "es-ES" : "en-US",
                { year: "numeric", month: "short", day: "numeric" },
              )}
            </div>
          </a>
        ))}
      </div>
    </aside>
  );
}