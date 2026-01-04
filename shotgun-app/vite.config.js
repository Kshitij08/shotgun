import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@reown/appkit/react',
      '@reown/appkit-adapter-ethers',
      '@reown/appkit/networks',
      '@base-org/account'
    ],
    force: true // Force re-optimization on startup
  }
})
