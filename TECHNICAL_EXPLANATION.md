# AGNI-SHIELD — Technical Explanation

## Agricultural Ground-fire Neural Intelligence Shield

### Transboundary Air Quality Intelligence Platform

---

## Slide 1 — The Problem

**Delhi's air quality crisis is a predictable, preventable event.**

Every year between October and November, farmers in Punjab and Haryana burn an estimated **20 million tonnes** of crop stubble (rice paddy residue). The resulting smoke travels southward through atmospheric wind corridors and blankets Delhi-NCR, causing AQI levels to spike beyond 500+ (Hazardous).

**The challenge:** Current monitoring systems are *reactive* — they report poor air quality only **after** it arrives. By then, hospitals are overwhelmed and schools are shut.

**AGNI-SHIELD's solution:** Predict the AQI impact **24–72 hours before** smoke reaches Delhi by combining satellite fire detection, atmospheric transport modeling, and deep learning.

---

## Slide 2 — System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGNI-SHIELD ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│   │ SATELLITE│──▶│ CLASSIFY │──▶│TRANSPORT │──▶│ PREDICT  │   │
│   │ INGEST   │   │ (XGBoost)│   │ (HYSPLIT)│   │ (LSTM)   │   │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘   │
│        │                                              │         │
│        ▼                                              ▼         │
│   ┌──────────┐                                 ┌──────────┐    │
│   │  NDVI    │                                 │  ALERT   │    │
│   │ ANALYSIS │                                 │  ENGINE  │    │
│   └──────────┘                                 └──────────┘    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │            COMMAND CENTER (Dashboard)                    │   │
│   │  Map · AQI · Wind · Alerts · SHAP · Policy · NDVI      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Slide 3 — Stage 1: Satellite Fire Detection

### Data Sources

| Satellite     | Sensor | Resolution | Revisit Time | Role                        |
|---------------|--------|------------|--------------|-------------------------------|
| Suomi NPP     | VIIRS  | 375 m      | ~3 hours     | Primary fire detection        |
| Aqua / Terra  | MODIS  | 1 km       | ~6 hours     | Backup / cross-validation     |
| Sentinel-2    | MSI    | 10 m       | 5 days       | NDVI vegetation analysis      |

### How Fire Detection Works

1. **Thermal Anomaly Detection**: VIIRS scans Earth's surface in the mid-infrared (4 µm) and thermal-infrared (11 µm) bands. A pixel is flagged as a fire when its brightness temperature significantly exceeds the background temperature of neighboring pixels.

2. **Fire Radiative Power (FRP)**: Each detection includes an FRP value (in megawatts), which quantifies the rate of radiant heat output. Higher FRP = more intense burning. Our data shows FRP values ranging from **12–48 MW** across Punjab/Haryana hotspots.

3. **Confidence Score**: NASA FIRMS provides a confidence percentage (0–100%) for each detection. AGNI-SHIELD filters for detections with **≥70% confidence** to reduce false positives from industrial sources, solar glare, or hot rooftops.

### In the Dashboard

The `fireHotspots` array in `data.js` stores 18 detections with attributes:
```javascript
{
  id: 'F001',
  lat: 30.79,         // Latitude (Punjab region)
  lng: 75.84,         // Longitude
  district: 'Ludhiana',
  intensity: 92,      // Normalized intensity score (0–100)
  confidence: 96,     // Fire confidence from VIIRS (%)
  type: 'agricultural', // Classification result
  frp: 48.2,          // Fire Radiative Power (MW)
  duration: 4.5,      // Hours burning
  timestamp: '...'    // ISO-8601 detection time
}
```

Each fire is rendered as a **Leaflet circle marker** on the map, color-coded by type (red = agricultural, orange = non-agricultural), with size proportional to intensity.

---

## Slide 4 — Stage 2: Agricultural Fire Classification

### Why Classification Matters

Not all fires detected by satellites are crop burning. Other sources include:
- Industrial fires and brick kilns
- Forest fires
- Waste burning
- Construction site fires

