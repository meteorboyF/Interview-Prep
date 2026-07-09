<script lang="ts">
  import Player from './Player.svelte';
  import DPTable from './DPTable.svelte';
  import { matrixChain } from '../../lib/algos/dp';

  let dims = $state('40, 20, 30, 10, 30');
  let error = $state('');
  const result = $derived.by(() => {
    const p = dims.split(/[,\s]+/).filter(Boolean).map(Number);
    if (p.length < 3 || p.some((x) => !Number.isFinite(x) || x < 1)) {
      error = 'Enter at least 3 positive dimensions (n+1 values for n matrices).';
      return matrixChain([40, 20, 30, 10, 30]);
    }
    error = '';
    return matrixChain(p.slice(0, 7));
  });
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label class="grow">Dimensions p (matrix Aᵢ is p[i-1]×p[i]) <input type="text" bind:value={dims} /></label>
  </div>
  {#if error}<p class="err">{error}</p>{/if}
  {#key dims}
    <Player frames={result.frames} baseDelay={650}>
      {#snippet children({ frame })}
        <DPTable {frame} rowLabels={result.labels} colLabels={result.labels} corner="m[i][j]" />
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>cell being computed</span>
        <span><i class="sw" style="background:var(--viz-window)"></i>sub-chains combined</span>
        <span>Hatched = unused lower triangle</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  input { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); width: 100%; }
  .err { color: var(--danger); font-size: 0.85rem; margin: 0 0 0.5rem; }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
