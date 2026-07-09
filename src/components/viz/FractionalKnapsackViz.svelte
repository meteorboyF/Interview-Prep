<script lang="ts">
  import Player from './Player.svelte';

  interface Row { id: number; value: number; weight: number; ratio: number; taken: number; state: string; }
  interface KFrame { rows: Row[]; capUsed: number; capacity: number; total: number; status: string; done?: boolean; }

  let capacity = $state(50);
  let items = $state([
    { id: 1, value: 60, weight: 10 }, { id: 2, value: 100, weight: 20 },
    { id: 3, value: 120, weight: 30 }, { id: 4, value: 40, weight: 8 },
  ]);

  function build(): KFrame[] {
    const sorted = items.map((it) => ({ ...it, ratio: +(it.value / it.weight).toFixed(2), taken: 0, state: '' }))
      .sort((a, b) => b.ratio - a.ratio);
    const frames: KFrame[] = [];
    const snap = (rows: Row[], capUsed: number, total: number, status: string, done = false): KFrame =>
      ({ rows: rows.map((r) => ({ ...r })), capUsed, capacity, total: +total.toFixed(1), status, done });
    frames.push(snap(sorted, 0, 0, `Sort items by value/weight ratio (highest first): ${sorted.map((r) => r.ratio).join(', ')}.`));
    let cap = capacity, total = 0;
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].state = 'active';
      frames.push(snap(sorted, capacity - cap, total, `Consider item ${sorted[i].id} (ratio ${sorted[i].ratio}), remaining capacity ${cap}.`));
      if (sorted[i].weight <= cap) {
        sorted[i].taken = 1; cap -= sorted[i].weight; total += sorted[i].value; sorted[i].state = 'full';
        frames.push(snap(sorted, capacity - cap, total, `Fits fully → take all of item ${sorted[i].id}. Value += ${sorted[i].value}.`));
      } else {
        const frac = cap / sorted[i].weight;
        sorted[i].taken = frac; total += sorted[i].value * frac; sorted[i].state = 'frac';
        frames.push(snap(sorted, capacity, total, `Only ${(frac * 100).toFixed(0)}% fits → take fraction. Value += ${(sorted[i].value * frac).toFixed(1)}.`));
        cap = 0;
      }
      if (cap === 0) { for (let j = i + 1; j < sorted.length; j++) sorted[j].state = 'skip'; break; }
    }
    frames.push(snap(sorted, capacity - cap, total, `Knapsack full. Maximum value = ${total.toFixed(1)}.`, true));
    return frames;
  }

  const frames = $derived(build());
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Capacity <input type="number" bind:value={capacity} class="num" min="1" /></label>
    <span class="note">Greedy by ratio is optimal for the <em>fractional</em> knapsack.</span>
  </div>
  {#key capacity}
    <Player {frames} baseDelay={900}>
      {#snippet children({ frame }: { frame: KFrame })}
        <div class="cap-bar" title="Capacity usage">
          <div class="cap-fill" style={`width:${Math.min(100, (frame.capUsed / frame.capacity) * 100)}%`}></div>
          <span class="cap-text">{frame.capUsed} / {frame.capacity} used · value {frame.total}</span>
        </div>
        <table class="ktable">
          <thead><tr><th>Item</th><th>Value</th><th>Weight</th><th>Ratio</th><th>Taken</th></tr></thead>
          <tbody>
            {#each frame.rows as r (r.id)}
              <tr class={r.state}>
                <td>{r.id}</td><td>{r.value}</td><td>{r.weight}</td><td>{r.ratio}</td>
                <td>{r.taken === 1 ? '100%' : r.taken === 0 ? '—' : (r.taken * 100).toFixed(0) + '%'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .num { width: 5rem; font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .note { font-size: 0.8rem; color: var(--text-faint); }
  .cap-bar { position: relative; height: 1.9rem; background: var(--bg-soft); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 0.8rem; }
  .cap-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #06b6d4); transition: width 0.3s; }
  .cap-text { position: absolute; inset: 0; display: grid; place-items: center; font-size: 0.8rem; font-weight: 700; color: var(--text); }
  .ktable { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  .ktable th, .ktable td { border: 1px solid var(--border); padding: 0.4rem 0.6rem; text-align: center; }
  .ktable th { background: var(--bg-soft); }
  tr.active td { background: color-mix(in srgb, var(--viz-compare) 22%, transparent); }
  tr.full td { background: color-mix(in srgb, var(--viz-sorted) 20%, transparent); }
  tr.frac td { background: color-mix(in srgb, var(--viz-window) 20%, transparent); }
  tr.skip td { opacity: 0.4; }
</style>
