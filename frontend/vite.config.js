import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
// 1. Importa o plugin para carregar SVGs como componentes React
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 2. Adiciona o plugin SVGR à lista de plugins
    svgr({ 
      // Esta configuração opcional ajuda a manter a capacidade de mudar a cor com 'currentColor'
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})