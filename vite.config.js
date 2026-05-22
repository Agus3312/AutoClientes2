import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-vendor': ['html2pdf.js'],
          'maps-vendor': ['@react-google-maps/api'],
          'charts-vendor': ['recharts'],
        },
      },
    },
  },
})
