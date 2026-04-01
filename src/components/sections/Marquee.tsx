"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const TEXT =
  "BADMINTON • TENNIS • FITNESS • TABLE TENNIS • CRICKET • PADEL • PICKLEBALL • SQUASH • BOXING • SWIMMING •";

export default function Marquee() {
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Row 1: moves left on scroll
      gsap.to(track1Ref.current, {
        xPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Row 2: moves right on scroll (opposite direction)
      gsap.to(track2Ref.current, {
        xPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Fade in on enter
      if (!prefersReducedMotion) {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#f5f0eb] py-8 overflow-hidden opacity-0"
    >
      {/* Row 1 — left */}
      <div ref={track1Ref} className="flex whitespace-nowrap mb-2" style={{ willChange: "transform" }}>
        <span className="text-[clamp(2rem,4.5vw,4rem)] font-black uppercase text-[#0a0a0a] tracking-tight shrink-0 pr-8">
          {TEXT}&nbsp;&nbsp;{TEXT}&nbsp;&nbsp;{TEXT}
        </span>
      </div>

      {/* Row 2 — right (orange accent) */}
      <div ref={track2Ref} className="flex whitespace-nowrap" style={{ willChange: "transform", transform: "translateX(-10%)" }}>
        <span className="text-[clamp(2rem,4.5vw,4rem)] font-black uppercase tracking-tight shrink-0 pr-8">
          <span className="text-orange-500">{TEXT}</span>
          &nbsp;&nbsp;
          <span className="text-[#0a0a0a]/20">{TEXT}</span>
          &nbsp;&nbsp;
          <span className="text-orange-500">{TEXT}</span>
        </span>
      </div>
    </section>
  );
}
