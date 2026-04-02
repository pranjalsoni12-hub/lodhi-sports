"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const categories = [
  { name: "Badminton", count: 158, icon: "🏸", bg: "#1a1a1a" },
  { name: "Tennis", count: 86, icon: "🎾", bg: "#141414" },
  { name: "Fitness", count: 290, icon: "🏋️", bg: "#1a1a1a" },
  { name: "Table Tennis", count: 44, icon: "🏓", bg: "#141414" },
  { name: "Cricket", count: 60, icon: "🏏", bg: "#1a1a1a" },
  { name: "Padel", count: 24, icon: "🎯", bg: "#141414" },
];

export default function Categories() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Scale-up entrance (different from Heritage's word-by-word fade-up)
      gsap.fromTo(
        ".cat-card",
        { opacity: 0, scale: 0.88, clipPath: "inset(20% 0% 20% 0%)" },
        {
          opacity: 1,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.9,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#f5f0eb] py-16 md:py-32 px-6 md:px-16 lg:px-24"
    >
      <div className="flex justify-between items-end mb-10 md:mb-16">
        <div>
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            003 / Categories
          </p>
          <h2 className="text-[clamp(3.5rem,7vw,7rem)] font-black leading-none text-[#0a0a0a] uppercase">
            Everything
            <br />
            You Play
          </h2>
        </div>
        <a
          href="https://sportsnextdoor.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex text-xs uppercase tracking-[0.15em] text-[#0a0a0a]/60 hover:text-orange-500 border-b border-[#0a0a0a]/20 hover:border-orange-500 pb-0.5 transition-colors duration-300"
        >
          View All →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="cat-card group relative bg-[#0a0a0a] p-8 md:p-12 overflow-hidden opacity-0 min-h-[220px] md:min-h-[300px] flex flex-col justify-between"
            style={{ cursor: "pointer" }}
          >
            {/* Hover clip-path reveal */}
            <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />

            <div className="relative z-10">
              <span className="text-5xl md:text-6xl mb-4 md:mb-8 block">{cat.icon}</span>
              <h3 className="text-2xl md:text-3xl font-black uppercase text-white group-hover:text-[#0a0a0a] transition-colors duration-300 leading-tight">
                {cat.name}
              </h3>
              <p className="mt-2 text-white/70 group-hover:text-[#0a0a0a]/70 text-base md:text-lg transition-colors duration-300 font-medium">
                {cat.count}+ products
              </p>
            </div>

            <div className="relative z-10 mt-6 md:mt-10 flex justify-end">
              <span className="text-sm uppercase tracking-[0.15em] text-white/40 group-hover:text-[#0a0a0a]/70 transition-colors duration-300">
                Explore →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
