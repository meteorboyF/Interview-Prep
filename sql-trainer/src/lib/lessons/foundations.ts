import type { LessonCategory } from './types';

export const foundations: LessonCategory = {
  id: 'foundations',
  title: 'Foundations',
  lessons: [
    {
      id: 'select-basics',
      title: 'SELECT & column selection',
      summary: 'Reading rows from a table: every query in this course runs against the same HR dataset you can inspect in the Dataset Explorer.',
      sections: [
        {
          body: 'The `SELECT` statement reads rows from a table. `*` means "every column" — convenient while exploring, but in real code you should name the columns you need.',
          example: {
            sql: 'SELECT * FROM departments;',
            dialect: 'standard',
            note: 'All 10 departments. `*` returns every column: department_id, department_name, location_id, budget.'
          }
        },
        {
          heading: 'Selecting specific columns',
          body: 'Name columns in the order you want them back. The result is a new, temporary table shape — the underlying `employees` table is untouched.',
          example: {
            sql: 'SELECT first_name, last_name, salary\nFROM employees\nLIMIT 10;',
            dialect: 'standard',
            note: '`LIMIT 10` keeps the preview small — employees has 500 rows.'
          }
        },
        {
          heading: 'Expressions in the SELECT list',
          body: 'The SELECT list can compute values. Here we compute each sales employee\'s commission amount from `salary` and `commission_pct`.',
          example: {
            sql: "SELECT first_name, last_name, salary, commission_pct,\n       ROUND(salary * commission_pct, 2) AS commission_amount\nFROM employees\nWHERE commission_pct > 0\nLIMIT 10;",
            dialect: 'standard'
          }
        },
        {
          heading: 'Comments',
          body: 'Two comment styles work in both MySQL and SQLite: `-- line comment` and `/* block comment */`. MySQL additionally allows `# comment`, which SQLite does not.',
          example: {
            sql: "-- Who are the executives? (job_grade G9 and above)\nSELECT e.first_name, e.last_name, j.job_title, j.job_grade\nFROM employees e\nJOIN jobs j ON j.job_id = e.job_id   /* join explained in the Joins lessons */\nWHERE j.job_grade IN ('G9', 'G10');",
            dialect: 'standard'
          }
        }
      ]
    },
    {
      id: 'alias-distinct-order',
      title: 'Aliases, DISTINCT, ORDER BY & LIMIT',
      summary: 'Shaping and ordering results: renaming columns, removing duplicates, sorting, and taking the top N.',
      sections: [
        {
          heading: 'Column and table aliases',
          body: '`AS` renames a column in the output; table aliases (`employees e`) shorten references. The `||` operator concatenates strings in SQLite and standard SQL — MySQL uses `CONCAT()` instead (by default `||` is logical OR there).',
          example: {
            sql: "SELECT e.first_name || ' ' || e.last_name AS full_name,\n       e.salary AS annual_salary\nFROM employees e\nLIMIT 10;",
            mysqlSql: "SELECT CONCAT(e.first_name, ' ', e.last_name) AS full_name,\n       e.salary AS annual_salary\nFROM employees e\nLIMIT 10;",
            dialect: 'sqlite',
            note: 'MySQL: `CONCAT(a, b)` (or enable `PIPES_AS_CONCAT` mode). SQLite/standard: `a || b`.'
          }
        },
        {
          heading: 'DISTINCT',
          body: 'Removes duplicate rows from the result. Compare with `GROUP BY` in the Aggregates lessons — `DISTINCT` answers "which values exist", `GROUP BY` answers "how many of each".',
          example: {
            sql: 'SELECT DISTINCT employment_status FROM employees;',
            dialect: 'standard',
            note: 'Three statuses exist: Active, Terminated, On Leave.'
          }
        },
        {
          heading: 'ORDER BY',
          body: 'Sorts the result. `DESC` for descending, several sort keys allowed. Without `ORDER BY`, row order is **never guaranteed** — in any database.',
          example: {
            sql: 'SELECT first_name, last_name, hire_date\nFROM employees\nORDER BY hire_date ASC, last_name ASC\nLIMIT 10;',
            dialect: 'standard',
            note: 'The 10 longest-serving employees.'
          }
        },
        {
          heading: 'Top-N with LIMIT',
          body: 'The canonical "top 10 salaries" query. `LIMIT` (MySQL & SQLite) applies after sorting. Standard SQL also defines `FETCH FIRST 10 ROWS ONLY`; SQL Server uses `TOP`.',
          example: {
            sql: 'SELECT\n    first_name,\n    last_name,\n    salary\nFROM employees\nORDER BY salary DESC\nLIMIT 10;',
            dialect: 'standard',
            note: 'The CEO (Angel Hill, 320,000) tops the list, followed by the two VPs.'
          }
        }
      ]
    },
    {
      id: 'functions-dialects',
      title: 'Functions & SQL dialects',
      summary: 'The same question, three dialects: what is standard SQL, what is MySQL-specific, and what the browser SQLite engine actually runs.',
      sections: [
        {
          body: 'This course labels every example as **Standard SQL**, **MySQL/MariaDB syntax**, **SQLite syntax**, or a **browser-compatible workaround**. Date/time functions differ the most between engines:\n\n- `CURDATE()` → `DATE(\'now\')`\n- `DATEDIFF(end_d, start_d)` → `JULIANDAY(end_d) - JULIANDAY(start_d)`\n- `YEAR(d)` → `STRFTIME(\'%Y\', d)`\n- `DATE_FORMAT(d, fmt)` → `STRFTIME(fmt, d)`\n- `TIMESTAMPDIFF(YEAR, a, b)` → date arithmetic with `STRFTIME`/`JULIANDAY`\n- `CONCAT(a, b)` → `a || b`\n- `IFNULL(a, b)` / `COALESCE(...)` → identical in both engines'
        },
        {
          heading: 'Dates: tenure in years',
          body: 'MySQL would use `TIMESTAMPDIFF(YEAR, hire_date, CURDATE())`. SQLite stores our dates as ISO text and computes with `JULIANDAY`.',
          example: {
            sql: "SELECT first_name, last_name, hire_date,\n       CAST((JULIANDAY('now') - JULIANDAY(hire_date)) / 365.25 AS INTEGER) AS years_of_service\nFROM employees\nORDER BY hire_date\nLIMIT 10;",
            mysqlSql: 'SELECT first_name, last_name, hire_date,\n       TIMESTAMPDIFF(YEAR, hire_date, CURDATE()) AS years_of_service\nFROM employees\nORDER BY hire_date\nLIMIT 10;',
            dialect: 'workaround',
            note: 'Both compute tenure; the mechanics differ. Neither form is "wrong" — they are dialects.'
          }
        },
        {
          heading: 'Extracting date parts',
          body: 'Hiring by year, using `STRFTIME` — the SQLite equivalent of MySQL `YEAR()`.',
          example: {
            sql: "SELECT STRFTIME('%Y', hire_date) AS hire_year, COUNT(*) AS hires\nFROM employees\nGROUP BY hire_year\nORDER BY hire_year;",
            mysqlSql: 'SELECT YEAR(hire_date) AS hire_year, COUNT(*) AS hires\nFROM employees\nGROUP BY hire_year\nORDER BY hire_year;',
            dialect: 'workaround'
          }
        },
        {
          heading: 'Functions that are the same everywhere',
          body: '`UPPER`, `LOWER`, `LENGTH`, `ROUND`, `ABS`, `COALESCE`, `IFNULL` behave the same in MySQL and SQLite.',
          example: {
            sql: "SELECT UPPER(last_name) AS shouty,\n       LENGTH(email) AS email_length,\n       COALESCE(termination_date, 'still employed') AS left_on\nFROM employees\nLIMIT 8;",
            dialect: 'standard'
          }
        },
        {
          heading: 'What happens with MySQL-only functions here?',
          body: 'Try it — the error message will tell you the SQLite equivalent. The engine never silently pretends to support MySQL syntax.',
          example: {
            sql: 'SELECT CURDATE();',
            dialect: 'mysql',
            expectError: true,
            note: "This intentionally fails in the browser engine. Replace with SELECT DATE('now'); to see today's date."
          }
        }
      ]
    }
  ]
};
