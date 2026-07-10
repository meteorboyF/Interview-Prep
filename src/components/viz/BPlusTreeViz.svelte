<script lang="ts">
  import Player from './Player.svelte';
  import { buildBTree, insertWithFrames, searchFrames, layout, type BTNode, type BTFrame } from '../../lib/algos/btree';

  let root = $state<BTNode>(buildBTree([10, 20, 5, 6, 12, 30, 7, 17]));
  let value = $state(15);
  let frames = $state<BTFrame[]>([{ ...layout(root), status: 'A balanced multiway index. Insert or search keys to see it work.' }]);
  let token = $state(0);

  function run(f: BTFrame[]) { frames = f; token++; }
  function doInsert() {
    const r = insertWithFrames(root, value);
    root = r.root; run(r.frames);
    value = Math.floor(Math.random() * 40) + 1;
  }
  function doSearch() { run(searchFrames(root, value)); }
  function reset() { root = buildBTree([10, 20, 5, 6, 12, 30, 7, 17]); run([{ ...layout(root), status: 'Reset.' }]); }

  function nodeCls(f: BTFrame, id: number) {
    if (f.active === id) return f.found ? 'found' : 'active';
    return '';
  }
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Key <input type="number" bind:value class="num" /></label>
    <button class="btn btn-primary" onclick={doInsert}>Insert</button>
    <button class="btn" onclick={doSearch}>Search</button>
    <button class="btn" onclick={reset}>Reset</button>
    <span class="note">Order t=2 (max 3 keys/node). B+ tree indexes use the same search &amp; split behaviour.</span>
  </div>

  {#key token}
    <Player {frames} baseDelay={850}>
      {#snippet children({ frame }: { frame: BTFrame })}
        <svg viewBox="0 0 100 100" class="bt-svg" role="img" aria-label="B-tree index">
          {#each frame.edges as e}
            <line x1={e.from[0]} y1={e.from[1] + 3} x2={e.to[0]} y2={e.to[1] - 3} stroke="var(--border)" stroke-width="0.5" />
          {/each}
          {#each frame.nodes as n (n.id)}
            {@const w = Math.max(6, n.keys.length * 6)}
            <g class="bt-node {nodeCls(frame, n.id)}">
              <rect x={n.x - w / 2} y={n.y - 3} width={w} height="6" rx="1.2" />
              {#each n.keys as key, ki}
                <text x={n.x - w / 2 + (ki + 0.5) * (w / n.keys.length)} y={n.y} dy="1.3" text-anchor="middle"
                  class:keyhi={frame.hiKey && frame.hiKey.node === n.id && frame.hiKey.key === key}>{key}</text>
              {/each}
            </g>
          {/each}
        </svg>
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-active)"></i>visiting node</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>found</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .num { width: 5rem; font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .note { font-size: 0.78rem; color: var(--text-faint); }
  .bt-svg { width: 100%; height: auto; aspect-ratio: 1 / 0.75; max-height: 340px; }
  .bt-node rect { fill: var(--bg-soft); stroke: var(--text-soft); stroke-width: 0.5; transition: fill 0.2s, stroke 0.2s; }
  .bt-node text { font-size: 3px; font-weight: 700; fill: var(--text); }
  .bt-node.active rect { fill: color-mix(in srgb, var(--viz-active) 30%, var(--bg)); stroke: var(--viz-active); }
  .bt-node.found rect { fill: color-mix(in srgb, var(--viz-sorted) 35%, var(--bg)); stroke: var(--viz-sorted); }
  .keyhi { fill: var(--danger); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
