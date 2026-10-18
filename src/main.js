import Chart from 'chart.js/auto';

/* ===================================================================
   EcoSync - Client-side Application Controller
   Predictive Digital Twin for Zero-Emission Factories
   =================================================================== */

// Global State
const state = {
  activePage: 'overview',
  isLoggedIn: false,
  charts: {},
  telemetry: {
    co2: 420,
    temp: 36.2,
    humidity: 60.5,
    power: 15.0,
    carbon: 12.3,
    budget: 50.0,
    remaining: 37.7,
  },
  machines: [
    { id: 1, name: 'Machine 1', type: 'CNC Lathe', temp: 42, load: 72, vibr: 'Normal', status: 'online' },
    { id: 2, name: 'Machine 2', type: 'Hydraulic Press', temp: 78, load: 94, vibr: 'High', status: 'warning' },
    { id: 3, name: 'Machine 3', type: 'Injection Molder', temp: 89, load: 98, vibr: 'Critical', status: 'danger' },
    { id: 4, name: 'Machine 4', type: 'Assembly Robot', temp: 38, load: 55, vibr: 'Normal', status: 'online' },
    { id: 5, name: 'Machine 5', type: 'Welding Unit', temp: 0, load: 0, vibr: 'Off', status: 'offline' },
  ],
  predictions: [
    {
      id: 'pred-1',
      title: 'Machine-3 Overheating Threat',
      desc: 'Projected to reach 95°C in next 5 minutes at current thermal velocity (+2.4°C/min).',
      prob: 94,
      severity: 'danger',
      tag: 'Critical'
    },
    {
      id: 'pred-2',
      title: 'Carbon Limit Exceed Chance',
      desc: 'Factory carbon output trend indicates 92% likelihood of breaching 50 kg threshold in 30 mins.',
      prob: 92,
      severity: 'danger',
      tag: 'High'
    },
    {
      id: 'pred-3',
      title: 'Machine-2 Failure Probability',
      desc: 'Hydraulic pressure oscillation suggests valve fatigue; 87% chance of emergency trip.',
      prob: 87,
      severity: 'warning',
      tag: 'High'
    },
    {
      id: 'pred-4',
      title: 'Expected Energy Consumption Spike',
      desc: 'Simultaneous surge on Machine 2 & 3 will draw +18% power above peak safety tariff.',
      prob: 78,
      severity: 'warning',
      tag: 'Medium'
    }
  ],
  recommendations: [
    {
      id: 'rec-1',
      title: 'Reduce Machine-3 Load by 25%',
      desc: 'Throttles thermal dissipation from 89°C down to 68°C within 4.5 minutes.',
      impact: '⚡ Saves ~3.8 kWh power & stops thermal runaway',
      checked: true,
      executed: false
    },
    {
      id: 'rec-2',
      title: 'Activate Secondary Chiller Unit B',
      desc: 'Forces rapid coolant circulation through hydraulic oil reservoirs.',
      impact: '❄ Cools Machine 2 & 3 manifolds by 14°C',
      checked: true,
      executed: false
    },
    {
      id: 'rec-3',
      title: 'Shift Batch #409 to Assembly Robot 4',
      desc: 'Rebalances factory floor load away from strained Hydraulic Press 2.',
      impact: '🌍 Prevents 8.4 kg CO₂ emission spike',
      checked: true,
      executed: false
    },
    {
      id: 'rec-4',
      title: 'Enable Dynamic Eco-Pulse Inverter Mode',
      desc: 'Harmonizes motor voltage cycles to eliminate reactive power wastage.',
      impact: '⚡ Cuts idle energy draw by 12%',
      checked: false,
      executed: false
    }
  ],
  alerts: [
    { id: 1, type: 'critical', title: 'Machine-3 Critical Temperature Spike', msg: 'Core temperature reached 89°C. Predictive failure in 5 mins.', time: '2 mins ago' },
    { id: 2, type: 'critical', title: 'High Carbon Emission Alert', msg: 'Factory emission rate exceeding baseline by 28%. Projected limit breach.', time: '5 mins ago' },
    { id: 3, type: 'warning', title: 'Machine-2 Abnormal Vibration', msg: 'Frequency harmonics detected at 142 Hz. Bearing load warning.', time: '12 mins ago' },
    { id: 4, type: 'info', title: 'Digital Twin Synchronized', msg: 'All 5 machine telemetries synced with ESP32 gateway.', time: '18 mins ago' },
  ],
  history: {
    labels: ['18:30', '18:35', '18:40', '18:45', '18:50', '18:55', '19:00', '19:05', '19:10'],
    co2: [390, 400, 405, 412, 418, 422, 420, 425, 420],
    temp: [32, 33, 33.5, 34.2, 35.0, 35.8, 36.0, 36.5, 36.2],
    power: [12.4, 13.1, 13.5, 14.0, 14.6, 14.8, 15.2, 15.5, 15.0]
  },
  reports: [],
  manpower: {
    activeTechnicians: 12,
    auxiliaryDeployed: 0,
    throughputEfficiency: 100, // percentage
    revenueTargetPerShift: 24000, // $
    projectedLoss: 0,
    modalShown: false
  }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initNavigation();
  initCharts();
  renderPredictions();
  renderRecommendations();
  renderAlerts();
  initActions();
  initManpowerModal();
  initChatBot();
  startTelemetrySimulation();
  updateDate();
});

// ==================== DATE HELPER ====================
function updateDate() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// ==================== LOGIN FLOW ====================
function initLogin() {
  const loginForm = document.getElementById('login-form');
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginScreen.classList.remove('active');
      dashboardScreen.classList.add('active');
      state.isLoggedIn = true;
      showToast('Welcome to EcoSync Digital Twin System', 'success');
      setTimeout(() => {
        resizeAllCharts();
      }, 150);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      dashboardScreen.classList.remove('active');
      loginScreen.classList.add('active');
      state.isLoggedIn = false;
      showToast('Logged out successfully', 'info');
    });
  }
}

// ==================== NAVIGATION ====================
function navigateToPage(targetPage) {
  if (!targetPage) return;
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const pages = document.querySelectorAll('.page');
  const pageTitle = document.getElementById('page-title');
  const sidebar = document.getElementById('sidebar');

  navItems.forEach(n => {
    if (n.dataset.page === targetPage) {
      n.classList.add('active');
    } else {
      n.classList.remove('active');
    }
  });

  pages.forEach(p => p.classList.remove('active'));
  const activeEl = document.getElementById(`page-${targetPage}`);
  if (activeEl) {
    activeEl.classList.add('active');
  }

  state.activePage = targetPage;
  const titleMap = {
    'overview': 'Factory Overview',
    'digital-twin': 'Digital Twin Model',
    'predictions': 'Predictive AI Engine',
    'analytics': 'Factory Analytics',
    'alerts': 'Alert Center',
    'reports': 'Factory Reports & Compliance'
  };
  if (pageTitle) pageTitle.textContent = titleMap[targetPage] || 'Dashboard';

  if (window.innerWidth <= 768 && sidebar) {
    sidebar.classList.remove('open');
  }

  setTimeout(() => resizeAllCharts(), 100);
}

function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = item.dataset.page;
      navigateToPage(targetPage);
    });
  });

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// ==================== CHARTS INITIALIZATION ====================
function initCharts() {
  initTrendsChart();
  initPowerChart();
  initCarbonGauge();
  initPredictionAccuracyChart();
  initCarbonHistoryChart();
  initEnergyBreakdownChart();
}

function initTrendsChart() {
  const ctx = document.getElementById('trends-chart');
  if (!ctx) return;

  state.charts.trends = new Chart(ctx, {
    type: 'line',
    data: {
      labels: state.history.labels,
      datasets: [
        {
          label: 'CO₂ (ppm)',
          data: state.history.co2,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: 'Temp (°C)',
          data: state.history.temp,
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          borderWidth: 2,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#06b6d4', font: { size: 10 } }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#f59e0b', font: { size: 10 } }
        }
      }
    }
  });
}

function initPowerChart() {
  const ctx = document.getElementById('power-chart');
  if (!ctx) return;

  state.charts.power = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: state.history.labels,
      datasets: [{
        label: 'Power Draw (kWh)',
        data: state.history.power,
        backgroundColor: 'rgba(0, 212, 170, 0.65)',
        borderRadius: 4,
        borderColor: '#00d4aa',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 11 } } }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { size: 10 } }
        }
      }
    }
  });
}

function initCarbonGauge() {
  const ctx = document.getElementById('carbon-gauge');
  if (!ctx) return;

  const used = state.telemetry.carbon;
  const rem = Math.max(0, state.telemetry.budget - used);

  state.charts.gauge = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Emitted', 'Remaining'],
      datasets: [{
        data: [used, rem],
        backgroundColor: ['#00d4aa', 'rgba(255, 255, 255, 0.05)'],
        borderColor: ['transparent', 'transparent'],
        cutout: '78%',
        circumference: 240,
        rotation: 240
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}

function initPredictionAccuracyChart() {
  const ctx = document.getElementById('prediction-accuracy-chart');
  if (!ctx) return;

  state.charts.accuracy = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
      datasets: [{
        label: 'AI Model Accuracy (%)',
        data: [84, 88, 86, 91, 94, 93, 96],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: '#8b5cf6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
        y: { min: 70, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      }
    }
  });
}

function initCarbonHistoryChart() {
  const ctx = document.getElementById('carbon-history-chart');
  if (!ctx) return;

  state.charts.carbonHistory = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Baseline (Old System)',
          data: [68, 72, 75, 70, 74, 62, 58],
          borderColor: '#ef4444',
          borderDash: [5, 5],
          tension: 0.3,
          borderWidth: 2
        },
        {
          label: 'With EcoSync Digital Twin',
          data: [42, 38, 35, 34, 32, 28, 26],
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0, 212, 170, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      }
    }
  });
}

function initEnergyBreakdownChart() {
  const ctx = document.getElementById('energy-breakdown-chart');
  if (!ctx) return;

  state.charts.energyBreakdown = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Machine 1 (CNC)', 'Machine 2 (Press)', 'Machine 3 (Molder)', 'Machine 4 (Robot)', 'Auxiliary'],
      datasets: [{
        data: [22, 35, 30, 8, 5],
        backgroundColor: ['#06b6d4', '#f59e0b', '#ef4444', '#00d4aa', '#8b5cf6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 } } }
      }
    }
  });
}

function resizeAllCharts() {
  Object.values(state.charts).forEach(c => {
    if (c && typeof c.resize === 'function') c.resize();
  });
}

// ==================== RENDER PREDICTIONS ====================
function renderPredictions() {
  const overviewList = document.getElementById('predictions-list');
  const fullList = document.getElementById('predictions-dashboard');

  if (overviewList) {
    overviewList.innerHTML = state.predictions.map(p => `
      <div class="prediction-item ${p.severity}-border">
        <div class="pred-left">
          <div class="pred-icon">${p.severity === 'danger' ? '⚠️' : '⚡'}</div>
          <div>
            <div class="pred-title">${p.title}</div>
            <div class="pred-desc">${p.desc}</div>
          </div>
        </div>
        <div class="pred-prob">
          <span class="prob-val ${p.severity}">${p.prob}%</span>
          <span class="prob-label">Probability</span>
        </div>
      </div>
    `).join('');
  }

  if (fullList) {
    fullList.innerHTML = state.predictions.map(p => `
      <div class="pred-card-detailed">
        <div class="pred-card-header">
          <span class="pred-card-tag ${p.severity === 'danger' ? 'high' : 'medium'}">${p.tag} Risk</span>
          <span class="prob-val ${p.severity}">${p.prob}% Chance</span>
        </div>
        <h4>${p.title}</h4>
        <p class="pred-desc">${p.desc}</p>
        <div class="pred-progress-bar">
          <div class="pred-progress-fill" style="width: ${p.prob}%; background: ${p.severity === 'danger' ? 'var(--accent-danger)' : 'var(--accent-amber)'}"></div>
        </div>
      </div>
    `).join('');
  }
}

