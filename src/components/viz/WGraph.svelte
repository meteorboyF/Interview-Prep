<script lang="ts">
  import type { WGraph, WFrame } from '../../lib/algos/weighted';
  interface Props { graph: WGraph; frame: WFrame; }
  let { graph, frame }: Props = $props();

  function node(id: number) { return graph.nodes.find((n) => n.id === id)!; }
  const edgeColor: Record<string, string> = {
    '': 'var(--border)', active: 'var(--viz-compare)', tree: 'var(--viz-sorted)',
    chosen: 'var(--viz-sorted)', rejected: 'var(--danger)', candidate: 'var(--viz-window)',
  };
  function mid(a: { x: number; y: number }, b: { x: number; y: number }) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
</script>

<svg viewBox="0 0 100 92" class="wgraph" role="img" aria-label="Weighted graph">
  <defs>
    <marker id="warrow" markerWidth="7" markerHeight="7" refX="8.5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--text-soft)" /></marker>
  </defs>
  {#each frame.edges as e (e.u + '-' + e.v)}
    {@const a = node(e.u)}
    {@const b = node(e.v)}
    {@const m = mid(a, b)}
    {@const col = edgeColor[e.cls] ?? 'var(--border)'}
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col}
      stroke-width={e.cls && e.cls !== '' ? 1.4 : 0.7}
      stroke-dasharray={e.cls === 'candidate' ? '2 1.5' : ''}
      marker-end={graph.directed ? 'url(#warrow)' : ''} />
    <rect x={m.x - 3} y={m.y - 2.4} width="6" height="4.6" rx="1" fill="var(--bg-elevated)" opacity="0.85" />
    <text x={m.x} y={m.y} dy="1.3" text-anchor="middle" class="wlabel" fill={col}>{e.w}</text>
  {/each}
  {#each graph.nodes as n (n.id)}
    {@const info = frame.nodes[n.id] ?? { cls: '' }}
    <g class="wnode {info.cls}">
      <circle cx={n.x} cy={n.y} r="5.5" />
      <text x={n.x} y={n.y} dy="1.6" text-anchor="middle" class="wid">{n.id}</text>
      {#if info.label !== undefined}
        <text x={n.x} y={n.y - 7.5} text-anchor="middle" class="wdist">{info.label}</text>
      {/if}
    </g>
  {/each}
</svg>

<style>
  .wgraph { width: 100%; height: auto; aspect-ratio: 100 / 92; max-height: 340px; }
  .wlabel { font-size: 3px; font-weight: 700; }
  .wnode circle { fill: var(--bg-soft); stroke: var(--text-soft); stroke-width: 0.7; transition: fill 0.2s, stroke 0.2s; }
  .wnode .wid { font-size: 3.6px; font-weight: 700; fill: var(--text); }
  .wnode .wdist { font-size: 3.4px; font-weight: 800; fill: var(--accent); }
  .wnode.current circle { fill: var(--viz-active); stroke: var(--viz-active); } .wnode.current .wid { fill: #fff; }
  .wnode.visited circle { fill: color-mix(in srgb, var(--viz-sorted) 45%, var(--bg)); stroke: var(--viz-sorted); }
  .wnode.frontier circle { fill: color-mix(in srgb, var(--viz-compare) 40%, var(--bg)); stroke: var(--viz-compare); }
</style>
