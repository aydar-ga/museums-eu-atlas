import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sourceSvg = path.join(rootDir, "public/favicons/museum-icon.svg");
const faviconDir = path.join(rootDir, "public/favicons");
const appDir = path.join(rootDir, "src/app");

const pngSizes = {
  "favicon-16x16.png": 16,
  "favicon-32x32.png": 32,
  "favicon-96x96.png": 96,
  "apple-icon.png": 180,
  "apple-icon-precomposed.png": 180,
  "apple-icon-57x57.png": 57,
  "apple-icon-60x60.png": 60,
  "apple-icon-72x72.png": 72,
  "apple-icon-76x76.png": 76,
  "apple-icon-114x114.png": 114,
  "apple-icon-120x120.png": 120,
  "apple-icon-144x144.png": 144,
  "apple-icon-152x152.png": 152,
  "apple-icon-180x180.png": 180,
  "android-icon-36x36.png": 36,
  "android-icon-48x48.png": 48,
  "android-icon-72x72.png": 72,
  "android-icon-96x96.png": 96,
  "android-icon-144x144.png": 144,
  "android-icon-192x192.png": 192,
  "ms-icon-70x70.png": 70,
  "ms-icon-144x144.png": 144,
  "ms-icon-150x150.png": 150,
  "ms-icon-310x310.png": 310
};

const svgBuffer = await readFile(sourceSvg);
await mkdir(faviconDir, { recursive: true });
await mkdir(appDir, { recursive: true });

const generatedBuffers = {};

for (const [filename, size] of Object.entries(pngSizes)) {
  const outputPath = path.join(faviconDir, filename);
  const pngBuffer = await sharp(svgBuffer, { density: Math.max(72, size * 4) })
    .resize(size, size)
    .png()
    .toBuffer();
  await writeFile(outputPath, pngBuffer);
  generatedBuffers[filename] = pngBuffer;
}

await writeFile(
  path.join(faviconDir, "favicon.ico"),
  await pngToIco([generatedBuffers["favicon-16x16.png"], generatedBuffers["favicon-32x32.png"]])
);
await writeFile(path.join(appDir, "apple-icon.png"), generatedBuffers["apple-icon-180x180.png"]);

console.log(`Generated ${Object.keys(pngSizes).length + 2} favicon assets from museum-icon.svg`);
