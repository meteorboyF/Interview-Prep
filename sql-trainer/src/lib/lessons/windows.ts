import type { LessonCategory } from './types';

export const windows: LessonCategory = {
  id: 'windows',
  title: 'Window Functions',
  lessons: [
    {
      id: 'ranking',
      title: 'Ranking & row numbering',
      summary: 'RANK, DENSE_RANK and ROW_NUMBER over partitions — salary leaderboards per department and "latest row per employee".',
      sections: [
        {
          body: 'Window functions compute per-row values over a **window** of related rows without collapsing them like GROUP BY does. Syntax is identical in MySQL 8+ and SQLite 3.25+.'
        },
        {
          heading: 'Salary rank within each department',
          example: {
            sql: 'SELECT department_id, first_name, last_name, salary,\n       RANK()        OVER w AS rnk,\n       DENSE_RANK()  OVER w AS dense_rnk,\n       ROW_NUMBER()  OVER w AS row_num\nFROM employees\nWHERE department_id IS NOT NULL\nWINDOW w AS (PARTITION BY department_id ORDER BY salary DESC)\nORDER BY department_id, salary DESC\nLIMIT 20;',
            dialect: 'standard',
            note: 'RANK leaves gaps after ties, DENSE_RANK does not, ROW_NUMBER is always unique. The named WINDOW clause avoids repeating the definition.'
          }
        },
        {
          heading: 'Top 3 earners per department',
          body: 'Window functions cannot appear in WHERE (they are computed after it), so wrap the query and filter outside.',
          example: {
            sql: 'SELECT department_id, first_name, last_name, salary, rnk\nFROM (\n  SELECT e.*, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk\n  FROM employees e\n  WHERE department_id IS NOT NULL\n)\nWHERE rnk <= 3\nORDER BY department_id, rnk;',
            dialect: 'standard'
          }
        },
        {
          heading: 'Latest salary-history row per employee',
          body: 'The ROW_NUMBER pattern for "latest record per group" — often faster and clearer than a correlated MAX subquery.',
          example: {
            sql: 'SELECT employee_id, new_salary, change_date, change_reason\nFROM (\n  SELECT s.*, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY change_date DESC) AS rn\n  FROM salary_history s\n)\nWHERE rn = 1\nORDER BY change_date DESC\nLIMIT 15;',
            dialect: 'standard'
          }
        },
        {
          heading: 'Percentiles: NTILE and PERCENT_RANK',
          example: {
            sql: 'SELECT first_name, last_name, department_id, salary,\n       NTILE(4) OVER (PARTITION BY department_id ORDER BY salary) AS quartile,\n       ROUND(PERCENT_RANK() OVER (PARTITION BY department_id ORDER BY salary), 3) AS pct_rank\nFROM employees\nWHERE department_id = 1\nORDER BY salary DESC;',
            dialect: 'standard',
            note: 'Quartile 4 = top 25% of Engineering salaries. Both functions are supported by MySQL 8+ and this SQLite engine.'
          }
        }
      ]
    },
    {
      id: 'lag-lead-running',
      title: 'LAG, LEAD & running totals',
      summary: 'Looking backward and forward along ordered rows: salary changes over time, next review dates, cumulative payroll.',
      sections: [
        {
          heading: 'Previous salary with LAG',
          body: '`LAG(col)` reads the previous row in the window — perfect for change-over-time on salary_history.',
          example: {
            sql: "SELECT employee_id, change_date, new_salary,\n       LAG(new_salary) OVER (PARTITION BY employee_id ORDER BY change_date) AS previous_salary,\n       ROUND(new_salary - LAG(new_salary) OVER (PARTITION BY employee_id ORDER BY change_date), 2) AS raise\nFROM salary_history\nWHERE employee_id BETWEEN 16 AND 22\nORDER BY employee_id, change_date;",
            dialect: 'standard',
            note: 'The first change per employee has NULL previous_salary — LAG found no earlier row.'
          }
        },
        {
          heading: 'Next review with LEAD',
          example: {
            sql: 'SELECT employee_id, review_date, rating,\n       LEAD(review_date) OVER (PARTITION BY employee_id ORDER BY review_date) AS next_review,\n       LEAD(rating)      OVER (PARTITION BY employee_id ORDER BY review_date) AS next_rating\nFROM performance_reviews\nWHERE employee_id BETWEEN 16 AND 22\nORDER BY employee_id, review_date;',
            dialect: 'standard',
            note: 'Comparing rating to next_rating shows who improved between consecutive reviews.'
          }
        },
        {
          heading: 'Running total of payroll by hire date',
          body: 'A cumulative SUM ordered by hire_date shows payroll growth as the company hired.',
          example: {
            sql: 'SELECT hire_date, first_name, last_name, salary,\n       SUM(salary) OVER (ORDER BY hire_date, employee_id) AS cumulative_payroll\nFROM employees\nORDER BY hire_date, employee_id\nLIMIT 20;',
            dialect: 'standard',
            note: 'Default frame with ORDER BY is RANGE UNBOUNDED PRECEDING — a running total.'
          }
        },
        {
          heading: 'Department share of payroll',
          example: {
            sql: 'SELECT DISTINCT department_id,\n       SUM(salary) OVER (PARTITION BY department_id) AS dept_payroll,\n       SUM(salary) OVER () AS company_payroll,\n       ROUND(100.0 * SUM(salary) OVER (PARTITION BY department_id) / SUM(salary) OVER (), 1) AS pct\nFROM employees\nWHERE department_id IS NOT NULL\nORDER BY pct DESC;',
            dialect: 'standard',
            note: 'An empty OVER () makes the whole result set one window — total payroll on every row.'
          }
        }
      ]
    }
  ]
};
