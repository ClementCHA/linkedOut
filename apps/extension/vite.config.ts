import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { copyFileSync, mkdirSync } from 'node:fs'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyDirBeforeWrite: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.ts'),
        background: resolve(__dirname, 'src/background/index.ts'),
        'popup/popup': resolve(__dirname, 'src/popup/popup.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
    target: 'esnext',
    minify: false,
  },
  publicDir: 'public',
  plugins: [
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Copy popup HTML and CSS
        mkdirSync(resolve(__dirname, 'dist/popup'), { recursive: true })
        copyFileSync(
          resolve(__dirname, 'src/popup/index.html'),
          resolve(__dirname, 'dist/popup/index.html')
        )
        copyFileSync(
          resolve(__dirname, 'src/popup/popup.css'),
          resolve(__dirname, 'dist/popup/popup.css')
        )
        // Copy content styles
        mkdirSync(resolve(__dirname, 'dist/styles'), { recursive: true })
        copyFileSync(
          resolve(__dirname, 'src/styles/content.css'),
          resolve(__dirname, 'dist/styles/content.css')
        )
      },
    },
  ],
})
