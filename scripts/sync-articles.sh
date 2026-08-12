#!/usr/bin/env bash
# Sincroniza content/articles.json desde el pipeline (content_factory.articles,
# status='approved') al repo — "contenido como código" (ADR-004 D1). Correr
# desde un entorno con acceso Tailscale al endpoint articles-feed de n8n.
#
# Uso: ./scripts/sync-articles.sh
# Después: git add src/content/articles.json && git commit && git push
#          (Vercel builda y despliega automáticamente al detectar el push)
set -euo pipefail
cd "$(dirname "$0")/.."
curl -sS --fail "http://100.126.250.117:5678/webhook/articles-feed" \
  | python3 -m json.tool > src/content/articles.json
echo "Escrito src/content/articles.json ($(python3 -c "import json;print(len(json.load(open('src/content/articles.json'))['articles']))") artículos)"
