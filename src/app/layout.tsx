import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/normalize.css";
import "@/styles/components.css";
import "@/styles/penni.css";
import "@splidejs/splide/dist/css/splide-core.min.css";
import "@/styles/overrides.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.penni.ca"),
  title: "Penni - We Make Payment Processing Easy",
  description:
    "Helping you save every penny, spend less time and money on payment processing and focus on growing your business.",
  openGraph: {
    title: "Penni - We Make Payment Processing Easy",
    description:
      "Helping you save every penny, spend less time and money on payment processing and focus on growing your business.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Penni - We Make Payment Processing Easy",
    description:
      "Helping you save every penny, spend less time and money on payment processing and focus on growing your business.",
  },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/webclip.png",
  },
  alternates: { canonical: "https://www.penni.ca" },
};

const wfModBootstrap = `!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`;

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Penni Payments",
  image: "",
  "@id": "https://www.penni.ca/",
  url: "https://www.penni.ca/",
  telephone: "(778) 237 4700",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "19181 34A Ave #107",
    addressLocality: "Surrey",
    addressRegion: "BC",
    postalCode: "V3S 0L5",
    addressCountry: "CA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 49.06461869479959,
    longitude: -122.69287217805294,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Thursday", "Wednesday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-wf-page="620c3865d295b0b054f9634f" data-wf-site="5fcfcc0b8ef7205bada598ac">
      <head>
        <link rel="stylesheet" href="https://calendly.com/assets/external/widget.css" />
        <Script id="wf-mod-bootstrap" strategy="beforeInteractive">
          {wfModBootstrap}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PGDC89F"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Nav />
        {children}
        <Footer />

        <Script
          src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=5fcfcc0b8ef7205bada598ac"
          integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@splidejs/splide@3.2.2/dist/js/splide.min.js"
          strategy="afterInteractive"
        />

        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PGDC89F');`}
        </Script>

        <Script src="https://calendly.com/assets/external/widget.js" strategy="lazyOnload" />
        <Script id="calendly-init" strategy="lazyOnload">
          {`var calendyButton=document.getElementsByClassName('calendly-trade');for(var i=0;i<calendyButton.length;i++){calendyButton[i].addEventListener('click',function(){Calendly.initPopupWidget({url:'https://calendly.com/pennipayments/30min'});return false;});}`}
        </Script>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-10798887721"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-10798887721');`}
        </Script>

        <Script id="penni-globals" strategy="afterInteractive">
          {`(function(){
            function init(){
              document.querySelectorAll('.copyright-year').forEach(function(el){el.textContent=new Date().getFullYear();});
              // Mobile hamburger: build a dropdown with Blogs + Start Saving Today, toggle on trigger click
              var nav=document.querySelector('.g-nav');
              var trigger=nav&&nav.querySelector('.g-nav_mobile-trigger');
              if(trigger){
                // Add the middle bar element for the CSS hamburger
                var icon=trigger.querySelector('.g-nav_mobile-icon');
                if(icon&&!icon.querySelector('span.bar')){
                  var bar=document.createElement('span');
                  bar.className='bar';
                  icon.appendChild(bar);
                }
                // Build the dropdown panel once
                var menu=document.querySelector('.g-nav_mobile-menu');
                if(!menu){
                  menu=document.createElement('div');
                  menu.className='g-nav_mobile-menu';
                  var blogs=document.createElement('a');
                  blogs.href='/blog';
                  blogs.textContent='Blogs';
                  var cta=document.createElement('a');
                  cta.href='#';
                  cta.className='button calendly-trade';
                  cta.textContent='Start Saving Today';
                  cta.addEventListener('click',function(e){
                    e.preventDefault();
                    if(window.Calendly){window.Calendly.initPopupWidget({url:'https://calendly.com/pennipayments/30min'});}
                  });
                  menu.appendChild(blogs);
                  menu.appendChild(cta);
                  document.body.appendChild(menu);
                }
                trigger.addEventListener('click',function(){
                  var open=trigger.classList.toggle('is-open');
                  menu.classList.toggle('is-open',open);
                  document.body.style.overflow=open?'hidden':'auto';
                });
                // Close menu when a link inside is clicked
                menu.addEventListener('click',function(e){
                  if(e.target.tagName==='A'){
                    trigger.classList.remove('is-open');
                    menu.classList.remove('is-open');
                    document.body.style.overflow='auto';
                  }
                });
              }
              // Webflow tabs (w-tabs) — replicate native click behavior
              document.querySelectorAll('.w-tabs').forEach(function(tabs){
                var menu=tabs.querySelector('.w-tab-menu');
                var content=tabs.querySelector('.w-tab-content');
                if(!menu||!content) return;
                var links=menu.querySelectorAll('.w-tab-link');
                var panes=content.querySelectorAll('.w-tab-pane');
                links.forEach(function(link){
                  link.addEventListener('click',function(e){
                    e.preventDefault();
                    var key=link.getAttribute('data-w-tab');
                    links.forEach(function(l){l.classList.toggle('w--current',l===link);});
                    panes.forEach(function(p){p.classList.toggle('w--tab-active',p.getAttribute('data-w-tab')===key);});
                  });
                });
              });

              // Scrolling-content: swap which trigger image is .w--current based on which item is in view
              document.querySelectorAll('.scrolling-content_component').forEach(function(comp){
                var triggers=comp.querySelectorAll('.scrolling-content_trigger');
                var items=[];
                triggers.forEach(function(t){
                  var href=t.getAttribute('href')||'';
                  var id=href.replace(/^#/,'');
                  var target=id?document.getElementById(id):null;
                  if(target) items.push({trigger:t,target:target});
                });
                if(!items.length) return;
                // Default: first item active
                items.forEach(function(it,i){it.trigger.classList.toggle('w--current',i===0);});
                var updateScroll=function(){
                  var anchor=window.innerHeight*0.5;
                  var best=0, bestDist=Infinity;
                  items.forEach(function(it,i){
                    var rect=it.target.getBoundingClientRect();
                    var center=rect.top+rect.height/2;
                    var dist=Math.abs(center-anchor);
                    if(dist<bestDist){bestDist=dist;best=i;}
                  });
                  items.forEach(function(it,i){it.trigger.classList.toggle('w--current',i===best);});
                };
                updateScroll();
                window.addEventListener('scroll',updateScroll,{passive:true});
                window.addEventListener('resize',updateScroll,{passive:true});
              });

              var nav=document.querySelector('.g-nav');
              if(!nav) return;
              var apply=function(){
                // Use the height of the first hero/header section as the trigger point.
                var hero=document.querySelector('header.g-section, .g-hero, header.section, .section');
                var threshold=hero?hero.offsetTop+hero.offsetHeight-100:400;
                if(window.scrollY>threshold) nav.classList.add('is-scrolled');
                else nav.classList.remove('is-scrolled');
              };
              apply();
              window.addEventListener('scroll',apply,{passive:true});
              window.addEventListener('resize',apply,{passive:true});
            }
            if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
            else init();
          })();`}
        </Script>

        <Script
          id="ld-localbusiness"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </body>
    </html>
  );
}
