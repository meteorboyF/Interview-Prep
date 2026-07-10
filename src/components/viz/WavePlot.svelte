<script lang="ts">
  import type { Sample } from '../../lib/algos/electronics';
  interface Props {
    samples: Sample[];
    reveal: number;
    vMax: number;
    inLabel?: string;
    outLabel?: string;
    thresholds?: { y: number; label: string }[];
  }
  let { samples, reveal, vMax, inLabel = 'Vin', outLabel = 'Vout', thresholds = [] }: Props = $props();

  // SVG coordinate space
  const W = 100, H = 60, padL = 6, padR = 2, padT = 4, padB = 4;
  const x0 = padL, x1 = W - padR, yMid = H / 2;
  const plotW = x1 - x0, plotH = H - padT - padB;

  const tMax = $derived(samples.length ? samples[samples.length - 1].t : 1);
  const xOf = (t: number) => x0 + (t / tMax) * plotW;
  const yOf = (v: number) => yMid - (v / (vMax * 1.1)) * (plotH / 2);

  function path(key: 'vin' | 'vout', upto: number): string {
    let d = '';
    for (let i = 0; i <= upto && i < samples.length; i++) {
      const s = samples[i];
      d += (i === 0 ? 'M' : 'L') + xOf(s.t).toFixed(2) + ' ' + yOf(s[key]).toFixed(2) + ' ';
    }
    return d;
  }
  const cur = $derived(samples[Math.min(reveal, samples.length - 1)]);
</script>

<div class="wp">
  <svg viewBox="0 0 100 60" class="wave-svg" role="img" aria-label="Waveform plot">
    <!-- grid / axes -->
    <line x1={x0} y1={yMid} x2={x1} y2={yMid} class="axis" />
    <line x1={x0} y1={padT} x2={x0} y2={H - padB} class="axis" />
    {#each thresholds as th}
      <line x1={x0} y1={yOf(th.y)} x2={x1} y2={yOf(th.y)} class="threshold" />
      <text x={x1} y={yOf(th.y) - 0.6} text-anchor="end" class="th-label">{th.label}</text>
    {/each}
    <!-- input (faint dashed) and output (solid) -->
    <path d={path('vin', reveal)} class="vin-path" />
    <path d={path('vout', reveal)} class="vout-path" />
    <!-- sweep cursor -->
    {#if cur}
      <line x1={xOf(cur.t)} y1={padT} x2={xOf(cur.t)} y2={H - padB} class="cursor" />
      <circle cx={xOf(cur.t)} cy={yOf(cur.vout)} r="1.2" class="dot-out" />
      <circle cx={xOf(cur.t)} cy={yOf(cur.vin)} r="1" class="dot-in" />
    {/if}
  </svg>
  {#if cur}
    <div class="readout">
      <span class="in">{inLabel} = {cur.vin.toFixed(2)} V</span>
      <span class="out">{outLabel} = {cur.vout.toFixed(2)} V</span>
    </div>
  {/if}
</div>

<style>
  .wave-svg { width: 100%; height: auto; aspect-ratio: 100 / 60; background: var(--bg-soft); border-radius: 8px; }
  .axis { stroke: var(--border); stroke-width: 0.3; }
  .threshold { stroke: var(--viz-window); stroke-width: 0.25; stroke-dasharray: 1 1; }
  .th-label { font-size: 2px; fill: var(--viz-window); }
  .vin-path { fill: none; stroke: var(--text-faint); stroke-width: 0.5; stroke-dasharray: 1.2 1; opacity: 0.8; }
  .vout-path { fill: none; stroke: var(--accent); stroke-width: 0.9; }
  .cursor { stroke: var(--viz-compare); stroke-width: 0.25; opacity: 0.7; }
  .dot-out { fill: var(--accent); }
  .dot-in { fill: var(--text-faint); }
  .readout { display: flex; gap: 1.2rem; font-size: 0.82rem; margin-top: 0.4rem; font-variant-numeric: tabular-nums; }
  .readout .in { color: var(--text-soft); }
  .readout .out { color: var(--accent); font-weight: 700; }
</style>
