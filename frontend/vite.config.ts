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
          ui: ['axios'],
          // Utils chunk para utilidades
          utils: ['date-fns']
        }
      }
    },
    // Tamaño máximo de chunk
    chunkSizeWarningLimit: 1000,
    // Minificar para producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.logs en producción
        drop_debugger: true
      }
    }
  },
  // Optimizaciones de desarrollo
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
})