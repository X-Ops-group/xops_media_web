import { useEffect, useRef } from "react";

/**
 * Espacio publicitario. Tres variantes, calcadas del patrón de El Correo del
 * Golfo (elcorreo.ae): leaderboard arriba de todo, native intercalado en el
 * feed cada N tarjetas, e in-article a mitad del cuerpo del artículo.
 *
 * El script de AdSense (index.html) ya activa "Auto ads" en todo el sitio con
 * solo el client ID — Google coloca anuncios por su cuenta sin código extra
 * acá. Estos AdSlot son para posiciones manuales y precisas; cada uno necesita
 * su propio "ad slot" (creado en el dashboard de AdSense, un ID numérico por
 * unidad) para renderizar un <ins class="adsbygoogle"> real. Sin ese ID
 * específico se muestra un placeholder honesto — no bloquea el revenue de
 * Auto ads, solo esta posición manual en particular.
 */
type AdVariant = "leaderboard" | "native" | "in-article";

const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined) ?? "ca-pub-5525157068767516";
const AMAZON_TAG = import.meta.env.VITE_AMAZON_ASSOCIATES_TAG as string | undefined;

const SLOT_IDS: Record<AdVariant, string | undefined> = {
  leaderboard: import.meta.env.VITE_ADSENSE_SLOT_LEADERBOARD as string | undefined,
  native: import.meta.env.VITE_ADSENSE_SLOT_NATIVE as string | undefined,
  "in-article": import.meta.env.VITE_ADSENSE_SLOT_INARTICLE as string | undefined,
};

const DIMENSIONS: Record<AdVariant, { minHeight: number; label: string }> = {
  leaderboard: { minHeight: 90, label: "728×90 / responsive leaderboard" },
  native: { minHeight: 120, label: "Anuncio nativo en el feed" },
  "in-article": { minHeight: 250, label: "300×250 in-article" },
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function GoogleAdUnit({ slotId, variant, id }: { slotId: string; variant: AdVariant; id: string }) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense todavía no cargó (bloqueado por adblock, script no llegó, etc.) — no romper la página.
    }
  }, []);

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: "block", minHeight: DIMENSIONS[variant].minHeight, margin: variant === "leaderboard" ? "0 0 1.5rem" : "1.25rem 0" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-ad-region={id}
    />
  );
}

export function AdSlot({ variant, id }: { variant: AdVariant; id: string }) {
  const slotId = SLOT_IDS[variant];
  if (slotId) {
    return <GoogleAdUnit slotId={slotId} variant={variant} id={id} />;
  }

  const configured = Boolean(ADSENSE_CLIENT) || Boolean(AMAZON_TAG);
  const { minHeight, label } = DIMENSIONS[variant];

  return (
    <div
      data-ad-slot={id}
      data-ad-variant={variant}
      style={{
        minHeight,
        margin: variant === "leaderboard" ? "0 0 1.5rem" : "1.25rem 0",
        borderRadius: 10,
        border: "1px dashed var(--surface-0)",
        background: "rgba(255,255,255,0.02)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {configured
        ? `Publicidad — ${label} (falta el slot ID de AdSense para esta posición)`
        : `Publicidad (${label}) — falta VITE_ADSENSE_CLIENT_ID / VITE_AMAZON_ASSOCIATES_TAG`}
    </div>
  );
}
