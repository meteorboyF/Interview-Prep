<script lang="ts">
  import Player from './Player.svelte';
  import WavePlot from './WavePlot.svelte';
  import { clamper, revealFrames } from '../../lib/algos/electronics';

  let type = $state<'positive' | 'negative'>('positive');
  let Vm = $state(4);
  let bias = $state(0);

  const samples = $derived(clamper(type, Vm, bias));
  const shift = $derived(samples.length ? samples[0].vout - samples[0].vin : 0);
  const frames = $derived(
    revealFrames(samples, (s) => `Shape unchanged, shifted by a DC level of ${shift >= 0 ? '+' : ''}${shift.toFixed(1)} V. Vin ${s.vin.toFixed(1)} → Vout ${s.vout.toFixed(1)}.`)
  );
  const thresholds = $derived([{ y: bias, label: `clamp to ${bias}V` }]);
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Clamper
      <select bind:value={type}>
        <option value="positive">Positive (min sits at level)</option>
        <option value="negative">Negative (max sits at level)</option>
      </select>
    </label>
    <label>Peak Vm <input type="range" min="2" max="8" step="0.5" bind:value={Vm} /><span class="val">{Vm} V</span></label>
    <label>Clamp level <input type="range" min="-4" max="4" step="0.5" bind:value={bias} /><span class="val">{bias} V</span></label>
  </div>
  <p class="note">A clamper shifts the whole waveform's DC level <em>without changing its shape</em> — contrast with a clipper.</p>
  {#key `${type}-${Vm}-${bias}`}
    <Player {frames} baseDelay={55}>
      {#snippet children({ frame })}
        <WavePlot {samples} reveal={frame.reveal} vMax={Vm + Math.abs(bias) + 2} {thresholds} />
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--text-faint)"></i>input</span>
        <span><i class="sw" style="background:var(--accent)"></i>clamped (DC-shifted) output</span>
        <span><i class="sw" style="background:var(--viz-window)"></i>clamp level</span>
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
