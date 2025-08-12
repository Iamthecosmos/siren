#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 PWA Icon Generation Script');
console.log('=============================');
console.log('');
console.log('To generate PNG icons from the SVG:');
console.log('');
console.log('1. Use an online converter:');
console.log('   - Go to https://convertio.co/svg-png/');
console.log('   - Upload public/icons/icon.svg');
console.log('   - Convert to PNG');
console.log('');
console.log('2. Use ImageMagick (if installed):');
console.log('   magick public/icons/icon.svg -resize 72x72 public/icons/icon-72x72.png');
console.log('   magick public/icons/icon.svg -resize 96x96 public/icons/icon-96x96.png');
console.log('   magick public/icons/icon.svg -resize 128x128 public/icons/icon-128x128.png');
console.log('   magick public/icons/icon.svg -resize 144x144 public/icons/icon-144x144.png');
console.log('   magick public/icons/icon.svg -resize 152x152 public/icons/icon-152x152.png');
console.log('   magick public/icons/icon.svg -resize 192x192 public/icons/icon-192x192.png');
console.log('   magick public/icons/icon.svg -resize 384x384 public/icons/icon-384x384.png');
console.log('   magick public/icons/icon.svg -resize 512x512 public/icons/icon-512x512.png');
console.log('');
console.log('3. Create shortcut icons:');
console.log('   - emergency-96x96.png (red emergency icon)');
console.log('   - report-96x96.png (document icon)');
console.log('   - dial-96x96.png (phone icon)');
console.log('');
console.log('Required icon files:');
iconSizes.forEach(size => {
  const iconPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`);
  const exists = fs.existsSync(iconPath);
  console.log(`   ${iconPath} ${exists ? '✅' : '❌'}`);
});

console.log('');
console.log('After generating icons, your PWA will be ready!');
