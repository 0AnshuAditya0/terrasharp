# ClariX — Complete Project Brief

## 1. What ClariX Is, In One Paragraph

ClariX takes Sentinel-2 satellite imagery — free, global, revisited every 5 days, but capped
at 10-meter resolution — and uses a trained deep learning model to upscale it 4x, to an effective
2.5-meter resolution. The output isn't just a sharper-looking picture: it preserves exact
georeferencing (CRS and pixel scale), ships with per-pixel uncertainty maps showing where the
model is extrapolating versus confident, and is validated against a full spectral fidelity metric
suite (PSNR, SSIM, Spectral Angle Mapper, NDVI/NDWI preservation, edge fidelity) on every single
run. It is built for people who need current, frequent, spatially precise imagery — not a nicer
photo.

## 2. The Problem, In Full

Two categories of satellite imagery exist today, and each is one you have to fully accept the
downside of:

- **Free, frequent, coarse.** Sentinel-2 (ESA/Copernicus) revisits any point on Earth every 5 days,
  costs nothing, and is globally available — but at 10m resolution, individual buildings, small
  water bodies, narrow roads, and precise field boundaries are barely distinguishable.
- **Expensive, precise, infrequent.** Commercial providers (Planet, Maxar, etc.) offer sub-3m
  imagery, but tasking a satellite for a specific area and date is costly and not something you
  can do at national or continuous scale.

**Nobody was combining the two.** ClariX's premise: instead of choosing resolution or
frequency, use ML to get both — the revisit rate of free imagery, at a resolution useful enough
for real decision-making.

## 3. Why This Matters — Real Use Cases, Not Hypotheticals

- **Agriculture**: crop health monitoring via NDVI needs both spatial detail (field-level, not
  district-level) and frequent updates (crops change week to week) — Sentinel-2 alone gives
  frequency without detail; ClariX adds the detail back.
- **Disaster response**: flood extent mapping, post-cyclone damage assessment — these events don't
  wait for a commercial satellite tasking window. Free imagery arrives fast; ClariX makes it
  usable at finer granularity, fast enough to matter.
- **Urban and land-use monitoring**: tracking encroachment, sprawl, or informal settlement growth
  over time requires both a long, cheap time series (which only free imagery provides continuously)
  and enough resolution to actually distinguish structures.

## 4. How We Actually Built It — The Real Story

This wasn't a weekend hack. Here's the honest build sequence, including the mistakes, because that
context matters for defending the work under questioning:

1. **Architecture decision**: SwinIR-Light — a from-scratch, compact Swin Transformer
   super-resolution model (shifted-window self-attention, not plain convolution), chosen because
   transformer-based SR captures long-range spatial dependencies (repeating field patterns, aligned
   road segments, urban grid structure) that convolutional kernels alone can't see, while staying
   light enough to export cleanly to ONNX for browser/edge-friendly deployment.
2. **Training data problem**: no free 2.5m ground-truth exists for arbitrary Sentinel-2 coverage.
   Solved using **Wald's protocol** — the standard, peer-reviewed methodology in remote-sensing
   super-resolution research: real Sentinel-2 imagery is degraded (blur + downsample) to synthesize
   a "low-res" input, and the original becomes the target the model learns to reconstruct. At
   inference, the same trained model is applied to genuinely real 10m input — never the synthetic
   degraded cache, which exists only as an internal training artifact (see Section 13).
3. **Loss function, deliberately domain-specific**: L1 pixel loss + VGG perceptual loss + Sobel
   edge loss + **NDVI loss** — this last term is the differentiator. Generic super-resolution
   models optimize for looking sharp; ClariX is explicitly penalized during training for
   distorting the vegetation index that downstream agricultural analysis depends on.
4. **Data diversity, iteratively expanded**: began training on a single Sentinel-2 scene to prove
   the pipeline end-to-end, then expanded to multiple biome-diverse scenes — agriculture, urban,
   coastal, forest, arid, and international terrain — after recognizing that a single-scene model
   risks overfitting to one texture profile rather than genuinely generalizing. One early scene
   turned out to be contaminated with heavy cloud cover (identified via anomalous reflectance
   statistics, not visual inspection alone) and was re-downloaded clean rather than trained on.
