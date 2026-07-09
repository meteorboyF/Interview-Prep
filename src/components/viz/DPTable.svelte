<script lang="ts">
  import type { DPFrame } from '../../lib/algos/dp';
  interface Props { frame: DPFrame; rowLabels: string[]; colLabels: string[]; corner?: string; }
  let { frame, rowLabels, colLabels, corner = '' }: Props = $props();

  function cls(r: number, c: number): string {
    if (frame.active && frame.active[0] === r && frame.active[1] === c) return 'active';
    if (frame.path?.some(([pr, pc]) => pr === r && pc === c)) return 'path';
    if (frame.refs?.some(([rr, rc]) => rr === r && rc === c)) return 'ref';
    return '';
  }
</script>

<div class="dp-scroll">
  <table class="dp">
    <thead>
      <tr>
        <th class="corner">{corner}</th>
        {#each colLabels as cl}<th>{cl}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each frame.table as row, r (r)}
        <tr>
          <th class="rowlab">{rowLabels[r] ?? r}</th>
          {#each row as cell, c (c)}
            <td class={cls(r, c)} class:blank={cell === '' }>
              {cell === null ? '' : cell}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .dp-scroll { overflow-x: auto; }
  .dp { border-collapse: collapse; font-variant-numeric: tabular-nums; font-size: 0.82rem; margin: 0 auto; }
  .dp th, .dp td {
    border: 1px solid var(--border); min-width: 2.1rem; height: 2.1rem;
    text-align: center; padding: 0.1rem 0.35rem;
  }
  .dp th { background: var(--bg-soft); font-weight: 700; color: var(--text-soft); font-size: 0.76rem; }
  .dp .corner { background: var(--bg-elevated); }
  .dp .rowlab { white-space: nowrap; }
  .dp td { background: var(--bg-elevated); transition: background 0.2s, transform 0.1s; }
  .dp td.blank { background: repeating-linear-gradient(45deg, var(--bg-soft), var(--bg-soft) 4px, transparent 4px, transparent 8px); }
  .dp td.ref { background: color-mix(in srgb, var(--viz-window) 30%, var(--bg)); }
  .dp td.active { background: var(--viz-compare); color: #000; font-weight: 800; transform: scale(1.08); }
  .dp td.path { background: color-mix(in srgb, var(--viz-sorted) 45%, var(--bg)); font-weight: 800; }
</style>