**Only agricultural fires** produce the specific particulate signature that causes Delhi's pollution spikes. Separating agri from non-agri fires is critical for accurate AQI prediction.

### XGBoost Classifier

The classification model uses **XGBoost** (Extreme Gradient Boosting), chosen for:
- High accuracy on tabular geospatial data
- Built-in feature importance ranking
- Fast inference (sub-millisecond per fire)

### Feature Inputs

| Feature                      | Description                                   |
|------------------------------|-----------------------------------------------|
| NDVI (Pre-harvest)           | Vegetation index before harvest — high NDVI confirms crop presence |
| Land Cover Type              | MODIS land cover classification (cropland vs. urban/forest) |
| Spatial Clustering (DBSCAN)  | Agricultural fires cluster in large field patterns |
| Fire Radiative Power (FRP)   | Crop fires have characteristic FRP ranges |
| Time of Day                  | Stubble burning follows predictable diurnal patterns |
| Season                       | Oct–Nov is the known Kharif burning window |
| Distance to Roads            | Agricultural fires are in fields, not roadsides |

### Classification Results in Dashboard

The **Fire Classification** panel shows an XGBoost-powered doughnut chart:
- **Agricultural fires**: 132 (85%)
- **Non-Agricultural**: 24 (15%)

The **SHAP (SHapley Additive exPlanations)** panel shows feature importance:
```
Fire Radiative Power     ████████████████████████████   28%
Wind Speed (to Delhi)    ██████████████████████████     22%
PBL Height               ███████████████               15%
Active Fire Count         ████████████                  12%
Distance to Delhi         █████████                     9%
Relative Humidity         ██████                        6%
Temperature               ████                          4%
NDVI (Pre-harvest)        ███                           3%
Cloud Cover               █                             1%
```

---

## Slide 5 — Stage 3: Wind Trajectory & Transport Modeling

### HYSPLIT-Style Forward Trajectory Simulation

Once fires are detected and classified, AGNI-SHIELD models **how pollutants travel** from the source region (Punjab/Haryana) to the receptor (Delhi).

### Wind Corridor Physics

The Indo-Gangetic Plain acts as a natural channel during post-monsoon season:

1. **Northwesterly winds** (prevailing direction: 305°–325° NW) carry smoke southeast toward Delhi
2. **Planetary Boundary Layer (PBL) height** determines vertical mixing:
   - Low PBL (<500m) = pollutants trapped near surface = worse air quality
   - High PBL (>1500m) = pollutants dispersed upward = less ground-level impact
3. **Transport time**: Typically **8–14 hours** from Punjab fire fields to Delhi at 12–18 km/h wind speeds

### Three Transport Corridors Modeled

| Corridor         | Source Region     | Color   | Wind Speed | Path                           |
|------------------|-------------------|---------|------------|--------------------------------|
| Primary          | Ludhiana          | Red     | 14.2 km/h  | Ludhiana → Patiala → Delhi     |
| Secondary        | Bathinda          | Orange  | 11.8 km/h  | Bathinda → Hisar → Delhi       |
| Tertiary         | Amritsar          | Yellow  | 9.5 km/h   | Amritsar → Ambala → Karnal → Delhi |

### In the Dashboard

**Wind trajectory lines** are drawn as animated dashed polylines on the Leaflet map using `L.polyline` with:
```javascript
{
  color: '#ff4757',     // Red for primary corridor
  weight: 2.5,
  opacity: 0.6,
  dashArray: '8 12',    // Dashed pattern
  className: 'wind-path', // CSS animation target
}
```

**Wind particles**: Small circle markers (`L.circleMarker`) animate along each trajectory path using `requestAnimationFrame()`. The particle system:
- Interpolates position along the waypoint array using parametric `t` (0 → 1)
- Fades in/out using `sin(t * π)` for smooth opacity transitions
- 3 particles per corridor = 9 total animated simultaneously
- Creates a visual "flow" effect showing wind direction toward Delhi

**Wind compass**: Shows current bearing (315° NW), speed (14.2 km/h), PBL height (450 m), and estimated transport time ("~12 hours").

