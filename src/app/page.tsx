import dynamic from "next/dynamic";

// All sections are client-only (GSAP, canvas, R3F)
const CanvasHero = dynamic(
  () => import("@/components/sections/CanvasHero"),
  { ssr: false }
);
const Marquee = dynamic(
  () => import("@/components/sections/Marquee"),
  { ssr: false }
);
const Heritage = dynamic(
  () => import("@/components/sections/Heritage"),
  { ssr: false }
);
const Categories = dynamic(
  () => import("@/components/sections/Categories"),
  { ssr: false }
);
const ProductSpotlight = dynamic(
  () => import("@/components/sections/ProductSpotlight"),
  { ssr: false }
);
const WhyUs = dynamic(
  () => import("@/components/sections/WhyUs"),
  { ssr: false }
);
const CTAFooter = dynamic(
  () => import("@/components/sections/CTAFooter"),
  { ssr: false }
);

export default function Home() {
  return (
    <main>
      {/* Video-frame canvas hero — 600vh, sticky canvas with 4 scroll phases */}
      <CanvasHero />

      {/* Dual-row sports marquee, scrub-driven opposite directions */}
      <Marquee />

      {/* Heritage: word-by-word reveal + stat counters */}
      <Heritage />

      {/* Categories: clip-path + scale-up reveals, light bg */}
      <Categories />

      {/* Product spotlight: horizontal scroll, pinned */}
      <ProductSpotlight />

      {/* Why Us: slide-in trust signals + clip-path visual reveal */}
      <WhyUs />

      {/* CTA + Footer */}
      <CTAFooter />
    </main>
  );
}
