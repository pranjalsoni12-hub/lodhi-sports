"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-white/5 pointer-events-none">
      <div
        ref={barRef}
        className="h-full bg-orange-500 origin-left"
        style={{ transform: "scaleX(0)", willChange: "transform" }}
      />
    </div>
  );
}