5. **Loss-weight tuning for output quality**: initial training produced technically-accurate but
   visibly soft/blurry output — an expected, well-documented consequence of non-adversarial loss
   functions (they reward "safe" pixel averaging over risky sharp predictions). We evaluated and
   explicitly rejected a full GAN-based approach (adversarial training) after two calibration
   attempts showed discriminator collapse — the discriminator became perfect too fast, and the
   generator's adversarial signal went flat, meaning no real adversarial pressure was applied. GAN
   architectures are also well-documented to hallucinate texture that looks convincing but isn't
   real — a genuine risk we were unwilling to accept for a scientific/monitoring tool. Instead, we
   tuned the perceptual loss weight through multiple iterations, settling on a value that achieved
   meaningfully sharper output with no measurable spectral fidelity cost, combined with a
   lightweight post-processing unsharp mask on the display layer only, never touching the metrics
   computation.
6. **PixelShuffle checkerboard investigation**: a later diagnostic test appeared to show a
   structured grid artifact in model output. Investigation (including a productive back-and-forth
   with a technical advisor) applied ICNR initialization — the standard fix for this known failure
   mode in sub-pixel convolution upsampling layers — as a precaution. Deeper investigation
   afterward revealed the original test had actually fed an internal synthetic training-cache file
   (not real Sentinel-2 imagery) into the inference endpoint, which explains the artifact
   independent of the model itself. This is documented transparently in Section 13 rather than
   glossed over, because catching and correctly diagnosing this kind of test-methodology error is
   itself part of doing the work rigorously.
7. **Full-stack integration and testing**: FastAPI backend (tiled inference, uncertainty
   estimation via ensemble perturbation, full metrics pipeline, GeoTIFF I/O with correct
   georeferencing, Copernicus Sentinel Hub OAuth2 integration), Next.js frontend (light-theme,
   restructured into dedicated pages, real backend-rendered comparison imagery, an interactive
   Leaflet-based AOI drawing tool with a hard 20km×20km size cap validated via real-world distance
   calculation), model hosted on Hugging Face Hub with automatic fetch-on-startup and a hard
   failure (not a silent fallback) if the fetch fails without a working backup.
8. **Performance engineering**: initial end-to-end latency was ~51 seconds per request; profiled
   and fixed redundant computation (a bicubic baseline array was being independently recomputed
   three separate times across the metrics, preview, and edge-map pipelines), switched an
   interpolation method from cubic to linear (disclosed 0.35dB metric shift, deemed acceptable),
   replaced a hand-written PNG encoder with Pillow, and reduced uncertainty ensemble passes —
   bringing total latency to roughly 19 seconds, verified by real repeated benchmarking, not
   estimation.

## 5. Final Model Metrics (on held-out validation data)

| Metric | Untrained baseline | Trained model |
|---|---|---|
| Mean PSNR | 10.84 dB | ~38 dB |
| Mean SSIM | 0.097 | ~0.95 |
| Spectral Angle Mapper | 50.2° | ~2-3° |
| NDVI preservation (r) | 0.039 | ~0.92-0.93 |
| Edge cosine similarity | 0.742 | high, visually confirmed sharper structure |

These are measured against a bicubic-upsampled baseline of real Sentinel-2 imagery — see Section
8 for why this is standard practice, not a limitation unique to us.

## 6. Why We're Better Than Satlas-Type Alternatives

Satlas (Allen AI) and similar large-scale remote-sensing foundation models are trained for broad,
general-purpose geospatial tasks (land cover classification, object detection) across huge,
diverse global datasets — they are generalists. ClariX is a specialist, and that's the
deliberate positioning:

- **Purpose-built for one job, done deeply**: super-resolution specifically for Sentinel-2, with a
  loss function and metric suite tuned entirely around that one task's real requirements (spectral
  index preservation, not generic "looks realistic" scoring).
