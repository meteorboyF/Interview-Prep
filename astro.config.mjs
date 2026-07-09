// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// GitHub Pages project site: https://meteorboyf.github.io/Interview-Prep
// `site` + `base` make all internal links resolve correctly under the sub-path.
// Override locally with `BASE_PATH=/` for a root-served preview if desired.
const base = process.env.BASE_PATH ?? '/Interview-Prep';

export default defineConfig({
  site: 'https://meteorboyf.github.io',
  base,
  trailingSlash: 'ignore',
  integrations: [svelte()],
  markdown: {
    shikiConfig: {
      // Dual themes so we can swap via CSS variables for dark/light mode.
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: false,
    },
  },
  vite: {
    resolve: {
      // Silence noisy sourcemap warnings from Svelte in dev.
      dedupe: ['svelte'],
    },
  },
});
