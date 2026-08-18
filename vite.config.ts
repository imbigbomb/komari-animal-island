import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function bundleAnimalAssets() {
  return {
    name: 'bundle-animal-island-assets',
    async writeBundle(options: { dir?: string }) {
      const output = resolve(options.dir ?? 'dist');
      await cp(resolve('node_modules/animal-island-ui/dist/files'), resolve(output, 'files'), { recursive: true });
      const assets = resolve(output, 'assets');
      for (const file of await readdir(assets)) {
        if (!file.endsWith('.css')) continue;
        const path = resolve(assets, file);
        const css = await readFile(path, 'utf8');
        await writeFile(path, css.replaceAll('../../../files/', '../files/'));
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), bundleAnimalAssets()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
});
