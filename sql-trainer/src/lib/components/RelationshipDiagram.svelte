<script lang="ts">
  let {
    selected = null,
    onselect
  }: {
    selected?: string | null;
    onselect?: (table: string) => void;
  } = $props();

  const W = 168;
  const H = 46;

  // manual layout of the ten tables
  const pos: Record<string, { x: number; y: number }> = {
    locations: { x: 40, y: 26 },
    departments: { x: 300, y: 26 },
    projects: { x: 560, y: 26 },
    jobs: { x: 40, y: 150 },
    employees: { x: 300, y: 150 },
    employee_projects: { x: 560, y: 150 },
    salary_history: { x: 40, y: 288 },
    performance_reviews: { x: 232, y: 288 },
    leave_requests: { x: 424, y: 288 },
    attendance: { x: 616, y: 288 }
  };

  interface Edge {
    from: string;
    to: string;
    label: string;
  }
  const edges: Edge[] = [
    { from: 'departments', to: 'locations', label: 'location_id' },
    { from: 'employees', to: 'departments', label: 'department_id' },
    { from: 'employees', to: 'jobs', label: 'job_id' },
    { from: 'projects', to: 'departments', label: 'department_id' },
    { from: 'employee_projects', to: 'employees', label: 'employee_id' },
    { from: 'employee_projects', to: 'projects', label: 'project_id' },
    { from: 'salary_history', to: 'employees', label: 'employee_id' },
    { from: 'performance_reviews', to: 'employees', label: 'employee_id / reviewer_id' },
    { from: 'leave_requests', to: 'employees', label: 'employee_id' },
    { from: 'attendance', to: 'employees', label: 'employee_id' }
  ];

  function center(t: string) {
    return { cx: pos[t].x + W / 2, cy: pos[t].y + H / 2 };
  }

  /** connect box borders, not centers */
  function line(e: Edge) {
    const a = center(e.from);
    const b = center(e.to);
    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;
    const shrink = (x: number, y: number, sign: number) => {
      // move endpoint from center toward box border
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      let tEdge: number;
      if (absDx / (W / 2) > absDy / (H / 2)) tEdge = W / 2 / absDx;
      else tEdge = H / 2 / (absDy || 1);
      return { x: x + sign * dx * tEdge, y: y + sign * dy * tEdge };
    };
    const p1 = shrink(a.cx, a.cy, 1);
    const p2 = shrink(b.cx, b.cy, -1);
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
  }
</script>

<div class="wrap panel">
  <svg viewBox="0 0 800 360" role="img" aria-label="Relationship diagram of the ten HR tables">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
      </marker>
    </defs>

    {#each edges as e}
      {@const l = line(e)}
      <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="var(--muted)" stroke-width="1.3" marker-end="url(#arrow)" opacity="0.7">
        <title>{e.from}.{e.label} → {e.to}</title>
      </line>
    {/each}

    <!-- self-referencing manager_id on employees -->
    <path
      d={`M ${pos.employees.x + W} ${pos.employees.y + 8} C ${pos.employees.x + W + 46} ${pos.employees.y - 20}, ${pos.employees.x + W + 46} ${pos.employees.y + H + 14}, ${pos.employees.x + W} ${pos.employees.y + H - 8}`}
      fill="none"
      stroke="var(--warn)"
      stroke-width="1.4"
      marker-end="url(#arrow)"
    >
      <title>employees.manager_id → employees.employee_id (self join / org hierarchy)</title>
    </path>
    <text x={pos.employees.x + W + 50} y={pos.employees.y + H / 2 + 4} font-size="10" fill="var(--warn)">manager_id</text>

    {#each Object.entries(pos) as [name, p]}
      <g
        class="table-box"
        class:selected={selected === name}
        onclick={() => onselect?.(name)}
        onkeydown={(e) => e.key === 'Enter' && onselect?.(name)}
        role="button"
        tabindex="0"
        aria-label={`Open table ${name}`}
      >
        <rect x={p.x} y={p.y} width={W} height={H} rx="9" />
        <text x={p.x + W / 2} y={p.y + H / 2 + 4} text-anchor="middle" font-size="12.5" font-weight="600">{name}</text>
      </g>
    {/each}
  </svg>
  <div class="caption muted">Arrows point child → parent (foreign key → primary key). Click a table to inspect it. The orange loop is the employees self-reference that powers the org hierarchy.</div>
</div>

<style>
  .wrap {
    padding: 0.8rem;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .table-box {
    cursor: pointer;
  }
  .table-box rect {
    fill: var(--panel-2);
    stroke: var(--border);
    stroke-width: 1.2;
    transition: stroke 120ms ease;
  }
  .table-box:hover rect {
    stroke: var(--accent);
  }
  .table-box.selected rect {
    fill: var(--accent-soft);
    stroke: var(--accent);
    stroke-width: 2;
  }
  .table-box text {
    fill: var(--text);
    font-family: var(--mono);
    pointer-events: none;
  }
  .caption {
    font-size: 0.78rem;
    margin-top: 0.4rem;
  }
</style>
