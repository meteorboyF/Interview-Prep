<script lang="ts">
  import Player from './Player.svelte';
  import DPTable from './DPTable.svelte';
  import { lcs } from '../../lib/algos/dp';

  let X = $state('AGCAT');
  let Y = $state('GAC');
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8);
  const result = $derived(lcs(clean(X) || 'A', clean(Y) || 'A'));
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>String X <input type="text" bind:value={X} maxlength="8" /></label>
    <label>String Y <input type="text" bind:value={Y} maxlength="8" /></label>
    <span class="note">Letters only, up to 8 each.</span>
  </div>
  {#key `${clean(X)}|${clean(Y)}`}
    <Player frames={result.frames} baseDelay={550}>
      {#snippet children({ frame })}
        <DPTable {frame} rowLabels={result.rowLabels} colLabels={result.colLabels} corner="X \ Y" />
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>current cell</span>
        <span><i class="sw" style="background:var(--viz-window)"></i>dependencies</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>LCS traceback</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  input { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); text-transform: uppercase; width: 8rem; letter-spacing: 0.1em; }
  .note { font-size: 0.8rem; color: var(--text-faint); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
