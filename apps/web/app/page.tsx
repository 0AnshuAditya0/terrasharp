import Link from "next/link";
import { ArrowRight, ScanLine } from "lucide-react";
import PipelineSection from "@/components/home/PipelineSection";
import ResultSection from "@/components/home/ResultSection";

const applications = [
  { number: "01", title: "Crop intelligence", description: "See field boundaries, irrigation patterns, and crop stress at the parcel scale.", image: "/applications-crops.png" },
  { number: "02", title: "Urban mapping", description: "Read streets, rooftops, and settlement growth with a sharper spatial signal.", image: "/applications-urban.png" },
  { number: "03", title: "Disaster response", description: "Trace flood edges and damage extents when every hour changes the outcome.", image: "/applications-disaster.png" },
  { number: "04", title: "Coastal change", description: "Track shorelines, erosion, and water boundaries through consistent time-series detail.", image: "/applications-coastal.png" },
];

export default function HomePage() {
  return (
    <div className="bg-background">
      <section className="grain relative isolate min-h-[100svh] overflow-hidden bg-[#061323] text-white">
        <div data-parallax="-8" className="absolute inset-0 -z-20 scale-110 bg-cover bg-center" style={{ backgroundImage: "url('/sat.png')" }} />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,12,25,0.86)_0%,rgba(3,12,25,0.46)_42%,rgba(3,12,25,0.06)_78%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-[#03101e]/70 to-transparent" />
        <div className="mx-auto flex min-h-[100svh] max-w-7xl items-end px-4 pb-28 pt-28 sm:px-6 sm:pb-24 lg:px-10 lg:pb-[11vh]">
          <div data-reveal className="relative z-10 max-w-2xl reveal-up">
            <h1 className="hero-wordmark text-[clamp(2.7rem,15vw,6.2rem)] font-black uppercase leading-[0.9] tracking-[-0.045em]">TerraSharp</h1>
            <p className="mt-4 font-serif text-[clamp(1.5rem,2.8vw,2.35rem)] leading-tight tracking-[0.01em] text-white/95">Sharper Earth. More Signal.</p>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/75 md:text-base">AI-powered super-resolution for Sentinel-2 imagery, transforming medium-resolution observations into sharper, analysis-ready Earth intelligence.</p>
          </div>
          <Link href="/enhance" className="hero-cta absolute bottom-8 left-4 z-10 inline-flex items-center gap-3 rounded-full sm:bottom-20 sm:left-auto sm:right-6 bg-[#18c8c1] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(24,200,193,0.25)] lg:bottom-[14vh] lg:right-[8%]">Try it now <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section id="technology" data-reveal className="relative overflow-hidden bg-[#061323] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#061323_0%,#0b2947_52%,#4cbbeb_180%)]" />
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-4 py-20 sm:px-6 md:grid-cols-[.8fr_1.2fr] md:gap-14 md:px-12 md:py-32 lg:gap-28 lg:px-16">
          <div className="self-start md:sticky md:top-28">
            <p className="eyebrow mb-6 text-[#8de6ff]">01 · The signal gap</p>
            <h2 className="max-w-xl text-balance text-[clamp(3rem,5.8vw,6rem)] font-light uppercase leading-[.88] tracking-[-.055em]">The Earth is detailed. The pixels are not.</h2>
            <p className="mt-8 max-w-md text-sm leading-7 text-[#b4d4e5]">Open satellite imagery is frequent, global, and free. But medium-resolution pixels flatten the details that make a landscape actionable. TerraSharp restores that signal without losing the cadence of the source.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[{ value: "10m", label: "Sentinel-2 native resolution", note: "A single pixel can cover a small building." }, { value: "5d", label: "Typical revisit cadence", note: "Fresh observations, ready for every cycle." }, { value: "4×", label: "Spatial reconstruction", note: "More useful detail from the same source." }, { value: "$0", label: "Open data foundation", note: "Scale intelligence without tasking costs." }].map((item, index) => <article key={item.label} className={`border border-[#72c8ee]/30 bg-[#071a2d]/75 p-6 backdrop-blur-sm ${index === 0 ? "sm:translate-y-10" : index === 3 ? "sm:-translate-y-10" : ""}`}><ScanLine className="mb-12 text-[#73d8ff]" size={22} /><p className="text-5xl font-light tracking-[-.06em] text-[#e7f8ff]">{item.value}</p><p className="mt-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#8de6ff]">{item.label}</p><p className="mt-5 border-t border-[#72c8ee]/20 pt-4 text-xs leading-5 text-[#9bbdce]">{item.note}</p></article>)}
          </div>
        </div>
      </section>

      <PipelineSection />
      <ResultSection />

      <section id="use-cases" className="relative overflow-hidden bg-[#061323] px-6 py-24 text-white md:px-10 md:py-36">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#061323_0%,#0a2138_100%)]" />
        <div className="relative mx-auto max-w-[1600px]">
          <p className="eyebrow mb-5 text-[#8de6ff]">04 · Applications</p>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><h2 className="max-w-3xl text-balance text-[clamp(3rem,5.4vw,5.6rem)] font-light uppercase leading-[.88] tracking-[-.055em]">A sharper layer for decisions made on the ground.</h2><p className="max-w-sm text-sm leading-6 text-[#a8c8d9]">From agriculture to emergency response, the same reconstructed signal adapts to the questions each landscape asks.</p></div>
          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {applications.map((application) => <article key={application.number} className="group relative min-h-[320px] overflow-hidden border sm:min-h-[410px] border-[#72c8ee]/25 bg-[#071a2d]"><img src={application.image} alt={`${application.title} satellite imagery`} className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-100" /><div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,12,25,0.08)_20%,rgba(3,12,25,0.96)_100%)]" /><div className="relative flex h-full flex-col justify-end p-7 md:p-9"><p className="text-xs font-bold tracking-[.2em] text-[#8de6ff]">{application.number}</p><h3 className="mt-3 text-3xl font-light uppercase tracking-[-.03em]">{application.title}</h3><p className="mt-3 max-w-md text-sm leading-6 text-[#c0dce8]">{application.description}</p><span className="mt-7 h-px w-16 bg-[#18c8c1] transition-all duration-500 group-hover:w-28" /></div></article>)}
          </div>
        </div>
      </section>

      <section id="validation" className="bg-[#061323] px-6 py-24 text-white md:px-10 md:py-36"><div className="mx-auto max-w-[1600px]"><p className="eyebrow mb-5 text-[#8de6ff]">05 · Validation</p><div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24"><div><h2 className="max-w-xl text-balance text-[clamp(3rem,5.4vw,5.4rem)] font-light uppercase leading-[.88] tracking-[-.055em]">Sharper is only useful if it is trustworthy.</h2><p className="mt-7 max-w-lg text-sm leading-7 text-[#a8c8d9]">Every output is benchmarked against held-out high-resolution ground truth. Fidelity, spectral consistency, and uncertainty stay visible after every run.</p></div><div className="grid gap-4 sm:grid-cols-3">{[{ value: "PSNR", label: "Pixel fidelity" }, { value: "SSIM", label: "Structural similarity" }, { value: "NDVI", label: "Spectral preservation" }].map((item) => <div key={item.value} className="border border-[#72c8ee]/25 bg-[#071a2d]/70 p-6"><p className="text-3xl font-light text-[#e7f8ff]">{item.value}</p><p className="mt-16 border-t border-[#72c8ee]/20 pt-4 text-[10px] uppercase tracking-[.14em] text-[#8de6ff]">{item.label}</p></div>)}</div></div></div></section>
    </div>
  );
}
