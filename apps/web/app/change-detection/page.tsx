"use client";

import { useState, useEffect, useCallback } from "react";
import DualUploader from "@/components/change/DualUploader";
import DiffMapViewer from "@/components/change/DiffMapViewer";
import { getJobStatus } from "@/lib/api-client";
import type { EnhanceJob } from "@/types";
import { POLL_INTERVAL_MS } from "@/lib/constants";

export default function ChangeDetectionPage() {
  const [job1, setJob1] = useState<EnhanceJob | null>(null);
  const [job2, setJob2] = useState<EnhanceJob | null>(null);
  const [bothReady, setBothReady] = useState(false);
  const [polling, setPolling] = useState(false);

  const pollBoth = useCallback(async (id1: string, id2: string) => {
    setPolling(true);
    const checkInterval = setInterval(async () => {
      const [j1, j2] = await Promise.all([getJobStatus(id1), getJobStatus(id2)]);
      setJob1(j1);
      setJob2(j2);
      if (j1.status === "completed" && j2.status === "completed") {
        clearInterval(checkInterval);
        setBothReady(true);
        setPolling(false);
      }
    }, POLL_INTERVAL_MS);
  }, []);

  const handleBothUploaded = useCallback((id1: string, id2: string) => {
    pollBoth(id1, id2);
  }, [pollBoth]);

  return (
    <div className="grid-atmosphere mx-auto max-w-7xl space-y-16 px-6 pb-24 pt-32 md:px-10">
      <div>
        <p className="eyebrow mb-3">05 · Temporal intelligence</p><h1 className="text-[clamp(3rem,6vw,6rem)] font-light uppercase leading-[0.92] tracking-[-0.045em] text-[#e5f3f5]">Change Detection</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#7896a2]">
          Upload two Sentinel-2 GeoTIFFs from different dates. Both are enhanced independently, then compared.
        </p>
      </div>

      <section className="space-y-4">
        <div><p className="eyebrow mb-2">Two dates, one view</p><h2 className="text-2xl font-semibold">Upload Images</h2></div>
        <DualUploader onBothUploaded={handleBothUploaded} />
      </section>

      {polling && !bothReady && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-primary" />
          Enhancing both images — polling status…
        </div>
      )}

      {bothReady && job1?.metrics && job2?.metrics && (
        <section className="space-y-4">
          <div><p className="eyebrow mb-2">Comparison ready</p><h2 className="text-2xl font-semibold">Change Analysis</h2></div>
          <DiffMapViewer
            metrics1={job1.metrics}
            metrics2={job2.metrics}
            jobId1={job1.job_id}
            jobId2={job2.job_id}
          />
        </section>
      )}
    </div>
  );
}
