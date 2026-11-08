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
    { id: 1, name: 'Machine 1', type: 'CNC Lathe', bay: 'Bay 1 - Machining', power: 3.8, temp: 42, load: 72, vibr: 'Normal', status: 'online', journeyPhase: 'Phase 1: Seed Prototype' },
    { id: 2, name: 'Machine 2', type: 'Hydraulic Press', bay: 'Bay 2 - Stamping', power: 4.5, temp: 78, load: 94, vibr: 'High', status: 'warning', journeyPhase: 'Phase 1: Seed Prototype' },
    { id: 3, name: 'Machine 3', type: 'Injection Molder', bay: 'Bay 3 - Molding', power: 5.2, temp: 89, load: 98, vibr: 'Critical', status: 'danger', journeyPhase: 'Phase 2: Pilot Plant' },
    { id: 4, name: 'Machine 4', type: 'Assembly Robot', bay: 'Bay 4 - Robotics', power: 2.2, temp: 38, load: 55, vibr: 'Normal', status: 'online', journeyPhase: 'Phase 2: Pilot Plant' },
    { id: 5, name: 'Machine 5', type: 'Welding Unit', bay: 'Bay 5 - Welding', power: 0.0, temp: 0, load: 0, vibr: 'Off', status: 'offline', journeyPhase: 'Phase 2: Pilot Plant' },
  ],
  companyJourney: {
    currentPhase: 2,
    phaseName: 'Phase 2: Pilot Plant',
    targetMachines: 8,
    totalWorkforce: 16
  },
  incidentHistory: [3],
  activeAnomaly: {
    machineId: 3,
    machineName: 'Machine 3',
    machineType: 'Injection Molder',
    bay: 'Bay 3 - Molding',
    type: 'thermal',
    title: 'Machine 3 Critical Overheating Alert (89°C)',
    desc: 'Spindle thermal velocity predicts thermal trip in 4.5 minutes.',
    targetTemp: 44,
    targetLoad: 68
  },
  autoRotateIncidentTimer: null,
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
      productionLoss: '-18.4% throughput (~160 units/hr drop)',
      revenueLoss: '-$3,850 / shift deficit',
      workersNeeded: 4,
      workerAction: 'Deploy 4 Auxiliary Technicians on Line 4 to compensate throughput',
      workerCost: '$1,200 / shift',
      damageAverted: '+$45,000 stator coil & mold burnout averted',
      netBenefit: '+$39,950 net shift protection',
      checked: true,
      executed: false
    },
    {
      id: 'rec-2',
      title: 'Activate Secondary Chiller Unit B',
      desc: 'Forces rapid coolant circulation through hydraulic oil reservoirs.',
      impact: '❄ Cools Machine 2 & 3 manifolds by 14°C',
      productionLoss: '-3.5% auxiliary loop draw',
      revenueLoss: '-$480 / shift coolant & power cost',
      workersNeeded: 1,
      workerAction: 'Assign 1 HVAC maintenance technician to monitor Glycol loop pressure',
      workerCost: '$300 / shift',
      damageAverted: '+$18,000 manifold seal blowout averted',
      netBenefit: '+$17,220 net protection',
      checked: true,
      executed: false
    },
    {
      id: 'rec-3',
      title: 'Move Work to Robot 4',
      desc: 'Shifts heavy work to cool robotic line to stop carbon and heat buildup.',
      impact: '🌍 Prevents 8.4 kg CO₂ spike',
      productionLoss: '-2.5% transfer delay',
      revenueLoss: '-$380 transfer cost',
      workersNeeded: 2,
      workerAction: '2 floor operators to route parts to Robot 4',
      workerCost: '$450 / shift',
      damageAverted: '+$12,500 machine stoppage averted',
      netBenefit: '+$11,670 net savings',
      checked: true,
      executed: false
    },
    {
      id: 'rec-4',
      title: 'Turn On Eco Power-Saving Mode',
      desc: 'Optimizes motor power to stop wasting idle electricity.',
      impact: '⚡ Cuts idle power draw by 12%',
      productionLoss: '-1.5% tempo calibration',
      revenueLoss: '-$160 calibration cost',
      workersNeeded: 1,
      workerAction: '1 electrician to switch motors to eco mode',
      workerCost: '$250 / shift',
      damageAverted: '+$6,400 power penalty avoided',
      netBenefit: '+$5,990 net savings',
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
  },
  audioEnabled: false,
  voiceAlertsEnabled: true,
  microgrid: {
    solarKw: 8.6,
    efficiency: 92.4,
    soc: 76.0,
    capacity: 60.0,
    currentKwh: 45.6,
    flowKw: -2.8,
    mode: 'auto_peak_shaving',
    avoidedCo2: 18.4,
    trees: 7.2
  },
  simulation: {
    factoryLoad: 100,
    renewableMix: 40,
    tempOffset: 0,
    ecoPulse: true,
    chillerPrecool: false,
    activePreset: 'benchmark',
    projectedPower: 14.8,
    projectedCarbon: 7.4,
    shiftCarbon: 29.6,
    stressIndex: 38,
    esgRating: 'A+',
    shiftCost: 21.31,
    taxSaved: 1.20
  },
  workOrders: [
    {
      id: 'WO-2026-0894',
      machineId: 3,
      machineName: 'Machine 3 (Injection Molder)',
      bay: 'Bay 2 - Section C',
      priority: 'Critical',
      status: 'Dispatched',
      issue: 'Spindle thermal runaway (89°C) & primary cooling fluid breakdown.',
      parts: ['SKF 6205-2RS Bearing', 'Glycol Chiller Filter', 'Coolant 50/50 Mix'],
      technician: 'Marcus Vance (Shift Lead)',
      lotoRequired: true,
      createdAt: '10 mins ago'
    },
    {
      id: 'WO-2026-0889',
      machineId: 2,
      machineName: 'Machine 2 (Hydraulic Press)',
      bay: 'Bay 1 - Section B',
      priority: 'High',
      status: 'In Progress',
      issue: '142 Hz harmonic vibration detected; proportional valve spool cavitation.',
      parts: ['Valve Seal Kit #402', 'ISO-VG 46 Hydraulic Oil'],
      technician: 'Elena Rostova (Hydraulics Spec)',
      lotoRequired: true,
      createdAt: '1 hour ago'
    }
  ],
  activeInspectorMachineId: null,
  fftAnimationId: null
};

// ==================== LOCAL PERSISTENCE HELPERS ====================
const MACHINE_STORAGE_KEY = 'ecosync_factory_fleet_state_v1';

function loadPersistedMachines() {
  try {
    const raw = localStorage.getItem(MACHINE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 5) {
        state.machines = parsed;
      }
    }
  } catch (e) {
    console.warn('Unable to read machines from localStorage:', e);
  }
}

function persistMachines() {
  try {
    localStorage.setItem(MACHINE_STORAGE_KEY, JSON.stringify(state.machines));
  } catch (e) {
    console.warn('Unable to save machines to localStorage:', e);
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadPersistedMachines();
  initLogin();
  initNavigation();
  initCharts();
  renderPredictions();
  renderRecommendations();
  renderEffectPreview();
  renderAlerts();
  initActions();
  initManpowerModal();
  initChatBot();
  initAudioSystem();
  initMicrogrid();
  initFloorMap();
  initMachineInspector();
  initSimulationStudio();
  initWorkOrders();
  initAdminFleet();
  syncFloorMapWithMachines();
  syncMachineCardsWithMachines();
  renderAdminMachineTable();
  updateAdminKpiMetrics();
  updateDigitalTwinDisplay();
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
    'simulation': 'What-If Simulation Studio',
    'analytics': 'Factory Analytics',
    'alerts': 'Alert Center',
    'reports': 'Factory Reports & Compliance',
    'admin': 'Factory Administration & Fleet Scaling'
  };
  if (pageTitle) pageTitle.textContent = titleMap[targetPage] || 'Dashboard';

  if (targetPage === 'admin') {
    renderAdminMachineTable();
    updateAdminKpiMetrics();
  }

  if (targetPage === 'digital-twin') {
    syncFloorMapWithMachines();
    syncMachineCardsWithMachines();
    updateDigitalTwinDisplay();
  }

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
  initSimulationChart();
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

// ==================== DYNAMIC INCIDENT ROTATION ENGINE ====================
// Guarantees that every time an incident occurs or is triggered, a DIFFERENT machine is selected
function triggerNextMachineIncident(forcedMachineId = null) {
  const eligible = state.machines.filter(m => m.status !== 'offline');
  if (eligible.length === 0) return null;

  // Track incident history so we never repeat the same machine back-to-back
  const lastId = state.incidentHistory && state.incidentHistory.length > 0 
    ? state.incidentHistory[state.incidentHistory.length - 1] 
    : null;
    
  let candidates = eligible.filter(m => m.id !== lastId);
  if (candidates.length === 0) candidates = eligible;

  let chosen = null;
  if (forcedMachineId !== null) {
    chosen = state.machines.find(m => m.id === forcedMachineId);
  }
  if (!chosen) {
    const randIdx = Math.floor(Math.random() * candidates.length);
    chosen = candidates[randIdx];
  }

  if (!state.incidentHistory) state.incidentHistory = [];
  state.incidentHistory.push(chosen.id);
  if (state.incidentHistory.length > 10) state.incidentHistory.shift();

  // Reset other operational machines to safe nominal values so focus stays clear
  state.machines.forEach(m => {
    if (m.id !== chosen.id && m.status !== 'offline') {
      m.temp = 40 + Math.floor(Math.random() * 4);
      m.load = 62 + Math.floor(Math.random() * 6);
      m.vibr = 'Normal';
      m.status = 'online';
    }
  });

  // Rotate between distinct industrial anomaly profiles
  const profiles = ['thermal', 'vibration', 'hydraulic', 'stator'];
  const profile = profiles[Math.floor(Math.random() * profiles.length)];

  if (profile === 'thermal') {
    chosen.temp = 88 + Math.floor(Math.random() * 5); // 88 - 92 °C
    chosen.load = 96 + Math.floor(Math.random() * 4); // 96 - 99 %
    chosen.vibr = 'Critical';
    chosen.status = 'danger';
    state.activeAnomaly = {
      machineId: chosen.id,
      machineName: chosen.name,
      machineType: chosen.type,
      bay: chosen.bay,
      type: 'thermal',
      title: `${chosen.name} Critical Overheating Alert (${chosen.temp}°C)`,
      desc: `Rapid spindle heat velocity (+2.4°C/min) on ${chosen.type} predicts thermal coil trip within 4.5 minutes.`,
      targetTemp: 44,
      targetLoad: 68
    };
  } else if (profile === 'vibration') {
    chosen.temp = 78 + Math.floor(Math.random() * 4);
    chosen.load = 92 + Math.floor(Math.random() * 5);
    chosen.vibr = 'High';
    chosen.status = 'warning';
    state.activeAnomaly = {
      machineId: chosen.id,
      machineName: chosen.name,
      machineType: chosen.type,
      bay: chosen.bay,
      type: 'vibration',
      title: `${chosen.name} 142 Hz Harmonic Flutter Anomaly`,
      desc: `Resonant vibration harmonics on ${chosen.type}. Proportional valve micro-cavitation risk.`,
      targetTemp: 42,
      targetLoad: 72
    };
  } else if (profile === 'hydraulic') {
    chosen.temp = 83 + Math.floor(Math.random() * 4);
    chosen.load = 94 + Math.floor(Math.random() * 4);
    chosen.vibr = 'High';
    chosen.status = 'warning';
    state.activeAnomaly = {
      machineId: chosen.id,
      machineName: chosen.name,
      machineType: chosen.type,
      bay: chosen.bay,
      type: 'hydraulic',
      title: `${chosen.name} Hydraulic Pressure Surge (240 bar)`,
      desc: `Hydraulic pressure spike on ${chosen.type} exceeds 240 bar safety bypass threshold.`,
      targetTemp: 45,
      targetLoad: 70
    };
  } else {
    chosen.temp = 86 + Math.floor(Math.random() * 4);
    chosen.load = 97;
    chosen.vibr = 'Critical';
    chosen.status = 'danger';
    state.activeAnomaly = {
      machineId: chosen.id,
      machineName: chosen.name,
      machineType: chosen.type,
      bay: chosen.bay,
      type: 'stator',
      title: `${chosen.name} Stator Coil Overcurrent Surge`,
      desc: `Motor phase current imbalance on ${chosen.type}. Stator insulation breakdown threat.`,
      targetTemp: 42,
      targetLoad: 65
    };
  }

  // Elevate telemetry power draw
  state.telemetry.power = +(18.2 + Math.random() * 2).toFixed(1);
  state.telemetry.carbon = +(state.telemetry.power * 0.82).toFixed(1);

  // Add real-time intimation alert
  state.alerts.unshift({
    id: Date.now(),
    type: chosen.status === 'danger' ? 'critical' : 'warning',
    title: state.activeAnomaly.title,
    msg: state.activeAnomaly.desc,
    time: 'Just now'
  });
  if (state.alerts.length > 8) state.alerts = state.alerts.slice(0, 8);

  // Re-synchronize display
  persistMachines();
  syncFloorMapWithMachines();
  syncMachineCardsWithMachines();
  updateDigitalTwinDisplay();
  updateSituationalIntelligence();
  renderAlerts();

  showToast(`⚠️ Anomaly Rotated: ${chosen.name} (${chosen.type}) in ${chosen.bay} requires optimization review!`, 'warning');
  playIndustrialTone('alert');
  speakAlert(`Anomaly detected on ${chosen.name}. Effect preview and recommendations updated.`);

  fetch('/api/simulate/next-incident', { method: 'POST' }).catch(() => {});

  return chosen;
}

window.triggerNextMachineIncident = triggerNextMachineIncident;

// ==================== SITUATION-AWARE INTELLIGENCE ENGINE ====================
function computeSituationalRecommendations() {
  // Dynamically detect which machine has an active hazard/strain
  let pMachine = state.machines.find(m => m.status === 'danger' || m.temp > 72);
  let sMachine = state.machines.find(m => m !== pMachine && (m.status === 'warning' || m.vibr === 'High' || m.vibr === 'Critical' || m.load >= 88));

  if (!pMachine && state.activeAnomaly) {
    pMachine = state.machines.find(m => m.id === state.activeAnomaly.machineId);
  }
  if (!pMachine && !sMachine) {
    pMachine = state.machines.find(m => m.id === 3) || state.machines[0];
  }

  const pName = pMachine ? pMachine.name : 'Machine 3';
  const pId = pMachine ? pMachine.id : 3;
  const pType = pMachine ? pMachine.type : 'Injection Molder';
  const pBay = pMachine ? pMachine.bay : `Bay ${pId}`;
  const pTemp = pMachine ? pMachine.temp : 89;
  const pLoad = pMachine ? pMachine.load : 98;

  const sName = sMachine ? sMachine.name : (pId === 2 ? 'Machine 1' : 'Machine 2');
  const sId = sMachine ? sMachine.id : (pId === 2 ? 1 : 2);
  const sType = sMachine ? sMachine.type : 'Auxiliary Unit';
  const sLoad = sMachine ? sMachine.load : 92;

  const t = state.telemetry;
  const manpower = state.manpower || { auxiliaryDeployed: 0 };

  const isMitigated = Boolean(pMachine && pMachine.temp <= 70 && pMachine.status === 'online' && pMachine.load <= 76);
  const isOverheat = (!isMitigated) && ((pMachine && pMachine.temp > 70) || t.temp > 50);
  const isCarbonSpike = (t.carbon > 22.0 || t.co2 > 520 || t.power > 20.0);
  const isStrain = Boolean(sMachine && (sMachine.vibr === 'High' || sMachine.vibr === 'Critical' || sMachine.load >= 88));
  const isThrottledDeficit = isMitigated && (manpower.auxiliaryDeployed === 0);
  const isNominal = !isOverheat && !isCarbonSpike && !isStrain;

  const recs = [];

  // Situation 1: Critical Overheat / Problem Machine
  if (isOverheat) {
    recs.push({
      id: `rec-throttle-${pId}`,
      targetMachineId: pId,
      targetMachineName: pName,
      title: `Throttle ${pName} Speed by 25% (Target: 44°C)`,
      desc: `Reduces mechanical friction and arrests thermal escalation on ${pName} (${pType} in ${pBay}) currently at ${pTemp}°C.`,
      impact: `⚡ Halts ${pName} thermal trip & saves 3.8 kWh`,
      beforeEffect: `${pName} at ${pTemp}°C / ${pLoad}% Load • Imminent Trip in 4.5 mins`,
      afterEffect: `Cool to 44°C • Load to 68% • Stator Coil Protected`,
      productionLoss: '-18.4% throughput (~160 units/hr drop)',
      revenueLoss: '-$3,850 / shift deficit',
      workersNeeded: 4,
      workerAction: `Deploy 4 Auxiliary Technicians on ${pBay} to compensate throughput`,
      workerCost: '$1,200 / shift',
      damageAverted: '+$45,000 catastrophic stator burnout averted',
      netBenefit: '+$39,950 net shift protection',
      checked: true,
      executed: false
    });
    recs.push({
      id: `rec-chiller-${pId}`,
      targetMachineId: pId,
      targetMachineName: pName,
      title: `Engage Secondary Glycol Chiller for ${pName}`,
      desc: `Forces active 8°C heat exchange fluid through ${pType} manifolds to purge core heat.`,
      impact: '❄ Drops operating temp by ~14°C within 5 mins',
      beforeEffect: `Heat escalating at +2.4°C/min on ${pName} core`,
      afterEffect: `Secondary Loop 3 fluid cools core by -14°C rapidly`,
      productionLoss: '-3.5% auxiliary thermal draw',
      revenueLoss: '-$480 / shift coolant & power cost',
      workersNeeded: 1,
      workerAction: 'Assign 1 HVAC maintenance technician to monitor Glycol loop pressure',
      workerCost: '$300 / shift',
      damageAverted: '+$18,000 manifold seal blowout averted',
      netBenefit: '+$17,220 net protection',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-manpower-overheat',
      targetMachineId: pId,
      targetMachineName: pName,
      title: `Deploy Auxiliary Floor Technicians (+4 on ${pBay})`,
      desc: `Offsets the -18.4% throughput loss from ${pName} throttling to safeguard shift revenue ($24,000 target).`,
      impact: '👥 Restores line throughput to 100%',
      beforeEffect: `-18.4% throughput deficit ➔ -$3,850 shift revenue deficit`,
      afterEffect: `+4 Technicians deployed ➔ 0% Deficit ($24,000 quota secured)`,
      productionLoss: '0.0% (Compensates for -18.4% deficit)',
      revenueLoss: '$0 (Secures $24,000 daily quota)',
      workersNeeded: 4,
      workerAction: 'Execute manual buffer transfer & finishing line pacing',
      workerCost: '$1,200 / shift',
      damageAverted: '+$24,000 full shift revenue commitment secured',
      netBenefit: '+$22,800 net revenue retained',
      checked: true,
      executed: false
    });
  } else if (isMitigated) {
    recs.push({
      id: `rec-throttle-${pId}`,
      targetMachineId: pId,
      targetMachineName: pName,
      title: `${pName} Safety Throttle Active (Load: 68%)`,
      desc: `Operating load held at safe cadence to sustain thermal safety margin at ${pTemp}°C.`,
      impact: '✔ Thermal trip averted & coil preserved',
      beforeEffect: `${pName} stabilized at ${pTemp}°C`,
      afterEffect: `Safe thermal envelope maintained`,
      productionLoss: '-18.4% without auxiliary workforce',
      revenueLoss: '-$3,850 if uncompensated',
      workersNeeded: 4,
      workerAction: 'Maintain auxiliary workforce until full batch cooldown',
      workerCost: '$1,200 / shift',
      damageAverted: '+$45,000 equipment damage prevented',
      netBenefit: '+$39,950 net savings',
      checked: true,
      executed: true
    });
  }

  // Situation 2: Carbon Surge / High Power Draw (Brief & Simple)
  if (isCarbonSpike) {
    recs.push({
      id: 'rec-scrubber',
      title: 'Turn On Carbon Scrubber Filter',
      desc: 'Filters stack exhaust to immediately cut factory smoke and emissions.',
      impact: '🌍 Cuts carbon emissions by 35%',
      beforeEffect: `Emissions at ${t.carbon} kg CO₂ / ${t.power} kWh • Daily Cap Hazard`,
      afterEffect: `Direct stack CO₂ cut by 35% (-8.4 kg) • Clean air exhaust`,
      productionLoss: '-2.0% exhaust fan draw',
      revenueLoss: '-$200 / shift filter cost',
      workersNeeded: 1,
      workerAction: 'Assign 1 operator to inspect scrubber filter cartridge',
      workerCost: '$250 / shift',
      damageAverted: '+$14,500 pollution fine avoided',
      netBenefit: '+$14,050 clean savings',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-bess-peak',
      title: 'Switch to Clean Solar Battery Power',
      desc: `Draws ${Math.min(9.5, +(t.power * 0.35).toFixed(1))} kWh of clean solar power to bypass dirty grid energy.`,
      impact: '⚡ Saves $420 in peak power surge tariffs',
      beforeEffect: `Grid peak tariff costing +$420 / hour`,
      afterEffect: `Power shifted to clean stored solar • $0 grid surcharge`,
      productionLoss: '0% impact on production',
      revenueLoss: '-$180 battery maintenance',
      workersNeeded: 1,
      workerAction: 'Assign 1 technician to switch power feed to solar battery',
      workerCost: '$280 / shift',
      damageAverted: '+$4,800 grid surge penalty avoided',
      netBenefit: '+$4,340 net cost reduction',
      checked: true,
      executed: false
    });
  }

  // Situation 3: Mechanical Strain / Vibration
  if (isStrain) {
    recs.push({
      id: `rec-damp-${sId}`,
      targetMachineId: sId,
      targetMachineName: sName,
      title: `Relieve Mechanical Stress on ${sName} (Cadence: 75%)`,
      desc: `Dampens resonant harmonic oscillation and relieves valve manifold stress on ${sName} (${sType}).`,
      impact: `🛡 Prevents catastrophic ${sName} pump rupture`,
      beforeEffect: `${sName} fluttering at 142 Hz (Load: ${sLoad}%)`,
      afterEffect: `Vibration dampened to Normal • Cadence to 75%`,
      productionLoss: '-8.0% stamping cycle tempo',
      revenueLoss: '-$1,450 / shift throughput delay',
      workersNeeded: 2,
      workerAction: `Assign 2 Tooling Technicians to oversee ${sName} calibration`,
      workerCost: '$550 / shift',
      damageAverted: '+$28,000 cylinder blow-out & die cracking averted',
      netBenefit: '+$26,000 net protection',
      checked: true,
      executed: false
    });
    recs.push({
      id: `rec-balance-${sId}`,
      targetMachineId: sId,
      targetMachineName: sName,
      title: `Shift Workload from ${sName} to Alternate Line Cells`,
      desc: `Diverts heavy processing queue to balanced automated cells to unload ${sName}.`,
      impact: '⚖ Balances line load & reduces cycle strain by 32%',
      beforeEffect: `${sName} overloaded at ${sLoad}% load queue`,
      afterEffect: `Rebalanced to 68% • Workload shared seamlessly`,
      productionLoss: '-2.5% during staging transfer',
      revenueLoss: '-$380 staging handling',
      workersNeeded: 2,
      workerAction: 'Deploy 2 Material Logistics Handlers to re-route blank pallet feeds',
      workerCost: '$450 / shift',
      damageAverted: '+$12,500 assembly stoppage averted',
      netBenefit: '+$11,670 net savings',
      checked: true,
      executed: false
    });
  }

  // Situation 4: Capacity Deficit & Revenue Protection
  if (isThrottledDeficit) {
    recs.push({
      id: 'rec-manpower-quota',
      title: `Authorize Floor Technicians (+4) for ${pName} Line Buffer`,
      desc: `Compensates for the 18.4% capacity deficit caused by ${pName} thermal protection.`,
      impact: '💰 Fully preserves $24,000 daily shift revenue quota',
      beforeEffect: `Capacity deficit of -18.4% ($3,850 shift risk)`,
      afterEffect: `100% capacity restored ($24k revenue secured)`,
      productionLoss: '0.0% (Deficit fully mitigated)',
      revenueLoss: '$0 deficit ($24k quota achieved)',
      workersNeeded: 4,
      workerAction: 'Immediate manual buffer transfer & line pacing',
      workerCost: '$1,200 / shift',
      damageAverted: '+$24,000 shift revenue preserved',
      netBenefit: '+$22,800 net revenue',
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
      beforeEffect: `Baseline calibration interval reached (48h elapsed)`,
      afterEffect: `Drift zeroed to ±0.2°C • High IoT telemetry fidelity`,
      productionLoss: '0.0% (Zero downtime calibration)',
      revenueLoss: '$0 / shift',
      workersNeeded: 1,
      workerAction: '1 QA Instrumentation Specialist for automated IoT verification',
      workerCost: '$250 / shift',
      damageAverted: '+$5,200 false alert stoppage averted',
      netBenefit: '+$4,950 optimization',
      checked: true,
      executed: false
    });
    recs.push({
      id: 'rec-esg-credit',
      title: 'Bank Clean Energy Surplus (4.2 kg CO₂) to Corporate ESG Ledger',
      desc: 'Audit logs verified 4.2 kg CO₂ emission surplus under statutory compliance cap.',
      impact: '🌿 Validates AAA Corporate ESG Sustainability Rating',
      beforeEffect: `Verified 4.2 kg CO₂ emission headroom available`,
      afterEffect: `Cryptographically signed ESG green certificate logged`,
      productionLoss: '0.0% production impact',
      revenueLoss: '$0 / shift',
      workersNeeded: 1,
      workerAction: '1 Sustainability Auditor to confirm digital green certificate',
      workerCost: '$200 / shift',
      damageAverted: '+$3,500 carbon tax audit penalty avoided',
      netBenefit: '+$3,300 corporate credit',
      checked: true,
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
  renderEffectPreview();
}

// ==================== LIVE DYNAMIC INTIMATIONS ENGINE ====================
let lastIntimationState = '';
function updateLiveIntimations() {
  const pMachine = state.machines.find(m => m.status === 'danger' || m.temp > 72) || state.machines[0];
  const sMachine = state.machines.find(m => m !== pMachine && (m.status === 'warning' || m.vibr === 'High'));
  const t = state.telemetry;
  const isMitigated = Boolean(pMachine && pMachine.temp <= 70 && pMachine.status === 'online');
  const now = 'Just now';

  let currentKey = '';
  if (!isMitigated && pMachine.temp > 75) {
    currentKey = `overheat-${pMachine.id}-${Math.floor(pMachine.temp / 5)}`;
  } else if (t.co2 > 520 || t.carbon > 22) {
    currentKey = `carbon-${Math.floor(t.co2 / 50)}`;
  } else if (sMachine && sMachine.vibr === 'High') {
    currentKey = `vibr-${sMachine.id}`;
  } else if (isMitigated && state.manpower?.auxiliaryDeployed > 0) {
    currentKey = 'manpower-active';
  } else if (isMitigated) {
    currentKey = 'mitigated-pending';
  } else {
    currentKey = 'nominal';
  }

  if (currentKey !== lastIntimationState) {
    lastIntimationState = currentKey;

    if (!isMitigated && pMachine.temp > 75) {
      state.alerts.unshift({
        id: Date.now(),
        type: 'critical',
        title: `${pMachine.name} Thermal Surge Intimation (${pMachine.temp}°C)`,
        msg: `Thermal velocity (+2.4°C/min) on ${pMachine.type}. Friction dissipation exceeds safety envelope. AI throttle recommended immediately.`,
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
    } else if (sMachine && sMachine.vibr === 'High') {
      state.alerts.unshift({
        id: Date.now(),
        type: 'warning',
        title: `${sMachine.name} Acoustic Cavitation Intimation`,
        msg: `Acoustic FFT registered 142 Hz harmonic vibration spike on ${sMachine.type}. Valve fatigue and cavitation risk.`,
        time: now
      });
    } else if (isMitigated && state.manpower?.auxiliaryDeployed > 0) {
      state.alerts.unshift({
        id: Date.now(),
        type: 'info',
        title: 'Workforce Quota Intimation',
        msg: `+4 Technicians deployed on ${pMachine.bay}. Capacity deficit compensated and $24,000 revenue quota secured.`,
        time: now
      });
    } else if (isMitigated) {
      state.alerts.unshift({
        id: Date.now(),
        type: 'warning',
        title: 'Production Deficit Intimation (-18.4%)',
        msg: `${pMachine.name} throttled for thermal safety. Auxiliary manpower required to prevent -$3,850/shift revenue loss.`,
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

// ==================== UPFRONT EFFECT PREVIEW (SHOWN IN FRONT) ====================
function renderEffectPreview() {
  const container = document.getElementById('rec-effect-preview');
  if (!container) return;

  const pMachine = state.machines.find(m => m.status === 'danger' || m.temp > 70) 
    || state.machines.find(m => m.status === 'warning') 
    || state.machines[0];

  const allExecuted = state.recommendations.length > 0 && state.recommendations.every(r => r.executed);

  if (allExecuted) {
    container.className = 'rec-effect-preview-card executed';
    container.innerHTML = `
      <div class="preview-header">
        <div class="preview-header-title">
          <span>✅ LIVE EFFECT APPLIED TO FACTORY FLOOR</span>
        </div>
        <span class="preview-badge-status applied">Optimizations Active ✔</span>
      </div>
      <div class="preview-comparison-grid">
        <div class="preview-col col-after" style="grid-column: 1 / -1;">
          <div class="col-tag">🟢 Current Factory Status (Optimized & Protected)</div>
          <div class="preview-metric-row">
            <span class="pm-label">Target Machinery:</span>
            <span class="pm-val success">${pMachine.name} (${pMachine.type} in ${pMachine.bay})</span>
          </div>
          <div class="preview-metric-row">
            <span class="pm-label">Operating Temperature:</span>
            <span class="pm-val success">${pMachine.temp}°C (Cooled & Stabilized in Safe Zone)</span>
          </div>
          <div class="preview-metric-row">
            <span class="pm-label">Operating Load & Cadence:</span>
            <span class="pm-val success">${pMachine.load}% (Thermal Margin Sustained)</span>
          </div>
          <div class="preview-metric-row">
            <span class="pm-label">Workforce Deficit Offset:</span>
            <span class="pm-val success">100% Fulfilled ($24,000 Daily Quota Preserved via Auxiliary Team)</span>
          </div>
          <div class="preview-metric-row">
            <span class="pm-label">Catastrophic Damage Averted:</span>
            <span class="pm-val success">+$45,000 Equipment Failure Prevented</span>
          </div>
          <div class="preview-metric-row">
            <span class="pm-label">Clean Energy Draw:</span>
            <span class="pm-val success">⚡ Power reduced to ${state.telemetry.power} kWh • ESG Compliant</span>
          </div>
        </div>
      </div>
    `;
    return;
  }

  container.className = 'rec-effect-preview-card';
  container.innerHTML = `
    <div class="preview-header">
      <div class="preview-header-title">
        <span>🔍 LIVE EFFECT PREVIEW (Review Impact Before Proceeding)</span>
      </div>
      <span class="preview-badge-status pending">Review Before Proceeding</span>
    </div>
    <div class="preview-comparison-grid">
      <div class="preview-col col-before">
        <div class="col-tag">🔴 Current Live State (Before Proceeding)</div>
        <div class="preview-metric-row">
          <span class="pm-label">Problem Machine:</span>
          <span class="pm-val danger">${pMachine.name} (${pMachine.type})</span>
        </div>
        <div class="preview-metric-row">
          <span class="pm-label">Live Core Temp:</span>
          <span class="pm-val danger">${pMachine.temp}°C (Trip Hazard in 4.5 mins)</span>
        </div>
        <div class="preview-metric-row">
          <span class="pm-label">Operating Load:</span>
          <span class="pm-val danger">${pMachine.load}% (Severe Thermal Friction)</span>
        </div>
        <div class="preview-metric-row">
          <span class="pm-label">Uncompensated Shift Deficit:</span>
          <span class="pm-val danger">-$3,850 / shift if unaddressed</span>
        </div>
        <div class="preview-metric-row">
          <span class="pm-label">Imminent Component Burnout:</span>
          <span class="pm-val danger">+$45,000 Stator Replacement Cost</span>
        </div>
      </div>

      <div class="preview-col col-after">
        <div class="col-tag">🟢 Predicted Effect (When You Click Proceed)</div>
        <div class="preview-metric-row">
          <span class="pm-label">Machine Cooldown:</span>
          <span class="pm-val success">${pMachine.name} Drops to 44°C (Safe)</span>
        </div>
        <div class="preview-metric-row">
          <span class="pm-label">Safe Load Cadence:</span>
          <span class="pm-val success">68% Load (Tripping Prevented)</span>
        </div>
        <div class="preview-metric-row">
          <span class="pm-label">Clean Power Optimization:</span>
          <span class="pm-val success">⚡ Power drops to 11.5 kWh (-37%)</span>
        </div>
        <div class="preview-metric-row">
          <span class="pm-label">Workforce Compensation:</span>
          <span class="pm-val success">+4 Auxiliary Workers ➔ $0 Deficit</span>
        </div>
        <div class="preview-metric-row">
          <span class="pm-label">Net Economic Protection:</span>
          <span class="pm-val success">+${'$'}39,950 Net Company Value</span>
        </div>
      </div>
    </div>
  `;
}

// ==================== RENDER RECOMMENDATIONS ====================
function renderRecommendations() {
  const container = document.getElementById('ai-recommendations');
  if (!container) return;

  renderEffectPreview(); // Keep the upfront preview synchronized

  container.innerHTML = state.recommendations.map(r => `
    <div class="rec-item ${r.executed ? 'executed' : ''}" id="rec-card-${r.id}">
      <input type="checkbox" class="rec-checkbox" data-id="${r.id}" ${r.checked ? 'checked' : ''} ${r.executed ? 'disabled' : ''}/>
      <div class="rec-content">
        <div class="rec-header-row">
          <div class="rec-title">${r.executed ? '✅ ' : ''}${r.title}</div>
          <div class="rec-badges">
            ${r.executed ? '<span class="rec-badge-tag executed-tag">Executed ✔</span>' : '<span class="rec-badge-tag pending-tag">Pending Review</span>'}
            ${r.workersNeeded ? `<span class="rec-badge-tag worker-tag">👷 +${r.workersNeeded} Workers</span>` : ''}
          </div>
        </div>
        <div class="rec-desc">${r.desc}</div>
        <div class="rec-impact">${r.impact}</div>

        <!-- Effect Shown In Front Before Clicking Proceed -->
        <div class="rec-effect-inline-row">
          <div class="rec-effect-inline-label">
            <span>⚡ Predicted Effect:</span>
          </div>
          <div class="rec-effect-inline-text">
            ${r.afterEffect || 'Cooldown to 44°C • Deficit Compensated • Stator Protected'}
          </div>
        </div>

        <!-- Economic & Workforce Loss Compensation Matrix -->
        <div class="rec-economic-matrix">
          <div class="econ-card econ-loss">
            <div class="econ-header">
              <span class="econ-icon">📉</span>
              <span class="econ-label">Loss Faced If Implemented:</span>
            </div>
            <div class="econ-val danger-text">${r.revenueLoss || '-$3,850 / shift'}</div>
            <div class="econ-sub">${r.productionLoss || '-18.4% capacity drop'}</div>
          </div>

          <div class="econ-card econ-workers">
            <div class="econ-header">
              <span class="econ-icon">👷</span>
              <span class="econ-label">Workers to Implement to Manage Loss:</span>
            </div>
            <div class="econ-val warning-text">+${r.workersNeeded || 4} Floor Technicians</div>
            <div class="econ-sub">${r.workerCost || '$1,200/shift'} • ${r.workerAction || 'Compensates throughput and fulfills daily quota'}</div>
          </div>

          <div class="econ-card econ-benefit">
            <div class="econ-header">
              <span class="econ-icon">🛡️</span>
              <span class="econ-label">Catastrophic Failure Averted:</span>
            </div>
            <div class="econ-val safe-text">${r.damageAverted || '+$45,000'}</div>
            <div class="econ-sub">Net Company Protection: <strong class="net-roi-strong">${r.netBenefit || '+$39,950'}</strong></div>
          </div>
        </div>

        ${!r.executed ? `
          <div class="rec-proceed-action-row">
            <button class="btn-proceed-single" onclick="window.proceedWithSingleRecommendation('${r.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Proceed With This Action</span>
            </button>
            <span class="worker-plan-hint">Review effect above before proceeding</span>
          </div>
        ` : `
          <div class="rec-proceed-action-row">
            <span class="rec-badge-tag executed-tag">✅ Live Effect Successfully Applied to Floor</span>
          </div>
        `}
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

// Global helper for single recommendation proceed
window.proceedWithSingleRecommendation = function(recId) {
  const rec = state.recommendations.find(r => r.id === recId);
  if (!rec) return;

  rec.executed = true;
  rec.checked = true;

  // Stabilize the specific target machine
  let target = null;
  if (rec.targetMachineId) {
    target = state.machines.find(m => m.id === rec.targetMachineId);
  }
  if (!target) {
    target = state.machines.find(m => m.status === 'danger' || m.status === 'warning' || m.temp > 70) || state.machines[0];
  }

  if (target) {
    target.temp = 42;
    target.load = 65;
    target.vibr = 'Normal';
    target.status = 'online';
  }

  if (rec.workersNeeded) {
    deployAuxiliaryManpower();
  }

  // Update telemetry
  state.telemetry.power = Math.max(11.5, +(state.telemetry.power - 3.2).toFixed(1));
  state.telemetry.carbon = +(state.telemetry.power * 0.82).toFixed(1);
  state.telemetry.remaining = +(state.telemetry.budget - state.telemetry.carbon).toFixed(1);

  renderRecommendations();
  renderEffectPreview();
  updateDigitalTwinDisplay();
  updateTelemetryDisplay();
  renderAdminMachineTable();
  updateAdminKpiMetrics();

  showToast(`✔ Proceeded with ${rec.title}! ${target ? target.name : 'Machinery'} stabilized at 42°C`, 'success');
  playIndustrialTone('success');
  speakAlert(`Optimization proceeded for ${target ? target.name : 'machine'}.`);

  persistMachines();
};

// Global helper for inline quick-deploy worker button inside recommendations
window.quickDeployWorkerForRec = function(recId) {
  const rec = state.recommendations.find(r => r.id === recId);
  const count = (rec && rec.workersNeeded) ? rec.workersNeeded : 4;
  deployAuxiliaryManpower();
  showToast(`Authorized & deployed +${count} Auxiliary Technicians for ${rec ? rec.title : 'Action'}. Line throughput fully compensated!`, 'success');
  playIndustrialTone('success');
  speakAlert(`Workforce compensation deployed. ${count} technicians assigned.`);
  renderRecommendations();
};

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
        ${(a.type === 'critical' || a.type === 'warning') ? `
          <button class="alert-resolve-btn" style="background: rgba(0, 240, 255, 0.15); color: #00f0ff; border-color: rgba(0, 240, 255, 0.35);" onclick="window.openWorkOrderModal && window.openWorkOrderModal()">📋 WO</button>
        ` : ''}
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

// ==================== PROCEED MECHANISM (INTERACTIVE ACTIONS) ====================
function executeApproveAllRecommendations() {
  const proceedBtn = document.getElementById('approve-all-btn');
  const btnText = document.getElementById('proceed-btn-text');
  if (proceedBtn) proceedBtn.classList.add('executing');
  if (btnText) btnText.textContent = 'Applying Optimizations to Factory Floor...';

  showLoading(true);

  return new Promise((resolve) => {
    setTimeout(() => {
      showLoading(false);
      if (proceedBtn) proceedBtn.classList.remove('executing');
      if (btnText) btnText.textContent = 'Proceed With Approved Optimizations';

      const executedIds = [];
      state.recommendations.forEach(r => {
        if (r.checked) {
          r.executed = true;
          executedIds.push(r.id);
        }
      });

      // Stabilize any machine currently in danger or warning
      const stabilized = [];
      state.machines.forEach(m => {
        if (m.status === 'danger' || m.status === 'warning' || m.temp > 65 || m.load > 85) {
          m.temp = 42;
          m.load = 65;
          m.vibr = 'Normal';
          m.status = 'online';
          stabilized.push(m.name);
        }
      });

      // Deploy auxiliary manpower to offset throughput deficit
      deployAuxiliaryManpower();

      // Lower power draw and emissions
      state.telemetry.power = 11.5;
      state.telemetry.carbon = +(11.5 * 0.82).toFixed(1);
      state.telemetry.remaining = +(state.telemetry.budget - state.telemetry.carbon).toFixed(1);

      // Re-render recommendations & effect preview
      renderRecommendations();
      renderEffectPreview();
      updateDigitalTwinDisplay();
      updateTelemetryDisplay();
      renderAdminMachineTable();
      updateAdminKpiMetrics();

      const machineList = stabilized.join(', ') || 'All machinery';
      showToast(`✔ Optimizations Executed: ${machineList} cooled & stabilized. Loss fully compensated!`, 'success');
      playIndustrialTone('success');
      speakAlert(`AI Optimizations proceeded. Machinery cooled and stabilized.`);

      // Persist state
      persistMachines();

      fetch('/api/approve-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_actions: executedIds })
      }).catch(() => {});

      resolve();

      // Automatically rotate to a DIFFERENT machine with a new problem after 9 seconds of stable operation!
      if (state.autoRotateIncidentTimer) clearTimeout(state.autoRotateIncidentTimer);
      state.autoRotateIncidentTimer = setTimeout(() => {
        if (state.isLoggedIn && !state.isPlantEStopped) {
          triggerNextMachineIncident();
        }
      }, 9000);

    }, 650);
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
  // Rotate to a different machine problem trigger
  const nextIncidentBtn = document.getElementById('btn-next-incident');
  if (nextIncidentBtn) {
    nextIncidentBtn.addEventListener('click', () => {
      triggerNextMachineIncident();
    });
  }

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

  // Global Emergency Stop Button (Topbar)
  const globalEstopBtn = document.getElementById('btn-global-estop');
  if (globalEstopBtn) {
    globalEstopBtn.addEventListener('click', () => {
      if (state.isPlantEStopped) {
        resetPlantWideEStop();
      } else {
        executePlantWideEStop();
      }
    });
  }
}

// ==================== PLANT-WIDE EMERGENCY SAFE STOP (E-STOP) ====================
function executePlantWideEStop() {
  state.isPlantEStopped = true;
  state.machines.forEach(m => {
    m.load = 0;
    m.status = 'offline';
    m.vibr = 'Off';
    m.temp = Math.min(m.temp, 28);
  });

  state.telemetry.power = 3.2;
  state.telemetry.carbon = +(3.2 * 0.82).toFixed(1);
  state.telemetry.remaining = +(state.telemetry.budget - state.telemetry.carbon).toFixed(1);

  updateTelemetryDisplay();
  updateDigitalTwinDisplay();
  syncFloorMapWithMachines();
  syncMachineCardsWithMachines();
  renderAdminMachineTable();
  updateAdminKpiMetrics();

  const estopBtn = document.getElementById('btn-global-estop');
  if (estopBtn) {
    estopBtn.classList.add('estop-active');
    estopBtn.title = 'Factory is in Emergency Stop. Click to Reset/Restore';
    estopBtn.innerHTML = '<span class="estop-icon">🔄</span><span class="estop-text">RESET E-STOP</span>';
  }

  const factoryStatusText = document.getElementById('factory-status-text') || document.querySelector('#factory-status span:last-child');
  const factoryStatusDot = document.querySelector('#factory-status .status-dot');
  if (factoryStatusText) factoryStatusText.textContent = '⛔ EMERGENCY STOP';
  if (factoryStatusDot) {
    factoryStatusDot.className = 'status-dot danger-pulse';
    factoryStatusDot.style.background = '#ef4444';
  }

  showToast('⛔ PLANT-WIDE EMERGENCY SAFE STOP EXECUTED: All machinery lines isolated & shut down!', 'danger');
  playIndustrialTone('alert');
  speakAlert('Plant-wide emergency stop activated. All machinery lines safely shut down.');

  // Notify backend to prevent polling revert
  fetch('/api/factory/estop', { method: 'POST' }).catch(() => {});
}

function resetPlantWideEStop() {
  state.isPlantEStopped = false;
  state.machines.forEach(m => {
    m.load = 65;
    m.status = 'online';
    m.vibr = 'Normal';
    m.temp = 42;
  });

  state.telemetry.power = 14.5;
  state.telemetry.carbon = +(14.5 * 0.82).toFixed(1);
  state.telemetry.remaining = +(state.telemetry.budget - state.telemetry.carbon).toFixed(1);

  updateTelemetryDisplay();
  updateDigitalTwinDisplay();
  syncFloorMapWithMachines();
  syncMachineCardsWithMachines();
  renderAdminMachineTable();
  updateAdminKpiMetrics();

  const estopBtn = document.getElementById('btn-global-estop');
  if (estopBtn) {
    estopBtn.classList.remove('estop-active');
    estopBtn.title = 'Plant-Wide Emergency Safe Stop (E-STOP)';
    estopBtn.innerHTML = '<span class="estop-icon">⛔</span><span class="estop-text">E-STOP</span>';
  }

  const factoryStatusText = document.getElementById('factory-status-text') || document.querySelector('#factory-status span:last-child');
  const factoryStatusDot = document.querySelector('#factory-status .status-dot');
  if (factoryStatusText) factoryStatusText.textContent = 'Factory Online';
  if (factoryStatusDot) {
    factoryStatusDot.className = 'status-dot pulse';
    factoryStatusDot.style.background = 'var(--accent-primary)';
  }

  showToast('✔ Factory Emergency Stop Reset: Machinery restored to nominal operating state.', 'success');
  playIndustrialTone('success');
  speakAlert('Emergency stop reset. Factory systems back online.');

  // Notify backend
  fetch('/api/factory/reset', { method: 'POST' }).catch(() => {});
}

window.executePlantWideEStop = executePlantWideEStop;
window.resetPlantWideEStop = resetPlantWideEStop;

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
  if (state.isPlantEStopped) {
    updateTelemetryDisplay();
    return;
  }

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
  if (state.isPlantEStopped) {
    updateTelemetryDisplay();
    return;
  }

  if (data.co2) state.telemetry.co2 = data.co2;
  if (data.temp) state.telemetry.temp = data.temp;
  if (data.humidity) state.telemetry.humidity = data.humidity;
  if (data.power) state.telemetry.power = data.power;
  if (data.carbon) state.telemetry.carbon = data.carbon;
  if (data.machines && Array.isArray(data.machines)) {
    data.machines.forEach(bm => {
      const local = state.machines.find(lm => lm.id === bm.id);
      if (local) {
        Object.assign(local, bm);
      } else {
        state.machines.push(bm);
      }
    });
    updateDigitalTwinDisplay();
  }
  if (data.microgrid) {
    Object.assign(state.microgrid, data.microgrid);
    updateMicrogridDisplay();
  }
  if (data.work_orders) {
    state.workOrders = data.work_orders;
    renderWorkOrdersTable();
  }
  if (data.predictions) {
    state.predictions = data.predictions;
    renderPredictions();
  }
  if (data.recommendations) {
    state.recommendations = data.recommendations;
    renderRecommendations();
    renderEffectPreview();
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
  syncFloorMapWithMachines();
  syncMachineCardsWithMachines();

  state.machines.forEach(m => {
    // 1. Traditional machine card
    const el = document.getElementById(`machine-${m.id}`);
    if (el) {
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
        statusText.textContent = m.status === 'online' ? '● Online' : m.status === 'warning' ? '⚠ Warning' : (m.status === 'danger' ? '🔴 Critical' : '⏸ Maintenance');
      }
      if (visual) {
        visual.className = 'machine-body';
        if (m.status === 'warning') visual.classList.add('warning-glow');
        if (m.status === 'danger') visual.classList.add('danger-glow');
      }
    }

    // 2. 2.5D Floor Map Pod
    const podEl = document.getElementById(`map-pod-${m.id}`);
    if (podEl) {
      podEl.className = `map-machine-pod ${m.status} ${m.status === 'danger' ? 'pulse-danger' : ''}`;
      const halo = podEl.querySelector('.pod-halo');
      if (halo) {
        halo.className = `pod-halo ${m.status}-halo`;
      }
      const badge = podEl.querySelector('.pod-badge-status');
      if (badge) {
        badge.className = `pod-badge-status ${m.status}-badge`;
        badge.textContent = m.status === 'online' ? '● Online' : m.status === 'warning' ? '⚠️ 142 Hz Flutter' : (m.status === 'danger' ? '🔴 Critical Overheat' : '⏸ Maintenance');
      }
      const mapTemp = document.getElementById(`map-m${m.id}-temp`);
      if (mapTemp) mapTemp.textContent = `${m.temp}°C`;
      const mapLoad = document.getElementById(`map-m${m.id}-load`);
      if (mapLoad) mapLoad.textContent = `${m.load}%`;
    }

    // 3. Update active inspector modal if open
    if (state.activeInspectorMachineId === m.id) {
      updateOpenMachineInspector(m);
    }
  });
}

// ==================== TOAST & OVERLAY HELPERS ====================
function showToast(msg, type = 'info') {
  if (type === 'success') playIndustrialTone('success');
  else if (type === 'danger') playIndustrialTone('alert');
  else playIndustrialTone('click');

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

    // Emergency Safe Stop (E-Stop)
    if (q.includes('stop') || q.includes('e-stop') || q.includes('estop') || q.includes('emergency shutdown') || q.includes('shut down all')) {
      executePlantWideEStop();
      return {
        reply: `⛔ **PLANT-WIDE EMERGENCY SAFE STOP (E-STOP) EXECUTED!**\n\nI have immediately triggered the emergency shutdown protocol:\n- All machinery drive loads set to **0%**.\n- Mechanical vibrations isolated (**Off**).\n- Equipment temperatures secured in cooling state.\n- Plant power draw dropped to auxiliary safety baseline (**3.2 kW**).\n\nFactory is safely locked in Emergency Stop standby.`,
        actions: [
          { label: '🔄 Reset & Restore Factory', action: 'reset_estop' },
          { label: '🏭 View Digital Twin', action: 'navigate_twin', secondary: true }
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
    case 'navigate_simulation':
      return [
        { label: '🧪 Open What-If Studio', action: 'navigate_simulation' },
        { label: '🏭 View Floor Map', action: 'open_floor_map', secondary: true }
      ];
    case 'inspect_machine_3':
      return [
        { label: '🔍 Inspect Machine 3 Diagnostics', action: 'inspect_machine_3' },
        { label: '⚡ Mitigate Now', action: 'approve_mitigation', secondary: true }
      ];
    case 'open_floor_map':
      return [{ label: '🏢 Open 2.5D Factory Floor Map', action: 'open_floor_map' }];
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
    case 'navigate_simulation':
      navigateToPage('simulation');
      break;
    case 'open_floor_map':
      navigateToPage('digital-twin');
      const btnMap = document.getElementById('btn-view-map');
      if (btnMap) btnMap.click();
      break;
    case 'inspect_machine_3':
      navigateToPage('digital-twin');
      openMachineInspector(3);
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
    case 'reset_estop':
      resetPlantWideEStop();
      appendChatMessage('bot', '✔ **Factory Restored!** All machine lines brought back online to nominal capacity baseline.', [
        { label: '🏭 View Digital Twin Floor', action: 'navigate_twin' }
      ]);
      scrollChatToBottom();
      break;
    case 'execute_estop':
      executePlantWideEStop();
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

// ===================================================================
// EXTENDED STANDOUT FEATURES IMPLEMENTATION
// 1. Audio Alarm Synthesizer & Speech Engine
// 2. Renewable Microgrid & BESS Energy Manager
// 3. 2.5D Interactive Factory Floor Map
// 4. Machine Diagnostic Inspector (Heatmap + FFT + RUL)
// 5. What-If Scenario Simulator & Carbon Sandbox
// 6. Maintenance Work Order & Dispatch System
// ===================================================================

// ==================== 1. AUDIO ALARM SYSTEM ====================
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playIndustrialTone(type = 'success') {
  if (!state.audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'success') {
      // High-tech confirmation double chime (880 Hz -> 1174 Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174.66, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'alert') {
      // Pulsing industrial alarm tone (540 Hz -> 420 Hz -> 540 Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.linearRampToValueAtTime(420, now + 0.15);
      osc.frequency.linearRampToValueAtTime(540, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'click') {
      // Subtle tactile blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

function speakAlert(text) {
  if (!state.audioEnabled || !state.voiceAlertsEnabled) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

function initAudioSystem() {
  const audioBtn = document.getElementById('audio-alert-btn');
  const audioPill = document.getElementById('audio-status-pill');
  const audioIcon = document.getElementById('audio-icon');
  if (!audioBtn) return;

  audioBtn.addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    if (state.audioEnabled) {
      getAudioContext();
      audioBtn.classList.add('active');
      audioBtn.title = 'Audio Alarm Alerts (Active)';
      if (audioPill) audioPill.textContent = 'ACTIVE';
      if (audioIcon) {
        audioIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
      }
      playIndustrialTone('success');
      showToast('Audio Alarm System Activated', 'success');
      speakAlert('EcoSync Audio Alert System Online');
    } else {
      audioBtn.classList.remove('active');
      audioBtn.title = 'Audio Alarm Alerts (Muted)';
      if (audioPill) audioPill.textContent = 'MUTED';
      if (audioIcon) {
        audioIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
      }
      showToast('Audio Alerts Muted', 'info');
    }
  });
}

// ==================== 2. RENEWABLE MICROGRID & BESS STORAGE ====================
function initMicrogrid() {
  const modeBtns = [
    { id: 'mode-peak-shaving', mode: 'auto_peak_shaving' },
    { id: 'mode-solar-priority', mode: 'solar_priority' },
    { id: 'mode-battery-reserve', mode: 'battery_reserve' }
  ];

  modeBtns.forEach(({ id, mode }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      setMicrogridMode(mode);
      playIndustrialTone('click');
    });
  });

  updateMicrogridDisplay();
}

function setMicrogridMode(mode) {
  state.microgrid.mode = mode;
  document.querySelectorAll('.microgrid-mode-btn').forEach(b => {
    if (b.dataset.mode === mode) b.classList.add('active');
    else b.classList.remove('active');
  });

  const flowLabel = document.getElementById('bess-flow-label');
  const flowRateEl = document.getElementById('bess-flow-rate');

  if (mode === 'auto_peak_shaving') {
    state.microgrid.flowKw = -2.8;
    if (flowLabel) flowLabel.textContent = 'Discharging to shave peak tariff';
    if (flowRateEl) flowRateEl.textContent = '-2.8 kW Active';
    showToast('Microgrid switched to Auto Peak Shaving', 'success');
  } else if (mode === 'solar_priority') {
    state.microgrid.flowKw = +1.2;
    if (flowLabel) flowLabel.textContent = 'Storing surplus solar power';
    if (flowRateEl) flowRateEl.textContent = '+1.2 kW Charging';
    showToast('Microgrid switched to Solar Priority (Battery Charging)', 'info');
  } else if (mode === 'battery_reserve') {
    state.microgrid.flowKw = 0.0;
    if (flowLabel) flowLabel.textContent = '100% Reserved for emergency backup';
    if (flowRateEl) flowRateEl.textContent = '0.0 kW Standby';
    showToast('BESS Locked in Emergency Reserve Mode', 'warning');
  }

  // Attempt backend sync if available
  fetch('/api/microgrid/mode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  }).catch(() => {});
}

function updateMicrogridDisplay() {
  const mg = state.microgrid;
  const solarKwEl = document.getElementById('solar-kw');
  const solarEffEl = document.getElementById('solar-efficiency');
  const solarMeter = document.getElementById('solar-meter');
  const bessSocEl = document.getElementById('bess-soc');
  const bessMeter = document.getElementById('bess-meter');
  const bessKwhEl = document.getElementById('bess-kwh');
  const offsetCo2El = document.getElementById('offset-co2');

  if (solarKwEl) solarKwEl.textContent = mg.solarKw.toFixed(1);
  if (solarEffEl) solarEffEl.textContent = `${mg.efficiency.toFixed(1)}% eff`;
  if (solarMeter) solarMeter.style.width = `${Math.min(100, Math.round((mg.solarKw / 12) * 100))}%`;
  if (bessSocEl) bessSocEl.textContent = mg.soc.toFixed(1);
  if (bessMeter) bessMeter.style.width = `${mg.soc}%`;
  if (bessKwhEl) bessKwhEl.textContent = `${mg.currentKwh.toFixed(1)} kWh`;
  if (offsetCo2El) offsetCo2El.textContent = mg.avoidedCo2.toFixed(1);
}

// ==================== 3. 2.5D INTERACTIVE FACTORY FLOOR MAP ====================
function initFloorMap() {
  const btnMap = document.getElementById('btn-view-map');
  const btnCards = document.getElementById('btn-view-cards');
  const mapContainer = document.getElementById('factory-floor-map-container');
  const cardsContainer = document.getElementById('factory-floor');

  if (btnMap && btnCards && mapContainer && cardsContainer) {
    btnMap.addEventListener('click', () => {
      btnMap.classList.add('active');
      btnCards.classList.remove('active');
      mapContainer.style.display = 'block';
      cardsContainer.style.display = 'none';
      playIndustrialTone('click');
    });

    btnCards.addEventListener('click', () => {
      btnCards.classList.add('active');
      btnMap.classList.remove('active');
      cardsContainer.style.display = 'grid';
      mapContainer.style.display = 'none';
      playIndustrialTone('click');
    });
  }

  // Attach click listeners on floor map pods
  document.querySelectorAll('.map-machine-pod').forEach(pod => {
    pod.addEventListener('click', (e) => {
      const machineId = parseInt(pod.dataset.machine, 10);
      if (machineId) {
        openMachineInspector(machineId);
        playIndustrialTone('click');
      }
    });
  });

  // Attach click listeners on "Diagnostics" buttons in machine cards
  document.querySelectorAll('.btn-inspect-machine').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const machineId = parseInt(btn.dataset.machine, 10);
      if (machineId) {
        openMachineInspector(machineId);
        playIndustrialTone('click');
      }
    });
  });
}

// ==================== 4. MACHINE DIAGNOSTIC INSPECTOR MODAL ====================
function initMachineInspector() {
  const closeBtn = document.getElementById('close-inspector-btn');
  const modal = document.getElementById('machine-inspector-modal');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMachineInspector);
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeMachineInspector();
    });
  }

  // Throttle Slider
  const throttleSlider = document.getElementById('inspect-throttle-slider');
  const throttleVal = document.getElementById('inspect-throttle-val');
  if (throttleSlider && throttleVal) {
    throttleSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      throttleVal.textContent = `${val}%`;
      const id = state.activeInspectorMachineId;
      if (id) {
        const m = state.machines.find(item => item.id === id);
        if (m) {
          m.load = parseInt(val, 10);
          updateDigitalTwinDisplay();
        }
      }
    });
  }

  // Chiller Button in Inspector
  const coolBtn = document.getElementById('btn-cool-machine');
  if (coolBtn) {
    coolBtn.addEventListener('click', () => {
      const id = state.activeInspectorMachineId;
      const m = state.machines.find(item => item.id === id);
      if (m) {
        m.temp = Math.max(45, m.temp - 21);
        m.status = 'online';
        m.vibr = 'Normal';
        
        const badgeEl = document.getElementById('inspect-status-badge');
        if (badgeEl) {
          badgeEl.className = 'status-badge online';
          badgeEl.textContent = '● Online (Cooled)';
        }
        updateOpenMachineInspector(m);
        updateDigitalTwinDisplay();
        syncFloorMapWithMachines();
        syncMachineCardsWithMachines();
        renderAdminMachineTable();
        updateAdminKpiMetrics();

        showToast(`${m.name} Secondary Chiller Engaged: Temperature dropped to ${m.temp}°C`, 'success');
        playIndustrialTone('success');

        fetch(`/api/machines/${m.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'online', temp: m.temp, vibr: 'Normal' })
        }).catch(() => {});
      }
    });
  }

  // E-Stop Button in Inspector
  const estopBtn = document.getElementById('btn-estop-machine');
  if (estopBtn) {
    estopBtn.addEventListener('click', () => {
      const id = state.activeInspectorMachineId;
      const m = state.machines.find(item => item.id === id);
      if (m) {
        m.load = 0;
        m.temp = 28;
        m.vibr = 'Off';
        m.status = 'offline';

        const badgeEl = document.getElementById('inspect-status-badge');
        if (badgeEl) {
          badgeEl.className = 'status-badge offline';
          badgeEl.textContent = '⏸ Emergency Stop (Isolated)';
        }
        const throttleSlider = document.getElementById('inspect-throttle-slider');
        const throttleVal = document.getElementById('inspect-throttle-val');
        if (throttleSlider) throttleSlider.value = 0;
        if (throttleVal) throttleVal.textContent = '0%';

        updateOpenMachineInspector(m);
        updateDigitalTwinDisplay();
        syncFloorMapWithMachines();
        syncMachineCardsWithMachines();
        renderAdminMachineTable();
        updateAdminKpiMetrics();

        showToast(`⛔ EMERGENCY SAFE STOP (E-STOP) EXECUTED ON ${m.name.toUpperCase()}!`, 'danger');
        playIndustrialTone('alert');
        speakAlert(`Emergency safe stop triggered on ${m.name}. Drive isolated.`);

        // Sync with backend immediately to prevent polling overwrite
        fetch(`/api/machines/${m.id}/estop`, { method: 'POST' }).catch(() => {});
        fetch(`/api/machines/${m.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'offline', load: 0, temp: 28, vibr: 'Off' })
        }).catch(() => {});
      }
    });
  }

  // Dispatch Work Order Button in Inspector
  const woBtn = document.getElementById('btn-dispatch-wo-machine');
  if (woBtn) {
    woBtn.addEventListener('click', () => {
      const id = state.activeInspectorMachineId || 3;
      closeMachineInspector();
      openWorkOrderModal(id);
    });
  }
}

function openMachineInspector(machineId) {
  state.activeInspectorMachineId = machineId;
  const m = state.machines.find(item => item.id === machineId) || state.machines[0];
  const modal = document.getElementById('machine-inspector-modal');
  if (!modal) return;

  const titleEl = document.getElementById('inspect-title');
  const bayEl = document.getElementById('inspect-bay');
  const serialEl = document.getElementById('inspect-serial');
  const badgeEl = document.getElementById('inspect-status-badge');
  const throttleSlider = document.getElementById('inspect-throttle-slider');
  const throttleVal = document.getElementById('inspect-throttle-val');

  const bayNames = {
    1: 'Bay 1 - Section A (Precision Machining)',
    2: 'Bay 1 - Section B (Heavy Forming)',
    3: 'Bay 2 - Section C (High-Pressure Injection)',
    4: 'Bay 3 - Section D (Robotic Line)',
    5: 'Bay 3 - Section E (Welding Bay)'
  };

  if (titleEl) titleEl.textContent = `${m.name} (${m.type})`;
  if (bayEl) bayEl.textContent = bayNames[m.id] || `Bay ${m.id}`;
  if (serialEl) serialEl.textContent = `SN-2026-0${m.id}-ECO • Model Series ${m.id * 100 + 42}`;

  if (badgeEl) {
    badgeEl.className = `status-badge ${m.status}`;
    badgeEl.textContent = m.status === 'online' ? '● Online (Nominal)' : m.status === 'warning' ? '⚠️ Warning (142 Hz Harmonic)' : (m.status === 'danger' ? '🔴 Critical Thermal Runaway' : '⏸ Maintenance');
  }

  if (throttleSlider && throttleVal) {
    throttleSlider.value = m.load;
    throttleVal.textContent = `${m.load}%`;
  }

  updateOpenMachineInspector(m);

  // Start FFT Spectrum Canvas animation
  const canvas = document.getElementById('fft-canvas');
  if (canvas) {
    startFFTVisualizer(canvas, machineId);
  }

  modal.style.display = 'flex';
}

function updateOpenMachineInspector(m) {
  const statorEl = document.getElementById('hz-stator-temp');
  const bearingEl = document.getElementById('hz-bearing-temp');
  const hydEl = document.getElementById('hz-hyd-temp');
  const chillerEl = document.getElementById('hz-chiller-temp');
  const rulCountdown = document.getElementById('rul-countdown');
  const rulVelocity = document.getElementById('rul-velocity');
  const rulHarmonic = document.getElementById('rul-harmonic');
  const fftPeakLabel = document.getElementById('fft-peak-label');

  const isHot = m.temp > 70;
  const stator = +(m.temp * 1.02).toFixed(1);
  const bearing = +(m.temp * (isHot ? 1.05 : 0.96)).toFixed(1);
  const hyd = +(m.temp * 0.92).toFixed(1);
  const chiller = isHot ? 32.4 : 26.5;

  if (statorEl) statorEl.textContent = `${stator}°C`;
  if (bearingEl) bearingEl.textContent = `${bearing}°C`;
  if (hydEl) hydEl.textContent = `${hyd}°C`;
  if (chillerEl) chillerEl.textContent = `${chiller}°C`;

  if (m.id === 3 && m.temp > 75) {
    if (rulCountdown) rulCountdown.textContent = '4.8 min';
    if (rulVelocity) rulVelocity.textContent = '+2.4°C / min';
    if (rulHarmonic) rulHarmonic.textContent = 'Broadband Bearing Noise';
    if (fftPeakLabel) fftPeakLabel.textContent = 'Peak: 380 Hz (Thermal Friction)';
  } else if (m.id === 2) {
    if (rulCountdown) rulCountdown.textContent = '2.4 hours';
    if (rulVelocity) rulVelocity.textContent = '+0.8°C / min';
    if (rulHarmonic) rulHarmonic.textContent = '142 Hz (Cavitation Flutter)';
    if (fftPeakLabel) fftPeakLabel.textContent = 'Peak: 142 Hz (Bearing Resonance)';
  } else {
    if (rulCountdown) rulCountdown.textContent = 'Nominal (>8,000h)';
    if (rulVelocity) rulVelocity.textContent = '0.0°C / min (Stable)';
    if (rulHarmonic) rulHarmonic.textContent = '60 Hz (Grid Baseline)';
    if (fftPeakLabel) fftPeakLabel.textContent = 'Peak: 60 Hz (Synchronous AC)';
  }
}

function closeMachineInspector() {
  const modal = document.getElementById('machine-inspector-modal');
  if (modal) modal.style.display = 'none';
  state.activeInspectorMachineId = null;
  if (state.fftAnimationId) {
    cancelAnimationFrame(state.fftAnimationId);
    state.fftAnimationId = null;
  }
}

function startFFTVisualizer(canvas, machineId) {
  if (state.fftAnimationId) {
    cancelAnimationFrame(state.fftAnimationId);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let phase = 0;
  const numBars = 42;

  function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / numBars;

    // Draw baseline grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.3);
    ctx.lineTo(canvas.width, canvas.height * 0.3);
    ctx.stroke();

    for (let i = 0; i < numBars; i++) {
      const freq = (i / numBars) * 500; // 0 to 500 Hz
      let amp = 0.15 + 0.08 * Math.sin(phase + i * 0.4);

      // Distinct Harmonic Peak at 142 Hz (around bar 12) for Machine 2
      if (machineId === 2 && Math.abs(freq - 142) < 25) {
        amp = 0.85 + 0.1 * Math.sin(phase * 2.5);
      }
      // Critical friction noise for Machine 3 (around bars 26 to 36)
      if (machineId === 3 && freq > 280 && freq < 440) {
        amp = 0.72 + 0.22 * Math.sin(phase * 4 + i);
      }

      const barHeight = amp * (canvas.height * 0.85);
      const x = i * barWidth;
      const y = canvas.height - barHeight;

      if (amp > 0.7) {
        ctx.fillStyle = '#ef4444';
      } else if (amp > 0.4) {
        ctx.fillStyle = '#f59e0b';
      } else {
        ctx.fillStyle = '#00d4aa';
      }

      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }

    phase += 0.08;
    if (state.activeInspectorMachineId) {
      state.fftAnimationId = requestAnimationFrame(renderFrame);
    }
  }

  renderFrame();
}

// ==================== 5. WHAT-IF SCENARIO SIMULATOR ====================
function initSimulationChart() {
  const ctx = document.getElementById('simulation-chart');
  if (!ctx) return;

  const sim = state.simulation;
  const hours = ['Start', '+2h', '+4h', '+6h', '+8h'];
  const hourlyRate = sim.projectedCarbon;
  const projectedData = hours.map((h, i) => +(hourlyRate * (i * 2)).toFixed(1));
  const budgetCapData = hours.map(() => 50.0);

  state.charts.simulation = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [
        {
          label: 'Projected Shift Carbon (kg CO₂)',
          data: projectedData,
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0, 212, 170, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 2
        },
        {
          label: 'Daily Budget Limit (50 kg)',
          data: budgetCapData,
          borderColor: '#ef4444',
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { size: 11 } }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b' }
        },
        y: {
          min: 0,
          max: 60,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b' }
        }
      }
    }
  });
}

function updateSimulationChart() {
  if (!state.charts.simulation) return;
  const sim = state.simulation;
  const hourlyRate = sim.projectedCarbon;
  const projectedData = ['Start', '+2h', '+4h', '+6h', '+8h'].map((h, i) => +(hourlyRate * (i * 2)).toFixed(1));

  const chart = state.charts.simulation;
  chart.data.datasets[0].data = projectedData;
  const isBreached = projectedData[projectedData.length - 1] > 50.0;
  chart.data.datasets[0].borderColor = isBreached ? '#ef4444' : '#00d4aa';
  chart.data.datasets[0].backgroundColor = isBreached ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 212, 170, 0.15)';
  chart.options.scales.y.max = Math.max(60, Math.ceil(projectedData[projectedData.length - 1] * 1.15));
  chart.update('none');
}

function initSimulationStudio() {
  const loadSlider = document.getElementById('sim-load');
  const renewSlider = document.getElementById('sim-renew');
  const tempSlider = document.getElementById('sim-temp-offset');
  const ecoPulseCheck = document.getElementById('sim-eco-pulse');
  const precoolCheck = document.getElementById('sim-chiller-precool');

  if (loadSlider) {
    loadSlider.addEventListener('input', (e) => {
      state.simulation.factoryLoad = parseInt(e.target.value, 10);
      const valEl = document.getElementById('sim-load-val');
      if (valEl) valEl.textContent = `${state.simulation.factoryLoad}%`;
      recomputeSimulation();
    });
  }

  if (renewSlider) {
    renewSlider.addEventListener('input', (e) => {
      state.simulation.renewableMix = parseInt(e.target.value, 10);
      const valEl = document.getElementById('sim-renew-val');
      if (valEl) valEl.textContent = `${state.simulation.renewableMix}%`;
      recomputeSimulation();
    });
  }

  if (tempSlider) {
    tempSlider.addEventListener('input', (e) => {
      state.simulation.tempOffset = parseInt(e.target.value, 10);
      const valEl = document.getElementById('sim-temp-offset-val');
      const sign = state.simulation.tempOffset > 0 ? '+' : '';
      if (valEl) valEl.textContent = `${sign}${state.simulation.tempOffset}°C`;
      recomputeSimulation();
    });
  }

  if (ecoPulseCheck) {
    ecoPulseCheck.addEventListener('change', (e) => {
      state.simulation.ecoPulse = e.target.checked;
      recomputeSimulation();
    });
  }

  if (precoolCheck) {
    precoolCheck.addEventListener('change', (e) => {
      state.simulation.chillerPrecool = e.target.checked;
      recomputeSimulation();
    });
  }

  // Presets
  const presets = [
    { id: 'preset-benchmark', preset: 'benchmark' },
    { id: 'preset-peak', preset: 'peak' },
    { id: 'preset-night', preset: 'night' },
    { id: 'preset-heatwave', preset: 'heatwave' }
  ];

  presets.forEach(({ id, preset }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      setSimulationPreset(preset);
      playIndustrialTone('click');
    });
  });

  // Apply button
  const applyBtn = document.getElementById('btn-apply-simulation');
  if (applyBtn) {
    applyBtn.addEventListener('click', applySimulationToLive);
  }

  // Reset button
  const resetBtn = document.getElementById('btn-reset-simulation');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      setSimulationPreset('benchmark');
      playIndustrialTone('click');
    });
  }

  recomputeSimulation();
}

function setSimulationPreset(preset) {
  document.querySelectorAll('.preset-pill').forEach(p => {
    if (p.dataset.preset === preset) p.classList.add('active');
    else p.classList.remove('active');
  });

  const loadSlider = document.getElementById('sim-load');
  const renewSlider = document.getElementById('sim-renew');
  const tempSlider = document.getElementById('sim-temp-offset');
  const ecoPulseCheck = document.getElementById('sim-eco-pulse');
  const precoolCheck = document.getElementById('sim-chiller-precool');

  if (preset === 'benchmark') {
    state.simulation.factoryLoad = 85;
    state.simulation.renewableMix = 100;
    state.simulation.tempOffset = 0;
    state.simulation.ecoPulse = true;
    state.simulation.chillerPrecool = false;
  } else if (preset === 'peak') {
    state.simulation.factoryLoad = 145;
    state.simulation.renewableMix = 15;
    state.simulation.tempOffset = 4;
    state.simulation.ecoPulse = false;
    state.simulation.chillerPrecool = false;
  } else if (preset === 'night') {
    state.simulation.factoryLoad = 60;
    state.simulation.renewableMix = 90;
    state.simulation.tempOffset = -3;
    state.simulation.ecoPulse = true;
    state.simulation.chillerPrecool = false;
  } else if (preset === 'heatwave') {
    state.simulation.factoryLoad = 110;
    state.simulation.renewableMix = 45;
    state.simulation.tempOffset = 12;
    state.simulation.ecoPulse = true;
    state.simulation.chillerPrecool = true;
  }

  if (loadSlider) loadSlider.value = state.simulation.factoryLoad;
  if (renewSlider) renewSlider.value = state.simulation.renewableMix;
  if (tempSlider) tempSlider.value = state.simulation.tempOffset;
  if (ecoPulseCheck) ecoPulseCheck.checked = state.simulation.ecoPulse;
  if (precoolCheck) precoolCheck.checked = state.simulation.chillerPrecool;

  const loadVal = document.getElementById('sim-load-val');
  const renewVal = document.getElementById('sim-renew-val');
  const tempVal = document.getElementById('sim-temp-offset-val');
  if (loadVal) loadVal.textContent = `${state.simulation.factoryLoad}%`;
  if (renewVal) renewVal.textContent = `${state.simulation.renewableMix}%`;
  if (tempVal) {
    const s = state.simulation.tempOffset > 0 ? '+' : '';
    tempVal.textContent = `${s}${state.simulation.tempOffset}°C`;
  }

  recomputeSimulation();
}

function recomputeSimulation() {
  const sim = state.simulation;
  const loadRatio = sim.factoryLoad / 100.0;
  const renewRatio = sim.renewableMix / 100.0;
  const tempOffset = sim.tempOffset;

  const chillerDraw = (tempOffset > 5 || sim.chillerPrecool) ? 1.8 : 0.8;
  const pulseFactor = sim.ecoPulse ? 0.88 : 1.0;
  const power = +((14.0 * Math.pow(loadRatio, 1.3) + chillerDraw) * pulseFactor).toFixed(1);

  // Carbon emitted per hour
  const effectiveEmissionFactor = (1.0 - renewRatio) * 0.82;
  const carbonRate = +(power * effectiveEmissionFactor).toFixed(1);
  const shiftCarbon = +(carbonRate * 4.0).toFixed(1); // 8-hour shift extrapolation

  // Equipment stress index
  let stress = Math.min(100, Math.max(10, Math.round(35 + (loadRatio - 1.0) * 80 + tempOffset * 2.5)));
  if (sim.ecoPulse) stress = Math.max(10, stress - 12);
  if (sim.chillerPrecool) stress = Math.max(10, stress - 15);

  // Cost and avoided tax
  const shiftCost = +(power * 8 * 0.18).toFixed(2);
  const taxAvoided = +((renewRatio * power * 8 * 0.82 / 1000.0) * 85.0).toFixed(2);

  let esgRating = 'A+';
  let esgSub = 'Zero-Emission Benchmark (Net-Zero Certified)';
  if (shiftCarbon > 50) {
    esgRating = 'F';
    esgSub = 'Carbon Budget Ceiling Breached — Penalty Risk';
  } else if (shiftCarbon > 38) {
    esgRating = 'B';
    esgSub = 'Elevated Grid Carbon Reliance';
  } else if (shiftCarbon > 24) {
    esgRating = 'A';
    esgSub = 'Fully Compliant with Industrial ESG Standards';
  }

  sim.projectedPower = power;
  sim.projectedCarbon = carbonRate;
  sim.shiftCarbon = shiftCarbon;
  sim.stressIndex = stress;
  sim.esgRating = esgRating;
  sim.shiftCost = shiftCost;
  sim.taxSaved = taxAvoided;

  // Update UI Elements
  const carbonRateEl = document.getElementById('sim-carbon-rate');
  const shiftCarbonEl = document.getElementById('sim-shift-carbon');
  const carbonBadgeEl = document.getElementById('sim-carbon-badge');
  const powerRateEl = document.getElementById('sim-power-rate');
  const shiftCostEl = document.getElementById('sim-shift-cost');
  const taxSavedEl = document.getElementById('sim-tax-saved');
  const stressPercentEl = document.getElementById('sim-stress-percent');
  const stressBarEl = document.getElementById('sim-stress-bar');
  const stressBadgeEl = document.getElementById('sim-stress-badge');
  const esgRatingEl = document.getElementById('sim-esg-rating');
  const esgSubEl = document.getElementById('sim-esg-sub');

  if (carbonRateEl) carbonRateEl.textContent = carbonRate.toFixed(1);
  if (shiftCarbonEl) shiftCarbonEl.textContent = `${shiftCarbon.toFixed(1)} kg`;
  if (carbonBadgeEl) {
    if (shiftCarbon > 50) {
      carbonBadgeEl.textContent = 'Ceiling Breached';
      carbonBadgeEl.className = 'sim-pill danger';
    } else {
      carbonBadgeEl.textContent = 'Inside Budget';
      carbonBadgeEl.className = 'sim-pill green';
    }
  }

  if (powerRateEl) powerRateEl.textContent = power.toFixed(1);
  if (shiftCostEl) shiftCostEl.textContent = `$${shiftCost.toFixed(2)}`;
  if (taxSavedEl) taxSavedEl.textContent = `$${taxAvoided.toFixed(2)}`;

  if (stressPercentEl) stressPercentEl.textContent = `${stress}%`;
  if (stressBarEl) stressBarEl.style.width = `${stress}%`;
  if (stressBadgeEl) {
    stressBadgeEl.textContent = stress > 75 ? 'Critical Strain' : (stress > 50 ? 'Moderate' : 'Nominal');
    stressBadgeEl.className = `sim-pill ${stress > 75 ? 'danger' : (stress > 50 ? 'cyan' : 'green')}`;
  }

  if (esgRatingEl) {
    esgRatingEl.textContent = esgRating;
    esgRatingEl.className = `text-${esgRating === 'F' ? 'danger' : (esgRating === 'B' ? 'warning' : 'teal')}`;
  }
  if (esgSubEl) esgSubEl.textContent = esgSub;

  updateSimulationChart();
}

function applySimulationToLive() {
  const sim = state.simulation;
  state.telemetry.power = sim.projectedPower;
  state.telemetry.carbon = +(sim.projectedPower * (1.0 - sim.renewableMix / 100.0) * 0.82).toFixed(1);
  state.telemetry.remaining = +(state.telemetry.budget - state.telemetry.carbon).toFixed(1);
  state.telemetry.temp = +(32.0 + sim.tempOffset + (sim.factoryLoad - 100) * 0.15).toFixed(1);

  // Rebalance machine states
  state.machines.forEach(m => {
    if (m.id === 5) return;
    m.load = Math.min(100, Math.max(20, Math.round(sim.factoryLoad * (m.id === 4 ? 0.75 : 0.95))));
    if (sim.stressIndex > 75 && (m.id === 2 || m.id === 3)) {
      m.status = m.id === 3 ? 'danger' : 'warning';
      m.temp = m.id === 3 ? 88 : 77;
    } else if (sim.stressIndex < 45) {
      m.status = 'online';
      m.temp = m.id === 3 ? 48 : 42;
      m.vibr = 'Normal';
    }
  });

  updateTelemetryDisplay();
  pushChartData();
  updateDigitalTwinDisplay();
  updateSituationalIntelligence();

  playIndustrialTone('success');
  showToast(`Simulated Scenario Synced: Factory Load ${sim.factoryLoad}%, ${sim.renewableMix}% Solar Mix`, 'success');
  speakAlert('Simulated scenario applied to physical shop floor');

  // Attempt backend sync
  fetch('/api/simulation/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      factory_load: sim.factoryLoad,
      renewable_mix: sim.renewableMix,
      ambient_temp_offset: sim.tempOffset,
      eco_pulse: sim.ecoPulse,
      chiller_pre_cool: sim.chillerPrecool
    })
  }).catch(() => {});
}

// ==================== 6. MAINTENANCE WORK ORDER & DISPATCH SYSTEM ====================
const WORK_ORDER_STORAGE_KEY = 'ecosync_factory_work_orders_v1';

function savePersistedWorkOrders() {
  try {
    localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(state.workOrders));
  } catch (e) {}
}

function loadPersistedWorkOrders() {
  try {
    const raw = localStorage.getItem(WORK_ORDER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.workOrders = parsed;
      }
    }
  } catch (e) {}
}

function getActiveIncidentOrProblemMachineId() {
  if (state.activeAnomaly && state.activeAnomaly.machineId) {
    return state.activeAnomaly.machineId;
  }
  const problem = state.machines.find(m => m.status === 'danger' || m.status === 'warning' || m.temp > 65);
  if (problem) return problem.id;
  return state.machines[0]?.id || 1;
}

function updateWorkOrderFormForMachine(machineId) {
  const m = state.machines.find(item => item.id === machineId) || state.machines[0];
  if (!m) return;

  const banner = document.getElementById('wo-machine-live-banner');
  if (banner) {
    const isCritical = m.status === 'danger' || m.temp > 80;
    const isWarning = m.status === 'warning' || m.vibr === 'High' || m.vibr === 'Critical';
    const statusClass = isCritical ? 'danger' : isWarning ? 'warning' : 'online';
    const statusLabel = isCritical ? 'CRITICAL HAZARD' : isWarning ? 'WARNING / ANOMALY' : 'ONLINE / OPERATIONAL';
    const tripTime = isCritical ? '< 5 min (Trip)' : isWarning ? '~18 min (Drift)' : '> 24 hrs';

    // Machine icon
    const icon = m.type.toLowerCase().includes('lathe') ? '⚙️'
      : m.type.toLowerCase().includes('press') ? '🏗️'
      : m.type.toLowerCase().includes('molder') ? '🔥'
      : m.type.toLowerCase().includes('robot') ? '🤖'
      : m.type.toLowerCase().includes('weld') ? '⚡'
      : '🏭';

    banner.innerHTML = `
      <div class="wo-mlb-top">
        <div class="wo-mlb-machine-info">
          <div class="wo-mlb-icon">${icon}</div>
          <div class="wo-mlb-name-wrap">
            <h4>${m.name} <span class="badge-tag cyan">${m.type}</span></h4>
            <div class="wo-mlb-bay">📍 ${m.bay || 'Bay ' + m.id} • Digital Twin Pod #${m.id}</div>
          </div>
        </div>
        <div class="wo-mlb-status-badge ${statusClass}">
          <span class="pulse-dot"></span>
          <span>${statusLabel}</span>
        </div>
      </div>
      <div class="wo-mlb-metrics-grid">
        <div class="wo-metric-item">
          <span class="wo-metric-label">Live Core Temp</span>
          <span class="wo-metric-val ${m.temp > 80 ? 'danger-text' : m.temp > 70 ? 'warning-text' : 'safe-text'}">${m.temp}°C</span>
        </div>
        <div class="wo-metric-item">
          <span class="wo-metric-label">Vibration Status</span>
          <span class="wo-metric-val ${m.vibr !== 'Normal' ? 'warning-text' : 'safe-text'}">${m.vibr}</span>
        </div>
        <div class="wo-metric-item">
          <span class="wo-metric-label">Operating Load</span>
          <span class="wo-metric-val ${m.load > 85 ? 'warning-text' : ''}">${m.load}%</span>
        </div>
        <div class="wo-metric-item">
          <span class="wo-metric-label">Failure Time Window</span>
          <span class="wo-metric-val ${isCritical ? 'danger-text' : 'safe-text'}">${tripTime}</span>
        </div>
      </div>
    `;
  }

  // Priority
  const selectPriority = document.getElementById('wo-select-priority');
  if (selectPriority) {
    if (m.status === 'danger' || m.temp > 80) selectPriority.value = 'Critical';
    else if (m.status === 'warning' || m.vibr !== 'Normal' || m.load > 85) selectPriority.value = 'High';
    else selectPriority.value = 'Normal';
  }

  // Fault diagnosis
  const issueInput = document.getElementById('wo-issue-input');
  if (issueInput) {
    if (m.temp > 80) {
      issueInput.value = `${m.name} (${m.type}) thermal runaway at ${m.temp}°C & primary cooling fluid breakdown; predicted failure in 4.8 min.`;
    } else if (m.vibr === 'High' || m.vibr === 'Critical') {
      issueInput.value = `${m.name} (${m.type}) 142 Hz harmonic vibration flutter (${m.vibr}) & spindle bearing race cavitation.`;
    } else if (m.load > 88) {
      issueInput.value = `${m.name} (${m.type}) high mechanical load surge (${m.load}%) with hydraulic line backpressure.`;
    } else {
      issueInput.value = `Routine preventative maintenance inspection, sensor recalibration & lubrication servicing for ${m.name}.`;
    }
  }

  // Required Tooling & Parts
  const partsInput = document.getElementById('wo-parts-input');
  if (partsInput) {
    const t = m.type.toLowerCase();
    if (t.includes('molder')) {
      partsInput.value = 'SKF 6205-2RS Ceramic Bearing, Glycol Chiller Filter Cartridge, Coolant 50/50 Mix';
    } else if (t.includes('lathe')) {
      partsInput.value = 'High-Speed Ceramic Spindle Bearings, Collet Chuck Set, V-Belt Set, Cutting Oil 20L';
    } else if (t.includes('press')) {
      partsInput.value = 'High-Pressure Hydraulic Seal Kit (240 bar), Proportional Spool Valve, ISO-VG 46 Fluid';
    } else if (t.includes('robot')) {
      partsInput.value = '6-Axis Servo Resolver, Harmonic Drive Reducer Grease, Flexible Cable Harness';
    } else if (t.includes('weld')) {
      partsInput.value = 'Heavy-Duty Copper Contact Tips, Gas Diffuser Solenoid, Argon Shielding Regulator';
    } else {
      partsInput.value = 'Industrial Synthetic Lubricant ISO 68, Replacement Filter Cartridge, Thermal Probe';
    }
  }

  // Assigned Technician
  const techInput = document.getElementById('wo-tech-input');
  if (techInput) {
    if (m.id === 1) techInput.value = 'Elena Rostova (Hydraulics & CNC Spec)';
    else if (m.id === 2) techInput.value = 'Elena Rostova (Hydraulics Spec)';
    else if (m.id === 3) techInput.value = 'Marcus Vance (Thermal Systems Lead)';
    else if (m.id === 4) techInput.value = 'Sarah Chen (Robotics & Automation Lead)';
    else if (m.id === 5) techInput.value = 'Kenji Sato (Welding Systems Spec)';
    else techInput.value = 'Alex Rivera (Senior Maintenance Tech)';
  }

  // Barcode
  const barcodeText = document.getElementById('wo-barcode-text');
  if (barcodeText) {
    barcodeText.textContent = `WO-2026-M${m.id}-LOTO`;
  }
}

function initWorkOrders() {
  loadPersistedWorkOrders();
  renderWorkOrdersTable();

  const createBtn = document.getElementById('btn-create-work-order');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openWorkOrderModal();
      playIndustrialTone('click');
    });
  }

  const closeBtn = document.getElementById('close-wo-btn');
  const modal = document.getElementById('work-order-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeWorkOrderModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeWorkOrderModal();
    });
  }

  const submitBtn = document.getElementById('btn-submit-work-order');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitWorkOrder);
  }

  const printBtn = document.getElementById('btn-print-work-order');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

function renderWorkOrdersTable() {
  const tbody = document.getElementById('work-orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.workOrders.map(wo => {
    const isCompleted = wo.status === 'Completed';
    const statusBadgeClass = isCompleted ? 'safe' : (wo.priority === 'Critical' ? 'critical' : 'high');

    return `
      <tr>
        <td><strong>${wo.id}</strong></td>
        <td>
          <strong>${wo.machineName}</strong><br/>
          <small class="text-muted">${wo.bay}</small>
        </td>
        <td><span class="badge-status-wo ${wo.priority.toLowerCase()}">${wo.priority}</span></td>
        <td><div style="max-width:280px; font-size:0.8rem; line-height:1.3;">${wo.issue}</div></td>
        <td><span style="font-size:0.8rem;">👷 ${wo.technician}</span></td>
        <td><span class="badge-status-wo ${statusBadgeClass}">${wo.status} ${isCompleted ? '✔' : ''}</span></td>
        <td>
          <div class="wo-table-actions">
            ${!isCompleted ? `
              <button class="alert-resolve-btn action-complete-wo" onclick="window.resolveWorkOrder('${wo.id}')" title="Complete & restore machine to nominal">
                ✔ Complete
              </button>
            ` : `
              <span class="wo-resolved-tag">Resolved</span>
            `}
            <button class="btn-wo-view" onclick="window.viewWorkOrderTicket('${wo.id}')" title="View official ticket">
              👁 View Ticket
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Window global helper for completing work order
window.resolveWorkOrder = function(id) {
  const order = state.workOrders.find(o => o.id === id);
  if (!order) return;

  order.status = 'Completed';

  // Stabilize the corresponding machine!
  const target = state.machines.find(m => m.id === order.machineId);
  if (target) {
    target.temp = 42;
    target.load = 65;
    target.vibr = 'Normal';
    target.status = 'online';
  }

  savePersistedWorkOrders();
  persistMachines();

  renderWorkOrdersTable();
  updateDigitalTwinDisplay();
  renderAdminMachineTable();
  updateAdminKpiMetrics();
  renderRecommendations();
  renderEffectPreview();

  const machineName = target ? target.name : 'Machinery';
  showToast(`✔ Work Order ${id} completed! ${machineName} cooled and restored to nominal online status.`, 'success');
  playIndustrialTone('success');
  speakAlert(`Work order ${id} resolved. ${machineName} stabilized.`);

  // Sync with backend if available
  fetch(`/api/work-orders/${id}/resolve`, { method: 'POST' }).catch(() => {});
};

// Window global helper for viewing existing ticket in modal
window.viewWorkOrderTicket = function(ticketId) {
  const order = state.workOrders.find(o => o.id === ticketId);
  if (order) {
    openWorkOrderModal(order.machineId, ticketId);
  }
};

function openWorkOrderModal(prefilledMachineId = null, existingTicketId = null) {
  const modal = document.getElementById('work-order-modal');
  if (!modal) return;

  // Dynamically determine target machine: priority to passed ID, then active problem, else Machine 1
  const targetId = prefilledMachineId ? parseInt(prefilledMachineId, 10) : getActiveIncidentOrProblemMachineId();

  // Populate Machine Select Dropdown dynamically from state.machines!
  const selectMachine = document.getElementById('wo-select-machine');
  if (selectMachine) {
    selectMachine.innerHTML = state.machines.map(m => {
      const isProblem = m.status === 'danger' || m.status === 'warning' || m.temp > 65;
      const mark = isProblem ? '⚠️ ' : '';
      return `<option value="${m.id}" ${m.id === targetId ? 'selected' : ''}>${mark}${m.name} (${m.type}) • ${m.temp}°C [${m.status.toUpperCase()}]</option>`;
    }).join('');

    // Wire onchange
    selectMachine.onchange = (e) => {
      const chosenId = parseInt(e.target.value, 10);
      updateWorkOrderFormForMachine(chosenId);
    };
  }

  const idEl = document.getElementById('wo-modal-id');
  const ticketId = existingTicketId || `WO-2026-0${Math.floor(890 + Math.random() * 100)}`;
  if (idEl) idEl.textContent = ticketId;

  // If viewing an existing ticket, load its stored values
  if (existingTicketId) {
    const existing = state.workOrders.find(o => o.id === existingTicketId);
    if (existing) {
      if (selectMachine) selectMachine.value = String(existing.machineId);
      updateWorkOrderFormForMachine(existing.machineId);
      const issueInput = document.getElementById('wo-issue-input');
      const partsInput = document.getElementById('wo-parts-input');
      const techInput = document.getElementById('wo-tech-input');
      const selectPriority = document.getElementById('wo-select-priority');
      if (issueInput && existing.issue) issueInput.value = existing.issue;
      if (partsInput && existing.parts) partsInput.value = Array.isArray(existing.parts) ? existing.parts.join(', ') : existing.parts;
      if (techInput && existing.technician) techInput.value = existing.technician;
      if (selectPriority && existing.priority) selectPriority.value = existing.priority;
    } else {
      updateWorkOrderFormForMachine(targetId);
    }
  } else {
    updateWorkOrderFormForMachine(targetId);
  }

  modal.style.display = 'flex';
}
window.openWorkOrderModal = openWorkOrderModal;

function closeWorkOrderModal() {
  const modal = document.getElementById('work-order-modal');
  if (modal) modal.style.display = 'none';
}

function submitWorkOrder() {
  const selectMachine = document.getElementById('wo-select-machine');
  const selectPriority = document.getElementById('wo-select-priority');
  const issueInput = document.getElementById('wo-issue-input');
  const partsInput = document.getElementById('wo-parts-input');
  const techInput = document.getElementById('wo-tech-input');
  const idEl = document.getElementById('wo-modal-id');

  const machineId = parseInt(selectMachine ? selectMachine.value : '1', 10);
  const m = state.machines.find(item => item.id === machineId) || state.machines[0];
  const ticketId = idEl ? idEl.textContent : `WO-2026-0${Math.floor(890 + Math.random() * 100)}`;

  const existingIndex = state.workOrders.findIndex(o => o.id === ticketId);

  const orderData = {
    id: ticketId,
    machineId: m.id,
    machineName: `${m.name} (${m.type})`,
    bay: m.bay || `Bay ${m.id} - Factory Floor`,
    priority: selectPriority ? selectPriority.value : 'Critical',
    status: 'Dispatched',
    issue: issueInput ? issueInput.value : `${m.name} preventative servicing.`,
    parts: partsInput ? partsInput.value.split(',').map(s => s.trim()) : ['Bearing Set', 'Coolant Filter'],
    technician: techInput ? techInput.value : 'Marcus Vance (Shift Lead)',
    lotoRequired: true,
    createdAt: 'Just now'
  };

  if (existingIndex >= 0) {
    state.workOrders[existingIndex] = orderData;
  } else {
    state.workOrders.unshift(orderData);
  }

  savePersistedWorkOrders();
  renderWorkOrdersTable();
  closeWorkOrderModal();

  playIndustrialTone('success');
  showToast(`Work Order ${ticketId} officially dispatched for ${m.name} to ${orderData.technician}`, 'success');
  speakAlert(`Work order ${ticketId} dispatched for ${m.name}`);

  // Add alert in center
  state.alerts.unshift({
    id: Date.now(),
    type: 'info',
    title: `Work Order Dispatched: ${ticketId}`,
    msg: `Technician ${orderData.technician} dispatched to ${m.name} (${orderData.bay}) for ${orderData.priority} maintenance.`,
    time: 'Just now'
  });
  renderAlerts();

  // Sync with backend if available
  fetch('/api/work-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      machine_id: orderData.machineId,
      machine_name: orderData.machineName,
      bay: orderData.bay,
      priority: orderData.priority,
      issue: orderData.issue,
      parts: orderData.parts,
      technician: orderData.technician,
      loto_required: orderData.lotoRequired
    })
  }).catch(() => {});
}

// ===================================================================
// 7. FACTORY ADMINISTRATION & FLEET SCALING (COMPANY JOURNEY)
// ===================================================================

function initAdminFleet() {
  const openModalBtn = document.getElementById('btn-open-add-machine-modal');
  const openModalTopBtn = document.getElementById('btn-admin-add-machine-top');
  const twinAddModalBtn = document.getElementById('btn-twin-add-machine');
  const closeModalBtn = document.getElementById('add-machine-close-btn');
  const cancelModalBtn = document.getElementById('btn-cancel-add-machine');
  const modal = document.getElementById('add-machine-modal');
  const addForm = document.getElementById('add-machine-form');
  const loadSlider = document.getElementById('new-machine-load');
  const loadDisplay = document.getElementById('load-display-val');

  const scalePhase3Btn = document.getElementById('btn-quick-scale-phase3');
  const stepPhase3Btn = document.getElementById('step-btn-deploy-phase3');
  const stepPhase4Btn = document.getElementById('step-btn-deploy-phase4');
  const refreshFleetBtn = document.getElementById('btn-admin-refresh-fleet');

  // Open Add Machine Modal
  const openModal = () => {
    if (!modal) return;
    modal.style.display = 'flex';
    const nameInput = document.getElementById('new-machine-name');
    if (nameInput) {
      const nextId = Math.max(...state.machines.map(m => m.id), 0) + 1;
      nameInput.value = `Machine ${nextId}`;
      nameInput.focus();
    }
  };

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (openModalTopBtn) openModalTopBtn.addEventListener('click', openModal);
  if (twinAddModalBtn) twinAddModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Load slider live label
  if (loadSlider && loadDisplay) {
    loadSlider.addEventListener('input', (e) => {
      loadDisplay.textContent = `${e.target.value}%`;
    });
  }

  // Submit Add Machine Form
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-machine-name')?.value.trim() || 'New Machine';
      const type = document.getElementById('new-machine-type')?.value || 'Precision Laser Cutter';
      const bay = document.getElementById('new-machine-bay')?.value || 'Bay 6 - Precision Cell';
      const journeyPhase = document.getElementById('new-machine-journey')?.value || 'Phase 3: Commercial Growth';
      const load = parseInt(document.getElementById('new-machine-load')?.value || '65', 10);
      const temp = parseFloat(document.getElementById('new-machine-temp')?.value || '38.5');
      const power = parseFloat(document.getElementById('new-machine-power')?.value || '3.8');
      const vibr = document.getElementById('new-machine-vibr')?.value || 'Normal';

      const nextId = Math.max(...state.machines.map(m => m.id), 0) + 1;

      const newMachine = {
        id: nextId,
        name,
        type,
        bay,
        journeyPhase,
        load,
        temp,
        power,
        vibr,
        status: 'online'
      };

      state.machines.push(newMachine);
      persistMachines();
      closeModal();

      syncFloorMapWithMachines();
      syncMachineCardsWithMachines();
      renderAdminMachineTable();
      updateAdminKpiMetrics();
      updateDigitalTwinDisplay();

      playIndustrialTone('success');
      showToast(`✔ Machine ${name} (${type}) added! Automatically syncing into Digital Twin floor map...`, 'success');
      speakAlert(`New machine ${name} deployed to Digital Twin`);

      // Automatically navigate to the Digital Twin page and highlight the new machine
      setTimeout(() => {
        navigateToPage('digital-twin');
        const pod = document.getElementById(`map-pod-${newMachine.id}`);
        if (pod) {
          pod.classList.add('newly-added-pulse');
          pod.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => pod.classList.remove('newly-added-pulse'), 5000);
        }
      }, 450);

      // Attempt backend sync
      fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMachine.name,
          type: newMachine.type,
          bay: newMachine.bay,
          journey_phase: newMachine.journeyPhase,
          load: newMachine.load,
          temp: newMachine.temp,
          power: newMachine.power,
          vibr: newMachine.vibr,
          status: newMachine.status
        })
      }).catch(() => {});
    });
  }

  // Milestone quick scaling buttons
  if (scalePhase3Btn) {
    scalePhase3Btn.addEventListener('click', () => {
      deployCompanyJourneyMilestone(3);
    });
  }
  if (stepPhase3Btn) {
    stepPhase3Btn.addEventListener('click', () => {
      deployCompanyJourneyMilestone(3);
    });
  }
  if (stepPhase4Btn) {
    stepPhase4Btn.addEventListener('click', () => {
      deployCompanyJourneyMilestone(4);
    });
  }
  if (refreshFleetBtn) {
    refreshFleetBtn.addEventListener('click', () => {
      showToast('Refreshing fleet inventory from telemetry bus...', 'info');
      fetchLiveData();
      renderAdminMachineTable();
      updateAdminKpiMetrics();
    });
  }

  // Initial render
  renderAdminMachineTable();
  updateAdminKpiMetrics();
  syncFloorMapWithMachines();
  syncMachineCardsWithMachines();
}

function renderAdminMachineTable() {
  const tbody = document.getElementById('admin-machines-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.machines.map(m => {
    const isOnline = m.status === 'online';
    const isWarning = m.status === 'warning';
    const isDanger = m.status === 'danger';
    const statusLabel = isOnline ? '● Online' : (isWarning ? '⚠ Warning' : (isDanger ? '🔴 Critical' : '⏸ Maintenance'));
    const statusClass = isOnline ? 'online' : (isWarning ? 'warning' : (isDanger ? 'danger' : 'offline'));

    return `
      <tr class="admin-machine-row" data-id="${m.id}">
        <td>
          <div class="table-id-cell">
            <span class="machine-id-badge">#M-${m.id}</span>
          </div>
        </td>
        <td>
          <div class="table-equip-cell">
            <strong>${m.name}</strong>
            <span class="sub-type">${m.type}</span>
          </div>
        </td>
        <td>
          <span class="bay-tag">${m.bay || `Bay ${m.id} - Factory Floor`}</span>
        </td>
        <td>
          <span class="journey-phase-tag">${m.journeyPhase || (m.id <= 2 ? 'Phase 1: Seed Prototype' : (m.id <= 5 ? 'Phase 2: Pilot Plant' : (m.id <= 8 ? 'Phase 3: Commercial Growth' : 'Phase 4: Megafactory')))}</span>
        </td>
        <td>
          <div class="admin-load-cell">
            <div class="load-bar-wrap">
              <div class="load-bar-fill" style="width: ${m.load}%; background: ${m.load > 90 ? 'var(--accent-danger)' : (m.load > 75 ? 'var(--accent-amber)' : 'var(--accent-primary)')}"></div>
            </div>
            <span class="load-text">${m.load}%</span>
          </div>
        </td>
        <td>
          <span class="temp-text ${m.temp > 75 ? 'danger-text' : (m.temp > 55 ? 'warning-text' : '')}">${m.temp > 0 ? `${m.temp}°C` : '--°C'}</span>
        </td>
        <td>
          <span class="vibr-badge ${m.vibr === 'Critical' ? 'danger' : (m.vibr === 'High' ? 'warning' : 'normal')}">${m.vibr || 'Normal'}</span>
        </td>
        <td>
          <span class="machine-status-pill ${statusClass}">${statusLabel}</span>
        </td>
        <td>
          <div class="admin-row-actions">
            <button class="btn-table-action" title="${isOnline ? 'Switch to Standby/Maintenance' : 'Bring Online'}" onclick="window.toggleAdminMachineStatus(${m.id})">
              ${isOnline ? '⏸' : '⚡'}
            </button>
            <button class="btn-table-action" title="Inspect Diagnostics" onclick="window.openInspectorForMachine(${m.id})">
              🔍
            </button>
            <button class="btn-table-action delete-action" title="Decommission Machine" onclick="window.deleteAdminMachine(${m.id})">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updateAdminKpiMetrics() {
  const totalEl = document.getElementById('admin-total-machines');
  const subEl = document.getElementById('admin-fleet-status-sub');
  const powerEl = document.getElementById('admin-total-power');
  const workforceEl = document.getElementById('admin-total-workforce');
  const carbonShareEl = document.getElementById('admin-carbon-share');
  const journeyPill = document.getElementById('journey-phase-indicator');

  const count = state.machines.length;
  const onlineCount = state.machines.filter(m => m.status === 'online').length;
  const totalKw = state.machines.reduce((sum, m) => sum + (m.power || 3.5), 0);
  const totalWorkers = 12 + Math.max(0, (count - 5) * 2) + (state.manpower?.auxiliaryDeployed || 0);
  const carbonPerUnit = (state.telemetry.budget / Math.max(1, count)).toFixed(1);

  if (totalEl) totalEl.textContent = `${count} Machines`;
  if (subEl) subEl.textContent = `${onlineCount}/${count} Online & Telemetry Synced`;
  if (powerEl) powerEl.textContent = `${totalKw.toFixed(1)} kW Peak`;
  if (workforceEl) workforceEl.textContent = `${totalWorkers} Operators`;
  if (carbonShareEl) carbonShareEl.textContent = `${carbonPerUnit} kg / unit`;

  // Update Journey Phase indicator & Timeline Stepper
  let currentPhase = 2;
  let phaseName = 'Phase 2: Pilot Plant';
  if (count >= 12) {
    currentPhase = 4;
    phaseName = 'Phase 4: Megafactory Zero-Carbon';
  } else if (count >= 8) {
    currentPhase = 3;
    phaseName = 'Phase 3: Commercial Growth';
  }
  if (!state.companyJourney) state.companyJourney = {};
  state.companyJourney.currentPhase = currentPhase;
  state.companyJourney.phaseName = phaseName;

  if (journeyPill) journeyPill.textContent = `Active ${phaseName}`;

  // Update timeline markers
  const step2 = document.getElementById('journey-step-2');
  const step3 = document.getElementById('journey-step-3');
  const step4 = document.getElementById('journey-step-4');

  if (step2) {
    if (currentPhase >= 3) {
      step2.className = 'journey-step completed';
      const m = step2.querySelector('.step-marker');
      if (m) m.textContent = '✓';
    } else {
      step2.className = 'journey-step active';
      const m = step2.querySelector('.step-marker');
      if (m) m.textContent = '2';
    }
  }

  if (step3) {
    if (currentPhase >= 4) {
      step3.className = 'journey-step completed';
      const m = step3.querySelector('.step-marker');
      if (m) m.textContent = '✓';
    } else if (currentPhase === 3) {
      step3.className = 'journey-step active';
      const m = step3.querySelector('.step-marker');
      if (m) m.textContent = '3';
    } else {
      step3.className = 'journey-step upcoming';
      const m = step3.querySelector('.step-marker');
      if (m) m.textContent = '3';
    }
  }

  if (step4) {
    if (currentPhase === 4) {
      step4.className = 'journey-step active';
      const m = step4.querySelector('.step-marker');
      if (m) m.textContent = '4';
    } else {
      step4.className = 'journey-step locked';
      const m = step4.querySelector('.step-marker');
      if (m) m.textContent = '4';
    }
  }
}

function syncFloorMapWithMachines() {
  const stage = document.getElementById('interactive-floor-map') || document.getElementById('floor-map-stage');
  if (!stage) return;

  const coordinates = {
    1: { left: '14%', top: '40%' },
    2: { left: '42%', top: '22%' },
    3: { left: '54%', top: '56%' },
    4: { left: '76%', top: '28%' },
    5: { left: '84%', top: '62%' },
    6: { left: '26%', top: '68%' },
    7: { left: '32%', top: '22%' },
    8: { left: '66%', top: '72%' },
    9: { left: '18%', top: '20%' },
    10: { left: '48%', top: '78%' },
    11: { left: '68%', top: '20%' },
    12: { left: '88%', top: '38%' }
  };

  state.machines.forEach(m => {
    let pod = document.getElementById(`map-pod-${m.id}`);
    const coords = coordinates[m.id] || { left: `${15 + ((m.id * 17) % 75)}%`, top: `${25 + ((m.id * 19) % 60)}%` };
    if (!pod) {
      pod = document.createElement('div');
      pod.id = `map-pod-${m.id}`;
      pod.dataset.machine = m.id;
      stage.appendChild(pod);
    }

    pod.style.left = coords.left;
    pod.style.top = coords.top;
    pod.onclick = () => {
      openMachineInspector(m.id);
      playIndustrialTone('click');
    };

    const statusBadgeText = m.status === 'online' ? '● Online' : 
      (m.status === 'warning' ? '⚠️ High Load' : (m.status === 'danger' ? '🔴 Critical' : '⏸ Maintenance'));

    pod.className = `map-machine-pod ${m.status} ${m.status === 'danger' ? 'pulse-danger' : ''}`;
    pod.innerHTML = `
      <div class="pod-halo ${m.status}-halo"></div>
      <div class="pod-card">
        <div class="pod-badge-status ${m.status}-badge">${statusBadgeText}</div>
        <div class="pod-title">${m.name}</div>
        <div class="pod-type">${m.type}</div>
        <div class="pod-metrics">
          <span><strong id="map-m${m.id}-temp">${m.temp > 0 ? `${m.temp}°C` : '--°C'}</strong> | <span id="map-m${m.id}-load">${m.load}%</span> load</span>
        </div>
        <div class="pod-action-hint">🔍 Click to Inspect</div>
      </div>
    `;
  });

  const existingPodIds = new Set(state.machines.map(m => `map-pod-${m.id}`));
  stage.querySelectorAll('.map-machine-pod').forEach(pod => {
    if (!existingPodIds.has(pod.id)) {
      pod.remove();
    }
  });
}

function syncMachineCardsWithMachines() {
  const container = document.getElementById('factory-floor');
  if (!container) return;

  state.machines.forEach(m => {
    let card = document.getElementById(`machine-${m.id}`);
    if (!card) {
      card = document.createElement('div');
      card.className = 'factory-machine';
      card.id = `machine-${m.id}`;
      card.dataset.machine = m.id;
      container.appendChild(card);
    }

    const statusText = m.status === 'online' ? '● Online' : (m.status === 'warning' ? '⚠ Warning' : (m.status === 'danger' ? '🔴 Critical' : '⏸ Maintenance'));
    const isWarn = m.status === 'warning';
    const isDang = m.status === 'danger';

    card.innerHTML = `
      <div class="machine-visual">
        <div class="machine-body ${isWarn ? 'warning-glow' : ''} ${isDang ? 'danger-glow' : ''}">
          <div class="machine-gear ${isWarn ? 'spin-fast' : ''} ${isDang ? 'spin-erratic' : ''}"></div>
        </div>
        <div class="machine-status-indicator ${m.status}"></div>
      </div>
      <div class="machine-info">
        <h4>${m.name}</h4>
        <span class="machine-type">${m.type}</span>
        <div class="machine-stats">
          <div class="ms"><span class="ms-label">Temp</span><span class="ms-val ${isWarn ? 'warning-text' : (isDang ? 'danger-text' : '')}" id="m${m.id}-temp">${m.temp > 0 ? `${m.temp}°C` : '--°C'}</span></div>
          <div class="ms"><span class="ms-label">Load</span><span class="ms-val ${isWarn ? 'warning-text' : (isDang ? 'danger-text' : '')}" id="m${m.id}-load">${m.load}%</span></div>
          <div class="ms"><span class="ms-label">Vibr</span><span class="ms-val ${isWarn ? 'warning-text' : (isDang ? 'danger-text' : '')}" id="m${m.id}-vibr">${m.vibr || 'Normal'}</span></div>
        </div>
        <div class="machine-card-footer">
          <span class="machine-status-text ${m.status}">${statusText}</span>
          <button class="btn-inspect-machine" onclick="window.openInspectorForMachine(${m.id})">🔍 Diagnostics</button>
        </div>
      </div>
    `;
  });

  const existingIds = new Set(state.machines.map(m => `machine-${m.id}`));
  container.querySelectorAll('.factory-machine').forEach(card => {
    if (!existingIds.has(card.id)) {
      card.remove();
    }
  });
}

// Global functions exposed to window for inline onclicks
window.openInspectorForMachine = function(id) {
  openMachineInspector(id);
};

window.toggleAdminMachineStatus = function(id) {
  const m = state.machines.find(item => item.id === id);
  if (!m) return;

  if (m.status === 'online') {
    m.status = 'offline';
    m.load = 0;
    m.temp = 0;
    showToast(`${m.name} placed into Standby / Overhaul mode`, 'warning');
  } else {
    m.status = 'online';
    m.load = 65;
    m.temp = 42;
    showToast(`${m.name} brought back online into production!`, 'success');
  }

  persistMachines();
  renderAdminMachineTable();
  updateAdminKpiMetrics();
  syncFloorMapWithMachines();
  syncMachineCardsWithMachines();
  updateDigitalTwinDisplay();
  playIndustrialTone('click');

  fetch(`/api/machines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: m.status, load: m.load, temp: m.temp })
  }).catch(() => {});
};

window.deleteAdminMachine = function(id) {
  const m = state.machines.find(item => item.id === id);
  if (!m) return;

  if (!confirm(`Are you sure you want to decommission and remove ${m.name} (${m.type}) from the factory floor?`)) {
    return;
  }

  state.machines = state.machines.filter(item => item.id !== id);
  persistMachines();

  renderAdminMachineTable();
  updateAdminKpiMetrics();
  syncFloorMapWithMachines();
  syncMachineCardsWithMachines();
  updateDigitalTwinDisplay();

  playIndustrialTone('alert');
  showToast(`${m.name} (${m.type}) decommissioned from factory floor.`, 'info');
  speakAlert(`Machine ${id} decommissioned.`);

  fetch(`/api/machines/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
};

window.deployCompanyJourneyMilestone = function(phase) {
  showLoading(true);

  setTimeout(() => {
    showLoading(false);

    if (phase === 3) {
      const phase3Presets = [
        { name: 'Machine 6', type: 'Precision Laser Cutter', bay: 'Bay 6 - Precision Cell', temp: 39.0, load: 65, vibr: 'Normal', power: 4.2, status: 'online', journeyPhase: 'Phase 3: Commercial Growth' },
        { name: 'Machine 7', type: 'Clean Heat Pump', bay: 'Bay 7 - HVAC & Recovery', temp: 31.5, load: 50, vibr: 'Low', power: 2.8, status: 'online', journeyPhase: 'Phase 3: Commercial Growth' },
        { name: 'Machine 8', type: 'Eco Extruder Unit', bay: 'Bay 8 - Polymer Forming', temp: 44.0, load: 68, vibr: 'Normal', power: 3.9, status: 'online', journeyPhase: 'Phase 3: Commercial Growth' }
      ];

      phase3Presets.forEach(preset => {
        if (!state.machines.some(m => m.type === preset.type)) {
          const nextId = Math.max(...state.machines.map(m => m.id), 0) + 1;
          preset.id = nextId;
          state.machines.push(preset);
        }
      });

      playIndustrialTone('success');
      showToast('🚀 Company Milestone Achieved: Phase 3 Commercial Fleet Deployed (+3 Machines)!', 'success');
      speakAlert('Phase 3 Commercial scaling milestone deployed. 3 new production units online.');

    } else if (phase === 4) {
      const phase4Presets = [
        { name: 'Machine 9', type: 'Additive 3D Metal Printer', bay: 'Bay 9 - Additive Cell', temp: 34.0, load: 58, vibr: 'Normal', power: 3.2, status: 'online', journeyPhase: 'Phase 4: Megafactory' },
        { name: 'Machine 10', type: 'Autonomous AMR Fleet Hub', bay: 'Bay 10 - Logistics Grid', temp: 28.0, load: 45, vibr: 'Low', power: 1.9, status: 'online', journeyPhase: 'Phase 4: Megafactory' },
        { name: 'Machine 11', type: 'Clean Induction Furnace', bay: 'Bay 11 - Metallurgy', temp: 48.0, load: 62, vibr: 'Normal', power: 6.4, status: 'online', journeyPhase: 'Phase 4: Megafactory' },
        { name: 'Machine 12', type: 'Automated Vision QA Gantry', bay: 'Bay 12 - Quality Inspection', temp: 26.5, load: 40, vibr: 'Low', power: 1.4, status: 'online', journeyPhase: 'Phase 4: Megafactory' }
      ];

      phase4Presets.forEach(preset => {
        if (!state.machines.some(m => m.type === preset.type)) {
          const nextId = Math.max(...state.machines.map(m => m.id), 0) + 1;
          preset.id = nextId;
          state.machines.push(preset);
        }
      });

      playIndustrialTone('success');
      showToast('⚡ Enterprise Megafactory Milestone Achieved: Zero-Carbon Complex Activated (+4 Machines)!', 'success');
      speakAlert('Phase 4 Megafactory scaling milestone unlocked. 12 industrial twin units synchronized.');
    }

    persistMachines();
    renderAdminMachineTable();
    updateAdminKpiMetrics();
    syncFloorMapWithMachines();
    syncMachineCardsWithMachines();
    updateDigitalTwinDisplay();

    // Automatically navigate to Digital Twin page so the user sees all scaled machines
    setTimeout(() => {
      navigateToPage('digital-twin');
    }, 500);

    // Sync with backend
    fetch('/api/admin/journey/scale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase })
    }).catch(() => {});
  }, 600);
};

