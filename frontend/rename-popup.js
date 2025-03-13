import { rename } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  await rename(
    join(__dirname, 'dist', 'index.html'),
    join(__dirname, 'dist', 'popup.html')
  );
  console.log('Successfully renamed index.html to popup.html');
} catch (err) {
  console.error('Error renaming file:', err);
} 