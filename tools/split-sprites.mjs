import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const config = {
  inputPath: 'src/assets/spritesheets/kids.png',
  outputDir: 'src/assets/sprites/kids',
  columns: 6,
  rows: 5,
  prefix: 'kid',
  format: 'png',
  cleanOutputDir: true,
};

async function ensureOutputDir(dir, clean) {
  if (clean) {
    await rm(dir, { recursive: true, force: true });
  }
  await mkdir(dir, { recursive: true });
}

async function main() {
  const { inputPath, outputDir, columns, rows, prefix, format, cleanOutputDir } = config;

  const sheet = sharp(inputPath);
  const metadata = await sheet.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions from ${inputPath}`);
  }

  const { width, height } = metadata;
  const cellWidth = Math.floor(width / columns);
  const cellHeight = Math.floor(height / rows);
  const widthRemainder = width % columns;
  const heightRemainder = height % rows;

  if (widthRemainder !== 0 || heightRemainder !== 0) {
    console.warn(
      `Warning: sheet does not divide evenly - remainder width ${widthRemainder}, height ${heightRemainder}. Some edge pixels may be dropped.`
    );
  }

  await ensureOutputDir(outputDir, cleanOutputDir);

  const jobs = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const left = col * cellWidth;
      const top = row * cellHeight;
      const index = row * columns + col + 1;
      const filename = `${prefix}-${String(index).padStart(2, '0')}.${format}`;
      const outputPath = path.join(outputDir, filename);

      jobs.push(
        sheet
          .clone()
          .extract({ left, top, width: cellWidth, height: cellHeight })
          .toFile(outputPath)
      );
    }
  }

  await Promise.all(jobs);
  console.log(`Saved ${jobs.length} sprites to ${outputDir}`);
  console.log(`Cell size: ${cellWidth}x${cellHeight} from sheet ${width}x${height}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