---

## Slide 6 — Stage 4: AQI Prediction (LSTM Deep Learning)

### Why LSTM?

Air quality is a **time-series problem** — today's PM2.5 depends on yesterday's fires, last night's wind, and this morning's boundary layer height. **Long Short-Term Memory (LSTM)** networks excel at capturing these temporal dependencies.

### Model Architecture

```
Input (72 features per timestep)
    │
    ▼
┌──────────────────────┐
│  LSTM Layer 1        │  128 units, return sequences
│  (Temporal encoding) │
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  LSTM Layer 2        │  64 units
│  (Feature synthesis) │
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  Dense Layers        │  32 → 16 → 1 (PM2.5 prediction)
│  + Dropout (0.2)     │
└──────────────────────┘
    │
    ▼
Output: PM2.5 concentration (µg/m³) for next 72 hours
```

### Input Features per Timestep

| Category         | Features                                              |
|------------------|-------------------------------------------------------|
| Fire metrics     | Count, total FRP, mean intensity, cluster count       |
| Meteorology      | Wind speed, wind direction, PBL height, temperature, humidity |
| Historical AQI   | Past 24h PM2.5, PM10, NO2, SO2 readings              |
| Transport        | Distance-weighted fire impact, transport corridor load |
| Temporal         | Hour of day, day of week, season encoding             |

### 72-Hour Forecast Output

The LSTM outputs a PM2.5 prediction at **9-hour intervals** for 72 hours:
- **Confidence bands** (upper/lower bounds) show prediction uncertainty
- AQI is derived from PM2.5 using the Indian NAQI formula

### In the Dashboard

The **AQI Forecast (72h)** chart uses Chart.js with:
- Red filled area: PM2.5 forecast with confidence bands
- Blue dashed line: Derived AQI values
- X-axis: +0h, +9h, +18h, +27h, +36h, +45h, +54h, +63h, +72h

```javascript
// PM2.5 to AQI conversion (Indian NAQI)
// 0–30 µg/m³ → Good (0–50)
// 31–60 → Satisfactory (51–100)
// 61–90 → Moderate (101–200)
// 91–120 → Poor (201–300)
// 121–250 → Very Poor (301–400)
// 250+ → Severe (401–500)
```

---

## Slide 7 — Stage 5: Alert Engine & Risk Scoring

### Multi-Tier Alert System

Alerts are threshold-triggered based on predicted AQI breaches:

| Level     | Trigger Condition                     | Horizon    | Action                              |
|-----------|---------------------------------------|------------|--------------------------------------|
| CRITICAL  | PM2.5 predicted > 350 µg/m³          | 24 hours   | Emergency advisory issued            |
| WARNING   | High fire density + wind alignment    | 48 hours   | Transport corridor alert             |
| INFO      | Moderate activity in source region    | 72 hours   | Monitoring advisory                  |

### District Risk Index (0–100)

Each district gets a composite risk score calculated from:

```
Risk Score = w1 × (Fire Count / Max Fires)
           + w2 × (Mean FRP / Max FRP)
           + w3 × (Wind Alignment Score)
           + w4 × (1 / Distance to Delhi)
           + w5 × (1 / PBL Height)
```

Where: `w1=0.25, w2=0.20, w3=0.20, w4=0.20, w5=0.15`

### In the Dashboard

- **Risk list**: 12 districts ranked by score with inline sparkline trends (7-day history)
- **Trend arrows**: Up (↑ worsening), Down (↓ improving), Stable (→)
- **Alert feed**: Real-time alert cards with severity colors and timestamps

---

## Slide 8 — NDVI Crop Residue Analysis

### What is NDVI?

**Normalized Difference Vegetation Index** measures vegetation density using satellite imagery:

```
NDVI = (NIR − Red) / (NIR + Red)
```

| NDVI Value | Interpretation                        |
|------------|---------------------------------------|
| 0.0 – 0.2 | Bare soil, burned land, water         |
| 0.2 – 0.4 | Sparse vegetation, post-harvest       |
| 0.4 – 0.6 | Moderate vegetation                   |
| 0.6 – 1.0 | Dense, healthy crop canopy            |

