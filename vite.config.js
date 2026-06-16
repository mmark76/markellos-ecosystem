import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: `${rootDirectory}index.html`,
        privacy: `${rootDirectory}privacy/index.html`,
        cookies: `${rootDirectory}cookies/index.html`,
      },
    },
  },
});
