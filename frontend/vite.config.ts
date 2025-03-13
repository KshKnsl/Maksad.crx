import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { writeFileSync, copyFileSync, mkdirSync } from 'fs'

// Plugin to copy extension files
const copyExtensionFiles = () => {
  return {
    name: 'copy-extension-files',
    closeBundle: () => {
      // Ensure directories exist
      try {
        mkdirSync('dist/icons', { recursive: true })
      } catch (err) {
        console.error('Error creating directories:', err)
      }

      // Copy files
      try {
        copyFileSync('public/manifest.json', 'dist/manifest.json')
        copyFileSync('public/styles.css', 'dist/styles.css')
        copyFileSync('public/icons/icon16.png', 'dist/icons/icon16.png')
        copyFileSync('public/icons/icon48.png', 'dist/icons/icon48.png')
        copyFileSync('public/icons/icon128.png', 'dist/icons/icon128.png')
      } catch (err) {
        console.error('Error copying files:', err)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        contentScript: resolve(__dirname, 'src/content/contentScript.ts'),
        background: resolve(__dirname, 'src/background/background.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'contentScript') {
            return 'contentScript.js'
          }
          if (chunkInfo.name === 'background') {
            return 'background.js'
          }
          return '[name].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