// ==================== SITUATION-AWARE INTELLIGENCE ENGINE ====================
function computeSituationalRecommendations() {
  const m3 = state.machines.find(m => m.id === 3) || {};
  const m2 = state.machines.find(m => m.id === 2) || {};
  const t = state.telemetry;
  const manpower = state.manpower || { auxiliaryDeployed: 0 };

  const isMitigated = (m3.temp <= 70 && m3.status === 'online' && m3.load <= 76);
  const isOverheat = (!isMitigated) && (m3.temp > 72 || t.temp > 50);
  const isCarbonSpike = (t.carbon > 22.0 || t.co2 > 520 || t.power > 20.0);
  const isM2Strain = (m2.vibr === 'High' || m2.vibr === 'Critical' || m2.load >= 88);
  const isThrottledDeficit = isMitigated && (manpower.auxiliaryDeployed === 0);
  const isNominal = !isOverheat && !isCarbonSpike && !isM2Strain;

  const recs = [];

  // Situation 1: Critical Overheat
  if (isOverheat) {
    recs.push({
      id: 'rec-throttle-m3',
      title: `Throttle Machine-3 Speed by 25% (Target: 68°C)`,
      desc: `Reduces mechanical friction and arrests stator coil thermal escalation currently at ${m3.temp}°C.`,
      impact: '⚡ Halts thermal trip & saves 3.8 kWh',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-chiller-b',
      title: 'Engage Secondary Glycol Chiller Unit B (Loop 3)',
      desc: 'Forces active 8°C heat exchange fluid through hydraulic manifolds to purge core heat.',
      impact: '❄ Drops operating temp by ~14°C within 5 mins',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-manpower-overheat',
      title: 'Deploy Auxiliary Floor Technicians (+4 on Line 4)',
      desc: 'Offsets the -18.4% throughput loss from Machine-3 throttling to safeguard shift revenue ($24,000 target).',
      impact: '👥 Restores line throughput to 100%',
      checked: true,
      executed: false
    });
  } else if (isMitigated) {
    recs.push({
      id: 'rec-throttle-m3',
      title: 'Machine-3 Safety Throttle Active (Load: 72%)',
      desc: 'Operating load held at -25% to sustain thermal safety margin at 68°C.',
      impact: '✔ Thermal trip averted & coil preserved',
      checked: true,
      executed: true
    });
  }

  // Situation 2: Carbon Surge / High Power Draw
  if (isCarbonSpike) {
    recs.push({
      id: 'rec-scrubber',
      title: 'Engage Flue Gas Scrubber & Activated Carbon Adsorber',
      desc: 'Diverts stack exhaust through catalytic calcium hydroxide filtration bed.',
      impact: '🌍 Lowers direct stack CO₂ output by 35%',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-bess-peak',
      title: 'Activate Clean Battery Storage (BESS) Peak-Shaving',
      desc: `Supplies ${Math.min(9.5, +(t.power * 0.35).toFixed(1))} kWh from clean stored solar reserves to bypass grid peak tariffs.`,
      impact: '⚡ Averts $420 peak-demand utility surcharge',
      checked: true,
      executed: false
    });
  }

  // Situation 3: Machine 2 Mechanical / Hydraulic Strain
  if (isM2Strain) {
    recs.push({
      id: 'rec-hydraulic-damp',
      title: 'Relieve Hydraulic Pressure to 80% & Close Bypass Valve',
      desc: 'Dampens 142 Hz resonant harmonic oscillation and relieves valve manifold stress.',
      impact: '🛡 Prevents catastrophic $18,000 pump rupture',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-balance-m2',
      title: 'Shift Batch #409 Workload to Assembly Robot 4',
      desc: 'Diverts heavy stamping queue to balanced robotic cell to unload Hydraulic Press 2.',
      impact: '⚖ Balances line load & reduces cycle strain by 32%',
      checked: true,
      executed: false
    });
  }

  // Situation 4: Capacity Deficit & Revenue Protection
  if (isThrottledDeficit) {
    recs.push({
      id: 'rec-manpower-quota',
      title: 'Authorize Floor Technicians (+4) for Manual Line Finishing',
      desc: 'Compensates for the 18.4% capacity deficit caused by Machine-3 thermal protection.',
      impact: '💰 Fully preserves $24,000 daily shift revenue quota',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-sync-conveyor',
      title: 'Re-index Buffer Conveyor Feed Velocity by -15%',
      desc: 'Synchronizes parts arrival rate with throttled injection molding cycle.',
      impact: '📦 Eliminates conveyor parts jamming & 0% scrap rate',
      checked: true,
      executed: false
    });
  }

  // Situation 5: Nominal Clean Operations
  if (isNominal && !isThrottledDeficit) {
    recs.push({
      id: 'rec-sensor-calib',
      title: 'Initiate Zero-Drift Calibration on Wireless ESP32 Cluster',
      desc: 'Auto-calibrates MQ-135 electrochemical sensor and DHT22 digital thermal probe.',
      impact: '🎯 Calibrates sensor drift to ±0.2°C accuracy',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-esg-credit',
      title: 'Bank Clean Energy Surplus (4.2 kg CO₂) to Corporate ESG Ledger',
      desc: 'Audit logs verified 4.2 kg CO₂ emission surplus under statutory compliance cap.',
      impact: '🌿 Validates AAA Corporate ESG Sustainability Rating',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-robot-traj',
      title: 'Enable High-Velocity Trajectory on Assembly Robot 4',
      desc: 'Thermal headroom allows +3.5% faster pick-and-place indexing without thermal penalty.',
      impact: '🚀 Yields +28 units/hour throughput boost',
      checked: false,
      executed: false
    });
  }

  return recs;
}

function updateSituationalIntelligence() {
  const newRecs = computeSituationalRecommendations();
  const prevMap = new Map(state.recommendations.map(r => [r.id, r]));
  state.recommendations = newRecs.map(r => {
    const prev = prevMap.get(r.id);
    if (prev) {
      return {
        ...r,
        checked: prev.executed ? true : prev.checked,
        executed: prev.executed
      };
    }
    return r;
  });
  renderRecommendations();
}

// ==================== LIVE DYNAMIC INTIMATIONS ENGINE ====================
let lastIntimationState = '';
function updateLiveIntimations() {
  const m3 = state.machines.find(m => m.id === 3) || {};
  const m2 = state.machines.find(m => m.id === 2) || {};
  const t = state.telemetry;
  const isMitigated = (m3.temp <= 70 && m3.status === 'online' && m3.load <= 76);
  const now = 'Just now';

  let currentKey = '';
  if (!isMitigated && m3.temp > 75) {
    currentKey = `overheat-${Math.floor(m3.temp / 5)}`;
  } else if (t.co2 > 520 || t.carbon > 22) {
    currentKey = `carbon-${Math.floor(t.co2 / 50)}`;
  } else if (m2.vibr === 'High') {
    currentKey = 'vibr-high';
  } else if (isMitigated && state.manpower?.auxiliaryDeployed > 0) {
    currentKey = 'manpower-active';
  } else if (isMitigated) {
    currentKey = 'mitigated-pending';
  } else {
    currentKey = 'nominal';
  }

  if (currentKey !== lastIntimationState) {
    lastIntimationState = currentKey;

    if (!isMitigated && m3.temp > 75) {
      state.alerts.unshift({
        id: Date.now(),
        type: 'critical',
        title: `Machine-3 Thermal Surge Intimation (${m3.temp}°C)`,
        msg: `Thermal gradient is critical (+2.4°C/min). Spindle heat dissipation exceeds safety envelope. AI throttle recommended immediately.`,
        time: now
      });
    } else if (t.co2 > 520 || t.carbon > 22) {
      state.alerts.unshift({
        id: Date.now(),
        type: 'critical',
        title: `Carbon Threshold Intimation (${t.co2} ppm)`,
        msg: `Emissions climbing (${t.carbon} kg CO₂ / ${t.power} kWh). Approaching facility daily cap of ${t.budget} kg CO₂.`,
        time: now
      });
    } else if (m2.vibr === 'High') {
      state.alerts.unshift({
        id: Date.now(),
        type: 'warning',
        title: 'Machine-2 Harmonic Cavitation Intimation',
        msg: 'Acoustic FFT registered 142 Hz hydraulic vibration spike. Valve fatigue and micro-cavitation risk.',
        time: now
      });
    } else if (isMitigated && state.manpower?.auxiliaryDeployed > 0) {
      state.alerts.unshift({
        id: Date.now(),
        type: 'info',
        title: 'Workforce Quota Intimation',
        msg: '+4 Technicians deployed on Line 4. Capacity deficit compensated and $24,000 revenue quota secured.',
        time: now
      });
    } else if (isMitigated) {
      state.alerts.unshift({
        id: Date.now(),
        type: 'warning',
        title: 'Production Deficit Intimation (-18.4%)',
        msg: 'Machine-3 throttled for thermal safety. Auxiliary manpower required to prevent -$3,850/shift revenue loss.',
        time: now
      });
    } else if (currentKey === 'nominal') {
      state.alerts.unshift({
        id: Date.now(),
        type: 'info',
        title: 'Zero-Emission Baseline Intimation',
        msg: 'All machinery digital twins operating within nominal acoustic, thermal, and ESG compliance thresholds.',
        time: now
      });
    }

    if (state.alerts.length > 8) {
      state.alerts = state.alerts.slice(0, 8);
    }
    renderAlerts();
  }
}

