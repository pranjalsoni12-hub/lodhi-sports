"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (isMobile || !dotRef.current || !ringRef.current) return;

    let appeared = false;

    const onMove = (e: MouseEvent) => {
      // First move: snap to position then reveal
      if (!appeared) {
        appeared = true;
        gsap.set([dotRef.current, ringRef.current], { x: e.clientX, y: e.clientY });
        gsap.to([dotRef.current, ringRef.current], { opacity: 1, duration: 0.3 });
      }

      gsap.to(dotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        overwrite: "auto",
      });
      gsap.to(ringRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const onEnter = () =>
      gsap.to(ringRef.current, { scale: 2.5, duration: 0.3, ease: "power2.out" });
    const onLeave = () =>
      gsap.to(ringRef.current, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });

    window.addEventListener("mousemove", onMove);

    // Attach to interactive elements once DOM is ready
    function attachInteractives() {
      document.querySelectorAll("a, button, [data-cursor-grow]").forEach(el => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    }
    attachInteractives();

    // Re-run after a tick so dynamically rendered elements are caught
    const t = setTimeout(attachInteractives, 1200);

    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", onMove);
      document.querySelectorAll("a, button, [data-cursor-grow]").forEach(el => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Dot — snappy, tracks exactly */}
      <div
        ref={dotRef}
        style={{ opacity: 0, willChange: "transform" }}
        className="fixed top-0 left-0 w-3 h-3 bg-orange-500 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
      />
      {/* Ring — lags slightly for the premium feel */}
      <div
        ref={ringRef}
        style={{ opacity: 0, willChange: "transform" }}
        className="fixed top-0 left-0 w-12 h-12 border-2 border-orange-500 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
      />
    </>
  );
}
