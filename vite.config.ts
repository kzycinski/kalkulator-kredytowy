/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
    server: {
      port: 5173,
      host: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      globals: true,
    },
  }
})
