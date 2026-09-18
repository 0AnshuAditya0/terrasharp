"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { AoiBounds } from "@/components/explore/AoiMap";

const AoiMap = dynamic(() => import("@/components/explore/AoiMap"), { ssr: false });

function formatCoordinate(value: number) {
  return value.toFixed(4);
}

export default function ExplorePage() {
  const [bounds, setBounds] = useState<AoiBounds | null>(null);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [areaError, setAreaError] = useState<string | null>(null);

  const handleFetch = () => {
    if (!bounds || !date || areaError) return;

    const request = { bbox: bounds, date };
    console.log(request);
    setMessage(`Ready to fetch: ${JSON.stringify(bounds)} on ${date} — backend integration coming next.`);
  };

  return (
    <div className="grid-atmosphere mx-auto max-w-7xl space-y-10 px-6 pb-24 pt-32 md:px-10">
      <div className="max-w-3xl space-y-4">
        <p className="eyebrow">01 · Define a scene</p>
        <h1 className="text-[clamp(3rem,6vw,6rem)] font-light uppercase leading-[0.92] tracking-[-0.045em] text-[#e5f3f5]">Explore an area of interest.</h1>
        <p className="max-w-2xl text-base leading-7 text-[#7896a2]">Draw a bounding box over India, choose an acquisition date, and prepare the next enhancement step.</p>
      </div>

      <section className="space-y-5">
        <div className="h-[min(68vh,620px)] min-h-[420px] overflow-hidden border border-border bg-card">
          <AoiMap
            onBoundsChange={(nextBounds) => {
              setBounds(nextBounds);
              setMessage("");
              if (nextBounds) setAreaError(null);
            }}
            onErrorChange={setAreaError}
          />
        </div>

        {areaError && (
          <div
            role="alert"
            className="flex items-center gap-3 border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertTriangle size={18} className="shrink-0" />
            <span>{areaError}</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">Use the rectangle tool to select a Sentinel-2-compatible bounding box (max 20km × 20km). Edit or delete the selection from the drawing controls.</p>
      </section>

      <section className="grid gap-5 border border-border bg-card p-6 md:grid-cols-[1fr_1.5fr_auto] md:items-end md:p-7">
        <label htmlFor="scene-date" className="space-y-2">
          <span className="eyebrow block">Acquisition date</span>
          <input id="scene-date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setMessage(""); }} className="w-full border border-input bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary" />
        </label>

        <div className="min-h-[76px] border-l border-border pl-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="eyebrow">Selected bounding box</p>
            {bounds && (
              <span className="font-mono text-xs font-semibold text-primary">
                Selected area: {bounds.widthKm.toFixed(1)}km × {bounds.heightKm.toFixed(1)}km
              </span>
            )}
          </div>
          {bounds ? (
            <p className="font-mono text-xs leading-6 text-foreground">North: {formatCoordinate(bounds.north)}, South: {formatCoordinate(bounds.south)}, East: {formatCoordinate(bounds.east)}, West: {formatCoordinate(bounds.west)}</p>
          ) : <p className="text-sm text-muted-foreground">Draw a rectangle on the map to set the AOI.</p>}
        </div>

        <button type="button" disabled={!bounds || !date || Boolean(areaError)} onClick={handleFetch} className="bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40">Fetch &amp; Enhance</button>
      </section>

      {message && <p role="status" className="border-l border-primary bg-card px-4 py-3 text-sm text-foreground">{message}</p>}
    </div>
  );
}