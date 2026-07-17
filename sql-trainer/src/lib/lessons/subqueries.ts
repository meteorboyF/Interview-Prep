import type { LessonCategory } from './types';

export const subqueries: LessonCategory = {
  id: 'subqueries',
  title: 'Subqueries',
  lessons: [
    {
      id: 'scalar-correlated',
      title: 'Scalar & correlated subqueries',
      summary: 'Queries inside queries: comparing each employee against company-wide and per-department averages.',
      sections: [
        {
          heading: 'Scalar subquery — above the company average',
          body: 'A scalar subquery returns one value and can sit anywhere a value can. It runs once.',
          example: {
            sql: 'SELECT first_name, last_name, salary,\n       (SELECT ROUND(AVG(salary), 2) FROM employees) AS company_avg\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC\nLIMIT 15;',
            dialect: 'standard'
          }
        },
        {
          heading: 'Correlated subquery — above the department average',
          body: 'A correlated subquery references the outer row (`e.department_id`), so it conceptually re-runs per row. The dataset was validated to return 199 active employees for this query.',
          example: {
            sql: "SELECT e.first_name, e.last_name, e.department_id, e.salary\nFROM employees e\nWHERE e.employment_status = 'Active'\n  AND e.salary > (SELECT AVG(e2.salary)\n                  FROM employees e2\n                  WHERE e2.department_id = e.department_id)\nORDER BY e.department_id, e.salary DESC\nLIMIT 20;",
            dialect: 'standard',
            note: 'Run `SELECT COUNT(*)` around it to confirm: 199 of the active employees out-earn their department average.'
          }
        },
        {
          heading: 'Departments with above-average headcount',
          body: 'A derived table (subquery in FROM) computes headcounts; the HAVING compares each against the average of those counts.',
          example: {
            sql: 'SELECT d.department_name, COUNT(*) AS headcount\nFROM employees e\nJOIN departments d ON d.department_id = e.department_id\nGROUP BY d.department_id, d.department_name\nHAVING COUNT(*) > (\n  SELECT AVG(cnt) FROM (\n    SELECT COUNT(*) AS cnt FROM employees\n    WHERE department_id IS NOT NULL\n    GROUP BY department_id\n  )\n)\nORDER BY headcount DESC;',
            mysqlSql: 'SELECT d.department_name, COUNT(*) AS headcount\nFROM employees e\nJOIN departments d ON d.department_id = e.department_id\nGROUP BY d.department_id, d.department_name\nHAVING COUNT(*) > (\n  SELECT AVG(cnt) FROM (\n    SELECT COUNT(*) AS cnt FROM employees\n    WHERE department_id IS NOT NULL\n    GROUP BY department_id\n  ) AS dept_counts    -- MySQL requires an alias on every derived table\n)\nORDER BY headcount DESC;',
            dialect: 'standard',
            note: 'Subtle dialect difference: MySQL requires `AS alias` after a derived table; SQLite does not.'
          }
        }
      ]
    },
    {
      id: 'in-exists-derived',
      title: 'IN, EXISTS & derived tables',
      summary: 'Set membership and existence tests: project members, employees with no leave requests, and latest-review thresholds.',
      sections: [
        {
          heading: 'IN — employees on a specific project',
          example: {
            sql: "SELECT first_name, last_name\nFROM employees\nWHERE employee_id IN (\n  SELECT employee_id FROM employee_projects\n  WHERE project_id = (SELECT MIN(project_id) FROM projects)\n)\nORDER BY last_name\nLIMIT 15;",
            dialect: 'standard'
          }
        },
        {
          heading: 'NOT EXISTS — employees with no leave requests',
          body: '`NOT EXISTS` is the reliable anti-join (it has no NULL trap, unlike `NOT IN` — see the NULL lesson).',
          example: {
            sql: 'SELECT COUNT(*) AS employees_with_zero_leave_requests\nFROM employees e\nWHERE NOT EXISTS (\n  SELECT 1 FROM leave_requests l WHERE l.employee_id = e.employee_id\n);',
            dialect: 'standard'
          }
        },
        {
          heading: 'Latest review above a threshold',
          body: 'The subquery pins each employee\'s **most recent** review date; the outer query keeps only ratings ≥ 4 on that latest review.',
          example: {
            sql: 'SELECT e.first_name, e.last_name, r.review_date, r.rating\nFROM performance_reviews r\nJOIN employees e ON e.employee_id = r.employee_id\nWHERE r.review_date = (\n    SELECT MAX(r2.review_date)\n    FROM performance_reviews r2\n    WHERE r2.employee_id = r.employee_id\n)\nAND r.rating >= 4\nORDER BY r.review_date DESC\nLIMIT 15;',
            dialect: 'standard',
            note: 'The Window Functions lessons show a second way to do "latest per group" with ROW_NUMBER().'
          }
        },
        {
          heading: 'Derived table — average of per-employee attendance rates',
          example: {
            sql: "SELECT ROUND(AVG(present_days), 1) AS avg_present_days,\n       ROUND(AVG(late_days), 1) AS avg_late_days\nFROM (\n  SELECT employee_id,\n         SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_days,\n         SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_days\n  FROM attendance\n  GROUP BY employee_id\n);",
            dialect: 'standard',
            note: 'Aggregate of an aggregate: the inner query summarizes 20k attendance rows per employee; the outer query averages those summaries.'
          }
        }
      ]
    }
  ]
};
