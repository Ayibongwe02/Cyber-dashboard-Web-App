import { THEME, makeGridOpts, destroyChart } from './charts.js';
let activeHost = null, chartDetail = null;

export function renderEndpoints(store) {
  const grid = document.getElementById('endpoint-status-grid');
  if (!grid) return;
  const hosts = Object.keys(store.endpoints);
  if (!activeHost || !store.endpoints[activeHost]) activeHost = hosts[0];

  grid.innerHTML = hosts.map(h => {
    const ep = store.endpoints[h];
    const color = ep.risk_score > 70 ? THEME.crimson : ep.risk_score > 40 ? THEME.amber : THEME.sage;
    return `<div class="endpoint-status-card${h === activeHost ? ' active' : ''}" data-host="${h}">
      <div class="escard-name">${h}</div>
      <div class="escard-risk" style="color:${color}">${ep.risk_score}</div>
      <span class="badge badge-${ep.status.toLowerCase()}">${ep.status}</span>
      <div style="font-size:0.62rem;font-family:'DM Mono',monospace;color:var(--charcoal-60);margin-top:8px">${ep.total_events} events · ${ep.critical_events} critical</div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.endpoint-status-card').forEach(card => {
    card.addEventListener('click', () => {
      activeHost = card.dataset.host;
      renderEndpoints(store);
    });
  });

  renderHostDetail(store.endpoints[activeHost], activeHost);
}

function renderHostDetail(ep, host) {
  const titleEl = document.getElementById('ep-title');
  const metaEl = document.getElementById('ep-meta');
  if (titleEl) titleEl.textContent = host;
  if (metaEl) metaEl.textContent = `Risk: ${ep.risk_score} · ${ep.status} · ${ep.total_events} events`;

  const ctx = document.getElementById('chart-endpoint-detail');
  if (ctx) {
    destroyChart(chartDetail);
    const traffic = ep.traffic_history.slice(-20);
    chartDetail = new Chart(ctx, {
      type: 'line',
      data: {
        labels: traffic.map((_, i) => `T-${traffic.length - i}`),
        datasets: [
          { label: 'Payload KB', data: traffic.map(t => t.payload_kb), borderColor: THEME.blue, backgroundColor: THEME.blueA, borderWidth: 1.5, tension: 0.4, fill: true, pointRadius: 0 },
          { label: 'Latency ms', data: traffic.map(t => t.latency_ms), borderColor: THEME.amber, backgroundColor: THEME.amberA, borderWidth: 1.5, tension: 0.4, fill: false, pointRadius: 0, yAxisID: 'y2' },
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'top' } },
        scales: {
          x: { grid: makeGridOpts() },
          y: { grid: makeGridOpts(), position: 'left', ticks: { callback: v => v > 1000 ? (v/1000).toFixed(0)+'K' : v } },
          y2: { position: 'right', grid: { display: false }, ticks: { color: THEME.amber } }
        }
      }
    });
  }

  const logEl = document.getElementById('ep-log');
  if (logEl && ep.log_events && ep.log_events.length) {
    logEl.innerHTML = ep.log_events.map(e => {
      const cls = 'log-type-' + e.severity.toLowerCase();
      return `<div class="log-line"><span class="log-ts">${e.time.slice(11,19)}</span><span class="${cls}">[${e.type}]</span><span class="log-src">${e.src}</span><span class="log-port">:${e.port}</span></div>`;
    }).join('');
  } else if (logEl) {
    logEl.innerHTML = '<div class="log-line"><span class="log-ts">——</span><span class="log-type-low">No log events found</span></div>';
  }
}
