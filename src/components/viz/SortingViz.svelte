<script lang="ts">
  import Player from './Player.svelte';
  import Bars from './Bars.svelte';
  import { SORTERS } from '../../lib/algos/sorting';

  let algo = $state('bubble');
  let input = $state('29, 10, 14, 37, 13, 8, 21');
  let error = $state('');

  function parse(s: string): number[] {
    const nums = s.split(/[,\s]+/).filter(Boolean).map(Number);
    if (nums.some((n) => !Number.isFinite(n))) throw new Error('Only numbers, separated by commas or spaces.');
    return nums.slice(0, 14).map((n) => Math.max(1, Math.min(99, Math.round(n))));
  }

  let values = $state<number[]>([29, 10, 14, 37, 13, 8, 21]);
  function applyInput() {
    try { values = parse(input); error = ''; }
    catch (e) { error = (e as Error).message; }
  }
  function randomize() {
    const n = 7 + Math.floor(Math.random() * 4);
    values = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 98));
    input = values.join(', ');
    error = '';
  }

  const frames = $derived(SORTERS[algo].fn(values));
  const meta = $derived(SORTERS[algo]);
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Algorithm
      <select bind:value={algo}>
        <option value="selection">Selection sort</option>
        <option value="bubble">Bubble sort</option>
        <option value="insertion">Insertion sort</option>
        <option value="merge">Merge sort</option>
        <option value="quick">Quick sort</option>
      </select>
    </label>
    <label class="grow">Array
      <input type="text" bind:value={input} onkeydown={(e) => e.key === 'Enter' && applyInput()} />
    </label>
    <button class="btn" onclick={applyInput}>Set</button>
    <button class="btn" onclick={randomize}>Random</button>
  </div>
  {#if error}<p class="err">{error}</p>{/if}

  <div class="complexity-readout">
    <span><strong>Best</strong> {meta.best}</span>
    <span><strong>Avg</strong> {meta.avg}</span>
    <span><strong>Worst</strong> {meta.worst}</span>
    <span><strong>Space</strong> {meta.space}</span>
    <span><strong>Stable</strong> {meta.stable}</span>
  </div>

  {#key values}
    <Player {frames}>
      {#snippet children({ frame })}
        <Bars {frame} />
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>compare</span>
        <span><i class="sw" style="background:var(--viz-swap)"></i>swap</span>
        <span><i class="sw" style="background:var(--viz-active)"></i>pivot</span>
        <span><i class="sw" style="background:var(--viz-visited)"></i>key</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>sorted</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .grow { flex: 1; min-width: 200px; }
  select, input[type='text'] {
    font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px;
    border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text);
  }
  .err { color: var(--danger); font-size: 0.85rem; margin: 0 0 0.5rem; }
  .complexity-readout {
    display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; font-size: 0.82rem;
    color: var(--text-soft); margin-bottom: 0.7rem; padding: 0.5rem 0.7rem;
    background: var(--bg-soft); border-radius: 8px; border: 1px solid var(--border-soft);
  }
  .complexity-readout strong { color: var(--text); }
  :global(.legend .sw), .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
