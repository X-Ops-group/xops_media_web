#!/usr/bin/env bash
# Sincroniza el contenido aprobado desde el pipeline a src/content/<niche>/articles.json
# — un archivo por categoría (= nicho), "contenido como código" (ADR-004 D1).
# Correr desde un entorno con acceso Tailscale al endpoint articles-feed de n8n.
#
# Uso: ./scripts/sync-articles.sh
# Después: git add src/content && git commit && git push
#          (Vercel builda y despliega automáticamente al detectar el push)
set -euo pipefail
cd "$(dirname "$0")/.."

curl -sS --fail "http://100.126.250.117:5678/webhook/articles-feed" > /tmp/xops-media-feed.json

python3 <<'PYEOF'
import json

with open('/tmp/xops-media-feed.json') as f:
    data = json.load(f)

articles = data['articles']
by_niche = {}
for a in articles:
    by_niche.setdefault(a['niche_id'], []).append(a)

for niche, items in by_niche.items():
    path = f"src/content/{niche}/articles.json"
    with open(path, 'w') as f:
        json.dump({"articles": items}, f, ensure_ascii=False, indent=2)
    print(f"{path}: {len(items)} artículos")
PYEOF
