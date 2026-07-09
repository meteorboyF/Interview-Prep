<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';

  let items = $state<{ id: number; v: number }[]>([
    { id: 1, v: 10 }, { id: 2, v: 24 }, { id: 3, v: 7 },
  ]);
  let nextId = $state(4);
  let value = $state(42);
  let status = $state('Stack is LIFO: push and pop happen at the top.');
  let flash = $state<'push' | 'pop' | null>(null);

  const MAX = 8;

  function push() {
    if (items.length >= MAX) { status = 'Stack full (demo cap reached).'; return; }
    const v = Number.isFinite(value) ? value : Math.floor(Math.random() * 99);
    items = [...items, { id: nextId, v }];
    status = `push(${v}) → added to the top. O(1).`;
    nextId += 1;
    value = Math.floor(Math.random() * 99);
    flash = 'push'; setTimeout(() => (flash = null), 400);
  }
  function pop() {
    if (!items.length) { status = 'pop() on empty stack — underflow.'; return; }
    const top = items[items.length - 1];
    items = items.slice(0, -1);
    status = `pop() → removed ${top.v} from the top. O(1).`;
    flash = 'pop'; setTimeout(() => (flash = null), 400);
  }
  function peek() {
    if (!items.length) { status = 'peek() on empty stack.'; return; }
    status = `peek() → top is ${items[items.length - 1].v} (not removed).`;
  }
  function clear() { items = []; status = 'Stack cleared.'; }
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Value <input type="number" bind:value class="num" /></label>
    <button class="btn btn-primary" onclick={push}>Push ▲</button>
    <button class="btn" onclick={pop}>Pop ▼</button>
    <button class="btn" onclick={peek}>Peek</button>
    <button class="btn" onclick={clear}>Clear</button>
  </div>

  <div class="stack-stage">
    <div class="stack-col" class:flash-push={flash === 'push'} class:flash-pop={flash === 'pop'}>
      {#if items.length}<div class="top-tag">← top</div>{/if}
      {#each [...items].reverse() as it (it.id)}
        <div class="node" animate:flip={{ duration: 250 }} in:fly={{ y: -30, duration: 250 }} out:fly={{ y: -30, duration: 200 }}>
          {it.v}
        </div>
      {/each}
      <div class="base">bottom</div>
    </div>
  </div>
  <p class="status">{status}</p>
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: flex-end; margin-bottom: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .num { width: 5rem; font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .stack-stage { display: grid; place-items: center; min-height: 300px; }
  .stack-col { display: flex; flex-direction: column; gap: 6px; width: 8rem; position: relative; }
  .top-tag { position: absolute; right: -3.2rem; top: 0; font-size: 0.75rem; color: var(--accent); font-weight: 700; }
  .node {
    height: 2.6rem; display: grid; place-items: center; font-weight: 700;
    background: var(--accent-soft); color: var(--accent); border: 2px solid var(--accent);
    border-radius: 8px; font-variant-numeric: tabular-nums;
  }
  .base { height: 1.6rem; display: grid; place-items: center; font-size: 0.72rem; color: var(--text-faint); border-top: 3px solid var(--border); }
  .status { font-size: 0.9rem; color: var(--text-soft); margin-top: 0.4rem; min-height: 1.3rem; }
  .flash-push { animation: pulse 0.4s; }
  .flash-pop { animation: pulse 0.4s; }
  @keyframes pulse { 50% { transform: scale(1.02); } }
</style>
