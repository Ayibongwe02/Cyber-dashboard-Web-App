import { THEME, makeGridOpts, destroyChart } from './charts.js';
let chartForecast = null;

export function renderPredictive(store) {
  if (!store.forecast) return;
  const { series, metrics } = store.forecast;

  const metricsEl = document.getElementById('pred-metrics');
  if (metricsEl) {
    metricsEl.innerHTML = `
      <div class="metric-box"><span class="val">${metrics.rmse.toLocaleString()}</span><span class="lbl">RMSE · Model Error</span></div>
      <div class="metric-box"><span class="val">${metrics.mape}%</span><span class="lbl">MAPE · Accuracy</span></div>
      <div class="metric-box"><span class="val">${series.filter(s => s.is_forecast).length}</span><span class="lbl">Forward Periods</span></div>
      <div class="metric-box"><span class="val">${series.length}</span><span class="lbl">Total Data Points</span></div>
    `;
  }

  const ctx = document.getElementById('chart-forecast');
  if (!ctx) return;
  destroyChart(chartForecast);

  const hist = series.filter(s => !s.is_forecast);
  const fcast = series.filter(s => s.is_forecast);
  const all = series;

  chartForecast = new Chart(ctx, {
    type: 'line',
    data: {
      labels: all.map(d => d.ds),
      datasets: [
        {
          label: 'Upper Band',
          data: all.map(d => d.yhat_upper),
          borderColor: 'transparent',
          backgroundColor: 'rgba(217,83,79,0.08)',
          fill: '+1',
          tension: 0.4, pointRadius: 0
        },
        {
          label: 'Lower Band',
          data: all.map(d => d.yhat_lower),
          borderColor: 'transparent',
          backgroundColor: 'rgba(217,83,79,0.08)',
          fill: false,
          tension: 0.4, pointRadius: 0
        },
        {
          label: 'Predicted Volume',
          data: all.map(d => d.yhat),
          borderColor: THEME.crimson,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: all.map(d => d.is_forecast ? 0 : 2),
          borderDash: [],
          segment: {
            borderDash: (ctx) => {
              const idx = ctx.p1DataIndex;
              return all[idx] && all[idx].is_forecast ? [4, 3] : [];
            }
          }
        },
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString()}`
          }
        }
      },
      scales: {
        x: { grid: makeGridOpts(), ticks: { maxTicksLimit: 12, maxRotation: 30 } },
        y: { grid: makeGridOpts(), ticks: { callback: v => (v/1000).toFixed(0)+'K' } }
      }
    }
  });

  const tableEl = document.getElementById('forecast-table');
  if (tableEl) {
    const sample = all.slice(-12);
    tableEl.innerHTML = `<table>
      <thead><tr><th>Date</th><th>Predicted (yhat)</th><th>Lower Band</th><th>Upper Band</th><th>Type</th></tr></thead>
      <tbody>${sample.map(d => `
        <tr>
          <td class="mono">${d.ds}</td>
          <td><strong>${Number(d.yhat).toLocaleString()}</strong></td>
          <td class="mono">${Number(d.yhat_lower).toLocaleString()}</td>
          <td class="mono">${Number(d.yhat_upper).toLocaleString()}</td>
          <td><span class="badge ${d.is_forecast ? 'badge-high' : 'badge-low'}">${d.is_forecast ? 'FORECAST' : 'HISTORICAL'}</span></td>
        </tr>`).join('')}
      </tbody></table>`;
  }
}
