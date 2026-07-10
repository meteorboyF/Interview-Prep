<script lang="ts">
  import Player from './Player.svelte';

  type Step = { tx: 'T1' | 'T2'; text: string; db?: Record<string, number | string>; local?: string; flag?: 'bad' | 'good'; note: string };
  interface Scenario { name: string; verdict: string; verdictKind: 'bad' | 'good'; steps: Step[] }

  const scenarios: Record<string, Scenario> = {
    lost: {
      name: 'Lost Update',
      verdictKind: 'bad',
      verdict: "T1's write is overwritten by T2 — its +10 update is lost. Prevented by locking / higher isolation.",
      steps: [
        { tx: 'T1', text: 'READ(A) → 100', local: 'T1 sees A=100', db: { A: 100 }, note: 'T1 reads A = 100.' },
        { tx: 'T2', text: 'READ(A) → 100', local: 'T2 sees A=100', db: { A: 100 }, note: 'T2 also reads A = 100 (before T1 writes).' },
        { tx: 'T1', text: 'A = A + 10', local: 'T1 computes 110', db: { A: 100 }, note: 'T1 computes 100 + 10 = 110 locally.' },
        { tx: 'T1', text: 'WRITE(A) = 110', db: { A: 110 }, note: 'T1 writes A = 110.' },
        { tx: 'T2', text: 'A = A + 20', local: 'T2 computes 120', db: { A: 110 }, note: 'T2 computes 100 + 20 = 120 (from its stale read!).' },
        { tx: 'T2', text: 'WRITE(A) = 120', db: { A: 120 }, flag: 'bad', note: "T2 writes A = 120, overwriting T1's update — lost update!" },
      ],
    },
    dirty: {
      name: 'Dirty Read',
      verdictKind: 'bad',
      verdict: 'T2 read uncommitted data that was later rolled back — a dirty read. Prevented by READ COMMITTED and above.',
      steps: [
        { tx: 'T1', text: 'WRITE(A) = 200', db: { A: 200 }, note: 'T1 writes A = 200 but has NOT committed yet.' },
        { tx: 'T2', text: 'READ(A) → 200', local: 'T2 sees A=200', db: { A: 200 }, flag: 'bad', note: 'T2 reads the uncommitted value 200 — a dirty read.' },
        { tx: 'T2', text: 'uses A = 200', db: { A: 200 }, note: 'T2 makes a decision based on 200.' },
        { tx: 'T1', text: 'ROLLBACK', db: { A: 100 }, flag: 'bad', note: 'T1 rolls back → A reverts to 100. T2 acted on data that never existed!' },
      ],
    },
    good: {
      name: 'Serializable (2PL)',
      verdictKind: 'good',
      verdict: 'Two-phase locking serializes the transactions: T2 waits for T1 to commit, so no anomaly occurs.',
      steps: [
        { tx: 'T1', text: 'LOCK(A), READ(A) → 100', local: 'T1 holds lock on A', db: { A: 100 }, note: 'T1 acquires an exclusive lock on A and reads 100.' },
        { tx: 'T2', text: 'LOCK(A) … blocked', db: { A: 100 }, note: 'T2 requests A but must WAIT — T1 holds the lock.' },
        { tx: 'T1', text: 'WRITE(A) = 110', db: { A: 110 }, note: 'T1 writes A = 110.' },
        { tx: 'T1', text: 'COMMIT, UNLOCK(A)', db: { A: 110 }, flag: 'good', note: 'T1 commits and releases the lock.' },
        { tx: 'T2', text: 'LOCK(A), READ(A) → 110', local: 'T2 sees A=110', db: { A: 110 }, note: 'T2 now proceeds, reading the committed 110.' },
        { tx: 'T2', text: 'WRITE(A) = 130, COMMIT', db: { A: 130 }, flag: 'good', note: 'T2 writes 130 and commits. Final A = 130 — correct!' },
      ],
    },
  };

  let key = $state<'lost' | 'dirty' | 'good'>('lost');
  const scn = $derived(scenarios[key]);

  interface TFrame { upto: number; db: Record<string, number | string>; status: string; done?: boolean }
  const frames = $derived.by<TFrame[]>(() => {
    const out: TFrame[] = [];
    let db: Record<string, number | string> = { A: 100 };
    out.push({ upto: -1, db: { ...db }, status: `Scenario: ${scn.name}. Watch how the operations interleave.` });
    scn.steps.forEach((s, i) => {
      if (s.db) db = { ...db, ...s.db };
      out.push({ upto: i, db: { ...db }, status: s.note });
    });
    out.push({ upto: scn.steps.length, db: { ...db }, status: scn.verdict, done: true });
    return out;
  });
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Scenario
      <select bind:value={key}>
        <option value="lost">Lost Update (anomaly)</option>
        <option value="dirty">Dirty Read (anomaly)</option>
        <option value="good">Serializable via 2PL (correct)</option>
      </select>
    </label>
  </div>

  {#key key}
    <Player {frames} baseDelay={950}>
      {#snippet children({ frame }: { frame: TFrame })}
        <div class="tx-stage">
          <div class="lanes">
            <div class="lane-head t1">T1</div>
            <div class="lane-head t2">T2</div>
            {#each scn.steps as s, i}
              <div class="cell t1col">
                {#if s.tx === 'T1'}
                  <div class="op t1" class:show={i <= frame.upto} class:cur={i === frame.upto} class:bad={s.flag === 'bad'} class:good={s.flag === 'good'}>
                    {s.text}{#if s.local && i <= frame.upto}<span class="local">{s.local}</span>{/if}
                  </div>
                {/if}
              </div>
              <div class="cell t2col">
                {#if s.tx === 'T2'}
                  <div class="op t2" class:show={i <= frame.upto} class:cur={i === frame.upto} class:bad={s.flag === 'bad'} class:good={s.flag === 'good'}>
                    {s.text}{#if s.local && i <= frame.upto}<span class="local">{s.local}</span>{/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
          <div class="dbpanel">
            <div class="db-title">Database</div>
            {#each Object.entries(frame.db) as [k, v]}
              <div class="db-item"><span class="k">{k}</span><span class="v">{v}</span></div>
            {/each}
            {#if frame.done}
              <div class="verdict {scn.verdictKind}">{scn.verdictKind === 'bad' ? '⚠ Anomaly' : '✓ Correct'}</div>
            {/if}
          </div>
        </div>
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>current step</span>
        <span><i class="sw" style="background:var(--danger)"></i>anomaly point</span>
        <span><i class="sw" style="background:var(--viz-sorted)"></i>safe commit</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { margin-bottom: 0.8rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  select { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .tx-stage { display: flex; gap: 1.2rem; flex-wrap: wrap; align-items: flex-start; }
  .lanes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem 1rem; flex: 1; min-width: 280px; }
  .lane-head { font-weight: 800; text-align: center; padding: 0.3rem; border-radius: 6px; }
  .lane-head.t1 { background: color-mix(in srgb, var(--accent) 15%, transparent); color: var(--accent); }
  .lane-head.t2 { background: color-mix(in srgb, #0891b2 18%, transparent); color: #0891b2; }
  .cell { min-height: 0.5rem; }
  .op { padding: 0.35rem 0.55rem; border-radius: 6px; font-size: 0.82rem; font-family: var(--font-mono); border: 1px solid var(--border); opacity: 0; transform: translateY(-4px); transition: opacity 0.25s, transform 0.25s; display: flex; flex-direction: column; gap: 0.15rem; }
  .op.show { opacity: 1; transform: none; }
  .op.t1 { background: color-mix(in srgb, var(--accent) 8%, var(--bg-elevated)); }
  .op.t2 { background: color-mix(in srgb, #0891b2 8%, var(--bg-elevated)); }
  .op.cur { box-shadow: 0 0 0 2px var(--viz-compare); }
  .op.bad { border-color: var(--danger); }
  .op.good { border-color: var(--success); }
  .local { font-size: 0.68rem; color: var(--text-faint); }
  .dbpanel { min-width: 130px; border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem 0.8rem; background: var(--bg-soft); }
  .db-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-faint); font-weight: 700; margin-bottom: 0.4rem; }
  .db-item { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.9rem; padding: 0.15rem 0; }
  .db-item .k { color: var(--text-soft); } .db-item .v { font-weight: 700; }
  .verdict { margin-top: 0.6rem; padding: 0.3rem 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700; text-align: center; }
  .verdict.bad { background: color-mix(in srgb, var(--danger) 18%, transparent); color: var(--danger); }
  .verdict.good { background: color-mix(in srgb, var(--success) 18%, transparent); color: var(--success); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
