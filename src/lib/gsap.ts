import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once — GSAP handles SSR safely (no-ops server side)
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger };
