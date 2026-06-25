import { DataStore } from './data.js';
import { applyGlobalDefaults } from './charts.js';
import { renderOverview } from './overview.js';
import { renderEndpoints } from './endpoints.js';
import { renderPredictive } from './predictive.js';
import { renderHunting } from './hunting.js';

const VIEWS = {
  overview: { title: 'Security Overview', subtitle: 'Real-time threat intelligence · Auto-refresh every 60s', render: renderOverview },
  endpoints: { title: 'Endpoint Deep-Dive', subtitle: 'Host asset node analysis · Traffic history & system logs', render: renderEndpoints },
  predictive: { title: 'Predictive Volume Engine', subtitle: 'Prophet ML forecast · RMSE & MAPE validation metrics', render: renderPredictive },
  hunting: { title: 'Threat Hunting Suite', subtitle: 'Isolation Forest anomaly detection · Behavioral classification', render: renderHunting },
};

let currentView = 'overview';

function navigateTo(view, store) {
  if (!VIEWS[view]) return;
  currentView = view;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById(`view-${view}`);
  if (viewEl) viewEl.classList.add('active');

  const navEl = document.querySelector(`[data-view="${view}"]`);
  if (navEl) navEl.classList.add('active');

  const titleEl = document.getElementById('page-title');
  const subEl = document.getElementById('page-subtitle');
  if (titleEl) titleEl.textContent = VIEWS[view].title;
  if (subEl) subEl.textContent = VIEWS[view].subtitle;

  if (store.raw) VIEWS[view].render(store);
}

function renderCurrentView(store) {
  if (VIEWS[currentView]) VIEWS[currentView].render(store);
}

function updateSyncLabel() {
  const el = document.getElementById('sidebar-last-sync');
  if (el) el.textContent = `SYNCED · ${new Date().toLocaleTimeString()}`;
}

async function init() {
  applyGlobalDefaults();

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.view, DataStore));
  });

  const ok = await DataStore.fetch();
  if (ok) {
    updateSyncLabel();
    navigateTo('overview', DataStore);
  }

  // Hide loading overlay
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');

  // Silent 60s polling — preserves user state
  setInterval(async () => {
    const refreshed = await DataStore.fetch();
    if (refreshed) {
      updateSyncLabel();
      renderCurrentView(DataStore);
    }
  }, 60000);
}

document.addEventListener('DOMContentLoaded', init);
