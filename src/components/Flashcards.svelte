<script lang="ts">
  interface Q { id: string; section: string; type: string; q: string; a: string; }
  interface Props { questions: Q[]; }
  let { questions }: Props = $props();

  const sections = ['All topics', ...Array.from(new Set(questions.map((q) => q.section)))];
  let section = $state('All topics');
  let type = $state<'all' | 'concept' | 'rapid'>('all');
  let shuffled = $state(false);

  let pool = $derived.by(() => {
    let list = questions.filter((q) => (section === 'All topics' || q.section === section) && (type === 'all' || q.type === type));
    if (shuffled) list = seededShuffle(list);
    return list;
  });

  let idx = $state(0);
  let revealed = $state(false);
  let known = $state<Record<string, boolean>>({});

  // Reset position when the pool changes.
  let poolKey = $derived(`${section}|${type}|${shuffled}`);
  let prevKey = '';
  $effect(() => {
    if (poolKey !== prevKey) { prevKey = poolKey; idx = 0; revealed = false; }
  });

  const current = $derived(pool[idx]);
  const knownCount = $derived(pool.filter((q) => known[q.id]).length);

  function seededShuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function next() { if (idx < pool.length - 1) { idx++; revealed = false; } }
  function prev() { if (idx > 0) { idx--; revealed = false; } }
  function markKnown(v: boolean) { if (current) { known = { ...known, [current.id]: v }; next(); } }

  function onKey(e: KeyboardEvent) {
    if (/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); revealed = !revealed; }
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="deck">
  <div class="deck-controls">
    <label>Topic
      <select bind:value={section}>
        {#each sections as s}<option value={s}>{s}</option>{/each}
      </select>
    </label>
    <label>Type
      <select bind:value={type}>
        <option value="all">All</option>
        <option value="concept">Conceptual</option>
        <option value="rapid">Rapid-fire</option>
      </select>
    </label>
    <label class="chk"><input type="checkbox" bind:checked={shuffled} /> Shuffle</label>
  </div>

  {#if current}
    <div class="counter-row">
      <span>Card {idx + 1} of {pool.length}</span>
      <span>{knownCount} marked known</span>
    </div>
    <button class="flashcard" class:flipped={revealed} onclick={() => (revealed = !revealed)} aria-label="Reveal answer">
      <div class="fc-inner">
        <div class="fc-face fc-front">
          <span class="fc-tag">{current.type === 'rapid' ? 'Rapid-fire' : 'Q'} · {current.section}</span>
          <p class="fc-q">{current.q}</p>
          <span class="fc-hint">Click or press Space to reveal</span>
        </div>
        <div class="fc-face fc-back">
          <span class="fc-tag">Answer</span>
          <p class="fc-a">{current.a}</p>
          {#if known[current.id]}<span class="fc-known">✓ marked known</span>{/if}
        </div>
      </div>
    </button>

    <div class="deck-nav">
      <button class="btn" onclick={prev} disabled={idx === 0}>← Prev</button>
      <div class="know-btns">
        <button class="btn know-no" onclick={() => markKnown(false)}>Review again</button>
        <button class="btn know-yes" onclick={() => markKnown(true)}>I knew it ✓</button>
      </div>
      <button class="btn" onclick={next} disabled={idx === pool.length - 1}>Next →</button>
    </div>
    <p class="kbd-hint"><kbd>Space</kbd> flip · <kbd>←</kbd> <kbd>→</kbd> navigate</p>
  {:else}
    <p class="empty">No questions match this filter.</p>
  {/if}
</div>

<style>
  .deck { max-width: 640px; margin: 0 auto; }
  .deck-controls { display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: flex-end; justify-content: center; margin-bottom: 1.2rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  .chk { flex-direction: row; align-items: center; gap: 0.3rem; }
  select { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .counter-row { display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--text-faint); margin-bottom: 0.5rem; }

  .flashcard { display: block; width: 100%; border: none; background: none; padding: 0; cursor: pointer; perspective: 1600px; font: inherit; text-align: left; }
  .fc-inner { position: relative; transform-style: preserve-3d; transition: transform 0.5s; min-height: 240px; }
  .flashcard.flipped .fc-inner { transform: rotateX(180deg); }
  .fc-face {
    position: absolute; inset: 0; backface-visibility: hidden;
    border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 1.6rem; display: flex; flex-direction: column; gap: 0.8rem;
    background: var(--bg-elevated);
  }
  .fc-back { transform: rotateX(180deg); background: var(--accent-soft); }
  .fc-tag { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); }
  .fc-q { font-size: 1.15rem; font-weight: 600; margin: 0; flex: 1; }
  .fc-a { font-size: 1rem; margin: 0; flex: 1; }
  .fc-hint { font-size: 0.78rem; color: var(--text-faint); }
  .fc-known { font-size: 0.8rem; color: var(--success); font-weight: 700; }

  .deck-nav { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; margin-top: 1.2rem; flex-wrap: wrap; }
  .know-btns { display: flex; gap: 0.5rem; }
  .know-yes { border-color: var(--success); color: var(--success); }
  .know-no { border-color: var(--warning); color: var(--warning); }
  .kbd-hint { text-align: center; font-size: 0.78rem; color: var(--text-faint); margin-top: 0.8rem; }
  kbd { font-family: var(--font-mono); font-size: 0.82em; background: var(--bg-soft); border: 1px solid var(--border); border-bottom-width: 2px; border-radius: 5px; padding: 0.05em 0.35em; }
  .empty { text-align: center; color: var(--text-soft); padding: 2rem; }
</style>
