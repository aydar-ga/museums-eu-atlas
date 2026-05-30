import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const PRESETS = {
  "museum_of_fine_arts_budapest.jpg": {
    source:
      "https://upload.wikimedia.org/wikipedia/commons/c/c1/Museum_of_Fine_Arts%2C_Budapest_2006-11-04_026.jpg",
    crop: { left: 220, top: 90, width: 1200, height: 780 }
  },
  "acropolis_museum.jpg": {
    source:
      "https://upload.wikimedia.org/wikipedia/commons/2/22/New_Acropolis_Museum_building_in_Athens%2C_Greece.jpg",
    crop: { left: 200, top: 100, width: 3200, height: 1800 }
  }
};

async function processMuseumImage(input, outputPath, { crop, width = 320, quality = 85 } = {}) {
  let pipeline = sharp(input);
  if (crop) {
    pipeline = sharp(input).extract(crop);
  }

  await pipeline
    .greyscale()
    .normalize()
    .modulate({ brightness: 1.05 })
    .resize({ width, withoutEnlargement: false })
    .jpeg({ quality, mozjpeg: true })
    .toFile(outputPath);
}

const target = process.argv[2];
if (!target || !PRESETS[target]) {
  console.error("Usage: node scripts/process-museum-image.mjs <filename.jpg>");
  console.error("Presets:", Object.keys(PRESETS).join(", "));
  process.exit(1);
}

const preset = PRESETS[target];
const outputPath = path.join(rootDir, "public/images", target);
const tempPath = path.join(rootDir, ".tmp-museum-source.jpg");

const response = await fetch(preset.source, {
  headers: { "User-Agent": "MuseumsEuAtlas/1.0 (image processing)" }
});
if (!response.ok) {
  throw new Error(`Failed to download ${preset.source}: ${response.status}`);
}

await writeFile(tempPath, Buffer.from(await response.arrayBuffer()));
await processMuseumImage(tempPath, outputPath, { crop: preset.crop });
await unlink(tempPath);

console.log(`Wrote ${outputPath}`);
