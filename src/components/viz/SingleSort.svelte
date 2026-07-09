<script lang="ts">
  import Player from './Player.svelte';
  import Bars from './Bars.svelte';
  import { SORTERS } from '../../lib/algos/sorting';

  interface Props { algo: 'merge' | 'quick'; initial?: number[]; }
  let { algo, initial = [38, 27, 43, 3, 9, 82, 10] }: Props = $props();

  let values = $state<number[]>(initial);
  let input = $state(initial.join(', '));
  let error = $state('');

  function applyInput() {
    const nums = input.split(/[,\s]+/).filter(Boolean).map(Number);
    if (nums.some((n) => !Number.isFinite(n))) { error = 'Numbers only.'; return; }
    values = nums.slice(0, 14).map((n) => Math.max(1, Math.min(99, Math.round(n))));
    error = '';
  }
  function randomize() {
    const n = 7 + Math.floor(Math.random() * 3);
    values = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 98));
    input = values.join(', ');
  }
  const frames = $derived(SORTERS[algo].fn(values));
  const meta = $derived(SORTERS[algo]);
</script>

<div class="viz">
  <div class="viz-toolbar">
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
  </div>
  {#key values}
    <Player {frames}>
      {#snippet children({ frame })}
        <Bars {frame} />
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>compare</span>
        <span><i class="sw" style="background:var(--viz-swap)"></i>place/swap</span>
        {#if algo === 'quick'}<span><i class="sw" style="background:var(--viz-active)"></i>pivot</span>{/if}
        <span><i class="sw" style="background:var(--viz-sorted)"></i>sorted</span>
        <span><i class="sw" style="background:var(--border)"></i>inactive</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; flex: 1; min-width: 200px; }
  input[type='text'] { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .err { color: var(--danger); font-size: 0.85rem; margin: 0 0 0.5rem; }
  .complexity-readout { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; font-size: 0.82rem; color: var(--text-soft); margin-bottom: 0.7rem; padding: 0.5rem 0.7rem; background: var(--bg-soft); border-radius: 8px; border: 1px solid var(--border-soft); }
  .complexity-readout strong { color: var(--text); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
