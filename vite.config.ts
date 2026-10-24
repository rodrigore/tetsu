/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the site at /tetsu/
export default defineConfig({
  base: '/tetsu/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tetsu',
        short_name: 'Tetsu',
        description: 'Barbell load calculator: PR % to plates per side.',
        theme_color: '#0E0D0C',
        background_color: '#0E0D0C',
        display: 'standalone',
        start_url: '/tetsu/',
        scope: '/tetsu/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
})
