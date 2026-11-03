// Converts the large PNG/JPG sources in public/ into resized WebP files.
// Run with: npm run images
// Originals are left in place; delete them once the .webp versions are referenced.
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const jobs = [
  { dir: "public/banners", maxWidth: 1920, quality: 78 },
  { dir: "public", maxWidth: 2560, quality: 78, only: ["firefly-generated-landing-bg.jpg"] },
  { dir: "public", maxWidth: 256, quality: 85, only: ["personal_photo.jpg"] },
];

for (const job of jobs) {
  const files = (await readdir(job.dir)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  for (const file of files) {
    if (job.only && !job.only.includes(file)) continue;
    const src = path.join(job.dir, file);
    const dest = src.replace(/\.(png|jpe?g)$/i, ".webp");
    const before = (await stat(src)).size;
    await sharp(src)
      .resize({ width: job.maxWidth, withoutEnlargement: true })
      .webp({ quality: job.quality })
      .toFile(dest);
    const after = (await stat(dest)).size;
    console.log(`${src} -> ${dest}  ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
  }
}
