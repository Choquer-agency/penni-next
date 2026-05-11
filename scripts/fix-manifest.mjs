#!/usr/bin/env node
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "src", "content", "articles");
const MANIFEST = path.join(ROOT, "src", "content", "articles-manifest.json");

function extractHero(html) {
  // Try blog-page_image first, then any image inside header.is--blog-header, then OG image fallback
  let m = html.match(/<img[^>]*class="[^"]*blog-page_image[^"]*"[^>]*>/);
  if (!m) m = html.match(/<header[^>]*is--blog-header[^>]*>[\s\S]*?<img[^>]*>/);
  if (!m) return "";
  const tag = m[0];
  const src = tag.match(/\bsrc="([^"]+)"/);
  return src ? src[1] : "";
}

function extractDescription(html) {
  // Try first <p> in rich text
  const m = html.match(/<div class="rtb w-richtext">\s*<p>([\s\S]*?)<\/p>/);
  if (!m) return "";
  return m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 240);
}

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
let updated = 0;
for (const entry of manifest) {
  const file = path.join(DIR, `${entry.slug}.html`);
  try {
    const html = await readFile(file, "utf8");
    const hero = extractHero(html);
    const desc = extractDescription(html);
    if (hero && hero !== entry.hero) { entry.hero = hero; updated++; }
    if (desc && !entry.description) entry.description = desc;
  } catch (e) {
    console.warn(`skip ${entry.slug}: ${e.message}`);
  }
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), "utf8");
console.log(`Updated ${updated}/${manifest.length} hero URLs`);
