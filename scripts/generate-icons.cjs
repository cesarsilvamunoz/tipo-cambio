/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const source = path.join(__dirname, '..', 'public', 'icon-source.jpg');
const outDir = path.join(__dirname, '..', 'public');

const sizes = [
  { name: 'icon-16.png', size: 16 },
  { name: 'icon-32.png', size: 32 },
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-120.png', size: 120 },
  { name: 'icon-128.png', size: 128 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-152.png', size: 152 },
  { name: 'icon-167.png', size: 167 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-256.png', size: 256 },
  { name: 'icon-384.png', size: 384 },
  { name: 'icon-512.png', size: 512 },
];

async function run() {
  if (!fs.existsSync(source)) {
    console.error('Source not found:', source);
    process.exit(1);
  }

  const image = sharp(source).resize(1024, 1024, {
    fit: 'cover',
    position: 'centre',
  });

  for (const { name, size } of sizes) {
    await image
      .clone()
      .resize(size, size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, name));
    console.log('Generated', name);
  }

  await sharp(source)
    .resize(1024, 1024, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(path.join(outDir, 'og-image.jpg'));
  console.log('Generated og-image.jpg');

  await sharp(source)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  await sharp(source)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(outDir, 'favicon-32x32.png'));
  console.log('Generated favicon-32x32.png');

  await sharp(source)
    .resize(16, 16, { fit: 'cover' })
    .png()
    .toFile(path.join(outDir, 'favicon-16x16.png'));
  console.log('Generated favicon-16x16.png');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});