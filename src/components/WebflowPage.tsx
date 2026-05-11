import Script from "next/script";
import { getPageSlices } from "@/lib/webflow-html";

type Props = { file: string };

/**
 * Renders a Webflow-exported page body (the slice between <nav> and <footer>).
 * Inline page scripts that drove jQuery-based interactions on the original
 * Webflow page are re-emitted via <Script> so dynamic behaviors keep working.
 *
 * The scripts are wrapped in a waitForDeps loop so they don't crash if jQuery
 * or Splide haven't finished loading yet (next/script ordering is not guaranteed).
 */
export default function WebflowPage({ file }: Props) {
  const { content, pageScripts } = getPageSlices(file);
  // Strip Webflow.push(...) blocks: they require the Webflow runtime which we don't ship.
  // The behaviors inside (footer year, mobile-nav toggle) are reimplemented in layout.tsx.
  const sanitize = (src: string) =>
    src.replace(/Webflow\.push\(\s*function\s*\(\s*\)\s*\{[\s\S]*?\}\s*\)\s*;?/g, "");
  const wrap = (src: string) => `(function(){
    function ready(){
      try{${sanitize(src)}}catch(e){console.error('[wf-page-script]',e);}
    }
    function waitDeps(){
      if(typeof window.$!=='undefined'&&typeof window.Splide!=='undefined') return ready();
      setTimeout(waitDeps,50);
    }
    waitDeps();
  })();`;
  return (
    <>
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: content }} />
      {pageScripts.map((src, i) => (
        <Script
          key={i}
          id={`wf-page-${file}-${i}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: wrap(src) }}
        />
      ))}
    </>
  );
}
