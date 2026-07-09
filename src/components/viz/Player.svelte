<script lang="ts">
  /**
   * Reusable step-through player. A visualizer precomputes an array of `frames`
   * (immutable snapshots) and hands them here; this component owns playback:
   * play/pause, step forward/back, reset, scrub and speed — plus keyboard
   * shortcuts (Space, ← →, R) when focused. Each frame is rendered by the
   * caller's `children` snippet, so the player stays algorithm-agnostic.
   */
  import type { Snippet } from 'svelte';

  interface Props {
    frames: any[];
    baseDelay?: number;
    children: Snippet<[{ frame: any; index: number; total: number }]>;
    legend?: Snippet;
    controls?: Snippet;
  }

  let { frames, baseDelay = 750, children, legend, controls }: Props = $props();

  let index = $state(0);
  let playing = $state(false);
  let rate = $state(1);

  const total = $derived(frames.length);
  const clamped = $derived(Math.min(index, Math.max(0, total - 1)));
  const frame = $derived(frames[clamped] ?? {});
  const atEnd = $derived(clamped >= total - 1);

  // New input => new frames array identity => rewind.
  let prevFrames: any[] | null = null;
  $effect(() => {
    if (frames !== prevFrames) {
      prevFrames = frames;
      index = 0;
      playing = false;
    }
  });

  // Playback loop. Depends on playing/rate/baseDelay only (index is read async).
  $effect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      if (index >= total - 1) {
        playing = false;
        return;
      }
      index = index + 1;
    }, baseDelay / rate);
    return () => clearInterval(id);
  });

  function togglePlay() {
    if (atEnd) index = 0;
    playing = !playing;
  }
  function stepFwd() {
    playing = false;
    if (index < total - 1) index += 1;
  }
  function stepBack() {
    playing = false;
    if (index > 0) index -= 1;
  }
  function reset() {
    playing = false;
    index = 0;
  }

  function onKey(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName;
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); stepFwd(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stepBack(); }
    else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); reset(); }
  }
</script>

<div class="player" tabindex="0" role="group" aria-label="Algorithm player" onkeydown={onKey}>
  <div class="stage" aria-live="polite">
    {@render children({ frame, index: clamped, total })}
  </div>

  {#if frame?.status}
    <p class="status"><span class="status-dot" class:done={frame.done}></span>{frame.status}</p>
  {/if}

  {#if legend}<div class="legend">{@render legend()}</div>{/if}

  <div class="controls">
    <div class="transport">
      <button class="ctrl" onclick={reset} aria-label="Reset" title="Reset (R)">⏮</button>
      <button class="ctrl" onclick={stepBack} aria-label="Step back" title="Step back (←)" disabled={clamped === 0}>◀</button>
      <button class="ctrl play" onclick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} title="Play / pause (Space)">
        {playing ? '⏸' : '▶'}
      </button>
      <button class="ctrl" onclick={stepFwd} aria-label="Step forward" title="Step forward (→)" disabled={atEnd}>▶</button>
      <label class="speed">
        Speed
        <select bind:value={rate} aria-label="Playback speed">
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
          <option value={4}>4×</option>
        </select>
      </label>
    </div>

    <div class="scrub">
      <input
        type="range"
        min="0"
        max={Math.max(0, total - 1)}
        value={clamped}
        aria-label="Timeline"
        oninput={(e) => { playing = false; index = +(e.currentTarget as HTMLInputElement).value; }}
      />
      <span class="counter">{total ? clamped + 1 : 0} / {total}</span>
    </div>
  </div>

  {#if controls}<div class="extra-controls">{@render controls()}</div>{/if}
</div>

<style>
  .player {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-soft);
    padding: 0.9rem;
    outline: none;
  }
  .player:focus-visible { box-shadow: 0 0 0 2px var(--accent); }
  .stage {
    background: var(--bg-elevated);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-sm);
    padding: 1rem;
    overflow-x: auto;
  }
  .status {
    margin: 0.7rem 0 0;
    font-size: 0.9rem;
    color: var(--text-soft);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 1.3rem;
  }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
  .status-dot.done { background: var(--success); }

  .legend { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 0.6rem; font-size: 0.8rem; color: var(--text-soft); }

  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.8rem; margin-top: 0.8rem; }
  .transport { display: flex; align-items: center; gap: 0.35rem; }
  .ctrl {
    font: inherit; cursor: pointer; width: 2.2rem; height: 2.2rem;
    display: inline-grid; place-items: center;
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: var(--bg-elevated); color: var(--text); font-size: 0.9rem;
  }
  .ctrl:hover:not(:disabled) { background: var(--bg-soft); }
  .ctrl:disabled { opacity: 0.4; cursor: not-allowed; }
  .ctrl.play { background: var(--accent); color: var(--accent-contrast); border-color: var(--accent); width: 2.6rem; }
  .speed { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.82rem; color: var(--text-soft); }
  .speed select { font: inherit; padding: 0.2rem 0.3rem; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }

  .scrub { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 180px; }
  .scrub input[type='range'] { flex: 1; accent-color: var(--accent); }
  .counter { font-variant-numeric: tabular-nums; font-size: 0.82rem; color: var(--text-faint); white-space: nowrap; }

  .extra-controls { margin-top: 0.8rem; }
</style>
