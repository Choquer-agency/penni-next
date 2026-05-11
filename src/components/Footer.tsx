import { getSharedFooter } from "@/lib/webflow-html";

export default function Footer() {
  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: getSharedFooter() }} />;
}
