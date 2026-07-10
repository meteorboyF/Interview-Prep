<script lang="ts">
  import Player from './Player.svelte';

  type Sale = { product: string; region: string; amt: number };
  const sales: Sale[] = [
    { product: 'Pen', region: 'East', amt: 20 },
    { product: 'Pad', region: 'West', amt: 35 },
    { product: 'Pen', region: 'East', amt: 15 },
    { product: 'Ink', region: 'West', amt: 50 },
    { product: 'Pad', region: 'East', amt: 25 },
    { product: 'Ink', region: 'West', amt: 40 },
  ];

  let groupCol = $state<'region' | 'product'>('region');
  let agg = $state<'SUM' | 'COUNT' | 'AVG' | 'MAX'>('SUM');

  type Grp = { key: string; sum: number; count: number; max: number };
  interface GFrame { row: number; groups: Grp[]; activeKey: string | null; status: string; done?: boolean }

  function value(g: Grp): number {
    if (agg === 'SUM') return g.sum;
    if (agg === 'COUNT') return g.count;
    if (agg === 'AVG') return +(g.sum / g.count).toFixed(1);
    return g.max;
  }

  function build(): GFrame[] {
    const frames: GFrame[] = [];
    const groups: Grp[] = [];
    const snap = (row: number, activeKey: string | null, status: string, done = false): GFrame =>
      ({ row, activeKey, groups: groups.map((g) => ({ ...g })), status, done });
    frames.push(snap(-1, null, `GROUP BY ${groupCol}, then compute ${agg}(amount) per group.`));
    for (let i = 0; i < sales.length; i++) {
      const s = sales[i];
      const key = s[groupCol];
      let g = groups.find((x) => x.key === key);
      if (!g) { g = { key, sum: 0, count: 0, max: -Infinity }; groups.push(g); frames.push(snap(i, key, `New group "${key}" created.`)); }
      g.sum += s.amt; g.count += 1; g.max = Math.max(g.max, s.amt);
      frames.push(snap(i, key, `Row ${i + 1} (${s.product}, ${s.region}, ${s.amt}) → bucket "${key}". Running ${agg} = ${value(g)}.`));
    }
    frames.push(snap(-1, null, `Done. ${groups.length} groups.`, true));
    return frames;
  }

  const frames = $derived(build());
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Group by
      <select bind:value={groupCol}><option value="region">region</option><option value="product">product</option></select>
    </label>
    <label>Aggregate
      <select bind:value={agg}><option>SUM</option><option>COUNT</option><option>AVG</option><option>MAX</option></select>
    </label>
    <code class="sql">SELECT {groupCol}, {agg}(amt) FROM sales GROUP BY {groupCol};</code>
  </div>

  {#key `${groupCol}-${agg}`}
    <Player {frames} baseDelay={650}>
      {#snippet children({ frame }: { frame: GFrame })}
        <div class="gb-stage">
          <div class="tbl">
            <div class="tbl-name">sales</div>
            <table>
              <thead><tr><th>product</th><th>region</th><th>amt</th></tr></thead>
              <tbody>
                {#each sales as s, i}
                  <tr class:hi={frame.row === i}><td>{s.product}</td><td>{s.region}</td><td>{s.amt}</td></tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div class="arrow" aria-hidden="true">→</div>
          <div class="tbl">
            <div class="tbl-name">grouped result</div>
            <table>
              <thead><tr><th>{groupCol}</th><th>{agg}(amt)</th></tr></thead>
              <tbody>
                {#each frame.groups as g}
                  <tr class:active={frame.activeKey === g.key}><td>{g.key}</td><td>{value(g)}</td></tr>
                {/each}
                {#if !frame.groups.length}<tr><td colspan="2" class="empty">—</td></tr>{/if}
              </tbody>
            </table>
          </div>
        </div>
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>row being placed</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>target group</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: center; margin-bottom: 0.8rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  select { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .sql { font-size: 0.78rem; background: var(--code-bg); padding: 0.35rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-soft); color: var(--text-soft); }
  .gb-stage { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
  .tbl-name { font-size: 0.75rem; font-weight: 700; color: var(--accent); margin-bottom: 0.3rem; }
  table { border-collapse: collapse; font-size: 0.83rem; }
  th, td { border: 1px solid var(--border); padding: 0.25rem 0.6rem; text-align: left; }
  th { background: var(--bg-soft); font-weight: 700; }
  tbody tr.hi td { background: color-mix(in srgb, var(--viz-compare) 28%, transparent); }
  tbody tr.active td { background: color-mix(in srgb, var(--viz-sorted) 22%, transparent); }
  .arrow { font-size: 1.4rem; color: var(--text-faint); }
  .empty { text-align: center; color: var(--text-faint); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
