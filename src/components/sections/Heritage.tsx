"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const stats = [
  { value: 50, suffix: "+", label: "Premium Brands" },
  { value: 1500, suffix: "+", label: "Products" },
  { value: 4.8, suffix: "★", label: "Google Rating" },
  { value: 5, suffix: "+", label: "Years Online" },
];

export default function Heritage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const countRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Pin section while heading animates word by word
      const words = headingRef.current?.querySelectorAll(".word");
      if (words && !prefersReducedMotion) {
        gsap.fromTo(
          words,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 75%",
            },
          }
        );
      }

      // Count-up animations
      stats.forEach((stat, i) => {
        const el = countRefs.current[i];
        if (!el || prefersReducedMotion) return;

        const isDecimal = stat.value % 1 !== 0;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: stat.value,
          duration: 2,
          ease: "power1.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            once: true,
          },
          onUpdate: () => {
            if (el) {
              el.textContent = isDecimal
                ? counter.val.toFixed(1)
                : Math.round(counter.val).toLocaleString();
            }
          },
        });
      });

      // Stats stagger reveal
      if (!prefersReducedMotion) {
        gsap.fromTo(
          ".stat-item",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
            },
          }
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const headingText = ["50+", "years.", "One", "destination."];

  return (
    <section
      ref={sectionRef}
      className="bg-[#0a0a0a] py-32 px-8 md:px-16 lg:px-24"
    >
      <p className="text-orange-500 text-sm font-semibold uppercase tracking-[0.2em] mb-8">
        002 / Heritage
      </p>

      <h2
        ref={headingRef}
        className="text-[clamp(3rem,7vw,7rem)] font-black leading-[1] text-white mb-20 max-w-4xl"
        aria-label="50+ years. One destination."
      >
        {headingText.map((word, i) => (
          <span
            key={i}
            className="word inline-block mr-[0.25em] opacity-0"
            style={word === "50+" ? { color: "#F97316" } : {}}
          >
            {word}
          </span>
        ))}
      </h2>

      <div
        ref={statsRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-12"
      >
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-item opacity-0">
            <div className="flex items-end gap-1">
              <span
                ref={(el) => {
                  countRefs.current[i] = el;
                }}
                className="text-[clamp(3rem,6vw,5rem)] font-black text-white leading-none"
              >
                0
              </span>
              <span className="text-[clamp(2rem,4vw,3.5rem)] font-black text-orange-500 leading-none mb-1">
                {stat.suffix}
              </span>
            </div>
            <p className="mt-3 text-base uppercase tracking-[0.12em] text-white/70 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
