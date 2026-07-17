import type { LessonCategory } from './types';

export const joins: LessonCategory = {
  id: 'joins',
  title: 'Joins',
  lessons: [
    {
      id: 'inner-left-joins',
      title: 'INNER & LEFT joins',
      summary: 'Combining employees with departments, locations and jobs. The CEO row (NULL department) makes the INNER vs LEFT difference visible.',
      sections: [
        {
          heading: 'INNER JOIN',
          body: 'Keeps only rows with a match on both sides. The CEO has `department_id IS NULL`, so an inner join to departments **drops the CEO**: 499 rows, not 500.',
          example: {
            sql: 'SELECT COUNT(*) AS employees_with_department\nFROM employees e\nJOIN departments d ON e.department_id = d.department_id;',
            dialect: 'standard',
            note: '499 — one fewer than the 500 employees. The missing row is the CEO.'
          }
        },
        {
          heading: 'The classic three-table join',
          body: 'employees → departments → locations, plus jobs. Each `ON` clause links one foreign key to one primary key.',
          example: {
            sql: 'SELECT e.first_name, e.last_name, j.job_title, d.department_name, l.city, l.country\nFROM employees e\nJOIN departments d ON e.department_id = d.department_id\nJOIN locations l   ON d.location_id  = l.location_id\nJOIN jobs j        ON e.job_id       = j.job_id\nLIMIT 15;',
            dialect: 'standard'
          }
        },
        {
          heading: 'LEFT JOIN',
          body: 'Keeps every row from the left table; unmatched right-side columns become NULL. Now the CEO stays, with NULL department columns.',
          example: {
            sql: "SELECT e.first_name, e.last_name,\n       COALESCE(d.department_name, '— no department —') AS department\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.department_id\nWHERE d.department_id IS NULL;",
            dialect: 'standard',
            note: 'Filtering on `d.department_id IS NULL` after a LEFT JOIN finds left rows without a match — the anti-join pattern.'
          }
        }
      ]
    },
    {
      id: 'right-full-cross',
      title: 'RIGHT, FULL OUTER & CROSS joins',
      summary: 'What each engine supports, and the portable workarounds every interviewer expects you to know.',
      sections: [
        {
          heading: 'RIGHT JOIN',
          body: 'A `RIGHT JOIN` keeps every row of the **right** table. Modern SQLite (3.39+, which this browser engine uses) and MySQL both support it — but most style guides suggest rewriting as a LEFT JOIN with the tables swapped, which reads more naturally.',
          example: {
            sql: 'SELECT d.department_name, COUNT(e.employee_id) AS employees\nFROM employees e\nRIGHT JOIN departments d ON e.department_id = d.department_id\nGROUP BY d.department_id, d.department_name\nORDER BY employees DESC;',
            dialect: 'standard',
            note: 'Identical result as `FROM departments d LEFT JOIN employees e …` — the recommended form.'
          }
        },
        {
          heading: 'FULL OUTER JOIN',
          body: '**MySQL/MariaDB has no `FULL OUTER JOIN` at all** — the workaround is LEFT JOIN ∪ the anti-join of the RIGHT side. The browser SQLite engine does support `FULL OUTER JOIN` natively (3.39+). Learn both.',
          example: {
            sql: "SELECT e.last_name, d.department_name\nFROM employees e\nFULL OUTER JOIN departments d ON e.department_id = d.department_id\nWHERE e.employee_id IS NULL OR e.department_id IS NULL\nORDER BY d.department_name;",
            dialect: 'sqlite',
            note: 'Rows unmatched on either side: the CEO (no department). Every department has employees, so no department-only rows appear.'
          }
        },
        {
          heading: 'The portable FULL OUTER workaround (works in MySQL)',
          example: {
            sql: "SELECT e.last_name, d.department_name\nFROM departments d\nLEFT JOIN employees e ON d.department_id = e.department_id\nWHERE e.employee_id IS NULL\n\nUNION\n\nSELECT e.last_name, d.department_name\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.department_id\nWHERE d.department_id IS NULL;",
            dialect: 'workaround',
            note: 'This variant returns only the unmatched rows from each side (drop the WHERE clauses to emulate the full join). Tested against this dataset: it returns exactly the CEO row.'
          }
        },
        {
          heading: 'CROSS JOIN',
          body: 'Every row paired with every row — no `ON` clause. Useful deliberately (calendars, grids), catastrophic accidentally. 5 locations × 10 departments = 50 rows.',
          example: {
            sql: 'SELECT l.city, d.department_name\nFROM locations l\nCROSS JOIN departments d\nORDER BY l.city, d.department_name\nLIMIT 20;',
            dialect: 'standard',
            note: 'Never CROSS JOIN attendance (20k rows) against employees (500) — that would be 10 million rows. The result limiter would protect the UI, but the query would still burn time.'
          }
        }
      ]
    },
    {
      id: 'self-multi-joins',
      title: 'Self joins & multi-table joins',
      summary: 'The employees table references itself through manager_id — the basis for org-chart queries and a favorite interview topic.',
      sections: [
        {
          heading: 'Each employee with their manager',
          body: 'A self join treats one physical table as two logical tables via aliases: `e` (employee) and `m` (manager). `LEFT JOIN` keeps the CEO, whose `manager_id` is NULL.',
          example: {
            sql: "SELECT e.first_name || ' ' || e.last_name AS employee,\n       COALESCE(m.first_name || ' ' || m.last_name, '— nobody (CEO) —') AS reports_to\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.employee_id\nLIMIT 15;",
            dialect: 'standard'
          }
        },
        {
          heading: 'Managers ranked by team size',
          example: {
            sql: "SELECT m.first_name || ' ' || m.last_name AS manager,\n       j.job_title,\n       COUNT(e.employee_id) AS direct_reports\nFROM employees e\nJOIN employees m ON e.manager_id = m.employee_id\nJOIN jobs j ON j.job_id = m.job_id\nGROUP BY m.employee_id, manager, j.job_title\nORDER BY direct_reports DESC\nLIMIT 10;",
            dialect: 'standard'
          }
        },
        {
          heading: 'Employees earning more than their manager',
          body: 'The classic interview question — a self join with an inequality condition.',
          example: {
            sql: "SELECT e.first_name || ' ' || e.last_name AS employee, e.salary,\n       m.first_name || ' ' || m.last_name AS manager, m.salary AS manager_salary\nFROM employees e\nJOIN employees m ON e.manager_id = m.employee_id\nWHERE e.salary > m.salary\nORDER BY e.salary - m.salary DESC;",
            dialect: 'standard'
          }
        },
        {
          heading: 'Six tables at once: full staffing picture',
          body: 'employees ↔ employee_projects ↔ projects is the many-to-many chain; departments, locations and jobs complete the picture.',
          example: {
            sql: "SELECT e.last_name, j.job_title, d.department_name, l.city,\n       p.project_name, ep.role, ep.hours_allocated\nFROM employee_projects ep\nJOIN employees e   ON e.employee_id = ep.employee_id\nJOIN projects p    ON p.project_id = ep.project_id\nJOIN departments d ON d.department_id = e.department_id\nJOIN locations l   ON l.location_id = d.location_id\nJOIN jobs j        ON j.job_id = e.job_id\nORDER BY p.project_name, ep.hours_allocated DESC\nLIMIT 20;",
            dialect: 'standard'
          }
        }
      ]
    }
  ]
};
