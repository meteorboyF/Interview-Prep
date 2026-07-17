import type { LessonCategory } from './types';

export const ctes: LessonCategory = {
  id: 'ctes',
  title: 'CTEs & Recursion',
  lessons: [
    {
      id: 'basic-ctes',
      title: 'Common Table Expressions',
      summary: 'WITH clauses name intermediate result sets, turning nested subqueries into readable pipelines.',
      sections: [
        {
          heading: 'Department salary summary',
          body: 'A CTE (`WITH name AS (…)`) is a named, single-use view. Both MySQL 8+ and SQLite support them with identical syntax.',
          example: {
            sql: "WITH dept_salaries AS (\n  SELECT d.department_name,\n         COUNT(*) AS staff,\n         ROUND(AVG(e.salary), 2) AS avg_salary,\n         MAX(e.salary) AS top_salary\n  FROM employees e\n  JOIN departments d ON d.department_id = e.department_id\n  GROUP BY d.department_id, d.department_name\n)\nSELECT * FROM dept_salaries\nWHERE avg_salary > 80000\nORDER BY avg_salary DESC;",
            dialect: 'standard'
          }
        },
        {
          heading: 'Chained CTEs — attendance summary joined to reviews',
          body: 'Several CTEs can build on each other — a readable alternative to deeply nested derived tables.',
          example: {
            sql: "WITH att AS (\n  SELECT employee_id,\n         COUNT(*) AS days_tracked,\n         SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_days\n  FROM attendance\n  GROUP BY employee_id\n),\nrev AS (\n  SELECT employee_id, ROUND(AVG(rating), 2) AS avg_rating\n  FROM performance_reviews\n  GROUP BY employee_id\n)\nSELECT e.first_name, e.last_name, att.days_tracked, att.late_days, rev.avg_rating\nFROM att\nJOIN employees e ON e.employee_id = att.employee_id\nLEFT JOIN rev ON rev.employee_id = att.employee_id\nORDER BY att.late_days DESC\nLIMIT 10;",
            dialect: 'standard',
            note: 'Who is late most often, and how are they rated? Two independent summaries meet in one final SELECT.'
          }
        },
        {
          heading: 'Latest salary per employee',
          example: {
            sql: 'WITH latest AS (\n  SELECT employee_id, MAX(change_date) AS last_change\n  FROM salary_history\n  GROUP BY employee_id\n)\nSELECT e.first_name, e.last_name, s.new_salary, s.change_date, s.change_reason\nFROM latest\nJOIN salary_history s\n  ON s.employee_id = latest.employee_id AND s.change_date = latest.last_change\nJOIN employees e ON e.employee_id = latest.employee_id\nORDER BY s.change_date DESC\nLIMIT 15;',
            dialect: 'standard'
          }
        }
      ]
    },
    {
      id: 'recursive-cte',
      title: 'Recursive CTEs — walking the org chart',
      summary: 'The employees table is a real tree (CEO → VPs → Managers → ICs) through manager_id. Recursive CTEs traverse it.',
      sections: [
        {
          body: 'A recursive CTE has an **anchor** (the CEO: `manager_id IS NULL`) and a **recursive member** that joins back to the CTE itself, walking one level of the hierarchy per iteration until no new rows appear.'
        },
        {
          heading: 'The full org chart with levels',
          example: {
            sql: "WITH RECURSIVE org_chart AS (\n  -- anchor: the CEO\n  SELECT employee_id, first_name || ' ' || last_name AS name, manager_id, 1 AS level\n  FROM employees\n  WHERE manager_id IS NULL\n\n  UNION ALL\n\n  -- recursive member: everyone reporting to someone already in org_chart\n  SELECT e.employee_id, e.first_name || ' ' || e.last_name, e.manager_id, oc.level + 1\n  FROM employees e\n  JOIN org_chart oc ON e.manager_id = oc.employee_id\n)\nSELECT level, COUNT(*) AS people\nFROM org_chart\nGROUP BY level\nORDER BY level;",
            dialect: 'standard',
            note: 'Identical syntax in MySQL 8+ and SQLite. Level 1 = CEO, level 2 = VPs & senior managers, and so on.'
          }
        },
        {
          heading: 'Indented tree rendering',
          body: 'Indenting by level draws the tree in plain text. (The `PRINTF` padding trick is SQLite; MySQL would use `LPAD`/`REPEAT`.)',
          example: {
            sql: "WITH RECURSIVE org AS (\n  SELECT employee_id, first_name || ' ' || last_name AS name, 1 AS level,\n         PRINTF('%03d', employee_id) AS path\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, e.first_name || ' ' || e.last_name, o.level + 1,\n         o.path || '.' || PRINTF('%03d', e.employee_id)\n  FROM employees e JOIN org o ON e.manager_id = o.employee_id\n)\nSELECT SUBSTR('........................', 1, (level - 1) * 3) || name AS org_tree, level\nFROM org\nORDER BY path\nLIMIT 40;",
            mysqlSql: "WITH RECURSIVE org AS (\n  SELECT employee_id, CONCAT(first_name, ' ', last_name) AS name, 1 AS level,\n         LPAD(employee_id, 3, '0') AS path\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, CONCAT(e.first_name, ' ', e.last_name), o.level + 1,\n         CONCAT(o.path, '.', LPAD(e.employee_id, 3, '0'))\n  FROM employees e JOIN org o ON e.manager_id = o.employee_id\n)\nSELECT CONCAT(REPEAT('.', (level - 1) * 3), name) AS org_tree, level\nFROM org\nORDER BY path\nLIMIT 40;",
            dialect: 'workaround',
            note: 'The `path` column keeps children sorted under their parent — a standard tree-traversal trick.'
          }
        },
        {
          heading: 'Chain of command for one employee',
          body: 'Recursion also walks **upward**: from an employee to the CEO.',
          example: {
            sql: "WITH RECURSIVE chain AS (\n  SELECT employee_id, first_name || ' ' || last_name AS name, manager_id, 0 AS hops\n  FROM employees WHERE employee_id = 125\n  UNION ALL\n  SELECT m.employee_id, m.first_name || ' ' || m.last_name, m.manager_id, c.hops + 1\n  FROM employees m JOIN chain c ON m.employee_id = c.manager_id\n)\nSELECT hops, name FROM chain ORDER BY hops;",
            dialect: 'standard',
            note: 'hops 0 is employee 125; the last row is always the CEO.'
          }
        },
        {
          heading: 'Team size for every manager (subtree count)',
          example: {
            sql: "WITH RECURSIVE subtree AS (\n  SELECT employee_id AS root, employee_id FROM employees WHERE manager_id IS NULL OR manager_id = 1\n  UNION ALL\n  SELECT s.root, e.employee_id\n  FROM employees e JOIN subtree s ON e.manager_id = s.employee_id\n)\nSELECT e.first_name || ' ' || e.last_name AS leader,\n       COUNT(*) - 1 AS total_reports_in_subtree\nFROM subtree s\nJOIN employees e ON e.employee_id = s.root\nGROUP BY s.root, leader\nORDER BY total_reports_in_subtree DESC\nLIMIT 12;",
            dialect: 'standard',
            note: 'Counts every transitive report under the CEO and each executive — not just direct reports.'
          }
        }
      ]
    }
  ]
};
