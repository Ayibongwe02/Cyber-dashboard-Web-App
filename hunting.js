let activeFilter = 'ALL';

export function renderHunting(store) {
  const classifications = store.getClassifications();
  const filtersEl = document.getElementById('hunting-filters');
  if (filtersEl) {
    filtersEl.innerHTML = classifications.map(c =>
      `<button class="filter-btn${c === activeFilter ? ' active' : ''}" data-cls="${c}">${c}</button>`
    ).join('');
    filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.cls;
        renderHunting(store);
      });
    });
  }

  const anomalies = store.getAnomaliesByClass(activeFilter);
  const countEl = document.getElementById('hunting-count');
  if (countEl) countEl.textContent = `${anomalies.length} anomalies detected · IsolationForest contamination=0.12`;

  const tableEl = document.getElementById('hunting-table');
  if (!tableEl) return;
  if (!anomalies.length) {
    tableEl.innerHTML = '<div style="padding:24px;text-align:center;font-family:DM Mono,monospace;font-size:0.72rem;color:var(--charcoal-60)">No anomalies match current filter</div>';
    return;
  }
  tableEl.innerHTML = `<table>
    <thead><tr>
      <th>Timestamp</th><th>Host</th><th>Classification</th><th>Severity</th>
      <th>Risk</th><th>Payload KB</th><th>Latency ms</th><th>Failed Auth</th>
      <th>Bytes Out MB</th><th>Source IP</th><th>Event</th>
    </tr></thead>
    <tbody>${anomalies.map(a => {
      const rColor = a.risk_score > 70 ? 'var(--crimson)' : a.risk_score > 50 ? 'var(--amber)' : 'var(--sage)';
      return `<tr>
        <td class="mono">${a.timestamp.slice(0,19)}</td>
        <td><strong>${a.host}</strong></td>
        <td style="max-width:200px;white-space:normal;font-size:0.7rem">${a.classification}</td>
        <td><span class="badge badge-${a.severity.toLowerCase()}">${a.severity}</span></td>
        <td><div class="risk-bar-wrap">
          <div class="risk-bar-track"><div class="risk-bar-fill" style="width:${a.risk_score}%;background:${rColor}"></div></div>
          <span class="risk-val" style="color:${rColor}">${a.risk_score}</span>
        </div></td>
        <td class="mono">${a.payload_size_kb.toLocaleString()}</td>
        <td class="mono">${a.response_latency_ms.toLocaleString()}</td>
        <td class="mono">${a.failed_auth_count}</td>
        <td class="mono">${a.bytes_out_mb.toLocaleString()}</td>
        <td class="mono" style="color:var(--charcoal-60)">${a.source_ip}</td>
        <td><span class="badge badge-${a.severity.toLowerCase()}">${a.event_type}</span></td>
      </tr>`;
    }).join('')}
    </tbody></table>`;
}
