import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src", "webflow");

type Slices = {
  nav: string;
  content: string;
  footer: string;
  /** Inline <script> blocks that appeared after </footer> and before </body>. Returned as their innerHTML joined. */
  pageScripts: string[];
};

const cache = new Map<string, Slices>();

const PAGE_TO_ROUTE: Record<string, string> = {
  "index.html": "/",
  "about.html": "/about",
  "application.html": "/application",
  "archive.html": "/archive",
  "blog.html": "/blog",
  "career.html": "/career",
  "e-commerce.html": "/e-commerce",
  "get-started.html": "/get-started",
  "invoice.html": "/invoice",
  "lawyers.html": "/lawyers",
  "manufacture.html": "/manufacture",
  "payment-savings.html": "/payment-savings",
  "retail.html": "/retail",
  "stylesheet.html": "/stylesheet",
  "thanks-for-joining.html": "/thanks-for-joining",
  "trades.html": "/trades",
  "tradeshow.html": "/tradeshow",
  "detail_article.html": "/blog",
  "detail_author.html": "/authors",
  "detail_topic.html": "/topics",
  "detail_keywords.html": "/keywords",
  "detail_testimonials.html": "/testimonials",
  "detail_blob.html": "/blob",
};

type Article = {
  slug: string;
  title: string;
  description: string;
  hero: string;
  date: string;
  reading: string;
};

let _articles: Article[] | null = null;
function loadArticles(): Article[] {
  if (_articles) return _articles;
  try {
    const p = path.join(process.cwd(), "src", "content", "articles-manifest.json");
    _articles = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    _articles = [];
  }
  return _articles!;
}

const ARROW_SVG = `<div class="blog_arrow-icon w-embed"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 6 7.5" fill="currentcolor"><path d="M6,3.2v1.2L0,7.5V6l4.5-2.3V3.7L0,1.4V0L6,3.2z"/></svg></div>`;

