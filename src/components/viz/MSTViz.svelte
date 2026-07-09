<script lang="ts">
  import Player from './Player.svelte';
  import WGraph from './WGraph.svelte';
  import { wSample, kruskal, prim, type WFrame } from '../../lib/algos/weighted';

  let algo = $state<'kruskal' | 'prim'>('kruskal');
  const graph = wSample();
  const frames = $derived<WFrame[]>(algo === 'kruskal' ? kruskal(graph) : prim(graph, 0));
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Algorithm
      <select bind:value={algo}>
        <option value="kruskal">Kruskal (sort + union-find)</option>
        <option value="prim">Prim (grow from a node)</option>
      </select>
    </label>
  </div>
  {#key algo}
    <Player {frames} baseDelay={950}>
      {#snippet children({ frame })}
        <WGraph {graph} {frame} />
        {#if frame.side}<div class="side">{frame.side}</div>{/if}
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>considering</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>in MST</span>
        <span><i class="sw" style="background:var(--danger)"></i>rejected (cycle)</span>
        {#if algo === 'prim'}<span><i class="sw" style="background:var(--viz-window)"></i>candidate</span>{/if}
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  select { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .side { margin-top: 0.4rem; font-size: 0.85rem; color: var(--text-soft); font-weight: 600; }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
