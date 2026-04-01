"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const FRAME_COUNT = 276;
const FRAME_PATH = "/frames/frame_";
const FRAME_EXT = ".jpg";

export default function CanvasHero() {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const loaderRef     = useRef<HTMLDivElement>(null);
  const loaderBarRef  = useRef<HTMLDivElement>(null);
  const loaderPctRef  = useRef<HTMLSpanElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    const dpr    = window.devicePixelRatio || 1;
    const frames: HTMLImageElement[] = [];
    let loaded      = 0;
    let currentIdx  = 0;
    let initDone    = false;
    let gsapCtx: ReturnType<typeof gsap.context> | null = null;

    /* ── Canvas resize ─────────────────────────────────────────── */
    function resize() {
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      drawFrame(currentIdx);
    }

    function drawFrame(idx: number) {
      const img = frames[idx];
      if (!img?.complete || !img.naturalWidth) return;
      const cw = window.innerWidth, ch = window.innerHeight;
      const iw = img.naturalWidth,  ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    window.addEventListener("resize", resize);
    resize();

    /* ── Preload frames ────────────────────────────────────────── */
    const PRIORITY = 18;
    let priorityDone = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH + String(i).padStart(4, "0") + FRAME_EXT;
      frames[i - 1] = img;

      const onDone = () => {
        loaded++;
        const pct = Math.round((loaded / FRAME_COUNT) * 100);
        if (loaderBarRef.current) loaderBarRef.current.style.width = `${pct}%`;
        if (loaderPctRef.current) loaderPctRef.current.textContent  = `${pct}%`;
        if (i <= PRIORITY) {
          priorityDone++;
          if (priorityDone === PRIORITY) { resize(); init(); }
        }
        if (loaded === FRAME_COUNT) init();
      };
      img.onload  = onDone;
      img.onerror = onDone;
    }

    /* ── Init ──────────────────────────────────────────────────── */
    function init() {
      if (initDone) return;
      initDone = true;

      gsapCtx = gsap.context(() => {
        // Kill loader
        gsap.to(loaderRef.current, {
          opacity: 0, duration: 0.5, delay: 0.2,
          onComplete: () => {
            if (loaderRef.current) loaderRef.current.style.display = "none";
          },
        });

        // Circle-wipe reveal — expand to cover full viewport corners
        gsap.fromTo(canvasWrapRef.current,
          { clipPath: "circle(0% at 50% 50%)" },
          { clipPath: "circle(150% at 50% 50%)", duration: 1.6, ease: "power2.out", delay: 0.3 }
        );

        // Scroll hint fade in after reveal completes
        gsap.fromTo(scrollHintRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, delay: 1.8 }
        );

        setupScrollTriggers();
      }, wrapperRef);
    }

    /* ── Scroll triggers ───────────────────────────────────────── */
    function setupScrollTriggers() {
      const wrapper = wrapperRef.current!;

      // Frame scrubber — 276 frames mapped linearly across 600vh of scroll.
      // All text, 3D visuals, and CTAs are baked into the Remotion-rendered frames.
      // No HTML text overlays — they caused double-text overlap with baked frame content.
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          const idx = Math.min(Math.floor(self.progress * FRAME_COUNT), FRAME_COUNT - 1);
          if (idx !== currentIdx) { currentIdx = idx; drawFrame(idx); }
        },
      });

      // Scroll hint fades out on first scroll
      gsap.to(scrollHintRef.current, {
        opacity: 0,
        scrollTrigger: { trigger: wrapper, start: "top top", end: "5% top", scrub: 1 },
      });
    }

    return () => {
      window.removeEventListener("resize", resize);
      gsapCtx?.revert();
    };
  }, []);

  return (
    <>
      {/* ── Loader ──────────────────────────────────────────────── */}
      <div ref={loaderRef} className="fixed inset-0 z-[9990] bg-[#0a0a0a] flex flex-col items-center justify-center gap-8">
        <p className="font-heading text-[clamp(3rem,8vw,6rem)] tracking-[0.08em] text-[#EEEAE4]">
          LODHI <span className="text-orange-500">SPORTS</span>
        </p>
        <div className="w-[200px] h-px bg-white/10 overflow-hidden">
          <div ref={loaderBarRef}
               className="h-full bg-orange-500 transition-[width] duration-200"
               style={{ width: "0%" }} />
        </div>
        <span ref={loaderPctRef}
              className="font-body text-[11px] tracking-[0.2em] uppercase text-white/30">
          0%
        </span>
      </div>

      {/* ── Scroll wrapper — 600vh gives smooth scrub time ──────── */}
      <div ref={wrapperRef} style={{ height: "600vh" }}>

        <div className="sticky top-0 h-screen overflow-hidden">

          {/* Canvas — all content lives in the Remotion-rendered frames */}
          <div ref={canvasWrapRef}
               className="absolute inset-0"
               style={{ clipPath: "circle(0% at 50% 50%)" }}>
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* Scroll hint */}
          <div ref={scrollHintRef}
               className="absolute bottom-[4vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-[10]"
               style={{ opacity: 0 }}>
            <span className="font-body text-[10px] tracking-[0.22em] uppercase text-white/30">Scroll</span>
            <div className="w-px h-14 bg-gradient-to-b from-orange-500 to-transparent animate-pulse" />
          </div>

        </div>
      </div>
    </>
  );
}
