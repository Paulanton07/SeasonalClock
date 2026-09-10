import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the project from /<repo-name>/, so the base path
  // must match the repository name for asset URLs to resolve correctly.
  base: '/SeasonalClock/',
  plugins: [react(), tailwindcss()],
})
