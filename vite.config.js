import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configure Vite to transform JSX inside .js files.
// - esbuild.loader = 'jsx' so the dev server parses .js as JSX
// - plugin-react include pattern ensures plugin runs on .js files too
// - optimizeDeps.esbuildOptions.loader used for dependency scanning/pre-bundling
export default defineConfig({
  plugins: [
    react({ include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'] })
  ],
  esbuild: {
    loader: 'jsx'
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" }
    }
  }
})
