"use client";
import { useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Preload both models
useGLTF.preload("/models/chess-king.glb");
useGLTF.preload("/models/pool-table.glb");

// Shared scroll progress — GSAP writes, R3F reads every frame
const scrollProgress = { value: 0 };

// Camera keyframes driven by scroll progress
const CAM_KEYFRAMES = [
  new THREE.Vector3(0, 3.5, 8),    // 0%  — front wide
  new THREE.Vector3(4, 4, 5),      // 33% — orbit right
  new THREE.Vector3(0, 9, 1.5),    // 66% — top-down
  new THREE.Vector3(-3, 3.5, 7),   // 100% — left reveal
];

function lerpCam(p: number): THREE.Vector3 {
  const segments = CAM_KEYFRAMES.length - 1;
  const scaled = p * segments;
  const i = Math.min(Math.floor(scaled), segments - 1);
  const t = scaled - i;
  return CAM_KEYFRAMES[i].clone().lerp(CAM_KEYFRAMES[i + 1], t);
}

function ScrollCamera() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.5, 0));

  useFrame(() => {
    const p = scrollProgress.value;
    const pos = lerpCam(p);
    camera.position.lerp(pos, 0.05);
    camera.lookAt(target.current);
  });

  return null;
}

function ChessKingModel() {
  const { scene } = useGLTF("/models/chess-king.glb");
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Fix materials — prevent any transparency issues
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          const m = mat as THREE.MeshStandardMaterial;
          m.transparent = false;
          m.opacity = 1;
          m.depthWrite = true;
          m.side = THREE.FrontSide;
        });
      }
    });

    // Entry from below on load
    groupRef.current.position.y = -6;
    gsap.to(groupRef.current.position, {
      y: 0,
      duration: 2,
      ease: "power3.out",
      delay: 0.4,
    });
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = scrollProgress.value;
    // Slow rotation on scroll
    groupRef.current.rotation.y = p * Math.PI * 0.5;
    // Subtle float
    const floatAmt = 1 - p * 0.8;
    groupRef.current.position.y +=
      (Math.sin(Date.now() * 0.0005) * 0.05 * floatAmt - groupRef.current.position.y) * 0.02;
  });

  // Zoomed-in: large scale, positioned left-center so it fills the right side of the frame
  return (
    <group ref={groupRef} scale={[5, 5, 5]} position={[1.5, -0.5, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function PoolTableModel() {
  const { scene } = useGLTF("/models/pool-table.glb");
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Fix see-through: force all meshes opaque with front-side rendering
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          const m = mat as THREE.MeshStandardMaterial;
          m.transparent = false;
          m.opacity = 1;
          m.depthWrite = true;
          // Use DoubleSide for the table cloth/felt faces so they read solidly
          m.side = THREE.DoubleSide;
        });
      }
    });

    // Entry from below
    groupRef.current.position.y = -4;
    gsap.to(groupRef.current.position, {
      y: -0.8,
      duration: 2.2,
      ease: "power3.out",
      delay: 0.6,
    });
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = scrollProgress.value;
    groupRef.current.rotation.y = p * Math.PI * 0.4;
  });

  return (
    <group ref={groupRef} scale={[2.2, 2.2, 2.2]} position={[2.5, -0.8, -1]}>
      <primitive object={scene} />
    </group>
  );
}

function MagneticButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) * 0.3;
    const y = (e.clientY - top - height / 2) * 0.3;
    gsap.to(btnRef.current, { x, y, duration: 0.6, ease: "power3.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)",
    });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="group relative px-7 py-3.5 md:px-10 md:py-4 bg-orange-500 text-white text-sm uppercase tracking-[0.2em] overflow-hidden hover:bg-orange-400 transition-colors duration-300"
      style={{ willChange: "transform" }}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
    </button>
  );
}

