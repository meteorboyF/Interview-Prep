<script lang="ts">
  import type { ConcurrencyScenario } from '../lessons/types';

  let { scenario }: { scenario: ConcurrencyScenario } = $props();

  let step = $state(0);

  $effect(() => {
    scenario;
    step = 0;
  });
</script>

<div class="sim panel">
  <div class="sim-head">
    <strong>{scenario.title}</strong>
    <span class="badge dialect-workaround">SIMULATED</span>
  </div>
  <p class="muted note">
    A browser SQLite database has a single connection, so genuine concurrent sessions cannot exist here.
    This timeline simulates what two real server sessions (e.g. MySQL/MariaDB connections) would experience.
  </p>

  <div class="cols">
    <div class="col-label a">Session A</div>
    <div class="col-label b">Session B</div>
  </div>
  <div class="timeline">
    {#each scenario.steps.slice(0, step) as s, i}
      <div class="step {s.session === 'A' ? 'left' : s.session === 'B' ? 'right' : 'center'}">
        <div class="bubble {s.session === 'DB' ? 'db' : ''} {s.highlight ?? ''}">
          <span class="n">{i + 1}</span>
          {s.text}
        </div>
      </div>
    {/each}
  </div>

  <div class="controls">
    <button class="primary" onclick={() => (step = Math.min(step + 1, scenario.steps.length))} disabled={step >= scenario.steps.length}>
      {step === 0 ? 'Start ▶' : 'Next step ▶'}
    </button>
    <button onclick={() => (step = Math.max(0, step - 1))} disabled={step === 0}>‹ Back</button>
    <button onclick={() => (step = 0)} disabled={step === 0}>Reset</button>
    <span class="muted progress">{step} / {scenario.steps.length}</span>
  </div>

  {#if step >= scenario.steps.length}
    <div class="outcome">
      <div><strong>Outcome:</strong> {scenario.outcome}</div>
      <div class="prevention"><strong>Prevention:</strong> {scenario.prevention}</div>
    </div>
  {/if}
</div>

<style>
  .sim {
    padding: 0.9rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .sim-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .note {
    margin: 0;
    font-size: 0.8rem;
  }
  .cols {
    display: flex;
  }
  .col-label {
    flex: 1;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .col-label.a { color: var(--accent); }
  .col-label.b { color: var(--warn); text-align: right; }
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-height: 2rem;
  }
  .step {
    display: flex;
  }
  .step.left { justify-content: flex-start; }
  .step.right { justify-content: flex-end; }
  .step.center { justify-content: center; }
  .bubble {
    max-width: 72%;
    font-size: 0.83rem;
    padding: 0.45rem 0.7rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--panel-2);
    font-family: var(--mono);
  }
  .step.left .bubble { border-left: 3px solid var(--accent); }
  .step.right .bubble { border-right: 3px solid var(--warn); }
  .bubble.db {
    background: var(--panel);
    border-style: dashed;
    font-family: var(--sans);
    font-style: italic;
    color: var(--muted);
  }
  .bubble.problem {
    background: var(--bad-soft);
    border-color: var(--bad);
    color: var(--bad);
  }
  .bubble.ok {
    background: var(--good-soft);
    border-color: var(--good);
  }
  .n {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--muted);
    margin-right: 0.35rem;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .progress {
    font-size: 0.78rem;
  }
  .outcome {
    background: var(--accent-soft);
    border: 1px solid var(--accent);
    border-radius: 8px;
    padding: 0.6rem 0.85rem;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
</style>
