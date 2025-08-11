import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
const iconsDir = path.join('public', 'icons');
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });
const createIcon = (size) => {
  const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4169E1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.4}" fill="white" text-anchor="middle" dominant-baseline="middle">MK</text>
</svg>`;
  writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
};
createIcon(16);
createIcon(48);
createIcon(128);
