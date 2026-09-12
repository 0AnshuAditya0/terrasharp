"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/components/ui/MotionProvider";

type PipelineStep = { number: string; title: string; description: string; tags: string[] };

const steps: PipelineStep[] = [
  { number: "01", title: "Data acquisition", description: "Medium-resolution optical scenes are pulled from open constellations at their native revisit cadence.", tags: ["Sentinel-2 · 10m", "Landsat · 30m"] },
  { number: "02", title: "Pre-processing", description: "Scenes are corrected, co-registered, normalized, and tiled into paired training patches.", tags: ["Atmospheric correction", "Cloud masking"] },
  { number: "03", title: "Super-resolution model", description: "A deep network learns the mapping from coarse pixels to fine spatial detail while preserving spectral signal.", tags: ["GAN / transformer", "Spectral fidelity"] },
  { number: "04", title: "Reconstruction & fusion", description: "Enhanced patches are stitched into a seamless mosaic and geo-referenced to a sub-4m output grid.", tags: ["Edge blending", "Geo-referencing"] },
  { number: "05", title: "Validation & uncertainty", description: "Every output is scored against held-out reference tiles with a per-pixel confidence map.", tags: ["PSNR / SSIM", "Uncertainty map"] },
];

function Card({ step, output = false }: { step?: PipelineStep; output?: boolean }) {
  return (
    <article className={`flex min-h-[260px] flex-col border p-5 sm:min-h-[300px] sm:p-6 backdrop-blur-sm lg:p-7 ${output ? "border-[#18c8c1]/70 bg-[#18c8c1]/10" : "border-[#72c8ee]/25 bg-[#0b2947]/90"}`}>
      <p className="text-4xl font-light tracking-[-.05em] text-[#8de6ff]">{output ? "06" : step?.number}</p>
      <h3 className="mt-5 text-lg font-light uppercase tracking-[-.02em] text-[#e7f8ff]">{output ? "Output: <4m resolution" : step?.title}</h3>
      <p className="mt-4 text-xs leading-5 text-[#a8c8d9]">{output ? "Geospatially consistent, spectrally faithful imagery ready for downstream analysis." : step?.description}</p>
      {output ? <p className="mt-auto font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#18c8c1]">See the result →</p> : <div className="mt-auto flex flex-wrap gap-2 border-t border-[#72c8ee]/20 pt-4">{step?.tags.map((tag) => <span key={tag} className="border border-[#72c8ee]/25 px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-[#8db7ca]">{tag}</span>)}</div>}
    </article>
  );
}

export default function PipelineSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-pipeline-card]", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="technology" ref={sectionRef} className="relative bg-[#061323] px-6 py-24 text-white md:px-10 md:py-32">
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at center, rgba(114,200,238,.14) 0 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
      <div className="relative z-10 mx-auto max-w-[1600px]">
        <p className="eyebrow mb-5 text-[#8de6ff]">02 · The pipeline</p>
        <h2 className="max-w-3xl text-balance text-[clamp(3rem,5.4vw,5.4rem)] font-light uppercase leading-[.92] tracking-[-.045em]">From coarse pixels to confident, validated detail.</h2>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => <div key={step.number} data-pipeline-card><Card step={step} /></div>)}
          <div data-pipeline-card><Card output /></div>
        </div>
      </div>
    </section>
  );
}
