<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';

  let mode = $state<'singly' | 'doubly'>('singly');
  let nodes = $state<{ id: number; v: number }[]>([
    { id: 1, v: 10 }, { id: 2, v: 20 }, { id: 3, v: 30 },
  ]);
  let nextId = $state(4);
  let value = $state(40);
  let pos = $state(1);
  let status = $state('A linked list stores nodes linked by pointers. Head insert is O(1).');
  let highlight = $state<number | null>(null);

  function mk(v: number) { const n = { id: nextId, v }; nextId += 1; return n; }

  function insertHead() {
    nodes = [mk(value), ...nodes];
    status = `Insert ${value} at head → O(1): point new node to old head, move head.`;
  }
  function insertTail() {
    nodes = [...nodes, mk(value)];
    status = `Insert ${value} at tail → O(n) without a tail pointer (must walk to the end).`;
  }
  function insertAt() {
    const i = Math.max(0, Math.min(pos, nodes.length));
    nodes = [...nodes.slice(0, i), mk(value), ...nodes.slice(i)];
    status = `Insert ${value} at position ${i} → O(pos): walk to the node, relink pointers.`;
  }
  function deleteHead() {
    if (!nodes.length) { status = 'List empty.'; return; }
    const [h, ...rest] = nodes; nodes = rest;
    status = `Delete head (${h.v}) → O(1): move head to the next node.`;
  }
  function deleteTail() {
    if (!nodes.length) { status = 'List empty.'; return; }
    const t = nodes[nodes.length - 1]; nodes = nodes.slice(0, -1);
    status = `Delete tail (${t.v}) → O(n) singly (need the previous node); O(1) doubly with a tail pointer.`;
  }
  async function search() {
    status = `Searching for ${value}…`;
    for (let i = 0; i < nodes.length; i++) {
      highlight = nodes[i].id;
      await new Promise((r) => setTimeout(r, 450));
      if (nodes[i].v === value) { status = `Found ${value} at index ${i} after ${i + 1} comparisons — O(n).`; setTimeout(() => (highlight = null), 700); return; }
    }
    status = `${value} not found — traversed all ${nodes.length} nodes, O(n).`;
    highlight = null;
  }
  function reverse() {
    nodes = [...nodes].reverse();
    status = 'Reverse → O(n) time, O(1) space using the three-pointer technique (prev, curr, next).';
  }
  function randomize() {
    const n = 3 + Math.floor(Math.random() * 3);
    nodes = Array.from({ length: n }, () => mk(1 + Math.floor(Math.random() * 98)));
    status = 'Fresh random list.';
  }
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>List type
      <select bind:value={mode}>
        <option value="singly">Singly linked</option>
        <option value="doubly">Doubly linked</option>
      </select>
    </label>
    <label>Value <input type="number" bind:value class="num" /></label>
    <label>Pos <input type="number" bind:value={pos} class="num small" min="0" /></label>
  </div>
  <div class="op-row">
    <button class="btn btn-primary" onclick={insertHead}>Insert head</button>
    <button class="btn" onclick={insertTail}>Insert tail</button>
    <button class="btn" onclick={insertAt}>Insert @pos</button>
    <button class="btn" onclick={deleteHead}>Delete head</button>
    <button class="btn" onclick={deleteTail}>Delete tail</button>
    <button class="btn" onclick={search}>Search</button>
    <button class="btn" onclick={reverse}>Reverse</button>
    <button class="btn" onclick={randomize}>Random</button>
  </div>

  <div class="list-stage">
    <div class="list-row">
      <div class="head-label">head →</div>
      {#each nodes as n, i (n.id)}
        <div class="unit" animate:flip={{ duration: 350 }} in:fly={{ y: -20, duration: 250 }} out:fly={{ y: 20, duration: 200 }}>
          <div class="node" class:hl={highlight === n.id}>
            <span class="val">{n.v}</span>
          </div>
          {#if i < nodes.length - 1}
            <div class="link">{mode === 'doubly' ? '⇄' : '→'}</div>
          {:else}
            <div class="link null">→ ∅</div>
          {/if}
        </div>
      {/each}
      {#if !nodes.length}<div class="empty">empty list (head → ∅)</div>{/if}
    </div>
  </div>
  <p class="status">{status}</p>
</div>

<style>
  .viz-toolbar, .op-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  select, .num { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .num { width: 5rem; } .num.small { width: 3.5rem; }
  .list-stage { overflow-x: auto; padding: 1rem 0; min-height: 110px; }
  .list-row { display: flex; align-items: center; gap: 0; min-height: 4rem; }
  .head-label { font-size: 0.78rem; color: var(--accent); font-weight: 700; margin-right: 0.5rem; white-space: nowrap; }
  .unit { display: flex; align-items: center; }
  .node {
    width: 3rem; height: 3rem; display: grid; place-items: center; font-weight: 700;
    border: 2px solid var(--accent); border-radius: 10px; background: var(--accent-soft);
    color: var(--accent); font-variant-numeric: tabular-nums; transition: all 0.2s;
  }
  .node.hl { background: var(--viz-compare); border-color: var(--viz-compare); color: #000; transform: translateY(-4px); box-shadow: var(--shadow); }
  .link { margin: 0 0.35rem; color: var(--text-soft); font-size: 1.2rem; }
  .link.null { color: var(--text-faint); font-size: 0.9rem; }
  .empty { color: var(--text-faint); font-size: 0.9rem; }
  .status { font-size: 0.9rem; color: var(--text-soft); margin-top: 0.4rem; min-height: 1.3rem; }
</style>
