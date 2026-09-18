"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/components/ui/MotionProvider";

type PipelineStep = {
  number: string;
  title: string;
  description: string;
  tags: string[];
};

const steps: PipelineStep[] = [
  {
    number: "01",
    title: "Data acquisition",
    description:
      "Medium-resolution optical scenes are pulled from open constellations at their native revisit cadence.",
    tags: ["Sentinel-2 · 10m", "Landsat · 30m"],
  },
  {
    number: "02",
    title: "Pre-processing",
    description:
      "Scenes are corrected, co-registered, normalized, and tiled into paired training patches.",
    tags: ["Atmospheric correction", "Cloud masking"],
  },
  {
    number: "03",
    title: "Super-resolution model",
    description:
      "A deep network learns the mapping from coarse pixels to fine spatial detail while preserving spectral signal.",
    tags: ["GAN / transformer", "Spectral fidelity"],
  },
  {
    number: "04",
    title: "Reconstruction & fusion",
    description:
      "Enhanced patches are stitched into a seamless mosaic and geo-referenced to a sub-4m output grid.",
    tags: ["Edge blending", "Geo-referencing"],
  },
  {
    number: "05",
    title: "Validation & uncertainty",
    description:
      "Every output is scored against held-out reference tiles with a per-pixel confidence map.",
    tags: ["PSNR / SSIM", "Uncertainty map"],
  },
  {
    number: "06",
    title: "Output: <4m resolution",
    description:
      "Geospatially consistent, spectrally faithful imagery ready for downstream analysis.",
    tags: [],
  },
];

function PipelineTitle({
  step,
  total = 6,
}: {
  step: PipelineStep;
  total?: number;
}) {
  return (
    <div
      data-pipeline-title
      className="relative flex h-full w-full flex-col justify-center pr-4 lg:pr-10"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.26em] text-[#8de6ff]">
          {step.number} / {String(total).padStart(2, "0")}
        </span>
        <span className="h-px w-10 bg-[#8de6ff]/35" />
      </div>

      <h3
        data-pipeline-heading
        className="text-[clamp(2.2rem,3.8vw,4.2rem)] font-light uppercase leading-[0.95] tracking-[-0.045em] text-[#e7f8ff]"
      >
        {step.title}
      </h3>

      <div className="mt-8 flex items-center gap-3">
        {/* <span className="h-1.5 w-1.5 rounded-full bg-[#8de6ff]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6e9aae]">
          {/* Phase {step.number} Architecture */}
        {/* </span> */}
      </div>
    </div>
  );
}

