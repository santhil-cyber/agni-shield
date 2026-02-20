// ═══════════════════════════════════════════════════════════════
// AGNI-SHIELD Command Center — Application Layer
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initAQIHero();
    initFireStats();
    initWindCompass();
    initMap();
    initAQIChart();
    initFireClassChart();
    initDistrictRisks();
    initAlerts();
    initSHAP();
    initPolicySlider();
    initNDVI();
    initPDFExport();
    startLiveUpdates();
});

// ── Utilities ─────────────────────────────────────────────────
function animateCount(el, target, duration = 1200, suffix = '') {
    let start = 0;
    const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function getAQIColor(val) {
    if (val <= 50) return '#26de81';
    if (val <= 100) return '#ffd32a';
    if (val <= 200) return '#ff7f50';
    if (val <= 300) return '#ff4757';
    if (val <= 400) return '#d63031';
    return '#6c0505';
}

function getAQICategory(val) {
    if (val <= 50) return 'Good';
    if (val <= 100) return 'Moderate';
    if (val <= 200) return 'Poor';
    if (val <= 300) return 'Very Poor';
    if (val <= 400) return 'Severe';
    return 'Hazardous';
}

function getRiskColor(risk) {
    if (risk >= 80) return '#ff4757';
    if (risk >= 60) return '#ff7f50';
    if (risk >= 40) return '#ffd32a';
    return '#26de81';
}

// ── Clock ─────────────────────────────────────────────────────
function initClock() {
    const el = document.getElementById('header-clock');
    const update = () => {
        const now = new Date();
        el.textContent = now.toLocaleString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: 'short', year: 'numeric', hour12: false
        });
    };
    update();
    setInterval(update, 1000);
}

// ── AQI Hero ──────────────────────────────────────────────────
function initAQIHero() {
    const aqi = MOCK.currentAQI;
    const color = getAQIColor(aqi.value);

    // Animate number
    const numEl = document.getElementById('aqi-number');
    animateCount(numEl, aqi.value, 1800);

    // Label
    const labelEl = document.getElementById('aqi-category');
    labelEl.textContent = aqi.category;
    labelEl.style.color = color;

    // Ring
    const ring = document.getElementById('aqi-ring-value');
    const circumference = 2 * Math.PI * 58;
    ring.style.strokeDasharray = circumference;
    const pct = Math.min(aqi.value / 500, 1);
    ring.style.strokeDashoffset = circumference * (1 - pct);
    ring.style.stroke = color;

    // Number color
    numEl.style.color = color;

    // Pollutants
    const pollutants = [
        { id: 'pol-pm25', val: aqi.pm25 },
        { id: 'pol-pm10', val: aqi.pm10 },
        { id: 'pol-no2', val: aqi.no2 },
        { id: 'pol-so2', val: aqi.so2 },
        { id: 'pol-co', val: aqi.co },
        { id: 'pol-o3', val: aqi.o3 },
    ];
    pollutants.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.textContent = typeof p.val === 'number' && p.val % 1 !== 0 ? p.val.toFixed(1) : p.val;
    });
}

// ── Fire Stats ────────────────────────────────────────────────
function initFireStats() {
    const fs = MOCK.fireStats;
    animateCount(document.getElementById('stat-total-fires'), fs.totalActive, 1400);
    animateCount(document.getElementById('stat-agri-fires'), fs.agricultural, 1300);
    animateCount(document.getElementById('stat-non-agri'), fs.nonAgricultural, 1200);
    animateCount(document.getElementById('stat-clusters'), fs.clustersDetected, 1100);
    animateCount(document.getElementById('stat-avg-conf'), fs.avgConfidence, 1200, '%');
    animateCount(document.getElementById('stat-avg-frp'), Math.round(fs.avgFRP), 1200);
}

// ── Wind Compass ──────────────────────────────────────────────
function initWindCompass() {
    const w = MOCK.windData;
    const arrow = document.getElementById('compass-arrow');
    // Wind direction: 315 = NW, arrow points in wind direction
    arrow.style.transform = `rotate(${w.direction}deg)`;

    document.getElementById('wind-speed').textContent = w.speed + ' km/h';
    document.getElementById('wind-dir').textContent = w.directionLabel;
    document.getElementById('wind-pbl').textContent = w.pblHeight + ' m';
    document.getElementById('wind-transport').textContent = w.transportTime;
}

