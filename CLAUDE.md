# CLAUDE.md — Animated Scroll Website

> Universal guide for building any premium, scroll-animated website.
> Follow every instruction here to produce Awwwards-level quality.

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR, file-based routing, optimal performance |
| Language | **TypeScript** | Type safety across all components |
| Styling | **Tailwind CSS** | Utility-first, no runtime cost |
| Smooth Scroll | **Lenis** | Buttery smooth native scroll override |
| Animations | **GSAP + ScrollTrigger** | Industry standard, precise scroll sync |
| React Animations | **Framer Motion** | Component-level mount/unmount transitions |
| 3D (optional) | **Three.js / React Three Fiber** | 3D scenes, shaders, interactive models |
| Font Loading | **next/font** | Zero layout shift |
| Images | **next/image** | Automatic WebP, lazy loading, CDN |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — Lenis provider lives here
│   ├── page.tsx            # Home page — assembles all sections
│   └── globals.css         # Base styles, CSS variables, font-face
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/           # One file per scroll section
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Features.tsx
│   │   ├── Gallery.tsx
│   │   ├── Testimonials.tsx
│   │   └── Contact.tsx
│   └── ui/                 # Reusable animated primitives
│       ├── SplitText.tsx
│       ├── RevealText.tsx
│       ├── MagneticButton.tsx
│       ├── ParallaxImage.tsx
│       └── HorizontalScroll.tsx
├── hooks/
│   ├── useLenis.ts         # Access lenis instance anywhere
│   ├── useGSAP.ts          # Scoped GSAP context with cleanup
│   └── useMediaQuery.ts    # Disable heavy animations on mobile
├── lib/
│   ├── gsap.ts             # Register all GSAP plugins once
│   └── lenis.ts            # Lenis singleton
└── providers/
    └── SmoothScrollProvider.tsx
