import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://x-ops-group.github.io/xops-media-web/
export default defineConfig({
  base: '/xops-media-web/',
  plugins: [react()],
})
