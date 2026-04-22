import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Optimizaciones de build
    rollupOptions: {
      output: {
        // Separar chunks para mejor caching
        manualChunks: {
          // Vendor chunk para librerías de terceros
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI chunk para componentes de UI
          ui: ['axios']
        }
      }
    },
    // Tamaño máximo de chunk
    chunkSizeWarningLimit: 1000,
    // Minificar para producción
    minify: 'esbuild',
  },
  // Optimizaciones de desarrollo
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
})