```

---

## Lenis + GSAP Setup (Critical — Do This First)

### `src/lib/gsap.ts`
```ts
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Prevent lag smoothing — Lenis handles this
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger };
```

### `src/providers/SmoothScrollProvider.tsx`
```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, []);

  return <>{children}</>;
}
```

### `src/app/layout.tsx`
```tsx
import SmoothScrollProvider from "@/providers/SmoothScrollProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
```

---

## Animation Primitives (Build These as Reusable Components)

### 1. Reveal on Scroll (fade + rise)
```tsx
useEffect(() => {
  gsap.fromTo(ref.current,
    { opacity: 0, y: 60 },
    {
      opacity: 1, y: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 85%", toggleActions: "play none none none" }
    }
  );
}, []);
```

### 2. Staggered Children
```tsx
gsap.fromTo(".card",
  { opacity: 0, y: 40 },
  { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out",
    scrollTrigger: { trigger: containerRef.current, start: "top 75%" }
  }
);
```

### 3. Text Split Animation (char by char)
```tsx
const split = new SplitText(titleRef.current, { type: "chars,words" });
gsap.fromTo(split.chars,
  { opacity: 0, y: 80, rotationX: -90 },
  { opacity: 1, y: 0, rotationX: 0, duration: 0.8, stagger: 0.03, ease: "back.out(1.7)",
    scrollTrigger: { trigger: titleRef.current, start: "top 80%" }
  }
);
```

### 4. Pinned Scroll Section (element stays while page scrolls)
```tsx
ScrollTrigger.create({
  trigger: sectionRef.current,
  start: "top top",
  end: "+=200%",
  pin: true,
  scrub: 1,
});
```

### 5. Horizontal Scroll
```tsx
gsap.to(trackRef.current, {
  x: () => -(trackRef.current.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: containerRef.current,
    start: "top top",
    end: () => `+=${trackRef.current.scrollWidth - window.innerWidth}`,
    pin: true,
    scrub: 1,
  }
});
```

### 6. Parallax Image
```tsx
gsap.to(imgRef.current, {
  y: "20%",
  ease: "none",
  scrollTrigger: { trigger: wrapperRef.current, start: "top bottom", end: "bottom top", scrub: true }
});
```

### 7. Magnetic Button
```tsx
const handleMouseMove = (e) => {
  const { left, top, width, height } = btnRef.current.getBoundingClientRect();
  const x = (e.clientX - left - width / 2) * 0.3;
  const y = (e.clientY - top - height / 2) * 0.3;
  gsap.to(btnRef.current, { x, y, duration: 0.6, ease: "power3.out" });
};
const handleMouseLeave = () => gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
```

### 8. Custom Cursor
```tsx
gsap.to(cursorRef.current, { x: mouseX, y: mouseY, duration: 0.6, ease: "power3.out" });
document.querySelectorAll("a, button").forEach(el => {
  el.addEventListener("mouseenter", () => gsap.to(cursorRef.current, { scale: 2.5, duration: 0.3 }));
  el.addEventListener("mouseleave", () => gsap.to(cursorRef.current, { scale: 1, duration: 0.3 }));
});
```

### 9. Clip-Path Image Reveal
```tsx
gsap.fromTo(imgRef.current,
  { clipPath: "inset(20% 20% 20% 20%)" },
  { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut",
    scrollTrigger: { trigger: sectionRef.current, start: "top 70%", end: "center center", scrub: 1 }
  }
);
```

### 10. Number Counter
```tsx
gsap.to(countRef.current, {
  innerText: targetNumber, duration: 2, ease: "power1.out", snap: { innerText: 1 },
  scrollTrigger: { trigger: countRef.current, start: "top 80%", once: true }
});
```

---

## Section Architecture

### 1. Hero
- Full viewport height (`h-screen`)
- Large headline with SplitText char animation on load (not scroll)
- Background: video loop / gradient / Three.js canvas
- CTA button with magnetic effect
- Scroll indicator that fades out as user scrolls

### 2. About / Intro
- Pinned section or slow reveal
- Large statement text animating word by word
- Supporting visual with parallax scrolling beside it

### 3. Features / Services
- Staggered card reveals OR horizontal scroll track
- Each card: icon + title + description

### 4. Full-bleed Image / Video Break
- Clip-path reveal: image starts small, expands to full screen on scroll

### 5. Gallery / Portfolio
- Masonry grid with stagger reveals OR horizontal drag gallery
- Images: `overflow: hidden` wrapper + inner image scaled 110% for parallax headroom

### 6. Testimonials / Stats
- Counter animation on scroll
- Quote reveal with stagger

### 7. Contact / CTA
- Bold closing statement
- Form fields sliding up one by one
- Footer links with hover underline animation

---

## Scroll-Driven Design Rules (from frontend-design skill)

### Typography as Design
- Hero headings: **6rem minimum**, tight line-height (0.9–1.0), weight 700–800
- Section headings: **3rem minimum**, weight 600–700
- Horizontal marquee text: **10–15vw**, uppercase, letterspaced
- Section labels: 0.7rem, uppercase, letterspaced (0.15em+), muted — e.g. `001 / Features`
- Text hierarchy replaces containers — size, weight, and color ARE the structure

### No Cards, No Glassmorphism
- **NEVER** use glassmorphism cards, frosted glass, or visible containers around text
- Text sits directly on the background — clean, editorial
- Readability via: font-weight 600+, text-shadow if needed
- The only acceptable "container" is generous section padding

### Color Zones
- Background must shift between sections: light → dark → accent → light
- Define in CSS: `--bg-light`, `--bg-dark`, `--bg-accent`, `--text-on-light`, `--text-on-dark`
- Color zone transitions happen via GSAP, not CSS transitions

### Layout Variety
Every page needs at least 3 different layout patterns. Never repeat consecutive sections:
1. **Centered** — hero, CTAs
2. **Left-aligned** — feature + product on right
3. **Right-aligned** — alternate features
4. **Full-width** — marquee text, stats rows
5. **Split** — text one side, visual other side

### Animation Choreography
- Every section uses a **different** entrance animation (fade-up, slide-left, slide-right, scale-up, clip-path reveal)
- Stagger delays within a section: 0.08–0.12s between items
- Sequence order: label → heading → body → CTA
- At least one section must **pin** while contents animate internally
- At least one oversized text element must move **horizontally** on scroll

### Stats & Numbers
- Display stats at **4rem+** font size
- Numbers MUST count up via GSAP — never appear statically
- Suffix (x, M, %, etc.) at smaller size beside the number
- Labels below in small caps or uppercase muted text

---

## CSS Conventions

```css
:root {
  --color-primary: /* brand color */;
  --color-bg: #0a0a0a;
  --color-text: #f5f5f5;
  --font-heading: /* display font */;
  --font-body: /* body font */;
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}

