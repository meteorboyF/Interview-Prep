<script lang="ts">
  import { onMount } from 'svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import SchemaExplorer from './lib/components/SchemaExplorer.svelte';
  import QueryPanel from './lib/components/QueryPanel.svelte';
  import LessonView from './lib/components/LessonView.svelte';
  import { db } from './lib/db/database';
  import { resetSandbox, undoLastChange, restoreOriginalDataset } from './lib/db/databaseReset';
  import { nav, playgroundSql } from './lib/stores';
  import { findLesson, CATEGORIES } from './lib/lessons';
  import { SCHEMA } from './lib/db/schemaMetadata';

  const status = db.status;
  const canUndo = db.canUndo;
  const sandboxDirty = db.sandboxDirty;

  let busy = $state(false);

  onMount(() => {
    db.init().catch(() => {});
  });

  const lesson = $derived($nav.view === 'lesson' && $nav.lessonId ? findLesson($nav.lessonId) : null);

  async function guard(fn: () => Promise<void>) {
    busy = true;
    try {
      await fn();
    } finally {
      busy = false;
    }
  }

  const totalLessons = CATEGORIES.reduce((a, c) => a + c.lessons.length, 0);
</script>

<div class="layout">
  <Sidebar />

  <main>
    {#if $status.phase === 'loading' || $status.phase === 'idle'}
      <div class="overlay">
        <div class="loader panel">
          <div class="spinner"></div>
          <div>
            <strong>Preparing the HR database…</strong>
            <div class="muted">{$status.detail ?? 'Loading'}</div>
          </div>
        </div>
      </div>
    {:else if $status.phase === 'recovering'}
      <div class="banner warn">{$status.detail}</div>
    {:else if $status.phase === 'error'}
      <div class="banner error">
        Database failed to load: {$status.detail}
        <button onclick={() => db.init()}>Retry</button>
      </div>
    {/if}

    {#if $nav.view === 'home'}
      <div class="home">
        <h1>HR SQL Trainer</h1>
        <p>
          An interactive DBMS &amp; SQL course built on <strong>one shared data world</strong>: the HR training dataset
          — 500 employees, 10 departments, 20 jobs and projects, plus salary history, reviews, leave requests and
          20,000+ attendance rows. Every lesson from <code>SELECT</code> basics to recursive CTEs and
          <code>EXPLAIN</code> runs real queries against this same data in an in-browser SQLite engine.
        </p>

        <div class="cards">
          <button class="card panel" onclick={() => nav.set({ view: 'explorer' })}>
            <h3>▦ Dataset Explorer</h3>
            <p class="muted">Ten related tables, the relationship diagram, keys, indexes and sample rows.</p>
          </button>
          <button class="card panel" onclick={() => nav.set({ view: 'playground' })}>
            <h3>▶ SQL Playground</h3>
            <p class="muted">Free-form sandbox: SELECT, INSERT, UPDATE, DELETE, DDL and transactions — fully resettable.</p>
          </button>
          <button class="card panel" onclick={() => nav.set({ view: 'lesson', lessonId: CATEGORIES[0].lessons[0].id })}>
            <h3>▤ {totalLessons} Lessons</h3>
            <p class="muted">Foundations → filtering → aggregates → joins → subqueries → CTEs → window functions → transactions → indexing.</p>
          </button>
        </div>

        <h2>The dataset</h2>
        {#if $status.rowCounts}
          <div class="counts panel">
            <table>
              <thead><tr><th>Table</th><th>Rows</th><th>Role</th></tr></thead>
              <tbody>
                {#each SCHEMA as t}
                  <tr>
                    <td><code>{t.name}</code></td>
                    <td class="num">{$status.rowCounts[t.name]?.toLocaleString()}</td>
                    <td class="muted role">{t.description.split('.')[0]}.</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}

        <h2>Two database modes</h2>
        <div class="modes">
          <div class="panel mode-card">
            <span class="badge mode-learning">Learning</span>
            <p class="muted">A pristine, read-only copy of the dataset. Lessons and predefined queries run here, so results are always predictable.</p>
          </div>
          <div class="panel mode-card">
            <span class="badge mode-sandbox">Sandbox</span>
            <p class="muted">Your own copy for INSERT / UPDATE / DELETE / CREATE / ALTER / DROP and transactions. Reset, undo, or restore the original dataset at any time — the canonical data is never touched.</p>
          </div>
        </div>
      </div>
    {:else if $nav.view === 'explorer'}
      <SchemaExplorer initialTable={$nav.tableName ?? null} />
    {:else if $nav.view === 'playground'}
      <div class="playground">
        <div class="pg-head">
          <h2>SQL Playground <span class="badge mode-sandbox">Sandbox DB</span></h2>
          <div class="pg-actions">
            {#if $sandboxDirty}<span class="muted dirty">sandbox has uncommitted experiments</span>{/if}
            <button onclick={() => guard(undoLastChange)} disabled={busy || !$canUndo} title="Revert the most recent change batch">
              ↶ Undo last change
            </button>
            <button onclick={() => guard(resetSandbox)} disabled={busy} title="Fresh sandbox copy of the HR dataset">
              ⟳ Reset sandbox
            </button>
            <button class="danger" onclick={() => guard(restoreOriginalDataset)} disabled={busy} title="Rebuild both learning and sandbox databases from the pristine dataset">
              Restore original dataset
            </button>
          </div>
        </div>
        <p class="muted">
          Full read-write access to your own copy of the HR dataset: DML, DDL (<code>CREATE TABLE</code> /
          <code>ALTER</code> / <code>DROP</code> on your own tables) and transactions (<code>BEGIN</code>,
          <code>COMMIT</code>, <code>ROLLBACK</code>). Changes never touch the canonical lesson database.
        </p>
        <QueryPanel mode="sandbox" bind:sql={$playgroundSql} />
      </div>
    {:else if lesson}
      <svelte:boundary onerror={(e) => console.error('[lesson-boundary]', e)}>
        {#key lesson.id}
          <LessonView {lesson} />
        {/key}
        {#snippet failed(error)}
          <p class="muted">Lesson failed to render: {String(error)}</p>
        {/snippet}
      </svelte:boundary>
    {:else}
      <p class="muted">Lesson not found.</p>
    {/if}
  </main>
</div>

<style>
  .layout {
    display: flex;
    min-height: 100vh;
  }
  main {
    flex: 1;
    padding: 1.4rem 1.8rem 4rem;
    max-width: 72rem;
    position: relative;
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: color-mix(in srgb, var(--bg) 75%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }
  .loader {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 1.1rem 1.4rem;
    box-shadow: 0 8px 30px rgb(0 0 0 / 0.15);
  }
  .spinner {
    width: 26px;
    height: 26px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .banner {
    padding: 0.6rem 0.9rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.88rem;
  }
  .banner.warn {
    background: var(--warn-soft);
    color: var(--warn);
    border: 1px solid var(--warn);
  }
  .banner.error {
    background: var(--bad-soft);
    color: var(--bad);
    border: 1px solid var(--bad);
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .home {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    max-width: 56rem;
  }
  .home h1 {
    margin: 0;
  }
  .home h2 {
    margin: 0.8rem 0 0;
    font-size: 1.15rem;
  }
  .home p {
    margin: 0;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 0.7rem;
  }
  .card {
    text-align: left;
    padding: 0.9rem 1rem;
    cursor: pointer;
  }
  .card h3 {
    margin: 0 0 0.3rem;
    font-size: 0.98rem;
  }
  .card p {
    margin: 0;
    font-size: 0.82rem;
  }
  .counts {
    overflow-x: auto;
  }
  .counts table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.85rem;
  }
  .counts th,
  .counts td {
    text-align: left;
    padding: 0.4rem 0.75rem;
    border-bottom: 1px solid var(--border);
  }
  .counts th {
    background: var(--panel-2);
  }
  .num {
    font-family: var(--mono);
    text-align: right;
  }
  .role {
    font-size: 0.78rem;
  }
  .modes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 0.7rem;
  }
  .mode-card {
    padding: 0.8rem 1rem;
  }
  .mode-card p {
    margin: 0.4rem 0 0;
    font-size: 0.83rem;
  }
  .playground {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  .pg-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .pg-head h2 {
    margin: 0;
  }
  .pg-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .dirty {
    font-size: 0.78rem;
  }
  .playground > p {
    margin: 0;
    font-size: 0.88rem;
  }
</style>