// ==================== RENDER RECOMMENDATIONS ====================
function renderRecommendations() {
  const container = document.getElementById('ai-recommendations');
  if (!container) return;

  container.innerHTML = state.recommendations.map(r => `
    <div class="rec-item ${r.executed ? 'executed' : ''}">
      <input type="checkbox" class="rec-checkbox" data-id="${r.id}" ${r.checked ? 'checked' : ''} ${r.executed ? 'disabled' : ''}/>
      <div class="rec-content">
        <div class="rec-title">${r.executed ? '✅ ' : ''}${r.title}</div>
        <div class="rec-desc">${r.desc}</div>
        <div class="rec-impact">${r.impact}</div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.rec-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const rec = state.recommendations.find(r => r.id === e.target.dataset.id);
      if (rec) rec.checked = e.target.checked;
    });
  });
}

// ==================== RENDER ALERTS ====================
function renderAlerts(filter = 'all') {
  const overviewList = document.getElementById('alerts-list');
  const fullList = document.getElementById('alerts-full-list');
  const badge = document.getElementById('alert-count-badge');
  const notifBadge = document.getElementById('notif-badge');
  const summary = document.getElementById('alert-summary');

  const filtered = filter === 'all' 
    ? state.alerts 
    : state.alerts.filter(a => a.type === filter);

  const html = filtered.map(a => `
    <div class="alert-item ${a.type}">
      <div class="alert-left">
        <div class="alert-badge-icon">${a.type === 'critical' ? '🔴' : a.type === 'warning' ? '⚠️' : 'ℹ️'}</div>
        <div>
          <div class="alert-title">${a.title}</div>
          <div class="alert-msg">${a.msg}</div>
        </div>
      </div>
      <div class="alert-right">
        <span class="alert-time">${a.time}</span>
        <button class="alert-resolve-btn" data-id="${a.id}">Resolve</button>
      </div>
    </div>
  `).join('');

  if (overviewList) overviewList.innerHTML = html;
  if (fullList) fullList.innerHTML = html;

  const count = state.alerts.filter(a => a.type === 'critical' || a.type === 'warning').length;
  if (badge) badge.textContent = count;
  if (notifBadge) notifBadge.textContent = state.alerts.length;
  if (summary) summary.textContent = `${count} Active`;

  // Attach resolve handlers
  document.querySelectorAll('.alert-resolve-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id, 10);
      state.alerts = state.alerts.filter(a => a.id !== id);
      renderAlerts(filter);
      showToast('Alert resolved and logged', 'success');
    });
  });
}

// ==================== INTERACTIVE ACTIONS ====================
function executeApproveAllRecommendations() {
  showLoading(true);
  return new Promise((resolve) => {
    setTimeout(() => {
      showLoading(false);
      
      const executedIds = [];
      state.recommendations.forEach(r => {
        if (r.checked) {
          r.executed = true;
          executedIds.push(r.id);
        }
      });
      renderRecommendations();

      const m3 = state.machines.find(m => m.id === 3);
      const m2 = state.machines.find(m => m.id === 2);

      let toastMsg = 'AI Optimizations Executed!';
      let needsManpowerPrompt = false;

      // 1. Thermal throttle & cooling
      if (executedIds.some(id => id.includes('throttle') || id.includes('chiller') || id.includes('cool'))) {
        if (m3) {
          m3.temp = 68;
          m3.load = 74;
          m3.vibr = 'Normal';
          m3.status = 'online';
        }
        toastMsg = 'Machine-3 throttled & cooled to 68°C.';
        if (!state.manpower.auxiliaryDeployed) {
          needsManpowerPrompt = true;
        }
      }

      // 2. Carbon scrubber & BESS peak-shaving
      if (executedIds.some(id => id.includes('scrubber') || id.includes('bess') || id.includes('peak'))) {
        state.telemetry.power = Math.max(11.5, +(state.telemetry.power * 0.72).toFixed(1));
        state.telemetry.co2 = Math.min(395, state.telemetry.co2 - 45);
        state.telemetry.carbon = +(state.telemetry.power * 0.82).toFixed(1);
        state.telemetry.remaining = +(state.telemetry.budget - state.telemetry.carbon).toFixed(1);
        toastMsg = 'Flue gas scrubber active & clean battery peak-shaving engaged.';
      }

      // 3. Hydraulic vibration relief
      if (executedIds.some(id => id.includes('hydraulic') || id.includes('balance') || id.includes('batch'))) {
        if (m2) {
          m2.load = 78;
          m2.vibr = 'Normal';
          m2.status = 'online';
        }
        const m4 = state.machines.find(m => m.id === 4);
        if (m4) {
          m4.load = 68;
        }
      }

      // 4. Manpower quota recommendation
      if (executedIds.some(id => id.includes('manpower'))) {
        deployAuxiliaryManpower();
        needsManpowerPrompt = false;
      }

      updateDigitalTwinDisplay();
      updateTelemetryDisplay();

      // Refresh situational recommendations for next operational stage
      updateSituationalIntelligence();
      updateLiveIntimations();

      showToast(toastMsg, 'success');
      resolve();

      if (needsManpowerPrompt) {
        setTimeout(() => {
          showManpowerLossModal({
            deficit: '-18.4%',
            revenueLoss: '-$3,850',
            avertedDamage: '+$45,000'
          });
        }, 850);
      }
    }, 700);
  });
}

// ==================== MANPOWER & REVENUE POPUP CONTROLLER ====================
function showManpowerLossModal(data = {}) {
  const modal = document.getElementById('manpower-modal');
  if (!modal) return;
  const throughputEl = document.getElementById('impact-throughput');
  const revenueEl = document.getElementById('impact-revenue');
  if (throughputEl && data.deficit) throughputEl.textContent = data.deficit;
  if (revenueEl && data.revenueLoss) revenueEl.textContent = data.revenueLoss;

  modal.style.display = 'flex';
  state.manpower.modalShown = true;
  state.manpower.projectedLoss = 3850;
  state.manpower.throughputEfficiency = 81.6;
}

function hideManpowerLossModal() {
  const modal = document.getElementById('manpower-modal');
  if (modal) modal.style.display = 'none';
}

function deployAuxiliaryManpower() {
  hideManpowerLossModal();
  state.manpower.auxiliaryDeployed = 4;
  state.manpower.throughputEfficiency = 100;
  state.manpower.projectedLoss = 0;

  // Add notification/alert in state
  state.alerts.unshift({
    id: Date.now(),
    type: 'info',
    title: 'Auxiliary Manpower Deployed',
    msg: '+4 Technicians assigned to Line 4 to compensate for Machine-3 throttling. Revenue targets maintained at 100%.',
    time: 'Just now'
  });
  renderAlerts();

  showToast('⚡ Manpower Increased (+4 Technicians)! Production deficit offset and revenue quota secured.', 'success');
}

function initManpowerModal() {
  const modal = document.getElementById('manpower-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const dismissBtn = document.getElementById('dismiss-modal-btn');
  const deployBtn = document.getElementById('deploy-manpower-btn');

  if (closeBtn) closeBtn.addEventListener('click', hideManpowerLossModal);
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      hideManpowerLossModal();
      showToast('Revenue deficit noted. Manpower adjustment postponed.', 'info');
    });
  }
  if (deployBtn) {
    deployBtn.addEventListener('click', () => {
      deployAuxiliaryManpower();
    });
  }

  // Click on backdrop to close
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideManpowerLossModal();
    });
  }
}

function initActions() {
  // Approve all AI recommendations
  const approveBtn = document.getElementById('approve-all-btn');
  if (approveBtn) {
    approveBtn.addEventListener('click', () => {
      executeApproveAllRecommendations();
    });
  }

  // Dismiss button
  const dismissBtn = document.getElementById('dismiss-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      showToast('Recommendations postponed for review', 'info');
    });
  }

  // Refresh AI button
  const refreshAiBtn = document.getElementById('refresh-ai');
  if (refreshAiBtn) {
    refreshAiBtn.addEventListener('click', () => {
      showToast('AI Agent recalibrating digital twin...', 'info');
      fetchLiveData();
    });
  }

  // Alert filter buttons
  document.querySelectorAll('.alert-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.alert-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAlerts(btn.dataset.filter);
    });
  });

  // Report generation buttons
  const dailyBtn = document.getElementById('generate-daily-report');
  const weeklyBtn = document.getElementById('generate-weekly-report');
  const emissionBtn = document.getElementById('generate-emission-report');
  const aiBtn = document.getElementById('generate-ai-report');

  if (dailyBtn) dailyBtn.addEventListener('click', () => generateReport('Daily Summary Report'));
  if (weeklyBtn) weeklyBtn.addEventListener('click', () => generateReport('Weekly Analytics Report'));
  if (emissionBtn) emissionBtn.addEventListener('click', () => generateReport('Emission Compliance ESG Report'));
  if (aiBtn) aiBtn.addEventListener('click', () => generateReport('AI Insights & Predictions Report'));
}

// ==================== DYNAMIC MULTI-CATEGORY REPORT GENERATION ====================
function getActiveSituationDiagnostic() {
  const m3 = state.machines.find(m => m.id === 3) || {};
  const m2 = state.machines.find(m => m.id === 2) || {};
  const t = state.telemetry;
  const isMitigated = (m3.temp <= 70 && m3.status === 'online' && m3.load <= 76);
  const manpower = state.manpower || { auxiliaryDeployed: 0 };

  if (!isMitigated && m3.temp > 72) {
    return {
      title: 'CRITICAL THERMAL RUNAWAY EMERGENCY (LINE 3)',
      statusText: 'CRITICAL RISK (+2.4°C/min thermal gradient)',
      description: `Injection Molder (Machine 3) core temp reached ${m3.temp}°C. Mechanical friction and stator coil overheating predict thermal shutdown in under 5 minutes unless load is throttled.`,
      actionRequired: 'Apply 25% load reduction and activate Secondary Glycol Chiller Unit B.',
      revenueImpact: 'High risk of $45,000 stator coil destruction if trip threshold (95°C) is exceeded.'
    };
  }
  if (t.carbon > 22.0 || t.co2 > 520 || t.power > 20.0) {
    return {
      title: 'CARBON LIMIT EXCEED SURGE & TARIFF PENALTY RISK',
      statusText: 'HIGH EMISSION RATE (Breach Forecast in 24 mins)',
      description: `Ambient CO₂ concentration climbed to ${t.co2} ppm. Total factory draw at ${t.power} kWh is driving carbon footprint to ${t.carbon} kg CO₂ against the ${t.budget} kg daily regulatory ceiling.`,
      actionRequired: 'Engage flue gas scrubbers and initiate Battery Energy Storage (BESS) clean peak-shaving.',
      revenueImpact: 'Imminent $420 peak-demand utility tariff penalty and potential ESG non-compliance surcharge.'
    };
  }
  if (m2.vibr === 'High' || m2.vibr === 'Critical' || m2.load >= 88) {
    return {
      title: 'HYDRAULIC VALVE FATIGUE & HARMONIC CAVITATION (LINE 2)',
      statusText: 'HIGH MECHANICAL STRAIN (142 Hz Harmonic Resonance)',
      description: `Hydraulic Press (Machine 2) is exhibiting severe harmonic flutter under ${m2.load}% mechanical load. Acoustic sensors indicate hydraulic oil micro-cavitation in valve manifolds.`,
      actionRequired: 'Relieve line pressure to 80% and shift Batch #409 buffer queue to Assembly Robot 4.',
      revenueImpact: 'Avoids catastrophic hydraulic pump valve head blowout ($18,000 replacement cost).'
    };
  }
  if (isMitigated && manpower.auxiliaryDeployed === 0) {
    return {
      title: 'LINE THROUGHPUT DEFICIT - MANPOWER BALANCING PENDING',
      statusText: 'CAPACITY DEFICIT ALERT (-18.4% Line 4 Throughput)',
      description: `Machine-3 was throttled to 68°C to prevent thermal meltdown. The resulting speed reduction creates an 18.4% capacity deficit, placing the $24,000 daily shift revenue target at risk.`,
      actionRequired: 'Authorize +4 auxiliary floor technicians on Line 4 to maintain target production volume.',
      revenueImpact: 'Projected revenue shortfall of -$3,850/shift unless auxiliary floor staffing is deployed.'
    };
  }
  if (isMitigated && manpower.auxiliaryDeployed > 0) {
    return {
      title: 'CLOSED-LOOP MITIGATED & REVENUE TARGET FULLY SECURED',
      statusText: 'STABILIZED (100% Throughput Protected via Manpower)',
      description: `Closed-loop thermal mitigation succeeded (spindle held at ${m3.temp}°C). +4 auxiliary technicians deployed on Line 4 have fully compensated for machine throttling.`,
      actionRequired: 'Continue automated digital twin monitoring and buffer queue load tracking.',
      revenueImpact: '100% of $24,000 daily revenue target secured with zero machine thermal trip penalties.'
    };
  }
  return {
    title: 'NOMINAL ZERO-BREACH SUSTAINABLE OPERATION',
    statusText: 'OPTIMAL (All 5 Machine Twins in Green Tolerance)',
    description: `All plant machinery operating smoothly within nominal baseline envelopes. Current carbon emission rate is ${t.carbon} kg CO₂ with ${t.remaining} kg CO₂ safe margin remaining.`,
    actionRequired: 'Maintain routine automated zero-drift sensor calibration and corporate ESG credit logging.',
    revenueImpact: 'Factory operating at maximum cost-efficiency with zero statutory fines.'
  };
}

function generateDetailedReportContent(category, reportId, dateStr) {
  const t = state.telemetry;
  const m1 = state.machines.find(m => m.id === 1) || {};
  const m2 = state.machines.find(m => m.id === 2) || {};
  const m3 = state.machines.find(m => m.id === 3) || {};
  const m4 = state.machines.find(m => m.id === 4) || {};
  const m5 = state.machines.find(m => m.id === 5) || {};
  const manpower = state.manpower || { auxiliaryDeployed: 0, activeTechnicians: 12 };
  const situation = getActiveSituationDiagnostic();
  const shaHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`.toUpperCase();

  const recommendationsAudit = state.recommendations.map(r => 
    `  • [${r.executed ? 'EXECUTED ✔' : (r.checked ? 'PENDING APPROVAL ⏳' : 'OPTIONAL STANDBY')}] ${r.title}\n    ${r.desc} | ${r.impact}`
  ).join('\n');

  const alertsAudit = state.alerts.slice(0, 5).map(a => 
    `  [${a.time}] ${a.type.toUpperCase()}: ${a.title} - ${a.msg}`
  ).join('\n');

  if (category === 'daily') {
    return `
================================================================================
             ECOSYNC - PREDICTIVE DIGITAL TWIN PLATFORM
             OFFICIAL DAILY OPERATIONAL & SHIFT AUDIT REPORT
================================================================================
Report Reference ID : ${reportId}
Verification Hash   : ${shaHash}
Generated At        : ${dateStr}
Facility Location   : EcoSync Smart Manufacturing Complex - Block 4
Shift Director      : JCT Admin (Factory Shift Director)
Operating Scenario  : ${situation.title}
System Diagnostic   : ${situation.statusText}

--------------------------------------------------------------------------------
1. SITUATIONAL EXECUTIVE DIAGNOSIS
--------------------------------------------------------------------------------
Scenario Details    : ${situation.description}
Prescribed Actions  : ${situation.actionRequired}
Economic Impact     : ${situation.revenueImpact}

--------------------------------------------------------------------------------
2. REAL-TIME INDUSTRIAL SENSOR TELEMETRY
--------------------------------------------------------------------------------
- Ambient CO₂ Concentration     : ${t.co2} ppm (Regulatory Safety Baseline: < 500 ppm)
- Factory Ambient Temperature   : ${t.temp} °C (Thermal Trip Ceiling: 60.0 °C)
- Ambient Relative Humidity     : ${t.humidity} % (Optimal Operating Range: 40% - 70%)
- Total Instantaneous Power     : ${t.power} kWh (Allocated Facility Tariff Cap: 25.0 kWh)
- Cumulative Carbon Output      : ${t.carbon} kg CO₂ (Calculated via 0.82 Grid Emission Factor)
- Daily Carbon Budget Ceiling   : ${t.budget} kg CO₂ (Remaining Today: ${t.remaining} kg CO₂)
- Budget Consumption Rate       : ${((t.carbon / t.budget) * 100).toFixed(1)} % utilized

--------------------------------------------------------------------------------
3. LIVE MACHINERY FLEET STATUS & VIBRATION MATRIX
--------------------------------------------------------------------------------
[Line 1] Machine 1 (CNC Lathe)
  - Core Temp: ${m1.temp}°C | Mechanical Load: ${m1.load}% | Vibration: ${m1.vibr} | Status: ${m1.status.toUpperCase()}
[Line 2] Machine 2 (Hydraulic Press)
  - Core Temp: ${m2.temp}°C | Mechanical Load: ${m2.load}% | Vibration: ${m2.vibr} | Status: ${m2.status.toUpperCase()}
[Line 3] Machine 3 (Injection Molder)
  - Core Temp: ${m3.temp}°C | Mechanical Load: ${m3.load}% | Vibration: ${m3.vibr} | Status: ${m3.status.toUpperCase()}
[Line 4] Machine 4 (Assembly Robot)
  - Core Temp: ${m4.temp}°C | Mechanical Load: ${m4.load}% | Vibration: ${m4.vibr} | Status: ${m4.status.toUpperCase()}
[Line 5] Machine 5 (Welding Unit)
  - Core Temp: ${m5.temp}°C | Mechanical Load: ${m5.load}% | Status: ${m5.status.toUpperCase()}

--------------------------------------------------------------------------------
4. WORKFORCE ALLOCATION & REVENUE TARGET PROTECTION
--------------------------------------------------------------------------------
- Base Certified Technicians     : ${manpower.activeTechnicians} Active Floor Personnel
- Auxiliary Technicians Deployed : +${manpower.auxiliaryDeployed} Assigned to Line 4 Finishing
- Line Throughput Efficiency     : ${manpower.auxiliaryDeployed > 0 ? '100% (Fully Compensated)' : (m3.temp <= 70 ? '81.6% (-18.4% Deficit)' : '100% (Nominal Speed)')}
- Daily Shift Revenue Quota       : $24,000 USD
- Revenue Impact Analysis        : ${manpower.auxiliaryDeployed > 0 ? 'PROTECTED (Zero revenue loss, quota secured)' : (m3.temp <= 70 ? 'DEFICIT RISK (-$3,850/shift until manpower authorized)' : 'NOMINAL ON-TRACK')}

--------------------------------------------------------------------------------
5. LIVE AI PRESCRIPTIVE RECOMMENDATIONS AUDIT
--------------------------------------------------------------------------------
${recommendationsAudit}

--------------------------------------------------------------------------------
6. RECENT OPERATIONAL INTIMATIONS LOG
--------------------------------------------------------------------------------
${alertsAudit || '  All operational parameters nominal.'}

================================================================================
Audit Status: VERIFIED & ELECTRONICALLY SIGNED BY ECOSYNC DIGITAL TWIN
================================================================================
`.trim();
  }

  if (category === 'weekly') {
    return `
================================================================================
             ECOSYNC - PREDICTIVE DIGITAL TWIN PLATFORM
             7-DAY OEE, RELIABILITY & EFFICIENCY ANALYTICS
================================================================================
Report Reference ID : ${reportId}
Verification Hash   : ${shaHash}
Reporting Interval  : Rolling 7-Day Performance Window
Generated At        : ${dateStr}
Compliance Standard : ISO 22400 Automation Systems & Manufacturing OEE
Current Plant State : ${situation.title}

--------------------------------------------------------------------------------
1. COMPOSITE OEE & PRODUCTIVITY BENCHMARKS
--------------------------------------------------------------------------------
- Overall Equipment Effectiveness (OEE) : ${(81.4 - (t.carbon > 20 ? 3.5 : 0)).toFixed(1)}% (Industry Benchmark: 75.0% | Variance: +${(6.4 - (t.carbon > 20 ? 3.5 : 0)).toFixed(1)}%)
- Machine Fleet Availability Rating     : ${m3.temp > 75 ? '88.5% (Thermal Constraint)' : '95.2% (Target: >90.0%)'}
- Operating Performance Efficiency      : ${manpower.auxiliaryDeployed > 0 ? '98.5% (Assisted)' : (m3.temp <= 70 ? '82.4% (Throttled)' : '92.1% (Standard)')}
- Product Quality Yield Index           : 99.2% (Scrap rate < 0.8%)
- Energy Efficiency Score               : 84.5% (Optimized via Eco-Pulse & Load Balancing)

--------------------------------------------------------------------------------
2. LIVE ROLLING 7-DAY EMISSIONS & ENERGY AUDIT
--------------------------------------------------------------------------------
Day 1 (Mon) : 265 kWh | 217.3 kg CO₂ | OEE: 77.2% | Baseline nominal
Day 2 (Tue) : 272 kWh | 223.0 kg CO₂ | OEE: 76.8% | Peak batch throughput
Day 3 (Wed) : 258 kWh | 211.5 kg CO₂ | OEE: 79.1% | Eco-Pulse mode enabled
Day 4 (Thu) : 269 kWh | 220.5 kg CO₂ | OEE: 78.0% | Hydraulic valve service
Day 5 (Fri) : 278 kWh | 227.9 kg CO₂ | OEE: 75.4% | Machine 3 thermal spike
Day 6 (Sat) : 252 kWh | 206.6 kg CO₂ | OEE: 80.2% | Load-balanced shift
Day 7 (Sun) : ${(t.power * 16.5).toFixed(1)} kWh | ${(t.carbon * 16.5).toFixed(1)} kg CO₂ | Active Shift In-Progress

- 7-Day Net Cumulative Energy  : 1,842.0 kWh
- 7-Day Total Verified Carbon  : 1,510.1 kg CO₂ (Allowed Cap: 2,100 kg CO₂)
- Net Environmental Buffer     : 589.9 kg CO₂ Saved (28.1% below statutory ceiling)

--------------------------------------------------------------------------------
3. RELIABILITY ENGINEERING (MTBF / MTTR)
--------------------------------------------------------------------------------
- Mean Time Between Failures (MTBF) : 314 Operating Hours
- Mean Time To Repair (MTTR)        : 22.4 Minutes
- Unplanned Downtime Averted        : 18.5 Machine Hours ($58,200 economic preservation)
- Spindle Wear & Fatigue Rate       : Nominal (Runout < 2 microns across CNC fleet)

--------------------------------------------------------------------------------
4. FINANCIAL OPTIMIZATION AUDIT
--------------------------------------------------------------------------------
- Avoided Equipment Replacement Cost : +$45,000 (Prevented M3 stator coil meltdown)
- Energy Cost Savings (Eco-Pulse)    : +$1,420 (Reactive power draw reduced by 12%)
- Auxiliary Manpower ROI Ratio       : 4.8x (Maintained $24,000 shift quota)

--------------------------------------------------------------------------------
5. ACTIVE SITUATIONAL RECOMMENDATIONS
--------------------------------------------------------------------------------
${recommendationsAudit}

================================================================================
Digital Twin Verification Signature: EcoSync Analytics Engine
================================================================================
`.trim();
  }

  if (category === 'emission') {
    return `
================================================================================
             ECOSYNC - PREDICTIVE DIGITAL TWIN PLATFORM
             ESG ENVIRONMENTAL COMPLIANCE & GHG PROTOCOL AUDIT
================================================================================
Report Reference ID : ${reportId}
Verification Hash   : ${shaHash}
Standard Protocol   : GHG Protocol Corporate Standard & ISO 14064-1 Verification
Generated At        : ${dateStr}
Corporate Rating    : AAA (Zero-Emission Smart Industrial Tier-1)
Active Diagnostic   : ${situation.title}

--------------------------------------------------------------------------------
1. GREENHOUSE GAS (GHG) INVENTORY BY SCOPE
--------------------------------------------------------------------------------
- Scope 1 (Direct Fugitive & Combustion)  : ${(t.carbon * 0.14).toFixed(2)} kg CO₂e
  • Exhaust Stack Carbon Capture Scrubbers : 98.6% Filtration Efficiency
- Scope 2 (Grid Indirect Electricity)   : ${(t.carbon * 0.86).toFixed(2)} kg CO₂e
  • Grid Carbon Intensity Factor           : 0.82 kg CO₂ per kWh
- Total Monitored Industrial Carbon      : ${t.carbon} kg CO₂
- Statutory Daily ESG Regulatory Cap     : ${t.budget} kg CO₂
- Regulatory Compliance Margin           : ${t.remaining} kg CO₂ (Safe buffer: ${((t.remaining / t.budget) * 100).toFixed(1)}%)

--------------------------------------------------------------------------------
2. LIVE CARBON DECARBONIZATION INTERVENTIONS (VERIFIED)
--------------------------------------------------------------------------------
✔ Automated Batch Rebalancing (Line 4)   : Prevented 8.4 kg CO₂ emission spike
✔ Dynamic Eco-Pulse Inverter Modulation  : Eliminated 12.2% reactive power wastage
✔ Closed-Loop Secondary Chiller B        : Heat recovery recirculated to pre-heaters
✔ Auxiliary Manpower Line Redistribution : Prevented line idle energy leakage

--------------------------------------------------------------------------------
3. AMBIENT AIR QUALITY & PARTICULATE SENSOR LOG
--------------------------------------------------------------------------------
- Ambient CO₂ Concentration : ${t.co2} ppm (OSHA Permissible Limit: < 1000 ppm)
- Thermal Velocity (dT/dt)  : ${m3.temp <= 70 ? '+0.1 °C/min (Stabilized)' : '+2.4 °C/min (Supervised)'}
- Particulate Matter Index  : PM2.5: 8.2 ug/m³ | PM10: 14.1 ug/m³ (Clean Air Standard)

--------------------------------------------------------------------------------
4. ACTIVE AI RECOMMENDATIONS STATUS
--------------------------------------------------------------------------------
${recommendationsAudit}

--------------------------------------------------------------------------------
5. ESG GOVERNANCE & STATUTORY CERTIFICATION
--------------------------------------------------------------------------------
Status : CERTIFIED COMPLIANT (Zero Carbon Breach Penalties Incurred)
Auditor: EcoSync ESG Continuous Compliance Monitor
================================================================================
`.trim();
  }

  // AI Insights Report
  return `
================================================================================
             ECOSYNC - PREDICTIVE DIGITAL TWIN PLATFORM
             AI PREDICTIVE INTELLIGENCE & INCIDENT AUDIT REPORT
================================================================================
Report Reference ID : ${reportId}
Verification Hash   : ${shaHash}
Architecture Engine : Physics-Informed Neural Network (PINN) + Time-Series Velocity
Generated At        : ${dateStr}
AI Engine Status    : ACTIVE (Sampling at 4000 ms via ESP32 Gateway)
Current Scenario    : ${situation.title}

--------------------------------------------------------------------------------
1. PREDICTIVE AI MODEL FORECAST & VELOCITY GRADIENTS
--------------------------------------------------------------------------------
- Machine 3 Core Temperature (dT/dt)   : ${m3.temp <= 70 ? '+0.1 °C/min (Thermal Runaway Averted)' : '+2.4 °C/min (Thermal Runaway Velocity)'}
- Dynamic Equation                      : Time_to_Trip = (95.0°C - Core Temp) / (dT/dt)
- Forecast Horizon Window               : 30-Minute Forward Projection
- Model Prediction Confidence           : 94.2% Confidence Interval
- Multi-Axis Vibration FFT Harms        : ${m2.vibr === 'High' ? '142 Hz hydraulic micro-cavitation registered' : 'Acoustic signature baseline normal'}

--------------------------------------------------------------------------------
2. SITUATION INCIDENT CHRONOLOGY & CLOSED-LOOP TIMELINE
--------------------------------------------------------------------------------
[T-30 min] Predictive model identified exponential thermal velocity on Machine-3.
[T-18 min] Failure probability surged to 94% with projected thermal trip in 5 minutes.
[T-10 min] Closed-loop prescriptive recommendations computed dynamically:
${recommendationsAudit}
[T-05 min] Human-in-the-Loop manager review & execution:
           ${m3.temp <= 70 ? `✔ Machine-3 load throttled; temperature stabilized at ${m3.temp}°C.` : '⚠ Awaiting execution.'}
[T-03 min] Revenue Protection Engine calculated line output deficit (-18.4%):
           - Prompted Revenue Loss Warning Pop-up to manager.
[T-01 min] Auxiliary Workforce Protocol:
           ${manpower.auxiliaryDeployed > 0 ? '✔ Authorized +4 Technicians deployed on Line 4; throughput restored to 100%.' : '⚠ Workforce deployment pending.'}

--------------------------------------------------------------------------------
3. CURRENT ACTIVE PREDICTIONS STATUS
--------------------------------------------------------------------------------
${state.predictions.map(p => `• [${p.tag.toUpperCase()}] ${p.title} (Probability: ${p.prob}%): ${p.desc}`).join('\n')}

--------------------------------------------------------------------------------
4. RECENT SYSTEM INTIMATIONS
--------------------------------------------------------------------------------
${alertsAudit || '  All systems stable.'}

Audit Status: Verified by EcoSync AI Systems Core
================================================================================
`.trim();
}

// ==================== REPORT GENERATION ====================
function generateReport(title) {
  showLoading(true);
  setTimeout(() => {
    showLoading(false);
    const dateStr = new Date().toLocaleString();
    const situation = getActiveSituationDiagnostic();
    const reportId = `ECO-RPT-${Date.now().toString().slice(-6)}`;

    let category = 'daily';
    let catLabel = 'Daily Shift Audit';
    let icon = '📊';
    let summarySnippet = '';

    if (title.toLowerCase().includes('weekly')) {
      category = 'weekly';
      catLabel = '7-Day OEE & Analytics';
      icon = '📈';
      summarySnippet = `${(81.4 - (state.telemetry.carbon > 20 ? 3.5 : 0)).toFixed(1)}% OEE • ${situation.statusText} • ${state.telemetry.remaining} kg CO₂ buffer`;
    } else if (title.toLowerCase().includes('emission') || title.toLowerCase().includes('esg')) {
      category = 'emission';
      catLabel = 'ESG Compliance Audit';
      icon = '🌍';
      summarySnippet = `Scope 1&2: ${state.telemetry.carbon} kg CO₂ / ${state.telemetry.budget} kg cap • Clean factor 0.82 • AAA rating`;
    } else if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('insight')) {
      category = 'ai';
      catLabel = 'AI Predictive Audit';
      icon = '🤖';
      summarySnippet = `PINN Model • Scenario: ${situation.title.slice(0, 28)}... • ${state.recommendations.filter(r => r.executed).length}/${state.recommendations.length} Recs Executed`;
    } else {
      category = 'daily';
      catLabel = 'Daily Summary';
      icon = '📄';
      summarySnippet = `CO₂: ${state.telemetry.co2} ppm • Temp: ${state.telemetry.temp}°C • Power: ${state.telemetry.power} kWh • ${situation.statusText.slice(0, 24)}...`;
    }

    const reportContent = generateDetailedReportContent(category, reportId, dateStr);

    const reportItem = {
      id: reportId,
      title: title,
      category: category,
      catLabel: catLabel,
      icon: icon,
      date: dateStr,
      co2Avg: state.telemetry.co2,
      carbonEmitted: state.telemetry.carbon,
      summary: summarySnippet,
      status: 'Verified',
      content: reportContent
    };

    state.reports.unshift(reportItem);
    renderReportsHistory();
    showToast(`${title} generated (${reportId})`, 'success');
  }, 600);
}

