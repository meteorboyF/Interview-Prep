<script lang="ts">
  import Player from './Player.svelte';

  type Emp = { id: number; name: string; dept: number | null };
  type Dept = { id: number; name: string };
  const emps: Emp[] = [
    { id: 1, name: 'Ana', dept: 10 },
    { id: 2, name: 'Ben', dept: 20 },
    { id: 3, name: 'Cara', dept: 40 },
  ];
  const depts: Dept[] = [
    { id: 10, name: 'Sales' },
    { id: 20, name: 'Eng' },
    { id: 30, name: 'HR' },
  ];

  type Row = { emp: string; dept: string; kind: string };
  interface JFrame { li: number; ri: number | null; result: Row[]; status: string; done?: boolean }

  let join = $state<'inner' | 'left' | 'right' | 'full' | 'cross'>('inner');

  function build(kind: typeof join): JFrame[] {
    const frames: JFrame[] = [];
    const result: Row[] = [];
    const matchedRight = new Set<number>();
    const snap = (li: number, ri: number | null, status: string, done = false): JFrame =>
      ({ li, ri, result: result.map((r) => ({ ...r })), status, done });
    const empStr = (e: Emp) => `${e.id}, ${e.name}, ${e.dept ?? 'NULL'}`;
    const deptStr = (d: Dept) => `${d.id}, ${d.name}`;

    frames.push(snap(-1, null, `${kind.toUpperCase()} JOIN on Employees.dept = Departments.id.`));
    for (let i = 0; i < emps.length; i++) {
      const e = emps[i];
      let matched = false;
      for (let j = 0; j < depts.length; j++) {
        const d = depts[j];
        if (kind === 'cross') {
          result.push({ emp: e.name, dept: d.name, kind: 'match' });
          frames.push(snap(i, j, `CROSS: pair every Employee with every Department → (${e.name}, ${d.name}).`));
          continue;
        }
        frames.push(snap(i, j, `Compare ${e.name}'s dept ${e.dept ?? 'NULL'} with Department ${d.id} (${d.name}).`));
        if (e.dept === d.id) {
          matched = true; matchedRight.add(d.id);
          result.push({ emp: e.name, dept: d.name, kind: 'match' });
          frames.push(snap(i, j, `Match! Emit (${e.name}, ${d.name}).`));
        }
      }
      if (!matched && kind !== 'cross' && (kind === 'left' || kind === 'full')) {
        result.push({ emp: e.name, dept: 'NULL', kind: 'left-null' });
        frames.push(snap(i, null, `${e.name} had no matching department → LEFT/FULL keeps it with NULLs.`));
      }
    }
    if (kind === 'right' || kind === 'full') {
      for (let j = 0; j < depts.length; j++) {
        const d = depts[j];
        if (!matchedRight.has(d.id)) {
          result.push({ emp: 'NULL', dept: d.name, kind: 'right-null' });
          frames.push(snap(null as any, j, `Department ${d.name} had no employees → RIGHT/FULL keeps it with NULLs.`));
        }
      }
    }
    frames.push(snap(-1, null, `Done. ${result.length} row(s) in the result set.`, true));
    return frames;
  }

  const frames = $derived(build(join));
</script>

<div class="viz">
  <div class="viz-toolbar">
    <label>Join type
      <select bind:value={join}>
        <option value="inner">INNER JOIN</option>
        <option value="left">LEFT JOIN</option>
        <option value="right">RIGHT JOIN</option>
        <option value="full">FULL OUTER JOIN</option>
        <option value="cross">CROSS JOIN</option>
      </select>
    </label>
    <code class="sql">SELECT * FROM Employees e {join === 'cross' ? 'CROSS JOIN' : join.toUpperCase() + ' JOIN'} Departments d{join !== 'cross' ? ' ON e.dept = d.id' : ''};</code>
  </div>

  {#key join}
    <Player {frames} baseDelay={700}>
      {#snippet children({ frame }: { frame: JFrame })}
        <div class="join-stage">
          <div class="tables">
            <div class="tbl">
              <div class="tbl-name">Employees</div>
              <table>
                <thead><tr><th>id</th><th>name</th><th>dept</th></tr></thead>
                <tbody>
                  {#each emps as e, i}
                    <tr class:hi={frame.li === i}><td>{e.id}</td><td>{e.name}</td><td>{e.dept ?? 'NULL'}</td></tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <div class="tbl">
              <div class="tbl-name">Departments</div>
              <table>
                <thead><tr><th>id</th><th>name</th></tr></thead>
                <tbody>
                  {#each depts as d, j}
                    <tr class:hi={frame.ri === j}><td>{d.id}</td><td>{d.name}</td></tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
          <div class="tbl result">
            <div class="tbl-name">Result</div>
            <table>
              <thead><tr><th>e.name</th><th>d.name</th></tr></thead>
              <tbody>
                {#each frame.result as r}
                  <tr class={r.kind}><td>{r.emp}</td><td>{r.dept}</td></tr>
                {/each}
                {#if !frame.result.length}<tr><td colspan="2" class="empty">—</td></tr>{/if}
              </tbody>
            </table>
          </div>
        </div>
      {/snippet}
      {#snippet legend()}
        <span><i class="sw" style="background:var(--viz-compare)"></i>row under comparison</span>
        <span><i class="sw" style="background:var(--viz-visited)"></i>NULL-padded (outer join)</span>
      {/snippet}
    </Player>
  {/key}
</div>

<style>
  .viz-toolbar { display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: center; margin-bottom: 0.8rem; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.78rem; color: var(--text-soft); font-weight: 600; }
  select { font: inherit; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text); }
  .sql { font-size: 0.78rem; background: var(--code-bg); padding: 0.35rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-soft); color: var(--text-soft); }
  .join-stage { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start; }
  .tables { display: flex; gap: 1rem; }
  .tbl-name { font-size: 0.75rem; font-weight: 700; color: var(--accent); margin-bottom: 0.3rem; }
  table { border-collapse: collapse; font-size: 0.82rem; }
  th, td { border: 1px solid var(--border); padding: 0.25rem 0.55rem; text-align: left; }
  th { background: var(--bg-soft); font-weight: 700; }
  tbody tr.hi td { background: color-mix(in srgb, var(--viz-compare) 30%, transparent); }
  .result table { min-width: 140px; }
  tr.match td { background: color-mix(in srgb, var(--viz-sorted) 18%, transparent); }
  tr.left-null td, tr.right-null td { background: color-mix(in srgb, var(--viz-visited) 20%, transparent); font-style: italic; }
  .empty { text-align: center; color: var(--text-faint); }
  .sw { display: inline-block; width: 11px; height: 11px; border-radius: 3px; margin-right: 0.3rem; vertical-align: -1px; }
</style>
