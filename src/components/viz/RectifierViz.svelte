<script lang="ts">
  import Player from './Player.svelte';
  import WavePlot from './WavePlot.svelte';
  import { rectifier, revealFrames } from '../../lib/algos/electronics';

  let mode = $state<'half' | 'full' | 'filtered'>('half');
  let Vm = $state(5);

  const samples = $derived(rectifier(mode, Vm));
  const frames = $derived(
    revealFrames(samples, (s) => {
      if (mode === 'filtered') return s.on ? `Capacitor charging to the peak (Vout ≈ ${s.vout.toFixed(1)} V).` : `Diodes off — capacitor discharges through the load, causing ripple.`;
      if (mode === 'half') return s.on ? `Positive half-cycle: diode forward-biased, conducting. Vout = Vin − 0.7.` : `Negative half-cycle: diode reverse-biased, blocking. Vout = 0.`;
      return s.on ? `Bridge conducts (this half-cycle's diodes forward-biased). Vout = |Vin| − drop.` : `Near zero-crossing: below the diode drop, output ≈ 0.`;
    })
  );
  const label = { half: 'Half-wave', full: 'Full-wave (bridge)', filtered: 'Full-wave + capacitor filter' };
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Circuit
      <select bind:value={mode}>
        <option value="half">Half-wave rectifier</option>
        <option value="full">Full-wave bridge rectifier</option>
        <option value="filtered">Full-wave + capacitor filter</option>
      </select>
    </label>
    <label>Peak Vm
      <input type="range" min="2" max="10" step="0.5" bind:value={Vm} />
      <span class="val">{Vm} V</span>
    </label>
  </div>
  <p class="note">{label[mode]}: dashed grey = AC input, solid = rectified output (diode drop 0.7 V).</p>
  {#key `${mode}-${Vm}`}
    <Player {frames} baseDelay={55}>
      {#snippet children({ frame })}
        <WavePlot {samples} reveal={frame.reveal} vMax={Vm} />
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--text-faint)"></i>AC input</span>
        <span><i class="sw" style="background:var(--accent)"></i>rectified output</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; margin-bottom: 0.6rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  label:has(input[type='range']) { flex-direction: row; align-items: center; gap: 0.5rem; }
  select { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  input[type='range'] { accent-color: var(--accent); }
  .val { font-variant-numeric: tabular-nums; color: var(--text); }
  .note { font-size: 0.82rem; color: var(--text-faint); margin: 0 0 0.6rem; }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
