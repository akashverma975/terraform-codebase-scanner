import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Optimize output for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for now
        drop_debugger: true
      }
    }
  }
})