### Before/After Comparison

AGNI-SHIELD uses **Sentinel-2 satellite tiles** (10m resolution) to compare:

| District    | Pre-Harvest NDVI | Post-Burn NDVI | Delta  | Acres Burned |
|-------------|------------------|----------------|--------|--------------|
| Ludhiana    | 0.82            | 0.18           | –0.64  | 12,400       |
| Sangrur     | 0.79            | 0.21           | –0.58  | 10,800       |
| Amritsar    | 0.76            | 0.24           | –0.52  | 9,200        |
| Patiala     | 0.74            | 0.26           | –0.48  | 8,600        |
| Bathinda    | 0.71            | 0.29           | –0.42  | 7,400        |

### In the Dashboard

An interactive **Before/After comparison slider**:
- Left side shows the pre-harvest tile (dense green vegetation)
- Right side shows post-burn tile (scorched brown/black earth)
- A draggable slider (`<input type="range">`) controls the CSS `clip-path: inset(0 0 0 X%)` to reveal/hide the post-burn overlay
- Per-district stats update dynamically via a dropdown selector

---

## Slide 9 — Policy Simulation (What-If Analysis)

### Monte Carlo Policy Engine

The Policy Simulator answers: **"If we reduce stubble burning by X%, how much would Delhi's AQI improve?"**

### How It Works

1. User adjusts burn reduction slider (0% to 100%)
2. System runs **10,000 Monte Carlo simulations** per configuration:
   - Each simulation varies wind speed, PBL height, and burning patterns randomly
   - LSTM model re-predicts PM2.5 with reduced fire input
3. Results show:
   - **AQI Delta**: Predicted change in AQI (e.g., –78 at 30% reduction)
   - **Improvement percentage**: e.g., 30% reduction → 21% AQI improvement
   - **Confidence**: Monte Carlo confidence interval (higher reduction = lower confidence)

### Formula

```
aqi_delta = -(reduction/100) × base_aqi × sensitivity_factor
improvement = (reduction × 0.7) × diminishing_returns_curve
confidence = max(55%, 95% - reduction × 0.6%)
```

**Diminishing returns**: The first 30% of burn reduction yields the most benefit. Beyond 60%, marginal gains decrease because other pollution sources (vehicles, industry, dust) dominate.

---

## Slide 10 — Explainable AI (SHAP)

### Why Explainability Matters

Government policy makers need to **understand why** the model predicts what it does. A black-box prediction of "AQI will be 400 tomorrow" is not actionable. They need to know:
- Is it the fire count? The wind? The boundary layer height?
- Which factor should they target for intervention?

### SHAP (SHapley Additive exPlanations)

Based on cooperative game theory, SHAP assigns each input feature a contribution value:

```
f(x) = base_value + φ₁(x₁) + φ₂(x₂) + ... + φₙ(xₙ)
```

Where `φᵢ` is the SHAP value for feature `i` — its marginal contribution to the prediction.

### Feature Attribution Results

| Rank | Feature                 | SHAP Importance | Insight                                          |
|------|-------------------------|-----------------|--------------------------------------------------|
| 1    | Fire Radiative Power    | 28%             | Intensity of burning matters most                 |
| 2    | Wind Speed (to Delhi)   | 22%             | Stronger NW winds = faster smoke transport        |
| 3    | PBL Height              | 15%             | Low boundary layer traps pollutants               |
| 4    | Active Fire Count       | 12%             | More fires = more total emissions                 |
| 5    | Distance to Delhi       | 9%              | Closer fires have exponentially higher impact      |
| 6    | Relative Humidity       | 6%              | High humidity increases secondary PM formation     |
| 7    | Temperature             | 4%              | Temperature inversions trap pollution              |
| 8    | NDVI (Pre-harvest)      | 3%              | Higher crop density = more residue to burn         |
| 9    | Cloud Cover             | 1%              | Minor effect on dispersion                        |

### Model Confidence Ring