function PipelineCard({
  step,
  index,
}: {
  step: PipelineStep;
  index: number;
}) {
  const output = index === steps.length - 1;

  return (
    <article
      data-pipeline-card
      className={[
        "relative flex h-full max-h-[440px] w-full flex-col justify-between overflow-hidden",
        "border p-6 sm:p-8 lg:p-9 transition-colors duration-300",
        output
          ? "border-[#18c8c1]/70 bg-[#092d35]"
          : "border-[#72c8ee]/25 bg-[#0b2947]",
      ].join(" ")}
    >
      <div
        className={[
          "absolute right-0 top-0 h-14 w-14 border-l border-b",
          output ? "border-[#18c8c1]/40" : "border-[#72c8ee]/20",
        ].join(" ")}
      />

      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#6e9aae]">
            Stage {step.number}
          </span>
          <span
            className={[
              "rounded border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em]",
              output
                ? "border-[#18c8c1]/50 bg-[#18c8c1]/15 text-[#18c8c1]"
                : "border-[#72c8ee]/25 bg-[#72c8ee]/5 text-[#8de6ff]",
            ].join(" ")}
          >
            {output ? "Final output" : "Pipeline stage"}
          </span>
        </div>

        <h4
          className={[
            "mt-6 text-2xl sm:text-3xl lg:text-[32px]",
            "font-light uppercase leading-[1.05]",
            "tracking-[-0.035em]",
            output ? "text-[#eaffff]" : "text-[#e7f8ff]",
          ].join(" ")}
        >
          {step.title}
        </h4>

        <p className="mt-4 text-sm leading-relaxed text-[#9bbdce] sm:text-[15px]">
          {step.description}
        </p>
      </div>

      <div className="mt-6 pt-5 border-t border-[#72c8ee]/15">
        {!output ? (
          <div className="flex flex-wrap gap-2">
            {step.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[#72c8ee]/25 bg-[#081d32]/50 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#86aabd]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#5d929b]">
                Resolution target
              </div>
              <div className="font-mono text-3xl font-light tracking-[-0.04em] text-[#18c8c1]">
                &lt; 4m
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#18c8c1]">
              <span>See the result</span>
              <span className="text-base leading-none">→</span>
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(141,230,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(141,230,255,.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
    </article>
  );
}

export default function PipelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const leftTrackRef = useRef<HTMLDivElement>(null);
  const rightTrackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const stepProgress = [0.04, 0.21, 0.38, 0.54, 0.71, 0.92];

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const leftTrack = leftTrackRef.current;
    const rightTrack = rightTrackRef.current;

    if (!section || !viewport || !leftTrack || !rightTrack) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const titleElements = gsap.utils.toArray<HTMLElement>("[data-pipeline-title]");
        const cardElements = gsap.utils.toArray<HTMLElement>("[data-pipeline-card]");

        gsap.set(leftTrack, { yPercent: 0 });
        gsap.set(rightTrack, { yPercent: -((steps.length - 1) / steps.length) * 100 });

        titleElements.forEach((el, i) => {
          gsap.set(el, { opacity: i === 0 ? 1 : 0.2 });
        });

        cardElements.forEach((card, revIndex) => {
          const originalIdx = steps.length - 1 - revIndex;
          gsap.set(card, {
            opacity: originalIdx === 0 ? 1 : 0.25,
            scale: originalIdx === 0 ? 1 : 0.96,
          });
        });

        const hold = 1.0;
        const transition = 1.0;
        const finalHold = 2.2;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: viewport,
            start: "top top",
            end: () => `+=${window.innerHeight * 4.2}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              let activeIdx = 0;
              for (let i = steps.length - 1; i >= 0; i--) {
                if (p >= (stepProgress[i] - 0.08)) {
                  activeIdx = i;
                  break;
                }
              }

              if (counterRef.current) {
                counterRef.current.textContent = `${steps[activeIdx].number} / 06`;
              }
            },
          },
        });

        tl.to({}, { duration: hold });

        for (let i = 1; i < steps.length; i++) {
          const label = `step-${i}`;
          const leftTarget = -(i / steps.length) * 100;
          const rightTarget = -((steps.length - 1 - i) / steps.length) * 100;
          const prevOriginalIdx = i - 1;
          const curOriginalIdx = i;
          const prevCardEl = cardElements[steps.length - 1 - prevOriginalIdx];
          const curCardEl = cardElements[steps.length - 1 - curOriginalIdx];

          tl.to(
            leftTrack,
            {
              yPercent: leftTarget,
              duration: transition,
              ease: "power2.inOut",
            },
            label
          );

          tl.to(
            rightTrack,
            {
              yPercent: rightTarget,
              duration: transition,
              ease: "power2.inOut",
            },
            label
          );

          tl.to(
            titleElements[prevOriginalIdx],
            {
              opacity: 0.2,
              duration: transition,
              ease: "power2.inOut",
            },
            label
          );

          tl.to(
            titleElements[curOriginalIdx],
            {
              opacity: 1,
              duration: transition,
              ease: "power2.inOut",
            },
            label
          );

          if (prevCardEl) {
            tl.to(
              prevCardEl,
              {
                opacity: 0.25,
                scale: 0.96,
                duration: transition,
                ease: "power2.inOut",
              },
              label
            );
          }

          if (curCardEl) {
            tl.to(
              curCardEl,
              {
                opacity: 1,
                scale: 1,
                duration: transition,
                ease: "power2.inOut",
              },
              label
            );
          }

          const curHold = i === steps.length - 1 ? finalHold : hold;
          tl.to({}, { duration: curHold });
        }

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      mm.add("(max-width: 1023px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-mobile-pipeline-card]");
        gsap.set(cards, { opacity: 0, y: 30 });

        cards.forEach((card, index) => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
            delay: index * 0.05,
          });
        });
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="pipeline"
      ref={sectionRef}
      className="relative w-full bg-[#061323] text-white"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(114,200,238,.12) 0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 pb-16 pt-24 sm:px-8 md:px-12 md:pb-20 md:pt-32 lg:px-16">
        <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8de6ff]">
          02 · The pipeline
        </p>

        <h2 className="max-w-5xl text-balance text-[clamp(2.8rem,5.6vw,5.8rem)] font-light uppercase leading-[0.88] tracking-[-0.055em] text-[#e7f8ff]">
          From coarse pixels
          <br />
          to confident detail.
        </h2>

        <div className="mt-8 flex max-w-xl items-center gap-4">
          <span className="h-px w-16 bg-[#72c8ee]/40" />

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#63889b]">
            Processing pipeline
          </p>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative z-10 hidden h-screen w-full flex-col justify-between overflow-hidden bg-[#061323] px-6 py-8 sm:px-10 lg:flex lg:px-16"
      >
        <div className="relative z-20 flex items-center justify-between border-b border-[#72c8ee]/15 pb-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8de6ff]">
              02 · Architecture
            </span>
            <span className="hidden h-3 w-px bg-[#72c8ee]/25 sm:inline-block" />
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[#6e9aae]">Stage</span>
            <span
              ref={counterRef}
              className="font-semibold text-[#8de6ff]"
            >
              01 / 06
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14 xl:gap-20">
          <div className="relative h-[420px] overflow-hidden lg:h-[460px]">
            <div
              ref={leftTrackRef}
              className="relative will-change-transform"
              style={{ height: `${steps.length * 100}%` }}
            >
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex h-[420px] items-center lg:h-[460px]"
                >
                  <PipelineTitle step={step} total={steps.length} />
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[420px] overflow-hidden lg:h-[460px]">
            <div
              ref={rightTrackRef}
              className="relative will-change-transform"
              style={{ height: `${steps.length * 100}%` }}
            >
              {[...steps].reverse().map((step, reversedIndex) => {
                const originalIndex = steps.length - 1 - reversedIndex;
                return (
                  <div
                    key={step.number}
                    className="flex h-[420px] items-center justify-center p-2 lg:h-[460px]"
                  >
                    <PipelineCard
                      step={step}
                      index={originalIndex}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center justify-between border-t border-[#72c8ee]/15 pt-4 text-[9px] font-mono uppercase tracking-[0.2em] text-[#6e9aae]">
          <div className="flex items-center gap-2">
          </div>
          <div className="flex items-center gap-1.5">
            <span>Scroll down to continue</span>
            <span className="text-[#8de6ff]">↓</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 block px-6 pb-20 pt-4 lg:hidden">
        <div className="mx-auto max-w-2xl">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                data-mobile-pipeline-card
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs tracking-[0.2em] text-[#8de6ff]">
                    {step.number}
                  </span>
                  <span className="h-px flex-1 bg-[#72c8ee]/20" />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#6e9aae]">
                    Stage {step.number}
                  </span>
                </div>

                <PipelineCard step={step} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}