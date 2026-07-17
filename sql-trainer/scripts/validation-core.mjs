// Shared dataset validation used by both build-db.mjs and validate-db.mjs.
// Runs against an open sql.js Database instance and returns { ok, report, failures }.

export const TABLES = [
  'locations',
  'departments',
  'jobs',
  'employees',
  'salary_history',
  'performance_reviews',
  'projects',
  'employee_projects',
  'leave_requests',
  'attendance'
];

export const EXPECTED_COLUMNS = {
  locations: ['location_id', 'city', 'state', 'country'],
  departments: ['department_id', 'department_name', 'location_id', 'budget'],
  jobs: ['job_id', 'job_title', 'job_grade', 'min_salary', 'max_salary'],
  employees: [
    'employee_id', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
    'gender', 'hire_date', 'job_id', 'department_id', 'manager_id', 'salary',
    'commission_pct', 'employment_status', 'termination_date'
  ],
  salary_history: ['salary_history_id', 'employee_id', 'old_salary', 'new_salary', 'change_date', 'change_reason'],
  performance_reviews: ['review_id', 'employee_id', 'reviewer_id', 'review_date', 'rating', 'comments'],
  projects: ['project_id', 'project_name', 'department_id', 'start_date', 'end_date', 'budget', 'status'],
  employee_projects: ['employee_id', 'project_id', 'role', 'hours_allocated'],
  leave_requests: ['leave_id', 'employee_id', 'leave_type', 'start_date', 'end_date', 'days_requested', 'status'],
  attendance: ['attendance_id', 'employee_id', 'work_date', 'check_in', 'check_out', 'status']
};

export const EXPECTED_PKS = {
  locations: ['location_id'],
  departments: ['department_id'],
  jobs: ['job_id'],
  employees: ['employee_id'],
  salary_history: ['salary_history_id'],
  performance_reviews: ['review_id'],
  projects: ['project_id'],
  employee_projects: ['employee_id', 'project_id'],
  leave_requests: ['leave_id'],
  attendance: ['attendance_id']
};

export const EXPECTED_INDEXES = [
  'idx_employees_department',
  'idx_employees_manager',
  'idx_attendance_employee_date',
  'idx_salary_history_employee',
  'idx_reviews_employee'
];

// Referential-integrity probes: each must return 0 orphan rows.
const FK_CHECKS = [
  ['employees.manager_id -> employees', `SELECT COUNT(*) FROM employees e WHERE e.manager_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM employees m WHERE m.employee_id = e.manager_id)`],
  ['employees.department_id -> departments', `SELECT COUNT(*) FROM employees e WHERE e.department_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM departments d WHERE d.department_id = e.department_id)`],
  ['employees.job_id -> jobs', `SELECT COUNT(*) FROM employees e WHERE e.job_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.job_id = e.job_id)`],
  ['departments.location_id -> locations', `SELECT COUNT(*) FROM departments d WHERE d.location_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM locations l WHERE l.location_id = d.location_id)`],
  ['salary_history.employee_id -> employees', `SELECT COUNT(*) FROM salary_history s WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id = s.employee_id)`],
  ['performance_reviews.employee_id -> employees', `SELECT COUNT(*) FROM performance_reviews r WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id = r.employee_id)`],
  ['performance_reviews.reviewer_id -> employees', `SELECT COUNT(*) FROM performance_reviews r WHERE r.reviewer_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id = r.reviewer_id)`],
  ['projects.department_id -> departments', `SELECT COUNT(*) FROM projects p WHERE p.department_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM departments d WHERE d.department_id = p.department_id)`],
  ['employee_projects.employee_id -> employees', `SELECT COUNT(*) FROM employee_projects ep WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id = ep.employee_id)`],
  ['employee_projects.project_id -> projects', `SELECT COUNT(*) FROM employee_projects ep WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.project_id = ep.project_id)`],
  ['leave_requests.employee_id -> employees', `SELECT COUNT(*) FROM leave_requests l WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id = l.employee_id)`],
  ['attendance.employee_id -> employees', `SELECT COUNT(*) FROM attendance a WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_id = a.employee_id)`]
];

