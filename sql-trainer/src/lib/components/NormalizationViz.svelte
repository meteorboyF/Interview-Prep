<script lang="ts">
  import { openInPlayground } from '../stores';

  // Real rows from the HR dataset flattened into one denormalized "spreadsheet"
  // (employees 3, 7, 8 in Sales + employee 2 in Engineering).
  const denorm = {
    columns: ['employee_id', 'employee_name', 'department_name', 'department_location', 'job_title', 'project_1', 'project_2', 'manager_name'],
    rows: [
      ['2', 'Jeffrey Doyle', 'Engineering', 'Dhaka', 'VP of Engineering', 'Platform Modernization', 'NULL', 'Angel Hill'],
      ['3', 'Patricia Miller', 'Sales', 'Chattogram', 'VP of Sales', 'NULL', 'NULL', 'Angel Hill'],
      ['7', 'Lisa Smith', 'Sales', 'Chattogram', 'Sales Manager', 'Sales Pipeline Revamp', 'NULL', 'Patricia Miller'],
      ['8', 'Helen Peterson', 'Sales', 'Chattogram', 'Sales Manager', 'Sales Pipeline Revamp', 'Client Portal', 'Patricia Miller']
    ]
  };

  const steps = [
    {
      title: '0. The denormalized spreadsheet',
      text: 'Everything about a person in one wide row. Problems: department data repeats on every row (update anomaly), the repeating project_1/project_2 columns cap projects at two (insertion anomaly), and deleting the last Sales employee would erase the fact the Sales department exists (deletion anomaly).',
      highlight: 'all'
    },
    {
      title: '1NF — atomic values, no repeating groups',
      text: 'project_1 / project_2 are a repeating group. First Normal Form demands one value per cell: split project membership into its own rows. This is exactly why the real dataset has an employee_projects junction table (composite key employee_id + project_id) — one row per assignment, unlimited projects per employee.',
      highlight: 'projects'
    },
    {
      title: '2NF / 3NF — remove partial & transitive dependencies',
      text: 'department_location depends on department_name, not on the employee — a transitive dependency. job_title likewise describes a job, not a person. Third Normal Form moves them out: departments (with location_id → locations) and jobs become their own tables, and the employee row keeps only foreign keys.',
      highlight: 'department'
    },
    {
      title: 'Result — the actual HR schema',
      text: 'The supplied dataset IS the normalized result: employees(job_id, department_id, manager_id) → jobs / departments → locations, and employees ↔ projects via employee_projects. manager_name became manager_id, a self-referencing foreign key. Run the query to reassemble the original wide row with joins — normalization loses nothing, it just stores each fact once.',
      highlight: 'none'
    }
  ];

  let step = $state(0);

  const reassembleSql = `-- Reassemble the denormalized row from the normalized schema
SELECT e.employee_id,
       e.first_name || ' ' || e.last_name  AS employee_name,
       d.department_name,
       l.city                              AS department_location,
       j.job_title,
       p.project_name,
       m.first_name || ' ' || m.last_name  AS manager_name
FROM employees e
LEFT JOIN departments d       ON d.department_id = e.department_id
LEFT JOIN locations l         ON l.location_id = d.location_id
LEFT JOIN jobs j              ON j.job_id = e.job_id
LEFT JOIN employees m         ON m.employee_id = e.manager_id
LEFT JOIN employee_projects ep ON ep.employee_id = e.employee_id
LEFT JOIN projects p          ON p.project_id = ep.project_id
WHERE e.employee_id IN (2, 3, 7, 8)
ORDER BY e.employee_id;`;

  function colClass(col: string): string {
    const h = steps[step].highlight;
    if (h === 'all') return 'hl';
    if (h === 'projects' && (col === 'project_1' || col === 'project_2')) return 'hl';
    if (h === 'department' && (col === 'department_name' || col === 'department_location' || col === 'job_title' || col === 'manager_name')) return 'hl';
    return '';
  }
</script>

<div class="viz panel">
  <div class="head">
    <strong>{steps[step].title}</strong>
    <span class="spacer"></span>
    <button onclick={() => (step = Math.max(0, step - 1))} disabled={step === 0}>‹ Back</button>
    <button class="primary" onclick={() => (step = Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>Next ›</button>
  </div>
  <p class="text">{steps[step].text}</p>

  {#if step < 3}
    <div class="scroll">
      <table>
        <thead>
          <tr>
            {#each denorm.columns as col}
              <th class={colClass(col)}>{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each denorm.rows as row}
            <tr>
              {#each row as cell, i}
                <td class={colClass(denorm.columns[i])} class:null={cell === 'NULL'}>{cell}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="tables-diagram">
      {#each ['employees', 'departments', 'locations', 'jobs', 'projects', 'employee_projects'] as t}
        <span class="badge fk">{t}</span>
      {/each}
    </div>
    <button onclick={() => openInPlayground(reassembleSql)}>Run the reassembly query on the real data →</button>
  {/if}
</div>

<style>
  .viz {
    padding: 0.9rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .spacer {
    flex: 1;
  }
  .text {
    margin: 0;
    font-size: 0.87rem;
  }
  .scroll {
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    font-size: 0.78rem;
    width: 100%;
  }
  th,
  td {
    border: 1px solid var(--border);
    padding: 0.3rem 0.55rem;
    white-space: nowrap;
    font-family: var(--mono);
  }
  th {
    background: var(--panel-2);
    font-family: var(--sans);
  }
  th.hl,
  td.hl {
    background: var(--warn-soft);
  }
  td.null {
    color: var(--muted);
    font-style: italic;
  }
  .tables-diagram {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
</style>
