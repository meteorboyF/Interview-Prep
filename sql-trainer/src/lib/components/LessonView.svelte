<script lang="ts">
  import type { Lesson } from '../lessons/types';
  import { renderMd } from '../md';
  import QueryPanel from './QueryPanel.svelte';
  import ConcurrencySim from './ConcurrencySim.svelte';
  import NormalizationViz from './NormalizationViz.svelte';

  let { lesson }: { lesson: Lesson } = $props();

  // per-example editable SQL state. Initialized synchronously so bindings are
  // never undefined; the parent renders LessonView inside {#key lesson.id},
  // so a lesson change recreates this component with fresh state.
  // svelte-ignore state_referenced_locally
  let sqlState: string[] = $state(lesson.sections.map((s) => s.example?.sql ?? ''));

  const dialectLabel: Record<string, string> = {
    standard: 'Standard SQL',
    mysql: 'MySQL/MariaDB syntax',
    sqlite: 'SQLite syntax',
    workaround: 'Browser-compatible workaround'
  };
</script>

<article class="lesson">
  <h2>{lesson.title}</h2>
  <p class="muted summary">{lesson.summary}</p>

  {#each lesson.sections as section, i}
    <section>
      {#if section.heading}<h3>{section.heading}</h3>{/if}
      {#if section.body}
        <div class="body">{@html renderMd(section.body)}</div>
      {/if}

      {#if section.example}
        {@const ex = section.example}
        <div class="example panel">
          <div class="ex-head">
            <span class="badge dialect-{ex.dialect}">{dialectLabel[ex.dialect]}</span>
            {#if ex.mode === 'sandbox'}
              <span class="badge mode-sandbox">runs in sandbox — resettable</span>
            {/if}
            {#if ex.expectError}
              <span class="badge dialect-workaround">intentionally fails — read the error</span>
            {/if}
          </div>
          {#if ex.mysqlSql}
            <div class="mysql-variant">
              <div class="variant-label muted">Original MySQL/MariaDB form (shown for reference — the browser engine cannot run it):</div>
              <pre class="sql-block">{ex.mysqlSql}</pre>
            </div>
          {/if}
          <QueryPanel mode={ex.mode ?? 'learning'} bind:sql={sqlState[i]} compact />
          {#if ex.note}
            <div class="ex-note muted">{@html renderMd(ex.note)}</div>
          {/if}
        </div>
      {/if}

      {#if section.concurrency}
        <ConcurrencySim scenario={section.concurrency} />
      {/if}

      {#if section.normalization}
        <NormalizationViz />
      {/if}
    </section>
  {/each}
</article>

<style>
  .lesson {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 60rem;
  }
  h2 {
    margin: 0;
  }
  .summary {
    margin: 0;
    font-size: 0.95rem;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  h3 {
    margin: 0.6rem 0 0;
    font-size: 1.05rem;
  }
  .body :global(p) {
    margin: 0.3rem 0;
    font-size: 0.9rem;
  }
  .body :global(ul) {
    margin: 0.3rem 0;
    padding-left: 1.3rem;
    font-size: 0.9rem;
  }
  .example {
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    background: var(--panel-2);
  }
  .ex-head {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .variant-label {
    font-size: 0.76rem;
    margin-bottom: 0.25rem;
  }
  .ex-note {
    font-size: 0.82rem;
  }
  .ex-note :global(p) {
    margin: 0.2rem 0;
  }
</style>
