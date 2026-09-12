"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MotionProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !root.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 86%", once: true } });
      });
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
        gsap.to(element, { yPercent: Number(element.dataset.parallax ?? -12), ease: "none", scrollTrigger: { trigger: element, scrub: true } });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return <div ref={root} className="contents">{children}</div>;
}

export { gsap, ScrollTrigger };
