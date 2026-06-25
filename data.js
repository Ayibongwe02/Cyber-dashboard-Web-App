export const DataStore = {
  raw: null,
  kpis: null,
  liveTraffic: [],
  forecast: null,
  endpoints: {},
  anomalies: [],
  _listeners: [],

  async fetch() {
    try {
      const res = await fetch(`data/cyber_dashboard.json?_t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      this.raw = json;
      this.kpis = json.kpis;
      this.liveTraffic = json.live_traffic || [];
      this.forecast = json.forecast || null;
      this.endpoints = json.endpoints || {};
      this.anomalies = json.anomalies || [];
      this._notify();
      return true;
    } catch (e) {
      console.error('[DataStore] fetch failed:', e);
      return false;
    }
  },

  onUpdate(fn) { this._listeners.push(fn); },
  _notify() { this._listeners.forEach(fn => fn(this)); },

  getAnomaliesByClass(cls) {
    if (!cls || cls === 'ALL') return this.anomalies;
    return this.anomalies.filter(a => a.classification === cls);
  },

  getClassifications() {
    return ['ALL', ...new Set(this.anomalies.map(a => a.classification))];
  }
};