// ── Map ───────────────────────────────────────────────────────
let map;
let heatLayer = null;
let heatVisible = false;
let fireMarkersLayer = null;
let timelapseLayer = null;
let timelapseInterval = null;
let cpcbLayer = null;

function initMap() {
    map = L.map('map', {
        center: [29.8, 76.2],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
    });

    // Dark basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
    }).addTo(map);

    // Delhi boundary
    L.polygon(MOCK.delhiBoundary, {
        color: '#4a7dff',
        weight: 2,
        fillColor: '#4a7dff',
        fillOpacity: 0.08,
        dashArray: '6 4',
    }).addTo(map).bindPopup('<div class="fire-popup-title">Delhi NCR</div><div style="color:#8892a4">Target monitoring zone</div>');

    // Punjab boundary
    L.polygon(MOCK.punjabBoundary, {
        color: '#ff7f50',
        weight: 1.5,
        fillColor: '#ff7f50',
        fillOpacity: 0.04,
        dashArray: '8 5',
    }).addTo(map).bindPopup('<div class="fire-popup-title">Punjab</div><div style="color:#8892a4">Primary source region</div>');

    // Haryana boundary
    L.polygon(MOCK.haryanaBoundary, {
        color: '#ffd32a',
        weight: 1.5,
        fillColor: '#ffd32a',
        fillOpacity: 0.04,
        dashArray: '8 5',
    }).addTo(map).bindPopup('<div class="fire-popup-title">Haryana</div><div style="color:#8892a4">Transit corridor region</div>');

    // Fire hotspots (in a layer group for toggling)
    fireMarkersLayer = L.layerGroup().addTo(map);
    MOCK.fireHotspots.forEach((f, i) => {
        const size = 6 + (f.intensity / 100) * 14;
        const opacity = 0.5 + (f.confidence / 100) * 0.5;
        const color = f.type === 'agricultural' ? '#ff4757' : '#ff7f50';

        const marker = L.circleMarker([f.lat, f.lng], {
            radius: size,
            fillColor: color,
            fillOpacity: opacity,
            color: color,
            weight: 1,
            opacity: opacity,
            className: 'fire-marker',
        });

        marker.bindPopup(`
      <div class="fire-popup-title">${f.district} Fire</div>
      <div class="fire-popup-row"><span class="label">Type</span><span class="val">${f.type}</span></div>
      <div class="fire-popup-row"><span class="label">Intensity</span><span class="val">${f.intensity}%</span></div>
      <div class="fire-popup-row"><span class="label">Confidence</span><span class="val">${f.confidence}%</span></div>
      <div class="fire-popup-row"><span class="label">FRP</span><span class="val">${f.frp} MW</span></div>
      <div class="fire-popup-row"><span class="label">Duration</span><span class="val">${f.duration}h</span></div>
    `);
        fireMarkersLayer.addLayer(marker);
    });

    // Wind trajectories
    MOCK.windTrajectories.forEach(traj => {
        const line = L.polyline(traj.points, {
            color: traj.color,
            weight: 2.5,
            opacity: 0.6,
            dashArray: '8 12',
            className: 'wind-path',
        }).addTo(map);

        const last = traj.points[traj.points.length - 1];
        L.circleMarker(last, {
            radius: 5,
            fillColor: traj.color,
            fillOpacity: 0.9,
            color: '#fff',
            weight: 1,
        }).addTo(map);

        line.bindPopup(`<div class="fire-popup-title">${traj.name}</div><div style="color:#8892a4">Wind transport corridor → Delhi</div>`);
    });

    // Delhi marker
    L.circleMarker([28.65, 77.23], {
        radius: 8,
        fillColor: '#4a7dff',
        fillOpacity: 0.9,
        color: '#fff',
        weight: 2,
    }).addTo(map).bindPopup('<div class="fire-popup-title">Delhi</div><div style="color:#8892a4">AQI monitoring target</div>');

    // ── CPCB Station Markers ──────────────────────────────────
    cpcbLayer = L.layerGroup().addTo(map);
    MOCK.cpcbStations.forEach(s => {
        const color = getAQIColor(s.aqi);
        const icon = L.divIcon({
            className: 'cpcb-marker-wrap',
            html: `<div class="cpcb-marker" style="background:${color}; box-shadow: 0 0 12px ${color}80;">${s.aqi}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
        });
        const m = L.marker([s.lat, s.lng], { icon });
        m.bindPopup(`
      <div class="fire-popup-title">${s.name}</div>
      <div class="fire-popup-row"><span class="label">AQI</span><span class="val" style="color:${color}">${s.aqi}</span></div>
      <div class="fire-popup-row"><span class="label">PM2.5</span><span class="val">${s.pm25} µg/m³</span></div>
      <div class="fire-popup-row"><span class="label">PM10</span><span class="val">${s.pm10} µg/m³</span></div>
      <div class="fire-popup-row"><span class="label">Status</span><span class="val">CPCB Live</span></div>
    `);
        cpcbLayer.addLayer(m);
    });

    // ── Heatmap Layer (initially hidden) ──────────────────────
    const heatData = MOCK.fireHotspots.map(f => [f.lat, f.lng, f.intensity / 100]);
    heatLayer = L.heatLayer(heatData, {
        radius: 35,
        blur: 25,
        maxZoom: 10,
        max: 1.0,
        gradient: {
            0.2: '#2d1b69',
            0.4: '#5352ed',
            0.6: '#ffa502',
            0.8: '#ff6b81',
            1.0: '#ff4757'
        }
    });

    // Heatmap toggle button
    const heatBtn = document.getElementById('btn-heatmap');
    if (heatBtn) {
        heatBtn.addEventListener('click', () => {
            heatVisible = !heatVisible;
            if (heatVisible) {
                heatLayer.addTo(map);
                heatBtn.classList.add('active');
                heatBtn.querySelector('.toggle-label').textContent = 'Heatmap ON';
            } else {
                map.removeLayer(heatLayer);
                heatBtn.classList.remove('active');
                heatBtn.querySelector('.toggle-label').textContent = 'Heatmap';
            }
        });
    }

    // ── Timelapse Slider ──────────────────────────────────────
    initTimelapse();
}

// ── Timelapse ─────────────────────────────────────────────────
function initTimelapse() {
    const slider = document.getElementById('timelapse-slider');
    const dayLabel = document.getElementById('timelapse-day');
    const playBtn = document.getElementById('timelapse-play');
    const countLabel = document.getElementById('timelapse-count');

    if (!slider) return;

    slider.max = MOCK.timelapseData.length - 1;
    slider.value = MOCK.timelapseData.length - 1; // default to today

    function showDay(idx) {
        // Remove old timelapse markers
        if (timelapseLayer) map.removeLayer(timelapseLayer);
        timelapseLayer = L.layerGroup().addTo(map);

        const dayFires = MOCK.timelapseData[idx];
        dayLabel.textContent = MOCK.dayLabels[idx];
        countLabel.textContent = dayFires.length + ' fires';

        dayFires.forEach(f => {
            const size = 4 + (f.intensity / 100) * 10;
            const marker = L.circleMarker([f.lat, f.lng], {
                radius: size,
                fillColor: '#ff4757',
                fillOpacity: 0.5 + (f.intensity / 200),
                color: '#ff4757',
                weight: 0.5,
                className: 'fire-marker',
            });
            timelapseLayer.addLayer(marker);
        });

        // Update heatmap data if visible
        if (heatVisible && heatLayer) {
            map.removeLayer(heatLayer);
            const newHeatData = dayFires.map(f => [f.lat, f.lng, f.intensity / 100]);
            heatLayer.setLatLngs(newHeatData);
            heatLayer.addTo(map);
        }
    }

    slider.addEventListener('input', () => {
        showDay(parseInt(slider.value));
        // Stop playback if user manually scrubs
        if (timelapseInterval) {
            clearInterval(timelapseInterval);
            timelapseInterval = null;
            playBtn.textContent = '▶';
            playBtn.classList.remove('playing');
        }
    });

    // Play/Pause button
    let isPlaying = false;
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            clearInterval(timelapseInterval);
            timelapseInterval = null;
            isPlaying = false;
            playBtn.textContent = '▶';
            playBtn.classList.remove('playing');
        } else {
            isPlaying = true;
            playBtn.textContent = '⏸';
            playBtn.classList.add('playing');
            let idx = 0;
            slider.value = 0;
            showDay(0);
            timelapseInterval = setInterval(() => {
                idx++;
                if (idx >= MOCK.timelapseData.length) {
                    clearInterval(timelapseInterval);
                    timelapseInterval = null;
                    isPlaying = false;
                    playBtn.textContent = '▶';
                    playBtn.classList.remove('playing');
                    return;
                }
                slider.value = idx;
                showDay(idx);
            }, 1200);
        }
    });

    // Don't show timelapse markers initially (show live data instead)
}

// ── AQI Forecast Chart ────────────────────────────────────────
function initAQIChart() {
    const ctx = document.getElementById('aqi-chart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: MOCK.hours.map(h => `+${h}h`),
            datasets: [
                {
                    label: 'Upper Bound',
                    data: MOCK.pm25Upper,
                    fill: '+1',
                    backgroundColor: 'rgba(255, 71, 87, 0.06)',
                    borderColor: 'transparent',
                    pointRadius: 0,
                    tension: 0.4,
                },
                {
                    label: 'PM2.5 Forecast',
                    data: MOCK.pm25Forecast,
                    fill: false,
                    borderColor: '#ff4757',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#ff4757',
                    tension: 0.4,
                },
                {
                    label: 'Lower Bound',
                    data: MOCK.pm25Lower,
                    fill: false,
                    borderColor: 'transparent',
                    pointRadius: 0,
                    tension: 0.4,
                },
                {
                    label: 'AQI',
                    data: MOCK.aqiForecast,
                    fill: false,
                    borderColor: '#4a7dff',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#8892a4',
                        font: { size: 10, family: 'Inter' },
                        boxWidth: 12,
                        padding: 12,
                        filter: item => item.text !== 'Upper Bound' && item.text !== 'Lower Bound',
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(12, 18, 32, 0.95)',
                    titleColor: '#f0f2f5',
                    bodyColor: '#8892a4',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 10,
                    titleFont: { family: 'Inter', weight: '600' },
                    bodyFont: { family: 'JetBrains Mono', size: 11 },
                },
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: { color: '#4a5266', font: { size: 10, family: 'Inter' }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: { color: '#4a5266', font: { size: 10, family: 'JetBrains Mono' } },
                },
            },
        },
    });
}

// ── Fire Classification Pie ───────────────────────────────────
function initFireClassChart() {
    const ctx = document.getElementById('fire-class-chart').getContext('2d');
    const fs = MOCK.fireStats;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Agricultural', 'Non-Agricultural'],
            datasets: [{
                data: [fs.agricultural, fs.nonAgricultural],
                backgroundColor: ['rgba(255, 71, 87, 0.8)', 'rgba(255, 127, 80, 0.6)'],
                borderColor: ['rgba(255, 71, 87, 1)', 'rgba(255, 127, 80, 1)'],
                borderWidth: 2,
                hoverOffset: 6,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#8892a4',
                        font: { size: 10, family: 'Inter' },
                        padding: 12,
                        boxWidth: 10,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(12, 18, 32, 0.95)',
                    titleColor: '#f0f2f5',
                    bodyColor: '#8892a4',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                },
            },
        },
    });
}

// ── District Risk List ────────────────────────────────────────
function initDistrictRisks() {
    const container = document.getElementById('risk-list');
    container.innerHTML = '';

    MOCK.districtRisks.forEach((d, i) => {
        const color = getRiskColor(d.risk);
        const trendIcon = d.trend === 'up' ? '↑' : d.trend === 'down' ? '↓' : '→';
        const trendColor = d.trend === 'up' ? '#ff4757' : d.trend === 'down' ? '#26de81' : '#ffd32a';

        // Build sparkline SVG
        const sparkW = 60, sparkH = 24;
        const vals = d.sparkline;
        const max = Math.max(...vals);
        const min = Math.min(...vals);
        const range = max - min || 1;
        const points = vals.map((v, j) => {
            const x = (j / (vals.length - 1)) * sparkW;
            const y = sparkH - ((v - min) / range) * sparkH;
            return `${x},${y}`;
        }).join(' ');

        const item = document.createElement('div');
        item.className = 'risk-item';
        item.style.animationDelay = `${i * 0.05}s`;
        item.style.setProperty('--risk-color', color);
        item.innerHTML = `
      <style>.risk-item[style*="--risk-color: ${color}"]::before { background: ${color}; }</style>
      <div class="risk-score" style="color: ${color}">${d.risk}</div>
      <div class="risk-info">
        <div class="risk-district">${d.district}</div>
        <div class="risk-fires">${d.fires} active fires</div>
      </div>
      <div class="risk-sparkline">
        <svg viewBox="0 0 ${sparkW} ${sparkH}">
          <polyline points="${points}" style="stroke:${color}; fill:none; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;" />
        </svg>
      </div>
      <div class="risk-trend" style="color: ${trendColor}">${trendIcon}</div>
    `;
        container.appendChild(item);
    });
}

// ── Alerts ────────────────────────────────────────────────────
function initAlerts() {
    const container = document.getElementById('alerts-list');
    container.innerHTML = '';

    MOCK.alerts.forEach((a, i) => {
        const levelColors = {
            critical: '#ff4757', warning: '#ffa502', info: '#4a7dff', resolved: '#26de81'
        };
        const item = document.createElement('div');
        item.className = `alert-item alert-${a.level}`;
        item.style.animationDelay = `${i * 0.08}s`;
        item.innerHTML = `
      <div class="alert-header">
        <span class="alert-level" style="color:${levelColors[a.level]}">${a.level} · ${a.horizon}</span>
        <span class="alert-time">${a.time}</span>
      </div>
      <div class="alert-message">${a.message}</div>
      <div class="alert-district">${a.district}</div>
    `;
        container.appendChild(item);
    });
}

// ── SHAP Feature Importance ───────────────────────────────────
function initSHAP() {
    const container = document.getElementById('shap-bars');
    container.innerHTML = '';

    const maxImp = Math.max(...MOCK.featureImportance.map(f => f.importance));

    MOCK.featureImportance.forEach((f, i) => {
        const pct = (f.importance / maxImp) * 100;
        const row = document.createElement('div');
        row.className = 'shap-row';
        row.innerHTML = `
      <div class="shap-label" title="${f.feature}">${f.feature}</div>
      <div class="shap-bar-wrap">
        <div class="shap-bar" style="width: 0%; background: ${f.color};" data-target="${pct}"></div>
      </div>
      <div class="shap-val">${(f.importance * 100).toFixed(0)}%</div>
    `;
        container.appendChild(row);
    });

    // Animate bars
    requestAnimationFrame(() => {
        setTimeout(() => {
            container.querySelectorAll('.shap-bar').forEach(bar => {
                bar.style.width = bar.dataset.target + '%';
            });
        }, 300);
    });

    // Model confidence ring
    const conf = 87;
    const confRing = document.getElementById('conf-ring-value');
    if (confRing) {
        const c = 2 * Math.PI * 18;
        confRing.style.strokeDasharray = c;
        confRing.style.strokeDashoffset = c * (1 - conf / 100);
    }
    const confPct = document.getElementById('conf-pct');
    if (confPct) animateCount(confPct, conf, 1200, '%');
}

// ── Policy Simulation ─────────────────────────────────────────
function initPolicySlider() {
    const slider = document.getElementById('policy-slider');
    const pctVal = document.getElementById('policy-pct');
    const aqiDelta = document.getElementById('policy-aqi-delta');
    const aqiImprove = document.getElementById('policy-aqi-improve');
    const confText = document.getElementById('policy-conf-text');

    function updatePolicy() {
        const reduction = parseInt(slider.value);
        pctVal.textContent = reduction + '%';

        // Simulated AQI improvement (non-linear relationship)
        const baseAQI = MOCK.currentAQI.value;
        const factor = 0.4 + Math.random() * 0.1; // stochastic
        const delta = Math.round(baseAQI * (reduction / 100) * factor);
        const newAQI = Math.max(50, baseAQI - delta);
        const improvePct = Math.round((delta / baseAQI) * 100);

        aqiDelta.textContent = '-' + delta;
        aqiImprove.textContent = improvePct + '%';

        // Confidence decreases with higher reduction
        const conf = Math.max(55, 95 - reduction * 0.6);
        confText.textContent = `Monte Carlo confidence: ${Math.round(conf)}% (10,000 simulations)`;
    }

    slider.addEventListener('input', updatePolicy);
    updatePolicy();
}

// ── Live-update simulation ────────────────────────────────────
function startLiveUpdates() {

    // ── Animated wind particles on map ───────────────────────
    if (typeof map !== 'undefined' && map) {
        const particleLayer = L.layerGroup().addTo(map);
        const particles = [];

        MOCK.windTrajectories.forEach(traj => {
            for (let i = 0; i < 3; i++) {
                particles.push({
                    points: traj.points,
                    progress: Math.random(),
                    speed: 0.003 + Math.random() * 0.004,
                    color: traj.color,
                    marker: null,
                });
            }
        });

        function interpolate(points, t) {
            const totalSegments = points.length - 1;
            const segFloat = t * totalSegments;
            const segIdx = Math.min(Math.floor(segFloat), totalSegments - 1);
            const localT = segFloat - segIdx;
            const p1 = points[segIdx];
            const p2 = points[segIdx + 1];
            return [
                p1[0] + (p2[0] - p1[0]) * localT,
                p1[1] + (p2[1] - p1[1]) * localT,
            ];
        }

        function animateParticles() {
            particles.forEach(p => {
                p.progress += p.speed;
                if (p.progress > 1) p.progress = 0;

                const pos = interpolate(p.points, p.progress);
                const opacity = Math.sin(p.progress * Math.PI) * 0.8;
                const radius = 2 + Math.sin(p.progress * Math.PI) * 2;

                if (p.marker) {
                    p.marker.setLatLng(pos);
                    p.marker.setStyle({ fillOpacity: opacity, radius });
                } else {
                    p.marker = L.circleMarker(pos, {
                        radius,
                        fillColor: p.color,
                        fillOpacity: opacity,
                        color: p.color,
                        weight: 0,
                        className: 'wind-particle',
                    }).addTo(particleLayer);
                }
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }
}

// ── NDVI Before/After Panel ───────────────────────────────────
function initNDVI() {
    const select = document.getElementById('ndvi-district');
    const preImg = document.getElementById('ndvi-pre-img');
    const postImg = document.getElementById('ndvi-post-img');
    const preVal = document.getElementById('ndvi-pre-val');
    const postVal = document.getElementById('ndvi-post-val');
    const deltaVal = document.getElementById('ndvi-delta-val');
    const burnPct = document.getElementById('ndvi-burn-pct');
    const acresVal = document.getElementById('ndvi-acres');
    const dateVal = document.getElementById('ndvi-date');
    const slider = document.getElementById('ndvi-compare-slider');
    const postOverlay = document.getElementById('ndvi-post-overlay');

    if (!select) return;

    // Populate dropdown
    MOCK.ndviData.forEach((d, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = d.district;
        select.appendChild(opt);
    });

    function updateNDVI(idx) {
        const d = MOCK.ndviData[idx];
        if (!d) return;

        preVal.textContent = d.preNDVI.toFixed(2);
        postVal.textContent = d.postNDVI.toFixed(2);
        deltaVal.textContent = d.delta.toFixed(2);
        burnPct.textContent = d.burnPct + '%';
        acresVal.textContent = d.acresBurned.toLocaleString() + ' acres';
        dateVal.textContent = d.date;

        // Animate delta color
        const severity = Math.abs(d.delta);
        deltaVal.style.color = severity > 0.5 ? '#ff4757' : severity > 0.35 ? '#ff7f50' : '#ffd32a';
    }

    select.addEventListener('change', () => updateNDVI(parseInt(select.value)));
    updateNDVI(0);

    // Before/After comparison slider
    if (slider && postOverlay) {
        slider.addEventListener('input', () => {
            const pct = slider.value;
            postOverlay.style.clipPath = `inset(0 0 0 ${pct}%)`;
        });
    }
}

// ── PDF Export ────────────────────────────────────────────────
function initPDFExport() {
    const btn = document.getElementById('btn-export-pdf');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.innerHTML = 'Generating...';

        try {
            // Use html2canvas to capture the dashboard
            const dashboard = document.querySelector('.dashboard');
            const canvas = await html2canvas(dashboard, {
                backgroundColor: '#060a14',
                scale: 1.5,
                useCORS: true,
                logging: false,
                windowWidth: 1440,
                windowHeight: 900,
            });

            // Generate a full HTML report
            const imgData = canvas.toDataURL('image/png', 0.9);
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

            // Build report HTML
            const reportHTML = `
<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>AGNI-SHIELD — District Report (${dateStr})</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; background: #0a0e1a; color: #f0f2f5; padding: 40px; }
  h1 { font-size: 1.5rem; margin-bottom: 4px; }
  h1 span { color: #ff4757; }
  .meta { color: #8892a4; font-size: 0.9rem; margin-bottom: 24px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px; text-align: center; }
  .stat-box .val { font-size: 1.8rem; font-weight: 800; }
  .stat-box .lab { font-size: 0.7rem; color: #8892a4; text-transform: uppercase; margin-top: 4px; }
  .snapshot { margin-top: 24px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
  .snapshot img { width: 100%; display: block; }
  .footer { margin-top: 32px; font-size: 0.75rem; color: #4a5266; text-align: center; }
  .districts { margin-top: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
  th { color: #8892a4; font-weight: 600; text-transform: uppercase; font-size: 0.7rem; }
  .risk-high { color: #ff4757; font-weight: 700; }
  .risk-med { color: #ff7f50; font-weight: 700; }
  .risk-low { color: #ffd32a; font-weight: 700; }
</style>
</head><body>
<h1><span>AGNI</span>-SHIELD — District Report</h1>
<div class="meta">Punjab → Haryana → Delhi Transboundary Airshed · Generated ${dateStr} at ${timeStr}</div>

<div class="stats-grid">
  <div class="stat-box"><div class="val" style="color:#ff4757">${MOCK.fireStats.totalActive}</div><div class="lab">Active Fires</div></div>
  <div class="stat-box"><div class="val" style="color:#ff7f50">${MOCK.currentAQI.value}</div><div class="lab">Delhi AQI</div></div>
  <div class="stat-box"><div class="val" style="color:#ffd32a">${MOCK.windData.speed} km/h</div><div class="lab">Wind Speed (${MOCK.windData.directionLabel})</div></div>
  <div class="stat-box"><div class="val" style="color:#4a7dff">${MOCK.fireStats.clustersDetected}</div><div class="lab">Fire Clusters</div></div>
</div>

<div class="districts">
<h3>District Risk Index</h3>
<table>
  <tr><th>District</th><th>Risk</th><th>Active Fires</th><th>Trend</th></tr>
  ${MOCK.districtRisks.map(d => {
                const cls = d.risk >= 80 ? 'risk-high' : d.risk >= 60 ? 'risk-med' : 'risk-low';
                return `<tr><td>${d.district}</td><td class="${cls}">${d.risk}</td><td>${d.fires}</td><td>${d.trend === 'up' ? '↑ Rising' : d.trend === 'down' ? '↓ Falling' : '→ Stable'}</td></tr>`;
            }).join('')}
</table>
</div>

<div class="snapshot">
  <img src="${imgData}" alt="Dashboard snapshot">
</div>

<div class="footer">AGNI-SHIELD · Auto-generated report · Data sources: NASA FIRMS, CPCB, Open-Meteo</div>
</body></html>`;

            // Open in new window for print/save
            const win = window.open('', '_blank');
            win.document.write(reportHTML);
            win.document.close();

            // Auto-trigger print dialog so user can save as PDF
            setTimeout(() => win.print(), 800);

        } catch (err) {
            console.error('PDF export error:', err);
            alert('Export failed. Make sure popups are not blocked.');
        }

        btn.disabled = false;
        btn.innerHTML = 'Export Report';
    });
}
