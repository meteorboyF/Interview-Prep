<script lang="ts">
  import Player from './Player.svelte';

  interface SFrame {
    checking?: number; lo?: number; hi?: number; mid?: number;
    found?: number; eliminated: boolean[]; status: string; done?: boolean;
  }

  let algo = $state('binary');
  let input = $state('2, 5, 8, 12, 16, 23, 38, 56, 72, 91');
  let target = $state(23);
  let values = $state<number[]>([2, 5, 8, 12, 16, 23, 38, 56, 72, 91]);
  let error = $state('');

  function applyInput() {
    let nums = input.split(/[,\s]+/).filter(Boolean).map(Number);
    if (nums.some((n) => !Number.isFinite(n))) { error = 'Numbers only.'; return; }
    nums = nums.slice(0, 16).map((n) => Math.round(n));
    if (algo === 'binary') nums.sort((a, b) => a - b);
    values = nums; error = '';
    input = nums.join(', ');
  }
  $effect(() => { if (algo === 'binary') { /* keep sorted */ } });

  function buildLinear(a: number[], t: number): SFrame[] {
    const elim = a.map(() => false);
    const frames: SFrame[] = [{ eliminated: [...elim], status: `Linear search: scan left→right for ${t}.` }];
    for (let i = 0; i < a.length; i++) {
      frames.push({ checking: i, eliminated: [...elim], status: `Check a[${i}] = ${a[i]}.` });
      if (a[i] === t) {
        frames.push({ found: i, eliminated: [...elim], status: `Found ${t} at index ${i}.`, done: true });
        return frames;
      }
      elim[i] = true;
      frames.push({ eliminated: [...elim], status: `a[${i}] ≠ ${t}, keep going.` });
    }
    frames.push({ eliminated: a.map(() => true), status: `${t} not present. Return −1.`, done: true });
    return frames;
  }

  function buildBinary(a: number[], t: number): SFrame[] {
    const elim = a.map(() => false);
    const frames: SFrame[] = [{ lo: 0, hi: a.length - 1, eliminated: [...elim], status: `Binary search (sorted): low=0, high=${a.length - 1}.` }];
    let lo = 0, hi = a.length - 1;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      frames.push({ lo, hi, mid, eliminated: [...elim], status: `mid = ${mid}, a[${mid}] = ${a[mid]}.` });
      if (a[mid] === t) {
        frames.push({ found: mid, lo, hi, eliminated: [...elim], status: `a[${mid}] = ${t} → found at index ${mid}.`, done: true });
        return frames;
      } else if (a[mid] < t) {
        for (let k = lo; k <= mid; k++) elim[k] = true;
        lo = mid + 1;
        frames.push({ lo, hi, eliminated: [...elim], status: `a[${mid}] < ${t} → discard left half, low = ${lo}.` });
      } else {
        for (let k = mid; k <= hi; k++) elim[k] = true;
        hi = mid - 1;
        frames.push({ lo, hi, eliminated: [...elim], status: `a[${mid}] > ${t} → discard right half, high = ${hi}.` });
      }
    }
    frames.push({ eliminated: a.map(() => true), status: `low > high → ${t} not present. Return −1.`, done: true });
    return frames;
  }

  const frames = $derived(algo === 'binary' ? buildBinary(values, target) : buildLinear(values, target));

  function cellClass(f: SFrame, i: number): string {
    if (f.found === i) return 'found';
    if (f.checking === i || f.mid === i) return 'active';
    if (f.eliminated[i]) return 'elim';
    if (f.lo !== undefined && f.hi !== undefined && i >= f.lo && i <= f.hi) return 'window';
    return '';
  }
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Algorithm
      <select bind:value={algo} onchange={applyInput}>
        <option value="linear">Linear search</option>
        <option value="binary">Binary search (sorted)</option>
      </select>
    </label>
    <label class="grow">Array
      <input type="text" bind:value={input} onkeydown={(e) => e.key === 'Enter' && applyInput()} />
    </label>
    <label>Target
      <input type="number" bind:value={target} class="num" />
    </label>
    <button class="btn" onclick={applyInput}>Set</button>
  </div>
  {#if error}<p class="err">{error}</p>{/if}

  {#key `${algo}-${values.join(',')}-${target}`}
    <Player {frames} baseDelay={850}>
      {#snippet children({ frame })}
        <div class="cells">
          {#each values as v, i (i)}
            <div class="cell-wrap">
              <div class="cell {cellClass(frame, i)}">{v}</div>
              <div class="idx">{i}</div>
              {#if frame.lo === i}<div class="ptr lo">low</div>{/if}
              {#if frame.hi === i}<div class="ptr hi">high</div>{/if}
              {#if frame.mid === i}<div class="ptr mid">mid</div>{/if}
            </div>
          {/each}
        </div>
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-window)"></i>search window</span>
        <span><i class="sw" style="background:var(--viz-compare)"></i>examining</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>found</span>
        <span><i class="sw" style="background:var(--border)"></i>eliminated</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .grow { flex: 1; min-width: 180px; }
  select, input { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .num { width: 5rem; }
  .err { color: var(--danger); font-size: 0.85rem; margin: 0 0 0.5rem; }

  .cells { display: flex; gap: 6px; flex-wrap: wrap; padding-top: 1.4rem; }
  .cell-wrap { position: relative; display: flex; flex-direction: column; align-items: center; }
  .cell {
    width: 2.6rem; height: 2.6rem; display: grid; place-items: center;
    border: 2px solid var(--border); border-radius: 8px; font-weight: 700;
    background: var(--bg-elevated); transition: all 0.25s; font-variant-numeric: tabular-nums;
  }
  .cell.window { border-color: var(--viz-window); background: color-mix(in srgb, var(--viz-window) 15%, transparent); }
  .cell.active { border-color: var(--viz-compare); background: color-mix(in srgb, var(--viz-compare) 25%, transparent); transform: translateY(-3px); }
  .cell.found { border-color: var(--viz-sorted); background: color-mix(in srgb, var(--viz-sorted) 25%, transparent); }
  .cell.elim { opacity: 0.35; }
  .idx { font-size: 0.68rem; color: var(--text-faint); margin-top: 2px; }
  .ptr { position: absolute; top: -1.3rem; font-size: 0.66rem; font-weight: 700; padding: 0 3px; border-radius: 3px; }
  .ptr.lo { color: #fff; background: #0891b2; left: 0; }
  .ptr.hi { color: #fff; background: #be185d; right: 0; }
  .ptr.mid { color: #fff; background: var(--accent); left: 50%; transform: translateX(-50%); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
