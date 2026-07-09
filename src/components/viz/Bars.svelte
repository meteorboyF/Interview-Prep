<script lang="ts">
  import type { SortFrame } from '../../lib/algos/sorting';
  interface Props { frame: SortFrame; height?: number; }
  let { frame, height = 220 }: Props = $props();

  const max = $derived(Math.max(1, ...(frame.array ?? [1])));
  function color(i: number): string {
    if (frame.sorted?.includes(i)) return 'var(--viz-sorted)';
    if (frame.swap?.includes(i)) return 'var(--viz-swap)';
    if (frame.pivot === i) return 'var(--viz-active)';
    if (frame.compare?.includes(i)) return 'var(--viz-compare)';
    if (frame.key === i) return 'var(--viz-visited)';
    if (frame.range && (i < frame.range[0] || i > frame.range[1])) return 'var(--border)';
    return 'var(--viz-bar)';
  }
</script>

<div class="bars" style={`height:${height}px`}>
  {#each frame.array ?? [] as v, i (i)}
    <div class="bar-wrap">
      <div class="bar" style={`height:${(v / max) * 100}%; background:${color(i)}`}>
        <span class="bar-val">{v}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .bars { display: flex; align-items: flex-end; gap: 3px; width: 100%; }
  .bar-wrap { flex: 1; height: 100%; display: flex; align-items: flex-end; min-width: 8px; }
  .bar {
    width: 100%; border-radius: 4px 4px 0 0; position: relative;
    transition: height 0.25s ease, background 0.2s;
    display: flex; justify-content: center; align-items: flex-start;
    min-height: 4px;
  }
  .bar-val {
    position: absolute; top: -1.25rem; font-size: 0.72rem;
    color: var(--text-soft); font-variant-numeric: tabular-nums;
  }
  @media (max-width: 560px) { .bar-val { display: none; } }
</style>
