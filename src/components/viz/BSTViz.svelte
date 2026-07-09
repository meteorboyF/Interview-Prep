<script lang="ts">
  import Player from './Player.svelte';
  import { buildBST, insertFrames, searchFrames, deleteFrames, traversalFrames, type BNode, type BSTFrame } from '../../lib/algos/bst';

  let root = $state<BNode | null>(buildBST([50, 30, 70, 20, 40, 60, 80, 35]));
  let value = $state(45);
  let frames = $state<BSTFrame[]>(traversalFrames(root, 'in'));
  let runToken = $state(0);

  function run(newFrames: BSTFrame[], newRoot?: BNode | null) {
    frames = newFrames;
    if (newRoot !== undefined) root = newRoot;
    runToken++;
  }
  function doInsert() { const r = insertFrames(root, value); run(r.frames, r.root); value = Math.floor(Math.random() * 99) + 1; }
  function doSearch() { run(searchFrames(root, value)); }
  function doDelete() { const r = deleteFrames(root, value); run(r.frames, r.root); }
  function doTraversal(k: 'in' | 'pre' | 'post' | 'level') { run(traversalFrames(root, k)); }
  function reset() { root = buildBST([50, 30, 70, 20, 40, 60, 80, 35]); run(traversalFrames(root, 'in')); }

  function cls(f: BSTFrame, id: number) {
    if (f.active === id) return f.found ? 'found' : 'active';
    if (f.visited?.includes(id)) return 'visited';
    if (f.path?.includes(id)) return 'path';
    return '';
  }
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Value <input type="number" bind:value class="num" /></label>
    <button class="btn btn-primary" onclick={doInsert}>Insert</button>
    <button class="btn" onclick={doSearch}>Search</button>
    <button class="btn" onclick={doDelete}>Delete</button>
    <button class="btn" onclick={reset}>Reset</button>
  </div>
  <div class="op-row">
    <span class="lbl">Traversals:</span>
    <button class="btn small" onclick={() => doTraversal('in')}>In-order</button>
    <button class="btn small" onclick={() => doTraversal('pre')}>Pre-order</button>
    <button class="btn small" onclick={() => doTraversal('post')}>Post-order</button>
    <button class="btn small" onclick={() => doTraversal('level')}>Level-order</button>
  </div>

  {#key runToken}
    <Player {frames} baseDelay={800}>
      {#snippet children({ frame })}
        <svg viewBox="0 0 100 100" class="tree-svg" role="img" aria-label="Binary search tree">
          {#each frame.edges as e}
            <line x1={e.from[0]} y1={e.from[1]} x2={e.to[0]} y2={e.to[1]} stroke="var(--border)" stroke-width="0.6" />
          {/each}
          {#each frame.nodes as n (n.id)}
            <g class="tnode {cls(frame, n.id)}">
              <circle cx={n.x} cy={n.y} r="5" />
              <text x={n.x} y={n.y} dy="1.7" text-anchor="middle">{n.val}</text>
            </g>
          {/each}
          {#if !frame.nodes.length}<text x="50" y="50" text-anchor="middle" class="empty">empty tree</text>{/if}
        </svg>
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-active)"></i>examining</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>visited</span>
        <span><i class="sw" style="background:var(--viz-compare)"></i>path</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar, .op-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .num { width: 5rem; font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .btn.small { padding: 0.3rem 0.6rem; font-size: 0.82rem; }
  .lbl { font-size: 0.8rem; color: var(--text-soft); font-weight: 600; }
  .tree-svg { width: 100%; height: auto; aspect-ratio: 1 / 0.85; max-height: 360px; }
  .tnode circle { fill: var(--bg-soft); stroke: var(--text-soft); stroke-width: 0.6; transition: fill 0.2s, stroke 0.2s; }
  .tnode text { font-size: 3.4px; font-weight: 700; fill: var(--text); }
  .tnode.path circle { fill: color-mix(in srgb, var(--viz-compare) 30%, var(--bg)); stroke: var(--viz-compare); }
  .tnode.active circle { fill: var(--viz-active); stroke: var(--viz-active); } .tnode.active text { fill: #fff; }
  .tnode.found circle { fill: var(--viz-sorted); stroke: var(--viz-sorted); } .tnode.found text { fill: #fff; }
  .tnode.visited circle { fill: color-mix(in srgb, var(--viz-sorted) 55%, var(--bg)); stroke: var(--viz-sorted); }
  .empty { font-size: 5px; fill: var(--text-faint); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
