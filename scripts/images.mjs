// Turns the resort's original uploads (resources/site) into web-sized WebP in public/img.
import sharp from "sharp";
import { readdirSync, mkdirSync } from "node:fs";

const src = "resources/site", out = "public/img";
mkdirSync(out, { recursive: true });
for (const f of readdirSync(src)) {
  if (/logo|Logo/.test(f)) continue;
  const name = f.replace(/\.(jpe?g|png)$/i, "").replace(/-scaled.*$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  await sharp(`${src}/${f}`).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 70 }).toFile(`${out}/${name}.webp`);
}
// logo: a cream-on-transparent copy for dark backgrounds is done with CSS mask, so one file is enough
await sharp(`${src}/SermonontheMount-logo_A-green.png`).resize({ width: 600 }).png().toFile("public/logo.png");
await sharp(`${src}/cropped-SermonontheMount-logo_A-green.png`).resize(64, 64).png().toFile("public/favicon.png");
