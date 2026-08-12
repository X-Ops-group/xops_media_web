/**
 * Espacio publicitario. Tres variantes, calcadas del patrón de El Correo del
 * Golfo (elcorreo.ae): leaderboard arriba de todo, native intercalado en el
 * feed cada N tarjetas, e in-article a mitad del cuerpo del artículo.
 *
 * Google AdSense y Amazon Associates se configuran por variable de entorno —
 * sin esos IDs reales, se renderiza un placeholder visible (nunca un <script>
 * vacío que rompa el layout en producción sin avisar).
 */
type AdVariant = "leaderboard" | "native" | "in-article";

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined;
const AMAZON_TAG = import.meta.env.VITE_AMAZON_ASSOCIATES_TAG as string | undefined;

const DIMENSIONS: Record<AdVariant, { minHeight: number; label: string }> = {
  leaderboard: { minHeight: 90, label: "728×90 / responsive leaderboard" },
  native: { minHeight: 120, label: "Anuncio nativo en el feed" },
  "in-article": { minHeight: 250, label: "300×250 in-article" },
};

export function AdSlot({ variant, id }: { variant: AdVariant; id: string }) {
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
        ? `Publicidad — ${label}` /* aquí se monta el <ins class="adsbygoogle"> real o el widget de Amazon */
        : `Publicidad (${label}) — falta VITE_ADSENSE_CLIENT_ID / VITE_AMAZON_ASSOCIATES_TAG`}
    </div>
  );
}
