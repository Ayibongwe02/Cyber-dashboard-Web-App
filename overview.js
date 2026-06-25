import { THEME, makeGridOpts, destroyChart } from './charts.js';
let chartTraffic = null, chartBar = null;

export function renderOverview(store) {
  const k = store.kpis;
  if (!k) return;
  const spiEl = document.getElementById('kpi-spi');
  const blockedEl = document.getElementById('kpi-blocked');
  const mitigEl = document.getElementById('kpi-mitigations');
  const anomalyEl = document.getElementById('kpi-anomaly');
  const spiBar = document.getElementById('kpi-spi-bar');
  const anomBar = document.getElementById('kpi-anomaly-bar');
  const badgeSpi = document.getElementById('kpi-spi-badge');
  const badgeCrit = document.getElementById('critical-badge');

  if (spiEl) { spiEl.textContent = k.spi; spiEl.className = 'kpi-value ' + (k.spi > 70 ? 'safe' : k.spi > 50 ? 'warning' : 'critical'); }
  if (blockedEl) blockedEl.textContent = k.blocked_payloads.toLocaleString();
  if (mitigEl) mitigEl.textContent = k.active_mitigations;
  if (anomalyEl) anomalyEl.textContent = k.anomaly_rate_pct + '%';
  if (spiBar) spiBar.style.width = k.spi + '%';
  if (anomBar) anomBar.style.width = Math.min(k.anomaly_rate_pct, 100) + '%';
  if (badgeSpi) badgeSpi.textContent = `SPI ${k.spi}`;
  if (badgeCrit) badgeCrit.textContent = `⚠ ${k.critical_count} CRITICAL`;

  const sub = document.getElementById('kpi-spi-sub');
  if (sub) sub.textContent = k.spi > 70 ? 'Posture: Acceptable' : k.spi > 50 ? 'Posture: Degraded' : 'Posture: Compromised';

  renderTrafficChart(store.liveTraffic);
  renderEndpointBarChart(store.endpoints);
  renderTopAnomalies(store.anomalies);
}

function renderTrafficChart(traffic) {
  const ctx = document.getElementById('chart-traffic');
  if (!ctx) return;
  destroyChart(chartTraffic);
  const labels = traffic.map(d => d.hour);
  chartTraffic = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Inbound KB', data: traffic.map(d => d.inbound_kb), borderColor: THEME.blue, backgroundColor: THEME.blueA, borderWidth: 1.5, tension: 0.4, fill: true, pointRadius: 0 },
        { label: 'Outbound KB', data: traffic.map(d => d.outbound_kb), borderColor: THEME.sage, backgroundColor: THEME.sageA, borderWidth: 1.5, tension: 0.4, fill: true, pointRadius: 0 },
        { label: 'Blocked', data: traffic.map(d => d.blocked), borderColor: THEME.crimson, backgroundColor: THEME.crimsonA, borderWidth: 1.5, tension: 0.4, fill: true, pointRadius: 0 },
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: makeGridOpts() },
        y: { grid: makeGridOpts(), ticks: { callback: v => (v/1000).toFixed(0)+'K' } }
      }
    }
  });
}

function renderEndpointBarChart(endpoints) {
  const ctx = document.getElementById('chart-endpoint-bar');
  if (!ctx) return;
  destroyChart(chartBar);
  const hosts = Object.keys(endpoints);
  const risks = hosts.map(h => endpoints[h].risk_score);
  const colors = risks.map(r => r > 70 ? THEME.crimson : r > 40 ? THEME.amber : THEME.sage);
  chartBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hosts,
      datasets: [{ label: 'Risk Score', data: risks, backgroundColor: colors, borderRadius: 4, borderSkipped: false }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: makeGridOpts(), min: 0, max: 100 },
        y: { grid: { display: false } }
      }
    }
  });
}

function renderTopAnomalies(anomalies) {
  const el = document.getElementById('top-anomalies-table');
  if (!el) return;
  const top = anomalies.slice(0, 6);
  el.innerHTML = `<table>
    <thead><tr><th>Host</th><th>Classification</th><th>Severity</th><th>Risk</th></tr></thead>
    <tbody>${top.map(a => `
      <tr>
        <td class="mono">${a.host}</td>
        <td>${a.classification}</td>
        <td><span class="badge badge-${a.severity.toLowerCase()}">${a.severity}</span></td>
        <td><div class="risk-bar-wrap">
          <div class="risk-bar-track"><div class="risk-bar-fill" style="width:${a.risk_score}%;background:${a.risk_score>70?THEME.crimson:a.risk_score>50?THEME.amber:THEME.sage}"></div></div>
          <span class="risk-val" style="color:${a.risk_score>70?THEME.crimson:a.risk_score>50?THEME.amber:THEME.sage}">${a.risk_score}</span>
        </div></td>
      </tr>`).join('')}
    </tbody></table>`;
}
