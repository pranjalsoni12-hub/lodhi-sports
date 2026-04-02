"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/* ── Config ──────────────────────────────────────────────────── */
const FRAME_COUNT = 276;
const FRAME_SPEED = 2.0;
const FRAME_PATH  = "/frames/frame_";
const FRAME_EXT   = ".jpg";
const IMAGE_SCALE = 0.86;

export default function ScrollExperience() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef  = useRef<HTMLDivElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const overlayRef     = useRef<HTMLDivElement>(null);
  const marqueeRef     = useRef<HTMLDivElement>(null);
  const loaderRef      = useRef<HTMLDivElement>(null);
  const loaderBarRef   = useRef<HTMLDivElement>(null);
  const loaderPctRef   = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    const dpr    = window.devicePixelRatio || 1;
    const frames: HTMLImageElement[] = [];
    let loaded    = 0;
    let currentIdx = 0;
    let initDone  = false;

    /* ── Canvas resize ─────────────────────────────────────── */
    function resizeCanvas() {
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
      const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
      const dw = iw * scale, dh = ih * scale;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    /* ── Preloader ─────────────────────────────────────────── */
    const PRIORITY = 12;
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
          if (priorityDone === PRIORITY) { resizeCanvas(); init(); }
        }
        if (loaded === FRAME_COUNT) init();
      };
      img.onload = onDone;
      img.onerror = onDone;
    }

    /* ── Init ──────────────────────────────────────────────── */
    function init() {
      if (initDone) return;
      initDone = true;

      // Hide loader
      gsap.to(loaderRef.current, {
        opacity: 0, duration: 0.6, delay: 0.2,
        onComplete: () => { if (loaderRef.current) loaderRef.current.style.display = "none"; },
      });

      // Circle-wipe open
      gsap.to(canvasWrapRef.current, {
        clipPath: "circle(75% at 50% 50%)",
        duration: 1.4, ease: "power2.out", delay: 0.3,
      });

      heroEntrance();
      setupScrollTriggers();
    }

    /* ── Hero entrance ─────────────────────────────────────── */
    function heroEntrance() {
      const tl = gsap.timeline({ delay: 0.5 });
      tl.fromTo(".ls-hw", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.1, ease: "power3.out" });
      tl.fromTo(".ls-hero-sub",  { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, "-=0.5");
      tl.fromTo(".ls-scroll-hint", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3");
    }

    /* ── Scroll triggers ───────────────────────────────────── */
    function setupScrollTriggers() {
      const container = containerRef.current!;

      // Frame scrubber + global updates
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          const p = self.progress;

          // Draw frame
          const acc = Math.min(p * FRAME_SPEED, 1);
          const idx = Math.min(Math.floor(acc * FRAME_COUNT), FRAME_COUNT - 1);
          if (idx !== currentIdx) { currentIdx = idx; drawFrame(idx); }

          // Dark overlay (for stats section 42-60%)
          let alpha = 0;
          if (p >= 0.42 && p <= 0.60) {
            if      (p < 0.46) alpha = ((p - 0.42) / 0.04) * 0.88;
            else if (p < 0.56) alpha = 0.88;
            else               alpha = Math.max(0, 0.88 - ((p - 0.56) / 0.04) * 0.88);
          }
          if (overlayRef.current) overlayRef.current.style.background = `rgba(4,3,2,${alpha})`;

          // Marquee fades in at 38% scroll
          if (marqueeRef.current) {
            marqueeRef.current.style.opacity = String(gsap.utils.clamp(0, 1, (p - 0.38) / 0.08));
          }
        },
      });

      // Hero text fades out
      gsap.to(".ls-hero", {
        opacity: 0, y: -40,
        scrollTrigger: { trigger: container, start: "top top", end: "12% top", scrub: 1 },
      });
      gsap.to(".ls-scroll-hint", {
        opacity: 0,
        scrollTrigger: { trigger: container, start: "top top", end: "6% top", scrub: 1 },
      });

      // Sections
      setupSection("#ls-sec-mastery", 22, 38, "slide-left");
      setupSection("#ls-sec-stats",   42, 60, "scale-up");
      setupSection("#ls-sec-trust",   62, 80, "slide-right");

      // CTA
      const ctaEls = document.querySelectorAll(".ls-cta-el");
      gsap.set(ctaEls, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: container,
        start: "85% top",
        onEnter: () => gsap.to(ctaEls, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out" }),
      });
    }

    function setupSection(
      selector: string,
      enterPct: number,
      leavePct: number,
      animation: string
    ) {
      const sec = document.querySelector(selector) as HTMLElement;
      if (!sec) return;
      const container = containerRef.current!;
      const mid = (enterPct + leavePct) / 2;
      sec.style.top = `${mid * 920}vh`;

      const innerEls = sec.querySelectorAll<HTMLElement>(
        ".ls-label, .ls-heading, .ls-body, .ls-stats-grid, .ls-trust-list"
      );

      const fromVars: gsap.TweenVars =
        animation === "slide-left"  ? { opacity: 0, x: -80 }  :
        animation === "slide-right" ? { opacity: 0, x:  80 }  :
        animation === "scale-up"    ? { opacity: 0, scale: 0.85 } :
                                      { opacity: 0, y: 50 };

      const ease =
        animation === "scale-up" ? "power2.out" : "power3.out";

      ScrollTrigger.create({
        trigger: container,
        start: `${enterPct}% top`,
        end:   `${leavePct}% top`,
        onEnter() {
          gsap.set(sec, { opacity: 1, pointerEvents: "auto" });
          gsap.fromTo(innerEls, fromVars, {
            opacity: 1, x: 0, y: 0, scale: 1,
            duration: 0.9, stagger: 0.12, ease,
            onComplete: () => animateCounters(sec),
          });
        },
        onLeave:      () => gsap.to(sec, { opacity: 0, duration: 0.5, pointerEvents: "none" }),
        onLeaveBack:  () => gsap.to(sec, { opacity: 0, duration: 0.5, pointerEvents: "none" }),
        onEnterBack() {
          gsap.set(sec, { opacity: 1, pointerEvents: "auto" });
          gsap.fromTo(innerEls, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" });
        },
      });
    }

    function animateCounters(section: Element) {
      section.querySelectorAll<HTMLElement>(".ls-stat-num[data-value]").forEach(el => {
        if (el.dataset.animated) return;
        el.dataset.animated = "true";
        const target   = parseFloat(el.dataset.value!);
        const decimals = parseInt(el.dataset.decimals || "0");
        gsap.fromTo(el,
          { textContent: "0" },
          {
            textContent: String(target),
            duration: 2, ease: "power1.out",
            snap: { textContent: decimals === 0 ? 1 : 0.01 },
            onUpdate() {
              const v = parseFloat(el.textContent || "0");
              el.textContent = decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toString();
            },
          }
        );
      });
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  /* ── Marquee text ──────────────────────────────────────────── */
  const MARQUEE = "BADMINTON\u00A0•\u00A0TENNIS\u00A0•\u00A0FITNESS\u00A0•\u00A0CRICKET\u00A0•\u00A0BOXING\u00A0•\u00A0TABLE TENNIS\u00A0•\u00A0SQUASH\u00A0•\u00A0";
  const marqueeItems = Array(4).fill(MARQUEE).join("");

  return (
    <>
      {/* ── Loader ──────────────────────────────────────────── */}
      <div ref={loaderRef} className="fixed inset-0 z-[9990] bg-[#0a0a0a] flex flex-col items-center justify-center gap-8">
        <p className="font-heading text-[clamp(3rem,8vw,6rem)] tracking-[0.08em] text-[#EEEAE4]">
          LODHI <span className="text-orange-500">SPORTS</span>
        </p>
        <div className="w-[min(200px,60vw)] h-px bg-white/10 overflow-hidden">
          <div ref={loaderBarRef} className="h-full bg-orange-500 transition-[width] duration-200" style={{ width: "0%" }} />
        </div>
        <span ref={loaderPctRef} className="font-body text-[11px] tracking-[0.2em] uppercase text-white/30">0%</span>
      </div>

      {/* ── Canvas ──────────────────────────────────────────── */}
      <div ref={canvasWrapRef} className="fixed inset-0 z-0" style={{ clipPath: "circle(0% at 50% 50%)" }}>
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* ── Dark overlay ────────────────────────────────────── */}
      <div ref={overlayRef} className="fixed inset-0 z-[5] pointer-events-none" />

      {/* ── Marquee ─────────────────────────────────────────── */}
      <div ref={marqueeRef} className="fixed bottom-0 left-0 right-0 z-[20] overflow-hidden pointer-events-none opacity-0">
        <div className="marquee-track flex whitespace-nowrap w-max">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="font-heading text-[12vw] leading-none tracking-wide uppercase text-white/10 pr-[4vw]">
              {marqueeItems}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scroll container (920vh) ─────────────────────────── */}
      <div ref={containerRef} className="relative z-[10]" style={{ height: "920vh" }}>

        {/* Hero (0–12%) */}
        <div className="ls-hero absolute top-0 h-screen w-full flex flex-col justify-end pointer-events-none px-[5vw] pb-[10vh]">
          <p className="ls-label font-body text-[11px] tracking-[0.28em] uppercase text-orange-500/80 mb-5">
            001 / Your Potential
          </p>
          <h1 className="font-heading text-[clamp(4rem,14vw,14rem)] leading-[0.88] tracking-wide uppercase text-[#EEEAE4]"
              aria-label="Push Further">
            <span className="block overflow-hidden"><span className="ls-hw block">PUSH</span></span>
            <span className="block overflow-hidden"><span className="ls-hw block">FURTHER.</span></span>
          </h1>
          <p className="ls-hero-sub font-body text-[clamp(0.8rem,1.2vw,1.05rem)] tracking-wide text-[#EEEAE4]/50 mt-4 max-w-md leading-relaxed opacity-0">
            India&apos;s premium sports &amp; fitness store.<br />Gear that performs as hard as you do.
          </p>

          <div className="ls-scroll-hint absolute bottom-[3vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0">
            <span className="font-body text-[10px] tracking-[0.22em] uppercase text-white/30">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-orange-500 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Section 2 — Mastery (22–38%) slide-left */}
        <div id="ls-sec-mastery"
             className="content-section absolute left-0 right-0 flex items-center pointer-events-none opacity-0 px-[5vw]"
             style={{ transform: "translateY(-50%)" }}>
          <div className="max-w-[min(40vw,90vw)] w-full">
            <p className="ls-label font-body text-[11px] tracking-[0.28em] uppercase text-orange-500/85 mb-5">
              002 / The Philosophy
            </p>
            <h2 className="ls-heading font-heading text-[clamp(2.5rem,8vw,9rem)] leading-[0.88] uppercase text-[#EEEAE4]">
              Mastery takes<br />
              <span className="text-orange-500">the right tools.</span>
            </h2>
            <p className="ls-body font-body text-[clamp(0.85rem,1.1vw,1rem)] tracking-wide text-[#EEEAE4]/50 mt-5 max-w-[380px] leading-loose">
              We&apos;ve been equipping India&apos;s athletes for 54 years and counting.
              Every product curated, tested, and trusted.
            </p>
          </div>
        </div>

        {/* Section 3 — Stats (42–60%) scale-up + dark overlay */}
        <div id="ls-sec-stats"
             className="content-section absolute left-0 right-0 flex items-center justify-center pointer-events-none opacity-0"
             style={{ transform: "translateY(-50%)" }}>
          <div style={{ width: "100%" }}>
            <p className="ls-label font-body text-[11px] tracking-[0.28em] uppercase text-orange-500/85 mb-10 text-center">
              003 / The Numbers
            </p>
            <div className="ls-stats-grid grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
              {[
                { value: "1500", suffix: "+", label: "Products" },
                { value: "50",   suffix: "+", label: "Premium Brands" },
                { value: "54",   suffix: "yrs", label: "Of Heritage" },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center py-8 sm:py-16 px-4 sm:px-8">
                  <div className="flex items-baseline gap-1">
                    <span className="ls-stat-num font-heading text-[clamp(4.5rem,9vw,10rem)] leading-none text-[#EEEAE4]"
                          data-value={s.value} data-decimals="0">0</span>
                    <span className="font-heading text-[clamp(2rem,4vw,4.5rem)] leading-none text-orange-500">{s.suffix}</span>
                  </div>
                  <p className="font-body text-[11px] tracking-[0.22em] uppercase text-[#EEEAE4]/35 mt-3">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4 — Trust (62–80%) slide-right */}
        <div id="ls-sec-trust"
             className="content-section absolute left-0 right-0 flex items-center justify-end pointer-events-none opacity-0 px-[5vw]"
             style={{ transform: "translateY(-50%)" }}>
          <div className="max-w-[min(40vw,90vw)] w-full text-right">
            <p className="ls-label font-body text-[11px] tracking-[0.28em] uppercase text-orange-500/85 mb-5">
              004 / Why India Trusts Us
            </p>
            <h2 className="ls-heading font-heading text-[clamp(2.5rem,8vw,9rem)] leading-[0.88] uppercase text-[#EEEAE4]">
              India<br />trusts<br /><span className="text-orange-500">us.</span>
            </h2>
            <ul className="ls-trust-list mt-8 space-y-5 text-left">
              {[
                { icon: "✓", title: "100% Genuine Products",     desc: "Pre-dispatch quality check on every order" },
                { icon: "🚚", title: "Free Shipping on ₹1,000+", desc: "Delivered pan-India, no hidden charges" },
                { icon: "💬", title: "WhatsApp Support 24/7",    desc: "Real humans. Real answers. Instant." },
                { icon: "↩",  title: "7-Day Easy Returns",       desc: "No questions asked return policy" },
              ].map(item => (
                <li key={item.title} className="flex gap-4 items-start">
                  <span className="w-9 h-9 flex-shrink-0 rounded-full border border-orange-500/30 flex items-center justify-center text-sm mt-0.5">
                    {item.icon}
                  </span>
                  <div>
                    <p className="font-body font-medium text-[0.95rem] tracking-wide text-[#EEEAE4]">{item.title}</p>
                    <p className="font-body text-[0.8rem] tracking-wide text-[#EEEAE4]/40">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Final (85–100%) — sits at bottom of scroll container */}
        <div className="absolute bottom-0 left-0 right-0 min-h-screen flex flex-col items-center justify-center text-center px-[5vw] bg-[#0a0a0a]">
          <p className="ls-cta-el font-body text-[11px] tracking-[0.28em] uppercase text-orange-500/80 mb-6">
            005 / Game On
          </p>
          <h2 className="ls-cta-el font-heading text-[clamp(5rem,13vw,14rem)] leading-[0.85] uppercase text-[#EEEAE4]">
            Gear Up.<br /><span className="text-orange-500">Game On.</span>
          </h2>
          <p className="ls-cta-el font-body text-[0.85rem] tracking-[0.2em] uppercase text-[#EEEAE4]/35 mt-4 mb-12">
            Health &amp; Fitness Since 1970 &nbsp;·&nbsp; lodhisports.com
          </p>
          <div className="ls-cta-el flex items-center gap-6 flex-wrap justify-center">
            <a href="https://sportsnextdoor.com" target="_blank" rel="noopener noreferrer"
               className="font-body text-[12px] tracking-[0.2em] uppercase font-semibold bg-orange-500 text-white px-12 py-4 hover:bg-orange-400 transition-colors duration-300">
              Explore Collection
            </a>
            <a href="https://wa.me/919873408937?text=Hi%2C%20I%20want%20to%20explore%20your%20sports%20collection"
               target="_blank" rel="noopener noreferrer"
               className="font-body text-[12px] tracking-[0.2em] uppercase text-[#EEEAE4]/55 border-b border-[#EEEAE4]/20 pb-0.5 hover:text-orange-500 hover:border-orange-500 transition-colors duration-300">
              WhatsApp Us →
            </a>
          </div>

          {/* Footer meta */}
          <div className="ls-cta-el absolute bottom-[5vh] left-0 right-0 flex flex-col md:flex-row items-center justify-between gap-3 px-[5vw]">
            <span className="font-heading text-lg tracking-wide text-[#EEEAE4]/20">LODHI SPORTS</span>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {["Badminton","Fitness","Cricket","Tennis"].map(cat => (
                <a key={cat}
                   href={`https://sportsnextdoor.com/collections/${cat.toLowerCase()}`}
                   target="_blank" rel="noopener noreferrer"
                   className="font-body text-[10px] tracking-[0.18em] uppercase text-[#EEEAE4]/25 hover:text-orange-500 transition-colors">
                  {cat}
                </a>
              ))}
            </div>
            <span className="font-body text-[10px] tracking-[0.14em] text-[#EEEAE4]/20 text-center">
              © 2025 Lodhi Sports · +91 83682 49099
            </span>
          </div>
        </div>

      </div>{/* /scroll-container */}
    </>
  );
}
