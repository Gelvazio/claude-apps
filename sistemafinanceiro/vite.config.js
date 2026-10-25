import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      input: ['index.html', 'login.html']
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
