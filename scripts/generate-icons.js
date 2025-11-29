#!/usr/bin/env node

/**
 * Generate PWA icons from the source logo
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('Error: sharp is not installed.');
  console.error('Install it with: pnpm add -D sharp');
  console.error('Then run this script again.');
  process.exit(1);
}

const inputFile = path.join(__dirname, '..', 'public', 'logo.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const icons = [
  { name: 'icon-192x192.png', size: 192, maskable: false },
  { name: 'icon-512x512.png', size: 512, maskable: false },
  { name: 'icon-maskable-192x192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
];

async function generateIcons() {
  console.log('Generating PWA icons from logo.png...\n');

  for (const icon of icons) {
    const outputPath = path.join(outputDir, icon.name);
    
    try {
      let pipeline = sharp(inputFile).resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 240, g: 246, b: 249, alpha: 1 }, // background color from theme
      });

      // For maskable icons, add extra padding (safe zone)
      if (icon.maskable) {
        const paddedSize = Math.floor(icon.size * 0.8); // 80% of size for safe zone
        const padding = Math.floor((icon.size - paddedSize) / 2);
        
        pipeline = sharp(inputFile)
          .resize(paddedSize, paddedSize, {
            fit: 'contain',
            background: { r: 240, g: 246, b: 249, alpha: 1 },
          })
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 240, g: 246, b: 249, alpha: 1 },
          });
      }

      await pipeline.png().toFile(outputPath);
      console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${icon.name}:`, error.message);
    }
  }

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch((error) => {
  console.error('Error generating icons:', error);
  process.exit(1);
});

