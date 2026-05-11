#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src", "content", "blog-index.html");
const UA = "Mozilla/5.0 (compatible; PenniNextScraper/1.0)";

const res = await fetch("https://www.penni.ca/blog", { headers: { "User-Agent": UA } });
const html = await res.text();
const start = html.indexOf('<main class="main-wrapper">');
const end = html.indexOf("</main>", start);
let main = html.slice(start, end + "</main>".length);

// Rewrite live links to our routes
main = main.replace(/href="\/article\//g, 'href="/blog/');

await writeFile(OUT, main, "utf8");
console.log(`Wrote ${OUT} (${main.length} bytes)`);
