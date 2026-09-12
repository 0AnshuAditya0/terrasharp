"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getJobStatus } from "@/lib/api-client";
import type { EnhanceJob } from "@/types";
import SpectralDashboard from "@/components/metrics/SpectralDashboard";
import EdgeCompare from "@/components/metrics/EdgeCompare";
import NdviPreservation from "@/components/metrics/NdviPreservation";
import UncertaintyOverlay from "@/components/viewer/UncertaintyOverlay";
import SatelliteViewer from "@/components/viewer/SatelliteViewer";
import { buildDownloadUrl } from "@/lib/api-client";
import { POLL_INTERVAL_MS } from "@/lib/constants";
import GeoTiffUploader from "@/components/upload/GeoTiffUploader";
import CopernicusFetcher from "@/components/upload/CopernicusFetcher";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-secondary ${className}`} />;
}

function EnhancePageContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");

  const [job, setJob] = useState<EnhanceJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollStatus = useCallback(async () => {
    if (!jobId) return;
    try {
      const data = await getJobStatus(jobId);
      setJob(data);
      if (data.status !== "completed" && !data.status.startsWith("failed")) {
        setTimeout(pollStatus, POLL_INTERVAL_MS);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get job status.");
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    pollStatus();
  }, [jobId, pollStatus]);

  if (!jobId) {
    return (
      <div className="grid-atmosphere mx-auto max-w-7xl space-y-10 px-6 pb-24 pt-32 md:px-10">
        <div className="max-w-3xl space-y-5 reveal-up"><p className="eyebrow">01 · Ingest a scene</p><h1 className="text-[clamp(3rem,6vw,6rem)] font-light uppercase leading-[0.92] tracking-[-0.045em] text-[#e5f3f5]">Start with a Sentinel-2 GeoTIFF.</h1><p className="max-w-2xl text-base leading-7 text-[#7896a2]">Upload a four-band image or request a scene from Copernicus. Your result will open here when processing is complete.</p></div>
        <div id="docs" className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-5 reveal-up reveal-delay-1"><div><p className="eyebrow mb-2">Local source</p><h2 className="text-2xl font-light uppercase tracking-[-0.02em] text-[#e5f3f5]">Upload GeoTIFF</h2><p className="mt-2 text-sm text-[#7896a2]">Use a local four-band Sentinel-2 scene.</p></div><GeoTiffUploader /></section>
          <section className="space-y-5 reveal-up reveal-delay-2"><div><p className="eyebrow mb-2">Remote source</p><h2 className="text-2xl font-light uppercase tracking-[-0.02em] text-[#e5f3f5]">Fetch from Copernicus</h2><p className="mt-2 text-sm text-[#7896a2]">Request imagery by coordinates and date.</p></div><CopernicusFetcher /></section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl border-l border-destructive px-6 py-32"><div className="mb-2 text-lg font-semibold text-destructive">Error</div><div className="text-sm text-muted-foreground">{error}</div>
      </div>
    );
  }

  const isPending = !job || (job.status !== "completed" && !job.status.startsWith("failed"));
  const isFailed = job?.status.startsWith("failed");

  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-6 pb-24 pt-32 md:px-10">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-primary" />
          Processing job <code className="text-xs font-mono">{jobId}</code>…
        </div>
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="mx-auto max-w-2xl border-l border-destructive px-6 py-32"><div className="text-lg font-semibold text-destructive">Job Failed</div>
        <div className="text-muted-foreground text-sm">{job?.status}</div>
      </div>
    );
  }

  const metrics = job!.metrics!;
  const uncertaintyUrl = buildDownloadUrl(jobId, "uncertainty.tif");

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-6 pb-24 pt-32 md:px-10">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="eyebrow mb-3">04 · Resolve</p><h1 className="text-[clamp(2.8rem,5vw,5rem)] font-light uppercase leading-[0.92] tracking-[-0.045em]">Enhancement Result</h1>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6f929c]">{jobId}</div>
          </div>
          <div className="flex gap-2">
            <a
              href={buildDownloadUrl(jobId, "enhanced.tif")}
              download="enhanced.tif"
              id="download-enhanced"
              className="text-sm px-4 py-3 bg-primary text-black font-semibold hover:-translate-y-0.5 hover:bg-primary/90"
            >
              ↓ Enhanced GeoTIFF
            </a>
            <a
              href={uncertaintyUrl}
              download="uncertainty.tif"
              id="download-uncertainty"
              className="text-sm px-4 py-3 border border-border bg-card text-foreground hover:border-primary hover:text-primary"
            >
              ↓ Uncertainty Map
            </a>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div><p className="eyebrow mb-2">01 · Compare</p><h2 className="text-2xl font-semibold">Before / After Viewer</h2></div>
        <SatelliteViewer jobId={jobId} />
        <UncertaintyOverlay jobId={jobId} uncertaintyUrl={uncertaintyUrl} />
      </section>

      <section className="space-y-4">
        <div><p className="eyebrow mb-2">02 · Signal quality</p><h2 className="text-2xl font-semibold">Spectral Metrics</h2></div>
        <SpectralDashboard metrics={metrics} />
      </section>

      <section className="space-y-4">
        <div><p className="eyebrow mb-2">03 · Indices</p><h2 className="text-2xl font-semibold">Index Preservation</h2></div>
        <NdviPreservation ndviPreservation={metrics.ndvi_preservation} ndwiPreservation={metrics.ndwi_preservation} />
      </section>

      <section className="space-y-4">
        <div><p className="eyebrow mb-2">04 · Detail</p><h2 className="text-2xl font-semibold">Edge Analysis</h2></div>
        <EdgeCompare jobId={jobId} edgeMetrics={metrics.edge_metrics} />
      </section>
    </div>
  );
}

export default function EnhancePage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-10"><Skeleton className="h-96 w-full" /></div>}>
      <EnhancePageContent />
    </Suspense>
  );
}
