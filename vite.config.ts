import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/',                // domínio próprio: finance.matrixwifi.com.br/
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'docs',         // build vai para docs/
  },
  plugins: [react()],
})