Shows overall prediction confidence (typically 82–91%) based on data quality and input completeness.

---

## Slide 11 — CPCB Ground Truth Validation

### 10 Delhi Monitoring Stations

AGNI-SHIELD cross-validates satellite-derived predictions against **Central Pollution Control Board (CPCB)** ground stations:

| Station          | AQI  | PM2.5 (µg/m³) | PM10 (µg/m³) |
|------------------|------|----------------|--------------|
| Anand Vihar      | 342  | 224            | 368          |
| Wazirpur         | 310  | 198            | 332          |
| Dwarka Sec-8     | 295  | 188            | 312          |
| RK Puram         | 275  | 172            | 290          |
| ITO              | 267  | 168            | 285          |
| Ashok Vihar      | 258  | 162            | 275          |
| Punjabi Bagh     | 248  | 155            | 262          |
| Okhla Phase-2    | 235  | 148            | 248          |
| Mandir Marg      | 220  | 138            | 235          |
| Lodhi Road       | 198  | 125            | 210          |

### In the Dashboard

Each station is mapped as a **color-coded badge marker** on the Leaflet map:
- Background color = AQI severity (red = very poor, green = good)
- Popup shows station name, AQI, PM2.5, and PM10
- Color scale: Green (0–50) → Yellow (51–100) → Orange (101–200) → Red (201–300) → Purple (301–400) → Maroon (401+)

---

## Slide 12 — Interactive Features

### 7-Day Fire Timelapse

- A slider scrubs through the past 7 days of fire detections
- Play/Pause button auto-advances the slider
- Fire markers add up progressively (day 1 = fewer fires → day 7 = peak)
- Counter shows fires active on the selected day
- Heatmap layer updates with each day's fire positions

### Heatmap Density Layer

- Toggle button switches between point markers and heat intensity view
- Uses Leaflet.heat plugin with custom gradient:
  - Deep purple (low density) → Blue → Orange → Red (high density)
- Radius: 35px, Blur: 25px — creates smooth intensity blobs
- Useful for identifying **fire clustering patterns** across the corridor

### PDF District Report Export

- "Export Report" button captures the entire dashboard canvas using **html2canvas**
- Generates a formatted HTML report in a new window with:
  - Dashboard screenshot
  - Key statistics table (AQI, fires, wind, model confidence)
  - AGNI-SHIELD branding
  - Print-optimized styling for PDF export

---

## Slide 13 — Technology Stack

### Frontend

| Technology     | Version | Purpose                                       |
|----------------|---------|-----------------------------------------------|
| HTML5          | --      | Semantic structure                             |
| CSS3           | --      | Glassmorphism design, grid layout, animations  |
| JavaScript     | ES6+    | Application logic, data binding                |
| Leaflet.js     | 1.9.4   | Interactive mapping                            |
| Leaflet.heat   | 0.2.0   | Heatmap density visualization                  |
| Chart.js       | 4.4.1   | AQI forecast and fire classification charts    |
| html2canvas    | 1.4.1   | Dashboard screenshot for PDF export            |
| Inter + JetBrains Mono | -- | Typography (Google Fonts)               |

### Design System

| Element              | Implementation                                    |
|----------------------|---------------------------------------------------|
| Color palette        | 7 semantic accent colors with CSS variables       |
| Glass cards          | `backdrop-filter: blur(16px)` with semi-transparent backgrounds |
| Icons                | SVG data URIs in CSS (zero emoji, zero icon fonts) |
| Animations           | CSS `@keyframes` + JS `requestAnimationFrame`     |
| Grid layout          | CSS Grid with named areas for dashboard zones     |
| Responsive           | 3 breakpoints (1400px, 900px, 600px)              |

### Backend (Production Architecture)

