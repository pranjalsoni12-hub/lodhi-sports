"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

export default function CTAFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );

      gsap.fromTo(
        ".footer-link",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".footer-links",
            start: "top 85%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      className="bg-[#f5f0eb] pt-16 md:pt-32 pb-12 px-6 md:px-16 lg:px-24"
    >
      {/* Big CTA */}
      <div className="border-b border-[#0a0a0a]/10 pb-24 mb-16">
        <h2
          ref={headingRef}
          className="text-[clamp(4rem,12vw,11rem)] font-black leading-[0.9] text-[#0a0a0a] uppercase mb-12"
          style={{ opacity: 0 }}
          aria-label="Gear Up. Game On."
        >
          GEAR UP.
          <br />
          <span className="text-orange-500">GAME ON.</span>
        </h2>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <a
            href="https://wa.me/919873408937"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-[#0a0a0a] text-white px-8 md:px-10 py-4 text-sm uppercase tracking-[0.15em] hover:bg-orange-500 transition-colors duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp Us
          </a>
          <a
            href="https://lodhisport.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-[#0a0a0a]/30 text-[#0a0a0a] px-8 md:px-10 py-4 text-sm uppercase tracking-[0.15em] hover:border-[#0a0a0a] transition-colors duration-300"
          >
            Shop Online →
          </a>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <Image
          src="/assets/logo-footer.png"
          alt="Lodhi Sports"
          width={100}
          height={48}
          className="h-10 w-auto object-contain opacity-70"
        />

        <nav className="footer-links flex flex-wrap gap-6">
          {[
            "Sports",
            "Fitness",
            "Home Games",
            "Sportswear",
            "Track Order",
            "Contact",
          ].map((link) => (
            <a
              key={link}
              href="#"
              className="footer-link text-base uppercase tracking-[0.1em] font-medium text-[#0a0a0a]/70 hover:text-orange-500 transition-colors duration-300"
              style={{ opacity: 0 }}
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {[
            {
              label: "Instagram",
              href: "https://instagram.com/lodhisports",
              icon: "IG",
            },
            {
              label: "YouTube",
              href: "https://youtube.com/@sportsnextdoorindia",
              icon: "YT",
            },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-[#0a0a0a]/20 flex items-center justify-center text-[10px] font-bold text-[#0a0a0a]/50 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300"
              aria-label={s.label}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-[#0a0a0a]/10 flex flex-col md:flex-row justify-between gap-2">
        <p className="text-sm text-[#0a0a0a]/60 uppercase tracking-wide font-medium">
          © 2024 Lodhi Sports / Sai Kripa Fitness Zone Pvt Ltd
        </p>
        <p className="text-sm text-[#0a0a0a]/60 uppercase tracking-wide font-medium">
          Health &amp; Fitness Since 1970
        </p>
      </div>
    </footer>
  );
}