function blogCard(a: Article): string {
  const href = `/blog/${a.slug}`;
  const tag = "E-Commerce";
  const img = a.hero
    ? `<img src="${a.hero}" loading="lazy" alt="${(a.title || "").replace(/"/g, "&quot;")}"/>`
    : `<img src="" loading="lazy" alt=""/>`;
  return `<div role="listitem" class="splide__slide w-dyn-item">
    <div class="featured-blog_item">
      <a href="${href}" class="blog-component_trigger w-inline-block"></a>
      <div class="featured-blog_image">
        <div class="blog-tag"><div>${tag}</div></div>
        ${img}
      </div>
      <div class="featured-blog_content">
        <div class="blog_date">${a.date || ""}</div>
        <div class="featured-blog_content-wrapper">
          <h3 class="text-style-title blog">${a.title || ""}</h3>
          ${ARROW_SVG}
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * The Webflow export's homepage has an empty Webflow CMS dyn-list inside .splide.penni-blog.
 * Replace its <div class="splide__list w-dyn-items">…</div> with cards backed by our scraped manifest.
 */
function injectBlogCards(html: string): string {
  if (!html.includes('class="splide penni-blog"')) return html;
  // Strip the Webflow CMS empty-state ("No items found.") sibling that ships in the export
  html = html.replace(/<div class="w-dyn-empty">[\s\S]*?<\/div>\s*<\/div>/, "");
  // Match the live penni.ca homepage: these two specific featured articles.
  const featuredSlugs = [
    "credit-card-processing-trends",
    "credit-card-processing-for-small-businesses",
  ];
  const all = loadArticles();
  const articles = featuredSlugs
    .map((slug) => all.find((a) => a.slug === slug))
    .filter((a): a is Article => !!a);
  if (!articles.length) return html;
  const slides = articles.map(blogCard).join("\n");

  // Find the <div role="list" class="splide__list w-dyn-items"> and replace its inner content.
  const openRe = /<div role="list" class="splide__list w-dyn-items"[^>]*>/;
  const m = openRe.exec(html);
  if (!m) return html;
  const start = m.index + m[0].length;
  // Walk forward to find matching </div> for this list (track depth).
  let depth = 1;
  let i = start;
  const tagRe = /<\/?div\b[^>]*>/g;
  tagRe.lastIndex = i;
  let tm: RegExpExecArray | null;
  while ((tm = tagRe.exec(html)) !== null) {
    if (tm[0].startsWith("</")) depth--;
    else depth++;
    if (depth === 0) {
      const end = tm.index;
      return html.slice(0, start) + "\n" + slides + "\n" + html.slice(end);
    }
  }
  return html;
}

function rewriteUrls(html: string): string {
  // Absolute-asset paths
  let out = html.replace(/(src|href|poster|srcset|content)="(images|documents|fonts|css|js)\//g, '$1="/$2/');
  // srcset with multiple comma-separated entries
  out = out.replace(/, (images|documents|fonts)\//g, ", /$1/");
  // Internal page links: foo.html -> /foo (root index becomes /)
  out = out.replace(/(href|action)="([a-z0-9_\-]+)\.html"/gi, (_m, attr, name) => {
    const key = name + ".html";
    const route = PAGE_TO_ROUTE[key];
    return `${attr}="${route ?? "/" + name}"`;
  });
  // Strip webflow build-time element IDs that don't affect render
  out = out.replace(/\s+data-wf-(page-id|element-id|site|page)="[^"]*"/g, "");
  return out;
}

function readPage(file: string): string {
  const p = path.join(ROOT, file);
  return fs.readFileSync(p, "utf8");
}

function sliceBetween(src: string, open: RegExp, closeTag: string): { inner: string; rest: string; before: string } | null {
  const m = open.exec(src);
  if (!m) return null;
  const start = m.index;
  const tagEnd = src.indexOf(">", start) + 1;
  const close = src.indexOf(closeTag, tagEnd);
  if (close === -1) return null;
  const end = close + closeTag.length;
  return {
    before: src.slice(0, start),
    inner: src.slice(start, end),
    rest: src.slice(end),
  };
}

export function getPageSlices(file: string): Slices {
  if (process.env.NODE_ENV === "production" && cache.has(file)) return cache.get(file)!;
  const html = readPage(file);

  const bodyStart = html.indexOf("<body>");
  const bodyEnd = html.lastIndexOf("</body>");
  const body = html.slice(bodyStart + "<body>".length, bodyEnd);

  // Nav: <nav class="g-nav"> ... </nav>
  const navSlice = sliceBetween(body, /<nav class="g-nav"/, "</nav>");
  // Footer: <footer class="g-footer"> ... </footer>
  const footerSlice = sliceBetween(body, /<footer class="g-footer"/, "</footer>");

  const nav = navSlice?.inner ?? "";
  const footer = footerSlice?.inner ?? "";

  // Content is whatever is between the end of nav and start of footer
  let content = body;
  if (navSlice && footerSlice) {
    const afterNav = navSlice.rest;
    const footerInAfterNav = afterNav.indexOf(footer);
    content = footerInAfterNav >= 0 ? afterNav.slice(0, footerInAfterNav) : afterNav;
  } else if (navSlice) {
    content = navSlice.rest;
  }

  // Page scripts: everything after </footer>
  const trailing = footerSlice?.rest ?? "";
  const pageScripts: string[] = [];
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
  let sm: RegExpExecArray | null;
  while ((sm = scriptRe.exec(trailing)) !== null) {
    const attrs = sm[1];
    const body = sm[2];
    // Skip GTM, gtag, Calendly (we load them globally in layout)
    if (/googletagmanager|gtag|calendly|schema\.org/i.test(attrs + body)) continue;
    // Skip external src scripts (jquery, splide) — handled globally
    if (/src=/.test(attrs)) continue;
    pageScripts.push(body.trim());
  }

  const slices: Slices = {
    nav: rewriteUrls(nav),
    content: rewriteUrls(injectBlogCards(content)),
    footer: rewriteUrls(footer),
    pageScripts,
  };
  cache.set(file, slices);
  return slices;
}

/** Convenience: get just the page-body content for a route. */
export function getPageContent(file: string): string {
  return getPageSlices(file).content;
}

export function getSharedNav(): string {
  return getPageSlices("index.html").nav;
}

export function getSharedFooter(): string {
  return getPageSlices("index.html").footer;
}
