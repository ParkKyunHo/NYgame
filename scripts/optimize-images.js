const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../assets/images');

const images = [
  'bg_clouds.png',
  'bg_sky_buildings.png',
  'btn_start_normal.png',
  'btn_start_pressed.png',
  'ui_title_banner.png'
];

async function optimizeImages() {
  console.log('Starting image optimization...\n');

  for (const imageName of images) {
    const inputPath = path.join(imagesDir, 'backup', imageName);
    const outputPath = path.join(imagesDir, imageName);

    try {
      const originalStats = fs.statSync(inputPath);
      const originalSize = originalStats.size;

      // Get image metadata
      const metadata = await sharp(inputPath).metadata();

      // Calculate target dimensions (max 1024px for mobile)
      let targetWidth = metadata.width;
      let targetHeight = metadata.height;
      const maxDimension = 1024;

      if (metadata.width > maxDimension || metadata.height > maxDimension) {
        const ratio = Math.min(maxDimension / metadata.width, maxDimension / metadata.height);
        targetWidth = Math.round(metadata.width * ratio);
        targetHeight = Math.round(metadata.height * ratio);
      }

      // Optimize: resize and compress PNG
      await sharp(inputPath)
        .resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({
          compressionLevel: 9,
          palette: true,
          quality: 80,
          effort: 10
        })
        .toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      const newSize = newStats.size;
      const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

      console.log(`✓ ${imageName}`);
      console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB (${metadata.width}x${metadata.height})`);
      console.log(`  Optimized: ${(newSize / 1024 / 1024).toFixed(2)} MB (${targetWidth}x${targetHeight})`);
      console.log(`  Reduction: ${reduction}%\n`);

    } catch (err) {
      console.error(`✗ Error processing ${imageName}:`, err.message);
    }
  }

  console.log('Optimization complete!');
}

optimizeImages();