function renderReportsHistory() {
  const container = document.getElementById('reports-history');
  if (!container) return;

  if (state.reports.length === 0) {
    container.innerHTML = `
      <div class="report-history-empty">
        <p>No reports generated yet. Click a button above to generate.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.reports.map(r => `
    <div class="report-history-item" data-id="${r.id}">
      <div class="rhi-left">
        <span class="rhi-icon">${r.icon || '📄'}</span>
        <div>
          <div class="rhi-title-row">
            <span class="rhi-title">${r.title}</span>
            <span class="rhi-badge">${r.id}</span>
            <span class="rhi-badge-type">${r.catLabel || 'Audit'}</span>
          </div>
          <div class="rhi-summary">${r.summary || ''}</div>
          <div class="rhi-date">Generated on ${r.date} • Total Carbon: ${r.carbonEmitted} kg CO₂ • Status: <strong style="color:var(--accent-primary)">${r.status}</strong></div>
        </div>
      </div>
      <button class="btn-download" onclick="window.downloadReportById('${r.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Report
      </button>
    </div>
  `).join('');
}

// Expose download stub for inline onclick using unique report ID
window.downloadReportById = function(reportId) {
  const report = state.reports.find(r => r.id === reportId);
  const content = report ? report.content : generateDetailedReportContent('daily', reportId, new Date().toLocaleString());
  const title = report ? report.title : 'Factory_Report';

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${reportId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.downloadReportStub = function(reportTitle) {
  // Backward compatibility alias
  const report = state.reports.find(r => r.title === reportTitle);
  if (report) {
    window.downloadReportById(report.id);
  } else {
    generateReport(reportTitle);
  }
};

// ==================== LIVE TELEMETRY SIMULATION & BACKEND SYNC ====================
function startTelemetrySimulation() {
  setInterval(() => {
    if (!state.isLoggedIn) return;
    fetchLiveData();
  }, 4000);
}

async function fetchLiveData() {
  try {
    const res = await fetch('/api/live-data');
    if (res.ok) {
      const data = await res.json();
      applyTelemetry(data);
      return;
    }
  } catch (err) {
    // Backend offline / starting: fallback to realistic dynamic physics simulation
  }
  simulateLocalStep();
}

function simulateLocalStep() {
  // Minor natural fluctuations
  const deltaTemp = (Math.random() - 0.48) * 0.4;
  const deltaCo2 = (Math.random() - 0.48) * 4;
  const deltaPower = (Math.random() - 0.48) * 0.2;

  state.telemetry.temp = +(state.telemetry.temp + deltaTemp).toFixed(1);
  state.telemetry.co2 = Math.round(state.telemetry.co2 + deltaCo2);
  state.telemetry.power = +(state.telemetry.power + deltaPower).toFixed(1);

  // Carbon Formula: Power * Emission Factor (0.82)
  state.telemetry.carbon = +(state.telemetry.power * 0.82).toFixed(1);
  state.telemetry.remaining = +(state.telemetry.budget - state.telemetry.carbon).toFixed(1);

  updateTelemetryDisplay();
  pushChartData();
  updateSituationalIntelligence();
  updateLiveIntimations();
}

function applyTelemetry(data) {
  if (data.co2) state.telemetry.co2 = data.co2;
  if (data.temp) state.telemetry.temp = data.temp;
  if (data.humidity) state.telemetry.humidity = data.humidity;
  if (data.power) state.telemetry.power = data.power;
  if (data.carbon) state.telemetry.carbon = data.carbon;
  if (data.machines) {
    state.machines = data.machines;
    updateDigitalTwinDisplay();
  }
  if (data.predictions) {
    state.predictions = data.predictions;
    renderPredictions();
  }
  if (data.recommendations) {
    state.recommendations = data.recommendations;
    renderRecommendations();
  } else {
    updateSituationalIntelligence();
  }
  updateTelemetryDisplay();
  pushChartData();
  updateLiveIntimations();
}

function updateTelemetryDisplay() {
  const co2El = document.getElementById('co2-value');
  const tempEl = document.getElementById('temp-value');
  const humEl = document.getElementById('humidity-value');
  const powerEl = document.getElementById('power-value');
  const carbonEl = document.getElementById('carbon-emission');
  const remainingEl = document.getElementById('carbon-remaining');
  const percentEl = document.getElementById('carbon-percent');
  const co2Bar = document.getElementById('co2-bar');
  const tempBar = document.getElementById('temp-bar');
  const powerBar = document.getElementById('power-bar');

  if (co2El) co2El.textContent = state.telemetry.co2;
  if (tempEl) tempEl.textContent = state.telemetry.temp;
  if (humEl) humEl.textContent = state.telemetry.humidity;
  if (powerEl) powerEl.textContent = state.telemetry.power;
  if (carbonEl) carbonEl.textContent = state.telemetry.carbon;
  if (remainingEl) remainingEl.textContent = state.telemetry.remaining;

  const pct = Math.min(100, Math.round((state.telemetry.carbon / state.telemetry.budget) * 100));
  if (percentEl) percentEl.textContent = `${pct}%`;

  if (co2Bar) co2Bar.style.width = `${Math.min(100, (state.telemetry.co2 / 800) * 100)}%`;
  if (tempBar) tempBar.style.width = `${Math.min(100, (state.telemetry.temp / 80) * 100)}%`;
  if (powerBar) powerBar.style.width = `${Math.min(100, (state.telemetry.power / 30) * 100)}%`;

  // Update gauge chart
  if (state.charts.gauge) {
    state.charts.gauge.data.datasets[0].data = [
      state.telemetry.carbon,
      Math.max(0, state.telemetry.budget - state.telemetry.carbon)
    ];
    state.charts.gauge.update();
  }
}

function pushChartData() {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  if (state.charts.trends) {
    const labels = state.charts.trends.data.labels;
    const co2Data = state.charts.trends.data.datasets[0].data;
    const tempData = state.charts.trends.data.datasets[1].data;

    if (labels.length > 12) {
      labels.shift();
      co2Data.shift();
      tempData.shift();
    }
    labels.push(timeStr);
    co2Data.push(state.telemetry.co2);
    tempData.push(state.telemetry.temp);
    state.charts.trends.update('none');
  }

  if (state.charts.power) {
    const labels = state.charts.power.data.labels;
    const powerData = state.charts.power.data.datasets[0].data;

    if (labels.length > 12) {
      labels.shift();
      powerData.shift();
    }
    labels.push(timeStr);
    powerData.push(state.telemetry.power);
    state.charts.power.update('none');
  }
}

function updateDigitalTwinDisplay() {
  state.machines.forEach(m => {
    const el = document.getElementById(`machine-${m.id}`);
    if (!el) return;

    const tempEl = document.getElementById(`m${m.id}-temp`);
    const loadEl = document.getElementById(`m${m.id}-load`);
    const vibrEl = document.getElementById(`m${m.id}-vibr`);

    if (tempEl) tempEl.textContent = `${m.temp}°C`;
    if (loadEl) loadEl.textContent = `${m.load}%`;
    if (vibrEl) vibrEl.textContent = m.vibr;

    const indicator = el.querySelector('.machine-status-indicator');
    const statusText = el.querySelector('.machine-status-text');
    const visual = el.querySelector('.machine-body');

    if (indicator) {
      indicator.className = `machine-status-indicator ${m.status}`;
    }
    if (statusText) {
      statusText.className = `machine-status-text ${m.status}`;
      statusText.textContent = m.status === 'online' ? '● Online' : m.status === 'warning' ? '⚠ Warning' : '🔴 Critical';
    }
    if (visual) {
      visual.className = 'machine-body';
      if (m.status === 'warning') visual.classList.add('warning-glow');
      if (m.status === 'danger') visual.classList.add('danger-glow');
    }
  });
}

// ==================== TOAST & OVERLAY HELPERS ====================
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✔' : type === 'danger' ? '✖' : 'ℹ'}</span>
    <span>${msg}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

// ===================================================================
// EcoSync Dedicated Project Knowledge Base & AI Copilot Engine
// Strictly specializes in EcoSync: Predictive Digital Twin Platform
// ===================================================================

const EcoSyncProjectBrain = {
  // Query processor strictly scoped to EcoSync project
  query(rawPrompt) {
    const q = (rawPrompt || '').trim().toLowerCase();
    const t = state.telemetry;
    const m1 = state.machines.find(m => m.id === 1) || {};
    const m2 = state.machines.find(m => m.id === 2) || {};
    const m3 = state.machines.find(m => m.id === 3) || {};
    const m4 = state.machines.find(m => m.id === 4) || {};
    const m5 = state.machines.find(m => m.id === 5) || {};

    // 1. Direct Action Commands: Approve / Fix / Mitigate
    if (q.includes('approve') || q.includes('mitigate') || q.includes('fix machine') || q.includes('cool down') || q.includes('cool machine') || q.includes('apply action') || q.includes('save machine')) {
      executeApproveAllRecommendations();
      return {
        reply: `⚡ **AI Closed-Loop Optimizations Executed!**\n\nI have automatically triggered our Human-in-the-Loop mitigation workflow:\n- **Machine 3 (Injection Molder):** Throttled speed by 25% and engaged Secondary Chiller Unit B. Core temp dropping from 89°C to **68°C**.\n- **Machine 2 (Hydraulic Press):** Shifted Batch #409 to Assembly Robot 4. Load normalized to **80%**.\n- **Factory Power Draw:** Decreased to **12.1 kWh**.\n- **Carbon Footprint:** Reduced to **9.9 kg CO₂** (Daily limit: 50 kg).\n\nThe digital twin danger alert has been successfully cleared!`,
        actions: [
          { label: '🏭 View Digital Twin Floor', action: 'navigate_twin' },
          { label: '📊 View Analytics', action: 'navigate_analytics', secondary: true }
        ]
      };
    }

    // 2. Navigation Commands
    if ((q.includes('go to') || q.includes('open') || q.includes('show') || q.includes('view') || q.includes('take me to') || q.includes('switch to')) && (q.includes('twin') || q.includes('digital twin'))) {
      navigateToPage('digital-twin');
      return {
        reply: `🏭 **Switched to Digital Twin Floor!**\n\nYou can now observe live physical twin models for all 5 factory machines. Notice the dynamic gear speeds, thermal glowing envelopes, and real-time load telemetry.`,
        actions: [
          { label: '⚡ Cool Down Machine 3', action: 'approve_mitigation' },
          { label: '🔮 View Predictions', action: 'navigate_predictions', secondary: true }
        ]
      };
    }

    if ((q.includes('go to') || q.includes('open') || q.includes('show') || q.includes('view') || q.includes('take me to') || q.includes('switch to')) && q.includes('prediction')) {
      navigateToPage('predictions');
      return {
        reply: `🔮 **Switched to Predictive AI Engine!**\n\nHere you can inspect the Deep Learning failure probability cards, time-to-trip calculations, and our 7-day model accuracy tracking curve (averaging 85–94% accuracy).`,
        actions: [
          { label: '⚡ Approve AI Mitigations', action: 'approve_mitigation' },
          { label: '🏭 View Digital Twin', action: 'navigate_twin', secondary: true }
        ]
      };
    }

    if ((q.includes('go to') || q.includes('open') || q.includes('show') || q.includes('view') || q.includes('take me to') || q.includes('switch to')) && (q.includes('analytic') || q.includes('graph') || q.includes('energy breakdown'))) {
      navigateToPage('analytics');
      return {
        reply: `📊 **Switched to Factory Analytics!**\n\nReview the 24-hour Carbon Emissions timeline, machine-by-machine energy distribution, and our composite 75% Factory Efficiency (OEE) gauge.`,
        actions: [
          { label: '📄 Generate Compliance Report', action: 'generate_report' }
        ]
      };
    }

    if ((q.includes('go to') || q.includes('open') || q.includes('show') || q.includes('view') || q.includes('take me to') || q.includes('switch to')) && q.includes('alert')) {
      navigateToPage('alerts');
      return {
        reply: `⚠️ **Switched to Alert Center!**\n\nCurrently tracking active threshold triggers. You can filter by Critical, Warning, or Info, and click "Resolve" once mitigations are verified.`,
        actions: [
          { label: '⚡ Auto-Resolve with Mitigations', action: 'approve_mitigation' }
        ]
      };
    }

    if ((q.includes('go to') || q.includes('open') || q.includes('show') || q.includes('view') || q.includes('take me to') || q.includes('switch to')) && q.includes('report')) {
      navigateToPage('reports');
      return {
        reply: `📄 **Switched to Factory Reports & Compliance!**\n\nYou can generate and download Daily Summary, Weekly Analytics, Emission Compliance (ESG), and AI Insights audit reports.`,
        actions: [
          { label: '📄 Generate Daily Report', action: 'generate_report' }
        ]
      };
    }

    if ((q.includes('go to') || q.includes('open') || q.includes('show') || q.includes('view') || q.includes('take me to') || q.includes('switch to')) && (q.includes('overview') || q.includes('dashboard') || q.includes('home'))) {
      navigateToPage('overview');
      return {
        reply: `🏠 **Switched to Factory Overview!**\n\nHere is your real-time command cockpit: live CO₂ & temperature gauges, dynamic carbon emission calculator, trending curves, and the AI Human-in-the-Loop recommendation panel.`,
        actions: [
          { label: '⚡ Approve All Actions', action: 'approve_mitigation' }
        ]
      };
    }

    // 3. Machine 3 / Overheating Inquiry
    if (q.includes('machine 3') || q.includes('machine-3') || q.includes('m3') || q.includes('overheat') || q.includes('injection molder')) {
      const isCool = m3.temp <= 70;
      return {
        reply: isCool
          ? `✅ **Machine 3 (Injection Molder) Status: STABILIZED**\n\n- **Temperature:** ${m3.temp}°C (Safe zone < 70°C)\n- **Operating Load:** ${m3.load}%\n- **Vibration:** ${m3.vibr}\n- **Status:** Online (Nominal)\n\nThe thermal runaway threat was mitigated by throttling load by 25% and circulating glycol coolant from Chiller B.`
          : `⚠️ **Machine 3 (Injection Molder) Status: CRITICAL OVERHEAT**\n\n- **Current Core Temp:** ${m3.temp}°C (Emergency trip limit: 95°C)\n- **Mechanical Load:** ${m3.load}%\n- **Vibration Harmonics:** ${m3.vibr}\n- **AI Prediction:** 94% chance of thermal breakdown within 5 minutes (+2.4°C/min thermal gradient velocity).\n\n**Prescriptive AI Solution:** Throttles machine speed by 25% and activates Secondary Chiller Unit B to bring temperature back down to 68°C.`,
        actions: isCool
          ? [{ label: '🏭 View Machine 3 in Twin', action: 'navigate_twin' }]
          : [
              { label: '⚡ Approve Mitigations Now', action: 'approve_mitigation' },
              { label: '🏭 View Machine 3 in Twin', action: 'navigate_twin', secondary: true }
            ]
      };
    }

    // 4. Machine 2 / Hydraulic Press Inquiry
    if (q.includes('machine 2') || q.includes('machine-2') || q.includes('m2') || q.includes('hydraulic')) {
      return {
        reply: `⚠️ **Machine 2 (Hydraulic Press) Status:**\n\n- **Current Temp:** ${m2.temp}°C\n- **Mechanical Load:** ${m2.load}%\n- **Vibration:** ${m2.vibr} (142 Hz harmonic flutter caused by micro-cavitation in the hydraulic line)\n- **AI Prediction:** 87% probability of emergency valve trip.\n\n**Corrective Action:** Rebalance Batch #409 to Assembly Robot 4 to eliminate mechanical stress.`,
        actions: [
          { label: '⚡ Rebalance via AI Approval', action: 'approve_mitigation' },
          { label: '🏭 View Machine 2 in Twin', action: 'navigate_twin', secondary: true }
        ]
      };
    }

    // 5. All Machines / Factory Floor Summary
    if (q.includes('all machine') || q.includes('machines') || q.includes('machine status') || q.includes('machine 1') || q.includes('machine 4') || q.includes('machine 5')) {
      return {
        reply: `🏭 **EcoSync Factory Floor - Machine Fleet Telemetry:**\n\n` +
          `1. **Machine 1 (CNC Lathe):** ${m1.temp}°C | Load: ${m1.load}% | Vibr: ${m1.vibr} | Status: \`${m1.status.toUpperCase()}\`\n` +
          `2. **Machine 2 (Hydraulic Press):** ${m2.temp}°C | Load: ${m2.load}% | Vibr: ${m2.vibr} | Status: \`${m2.status.toUpperCase()}\`\n` +
          `3. **Machine 3 (Injection Molder):** ${m3.temp}°C | Load: ${m3.load}% | Vibr: ${m3.vibr} | Status: \`${m3.status.toUpperCase()}\`\n` +
          `4. **Machine 4 (Assembly Robot):** ${m4.temp}°C | Load: ${m4.load}% | Vibr: ${m4.vibr} | Status: \`${m4.status.toUpperCase()}\`\n` +
          `5. **Machine 5 (Welding Unit):** ${m5.temp}°C | Load: 0% | Vibr: Off | Status: \`MAINTENANCE\`\n\n` +
          `Would you like to navigate to the Digital Twin floor to inspect them live?`,
        actions: [
          { label: '🏭 Open Digital Twin Floor', action: 'navigate_twin' },
          { label: '⚡ Mitigate Active Risks', action: 'approve_mitigation', secondary: true }
        ]
      };
    }

    // 6. How AI Predictions Work / Mathematical Model
    if ((q.includes('how') || q.includes('explain') || q.includes('tell me about')) && (q.includes('predict') || q.includes('algorithm') || q.includes('model') || q.includes('math') || q.includes('formula'))) {
      return {
        reply: `🔮 **How EcoSync AI Prediction Works:**\n\nUnlike traditional reactive monitoring, EcoSync uses proactive physics-informed AI modeling:\n\n1. **Thermal Velocity Analysis (ΔT / Δt):** Monitors the rate of temperature rise across a 30-sample sliding window rather than static triggers.\n2. **Time-to-Trip Equation:**\n\`Time to Failure = (Safety Limit [95°C] - Current Temp) / (ΔT / Δt)\`\n3. **Multi-Variate Failure Probability:** Fuses thermal drift, 142 Hz vibration harmonics, and instantaneous kW surges into a normalized failure score:\n\`P(failure) = min(98%, 70% + (T - 45) × 1.2)\`\n4. **Closed-Loop Prescriptive Action:** Formulates specific mitigation actions (load shedding, chiller activation, batch shifting) for one-click Human-in-the-Loop manager execution.`,
        actions: [
          { label: '🔮 View Predictions Tab', action: 'navigate_predictions' },
          { label: '⚡ Execute Recommendations', action: 'approve_mitigation', secondary: true }
        ]
      };
    }

    // 7. Carbon Calculation Engine
    if (q.includes('carbon') || q.includes('emission') || q.includes('co2') || q.includes('budget') || q.includes('greenhouse')) {
      return {
        reply: `🌍 **Live Carbon Calculation Engine:**\n\n- **Formula:** \`Carbon Emitted (kg CO₂) = Power Draw (kWh) × 0.82 (Grid Emission Factor)\`\n- **Current Power Draw:** ${t.power} kWh\n- **Current Carbon Emitted:** ${t.carbon} kg CO₂\n- **Daily Carbon Limit:** ${t.budget} kg CO₂\n- **Remaining Budget Today:** ${t.remaining} kg CO₂\n- **Factory Ambient CO₂:** ${t.co2} ppm (Safe zone < 500 ppm)\n\nEcoSync computes a forward trajectory 30 minutes into the future to alert managers before the factory breaches regulatory ESG limits!`,
        actions: [
          { label: '📊 View Carbon Trends', action: 'navigate_analytics' },
          { label: '📄 Generate ESG Compliance Report', action: 'generate_report', secondary: true }
        ]
      };
    }

    // 8. Hardware, ESP32, and Sensors
    if (q.includes('sensor') || q.includes('esp32') || q.includes('hardware') || q.includes('arduino') || q.includes('pin') || q.includes('iot')) {
      return {
        reply: `📡 **Hardware & Sensor Gateway Architecture:**\n\nEcoSync connects to physical factory machines via an **ESP32 IoT Gateway** (\`sensors/esp32.ino\`):\n- **Microcontroller:** ESP32 with dual-band Wi-Fi & HTTP Client\n- **CO₂ Gas Sensor:** MQ-135 / SCD-30 on **Analog Pin 34** (measures 380–1000 ppm)\n- **Temperature & Humidity:** DHT22 Sensor on **Digital Pin 4**\n- **Current & Power:** ACS712 Hall-Effect Sensor on **Analog Pin 35** (converts current to kWh)\n- **Publish Protocol:** JSON HTTP POST to \`/api/sensor-data\` every 5 seconds\n- **Hardware-Free Testing:** You can simulate sensor streams anytime using \`python simulator.py\`.`,
        actions: [
          { label: '🧪 How to use Simulator', action: 'simulator_help' }
        ]
      };
    }

    // 9. Sensor Simulator
    if (q.includes('simulator') || q.includes('simulate') || q.includes('dummy') || q.includes('python simulator')) {
      return {
        reply: `🧪 **EcoSync Sensor Simulator (\`backend/simulator.py\`):**\n\nEnables comprehensive live demonstrations without physical hardware:\n\n- **Machine 3 Overheating Demo:**\n\`python simulator.py gradual_overheat\`\n*(Streams 65°C → 89°C gradual heat runaway with vibration spikes)*\n\n- **Carbon Surge Scenario:**\n\`python simulator.py spike\`\n*(Simulates sudden CO₂ and kWh spike breaching 50 kg limit)*\n\n- **Normal Steady Operation:**\n\`python simulator.py normal\`\n*(Streams nominal baseline factory conditions)*\n\nAll simulation packets are dynamically calculated and visualized on the dashboard in real-time.`,
        actions: [
          { label: '🏠 Factory Overview', action: 'navigate_overview' }
        ]
      };
    }

    // 10. Reports & Exporting
    if (q.includes('report') || q.includes('download') || q.includes('pdf') || q.includes('export') || q.includes('esg')) {
      return {
        reply: `📄 **Factory Reports & ESG Compliance:**\n\nEcoSync generates 4 official audit reports:\n1. **Daily Summary Report:** Comprehensive log of CO₂, temperature, power, and carbon.\n2. **Weekly Analytics:** OEE efficiency, machine uptime, and energy trends.\n3. **Emission Compliance (ESG):** Regulatory footprint vs. 50 kg daily ceiling.\n4. **AI Insights Report:** Log of all predicted failure events and approved mitigations.\n\nClick below to generate and download a report instantly!`,
        actions: [
          { label: '📄 Generate Daily Report', action: 'generate_report' },
          { label: '📁 Go to Reports Tab', action: 'navigate_reports', secondary: true }
        ]
      };
    }

    // 11. Judge Pitch & Presentation Guidance
    if (q.includes('pitch') || q.includes('judge') || q.includes('presentation') || q.includes('demo') || q.includes('standout') || q.includes('hackathon')) {
      return {
        reply: `🎤 **Hackathon Judge Pitch Script (30 Seconds):**\n\n*"Judges, traditional factories are purely reactive. When Machine-3 overheats or carbon limits breach, downtime, equipment damage, and environmental penalties have already occurred.\n\n**EcoSync is a Predictive Digital Twin for Zero-Emission Factories.** We fuse live IoT telemetry—CO₂, temperature velocity, vibration harmonics, and power draw—to predict industrial failures **5 to 30 minutes before they happen**.\n\nMore importantly, we provide **Human-in-the-Loop closed-loop control**. The plant manager approves AI recommendations with one click, and EcoSync automatically throttles machines, engages secondary chillers, and restores zero-emission balance!"*\n\n**7-Step Judge Demo Flow:**\n1. Log in (\`admin@ecosync.io\`).\n2. Show Live Telemetry cards & Carbon Formula.\n3. Open Digital Twin floor → see Machine 3 in red.\n4. Show AI Prediction Panel (94% failure risk).\n5. Click **"Approve All Actions"** → Machine 3 temp drops to 68°C!\n6. Switch to Analytics to view energy breakdown.\n7. Generate & download an ESG Report.`,
        actions: [
          { label: '⚡ Try One-Click Mitigation', action: 'approve_mitigation' },
          { label: '🏭 Open Digital Twin Floor', action: 'navigate_twin', secondary: true }
        ]
      };
    }

    // 12. Active Alerts Inquiry
    if (q.includes('alert') || q.includes('warning') || q.includes('alarm') || q.includes('critical')) {
      const alertItems = state.alerts.map(a => `• **${a.title}** (${a.type.toUpperCase()}): ${a.msg}`).join('\n');
      return {
        reply: `⚠️ **Current Active Alerts (${state.alerts.length}):**\n\n${alertItems || 'No active alerts.'}\n\nWould you like me to take you to the Alert Center or execute the AI mitigations to resolve them?`,
        actions: [
          { label: '⚠️ Open Alert Center', action: 'navigate_alerts' },
          { label: '⚡ Auto-Resolve Alerts', action: 'approve_mitigation', secondary: true }
        ]
      };
    }

    // 13. Factory Efficiency Score / OEE
    if (q.includes('efficiency') || q.includes('score') || q.includes('oee') || q.includes('uptime')) {
      return {
        reply: `🏭 **Factory Efficiency Score & OEE:**\n\n- **Overall OEE Score:** **75%**\n- **Energy Efficiency:** **82%** (Optimized via Dynamic Eco-Pulse Inverter mode)\n- **Machine Uptime:** **91%**\n- **Carbon Compliance Score:** **68%**\n- **AI Prediction Accuracy:** **85%**\n\nAll metrics are dynamically correlated with machine vibrations and power consumption.`,
        actions: [
          { label: '📊 View Analytics Dashboard', action: 'navigate_analytics' }
        ]
      };
    }

    // 14. What is EcoSync / Concept & Architecture
    if (q.includes('what is ecosync') || q.includes('about') || q.includes('project') || q.includes('architecture') || q.includes('tech stack')) {
      return {
        reply: `🏭 **EcoSync: Predictive Digital Twin Platform**\n\n- **Core Value:** Eliminates industrial downtime and carbon overshoot before it occurs through AI predictive pattern matching.\n- **Frontend:** Vite, Vanilla HTML/CSS/JavaScript, Chart.js, cyber dark glassmorphic styling.\n- **Backend:** FastAPI (Python), REST endpoints for live sensor ingestion, carbon engine, and AI recommendations.\n- **AI Engine:** Physics-informed trend model computing thermal velocity, FFT vibration analysis, and failure probability.\n- **Hardware:** ESP32 Wi-Fi gateway with MQ-135, DHT22, and ACS712 sensors.\n\nAsk me about any machine, formula, hardware sensor, or feature!`,
        actions: [
          { label: '🏠 Go to Factory Overview', action: 'navigate_overview' },
          { label: '🏭 View Digital Twin', action: 'navigate_twin', secondary: true }
        ]
      };
    }

    // 15. Manpower & Company Revenue Loss Protection
    if (q.includes('manpower') || q.includes('man power') || q.includes('revenue') || q.includes('loss of the company') || q.includes('loss of company') || q.includes('production loss') || q.includes('deficit') || q.includes('maintain revenue') || q.includes('compensate') || q.includes('workforce') || q.includes('technician')) {
      return {
        reply: `⚠️ **Machinery Changes & Company Revenue Protection Protocol:**\n\n` +
          `When machineries are throttled (such as reducing Machine-3 speed by -25% to prevent a catastrophic $45,000 thermal trip), factory line output drops by **-18.4% (~160 units/hr)**.\n\n` +
          `- **Company Revenue Risk:** A projected deficit of **-$3,850** per shift.\n` +
          `- **Automated Pop-Up Protocol:** EcoSync automatically displays a **Revenue Protection Pop-up** alerting managers to increase floor manpower.\n` +
          `- **Manpower Action:** Authorizing **+4 Auxiliary Technicians** across Assembly Line 4 compensates for the reduced machine speed and maintains the company's daily revenue target at 100%.\n\n` +
          `Would you like to open the Revenue Loss Warning Pop-up or deploy the technicians now?`,
        actions: [
          { label: '👥 Show Manpower Warning Popup', action: 'show_manpower_modal' },
          { label: '⚡ Deploy +4 Technicians Now', action: 'deploy_manpower', secondary: true }
        ]
      };
    }

    // 16. Strict Scope Guardrail for Unrelated Queries
    const unrelatedKeywords = ['recipe', 'sports', 'football', 'cricket', 'weather', 'movie', 'song', 'poem', 'joke', 'crypto', 'bitcoin', 'stock market', 'news', 'who is', 'translate', 'game'];
    if (unrelatedKeywords.some(w => q.includes(w))) {
      return {
        reply: `🤖 **EcoSync Scope Notice:**\n\nI am your dedicated **EcoSync Digital Twin Assistant**, strictly specialized in this smart manufacturing platform.\n\nI do not answer questions outside of EcoSync. However, I can help you with:\n- Machine conditions & real-time telemetry\n- Predictive failure algorithms & math formulas\n- One-click AI mitigations (cooling Machine 3)\n- Carbon emission calculation & budget\n- ESP32 hardware & simulation instructions\n- Hackathon pitch presentation guidance\n\nWhat would you like to explore in EcoSync?`,
        actions: [
          { label: '⚠️ Machine 3 Overheat', action: 'm3_query' },
          { label: '🔮 How AI Predicts', action: 'predict_query', secondary: true }
        ]
      };
    }

    // Default Fallback
    return {
      reply: `👋 **EcoSync Copilot Ready!**\n\nI have complete knowledge of every detail in this Predictive Digital Twin project. Here is how I can guide you:\n\n- ⚠️ **Machine Issues:** Ask *"Why is Machine 3 in critical status?"*\n- ⚡ **Automated Action:** Say *"Approve all AI mitigations and cool Machine 3"*\n- 🔮 **Algorithms:** Ask *"Explain the failure prediction formula"*\n- 🧮 **Carbon Engine:** Ask *"How is carbon emission calculated?"*\n- 📡 **IoT Hardware:** Ask *"What sensors and ESP32 pins are used?"*\n- 🎤 **Judge Demo:** Ask *"Give me the 30-second judge pitch script"*\n\nWhat would you like to do next?`,
      actions: [
        { label: '⚡ Fix & Cool Machine 3', action: 'approve_mitigation' },
        { label: '🏭 View Digital Twin', action: 'navigate_twin', secondary: true }
      ]
    };
  }
};

