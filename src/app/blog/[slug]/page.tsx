import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const ARTICLES_DIR = path.join(process.cwd(), "src", "content", "articles");
const MANIFEST = path.join(process.cwd(), "src", "content", "articles-manifest.json");

type Article = {
  slug: string;
  title: string;
  description: string;
  hero: string;
  date: string;
  reading: string;
};

function loadManifest(): Article[] {
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
}

export async function generateStaticParams() {
  return loadManifest().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = loadManifest().find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: `${article.title} | Penni`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: article.hero ? [article.hero] : undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const file = path.join(ARTICLES_DIR, `${slug}.html`);
  if (!fs.existsSync(file)) notFound();
  const html = fs.readFileSync(file, "utf8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