export default function Hero3D() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 1023px)");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Page load: text fades in
      gsap.fromTo(
        [headingRef.current, subRef.current, ctaRef.current],
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out", delay: 1.0 }
      );

      if (prefersReducedMotion) return;

      // Drive scroll progress 0 → 1 across the pinned wrapper
      gsap.to(scrollProgress, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      // Scroll indicator fades out quickly
      gsap.to(scrollIndicatorRef.current, {
        opacity: 0,
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=15%",
          scrub: true,
        },
      });

      // Phase 1 text: fades out at ~33% scroll
      gsap.to([headingRef.current, subRef.current, ctaRef.current], {
        opacity: 0,
        y: -30,
        ease: "power2.in",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "20% top",
          end: "35% top",
          scrub: 1,
        },
      });

      // Phase 2 text: fades in at ~40%, out at ~65%
      if (phase2Ref.current) {
        gsap.fromTo(
          phase2Ref.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "38% top",
              end: "50% top",
              scrub: 1,
            },
          }
        );
        gsap.to(phase2Ref.current, {
          opacity: 0,
          y: -30,
          ease: "power2.in",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "60% top",
            end: "72% top",
            scrub: 1,
          },
        });
      }

      // Phase 3 text: fades in at ~75%
      if (phase3Ref.current) {
        gsap.fromTo(
          phase3Ref.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "75% top",
              end: "88% top",
              scrub: 1,
            },
          }
        );
      }
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isMobile]);

  return (
    // Tall wrapper — gives scrollable room for the pinned animation
    <div ref={wrapperRef} className={`relative ${isMobile ? "h-[150vh]" : "h-[300vh]"}`}>
      {/* Sticky container — stays fixed while wrapper scrolls */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full bg-[#0a0a0a] overflow-hidden"
      >
        {/* 3D Canvas — full bleed */}
        <div className="absolute inset-0" style={{ willChange: "transform" }}>
          <Canvas
            camera={{ position: [0, 3.5, 8], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.25} />
            <directionalLight position={[5, 10, 5]} intensity={1.4} />
            <pointLight position={[-4, 6, -4]} intensity={0.6} color="#F97316" />
            <pointLight position={[4, 2, 4]} intensity={0.3} color="#ffffff" />
            <Suspense fallback={null}>
              <ChessKingModel />
              <PoolTableModel />
              <Environment preset="city" />
            </Suspense>
            <ScrollCamera />
          </Canvas>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/20 pointer-events-none" />

        {/* Phase 1: Initial text */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 pointer-events-none">
          <div className="max-w-2xl">
            <p className="text-orange-500 text-xs uppercase tracking-[0.3em] mb-6 font-medium">
              001 / Heritage
            </p>
            <h1
              ref={headingRef}
              className="text-[clamp(4rem,10vw,9rem)] font-black leading-[0.9] uppercase text-white opacity-0"
              aria-label="Lodhi Sports"
            >
              LODHI
              <br />
              <span className="text-orange-500">SPORTS</span>
            </h1>
            <p
              ref={subRef}
              className="mt-4 text-white/60 text-sm md:text-lg font-light tracking-wide max-w-md opacity-0"
            >
              Health &amp; Fitness Since 1970. Premium gear for every sport,
              delivered to your door.
            </p>
            <div
              ref={ctaRef}
              className="mt-6 md:mt-10 flex items-center gap-4 md:gap-6 flex-wrap opacity-0 pointer-events-auto"
            >
              <MagneticButton>Explore Collection</MagneticButton>
              <a
                href="https://wa.me/919873408937"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-orange-500 transition-colors duration-300 uppercase tracking-[0.15em] border-b border-white/20 hover:border-orange-500 pb-0.5"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Phase 2: Mid-scroll text — top-down camera */}
        <div
          ref={phase2Ref}
          className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 lg:px-24 pb-12 md:pb-20 opacity-0 pointer-events-none"
        >
          <p className="text-orange-500 text-xs uppercase tracking-[0.3em] mb-3">
            Every Move Matters
          </p>
          <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-black leading-[0.95] uppercase text-white">
            1,500+
            <br />
            <span className="text-white/40">Products</span>
          </h2>
        </div>

        {/* Phase 3: Final text — side angle */}
        <div
          ref={phase3Ref}
          className="absolute inset-0 flex flex-col justify-center items-end px-8 md:px-16 lg:px-24 opacity-0 pointer-events-none"
        >
          <div className="text-right max-w-md">
            <p className="text-orange-500 text-xs uppercase tracking-[0.3em] mb-4">
              50+ Brands
            </p>
            <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-black leading-[0.95] uppercase text-white mb-6">
              Gear Up.
              <br />
              <span className="text-orange-500">Game On.</span>
            </h2>
            <a
              href="https://sportsnextdoor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-block text-sm uppercase tracking-[0.2em] bg-orange-500 text-white px-8 py-4 hover:bg-orange-400 transition-colors duration-300"
            >
              Shop Now →
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-[10px] uppercase tracking-[0.2em]">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-orange-500 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
}