// ===================================================================
// AI Chatbot UI Controller
// ===================================================================

function initChatBot() {
  const toggleBtn = document.getElementById('ai-chat-toggle');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('chat-close-btn');
  const inputForm = document.getElementById('chat-input-form');
  const inputEl = document.getElementById('chat-input');
  const messagesContainer = document.getElementById('chat-messages');
  const chipsContainer = document.getElementById('chat-chips');

  if (!toggleBtn || !chatWindow || !inputForm || !inputEl || !messagesContainer) {
    return;
  }

  // Toggle chat drawer
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
      inputEl.focus();
      scrollChatToBottom();
    }
  });

  // Close chat drawer
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatWindow.classList.remove('active');
    });
  }

  // Quick inquiry chips click
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chat-chip');
      if (!chip) return;
      const query = chip.dataset.query;
      if (query) {
        handleUserMessage(query);
      }
    });
  }

  // Message submission
  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    handleUserMessage(text);
  });

  // Action button clicks inside bot messages
  messagesContainer.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.chat-action-btn');
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;
    handleChatAction(action);
  });
}

async function handleUserMessage(userText) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  // 1. Render User Message
  appendChatMessage('user', userText);
  scrollChatToBottom();

  // 2. Render Typing Indicator
  const typingEl = appendTypingIndicator();
  scrollChatToBottom();

  // 3. Obtain response: try backend /api/chat with fallback to EcoSyncProjectBrain
  let botResponse = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        botResponse = {
          reply: data.reply,
          actions: mapSuggestedActionToButtons(data.suggested_action)
        };
      }
    }
  } catch (err) {
    // Backend offline / timed out — use instant client-side Project Brain
  }

  // Fallback to local EcoSync Knowledge Engine if needed
  if (!botResponse) {
    botResponse = EcoSyncProjectBrain.query(userText);
  }

  // Natural small delay for typing feel
  await new Promise(r => setTimeout(r, 380));

  // 4. Remove typing indicator & render bot message
  if (typingEl && typingEl.parentNode) {
    typingEl.remove();
  }

  appendChatMessage('bot', botResponse.reply, botResponse.actions);
  scrollChatToBottom();
}

