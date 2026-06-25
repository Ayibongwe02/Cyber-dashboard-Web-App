export const THEME = {
  cream: '#F9F6F0',
  card: '#FFFFFF',
  border: '#EAE5D9',
  charcoal: '#1A1D20',
  charcoal60: 'rgba(26,29,32,0.6)',
  charcoal20: 'rgba(26,29,32,0.12)',
  crimson: '#D9534F',
  crimsonA: 'rgba(217,83,79,0.15)',
  sage: '#6E8E75',
  sageA: 'rgba(110,142,117,0.15)',
  amber: '#E29578',
  amberA: 'rgba(226,149,120,0.15)',
  blue: '#4A7FA5',
  blueA: 'rgba(74,127,165,0.15)',
};

export function applyGlobalDefaults() {
  Chart.defaults.font.family = "'DM Mono', monospace";
  Chart.defaults.font.size = 10;
  Chart.defaults.color = THEME.charcoal60;
  Chart.defaults.borderColor = THEME.border;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = THEME.charcoal;
  Chart.defaults.plugins.tooltip.titleColor = '#fff';
  Chart.defaults.plugins.tooltip.bodyColor = 'rgba(255,255,255,0.7)';
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;
  Chart.defaults.animation.duration = 600;
  Chart.defaults.animation.easing = 'easeInOutQuart';
}

export function makeGridOpts(color = THEME.border) {
  return { color, drawBorder: false, lineWidth: 1 };
}

export function destroyChart(ref) {
  if (ref && ref.destroy) ref.destroy();
}
