import { getSharedNav } from "@/lib/webflow-html";

export default function Nav() {
  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: getSharedNav() }} />;
}