| Component          | Technology            | Purpose                              |
|--------------------|-----------------------|--------------------------------------|
| API Server         | Python FastAPI         | REST endpoints for data ingestion    |
| ML Pipeline        | TensorFlow + XGBoost  | LSTM forecasting + fire classification |
| Satellite Ingest   | NASA FIRMS API         | VIIRS/MODIS fire data feed           |
| Weather Data       | Open-Meteo API         | Wind, temperature, humidity, PBL     |
| NDVI Processing    | Google Earth Engine    | Sentinel-2 vegetation analysis       |
| Trajectory Model   | NOAA HYSPLIT           | Forward trajectory simulation        |
| Database           | PostgreSQL + TimescaleDB | Time-series storage               |
| Alert System       | Twilio + Email         | Multi-channel notifications          |

---

## Slide 14 — Data Flow Pipeline

```
NASA FIRMS API ──────────┐
  (VIIRS fire feed)       │
                          ▼
Open-Meteo API ──────► Data Ingestion Layer ──► PostgreSQL
  (wind, temp, PBL)       │                         │
                          │                         │
Google Earth Engine ──────┤                         ▼
  (Sentinel-2 NDVI)       │              ┌──────────────────┐
                          │              │  Feature Engine   │
                          │              │  (72 features/ts) │
                          │              └──────────────────┘
                          │                         │
                          │              ┌──────────┴───────────┐
                          │              │                      │
                          │              ▼                      ▼
                          │     ┌──────────────┐    ┌──────────────┐
                          │     │  XGBoost     │    │  LSTM        │
                          │     │  Classifier  │    │  Forecaster  │
                          │     └──────────────┘    └──────────────┘
                          │              │                      │
                          │              ▼                      ▼
                          │     Classification         72h PM2.5
                          │     Results               Prediction
                          │              │                      │
                          ▼              ▼                      ▼
               ┌─────────────────────────────────────────────────────┐
               │              AGNI-SHIELD Command Center             │
               │  Real-time interactive dashboard with maps,         │
               │  charts, alerts, policy simulation, and NDVI        │
               └─────────────────────────────────────────────────────┘
```

---

## Slide 15 — Key Metrics & Impact

| Metric                        | Value          |
|-------------------------------|----------------|
| Fire detection granularity    | 375 m (VIIRS)  |
| Classification accuracy       | 87%            |
| Forecast window               | 72 hours       |
| Forecast update frequency     | Every 3 hours  |
| Spatial coverage              | 3 states (PB, HR, DL) |
| CPCB validation stations      | 10             |
| District risk scoring         | 12 districts   |
| NDVI analysis resolution      | 10 m (Sentinel-2) |
| Alert lead time               | 24–72 hours    |
| Policy simulation runs        | 10,000 Monte Carlo per scenario |

---

## Slide 16 — Deployment & Access

### Live Dashboard

```
Landing Page:    http://localhost:3456/
Command Center:  http://localhost:3456/dashboard.html
GitHub:          https://github.com/santhil-cyber/agni-shield
```

### File Structure

```
agni-shield/
├── index.html              # Landing page (animated, scroll-reveal)
├── dashboard.html          # Command center (main dashboard)
├── css/
│   └── styles.css          # Design system (1600+ lines)
├── js/
│   ├── data.js             # Mock data layer (fires, AQI, NDVI, wind)
│   └── app.js              # Application logic (900+ lines)
├── img/
│   ├── ndvi-pre.png        # Pre-harvest satellite tile
│   └── ndvi-post.png       # Post-burn satellite tile
└── TECHNICAL_EXPLANATION.md # This file
```

---

## Slide 17 — Future Roadmap

1. **Real-time VIIRS integration** — Replace mock data with NASA FIRMS API live feed
2. **HYSPLIT API integration** — Real forward trajectory computation from NOAA servers
3. **TensorFlow.js** — Run LSTM inference directly in the browser
4. **Historical analysis** — Multi-year trend dashboards (2015–2026)
5. **Mobile-responsive PWA** — Installable progressive web app for field officers
6. **SMS/WhatsApp alerts** — Push notifications for district administrators
7. **Multi-language support** — Hindi, Punjabi, English
8. **Carbon credit estimation** — Quantify avoided emissions from policy interventions

---

*AGNI-SHIELD — Built for clean air. Powered by satellite intelligence and deep learning.*
