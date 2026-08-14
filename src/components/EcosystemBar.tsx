import { Link } from "react-router-dom";
import { type Lang } from "../content";
import { loadConference } from "../content";

const EXTERNAL = "noopener noreferrer";

interface Slot {
  /** Short label shown in the bar (e.g. "Media"). */
  label: string;
  /** Optional sub-label shown beside the label on wide screens. */
  hint?: string;
  /**
   * Internal route (relative to the locale root, starting with `/`). When
   * present, the slot renders as a `<Link>`. When absent, it renders as an
   * external `<a>` (used by Tools → GitHub).
   */
  internalTo?: string;
  /** Fully-qualified external URL — used when `internalTo` is absent. */
  externalHref?: string;
  /** True for the slot that owns the current page (Media, on this site). */
  active?: boolean;
}

/**
 * Horizontal strip above the masthead that exposes X-Ops Group's sibling
 * services. Four slots per the wireframe: Media · Conference · Consulting ·
 * Tools. The fifth wireframe slot (Academy) is deliberately out of scope —
 * the audit report itself conditions Academy to "audiencia recurrente
 * demostrada", which doesn't exist yet.
 *
 * The Tools slot is a reserved placeholder that links to the GitHub
 * organisation — a credibility anchor ("código propio = credibilidad
 * técnica superior a solo opinar sobre el trabajo de otros", per the
 * audit). When real tools land under that org, the URL stays stable.
 */
export function EcosystemBar({ lang }: { lang: Lang }) {
  const isEs = lang === "es";
  const conf = loadConference();

  const slots: Slot[] = [
    {
      label: isEs ? "Media" : "Media",
      hint: isEs ? "Publicación editorial" : "Editorial publication",
      internalTo: `/${lang}`,
      active: true,
    },
    {
      label: isEs ? "Conferencia" : "Conference",
      hint: conf.next_edition.date
        ? `${conf.next_edition.date} · ${conf.next_edition.location}`
        : undefined,
      externalHref: conf.links.main,
    },
    {
      label: isEs ? "Consultoría" : "Consulting",
      hint: isEs ? "Servicios y field notes" : "Services & field notes",
      externalHref: "https://xops-consulting.com",
    },
    {
      label: isEs ? "Herramientas" : "Tools",
      hint: isEs ? "Código en GitHub" : "Code on GitHub",
      externalHref: "https://github.com/xops",
    },
  ];

  return (
    <div
      role="navigation"
      aria-label={isEs ? "Ecosistema X-Ops Group" : "X-Ops Group ecosystem"}
      style={{
        background: "var(--surface-1)",
        borderBottom: "1px solid var(--surface-0)",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0.35rem 1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.25rem",
          fontSize: "0.78rem",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "0 0.75rem",
            display: "inline-flex",
            alignItems: "center",
            minHeight: 32,
          }}
        >
          {isEs ? "X-Ops Group" : "X-Ops Group"}
        </span>

        {slots.map((s) => {
          const baseStyle = {
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            minHeight: 32,
            padding: "0.25rem 0.75rem",
            borderRadius: 6,
            color: s.active ? "var(--text-primary)" : "var(--text-secondary)",
            background: s.active ? "var(--surface-2)" : "transparent",
            fontWeight: s.active ? 600 : 400,
            textDecoration: "none",
            fontSize: "0.78rem",
          } as const;

          const content = (
            <>
              <span>{s.label}</span>
              {s.hint && (
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.72rem",
                    display: "inline-block",
                  }}
                  className="ecosystem-bar-hint"
                >
                  {s.hint}
                </span>
              )}
            </>
          );

          if (s.internalTo) {
            return (
              <Link
                key={s.label}
                to={s.internalTo}
                aria-current={s.active ? "page" : undefined}
                style={baseStyle}
              >
                {content}
              </Link>
            );
          }

          return (
            <a
              key={s.label}
              href={s.externalHref}
              target="_blank"
              rel={EXTERNAL}
              style={baseStyle}
            >
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}