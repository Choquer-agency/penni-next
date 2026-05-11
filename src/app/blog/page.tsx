import fs from "node:fs";
import path from "node:path";

export const metadata = {
  title: "Penni Blog — Payment Processing Insights",
};

export default function BlogIndex() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "src", "content", "blog-index.html"),
    "utf8",
  );
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
