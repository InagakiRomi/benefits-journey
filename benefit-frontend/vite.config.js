import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiOrigin = env.VITE_API_ORIGIN || 'http://localhost:8080'

  return {
  // 網站基底路徑，見 .env / .env.production 的 VITE_BASE_PATH
  base: env.VITE_BASE_PATH || (command === 'build' ? '/benefits-journey/' : '/'),
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
    server: {
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: apiOrigin,
          ws: true,
        },
      },
    },
  }
})
