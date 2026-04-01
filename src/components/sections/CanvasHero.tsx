"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const FRAME_COUNT = 276;
const FRAME_PATH = "/frames/frame_";
const FRAME_EXT = ".jpg";

const STATS = [
  { end: 1500, suffix: "+", label: "Products" },
  { end: 50, suffix: "+", label: "Premium Brands" },
  { end: 54, suffix: " yrs", label: "Of Heritage" },
];

export default function CanvasHero() {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const loaderRef     = useRef<HTMLDivElement>(null);
  const loaderBarRef  = useRef<HTMLDivElement>(null);
  const loaderPctRef  = useRef<HTMLSpanElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);
  const phase1Ref     = useRef<HTMLDivElement>(null);
  const phase2Ref     = useRef<HTMLDivElement>(null);
  const phase3Ref     = useRef<HTMLDivElement>(null);
  const phase4Ref     = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const statRefs      = useRef<(HTMLSpanElement | null)[]>([null, null, null]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    const dpr    = window.devicePixelRatio || 1;
    const frames: HTMLImageElement[] = [];
    let loaded      = 0;
    let currentIdx  = 0;
    let initDone    = false;

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

      // Kill loader
      gsap.to(loaderRef.current, {
        opacity: 0, duration: 0.5, delay: 0.2,
        onComplete: () => {
          if (loaderRef.current) loaderRef.current.style.display = "none";
        },
      });

      // Circle-wipe reveal
      gsap.fromTo(canvasWrapRef.current,
        { clipPath: "circle(0% at 50% 50%)" },
        { clipPath: "circle(75% at 50% 50%)", duration: 1.4, ease: "power2.out", delay: 0.3 }
      );

      // Phase 1 entrance
      const tl = gsap.timeline({ delay: 0.7 });
      tl.fromTo(".ch-label", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      tl.fromTo(".ch-word",  { yPercent: 110 }, { yPercent: 0, duration: 1.0, stagger: 0.07, ease: "power3.out" }, "-=0.2");
      tl.fromTo(".ch-sub",   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.5");
      tl.fromTo(scrollHintRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2");

      setupScrollTriggers();
    }

    /* ── Scroll triggers ───────────────────────────────────────── */
    function setupScrollTriggers() {
      const wrapper = wrapperRef.current!;

      // Frame scrubber + overlay
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          const p = self.progress;
          const idx = Math.min(Math.floor(p * FRAME_COUNT), FRAME_COUNT - 1);
          if (idx !== currentIdx) { currentIdx = idx; drawFrame(idx); }

          // Stats overlay — ramps up before phase3 enters, clears as phase3 exits
          if (overlayRef.current) {
            let alpha = 0;
            if (p >= 0.52 && p <= 0.82) {
              if      (p < 0.58) alpha = ((p - 0.52) / 0.06) * 0.98;
              else if (p < 0.73) alpha = 0.98;
              else               alpha = Math.max(0, 0.98 - ((p - 0.73) / 0.09) * 0.98);
            }
            overlayRef.current.style.backgroundColor = `rgba(0,0,0,${alpha})`;
          }
        },
      });

      // Phase 1 → out
      gsap.to(phase1Ref.current, {
        opacity: 0, y: -40,
        scrollTrigger: { trigger: wrapper, start: "10% top", end: "18% top", scrub: 1 },
      });
      gsap.to(scrollHintRef.current, {
        opacity: 0,
        scrollTrigger: { trigger: wrapper, start: "top top", end: "7% top", scrub: 1 },
      });

      // Phase 2 → in (gap: 18→24, ensures phase1 fully gone before phase2 appears)
      gsap.fromTo(phase2Ref.current,
        { opacity: 0, y: -80 },
        { opacity: 1, y: 0,
          scrollTrigger: { trigger: wrapper, start: "24% top", end: "35% top", scrub: 1 } }
      );
      // Phase 2 → out
      gsap.to(phase2Ref.current, {
        opacity: 0, y: -60,
        scrollTrigger: { trigger: wrapper, start: "44% top", end: "52% top", scrub: 1 },
      });

      // Phase 3 → in (gap: 52→56, ensures phase2 fully gone before phase3 appears)
      gsap.fromTo(phase3Ref.current,
        { opacity: 0, y: -80, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1,
          scrollTrigger: { trigger: wrapper, start: "56% top", end: "66% top", scrub: 1 } }
      );
      // Phase 3 → out
      gsap.to(phase3Ref.current, {
        opacity: 0, y: -40,
        scrollTrigger: { trigger: wrapper, start: "73% top", end: "80% top", scrub: 1 },
      });

      // Counters — fire once on phase 3 enter
      let countersRun = false;
      ScrollTrigger.create({
        trigger: wrapper,
        start: "56% top",
        onEnter: () => {
          if (countersRun) return;
          countersRun = true;
          STATS.forEach(({ end }, i) => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: end, duration: 2.2, ease: "power1.out",
              onUpdate: () => {
                const el = statRefs.current[i];
                if (el) el.textContent = Math.round(obj.val).toLocaleString();
              },
            });
          });
        },
      });

      // Phase 4 → in (gap: 80→84, ensures phase3 fully gone before phase4 appears)
      gsap.fromTo(phase4Ref.current,
        { opacity: 0, x: 80 },
        { opacity: 1, x: 0,
          scrollTrigger: { trigger: wrapper, start: "84% top", end: "93% top", scrub: 1 } }
      );
    }

    return () => {
      window.removeEventListener("resize", resize);
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

      {/* ── Scroll wrapper ──────────────────────────────────────── */}
      <div ref={wrapperRef} style={{ height: "600vh" }}>

        {/* Sticky viewport — stays pinned while the wrapper scrolls */}
        <div className="sticky top-0 h-screen overflow-hidden">

          {/* Canvas */}
          <div ref={canvasWrapRef}
               className="absolute inset-0"
               style={{ clipPath: "circle(0% at 50% 50%)" }}>
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* Dark overlay (stats phase) */}
          <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-[2]" />

          {/* Vignette — always present for text legibility */}
          <div className="absolute inset-0 pointer-events-none z-[3]"
               style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(4,3,2,0.55) 100%)" }} />

          {/* ── Phase 1 — Hero ──────────────────────────────────── */}
          <div ref={phase1Ref}
               className="absolute inset-0 z-[10] flex flex-col justify-end px-[5vw] pb-[10vh] pointer-events-none">
            <p className="ch-label font-body text-[13px] tracking-[0.22em] uppercase text-orange-500 mb-5 font-semibold"
               style={{ opacity: 0 }}>
              001 / Your Potential
            </p>
            <h1 className="font-heading text-[clamp(7rem,15vw,15rem)] leading-[0.85] tracking-wide uppercase text-[#EEEAE4]"
                aria-label="Push Further">
              <span className="block overflow-hidden">
                <span className="ch-word block" style={{ transform: "translateY(110%)" }}>PUSH</span>
              </span>
              <span className="block overflow-hidden">
                <span className="ch-word block" style={{ transform: "translateY(110%)" }}>FURTHER.</span>
              </span>
            </h1>
            <p className="ch-sub font-body text-[clamp(1.2rem,1.8vw,1.5rem)] tracking-wide text-[#EEEAE4]/90 mt-6 max-w-lg leading-relaxed"
               style={{ opacity: 0 }}>
              India&apos;s premium sports &amp; fitness destination.<br />
              Gear that performs as hard as you do.
            </p>
          </div>

          {/* ── Scroll hint ─────────────────────────────────────── */}
          <div ref={scrollHintRef}
               className="absolute bottom-[4vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-[10]"
               style={{ opacity: 0 }}>
            <span className="font-body text-[10px] tracking-[0.22em] uppercase text-white/30">Scroll</span>
            <div className="w-px h-14 bg-gradient-to-b from-orange-500 to-transparent animate-pulse" />
          </div>

          {/* ── Phase 2 — Philosophy (drops from above) ─────────── */}
          <div ref={phase2Ref}
               className="absolute inset-0 z-[10] flex items-center px-[5vw] pointer-events-none"
               style={{ opacity: 0, transform: "translateY(-80px)" }}>
            <div className="max-w-[50vw]">
              <p className="font-body text-[13px] tracking-[0.22em] uppercase text-orange-500 mb-5 font-semibold">
                002 / The Philosophy
              </p>
              <h2 className="font-heading text-[clamp(4rem,8vw,9rem)] leading-none uppercase text-[#EEEAE4]">
                Mastery takes<br />
                <span className="text-orange-500">the right tools.</span>
              </h2>
              <p className="font-body text-[clamp(1.1rem,1.6vw,1.35rem)] tracking-wide text-[#EEEAE4]/85 mt-6 max-w-md leading-relaxed">
                54 years equipping India&apos;s finest athletes.<br />
                Every product curated, tested, and trusted.
              </p>
            </div>
          </div>

          {/* ── Phase 3 — Stats (drops from above, anchored to bottom) ── */}
          <div ref={phase3Ref}
               className="absolute inset-x-0 bottom-0 z-[10] pointer-events-none pb-[6vh]"
               style={{ opacity: 0, transform: "translateY(-80px)" }}>
            <p className="font-body text-[13px] tracking-[0.28em] uppercase text-orange-500 mb-8 text-center">
              003 / The Numbers
            </p>
            <div className="flex border-t border-white/[0.15]">
              {STATS.map(({ suffix, label }, i) => (
                <div key={label} className="flex-1 flex flex-col items-center pt-10 border-r border-white/[0.15] last:border-0">
                  <div className="flex items-start gap-1">
                    <span
                      ref={(el) => { statRefs.current[i] = el; }}
                      className="font-heading text-[clamp(4rem,7vw,8rem)] leading-none text-[#EEEAE4]"
                    >
                      0
                    </span>
                    <span className="font-heading text-[clamp(1.8rem,3vw,3.5rem)] leading-none text-orange-500 mt-2">
                      {suffix}
                    </span>
                  </div>
                  <p className="font-body text-base tracking-[0.15em] uppercase text-[#EEEAE4]/80 mt-4 font-medium">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Phase 4 — CTA (slides from right) ───────────────── */}
          <div ref={phase4Ref}
               className="absolute inset-0 z-[10] flex items-center justify-end px-[5vw]"
               style={{ opacity: 0 }}>
            <div className="text-right max-w-[50vw]">
              <p className="font-body text-[13px] tracking-[0.22em] uppercase text-orange-500 mb-5 font-semibold">
                004 / Explore
              </p>
              <h2 className="font-heading text-[clamp(4rem,9vw,10rem)] leading-[0.85] uppercase text-[#EEEAE4]">
                Gear Up.<br />
                <span className="text-orange-500">Game On.</span>
              </h2>
              <div className="mt-8 flex gap-6 justify-end flex-wrap pointer-events-auto">
                <a href="https://lodhisport.com/"
                   target="_blank" rel="noopener noreferrer"
                   className="font-body text-[15px] tracking-[0.15em] uppercase font-semibold bg-orange-500 text-white px-10 py-4 hover:bg-orange-400 transition-colors duration-300">
                  Explore Collection
                </a>
                <a href="https://wa.me/918368249099"
                   target="_blank" rel="noopener noreferrer"
                   className="font-body text-[15px] tracking-[0.15em] uppercase text-[#EEEAE4]/80 border-b border-[#EEEAE4]/30 pb-0.5 hover:text-orange-500 hover:border-orange-500 transition-colors duration-300 self-center">
                  WhatsApp Us →
                </a>
              </div>
            </div>
          </div>

        </div>{/* /sticky */}
      </div>{/* /wrapper */}
    </>
  );
}
