import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/sih-129/',
  plugins: [
    tailwindcss(),
    react(),
  ],
})