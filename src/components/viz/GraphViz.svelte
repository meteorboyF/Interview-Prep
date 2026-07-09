<script lang="ts">
  import Player from './Player.svelte';
  import { bfs, dfs, topoSort, sampleGraph, type Graph, type GraphFrame } from '../../lib/algos/graph';

  let algo = $state<'bfs' | 'dfs' | 'topo'>('bfs');
  let graph = $state<Graph>(sampleGraph(false));
  let start = $state(0);
  let selected = $state<number | null>(null);
  let editHint = $state('Tip: click empty space to add a node; click two nodes to connect them.');
  let svgEl: SVGSVGElement;

  const directed = $derived(algo === 'topo' ? true : graph.directed);

  const frames = $derived.by<GraphFrame[]>(() => {
    const g = { ...graph, directed };
    if (algo === 'bfs') return bfs(g, start);
    if (algo === 'dfs') return dfs(g, start);
    return topoSort(g);
  });

  function svgPoint(e: MouseEvent) {
    const rect = svgEl.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 92 };
  }
  function addNode(e: MouseEvent) {
    if ((e.target as Element).tagName !== 'svg' && (e.target as Element).classList?.contains('gnode') !== false) {
      // only background clicks
    }
    if ((e.target as Element).tagName !== 'svg') return;
    const p = svgPoint(e);
    const id = graph.nodes.length ? Math.max(...graph.nodes.map((n) => n.id)) + 1 : 0;
    graph = { ...graph, nodes: [...graph.nodes, { id, x: Math.round(p.x), y: Math.round(p.y) }] };
    editHint = `Added node ${id}.`;
  }
  function clickNode(id: number) {
    if (selected === null) { selected = id; editHint = `Selected ${id}. Click another node to add an edge, or the same node to deselect.`; return; }
    if (selected === id) { selected = null; editHint = 'Deselected.'; return; }
    const exists = graph.edges.some((e) => (e.u === selected && e.v === id) || (!directed && e.u === id && e.v === selected));
    if (!exists) graph = { ...graph, edges: [...graph.edges, { u: selected!, v: id }] };
    editHint = `Edge ${selected} → ${id} added.`;
    selected = null;
  }
  function reset() { graph = sampleGraph(graph.directed); start = 0; selected = null; editHint = 'Reset to sample graph.'; }
  function toggleDirected() { graph = { ...graph, directed: !graph.directed }; }
  function nodeById(id: number) { return graph.nodes.find((n) => n.id === id)!; }

  function nodeClass(f: GraphFrame, id: number) {
    if (f.current === id) return 'current';
    if (f.visited?.includes(id)) return 'visited';
    if (f.frontier?.includes(id)) return 'frontier';
    return '';
  }
  function edgeActive(f: GraphFrame, u: number, v: number) {
    if (!f.activeEdge) return false;
    const [a, b] = f.activeEdge;
    return (a === u && b === v) || (!directed && a === v && b === u);
  }
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Algorithm
      <select bind:value={algo}>
        <option value="bfs">BFS (queue)</option>
        <option value="dfs">DFS (stack)</option>
        <option value="topo">Topological sort (Kahn)</option>
      </select>
    </label>
    {#if algo !== 'topo'}
      <label>Start
        <select bind:value={start}>
          {#each graph.nodes as n}<option value={n.id}>{n.id}</option>{/each}
        </select>
      </label>
      <label class="chk"><input type="checkbox" checked={graph.directed} onchange={toggleDirected} /> Directed</label>
    {:else}
      <span class="note">Topological sort treats the graph as directed.</span>
    {/if}
    <button class="btn" onclick={reset}>Reset graph</button>
  </div>

  {#key `${algo}-${directed}-${start}-${JSON.stringify(graph.edges)}-${graph.nodes.length}`}
    <Player {frames} baseDelay={900}>
      {#snippet children({ frame })}
        <div class="graph-wrap">
          <svg bind:this={svgEl} viewBox="0 0 100 92" class="graph-svg" onclick={addNode} role="application" aria-label="Interactive graph">
            <defs>
              <marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--text-soft)" /></marker>
              <marker id="arrow-active" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-compare)" /></marker>
            </defs>
            {#each graph.edges as e (e.u + '-' + e.v)}
              {@const a = nodeById(e.u)}
              {@const b = nodeById(e.v)}
              {@const act = edgeActive(frame, e.u, e.v)}
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={act ? 'var(--viz-compare)' : 'var(--border)'} stroke-width={act ? 1.4 : 0.8}
                marker-end={directed ? (act ? 'url(#arrow-active)' : 'url(#arrow)') : ''} />
            {/each}
            {#each graph.nodes as n (n.id)}
              <g class="gnode {nodeClass(frame, n.id)}" class:sel={selected === n.id} onclick={(e) => { e.stopPropagation(); clickNode(n.id); }} role="button" tabindex="0">
                <circle cx={n.x} cy={n.y} r="5.5" />
                <text x={n.x} y={n.y} dy="1.8" text-anchor="middle">{n.id}</text>
              </g>
            {/each}
          </svg>
          {#if frame.order?.length}
            <div class="order">Order: {frame.order.join(' → ')}</div>
          {/if}
        </div>
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-active)"></i>current</span>
        <span><i class="sw" style="background:var(--viz-compare)"></i>frontier</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>visited</span>
      {/snippet}
    </Player>
  {/key}
  <p class="edit-hint">{editHint}</p>
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .chk { flex-direction: row; align-items: center; gap: 0.3rem; }
  select { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .note, .edit-hint { font-size: 0.8rem; color: var(--text-faint); }
  .edit-hint { margin-top: 0.5rem; }
  .graph-wrap { position: relative; }
  .graph-svg { width: 100%; height: auto; aspect-ratio: 100 / 92; touch-action: none; cursor: crosshair; }
  .gnode { cursor: pointer; }
  .gnode circle { fill: var(--bg-soft); stroke: var(--text-soft); stroke-width: 0.7; transition: fill 0.2s, stroke 0.2s; }
  .gnode text { font-size: 4px; font-weight: 700; fill: var(--text); pointer-events: none; }
  .gnode.frontier circle { fill: color-mix(in srgb, var(--viz-compare) 40%, var(--bg)); stroke: var(--viz-compare); }
  .gnode.visited circle { fill: color-mix(in srgb, var(--viz-sorted) 40%, var(--bg)); stroke: var(--viz-sorted); }
  .gnode.current circle { fill: var(--viz-active); stroke: var(--viz-active); }
  .gnode.current text { fill: #fff; }
  .gnode.sel circle { stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 2 1; }
  .order { position: absolute; bottom: 0.3rem; left: 0.5rem; font-size: 0.8rem; color: var(--text-soft); background: color-mix(in srgb, var(--bg) 80%, transparent); padding: 0.1rem 0.4rem; border-radius: 6px; }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
