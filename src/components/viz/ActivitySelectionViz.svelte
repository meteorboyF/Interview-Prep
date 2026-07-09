<script lang="ts">
  import Player from './Player.svelte';

  interface Act { id: number; s: number; f: number; state: string; }
  interface AFrame { acts: Act[]; lastFinish: number; chosen: number; status: string; done?: boolean; }

  const initial = [
    { id: 1, s: 1, f: 4 }, { id: 2, s: 3, f: 5 }, { id: 3, s: 0, f: 6 },
    { id: 4, s: 5, f: 7 }, { id: 5, s: 3, f: 9 }, { id: 6, s: 5, f: 9 },
    { id: 7, s: 6, f: 10 }, { id: 8, s: 8, f: 11 }, { id: 9, s: 8, f: 12 },
  ];
  const maxT = Math.max(...initial.map((a) => a.f));

  function build(): AFrame[] {
    const acts = initial.map((a) => ({ ...a, state: '' })).sort((a, b) => a.f - b.f);
    const frames: AFrame[] = [];
    const snap = (last: number, chosen: number, status: string, done = false): AFrame =>
      ({ acts: acts.map((a) => ({ ...a })), lastFinish: last, chosen, status, done });
    frames.push(snap(-1, 0, `Sort activities by finish time: ${acts.map((a) => a.f).join(', ')}.`));
    let last = -1, count = 0;
    for (const a of acts) {
      a.state = 'active';
      frames.push(snap(last, count, `Activity ${a.id} [${a.s},${a.f}] — start ${a.s} vs last finish ${last < 0 ? '—' : last}.`));
      if (a.s >= last) {
        a.state = 'chosen'; last = a.f; count++;
        frames.push(snap(last, count, `start ≥ last finish → select it. Chosen so far: ${count}.`));
      } else {
        a.state = 'rejected';
        frames.push(snap(last, count, `Overlaps previous selection → skip.`));
      }
    }
    frames.push(snap(last, count, `Done. Maximum non-overlapping activities = ${count}.`, true));
    return frames;
  }
  const frames = build();
</script>

<div class="viz">
  <p class="note">Greedy rule: always pick the compatible activity that <strong>finishes earliest</strong>.</p>
  <Player {frames} baseDelay={850}>
    {#snippet children({ frame }: { frame: AFrame })}
      <div class="timeline">
        {#each frame.acts as a (a.id)}
          <div class="lane">
            <span class="lane-id">A{a.id}</span>
            <div class="track">
              <div class="bar {a.state}" style={`left:${(a.s / maxT) * 100}%; width:${((a.f - a.s) / maxT) * 100}%`}>
                {a.s}–{a.f}
              </div>
              {#if frame.lastFinish >= 0}
                <div class="marker" style={`left:${(frame.lastFinish / maxT) * 100}%`} title="last finish"></div>
              {/if}
            </div>
          </div>
        {/each}
        <div class="axis"><span>0</span><span>time →</span><span>{maxT}</span></div>
      </div>
    {/snippet}
    {#snippet legend()}
      <span><i class="sw" style="background:var(--viz-compare)"></i>considering</span>
      <span><i class="sw" style="background:var(--viz-sorted)"></i>selected</span>
      <span><i class="sw" style="background:var(--danger)"></i>skipped (overlap)</span>
    {/snippet}
  </Player>
</div>

<style>
  .note { font-size: 0.85rem; color: var(--text-soft); margin: 0 0 0.8rem; }
  .timeline { display: flex; flex-direction: column; gap: 5px; }
  .lane { display: flex; align-items: center; gap: 0.5rem; }
  .lane-id { width: 2rem; font-size: 0.78rem; font-weight: 700; color: var(--text-soft); font-variant-numeric: tabular-nums; }
  .track { position: relative; flex: 1; height: 1.5rem; background: var(--bg-soft); border-radius: 6px; }
  .bar {
    position: absolute; height: 100%; border-radius: 6px; display: grid; place-items: center;
    font-size: 0.68rem; font-weight: 700; color: var(--text); background: var(--viz-bar);
    border: 1px solid var(--border); transition: background 0.2s; overflow: hidden; white-space: nowrap;
  }
  .bar.active { background: color-mix(in srgb, var(--viz-compare) 55%, var(--bg)); border-color: var(--viz-compare); }
  .bar.chosen { background: color-mix(in srgb, var(--viz-sorted) 55%, var(--bg)); border-color: var(--viz-sorted); }
  .bar.rejected { background: color-mix(in srgb, var(--danger) 30%, var(--bg)); border-color: var(--danger); opacity: 0.7; }
  .marker { position: absolute; top: -2px; bottom: -2px; width: 2px; background: var(--accent); }
  .axis { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-faint); margin-left: 2.5rem; margin-top: 0.2rem; }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