function mapSuggestedActionToButtons(actionKey) {
  if (!actionKey) return undefined;
  switch (actionKey) {
    case 'approve_mitigation':
      return [
        { label: '⚡ Approve Mitigations Now', action: 'approve_mitigation' },
        { label: '🏭 View Digital Twin', action: 'navigate_twin', secondary: true }
      ];
    case 'navigate_twin':
      return [{ label: '🏭 Open Digital Twin Floor', action: 'navigate_twin' }];
    case 'navigate_predictions':
      return [{ label: '🔮 Open Predictions Engine', action: 'navigate_predictions' }];
    case 'navigate_analytics':
      return [{ label: '📊 View Analytics Dashboard', action: 'navigate_analytics' }];
    case 'navigate_alerts':
      return [{ label: '⚠️ View Alert Center', action: 'navigate_alerts' }];
    case 'navigate_reports':
      return [{ label: '📄 Open Factory Reports', action: 'navigate_reports' }];
    case 'navigate_overview':
      return [{ label: '🏠 Go to Overview', action: 'navigate_overview' }];
    case 'generate_report':
      return [
        { label: '📄 Generate ESG Report', action: 'generate_report' },
        { label: '📁 Go to Reports Tab', action: 'navigate_reports', secondary: true }
      ];
    default:
      return undefined;
  }
}

