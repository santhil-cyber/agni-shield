// ═══════════════════════════════════════════════════════════════
// AGNI-SHIELD — Mock Data Layer
// ═══════════════════════════════════════════════════════════════

const MOCK = (() => {
  // ── Punjab / Haryana fire hotspots ──────────────────────────
  const fireHotspots = [
    { id: 'F001', lat: 30.79, lng: 75.84, district: 'Ludhiana', intensity: 92, confidence: 96, type: 'agricultural', frp: 48.2, duration: 4.5, timestamp: '2026-02-20T14:30:00Z' },
    { id: 'F002', lat: 31.32, lng: 75.58, district: 'Jalandhar', intensity: 78, confidence: 88, type: 'agricultural', frp: 32.1, duration: 3.2, timestamp: '2026-02-20T13:45:00Z' },
    { id: 'F003', lat: 30.35, lng: 76.78, district: 'Patiala', intensity: 85, confidence: 91, type: 'agricultural', frp: 41.7, duration: 5.1, timestamp: '2026-02-20T15:00:00Z' },
    { id: 'F004', lat: 30.91, lng: 75.40, district: 'Moga', intensity: 70, confidence: 82, type: 'agricultural', frp: 25.3, duration: 2.8, timestamp: '2026-02-20T12:15:00Z' },
    { id: 'F005', lat: 31.63, lng: 74.86, district: 'Amritsar', intensity: 88, confidence: 94, type: 'agricultural', frp: 44.9, duration: 6.0, timestamp: '2026-02-20T11:30:00Z' },
    { id: 'F006', lat: 30.15, lng: 75.19, district: 'Bathinda', intensity: 65, confidence: 80, type: 'agricultural', frp: 20.4, duration: 2.1, timestamp: '2026-02-20T16:00:00Z' },
    { id: 'F007', lat: 29.96, lng: 76.88, district: 'Karnal', intensity: 73, confidence: 85, type: 'agricultural', frp: 28.6, duration: 3.5, timestamp: '2026-02-20T10:00:00Z' },
    { id: 'F008', lat: 29.69, lng: 76.97, district: 'Panipat', intensity: 60, confidence: 78, type: 'non-agricultural', frp: 15.2, duration: 1.5, timestamp: '2026-02-20T09:00:00Z' },
    { id: 'F009', lat: 30.37, lng: 76.46, district: 'Ambala', intensity: 80, confidence: 90, type: 'agricultural', frp: 37.5, duration: 4.0, timestamp: '2026-02-20T14:00:00Z' },
    { id: 'F010', lat: 30.51, lng: 75.95, district: 'Sangrur', intensity: 90, confidence: 95, type: 'agricultural', frp: 46.8, duration: 5.8, timestamp: '2026-02-20T13:00:00Z' },
    { id: 'F011', lat: 31.10, lng: 75.78, district: 'Kapurthala', intensity: 55, confidence: 76, type: 'agricultural', frp: 18.1, duration: 2.0, timestamp: '2026-02-20T08:30:00Z' },
    { id: 'F012', lat: 30.68, lng: 76.71, district: 'Rupnagar', intensity: 45, confidence: 72, type: 'non-agricultural', frp: 12.3, duration: 1.2, timestamp: '2026-02-20T07:00:00Z' },
    { id: 'F013', lat: 29.38, lng: 76.96, district: 'Sonipat', intensity: 68, confidence: 83, type: 'agricultural', frp: 24.0, duration: 3.0, timestamp: '2026-02-20T15:30:00Z' },
    { id: 'F014', lat: 30.93, lng: 76.39, district: 'Mohali', intensity: 42, confidence: 70, type: 'non-agricultural', frp: 10.5, duration: 0.8, timestamp: '2026-02-20T06:00:00Z' },
    { id: 'F015', lat: 31.52, lng: 75.34, district: 'Hoshiarpur', intensity: 76, confidence: 87, type: 'agricultural', frp: 30.2, duration: 3.8, timestamp: '2026-02-20T12:45:00Z' },
    { id: 'F016', lat: 30.21, lng: 74.95, district: 'Muktsar', intensity: 82, confidence: 92, type: 'agricultural', frp: 39.1, duration: 4.8, timestamp: '2026-02-20T11:00:00Z' },
    { id: 'F017', lat: 29.82, lng: 76.20, district: 'Jind', intensity: 58, confidence: 79, type: 'agricultural', frp: 19.7, duration: 2.5, timestamp: '2026-02-20T10:30:00Z' },
    { id: 'F018', lat: 30.73, lng: 76.54, district: 'Fatehgarh Sahib', intensity: 50, confidence: 74, type: 'agricultural', frp: 16.4, duration: 1.9, timestamp: '2026-02-20T09:15:00Z' },
  ];

  // ── District risk scores ───────────────────────────────────
  const districtRisks = [
    { district: 'Ludhiana', risk: 92, trend: 'up', fires: 14, sparkline: [40, 55, 60, 72, 80, 88, 92] },
    { district: 'Sangrur', risk: 88, trend: 'up', fires: 11, sparkline: [35, 42, 55, 68, 75, 82, 88] },
    { district: 'Amritsar', risk: 85, trend: 'up', fires: 9, sparkline: [30, 38, 50, 62, 70, 78, 85] },
    { district: 'Patiala', risk: 82, trend: 'up', fires: 8, sparkline: [28, 35, 45, 58, 65, 75, 82] },
    { district: 'Muktsar', risk: 78, trend: 'up', fires: 7, sparkline: [25, 32, 40, 52, 60, 70, 78] },
    { district: 'Bathinda', risk: 72, trend: 'stable', fires: 6, sparkline: [30, 40, 50, 60, 65, 70, 72] },
    { district: 'Jalandhar', risk: 68, trend: 'down', fires: 5, sparkline: [50, 55, 62, 68, 70, 68, 68] },
    { district: 'Moga', risk: 65, trend: 'stable', fires: 5, sparkline: [35, 40, 48, 55, 60, 63, 65] },
    { district: 'Karnal', risk: 60, trend: 'up', fires: 4, sparkline: [20, 28, 35, 42, 48, 55, 60] },
    { district: 'Hoshiarpur', risk: 55, trend: 'down', fires: 3, sparkline: [45, 50, 55, 58, 58, 56, 55] },
    { district: 'Ambala', risk: 50, trend: 'stable', fires: 3, sparkline: [30, 35, 40, 45, 48, 50, 50] },
    { district: 'Sonipat', risk: 45, trend: 'up', fires: 2, sparkline: [15, 20, 25, 30, 35, 40, 45] },
  ];

  // ── 72-hour AQI forecast ───────────────────────────────────
  const hours = [];
  const pm25Forecast = [];
  const pm10Forecast = [];
  const aqiForecast = [];
  const pm25Upper = [];
  const pm25Lower = [];

  const baseAQI = 185;
  for (let h = 0; h <= 72; h += 3) {
    hours.push(h);
    const spike = Math.sin((h / 72) * Math.PI * 2.5) * 80;
    const noise = (Math.random() - 0.5) * 20;
    const pm25 = Math.max(30, Math.round(baseAQI + spike + noise + h * 0.8));
    const pm10 = Math.round(pm25 * 1.6 + (Math.random() - 0.5) * 30);
    const aqi = Math.round(pm25 * 1.1 + 15);
    pm25Forecast.push(pm25);
    pm10Forecast.push(pm10);
    aqiForecast.push(aqi);
    pm25Upper.push(pm25 + 25 + Math.round(h * 0.3));
    pm25Lower.push(Math.max(20, pm25 - 25 - Math.round(h * 0.2)));
  }

  // ── Wind trajectory waypoints (Punjab → Delhi) ────────────
  const windTrajectories = [
    {
      name: 'Primary Corridor', color: '#ff4757', points: [
        [31.32, 75.58], [30.90, 76.00], [30.50, 76.40],
        [30.10, 76.70], [29.60, 76.90], [28.65, 77.23]
      ]
    },
    {
      name: 'Southern Path', color: '#ffa502', points: [
        [30.15, 75.19], [30.00, 75.80], [29.80, 76.30],
        [29.50, 76.70], [29.10, 77.00], [28.65, 77.23]
      ]
    },
    {
      name: 'Northern Arc', color: '#ff6b81', points: [
        [31.63, 74.86], [31.20, 75.50], [30.80, 76.10],
        [30.30, 76.60], [29.70, 76.90], [28.65, 77.23]
      ]
    },
  ];

  // ── Delhi boundary (simplified polygon) ────────────────────
  const delhiBoundary = [
    [28.40, 76.84], [28.40, 77.35], [28.53, 77.50],
    [28.75, 77.45], [28.88, 77.35], [28.88, 77.05],
    [28.75, 76.84], [28.40, 76.84]
  ];

  // ── Punjab boundary (simplified) ──────────────────────────
  const punjabBoundary = [
    [29.55, 73.87], [30.00, 73.87], [30.50, 74.00],
    [31.00, 74.30], [31.50, 74.50], [32.00, 74.80],
    [32.50, 75.40], [32.50, 76.00], [32.00, 76.80],
    [31.50, 76.90], [31.00, 76.85], [30.50, 76.80],
    [30.00, 76.90], [29.55, 76.50], [29.55, 73.87]
  ];

  // ── Haryana boundary (simplified) ───────────────────────────
  const haryanaBoundary = [
    [27.65, 76.10], [28.10, 75.60], [28.50, 75.40],
    [28.90, 75.50], [29.30, 75.80], [29.55, 76.05],
    [29.95, 76.00], [30.20, 76.30], [30.37, 76.50],
    [30.50, 76.80], [30.37, 77.10], [30.10, 77.30],
    [29.70, 77.20], [29.30, 77.10], [28.90, 77.35],
    [28.50, 77.50], [28.10, 77.30], [27.80, 77.00],
    [27.65, 76.70], [27.65, 76.10]
  ];

  // ── Delhi CPCB monitoring stations ─────────────────────────
  const cpcbStations = [
    { id: 'S01', name: 'ITO', lat: 28.6289, lng: 77.2414, aqi: 267, pm25: 168, pm10: 285 },
    { id: 'S02', name: 'Anand Vihar', lat: 28.6469, lng: 77.3164, aqi: 342, pm25: 224, pm10: 368 },
    { id: 'S03', name: 'RK Puram', lat: 28.5635, lng: 77.1724, aqi: 298, pm25: 192, pm10: 310 },
    { id: 'S04', name: 'Dwarka Sec-8', lat: 28.5708, lng: 77.0686, aqi: 245, pm25: 148, pm10: 258 },
    { id: 'S05', name: 'Mandir Marg', lat: 28.6363, lng: 77.2008, aqi: 231, pm25: 138, pm10: 240 },
    { id: 'S06', name: 'Punjabi Bagh', lat: 28.6682, lng: 77.1160, aqi: 288, pm25: 185, pm10: 298 },
    { id: 'S07', name: 'Rohini', lat: 28.7325, lng: 77.1198, aqi: 312, pm25: 206, pm10: 325 },
    { id: 'S08', name: 'Nehru Nagar', lat: 28.5689, lng: 77.2507, aqi: 275, pm25: 172, pm10: 290 },
    { id: 'S09', name: 'Mundka', lat: 28.6847, lng: 77.0316, aqi: 255, pm25: 155, pm10: 265 },
    { id: 'S10', name: 'Sirifort', lat: 28.5504, lng: 77.2159, aqi: 228, pm25: 135, pm10: 235 },
  ];

  // ── 7-day timelapse fire data ─────────────────────────────
  // Each day has a set of fire locations with varying intensity
  const timelapseData = [];
  const dayLabels = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date(2026, 1, 21 - d); // Feb 15-21
    dayLabels.push(date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
    const dayFires = [];
    // Fires ramp up from day 0 to day 6
    const fireCount = 8 + Math.round((6 - d) * 4 + Math.random() * 6);
    for (let i = 0; i < fireCount; i++) {
      // Spread fires across Punjab & Haryana
      const lat = 29.2 + Math.random() * 2.8;
      const lng = 74.5 + Math.random() * 2.8;
      const intensity = 30 + Math.round(Math.random() * 70);
      const frp = 5 + Math.round(Math.random() * 50);
      dayFires.push({ lat, lng, intensity, frp });
    }
    timelapseData.push(dayFires);
  }

  // ── NDVI per-district data ─────────────────────────────────
  const ndviData = [
    { district: 'Ludhiana', preNDVI: 0.82, postNDVI: 0.18, delta: -0.64, burnPct: 78, acresBurned: 12400, date: '15 Oct–12 Nov' },
    { district: 'Sangrur', preNDVI: 0.79, postNDVI: 0.21, delta: -0.58, burnPct: 72, acresBurned: 10800, date: '18 Oct–10 Nov' },
    { district: 'Amritsar', preNDVI: 0.76, postNDVI: 0.24, delta: -0.52, burnPct: 68, acresBurned: 9200, date: '20 Oct–14 Nov' },
    { district: 'Patiala', preNDVI: 0.81, postNDVI: 0.22, delta: -0.59, burnPct: 71, acresBurned: 8900, date: '16 Oct–11 Nov' },
    { district: 'Muktsar', preNDVI: 0.74, postNDVI: 0.19, delta: -0.55, burnPct: 75, acresBurned: 7800, date: '19 Oct–13 Nov' },
    { district: 'Bathinda', preNDVI: 0.77, postNDVI: 0.28, delta: -0.49, burnPct: 62, acresBurned: 6500, date: '22 Oct–15 Nov' },
    { district: 'Karnal', preNDVI: 0.72, postNDVI: 0.30, delta: -0.42, burnPct: 55, acresBurned: 4200, date: '25 Oct–16 Nov' },
    { district: 'Ambala', preNDVI: 0.70, postNDVI: 0.32, delta: -0.38, burnPct: 48, acresBurned: 3100, date: '24 Oct–15 Nov' },
  ];

  // ── SHAP / Feature importance ──────────────────────────────
  const featureImportance = [
    { feature: 'Fire Radiative Power', importance: 0.28, color: '#ff4757' },
    { feature: 'Wind Speed (toward Delhi)', importance: 0.22, color: '#ff6b81' },
    { feature: 'Active Fire Count', importance: 0.15, color: '#ffa502' },
    { feature: 'PBL Height', importance: 0.12, color: '#eccc68' },
    { feature: 'Distance to Delhi', importance: 0.09, color: '#7bed9f' },
    { feature: 'Relative Humidity', importance: 0.06, color: '#70a1ff' },
    { feature: 'Temperature', importance: 0.04, color: '#5352ed' },
    { feature: 'NDVI (Pre-harvest)', importance: 0.03, color: '#a29bfe' },
    { feature: 'Cloud Cover', importance: 0.01, color: '#dfe6e9' },
  ];

  // ── Alerts ─────────────────────────────────────────────────
  const alerts = [
    { level: 'critical', horizon: '24h', message: 'Severe AQI spike expected — PM2.5 may breach 350 µg/m³', time: '2 min ago', district: 'Delhi NCR' },
    { level: 'warning', horizon: '48h', message: 'High fire density in Ludhiana; transport corridor active', time: '18 min ago', district: 'Ludhiana' },
    { level: 'warning', horizon: '48h', message: 'Wind alignment shifting — NW corridor strengthening', time: '45 min ago', district: 'Sangrur' },
    { level: 'info', horizon: '72h', message: 'Moderate burn activity detected in Bathinda cluster', time: '1 hr ago', district: 'Bathinda' },
    { level: 'info', horizon: '72h', message: 'PBL height dropping — increased surface trapping likely', time: '2 hr ago', district: 'Delhi NCR' },
    { level: 'resolved', horizon: '--', message: 'Amritsar fire cluster subsided', time: '4 hr ago', district: 'Amritsar' },
  ];

  // ── Current AQI ────────────────────────────────────────────
  const currentAQI = {
    value: 267,
    category: 'Very Poor',
    pm25: 168,
    pm10: 285,
    no2: 62,
    so2: 18,
    co: 2.4,
    o3: 34,
    station: 'ITO, Delhi',
    updated: '5 min ago'
  };

  // ── Wind metadata ─────────────────────────────────────────
  const windData = {
    speed: 14.2,
    direction: 315,        // NW
    directionLabel: 'NW',
    pblHeight: 420,        // meters
    dispersionFactor: 0.35,
    transportTime: '18–26 hrs'
  };

  // ── Fire stats ─────────────────────────────────────────────
  const fireStats = {
    totalActive: 156,
    agricultural: 132,
    nonAgricultural: 24,
    avgConfidence: 87,
    avgFRP: 31.4,
    clustersDetected: 18,
    topDistrict: 'Ludhiana'
  };

  return {
    fireHotspots,
    districtRisks,
    hours,
    pm25Forecast,
    pm10Forecast,
    aqiForecast,
    pm25Upper,
    pm25Lower,
    windTrajectories,
    delhiBoundary,
    punjabBoundary,
    haryanaBoundary,
    cpcbStations,
    timelapseData,
    dayLabels,
    featureImportance,
    ndviData,
    alerts,
    currentAQI,
    windData,
    fireStats,
  };
})();
