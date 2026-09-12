"use client";

import { useState, useRef, useCallback } from "react";
import BandSelector from "./BandSelector";
import type { BandMode } from "@/types";
import { buildDownloadUrl } from "@/lib/api-client";

interface Props {
  jobId: string;
}

export default function SatelliteViewer({ jobId }: Props) {
  const [bandMode, setBandMode] = useState<BandMode>("RGB");
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const enhancedUrl = buildDownloadUrl(jobId, "enhanced.tif");

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  }, []);

  const bandLabel = bandMode === "RGB" ? "True Color" : bandMode === "NIR" ? "Near-Infrared" : bandMode;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BandSelector activeMode={bandMode} onChange={setBandMode} />
        <a
          href={enhancedUrl}
          download="enhanced.tif"
          className="text-xs px-3 py-2 rounded-md bg-primary text-black font-semibold hover:bg-primary/90 transition-colors"
        >
          ↓ Download Enhanced GeoTIFF
        </a>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden border border-border bg-secondary shadow-2xl cursor-col-resize select-none"
        style={{ height: "420px" }}
        onMouseMove={onMouseMove}
        onMouseDown={() => { dragging.current = true; }}
        onMouseUp={() => { dragging.current = false; }}
        onMouseLeave={() => { dragging.current = false; }}
        onTouchMove={onTouchMove}
      >
        <img
          src={buildDownloadUrl(jobId, "preview_before.png")}
          alt="Bicubic RGB preview"
          className="absolute inset-0 w-full h-full object-contain"
        />
        <img
          src={buildDownloadUrl(jobId, "preview_after.png")}
          alt="SR enhanced RGB preview"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        />
        <div
          className="absolute top-0 bottom-0 bg-white/20 w-px"
          style={{ left: `${sliderPos}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-card text-xs text-primary shadow-[0_0_24px_rgb(0_229_160/0.35)] cursor-col-resize"
          style={{ left: `${sliderPos}%` }}
          onMouseDown={(e) => { e.stopPropagation(); dragging.current = true; }}
        >
          |
        </div>

        <div className="absolute top-2 left-3 text-xs bg-card text-foreground px-2 py-1 border border-border">
          10M INPUT
        </div>
        <div className="absolute top-2 right-3 text-xs bg-card text-primary px-2 py-1 border border-border">
          &lt;4M SR OUTPUT
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Rendering: <strong>{bandLabel}</strong> · Drag the divider to compare bicubic baseline vs SR output
      </div>
    </div>
  );
}
