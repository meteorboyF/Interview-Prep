<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';

  let items = $state<{ id: number; v: number }[]>([
    { id: 1, v: 10 }, { id: 2, v: 24 }, { id: 3, v: 7 },
  ]);
  let nextId = $state(4);
  let value = $state(42);
  let status = $state('Queue is FIFO: enqueue at the back, dequeue from the front.');
  const MAX = 8;

  function enqueue() {
    if (items.length >= MAX) { status = 'Queue full (demo cap reached).'; return; }
    const v = Number.isFinite(value) ? value : Math.floor(Math.random() * 99);
    items = [...items, { id: nextId, v }];
    status = `enqueue(${v}) → added at the back. O(1).`;
    nextId += 1; value = Math.floor(Math.random() * 99);
  }
  function dequeue() {
    if (!items.length) { status = 'dequeue() on empty queue — underflow.'; return; }
    const front = items[0];
    items = items.slice(1);
    status = `dequeue() → removed ${front.v} from the front. O(1) with circular/linked queue.`;
  }
  function clear() { items = []; status = 'Queue cleared.'; }
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Value <input type="number" bind:value class="num" /></label>
    <button class="btn btn-primary" onclick={enqueue}>Enqueue →</button>
    <button class="btn" onclick={dequeue}>Dequeue →</button>
    <button class="btn" onclick={clear}>Clear</button>
  </div>

  <div class="queue-stage">
    <div class="labels"><span>front</span><span>back</span></div>
    <div class="queue-row">
      {#if !items.length}<div class="empty">empty</div>{/if}
      {#each items as it (it.id)}
        <div class="node" animate:flip={{ duration: 250 }} in:fly={{ x: 30, duration: 250 }} out:fly={{ x: -30, duration: 200 }}>
          {it.v}
        </div>
      {/each}
    </div>
  </div>
  <p class="status">{status}</p>
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: flex-end; margin-bottom: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .num { width: 5rem; font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .queue-stage { min-height: 150px; display: flex; flex-direction: column; justify-content: center; }
  .labels { display: flex; justify-content: space-between; max-width: 34rem; font-size: 0.75rem; color: var(--accent); font-weight: 700; margin-bottom: 0.3rem; }
  .queue-row { display: flex; gap: 6px; align-items: center; min-height: 3rem; border: 2px dashed var(--border); border-radius: 10px; padding: 0.6rem; max-width: 34rem; overflow-x: auto; }
  .node { min-width: 2.6rem; height: 2.6rem; padding: 0 0.4rem; display: grid; place-items: center; font-weight: 700; background: var(--accent-soft); color: var(--accent); border: 2px solid var(--accent); border-radius: 8px; font-variant-numeric: tabular-nums; flex-shrink: 0; }
  .empty { color: var(--text-faint); font-size: 0.85rem; padding: 0.5rem; }
  .status { font-size: 0.9rem; color: var(--text-soft); margin-top: 0.6rem; min-height: 1.3rem; }
</style>
