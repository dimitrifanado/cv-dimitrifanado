import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// Build : `base` adapté au dépôt GitHub Pages. Pré-bundling des deps lourdes (export PDF).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/cv-dimitrifanado/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Évite deux copies de React en dev (Invalid hook call / useState sur null).
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'html-to-image', 'jspdf'],
  },
}))
