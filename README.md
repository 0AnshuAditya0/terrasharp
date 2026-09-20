# ClariX

**Turn 10-meter free satellite pixels into 2.5-meter intelligence.**

ClariX is a 4x super-resolution pipeline purpose-built for Sentinel-2 imagery — free, global,
revisited every 5 days, but capped at 10m resolution. ClariX upscales it to an effective 2.5m,
with per-pixel uncertainty quantification, full spectral fidelity validation, and correct
georeferencing preserved end to end.

Built for **Smart India Hackathon 2026** (Problem Statement PS-142).

---

## Why ClariX

Free satellite imagery and high-resolution imagery have historically been a trade-off: Sentinel-2
gives you frequency and cost-freedom at 10m resolution; commercial providers give you sharpness at
a price and schedule most use cases can't sustain. ClariX closes that gap with a trained deep
learning model instead of an expensive satellite tasking request.

- **Multi-spectral, not RGB** — processes all 4 optical bands (B02, B03, B04, B08/NIR) together,
  because NIR is what makes agricultural NDVI monitoring possible at all.
- **NDVI-aware training loss** — the model is explicitly penalized for degrading vegetation index
  fidelity, not just pixel sharpness.
- **Per-pixel uncertainty maps** — every output ships with a confidence map. Regions where the
  model is extrapolating rather than reconstructing are visibly flagged, never presented as ground
  truth.
- **Valid GeoTIFF output** — correct CRS and rescaled pixel resolution, drops straight into
  QGIS/ArcGIS like any other georeferenced raster.
- **Live Copernicus integration** — fetch directly from Sentinel Hub by coordinates, no manual
  download-unzip-upload cycle.
- **Full self-validation** — PSNR, SSIM, Spectral Angle Mapper, NDVI/NDWI preservation, and edge
  fidelity computed and returned on every single request.

See [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) for the full technical narrative, competitive
positioning, and honest limitations, and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for system
design details.

---

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌───────────────────┐
│   Next.js  │─────▶│   FastAPI      │─────▶│  ONNX Runtime   │
│   Frontend │◀─────│  Inference API │◀─────│  (SwinIR-Light) │
└─────────────┘      └──────────────────┘      │  fetched from   │
                              │            │ Hugging Face Hub │
                              ▼            └───────────────────┘
                      ┌──────────────────┐
                      │ Copernicus     │
                      │ Data Space     │
                      │ (Sentinel Hub) │
                      └──────────────────┘
```

- **Model**: SwinIR-Light — a compact, from-scratch Swin Transformer super-resolution architecture
  (shifted-window self-attention), trained on 11,543 chips across 7 biome-diverse Sentinel-2 scenes
  (agriculture, urban, coastal, forest, arid terrain).
- **Training methodology**: Wald's protocol — real Sentinel-2 imagery degraded to synthesize
  low-resolution training pairs, since no free 2.5m ground truth exists for arbitrary coverage.
- **Backend**: FastAPI, tiled inference, ensemble-based uncertainty estimation, full metrics
  pipeline, GeoTIFF I/O.
- **Frontend**: Next.js 14, light-theme, interactive Leaflet-based AOI selection.
- **Model hosting**: Hugging Face Hub, auto-fetched by the backend at startup.

---

## Validation Metrics

Measured on held-out validation chips against a bicubic-upsampled baseline:

| Metric | Untrained baseline | Trained model |
|---|---|---|
| Mean PSNR | 10.84 dB | ~38.4 dB |
| Mean SSIM | 0.097 | ~0.95 |
| Spectral Angle Mapper | 50.2° | ~2.06° |
| NDVI preservation (r) | 0.039 | ~0.92 |

---

## Project Structure

```
terrasharp/
├── apps/
│   ├── web/            # Next.js frontend
│   └── inference/       # FastAPI backend
├── packages/
│   └── model-training/  # Training pipeline, model architecture, export scripts
├── datasets/             # Training data (not committed — see below)
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SIH_PITCH.md
│   └── PROJECT_BRIEF.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Copernicus Data Space account (client ID + secret) for live Sentinel-2 fetching
- (Optional, for training) CUDA-capable GPU

### 1. Clone and install
```bash
git clone https://github.com/<your-org>/terrasharp.git
cd terrasharp
```

### 2. Backend setup
```bash
cd apps/inference
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `apps/inference/`:
```env
HF_MODEL_REPO=<your-huggingface-username>/terrasharp-models
COPERNICUS_CLIENT_ID=<your-client-id>
COPERNICUS_CLIENT_SECRET=<your-client-secret>
ALLOWED_ORIGIN=http://localhost:3000
```

Run the backend:
```bash
uvicorn app:app --reload --port 8000
```

The trained model is fetched automatically from Hugging Face Hub on first run. If unavailable, the
backend falls back to an untrained placeholder model and logs a loud warning — it never silently
serves degraded output without flagging it.

### 3. Frontend setup
```bash
cd apps/web
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### 4. (Optional) Train your own model
See [`packages/model-training/`](packages/model-training/) — `prepare_data.py` converts raw
Sentinel-2 `.SAFE` products into training chips, `train.py` runs the training loop, and
`export_onnx.py` exports the final checkpoint to ONNX for backend deployment.

```bash
cd packages/model-training
pip install -r requirements.txt
python prepare_data.py --safe_dir "path/to/scene.SAFE"
python train.py --config config.yaml
python export_onnx.py
```

---

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check, confirms model is loaded |
| `/enhance` | POST | Upload a 4-band GeoTIFF, get back enhanced output + metrics |
| `/status/{job_id}` | GET | Check job status and retrieve metrics |
| `/download/{job_id}/{filename}` | GET | Download enhanced GeoTIFF, uncertainty map, or preview PNGs |
| `/fetch-copernicus` | POST | Fetch Sentinel-2 imagery by coordinates and enhance directly |

---

## Known Limitations

- Training data currently covers Indian biomes only; generalization to visually distinct global
  terrain (e.g. tundra, dense rainforest canopy) is untested.
- No independent high-resolution ground truth exists for arbitrary Sentinel-2 coverage — metrics
  are measured as relative improvement over a bicubic baseline, standard practice in
  super-resolution literature for this reason.
- Uncertainty estimation uses an ensemble-perturbation approximation, not formal Bayesian/MC-dropout
  uncertainty.
- CPU inference latency is ~19 seconds end-to-end; GPU deployment would bring this well under 5s.

Full discussion in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md).

---

## Tech Stack

**Frontend**: Next.js 14, TypeScript, Tailwind CSS, react-leaflet, Recharts
**Backend**: FastAPI, ONNX Runtime, rasterio, scikit-image, SQLite
**Model**: PyTorch, custom SwinIR-Light architecture, exported to ONNX
**Infrastructure**: Hugging Face Hub (model hosting), Copernicus Data Space / Sentinel Hub (imagery
source)

---

## License

*...*

## Team

Built for Smart India Hackathon 2026.