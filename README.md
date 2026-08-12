# X-Ops Media

Sitio bilingüe (EN/ES) de X-Ops Media — CMSOps: contenido como código (ver ADR-004, `hsm-ops/n8n/workflows/content-factory/ADR-004-cmsops-editorial-pipeline.md`, D1/D7).

## Cómo funciona

Los artículos **no** se cargan en vivo desde el pipeline — se sincronizan a `src/content/articles.json` y se comitean al repo. Vercel builda y despliega automáticamente en cada push a `main`.

```bash
./scripts/sync-articles.sh   # trae los artículos status='approved' del pipeline
git add src/content/articles.json
git commit -m "Sync articles"
git push                     # Vercel despliega solo
```

`sync-articles.sh` necesita alcanzar `100.126.250.117:5678` (Tailscale) — correrlo desde un entorno dentro del tailnet.

## Deploy

Vercel, conectado a este repo de GitHub (mismo patrón que `xopsmainpage-react` / `xops_alliance_web` / `xops_consulting_web`). Sin build steps especiales — Vercel detecta Vite automáticamente. `vercel.json` solo agrega el rewrite de SPA para que las rutas de `react-router` (`/articulo/:slug`, `/es/articulo/:slug`) funcionen en acceso directo.

## Desarrollo local

```bash
npm install
npm run dev
```
