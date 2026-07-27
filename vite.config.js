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
        name: 'MEHFIL ONE',
        short_name: 'MEHFIL',
        description: 'Premium event space and venue booking platform for elite gatherings.',
        theme_color: '#dc2626',
        background_color: '#242424',
        display: 'standalone',
        start_url: '/',
        id: '/',
        icons: [
          {
            src: '/Mehfil_One.png',
            sizes: '500x500',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/Mehfil_One.png',
            sizes: '500x500',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/Web_screen.png',
            sizes: '1599x762',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Mehfil One Desktop View'
          },
          {
            src: '/Mobile_screen.jpeg',
            sizes: '1080x2149',
            type: 'image/jpeg',
            label: 'Mehfil One Mobile View'
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
    open: true,
    host: true
  }
})
