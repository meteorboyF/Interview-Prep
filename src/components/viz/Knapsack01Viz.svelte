<script lang="ts">
  import Player from './Player.svelte';
  import DPTable from './DPTable.svelte';
  import { knapsack01 } from '../../lib/algos/dp';

  let weights = $state('2, 3, 4, 5');
  let values = $state('3, 4, 5, 6');
  let capacity = $state(8);
  let error = $state('');

  const parsed = $derived.by(() => {
    try {
      const w = weights.split(/[,\s]+/).filter(Boolean).map(Number);
      const v = values.split(/[,\s]+/).filter(Boolean).map(Number);
      if (w.length !== v.length) throw new Error('Weights and values must have the same count.');
      if (w.some((x) => !Number.isFinite(x) || x < 1) || v.some((x) => !Number.isFinite(x))) throw new Error('Positive numbers only.');
      const W = Math.max(1, Math.min(14, Math.round(capacity)));
      error = '';
      return knapsack01(w.slice(0, 5), v.slice(0, 5), W);
    } catch (e) {
      error = (e as Error).message;
      return knapsack01([2, 3], [3, 4], 5);
    }
  });
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label class="grow">Weights <input type="text" bind:value={weights} /></label>
    <label class="grow">Values <input type="text" bind:value={values} /></label>
    <label>Capacity <input type="number" bind:value={capacity} class="num" min="1" max="14" /></label>
  </div>
  {#if error}<p class="err">{error}</p>{/if}
  {#key `${weights}|${values}|${capacity}`}
    <Player frames={parsed.frames} baseDelay={550}>
      {#snippet children({ frame })}
        <DPTable {frame} rowLabels={parsed.rowLabels} colLabels={parsed.colLabels} corner="i \ w" />
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>current cell</span>
        <span><i class="sw" style="background:var(--viz-window)"></i>cells it depends on</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .grow { flex: 1; min-width: 140px; }
  input { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .num { width: 5rem; }
  .err { color: var(--danger); font-size: 0.85rem; margin: 0 0 0.5rem; }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
