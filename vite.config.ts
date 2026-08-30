/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: relativ, damit der Build sowohl unter GitHub Pages (Unterpfad)
// als auch lokal per file:// / beliebigem Unterordner funktioniert.
export default defineConfig({
  base: './',
  plugins: [react()],
  worker: { format: 'es' },
  test: {
    // Die Invarianten-Tests fahren zehntausende Züge — großzügig bemessen, damit
    // sie auf langsameren Rechnern nicht am Zeitlimit scheitern.
    testTimeout: 30_000,
  },
});
