<script lang="ts">
  import Player from './Player.svelte';
  import WavePlot from './WavePlot.svelte';
  import { clipper, revealFrames } from '../../lib/algos/electronics';

  let type = $state<'positive' | 'negative' | 'both'>('positive');
  let Vm = $state(5);
  let posLevel = $state(2);
  let negLevel = $state(-2);

  const samples = $derived(clipper(type, Vm, posLevel, negLevel));
  const frames = $derived(
    revealFrames(samples, (s) => {
      if (s.on) return `Clipped: the diode conducts and holds the output at the clip level (${s.vout.toFixed(1)} V).`;
      return `Passing through unchanged: Vout follows Vin (${s.vin.toFixed(1)} V).`;
    })
  );
  const thresholds = $derived([
    ...(type !== 'negative' ? [{ y: posLevel, label: `+clip ${posLevel}V` }] : []),
    ...(type !== 'positive' ? [{ y: negLevel, label: `−clip ${negLevel}V` }] : []),
  ]);
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Clipper
      <select bind:value={type}>
        <option value="positive">Positive (clip the top)</option>
        <option value="negative">Negative (clip the bottom)</option>
        <option value="both">Double (clip both)</option>
      </select>
    </label>
    <label>Peak Vm <input type="range" min="2" max="10" step="0.5" bind:value={Vm} /><span class="val">{Vm} V</span></label>
    {#if type !== 'negative'}
      <label>Top level <input type="range" min="0" max="8" step="0.5" bind:value={posLevel} /><span class="val">{posLevel} V</span></label>
    {/if}
    {#if type !== 'positive'}
      <label>Bottom level <input type="range" min="-8" max="0" step="0.5" bind:value={negLevel} /><span class="val">{negLevel} V</span></label>
    {/if}
  </div>
  <p class="note">A clipper removes part of the waveform above/below a reference level, changing its <em>shape</em>.</p>
  {#key `${type}-${Vm}-${posLevel}-${negLevel}`}
    <Player {frames} baseDelay={55}>
      {#snippet children({ frame })}
        <WavePlot {samples} reveal={frame.reveal} vMax={Vm} {thresholds} />
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--text-faint)"></i>input</span>
        <span><i class="sw" style="background:var(--accent)"></i>clipped output</span>
        <span><i class="sw" style="background:var(--viz-window)"></i>clip level</span>
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
