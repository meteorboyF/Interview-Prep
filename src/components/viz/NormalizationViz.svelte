<script lang="ts">
  import Player from './Player.svelte';

  interface Tbl { name: string; cols: string[]; pk: string[]; rows: string[][]; }
  interface Stage { title: string; note: string; tables: Tbl[]; }

  const stages: Stage[] = [
    {
      title: 'Unnormalized (0NF)',
      note: 'The Courses column holds multiple values in one cell — a repeating group. This violates 1NF.',
      tables: [{
        name: 'Enrollment', pk: ['SID'],
        cols: ['SID', 'SName', 'Dept', 'DeptHead', 'Courses'],
        rows: [['1', 'Ana', 'CS', 'Dr. Roy', 'DB, OS'], ['2', 'Ben', 'EE', 'Dr. Lee', 'Signals']],
      }],
    },
    {
      title: '1NF — atomic values',
      note: 'Split the repeating group so every cell is atomic. PK becomes (SID, Course). Now SName/Dept/DeptHead depend only on SID → partial dependency.',
      tables: [{
        name: 'Enrollment', pk: ['SID', 'Course'],
        cols: ['SID', 'Course', 'SName', 'Dept', 'DeptHead'],
        rows: [['1', 'DB', 'Ana', 'CS', 'Dr. Roy'], ['1', 'OS', 'Ana', 'CS', 'Dr. Roy'], ['2', 'Signals', 'Ben', 'EE', 'Dr. Lee']],
      }],
    },
    {
      title: '2NF — remove partial dependencies',
      note: 'Move attributes that depend on only part of the key (SID) into their own table. Enroll keeps the full-key facts. But Dept → DeptHead is still transitive.',
      tables: [
        { name: 'Students', pk: ['SID'], cols: ['SID', 'SName', 'Dept', 'DeptHead'], rows: [['1', 'Ana', 'CS', 'Dr. Roy'], ['2', 'Ben', 'EE', 'Dr. Lee']] },
        { name: 'Enroll', pk: ['SID', 'Course'], cols: ['SID', 'Course'], rows: [['1', 'DB'], ['1', 'OS'], ['2', 'Signals']] },
      ],
    },
    {
      title: '3NF — remove transitive dependencies',
      note: 'DeptHead depends on Dept, not directly on the key. Move it to its own table. Every non-key attribute now depends on the key, the whole key, and nothing but the key.',
      tables: [
        { name: 'Students', pk: ['SID'], cols: ['SID', 'SName', 'Dept'], rows: [['1', 'Ana', 'CS'], ['2', 'Ben', 'EE']] },
        { name: 'Departments', pk: ['Dept'], cols: ['Dept', 'DeptHead'], rows: [['CS', 'Dr. Roy'], ['EE', 'Dr. Lee']] },
        { name: 'Enroll', pk: ['SID', 'Course'], cols: ['SID', 'Course'], rows: [['1', 'DB'], ['1', 'OS'], ['2', 'Signals']] },
      ],
    },
  ];

  const frames = stages.map((s, i) => ({ stage: i, status: `${s.title} — ${s.note}`, done: i === stages.length - 1 }));
</script>

<div class="viz">
  <p class="note">Step through normalization: each stage removes a class of redundancy/anomaly.</p>
  <Player {frames} baseDelay={2600}>
    {#snippet children({ frame })}
      {@const stage = stages[frame.stage]}
      <div class="nz">
        <div class="stage-badge">{stage.title}</div>
        <div class="tables">
          {#each stage.tables as t (t.name)}
            <div class="tbl">
              <div class="tbl-name">{t.name} <span class="pk">PK: {t.pk.join(', ')}</span></div>
              <table>
                <thead><tr>{#each t.cols as c}<th class:key={t.pk.includes(c)}>{c}</th>{/each}</tr></thead>
                <tbody>
                  {#each t.rows as row}
                    <tr>{#each row as cell, ci}<td class:key={t.pk.includes(t.cols[ci])}>{cell}</td>{/each}</tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/each}
        </div>
      </div>
    {/snippet}
    {#snippet legend()}
      <span><i class="sw" style="background:color-mix(in srgb, var(--accent) 25%, transparent)"></i>primary-key column</span>
    {/snippet}
  </Player>
</div>

<style>
  .note { font-size: 0.85rem; color: var(--text-soft); margin: 0 0 0.8rem; }
  .stage-badge { display: inline-block; font-weight: 800; color: var(--accent); background: var(--accent-soft); padding: 0.3rem 0.7rem; border-radius: 999px; margin-bottom: 0.9rem; }
  .tables { display: flex; gap: 1.2rem; flex-wrap: wrap; }
  .tbl-name { font-size: 0.8rem; font-weight: 700; color: var(--text); margin-bottom: 0.3rem; }
  .pk { font-size: 0.7rem; color: var(--text-faint); font-weight: 600; }
  table { border-collapse: collapse; font-size: 0.83rem; }
  th, td { border: 1px solid var(--border); padding: 0.25rem 0.6rem; text-align: left; }
  th { background: var(--bg-soft); font-weight: 700; }
  .key { background: color-mix(in srgb, var(--accent) 12%, transparent); }
  th.key { background: color-mix(in srgb, var(--accent) 22%, transparent); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
