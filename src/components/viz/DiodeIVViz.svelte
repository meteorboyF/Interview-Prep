<script lang="ts">
  import { diodeCurve, diodeCurrent } from '../../lib/algos/electronics';

  let V = $state(0.75);
  const Vbr = -6;
  const curve = diodeCurve(Vbr);
  const I = $derived(diodeCurrent(V, 0.7, Vbr));

  // plot space: v in [-7.5, 1], i in [-12, 12]
  const W = 100, H = 72;
  const vMin = -7.5, vMax = 1, iMin = -12, iMax = 12;
  const xOf = (v: number) => 8 + ((v - vMin) / (vMax - vMin)) * 88;
  const yOf = (i: number) => 4 + ((iMax - i) / (iMax - iMin)) * (H - 10);

  const path = curve.map((p, k) => (k === 0 ? 'M' : 'L') + xOf(p.v).toFixed(2) + ' ' + yOf(p.i).toFixed(2)).join(' ');

  const region = $derived(
    V >= 0.6 ? { name: 'Forward conduction', desc: 'Past the ~0.7 V knee — current rises steeply; the diode acts like a closed switch (with a small drop).' }
    : V >= 0 ? { name: 'Forward, below knee', desc: 'Forward-biased but below the ~0.7 V knee — very little current flows yet.' }
    : V > Vbr ? { name: 'Reverse leakage', desc: 'Reverse-biased — only a tiny leakage current; the diode blocks like an open switch.' }
    : { name: 'Reverse breakdown', desc: 'Past the breakdown voltage — reverse current increases sharply (this is the Zener operating region).' }
  );
</script>

<div class="viz">
  <svg viewBox="0 0 100 72" class="iv-svg" role="img" aria-label="Diode I-V characteristic curve">
    <!-- axes -->
    <line x1={xOf(vMin)} y1={yOf(0)} x2={xOf(vMax)} y2={yOf(0)} class="axis" />
    <line x1={xOf(0)} y1={yOf(iMax)} x2={xOf(0)} y2={yOf(iMin)} class="axis" />
    <text x={xOf(vMax)} y={yOf(0) - 1} text-anchor="end" class="axlbl">V</text>
    <text x={xOf(0) + 1.5} y={yOf(iMax) + 2} class="axlbl">I (mA)</text>
    <!-- knee & breakdown markers -->
    <line x1={xOf(0.7)} y1={yOf(0)} x2={xOf(0.7)} y2={yOf(iMax)} class="marker" />
    <text x={xOf(0.7)} y={yOf(iMax) + 2} text-anchor="middle" class="mlbl">0.7V</text>
    <line x1={xOf(Vbr)} y1={yOf(0)} x2={xOf(Vbr)} y2={yOf(iMin)} class="marker" />
    <text x={xOf(Vbr)} y={yOf(iMin) - 0.5} text-anchor="middle" class="mlbl">breakdown</text>
    <!-- curve -->
    <path d={path} class="curve" />
    <!-- operating point -->
    <line x1={xOf(V)} y1={yOf(0)} x2={xOf(V)} y2={yOf(I)} class="drop" />
    <line x1={xOf(0)} y1={yOf(I)} x2={xOf(V)} y2={yOf(I)} class="drop" />
    <circle cx={xOf(V)} cy={yOf(I)} r="1.6" class="op" />
  </svg>

  <div class="controls">
    <label>Applied voltage
      <input type="range" min={-7} max={1} step="0.05" bind:value={V} />
    </label>
    <div class="readout">
      <span>V = <strong>{V.toFixed(2)} V</strong></span>
      <span>I = <strong>{I.toFixed(2)} mA</strong></span>
    </div>
  </div>
  <div class="region card">
    <strong>{region.name}</strong>
    <p>{region.desc}</p>
  </div>
</div>

<style>
  .iv-svg { width: 100%; height: auto; aspect-ratio: 100 / 72; background: var(--bg-soft); border-radius: 8px; }
  .axis { stroke: var(--text-soft); stroke-width: 0.4; }
  .axlbl { font-size: 2.4px; fill: var(--text-soft); font-weight: 700; }
  .marker { stroke: var(--viz-window); stroke-width: 0.3; stroke-dasharray: 1 0.8; }
  .mlbl { font-size: 2px; fill: var(--viz-window); }
  .curve { fill: none; stroke: var(--accent); stroke-width: 1; }
  .drop { stroke: var(--viz-compare); stroke-width: 0.4; stroke-dasharray: 1 0.6; }
  .op { fill: var(--viz-compare); stroke: var(--bg); stroke-width: 0.4; }
  .controls { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; margin-top: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; flex: 1; min-width: 200px; }
  input[type='range'] { accent-color: var(--accent); }
  .readout { display: flex; gap: 1rem; font-variant-numeric: tabular-nums; font-size: 0.9rem; }
  .readout strong { color: var(--accent); }
  .region { padding: 0.7rem 0.9rem; margin-top: 0.7rem; }
  .region strong { color: var(--text); }
  .region p { margin: 0.2rem 0 0; font-size: 0.86rem; color: var(--text-soft); }
</style>