- **Uncertainty quantification is not an afterthought**: general-purpose foundation models
  typically output a single confident prediction. ClariX ships a per-pixel confidence map with
  every single output, by design — because a model this specialized, applied to a decision-making
  context, needs to communicate its own limits.
- **Deployable and auditable at small scale**: ClariX's model is small enough (SwinIR-Light,
  ONNX-exportable) to run on modest hardware and be fully inspected — architecture, loss weights,
  training data, all disclosed. Large foundation models are often opaque black boxes even to their
  own users regarding failure modes on a specific downstream metric like NDVI fidelity.
- **Full pipeline ownership**: fetch from Copernicus → enhance → validate → visualize is one
  integrated system, not a model checkpoint someone else has to build tooling around.

## 7. Why We're Not "Just Google Maps"

This comparison comes up naturally and needs to be pre-empted, not dodged:

- Google Maps' satellite layer is a **static basemap** — a single snapshot, sometimes over a year
  old, updated unpredictably, sourced from whatever commercial imagery Google licensed for that
  region at some point.
- ClariX is a **monitoring pipeline** — feed it any Sentinel-2 scene from any date in the
  archive (or a fresh fetch), get enhanced output for that specific moment in time.
- Google Maps cannot answer "how did this field's vegetation health change over the last month" —
  it has one photo. ClariX, run against a Sentinel-2 time series, can.
- **We are not competing on visual polish for browsing** — we are solving a monitoring and
  analysis problem Google Maps was never built to solve.

## 8. Critical Questions — Answered Directly, Not Deflected

**"What's the confidence score / uncertainty map actually measuring, and why does it matter?"**
It's a per-pixel estimate of how much the model is extrapolating versus reconstructing with high
confidence, produced via an ensemble-perturbation approach (multiple forward passes with small
input variations; pixel-wise standard deviation of the outputs becomes the uncertainty signal).
High-uncertainty regions are exactly where a human should double-check before acting on the
enhanced output. This exists specifically so ClariX is never presented as ground truth.

**"Does the model hallucinate detail that isn't really there?"**
This is the single most important question to answer honestly, and here's the honest answer:
**any** super-resolution model, including ours, is mathematically incapable of perfectly recovering
information genuinely absent from the source 10m pixel — this is a fundamental information-theory
limit, not a flaw specific to ClariX. What differs is *how much* a model invents versus
reconstructs, and how honestly that's communicated. We deliberately avoided GAN-based
architectures (see Section 4) specifically because they are documented to invent convincing-looking
but fabricated texture to fool their own discriminator — the opposite of what a scientific tool
should do. Our supervised, non-adversarial loss function is mathematically biased toward
conservative, safe reconstruction rather than confident invention — the visible cost is a slightly
softer output (which we partially addressed via loss tuning and display-layer sharpening), the
benefit is a model less prone to fabricating plausible-but-wrong detail. The uncertainty map is the
mechanism for surfacing whatever residual hallucination risk remains, visibly, per output.

**"How do you know the output is actually accurate, without true high-res ground truth?"**
We don't claim absolute pixel-perfect accuracy — we claim *measurable, quantified improvement*
over the naive alternative (bicubic upsampling of the same real 10m input), using the same metrics
the remote-sensing field uses for exactly this reason (PSNR, SSIM, SAM against baseline). This is
standard practice in super-resolution research precisely because independent, free, arbitrary-
location high-res ground truth doesn't exist — if it did, there'd be no need for a super-resolution
model in the first place.

**"What happens if the input scene is something the model has never seen before?"**
This is the real, disclosed limitation (see Section 9) — training on multiple diverse biomes
substantially reduces but does not eliminate this risk. The uncertainty map is the safeguard: an
unfamiliar scene should produce visibly higher uncertainty, signaling reduced confidence, rather
than a silent wrong answer.

