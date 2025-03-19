import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';

function copyExtensionFiles() {
  return {
    name: 'copy-extension-files',
    writeBundle() {
      // Create dist directory if it doesn't exist
      try {
        mkdirSync('dist', { recursive: true });
      } catch (err) {
        console.error('Error creating dist directory:', err);
      }

      // Copy manifest.json
      try {
        copyFileSync('public/manifest.json', 'dist/manifest.json');
        console.log('manifest.json copied successfully');
      } catch (err) {
        console.error('Error copying manifest.json:', err);
      }

      // Copy icons
      try {
        mkdirSync('dist/icons', { recursive: true });
        
        // Check if icons exist in public/icons directory
        if (existsSync('public/icons/icon16.png')) {
          copyFileSync('public/icons/icon16.png', 'dist/icons/icon16.png');
          copyFileSync('public/icons/icon48.png', 'dist/icons/icon48.png');
          copyFileSync('public/icons/icon128.png', 'dist/icons/icon128.png');
          console.log('Icons copied successfully from public/icons');
        } 
        // Fallback to copy from public directory directly
        else if (existsSync('public/icon16.png')) {
          copyFileSync('public/icon16.png', 'dist/icons/icon16.png');
          copyFileSync('public/icon48.png', 'dist/icons/icon48.png');
          copyFileSync('public/icon128.png', 'dist/icons/icon128.png');
          console.log('Icons copied successfully from public directory');
        } 
        // Create placeholder icons if none exist
        else {
          console.warn('No icons found! Creating placeholder icons...');
          // Create basic SVG icons and save them as PNG
          const createPlaceholderIcon = (size) => {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
              <rect width="${size}" height="${size}" fill="#1976d2"/>
              <text x="50%" y="50%" font-family="Arial" font-size="${size/2.5}" fill="white" text-anchor="middle" dominant-baseline="middle">MK</text>
            </svg>`;
            writeFileSync(`dist/icons/icon${size}.png`, svg);
          };
          
          createPlaceholderIcon(16);
          createPlaceholderIcon(48);
          createPlaceholderIcon(128);
        }
      } catch (err) {
        console.error('Error handling icons:', err);
      }

      // Copy styles.css
      try {
        copyFileSync('public/styles.css', 'dist/styles.css');
        console.log('styles.css copied successfully');
      } catch (err) {
        console.error('Error copying styles.css:', err);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
        contentScript: path.resolve(__dirname, 'src/content/contentScript.ts'),
        background: path.resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'contentScript') {
            return 'contentScript.js';
          }
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    minify: false,
    assetsDir: 'assets',
  },
});
