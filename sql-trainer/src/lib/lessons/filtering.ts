import type { LessonCategory } from './types';

export const filtering: LessonCategory = {
  id: 'filtering',
  title: 'Filtering',
  lessons: [
    {
      id: 'where-logic',
      title: 'WHERE, comparison & logical operators',
      summary: 'Narrowing rows with comparisons, AND/OR/NOT, BETWEEN, IN and LIKE — using employment status, salary, dates and commission fields.',
      sections: [
        {
          heading: 'Comparison operators',
          body: '`=`, `<>` (or `!=`), `<`, `<=`, `>`, `>=`. Text comparisons are exact.',
          example: {
            sql: "SELECT first_name, last_name, salary\nFROM employees\nWHERE salary >= 150000\nORDER BY salary DESC;",
            dialect: 'standard'
          }
        },
        {
          heading: 'AND / OR / NOT',
          body: '`AND` binds tighter than `OR` — parenthesize when mixing. This finds active Engineering (1) or IT Infrastructure (8) staff earning six figures.',
          example: {
            sql: "SELECT first_name, last_name, department_id, salary\nFROM employees\nWHERE employment_status = 'Active'\n  AND (department_id = 1 OR department_id = 8)\n  AND salary > 100000\nORDER BY salary DESC;",
            dialect: 'standard'
          }
        },
        {
          heading: 'BETWEEN',
          body: '`BETWEEN a AND b` is inclusive on both ends. Works for numbers and (ISO) dates alike.',
          example: {
            sql: "SELECT first_name, last_name, hire_date\nFROM employees\nWHERE hire_date BETWEEN '2020-01-01' AND '2020-12-31'\nORDER BY hire_date;",
            dialect: 'standard',
            note: 'Because dates are stored as ISO YYYY-MM-DD text, string comparison and date comparison agree.'
          }
        },
        {
          heading: 'IN',
          body: 'Membership in a list — cleaner than chained ORs. `NOT IN` inverts it (but see the NULL lesson for a famous trap).',
          example: {
            sql: "SELECT first_name, last_name, gender, employment_status\nFROM employees\nWHERE employment_status IN ('Terminated', 'On Leave')\nLIMIT 15;",
            dialect: 'standard'
          }
        },
        {
          heading: 'LIKE',
          body: '`%` matches any run of characters, `_` exactly one. Find everyone whose last name starts with "Mc" or first name ends in "ia".',
          example: {
            sql: "SELECT first_name, last_name, email\nFROM employees\nWHERE last_name LIKE 'R%'\n  AND first_name LIKE '%a'\nORDER BY last_name;",
            dialect: 'standard',
            note: 'Note: in SQLite `LIKE` is case-insensitive for ASCII by default; MySQL depends on the column collation. Both engines match these semantics for this data.'
          }
        }
      ]
    },
    {
      id: 'null-logic',
      title: 'NULL & three-valued logic',
      summary: 'NULL is "unknown", not zero and not empty string. The dataset ships real NULLs: the CEO has no department, active employees have no termination_date, absent days have no check_in.',
      sections: [
        {
          body: 'SQL conditions evaluate to **TRUE**, **FALSE**, or **UNKNOWN**. Any comparison with `NULL` — even `NULL = NULL` — is UNKNOWN, and `WHERE` only keeps rows where the condition is TRUE. That is why `= NULL` never matches anything and you must write `IS NULL` / `IS NOT NULL`.'
        },
        {
          heading: 'The CEO row',
          body: 'The CEO belongs to no department (`department_id IS NULL`) and has no manager. This row is built into the dataset precisely for NULL lessons and outer-join demos.',
          example: {
            sql: 'SELECT employee_id, first_name, last_name, department_id, manager_id\nFROM employees\nWHERE department_id IS NULL;',
            dialect: 'standard'
          }
        },
        {
          heading: 'The = NULL trap',
          body: 'Same query with `= NULL` returns **zero rows** — the comparison is UNKNOWN for every row.',
          example: {
            sql: 'SELECT employee_id, first_name, last_name\nFROM employees\nWHERE department_id = NULL;',
            dialect: 'standard',
            note: 'Zero rows, no error. This is standard three-valued logic in every SQL database.'
          }
        },
        {
          heading: 'NULL in aggregates and expressions',
          body: 'Aggregates skip NULLs (`COUNT(termination_date)` counts only terminated employees), and any arithmetic with NULL yields NULL — use `COALESCE`/`IFNULL` to substitute.',
          example: {
            sql: "SELECT COUNT(*) AS all_employees,\n       COUNT(termination_date) AS with_termination_date,\n       COUNT(*) - COUNT(termination_date) AS null_termination_dates\nFROM employees;",
            dialect: 'standard'
          }
        },
        {
          heading: 'NULL check-ins in attendance',
          body: 'Absent days have NULL `check_in`/`check_out`. Counting them requires `IS NULL`, and `COALESCE` renders them readably.',
          example: {
            sql: "SELECT status,\n       COUNT(*) AS days,\n       COUNT(check_in) AS with_checkin,\n       COUNT(*) - COUNT(check_in) AS null_checkins\nFROM attendance\nGROUP BY status\nORDER BY days DESC;",
            dialect: 'standard',
            note: 'Only the Absent rows have NULL check-ins — the data is consistent.'
          }
        },
        {
          heading: 'The NOT IN + NULL trap',
          body: 'If a subquery returns any NULL, `NOT IN` returns UNKNOWN for every candidate row — result: empty. `NOT EXISTS` does not have this trap; see the Subqueries lessons.',
          example: {
            sql: "-- manager_id list includes NULL (the CEO row), so NOT IN matches nobody:\nSELECT COUNT(*) AS should_be_ICs_but_is_zero\nFROM employees\nWHERE employee_id NOT IN (SELECT manager_id FROM employees);",
            dialect: 'standard',
            note: 'Fix: `... NOT IN (SELECT manager_id FROM employees WHERE manager_id IS NOT NULL)` — or use NOT EXISTS.'
          }
        }
      ]
    }
  ]
};
