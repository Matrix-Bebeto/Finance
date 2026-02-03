import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Finance/', // para GitHub Pages (repo Matrix-Bebeto/Finance)
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // agora "@/..." aponta para "src/..."
    },
  },
  plugins: [react()],
})

