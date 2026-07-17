import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // Served at https://meteorboyf.github.io/Interview-Prep/sql-trainer/ in production;
  // CI sets BASE_PATH. Local dev/preview default to root.
  base: process.env.BASE_PATH ?? '/',
  plugins: [svelte()],
  // sql.js ships a CommonJS/UMD build; pre-bundle it so the module worker
  // can import it as ESM in dev.
  optimizeDeps: {
    include: ['sql.js']
  },
  build: {
    target: 'es2020'
  },
  worker: {
    format: 'es'
  }
});
