#!/usr/bin/env node
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "content", "articles");
const MANIFEST = path.join(ROOT, "src", "content", "articles-manifest.json");
const UA = "Mozilla/5.0 (compatible; PenniNextScraper/1.0)";
const BLOG_URL = "https://www.penni.ca/blog";

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

function slugsFromBlogIndex(html) {
  const re = /href="\/article\/([^"]+)"/g;
  const set = new Set();
  for (const m of html.matchAll(re)) set.add(m[1]);
  return [...set];
}

function pick(re, html, idx = 1) {
  const m = html.match(re);
  return m ? m[idx].trim() : "";
}

function extractMain(html) {
  const start = html.indexOf('<main class="main-wrapper">');
  if (start === -1) return null;
  const end = html.indexOf("</main>", start);
  if (end === -1) return null;
  return html.slice(start, end + "</main>".length);
}

function extractMeta(html, slug) {
  const title =
    pick(/<h1 class="heading-xlarge">([\s\S]*?)<\/h1>/, html) ||
    pick(/<title>([^<]+)<\/title>/, html);
  const description =
    pick(/<meta name="description" content="([^"]+)"/, html) ||
    pick(/<meta property="og:description" content="([^"]+)"/, html);
  const heroMatch = html.match(/<img[^>]+class="blog-page_image"[^>]*src="([^"]+)"/);
  const hero = heroMatch ? heroMatch[1] : "";
  const date = pick(/<p class="article_date">([^<]+)<\/p>/, html);
  const reading = pick(/<p class="reading_time">(\d+)<\/p>/, html);
  return { slug, title: title.replace(/\s+/g, " ").trim(), description, hero, date, reading };
}

function rewriteInternalLinks(html) {
  // Webflow internal page links → our app routes
  return html
    .replace(/href="\/article\//g, 'href="/blog/')
    .replace(/href="\/blog"/g, 'href="/blog"');
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("Fetching blog index...");
  const blogHtml = await fetchText(BLOG_URL);
  const slugs = slugsFromBlogIndex(blogHtml);
  console.log(`Found ${slugs.length} articles`);

  const manifest = [];
  let i = 0;
  for (const slug of slugs) {
    i++;
    const outFile = path.join(OUT_DIR, `${slug}.html`);
    try {
      const html = await fetchText(`https://www.penni.ca/article/${slug}`);
      const main = extractMain(html);
      if (!main) throw new Error("no <main>");
      const meta = extractMeta(html, slug);
      await writeFile(outFile, rewriteInternalLinks(main), "utf8");
      manifest.push(meta);
      console.log(`[${i}/${slugs.length}] ${slug}`);
    } catch (e) {
      console.warn(`[${i}/${slugs.length}] ${slug} FAILED: ${e.message}`);
    }
  }

  // Try to grab the blog index card metadata for ordering (live blog page often lists articles in publish order)
  const orderIdx = new Map();
  let order = 0;
  for (const m of blogHtml.matchAll(/href="\/article\/([^"]+)"/g)) {
    if (!orderIdx.has(m[1])) orderIdx.set(m[1], order++);
  }
  manifest.sort((a, b) => (orderIdx.get(a.slug) ?? 1e9) - (orderIdx.get(b.slug) ?? 1e9));

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Wrote manifest with ${manifest.length} entries → ${MANIFEST}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
