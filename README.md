# CyberSentinel — Threat Intelligence Dashboard

> A premium, production-ready cybersecurity incident and threat intelligence dashboard built on vanilla JavaScript, powered by a Python ML pipeline (Prophet + Isolation Forest).

![Dashboard](https://img.shields.io/badge/status-production--ready-6E8E75?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-1A1D20?style=flat-square)
![JS](https://img.shields.io/badge/JavaScript-ES6_Modules-E29578?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.9+-4A7FA5?style=flat-square)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-D9534F?style=flat-square)

---

## Overview

CyberSentinel is a four-view security operations dashboard that ingests raw network logs, runs volumetric forecasting with Meta Prophet, detects behavioral anomalies via scikit-learn's Isolation Forest, and renders everything in a zero-framework, cream-toned Scandinavian editorial UI.

No React. No Vue. No Angular. Just clean ES6 modules, pure CSS custom properties, and Chart.js 4.4 via UMD.

---

## Screenshots

| View | Description |
|------|-------------|
| **Overview** | KPI cards (SPI, Blocked Payloads, Active Mitigations, Anomaly Rate) + 24h traffic chart |
| **Endpoints** | Host asset deep-dive with traffic history, latency timeline, and raw system log |
| **Predictive Engine** | Prophet forecast bands with 95% CI, RMSE/MAPE validation table |
| **Threat Hunting** | Isolation Forest anomaly log with classification filters and risk scores |

---

## Features

- **Security Posture Index (SPI)** — composite risk score computed from critical event density and anomaly rate
- **Live Traffic Chart** — 24-hour inbound / outbound / blocked payload volume rendered as a multi-series area chart
- **Endpoint Deep-Dive** — per-host traffic history, latency overlay, and scrollable raw system log with severity colouring
- **Prophet Forecasting** — weekly volumetric prediction with transparent upper/lower confidence bands and dashed future segments
- **Isolation Forest Anomaly Detection** — unsupervised multi-variate outlier detection with automatic threat classification taxonomy
- **60-second silent polling** — fetches `cyber_dashboard.json` every 60s, re-renders charts without resetting user navigation state
- **Classification filters** — one-click filter bar in the Threat Hunting view (Credential Spraying, Data Exfiltration, C2 Beacon, DDoS Surge)
- **Responsive layout** — collapses gracefully from widescreen ops centre down to tablet

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Vanilla JS (ES6 Modules) — zero dependencies |
| Charts | Chart.js 4.4 (UMD via cdnjs) |
| Typography | Fraunces (serif KPIs) · DM Mono (console/data) · Inter (body) |
| Styling | Pure CSS Custom Properties — no preprocessor |
| ML Pipeline | Python 3.9+ · pandas · prophet · scikit-learn |
| Data Format | JSON (minified, pipeline-generated) |

---

## Project Structure

```
cyber-dashboard/
├── index.html                    # Semantic shell — sidebar, 4 view slots, loading overlay
├── data/
│   ├── raw/
│   │   ├── threat_forecast.csv   # Historic weekly packet volume logs
│   │   └── live_incidents.csv    # Security event records per host
│   └── cyber_dashboard.json      # Pipeline output consumed by the UI
├── src/
│   ├── css/
│   │   └── main.css              # Complete design system & component library
│   └── js/
│       ├── app.js                # Router, init bootloader, 60s polling loop
│       ├── data.js               # Shared DataStore with filter matrix hooks
│       ├── charts.js             # Chart.js global theme (cream palette, grid config)
│       ├── overview.js           # Security posture overview module
│       ├── endpoints.js          # Host asset deep-dive component
│       ├── predictive.js         # Prophet time-series forecast view
│       └── hunting.js            # AI behavioral threat hunting log
└── scripts/
    └── process_cyber_data.py     # Python pipeline: CSV → Prophet + IsoForest → JSON
```

---

## Quickstart

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/cyber-dashboard.git
cd cyber-dashboard
```

### 2. Serve the frontend

The dashboard is a static site. Any HTTP server works — the `fetch()` calls require an actual server (not `file://`).

```bash
# Python (built-in)
python3 -m http.server 8080

# Node (if you have npx)
npx serve .
```

Open `http://localhost:8080` in your browser.

The pre-generated `data/cyber_dashboard.json` is included so the dashboard runs immediately with no Python setup required.

---

## Running the ML Pipeline

To regenerate `cyber_dashboard.json` from the raw CSVs using real Prophet forecasting and Isolation Forest anomaly detection:

### Install dependencies

```bash
pip install pandas prophet scikit-learn
```

> Prophet requires `pystan` or `cmdstanpy`. On Apple Silicon you may need:
> ```bash
> pip install pystan==2.19.1.1
> pip install prophet
> ```

### Run the pipeline

```bash
python3 scripts/process_cyber_data.py
```

**Output:**
```
[INFO] ML libraries loaded successfully
[1/4] Running Prophet volumetric forecast...
      → RMSE: 14283.47 | MAPE: 3.2156%
[2/4] Running Isolation Forest anomaly detection...
      → Detected 18 behavioral anomalies
[3/4] Building endpoint node profiles...
      → Profiled 4 host nodes
[4/4] Aggregating KPIs & serializing JSON...

[OK] cyber_dashboard.json written → data/cyber_dashboard.json (23.0 KB)
     Security Posture Index : 67.4
     Blocked Payloads       : 14,570
     Active Mitigations     : 42
     Anomaly Rate           : 40.91%
```

The script has a **synthetic data fallback** — if Prophet/sklearn are not installed it generates realistic dummy data so the frontend remains fully functional.

---

## Adding Your Own Data

### `data/raw/threat_forecast.csv`

Weekly volumetric timeseries. Prophet requires two columns exactly:

```csv
ds,y
2025-01-01,12400
2025-01-08,16800
...
```

- `ds` — ISO date string (weekly cadence recommended)
- `y` — numeric payload volume (packets, bytes, requests — your choice of unit)

### `data/raw/live_incidents.csv`

Per-event security log. Required columns:

```
timestamp, host, payload_size_kb, response_latency_ms,
failed_auth_count, bytes_out_mb, request_rate,
severity, event_type, source_ip, destination_port
```

- `severity` — one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `host` — asset name (becomes a tab in the Endpoints view)

After updating CSVs, re-run the pipeline to regenerate `cyber_dashboard.json`.

---

## Anomaly Classification Logic

The Isolation Forest pipeline maps detected outliers to a threat taxonomy based on feature vectors:

| Condition | Classification |
|-----------|---------------|
| `failed_auth_count > 20` | Credential Spraying Spike |
| `payload_size_kb > 10,000` AND `bytes_out_mb > 1,000` | Potential Data Exfiltration Drop |
| `response_latency_ms > 3,000` AND `payload_size_kb > 5,000` | C2 Beacon Anomaly |
| `request_rate > 800` | DDoS Surge Pattern |
| Everything else | Multi-Vector Statistical Outlier |

Contamination parameter is set to `0.12` (12% of traffic expected to be anomalous). Adjust in `process_cyber_data.py`:

```python
clf = IsolationForest(contamination=0.12, random_state=42, n_estimators=100)
```

---

## Design System

The UI is built on a warm Scandinavian editorial palette with three typefaces:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#F9F6F0` | Page background (warm cream) |
| `--bg-card` | `#FFFFFF` | Card surfaces |
| `--border` | `#EAE5D9` | Subtle warm-gray dividers |
| `--charcoal` | `#1A1D20` | Primary text, sidebar |
| `--crimson` | `#D9534F` | Critical severity, alerts |
| `--sage` | `#6E8E75` | Safe / nominal states |
| `--amber` | `#E29578` | Warning / high severity |

Typography:
- **Fraunces** (serif) — KPI values, page headings
- **DM Mono** (monospace) — tabular data, system logs, labels
- **Inter** — body UI text

All transitions are `250ms ease-in-out`. Chart animations use `easeInOutQuart` at `600ms`.

---

## Configuration

| Setting | Location | Default |
|---------|----------|---------|
| Polling interval | `src/js/app.js` → `setInterval` | `60000` ms |
| IsoForest contamination | `scripts/process_cyber_data.py` | `0.12` |
| Prophet interval width | `scripts/process_cyber_data.py` | `0.95` (95% CI) |
| Forecast horizon | `scripts/process_cyber_data.py` | `16` weeks forward |

---

## Browser Support

All modern browsers with ES6 Module support (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+). No build step, no bundler, no transpilation required.

---

## License

MIT — use freely, attribution appreciated.

---

*Built with vanilla JS, Meta Prophet, and scikit-learn. No frameworks were harmed in the making of this dashboard.*
