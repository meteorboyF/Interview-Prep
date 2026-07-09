<script lang="ts">
  import Player from './Player.svelte';

  interface KFrame {
    phase: 'lps' | 'search';
    lps: number[];
    lpsActive?: number; lpsCompare?: [number, number];
    offset?: number; ti?: number; pj?: number; matchLen?: number;
    matches: number[]; status: string; done?: boolean;
  }

  let text = $state('ABABDABACDABABCABAB');
  let pattern = $state('ABABCABAB');
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '');

  function build(T: string, P: string): KFrame[] {
    const n = T.length, m = P.length;
    const frames: KFrame[] = [];
    const lps = Array(m).fill(0);
    // ---- Phase 1: build LPS ----
    frames.push({ phase: 'lps', lps: [...lps], matches: [], status: `Build the LPS (longest proper prefix = suffix) array for the pattern.` });
    let len = 0, i = 1;
    lps[0] = 0;
    while (i < m) {
      frames.push({ phase: 'lps', lps: [...lps], lpsCompare: [i, len], matches: [], status: `Compare P[${i}]='${P[i]}' with P[${len}]='${P[len]}'.` });
      if (P[i] === P[len]) {
        len++; lps[i] = len;
        frames.push({ phase: 'lps', lps: [...lps], lpsActive: i, matches: [], status: `Match → lps[${i}] = ${len}.` });
        i++;
      } else if (len !== 0) {
        len = lps[len - 1];
        frames.push({ phase: 'lps', lps: [...lps], matches: [], status: `Mismatch, len>0 → fall back len = lps[${len}].` });
      } else {
        lps[i] = 0;
        frames.push({ phase: 'lps', lps: [...lps], lpsActive: i, matches: [], status: `Mismatch, len=0 → lps[${i}] = 0.` });
        i++;
      }
    }
    frames.push({ phase: 'lps', lps: [...lps], matches: [], status: `LPS = [${lps.join(', ')}]. Now scan the text.` });
    // ---- Phase 2: search ----
    let ti = 0, pj = 0; const matches: number[] = [];
    while (ti < n) {
      frames.push({ phase: 'search', lps: [...lps], offset: ti - pj, ti, pj, matchLen: pj, matches: [...matches], status: `Compare T[${ti}]='${T[ti]}' with P[${pj}]='${P[pj]}'.` });
      if (T[ti] === P[pj]) {
        ti++; pj++;
        if (pj === m) {
          matches.push(ti - pj);
          frames.push({ phase: 'search', lps: [...lps], offset: ti - pj, ti: ti - 1, pj: pj - 1, matchLen: pj, matches: [...matches], status: `Full match at index ${ti - pj}! Shift by lps[${pj - 1}] = ${lps[pj - 1]}.` });
          pj = lps[pj - 1];
        }
      } else if (pj !== 0) {
        frames.push({ phase: 'search', lps: [...lps], offset: ti - lps[pj - 1], ti, pj, matchLen: lps[pj - 1], matches: [...matches], status: `Mismatch → shift pattern using lps[${pj - 1}] = ${lps[pj - 1]} (no re-check of matched prefix).` });
        pj = lps[pj - 1];
      } else {
        ti++;
      }
    }
    frames.push({ phase: 'search', lps: [...lps], matches: [...matches], status: matches.length ? `Done. Matches at index: ${matches.join(', ')}.` : `Done. No match found.`, done: true });
    return frames;
  }

  const T = $derived(clean(text).slice(0, 26));
  const P = $derived(clean(pattern).slice(0, 12) || 'A');
  const frames = $derived(build(T, P || 'A'));
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label class="grow">Text <input type="text" bind:value={text} /></label>
    <label class="grow">Pattern <input type="text" bind:value={pattern} /></label>
  </div>
  {#key `${T}|${P}`}
    <Player {frames} baseDelay={700}>
      {#snippet children({ frame }: { frame: KFrame })}
        <div class="kmp">
          <!-- LPS array -->
          <div class="lps-block">
            <div class="lbl">Pattern &amp; LPS</div>
            <div class="cells">
              {#each P.split('') as ch, idx (idx)}
                <div class="cellpair">
                  <div class="cell pat" class:hl={frame.phase === 'lps' && frame.lpsCompare?.includes(idx)} class:set={frame.phase === 'lps' && frame.lpsActive === idx}>{ch}</div>
                  <div class="cell lps" class:hl={frame.phase === 'lps' && frame.lpsCompare?.[1] === idx}>{frame.lps[idx] ?? ''}</div>
                  <div class="ix">{idx}</div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Text / matching -->
          <div class="text-block">
            <div class="lbl">Text</div>
            <div class="cells">
              {#each T.split('') as ch, idx (idx)}
                <div class="cellpair">
                  <div class="cell txt"
                    class:cmp={frame.phase === 'search' && frame.ti === idx}
                    class:matched={frame.phase === 'search' && frame.offset !== undefined && idx >= frame.offset && idx < frame.offset + (frame.matchLen ?? 0)}
                    class:found={frame.matches.some((mstart) => idx >= mstart && idx < mstart + P.length)}>{ch}</div>
                  <div class="ix">{idx}</div>
                </div>
              {/each}
            </div>
            {#if frame.phase === 'search' && frame.offset !== undefined}
              <div class="cells pattern-row" style={`padding-left:calc(${frame.offset} * (1.7rem + 3px))`}>
                {#each P.split('') as ch, idx (idx)}
                  <div class="cell pat slide" class:cmp={frame.pj === idx} class:ok={idx < (frame.matchLen ?? 0)}>{ch}</div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>comparing</span>
        <span><i class="sw" style="background:var(--viz-window)"></i>matched prefix</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>full match</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: flex-end; margin-bottom: 0.7rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .grow { flex: 1; min-width: 200px; }
  input { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); text-transform: uppercase; letter-spacing: 0.08em; }
  .kmp { display: flex; flex-direction: column; gap: 1.2rem; }
  .lbl { font-size: 0.75rem; color: var(--text-soft); font-weight: 700; margin-bottom: 0.3rem; }
  .cells { display: flex; gap: 3px; flex-wrap: wrap; }
  .pattern-row { margin-top: 3px; transition: padding-left 0.35s ease; }
  .cellpair { display: flex; flex-direction: column; align-items: center; }
  .cell {
    width: 1.7rem; height: 1.7rem; display: grid; place-items: center; font-weight: 700;
    border: 1px solid var(--border); border-radius: 5px; background: var(--bg-elevated);
    font-size: 0.85rem; transition: all 0.2s;
  }
  .cell.lps { background: var(--bg-soft); color: var(--accent); font-size: 0.72rem; }
  .cell.pat { background: color-mix(in srgb, var(--accent) 12%, var(--bg)); }
  .ix { font-size: 0.6rem; color: var(--text-faint); }
  .cell.hl, .cell.cmp { background: var(--viz-compare); color: #000; transform: translateY(-2px); }
  .cell.set { background: color-mix(in srgb, var(--accent) 30%, var(--bg)); }
  .cell.matched, .cell.ok { background: color-mix(in srgb, var(--viz-window) 35%, var(--bg)); }
  .cell.found { background: color-mix(in srgb, var(--viz-sorted) 40%, var(--bg)); border-color: var(--viz-sorted); }
  .cell.slide { background: color-mix(in srgb, var(--accent) 18%, var(--bg)); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