function handleChatAction(action) {
  switch (action) {
    case 'approve_mitigation':
      executeApproveAllRecommendations().then(() => {
        appendChatMessage('bot', '✅ **AI Mitigations Successfully Executed!** Machine-3 temperature has stabilized at 68°C and power usage dropped to 12.1 kWh.', [
          { label: '🏭 View Digital Twin', action: 'navigate_twin' },
          { label: '🏠 Back to Overview', action: 'navigate_overview', secondary: true }
        ]);
        scrollChatToBottom();
      });
      break;
    case 'navigate_twin':
      navigateToPage('digital-twin');
      break;
    case 'navigate_predictions':
      navigateToPage('predictions');
      break;
    case 'navigate_analytics':
      navigateToPage('analytics');
      break;
    case 'navigate_alerts':
      navigateToPage('alerts');
      break;
    case 'navigate_reports':
      navigateToPage('reports');
      break;
    case 'navigate_overview':
      navigateToPage('overview');
      break;
    case 'generate_report':
      generateReport('Emission Compliance ESG Report');
      navigateToPage('reports');
      break;
    case 'simulator_help':
      appendChatMessage('bot', '🧪 **To run the simulator:** Open a terminal in `d:\\PERSONAL\\Ecosync\\backend` and run:\n```bash\npython simulator.py gradual_overheat\n```\nWatch live telemetry update automatically on the dashboard!');
      scrollChatToBottom();
      break;
    case 'm3_query':
      handleUserMessage('Why is Machine 3 in critical status?');
      break;
    case 'predict_query':
      handleUserMessage('How does the AI predict machine failure?');
      break;
    case 'show_manpower_modal':
      showManpowerLossModal({
        deficit: '-18.4%',
        revenueLoss: '-$3,850',
        avertedDamage: '+$45,000'
      });
      break;
    case 'deploy_manpower':
      deployAuxiliaryManpower();
      appendChatMessage('bot', '✅ **Auxiliary Manpower Deployed!** +4 Technicians have been assigned to Assembly Line 4. Total throughput restored to 100% and daily revenue targets safeguarded.');
      scrollChatToBottom();
      break;
    default:
      break;
  }
}