html { scroll-behavior: auto !important; } /* Lenis handles this */
body { overflow-x: hidden; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance Rules

1. Always kill ScrollTrigger instances on unmount — `return () => ctx.revert()`
2. Use `gsap.context()` to scope all animations, prevents leaks
3. Hero image: `priority` prop. All others: `loading="lazy"`
4. Video: `autoplay muted loop playsInline`, serve `.webm` + `.mp4`
5. Fonts: always `next/font`, never raw `<link>` tag
6. Add `data-lenis-prevent` to modals and nested scrollable divs
7. Disable heavy animations on mobile via `useMediaQuery("(max-width: 768px)")`
8. Use `will-change: transform` only on actively animating elements, remove after
9. Only animate GPU-composited properties: `transform`, `opacity`
10. Avoid animating `width`, `height`, `top`, `left` — causes layout reflow

---

## Accessibility Rules

- All animations must respect `prefers-reduced-motion`
- SplitText headings: add `aria-label` on parent for screen readers
- Custom cursor: hide on touch devices
- Scroll-triggered content must be readable without JS

```tsx
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReducedMotion) {
  // run GSAP animations
}
```

---

## Self-Improvement Loop

After completing each website or major section, run through this loop to level up the file:

### Step 1 — Review
- Did any animation pattern feel awkward or require workarounds? Note it.
- Did any section need more than one attempt to get right? Document the solution.
- Were any performance issues found (jank, dropped frames)? Record the fix.

### Step 2 — Update This File
- Add any new animation pattern discovered to the Primitives section
- Replace any primitive that was improved with the better version
- Add new performance/accessibility gotchas found during the build
- Update the tech stack if a better tool was used

### Step 3 — Checklist Audit
After every build, run the Awwwards checklist below. For any unchecked item:
- If it was skipped intentionally: note why in a comment next to the item
- If it was missed: add a reminder note for the next project

### Step 4 — Pattern Library
Every time a reusable UI component is built that isn't already in the primitives list:
1. Extract it to `src/components/ui/`
2. Add it to the primitives section of this file with its code pattern
3. Mark it as battle-tested once it has been used in 2+ projects

### Step 5 — Score & Benchmark
After launch, run Lighthouse and record scores here:

```
Project: [name]
Date: [date]
Performance: __/100
Accessibility: __/100
Best Practices: __/100
SEO: __/100
Notes: [what dragged scores down and how to fix next time]
```

---

## Awwwards-Level Checklist

- [ ] Custom cursor (desktop only)
- [ ] Smooth scroll (Lenis)
- [ ] Hero headline: SplitText char animation
- [ ] At least one pinned scroll section
- [ ] Clip-path image reveal
- [ ] Horizontal scroll section
- [ ] Parallax on at least 2 images
- [ ] Staggered card/list reveals
- [ ] Magnetic buttons on CTAs
- [ ] Number counter animation on stats
- [ ] Page load animation (logo/nav slides in)
- [ ] Scroll progress indicator
- [ ] Reduced motion support
- [ ] Mobile-optimized (simplified animations, no custom cursor)
- [ ] 90+ Lighthouse performance score

---

## GSAP Easings Reference

| Feel | Ease String |
|---|---|
| Snappy entrance | `power3.out` |
| Elastic bounce | `elastic.out(1, 0.3)` |
| Smooth scrub | `none` |
| Overshoot | `back.out(1.7)` |
| Dramatic slow-in | `expo.out` |
| Natural spring | `power2.inOut` |

---

## Package Installation

```bash
npm install gsap lenis framer-motion
# Optional 3D
npm install three @react-three/fiber @react-three/drei
```

---

## Sources & References

- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Lenis Smooth Scroll GitHub](https://github.com/darkroomengineering/lenis)
- [Awwwards GSAP Sites](https://www.awwwards.com/websites/gsap/)
- [Awwwards Scroll Sites](https://www.awwwards.com/websites/scrolling/)
- [Award-Winning 3D Website — Next.js + Three.js + GSAP](https://dev.to/robinzon100/build-an-award-winning-3d-website-with-scroll-based-animations-nextjs-threejs-gsap-3630)
- [Lenis + GSAP in Next.js](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap)
- [Awwwards Animation Techniques](https://medium.com/design-bootcamp/awwward-winning-animation-techniques-for-websites-cb7c6b5a86ff)
- [Scroll Animations Guide — Halo Lab](https://www.halo-lab.com/blog/scroll-animations-for-your-website)
