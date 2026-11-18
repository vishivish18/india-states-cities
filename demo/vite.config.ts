import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Served from https://<user>.github.io/india-states-cities/ — override with DEMO_BASE for other hosts.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: process.env.DEMO_BASE ?? '/india-states-cities/',
  plugins: [react()],
  resolve: {
    alias: {
      // The demo uses the package source directly, so it always shows the current code.
      '@vishivish18/india-states-cities/react': fileURLToPath(new URL('../src/react.ts', import.meta.url)),
      '@vishivish18/india-states-cities': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
  build: { outDir: fileURLToPath(new URL('../demo-dist', import.meta.url)), emptyOutDir: true },
});