// Date columns that must be parseable ISO dates (DATE('x') returns NULL when invalid).
const DATE_CHECKS = [
  ['employees.hire_date', `SELECT COUNT(*) FROM employees WHERE DATE(hire_date) IS NULL`],
  ['employees.date_of_birth', `SELECT COUNT(*) FROM employees WHERE date_of_birth IS NOT NULL AND DATE(date_of_birth) IS NULL`],
  ['employees.termination_date', `SELECT COUNT(*) FROM employees WHERE termination_date IS NOT NULL AND DATE(termination_date) IS NULL`],
  ['salary_history.change_date', `SELECT COUNT(*) FROM salary_history WHERE DATE(change_date) IS NULL`],
  ['performance_reviews.review_date', `SELECT COUNT(*) FROM performance_reviews WHERE DATE(review_date) IS NULL`],
  ['projects.start_date', `SELECT COUNT(*) FROM projects WHERE start_date IS NOT NULL AND DATE(start_date) IS NULL`],
  ['leave_requests.start_date', `SELECT COUNT(*) FROM leave_requests WHERE DATE(start_date) IS NULL`],
  ['attendance.work_date', `SELECT COUNT(*) FROM attendance WHERE DATE(work_date) IS NULL`]
];

// One canonical sample query per lesson family — all must execute and return rows.
const SAMPLE_QUERIES = [
  ['foundations: top salaries', `SELECT first_name, last_name, salary FROM employees ORDER BY salary DESC LIMIT 10`],
  ['filtering: NULL logic (CEO row)', `SELECT employee_id FROM employees WHERE department_id IS NULL`],
  ['aggregates: headcount by department', `SELECT d.department_name, COUNT(e.employee_id) AS headcount FROM departments d LEFT JOIN employees e ON e.department_id = d.department_id GROUP BY d.department_id, d.department_name`],
  ['joins: employees -> departments -> locations', `SELECT e.last_name, d.department_name, l.city FROM employees e JOIN departments d ON e.department_id = d.department_id JOIN locations l ON d.location_id = l.location_id LIMIT 5`],
  ['self join: employee with manager', `SELECT e.last_name AS employee, m.last_name AS manager FROM employees e JOIN employees m ON e.manager_id = m.employee_id LIMIT 5`],
  ['subquery: above-average earners', `SELECT COUNT(*) AS n FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)`],
  ['recursive CTE: org chart depth', `WITH RECURSIVE org AS (SELECT employee_id, 1 AS level FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.employee_id, o.level + 1 FROM employees e JOIN org o ON e.manager_id = o.employee_id) SELECT MAX(level) AS depth, COUNT(*) AS reachable FROM org`],
  ['window: salary rank by department', `SELECT employee_id, department_id, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk FROM employees LIMIT 5`],
  ['set ops: INTERSECT', `SELECT employee_id FROM employee_projects INTERSECT SELECT employee_id FROM leave_requests LIMIT 5`],
  ['indexes: composite index probe', `SELECT COUNT(*) AS n FROM attendance WHERE employee_id = 125 AND work_date BETWEEN '2026-05-01' AND '2026-05-31'`],
  ['explain: uses composite index', `EXPLAIN QUERY PLAN SELECT * FROM attendance WHERE employee_id = 125 AND work_date BETWEEN '2026-05-01' AND '2026-05-31'`]
];

function scalar(db, sql) {
  const res = db.exec(sql);
  return res.length ? res[0].values[0][0] : null;
}

