"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import WhatsAppCTA from "@/components/ui/WhatsAppCTA";
import ScarcityBadge from "@/components/ui/ScarcityBadge";
import SocialProofTicker from "@/components/ui/SocialProofTicker";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const products = [
  {
    name: "Yonex Astrox 88D Pro",
    category: "Badminton Racket",
    price: "14,949",
    originalPrice: "24,990",
    discount: "40% OFF",
    emoji: "🏸",
    scarcity: 2,
    bg: "#111111",
  },
  {
    name: "Yonex Nanoflare 1000Z",
    category: "Badminton Racket",
    price: "16,999",
    originalPrice: "23,490",
    discount: "28% OFF",
    emoji: "🎯",
    scarcity: 4,
    bg: "#0f0f0f",
  },
  {
    name: "Adidas T19i Treadmill",
    category: "Fitness Equipment",
    price: "89,999",
    originalPrice: "1,19,999",
    discount: "25% OFF",
    emoji: "🏃",
    scarcity: 1,
    bg: "#111111",
  },
  {
    name: "Joola Perseus Pro IV",
    category: "Pickleball Paddle",
    price: "21,999",
    originalPrice: "35,999",
    discount: "39% OFF",
    emoji: "🏓",
    scarcity: 3,
    bg: "#0f0f0f",
  },
  {
    name: "Adidas Metalbone CTRL",
    category: "Padel Racket",
    price: "35,499",
    originalPrice: "51,199",
    discount: "31% OFF",
    emoji: "🎾",
    scarcity: 2,
    bg: "#111111",
  },
];

export default function ProductSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 1023px)");

  useEffect(() => {
    if (isMobile || !containerRef.current || !trackRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const totalWidth = trackRef.current!.scrollWidth - window.innerWidth;

      gsap.to(trackRef.current, {
        x: () => -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [isMobile]);

  if (isMobile) {
    // Mobile: vertical stack
    return (
      <section className="bg-[#0a0a0a] py-16 px-5">
        <p className="text-orange-500 text-xs uppercase tracking-[0.3em] mb-4">
          004 / Spotlight
        </p>
        <h2 className="text-[clamp(2rem,8vw,4rem)] font-black uppercase text-white mb-8">
          Top Picks
        </h2>
        <div className="flex flex-col gap-6">
          {products.map((p) => (
            <ProductCard key={p.name} product={p} mobile />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="bg-[#0a0a0a] overflow-hidden">
      <div ref={trackRef} className="flex h-screen items-stretch">
        {/* Label panel */}
        <div className="flex-shrink-0 w-[30vw] flex flex-col justify-center px-16 border-r border-white/5">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-6">
            004 / Spotlight
          </p>
          <h2 className="text-[clamp(3rem,5vw,5rem)] font-black uppercase text-white leading-none">
            Top
            <br />
            <span className="text-orange-500">Picks</span>
          </h2>
          <p className="mt-6 text-white/65 text-base max-w-xs leading-relaxed">
            Handpicked from 1,500+ products. Genuine. Discounted. Delivered.
          </p>
        </div>

        {/* Scrolling product cards */}
        {products.map((p) => (
          <div
            key={p.name}
            className="flex-shrink-0 w-[46vw] h-full flex flex-col border-r border-white/5"
            style={{ background: p.bg }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  mobile = false,
}: {
  product: (typeof products)[number];
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="w-full p-6 border border-white/[0.06]" style={{ background: product.bg }}>
        <div className="text-5xl mb-4">{product.emoji}</div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-2">{product.category}</p>
        <h3 className="text-xl font-black text-white uppercase mb-3 leading-tight">{product.name}</h3>
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <span className="text-2xl font-black text-white">₹{product.price}</span>
          <span className="text-sm text-white/30 line-through">₹{product.originalPrice}</span>
          <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5">{product.discount}</span>
        </div>
        <div className="mb-3"><ScarcityBadge count={product.scarcity} /></div>
        <div className="mb-4"><SocialProofTicker /></div>
        <WhatsAppCTA productName={product.name} price={product.price} />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Product image area — large emoji as visual */}
      <div className="flex-shrink-0 h-[42%] flex items-center justify-center bg-white/[0.02]">
        <span
          className="leading-none select-none"
          style={{ fontSize: "clamp(7rem,11vw,14rem)", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}
        >
          {product.emoji}
        </span>
      </div>

      {/* Product info */}
      <div className="flex-1 flex flex-col justify-center px-10 pb-10 pt-6 border-t border-white/[0.08] overflow-auto">
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">
          {product.category}
        </p>
        <h3 className="font-black text-white uppercase mb-3 leading-tight"
            style={{ fontSize: "clamp(1.4rem,2.4vw,2.6rem)" }}>
          {product.name}
        </h3>
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <span className="font-black text-white leading-none"
                style={{ fontSize: "clamp(1.8rem,3vw,3.5rem)" }}>
            ₹{product.price}
          </span>
          <span className="text-sm text-white/30 line-through">₹{product.originalPrice}</span>
          <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5">
            {product.discount}
          </span>
        </div>
        <div className="mb-3"><ScarcityBadge count={product.scarcity} /></div>
        <div className="mb-3"><SocialProofTicker /></div>
        <WhatsAppCTA productName={product.name} price={product.price} />
      </div>
    </div>
  );
}
