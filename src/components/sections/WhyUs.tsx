"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const reasons = [
  {
    icon: "✓",
    title: "100% Genuine",
    desc: "Pre-dispatch quality checks on every product. No fakes, no compromises.",
  },
  {
    icon: "🚚",
    title: "Free Shipping",
    desc: "On all orders above ₹1,000 across India. Fast, tracked delivery.",
  },
  {
    icon: "💬",
    title: "WhatsApp Support",
    desc: "24/7 direct support. No bots. Real humans who know sports.",
  },
  {
    icon: "↩",
    title: "Easy Returns",
    desc: "Hassle-free returns within 7 days. Your satisfaction guaranteed.",
  },
];

export default function WhyUs() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".why-item",
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );

      // Clip-path reveal on the visual panel (distinct from other sections)
      gsap.fromTo(
        ".why-visual",
        { clipPath: "inset(30% 10% 30% 10%)", opacity: 0 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "center center",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#0a0a0a] py-16 md:py-32 px-6 md:px-16 lg:px-24"
    >
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Left: text */}
        <div>
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-6">
            005 / Why Us
          </p>
          <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-black leading-none text-white uppercase mb-14">
            Why Buy
            <br />
            <span className="text-orange-500">Here?</span>
          </h2>

          <div className="flex flex-col gap-10">
            {reasons.map((r) => (
              <div key={r.title} className="why-item flex gap-6" style={{ opacity: 0 }}>
                <span className="text-orange-500 text-2xl shrink-0 mt-1">
                  {r.icon}
                </span>
                <div>
                  <h3 className="text-white font-bold text-xl md:text-2xl uppercase tracking-wide mb-2">
                    {r.title}
                  </h3>
                  <p className="text-white/70 text-base md:text-lg leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: visual */}
        <div className="why-visual relative" style={{ opacity: 0 }}>
          <div className="bg-[#111111] p-6 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <p className="text-orange-500 text-xs uppercase tracking-[0.2em] mb-4">
                Customer Review
              </p>
              <blockquote className="text-white text-lg md:text-2xl font-light leading-relaxed mb-6">
                &ldquo;Great work and coordination. Under 10k I got a really nice
                product that is easy to maintain. Highly recommended!&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm">
                  S
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Srishti Vaid</p>
                  <div className="flex text-orange-500 text-xs">★★★★★</div>
                </div>
              </div>
            </div>
          </div>

          {/* Google rating badge */}
          <div className="absolute bottom-0 right-0 translate-y-0 md:-bottom-6 md:-right-6 bg-white text-[#0a0a0a] p-3 md:p-4 shadow-2xl">
            <p className="text-3xl font-black">4.8</p>
            <div className="flex text-orange-500 text-sm">★★★★★</div>
            <p className="text-[10px] text-[#0a0a0a]/50 uppercase tracking-wide mt-1">
              Google Reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