**"Why not just use a bigger, more established model (Real-ESRGAN, etc.)?"**
Those are trained on natural photographs — faces, general scenes, three RGB channels. Run one
directly on a 4-band multispectral satellite tile and you either lose the NIR band entirely or get
an output with no relationship to real surface reflectance values, making it useless for any
spectral index calculation. Multispectral, reflectance-aware, NDVI-loss-supervised training is not
a settings toggle on a general-purpose model — it requires the architecture and training pipeline
to be built around it from the start, which is what we did.

## 9. Honest Challenges and Limitations (say these before they're asked)

- **Training footprint currently biome-diverse but not exhaustively global**: strong coverage of
  the terrain types included in training; generalization to visually distinct global biomes not
  yet included is untested — an honest, disclosed scope boundary, not a hidden gap.
- **No independent high-resolution validation set**: as discussed in Section 8, this is a field-wide
  constraint, not unique to us, but it means "accuracy" claims are inherently relative-improvement
  claims, not absolute-truth claims.
- **CPU inference latency (~19s)**: acceptable for interactive demo/prototype use; production
  deployment at scale would benefit from GPU inference or further model quantization (already
  partially implemented via INT8 export).
- **Uncertainty estimation is an approximation**: true Bayesian/MC-dropout uncertainty requires
  dropout active at inference in a specific way; our ensemble-perturbation approach approximates
  the same signal without being formally identical.
- **We deliberately chose sharpness-safety over sharpness-maximization**: a GAN-based model would
  likely score higher on casual visual "looks sharper" comparisons. We consider that an acceptable,
  reasoned trade against hallucination risk — but it is a real trade-off, not a free win.

## 10. Target Users

- **State/district agriculture departments** needing frequent, field-level crop health monitoring
  without commercial imagery budgets.
- **Disaster management authorities** needing faster-than-commercial-tasking imagery enhancement
  during flood/cyclone response windows.
- **Urban planning and land-use monitoring bodies** tracking change over long time horizons where
  continuous commercial tasking isn't economically viable.
- **Research and academic groups** in remote sensing who need a transparent, inspectable,
  reproducible enhancement pipeline rather than a black-box API.

## 11. Points of Impression — What to Make Sure Judges Actually Notice

- The **uncertainty map is not a gimmick** — walk through it deliberately in the demo; it's the
  single most differentiating design decision in the whole project.
- The **GeoTIFF output is real and valid** — mention explicitly that it opens correctly in
  QGIS/ArcGIS with correct CRS and pixel scale, not just a nice-looking PNG.
- The **NDVI-aware loss function** is a specific, defensible technical choice — say the words
  "Wald's protocol" and "NDVI loss term" out loud; they signal genuine domain literacy.
- The **honest limitations section exists and is substantial** — teams that proactively disclose
  scope boundaries read as more credible under judging, not less impressive.
- The **AOI drawing tool with the enforced 20km cap** shows attention to real deployment
  constraints (Sentinel Hub processing limits), not just a cosmetic feature.

## 12. Impact Statement (for closing the pitch)

ClariX doesn't replace commercial high-resolution imagery — it makes free, frequent imagery
usable for decisions that currently require choosing between "current but blurry" and "sharp but
rare and expensive." At national scale, that difference is the gap between reactive and proactive
monitoring — for crops, for disasters, for land use — using infrastructure that already exists and
costs nothing to access.

## 13. Testing Notes (internal — for the team, not just the pitch)

The inference endpoint expects **real Sentinel-2 imagery at native 10m resolution** as input —
either a genuine downloaded/extracted scene chip or a fresh Copernicus fetch. Internal
training-cache files (`datasets/samples/*/lr/`) are synthetic, artificially-degraded artifacts
generated automatically for training pairs via Wald's protocol, and must **never** be used as a
live inference input. Feeding a synthetic LR cache file into `/enhance` produces resampling and
tiling artifacts that are a testing-methodology error, not a reflection of the model's real-world
performance — this was confirmed directly during development after an initial misdiagnosis
mistook a wrong-test-input result for a genuine model defect. Always test with `train/hr/` or
`val/hr/` chips, or a live Copernicus fetch.