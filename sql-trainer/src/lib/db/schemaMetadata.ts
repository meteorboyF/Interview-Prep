// Teaching metadata for the ten canonical HR tables. The conceptual types are
// the original MySQL/MariaDB declarations; the engine types are what the
// browser SQLite database actually stores. Both are shown in the explorer.

export interface ColumnMeta {
  name: string;
  conceptualType: string; // original MySQL type
  engineType: string;     // SQLite storage type
  nullable: boolean;
  pk: boolean;
  fk?: { table: string; column: string };
  unique?: boolean;
  defaultValue?: string;
  indexes?: string[];
  note?: string;
}

export interface TableMeta {
  name: string;
  description: string;
  columns: ColumnMeta[];
  suggestedQueries: { label: string; sql: string }[];
}

export const SCHEMA: TableMeta[] = [
  {
    name: 'locations',
    description: 'Office cities where departments are based. Smallest table — top of the location → department → employee chain.',
    columns: [
      { name: 'location_id', conceptualType: 'INT AUTO_INCREMENT', engineType: 'INTEGER', nullable: false, pk: true },
      { name: 'city', conceptualType: 'VARCHAR(100)', engineType: 'TEXT', nullable: false, pk: false },
      { name: 'state', conceptualType: 'VARCHAR(100)', engineType: 'TEXT', nullable: true, pk: false, note: 'NULL for Singapore — handy for IS NULL demos' },
      { name: 'country', conceptualType: 'VARCHAR(100)', engineType: 'TEXT', nullable: false, pk: false }
    ],
    suggestedQueries: [
      { label: 'All offices', sql: 'SELECT * FROM locations;' },
      { label: 'Departments per location', sql: `SELECT l.city, COUNT(d.department_id) AS departments\nFROM locations l\nLEFT JOIN departments d ON d.location_id = l.location_id\nGROUP BY l.location_id, l.city;` }
    ]
  },
  {
    name: 'departments',
    description: 'Ten business departments, each linked to a location and holding a budget.',
    columns: [
      { name: 'department_id', conceptualType: 'INT AUTO_INCREMENT', engineType: 'INTEGER', nullable: false, pk: true },
      { name: 'department_name', conceptualType: 'VARCHAR(100)', engineType: 'TEXT', nullable: false, pk: false },
      { name: 'location_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: true, pk: false, fk: { table: 'locations', column: 'location_id' } },
      { name: 'budget', conceptualType: 'DECIMAL(14,2)', engineType: 'NUMERIC', nullable: true, pk: false }
    ],
    suggestedQueries: [
      { label: 'Departments with location', sql: `SELECT d.department_name, l.city, d.budget\nFROM departments d\nJOIN locations l ON d.location_id = l.location_id\nORDER BY d.budget DESC;` },
      { label: 'Headcount by department', sql: `SELECT d.department_name, COUNT(e.employee_id) AS headcount\nFROM departments d\nLEFT JOIN employees e ON e.department_id = d.department_id\nGROUP BY d.department_id, d.department_name\nORDER BY headcount DESC;` }
    ]
  },
  {
    name: 'jobs',
    description: 'Twenty job titles with grade and salary band (min/max). Referenced by employees.job_id.',
    columns: [
      { name: 'job_id', conceptualType: 'INT AUTO_INCREMENT', engineType: 'INTEGER', nullable: false, pk: true },
      { name: 'job_title', conceptualType: 'VARCHAR(100)', engineType: 'TEXT', nullable: false, pk: false },
      { name: 'job_grade', conceptualType: 'VARCHAR(10)', engineType: 'TEXT', nullable: true, pk: false },
      { name: 'min_salary', conceptualType: 'DECIMAL(10,2)', engineType: 'NUMERIC', nullable: true, pk: false },
      { name: 'max_salary', conceptualType: 'DECIMAL(10,2)', engineType: 'NUMERIC', nullable: true, pk: false }
    ],
    suggestedQueries: [
      { label: 'Salary bands', sql: 'SELECT job_title, job_grade, min_salary, max_salary FROM jobs ORDER BY max_salary DESC;' },
      { label: 'Average salary vs band', sql: `SELECT j.job_title, ROUND(AVG(e.salary), 2) AS avg_actual, j.min_salary, j.max_salary\nFROM jobs j\nJOIN employees e ON e.job_id = j.job_id\nGROUP BY j.job_id, j.job_title, j.min_salary, j.max_salary;` }
    ]
  },
  {
    name: 'employees',
    description: '500 employees. The heart of the dataset: self-referencing manager_id builds the full org hierarchy (CEO → VPs → Managers → ICs). The CEO row has NULL department_id and NULL manager_id.',
    columns: [
      { name: 'employee_id', conceptualType: 'INT AUTO_INCREMENT', engineType: 'INTEGER', nullable: false, pk: true },
      { name: 'first_name', conceptualType: 'VARCHAR(50)', engineType: 'TEXT', nullable: false, pk: false },
      { name: 'last_name', conceptualType: 'VARCHAR(50)', engineType: 'TEXT', nullable: false, pk: false },
      { name: 'email', conceptualType: 'VARCHAR(150)', engineType: 'TEXT', nullable: true, pk: false, unique: true, note: 'UNIQUE — a candidate key' },
      { name: 'phone', conceptualType: 'VARCHAR(30)', engineType: 'TEXT', nullable: true, pk: false },
      { name: 'date_of_birth', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: true, pk: false },
      { name: 'gender', conceptualType: 'VARCHAR(10)', engineType: 'TEXT', nullable: true, pk: false },
      { name: 'hire_date', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: false, pk: false },
      { name: 'job_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: true, pk: false, fk: { table: 'jobs', column: 'job_id' } },
      { name: 'department_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: true, pk: false, fk: { table: 'departments', column: 'department_id' }, indexes: ['idx_employees_department'], note: 'NULL for the CEO' },
      { name: 'manager_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: true, pk: false, fk: { table: 'employees', column: 'employee_id' }, indexes: ['idx_employees_manager'], note: 'Self-reference — powers the org chart' },
      { name: 'salary', conceptualType: 'DECIMAL(10,2)', engineType: 'NUMERIC', nullable: false, pk: false },
      { name: 'commission_pct', conceptualType: 'DECIMAL(5,2) DEFAULT 0', engineType: 'NUMERIC', nullable: true, pk: false, defaultValue: '0' },
      { name: 'employment_status', conceptualType: "VARCHAR(20) DEFAULT 'Active'", engineType: 'TEXT', nullable: true, pk: false, defaultValue: "'Active'" },
      { name: 'termination_date', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: true, pk: false, note: 'NULL unless Terminated' }
    ],
    suggestedQueries: [
      { label: 'Top 10 salaries', sql: 'SELECT first_name, last_name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 10;' },
      { label: 'Employees with manager (self join)', sql: `SELECT e.first_name || ' ' || e.last_name AS employee,\n       m.first_name || ' ' || m.last_name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.employee_id\nLIMIT 20;` },
      { label: 'Org chart (recursive CTE)', sql: `WITH RECURSIVE org AS (\n  SELECT employee_id, first_name || ' ' || last_name AS name, manager_id, 1 AS level\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, e.first_name || ' ' || e.last_name, e.manager_id, o.level + 1\n  FROM employees e JOIN org o ON e.manager_id = o.employee_id\n)\nSELECT PRINTF('%.*c', (level - 1) * 4, ' ') || name AS org_chart, level\nFROM org ORDER BY level, employee_id LIMIT 40;` }
    ]
  },
  {
    name: 'salary_history',
    description: '~1,030 salary changes (1–3 per employee) with old/new salary, date and reason. Built for trend and window-function lessons.',
    columns: [
      { name: 'salary_history_id', conceptualType: 'INT AUTO_INCREMENT', engineType: 'INTEGER', nullable: false, pk: true },
      { name: 'employee_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: false, pk: false, fk: { table: 'employees', column: 'employee_id' }, indexes: ['idx_salary_history_employee'] },
      { name: 'old_salary', conceptualType: 'DECIMAL(10,2)', engineType: 'NUMERIC', nullable: true, pk: false },
      { name: 'new_salary', conceptualType: 'DECIMAL(10,2)', engineType: 'NUMERIC', nullable: true, pk: false },
      { name: 'change_date', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: false, pk: false },
      { name: 'change_reason', conceptualType: 'VARCHAR(100)', engineType: 'TEXT', nullable: true, pk: false }
    ],
    suggestedQueries: [
      { label: 'Latest change per employee', sql: `SELECT employee_id, new_salary, change_date\nFROM (\n  SELECT s.*, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY change_date DESC) AS rn\n  FROM salary_history s\n)\nWHERE rn = 1 LIMIT 20;` },
      { label: 'Raises vs previous (LAG)', sql: `SELECT employee_id, change_date, new_salary,\n       LAG(new_salary) OVER (PARTITION BY employee_id ORDER BY change_date) AS previous\nFROM salary_history LIMIT 20;` }
    ]
  },
  {
    name: 'performance_reviews',
    description: '~990 reviews (1–3 per employee), rating 1–5. reviewer_id is a second FK into employees.',
    columns: [
      { name: 'review_id', conceptualType: 'INT AUTO_INCREMENT', engineType: 'INTEGER', nullable: false, pk: true },
      { name: 'employee_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: false, pk: false, fk: { table: 'employees', column: 'employee_id' }, indexes: ['idx_reviews_employee'] },
      { name: 'reviewer_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: true, pk: false, fk: { table: 'employees', column: 'employee_id' } },
      { name: 'review_date', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: false, pk: false },
      { name: 'rating', conceptualType: 'INT', engineType: 'INTEGER', nullable: false, pk: false },
      { name: 'comments', conceptualType: 'VARCHAR(255)', engineType: 'TEXT', nullable: true, pk: false }
    ],
    suggestedQueries: [
      { label: 'Average rating by department', sql: `SELECT d.department_name, ROUND(AVG(r.rating), 2) AS avg_rating\nFROM performance_reviews r\nJOIN employees e ON e.employee_id = r.employee_id\nJOIN departments d ON d.department_id = e.department_id\nGROUP BY d.department_id, d.department_name\nORDER BY avg_rating DESC;` }
    ]
  },
  {
    name: 'projects',
    description: 'Twenty department-owned projects with budget, dates and status.',
    columns: [
      { name: 'project_id', conceptualType: 'INT AUTO_INCREMENT', engineType: 'INTEGER', nullable: false, pk: true },
      { name: 'project_name', conceptualType: 'VARCHAR(150)', engineType: 'TEXT', nullable: false, pk: false },
      { name: 'department_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: true, pk: false, fk: { table: 'departments', column: 'department_id' } },
      { name: 'start_date', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: true, pk: false },
      { name: 'end_date', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: true, pk: false },
      { name: 'budget', conceptualType: 'DECIMAL(14,2)', engineType: 'NUMERIC', nullable: true, pk: false },
      { name: 'status', conceptualType: 'VARCHAR(20)', engineType: 'TEXT', nullable: true, pk: false }
    ],
    suggestedQueries: [
      { label: 'Staffing per project', sql: `SELECT p.project_name, COUNT(ep.employee_id) AS staff, SUM(ep.hours_allocated) AS total_hours\nFROM projects p\nLEFT JOIN employee_projects ep ON ep.project_id = p.project_id\nGROUP BY p.project_id, p.project_name\nORDER BY staff DESC;` }
    ]
  },
  {
    name: 'employee_projects',
    description: 'Junction table for the many-to-many employees ↔ projects relationship. Composite primary key (employee_id, project_id).',
    columns: [
      { name: 'employee_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: false, pk: true, fk: { table: 'employees', column: 'employee_id' } },
      { name: 'project_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: false, pk: true, fk: { table: 'projects', column: 'project_id' } },
      { name: 'role', conceptualType: 'VARCHAR(100)', engineType: 'TEXT', nullable: true, pk: false },
      { name: 'hours_allocated', conceptualType: 'INT', engineType: 'INTEGER', nullable: true, pk: false }
    ],
    suggestedQueries: [
      { label: 'Assignments with names', sql: `SELECT e.last_name, p.project_name, ep.role, ep.hours_allocated\nFROM employee_projects ep\nJOIN employees e ON e.employee_id = ep.employee_id\nJOIN projects p ON p.project_id = ep.project_id\nLIMIT 25;` },
      { label: 'Employees on 3+ projects', sql: `SELECT e.first_name, e.last_name, COUNT(*) AS projects\nFROM employee_projects ep\nJOIN employees e ON e.employee_id = ep.employee_id\nGROUP BY ep.employee_id\nHAVING COUNT(*) >= 3;` }
    ]
  },
  {
    name: 'leave_requests',
    description: '~1,220 leave requests with type, date range, days and approval status.',
    columns: [
      { name: 'leave_id', conceptualType: 'INT AUTO_INCREMENT', engineType: 'INTEGER', nullable: false, pk: true },
      { name: 'employee_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: false, pk: false, fk: { table: 'employees', column: 'employee_id' } },
      { name: 'leave_type', conceptualType: 'VARCHAR(30)', engineType: 'TEXT', nullable: true, pk: false },
      { name: 'start_date', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: false, pk: false },
      { name: 'end_date', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: false, pk: false },
      { name: 'days_requested', conceptualType: 'INT', engineType: 'INTEGER', nullable: true, pk: false },
      { name: 'status', conceptualType: 'VARCHAR(20)', engineType: 'TEXT', nullable: true, pk: false }
    ],
    suggestedQueries: [
      { label: 'Requests by status', sql: 'SELECT status, COUNT(*) AS requests FROM leave_requests GROUP BY status;' },
      { label: 'Employees with no leave requests', sql: `SELECT e.first_name, e.last_name\nFROM employees e\nWHERE NOT EXISTS (SELECT 1 FROM leave_requests l WHERE l.employee_id = e.employee_id)\nLIMIT 20;` }
    ]
  },
  {
    name: 'attendance',
    description: '20,000+ daily check-in/out rows (~65 workdays, active employees). The big table — used for index, EXPLAIN and pagination lessons. Previewed with LIMIT for a reason!',
    columns: [
      { name: 'attendance_id', conceptualType: 'BIGINT AUTO_INCREMENT', engineType: 'INTEGER', nullable: false, pk: true },
      { name: 'employee_id', conceptualType: 'INT', engineType: 'INTEGER', nullable: false, pk: false, fk: { table: 'employees', column: 'employee_id' }, indexes: ['idx_attendance_employee_date'] },
      { name: 'work_date', conceptualType: 'DATE', engineType: 'TEXT (YYYY-MM-DD)', nullable: false, pk: false, indexes: ['idx_attendance_employee_date'] },
      { name: 'check_in', conceptualType: 'TIME', engineType: 'TEXT (HH:MM:SS)', nullable: true, pk: false, note: 'NULL when Absent' },
      { name: 'check_out', conceptualType: 'TIME', engineType: 'TEXT (HH:MM:SS)', nullable: true, pk: false },
      { name: 'status', conceptualType: 'VARCHAR(20)', engineType: 'TEXT', nullable: true, pk: false, note: 'Present / Late / Half Day / Absent — NOT indexed (on purpose)' }
    ],
    suggestedQueries: [
      { label: 'One employee, one month (uses index)', sql: `SELECT *\nFROM attendance\nWHERE employee_id = 125\n  AND work_date BETWEEN '2026-05-01' AND '2026-05-31';` },
      { label: 'Status totals', sql: 'SELECT status, COUNT(*) AS days FROM attendance GROUP BY status ORDER BY days DESC;' },
      { label: 'EXPLAIN: index vs scan', sql: `EXPLAIN QUERY PLAN\nSELECT * FROM attendance WHERE employee_id = 125;` }
    ]
  }
];

export const TABLE_NAMES = SCHEMA.map((t) => t.name);

/** Directed FK edges (child → parent) for the relationship diagram. */
export const RELATIONSHIPS = SCHEMA.flatMap((t) =>
  t.columns
    .filter((c) => c.fk)
    .map((c) => ({
      from: t.name,
      fromColumn: c.name,
      to: c.fk!.table,
      toColumn: c.fk!.column,
      self: c.fk!.table === t.name
    }))
);

export function tableMeta(name: string): TableMeta | undefined {
  return SCHEMA.find((t) => t.name === name);
}

/** Tables directly related to the given one (either direction). */
export function relatedTables(name: string): string[] {
  const set = new Set<string>();
  for (const r of RELATIONSHIPS) {
    if (r.from === name && !r.self) set.add(r.to);
    if (r.to === name && !r.self) set.add(r.from);
  }
  return [...set];
}
