<script lang="ts">
  import Player from './Player.svelte';
  import WGraph from './WGraph.svelte';
  import { bfSample, bellmanFord, type WFrame } from '../../lib/algos/weighted';

  const graph = bfSample();
  let start = $state(0);
  const frames = $derived<WFrame[]>(bellmanFord(graph, start));
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Source
      <select bind:value={start}>
        {#each graph.nodes as n}<option value={n.id}>{n.id}</option>{/each}
      </select>
    </label>
    <span class="note">Directed graph with negative edges — Dijkstra can't handle this, Bellman-Ford can.</span>
  </div>
  {#key start}
    <Player {frames} baseDelay={800}>
      {#snippet children({ frame })}
        <WGraph {graph} {frame} />
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>edge being relaxed</span>
        <span><i class="sw" style="background:var(--viz-active)"></i>from</span>
        <span><i class="sw" style="background:var(--viz-compare)"></i>updated node</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  select { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .note { font-size: 0.8rem; color: var(--text-faint); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