function appendChatMessage(sender, text, actions) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msgEl = document.createElement('div');
  msgEl.className = `chat-msg ${sender}-msg`;

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  let actionsHtml = '';
  if (actions && actions.length > 0) {
    actionsHtml = `
      <div class="chat-msg-actions">
        ${actions.map(a => `
          <button class="chat-action-btn ${a.secondary ? 'secondary' : ''}" data-action="${a.action}">
            ${a.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  const formattedContent = formatChatMarkdown(text);

  msgEl.innerHTML = `
    <div class="msg-bubble">
      ${formattedContent}
      ${actionsHtml}
    </div>
    <span class="msg-time">${timeStr}</span>
  `;

  container.appendChild(msgEl);
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const typingEl = document.createElement('div');
  typingEl.className = 'chat-msg bot-msg';
  typingEl.innerHTML = `
    <div class="msg-bubble">
      <div class="chat-typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  container.appendChild(typingEl);
  return typingEl;
}

function formatChatMarkdown(text) {
  if (!text) return '';
  let str = text;

  // Escape basic HTML
  str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks: ```code```
  str = str.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code: `code`
  str = str.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold: **text**
  str = str.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *text*
  str = str.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Bullet items: \n- text or \n• text
  str = str.replace(/(?:^|\n)[-•]\s+(.+)/g, '<li>$1</li>');
  str = str.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  // Collapse adjacent <ul> tags
  str = str.replace(/<\/ul>\s*<ul>/g, '');

  // Line breaks to paragraphs
  const paragraphs = str.split(/\n{2,}/);
  str = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<ul>') || p.startsWith('<pre>')) return p;
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('');

  return str;
}

function scrollChatToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}
