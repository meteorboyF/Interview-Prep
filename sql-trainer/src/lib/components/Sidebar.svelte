<script lang="ts">
  import { nav } from '../stores';
  import { CATEGORIES } from '../lessons';

  let open: Record<string, boolean> = $state({ [CATEGORIES[0]?.id]: true });

  function toggle(id: string) {
    open[id] = !open[id];
  }
</script>

<nav class="sidebar">
  <div class="brand">
    <span class="logo">HR</span>
    <div>
      <div class="title">SQL Trainer</div>
      <div class="sub muted">one dataset, every concept</div>
    </div>
  </div>

  <button class="nav-item" class:active={$nav.view === 'home'} onclick={() => nav.set({ view: 'home' })}>
    ⌂ Overview
  </button>
  <button class="nav-item" class:active={$nav.view === 'explorer'} onclick={() => nav.set({ view: 'explorer' })}>
    ▦ Dataset Explorer
  </button>
  <button class="nav-item" class:active={$nav.view === 'playground'} onclick={() => nav.set({ view: 'playground' })}>
    ▶ SQL Playground
  </button>

  <div class="section-label muted">Lessons</div>
  <div class="lessons">
    {#each CATEGORIES as cat}
      <button class="cat" onclick={() => toggle(cat.id)}>
        <span class="chev">{open[cat.id] ? '▾' : '▸'}</span>
        {cat.title}
        <span class="count muted">{cat.lessons.length}</span>
      </button>
      {#if open[cat.id]}
        {#each cat.lessons as lesson}
          <button
            class="nav-item lesson"
            class:active={$nav.view === 'lesson' && $nav.lessonId === lesson.id}
            onclick={() => nav.set({ view: 'lesson', lessonId: lesson.id })}
          >
            {lesson.title}
          </button>
        {/each}
      {/if}
    {/each}
  </div>
</nav>

<style>
  .sidebar {
    width: 260px;
    min-width: 260px;
    height: 100vh;
    overflow-y: auto;
    background: var(--panel);
    border-right: 1px solid var(--border);
    padding: 0.9rem 0.7rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    position: sticky;
    top: 0;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.2rem 0.4rem 0.9rem;
  }
  .logo {
    background: var(--accent);
    color: white;
    font-weight: 800;
    border-radius: 8px;
    padding: 0.35rem 0.5rem;
    font-size: 0.9rem;
  }
  .title {
    font-weight: 700;
  }
  .sub {
    font-size: 0.7rem;
  }
  .nav-item {
    text-align: left;
    border: none;
    background: none;
    padding: 0.42rem 0.6rem;
    border-radius: 7px;
    font-size: 0.86rem;
    width: 100%;
  }
  .nav-item:hover {
    background: var(--panel-2);
  }
  .nav-item.active {
    background: var(--accent-soft);
    color: var(--accent);
    font-weight: 600;
  }
  .section-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.9rem 0.6rem 0.3rem;
  }
  .lessons {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .cat {
    text-align: left;
    border: none;
    background: none;
    font-weight: 600;
    font-size: 0.8rem;
    padding: 0.4rem 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
  }
  .cat:hover {
    background: var(--panel-2);
  }
  .chev {
    width: 0.8rem;
    color: var(--muted);
  }
  .count {
    margin-left: auto;
    font-size: 0.7rem;
  }
  .nav-item.lesson {
    padding-left: 1.7rem;
    font-size: 0.82rem;
  }
</style>