export function validateDatabase(db, csvRowCounts = null) {
  const failures = [];
  const lines = [];
  const check = (ok, label, detail = '') => {
    lines.push(`${ok ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
  };

  lines.push('== Tables & columns ==');
  const existing = db
    .exec(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`)
    .flatMap((r) => r.values.map((v) => v[0]));
  for (const t of TABLES) {
    const exists = existing.includes(t);
    check(exists, `table ${t} exists`);
    if (!exists) continue;
    const info = db.exec(`PRAGMA table_info(${t})`)[0];
    const cols = info.values.map((v) => v[1]);
    const missing = EXPECTED_COLUMNS[t].filter((c) => !cols.includes(c));
    check(missing.length === 0, `table ${t} columns`, missing.length ? `missing: ${missing.join(', ')}` : `${cols.length} columns`);
    const pkCols = info.values.filter((v) => v[5] > 0).sort((a, b) => a[5] - b[5]).map((v) => v[1]);
    const expectedPk = EXPECTED_PKS[t];
    check(
      JSON.stringify(pkCols) === JSON.stringify(expectedPk),
      `table ${t} primary key`,
      `(${pkCols.join(', ') || 'none'})`
    );
  }

  lines.push('== Foreign key clauses ==');
  const fkTables = {
    departments: 1, employees: 3, salary_history: 1, performance_reviews: 2,
    projects: 1, employee_projects: 2, leave_requests: 1, attendance: 1
  };
  for (const [t, expected] of Object.entries(fkTables)) {
    const res = db.exec(`PRAGMA foreign_key_list(${t})`);
    const distinct = res.length ? new Set(res[0].values.map((v) => v[0])).size : 0;
    check(distinct === expected, `table ${t} declares ${expected} foreign key(s)`, `found ${distinct}`);
  }

  lines.push('== Indexes ==');
  const idxRows = db.exec(`SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%'`);
  const idxNames = idxRows.length ? idxRows[0].values.map((v) => v[0]) : [];
  for (const idx of EXPECTED_INDEXES) {
    check(idxNames.includes(idx), `index ${idx} exists`);
  }

  lines.push('== Row counts ==');
  const finalCounts = {};
  for (const t of TABLES) {
    const n = Number(scalar(db, `SELECT COUNT(*) FROM ${t}`));
    finalCounts[t] = n;
    if (csvRowCounts) {
      check(n === csvRowCounts[t], `rows in ${t}`, `imported ${n}, CSV has ${csvRowCounts[t]}`);
    } else {
      check(n > 0, `rows in ${t}`, `${n} rows`);
    }
  }
  check(finalCounts.attendance > 20000, 'attendance is a large table (> 20,000 rows)', `${finalCounts.attendance} rows`);

  lines.push('== Referential integrity ==');
  for (const [label, sql] of FK_CHECKS) {
    const orphans = Number(scalar(db, sql));
    check(orphans === 0, `no orphans: ${label}`, orphans ? `${orphans} orphan rows` : '');
  }
  const fkc = db.exec('PRAGMA foreign_key_check');
  check(fkc.length === 0, 'PRAGMA foreign_key_check reports no violations');

  lines.push('== Date parseability ==');
  for (const [label, sql] of DATE_CHECKS) {
    const bad = Number(scalar(db, sql));
    check(bad === 0, `dates parseable: ${label}`, bad ? `${bad} unparseable values` : '');
  }

  lines.push('== Canonical sample queries ==');
  for (const [label, sql] of SAMPLE_QUERIES) {
    try {
      const res = db.exec(sql);
      const rows = res.length ? res[0].values.length : 0;
      check(rows > 0, `query runs: ${label}`, `${rows} row(s)`);
    } catch (e) {
      check(false, `query runs: ${label}`, e.message);
    }
  }

  lines.push('== Final row counts ==');
  for (const t of TABLES) {
    lines.push(`        ${t.padEnd(22)} ${String(finalCounts[t]).padStart(7)}`);
  }
  lines.push(
    `        ${'TOTAL'.padEnd(22)} ${String(Object.values(finalCounts).reduce((a, b) => a + b, 0)).padStart(7)}`
  );

  return { ok: failures.length === 0, report: lines.join('\n'), failures, finalCounts };
}
