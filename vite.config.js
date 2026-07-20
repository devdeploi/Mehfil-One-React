import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.glb'],
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['Mehfil_One.png', 'mask-icon.svg'],
      manifest: {
        name: 'MEHFIL-ONE',
        short_name: 'MEHFIL',
        description: 'MEHFIL-ONE PWA Web App',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/Mehfil_One.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Mehfil_One.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/Mehfil_One.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      }
    })
  ],
  optimizeDeps: {
    include: ['socket.io-client', 'engine.io-client']
  },
  server: {
    open: true
  }
})
