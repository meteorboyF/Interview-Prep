import type { LessonCategory } from './types';

export const dml: LessonCategory = {
  id: 'dml',
  title: 'Data Modification',
  lessons: [
    {
      id: 'insert-update-delete',
      title: 'INSERT, UPDATE & DELETE',
      summary: 'Changing data — safely. These exercises run in the sandbox database with before-and-after checks built into each batch. Reset or undo any time.',
      sections: [
        {
          body: 'Every example below runs in **sandbox mode**: your own copy of the dataset. The batches sandwich each change between a BEFORE and an AFTER query so you see exactly what happened. Use **Undo last change** or **Reset sandbox** in the Playground to roll back.'
        },
        {
          heading: 'INSERT — hire a new employee',
          body: 'We omit `employee_id`; the primary key auto-assigns the next id (SQLite `INTEGER PRIMARY KEY` behaves like MySQL `AUTO_INCREMENT` here).',
          example: {
            mode: 'sandbox',
            sql: "-- BEFORE\nSELECT COUNT(*) AS employees_before FROM employees;\n\nINSERT INTO employees (first_name, last_name, email, hire_date, job_id, department_id, manager_id, salary)\nVALUES ('Nadia', 'Rahman', 'nadia.rahman@northstar-hr.example.com', '2026-07-01', 1, 1, 2, 72000);\n\n-- AFTER: the new row got the next employee_id automatically\nSELECT employee_id, first_name, last_name, salary, employment_status\nFROM employees ORDER BY employee_id DESC LIMIT 3;",
            dialect: 'standard',
            note: 'Run it twice and the UNIQUE constraint on email fires — a teaching moment, not a bug. Undo or reset, or change the email. Note employment_status defaulted to Active via the DEFAULT clause.'
          }
        },
        {
          heading: 'UPDATE — change a department budget',
          example: {
            mode: 'sandbox',
            sql: "-- BEFORE\nSELECT department_name, budget FROM departments WHERE department_id = 1;\n\nUPDATE departments\nSET budget = budget + 250000\nWHERE department_id = 1;\n\n-- AFTER\nSELECT department_name, budget FROM departments WHERE department_id = 1;",
            dialect: 'standard',
            note: 'Always write the WHERE clause first. `UPDATE departments SET budget = 0;` (no WHERE) would hit all 10 rows.'
          }
        },
        {
          heading: 'UPDATE — a 5% raise for Human Resources',
          example: {
            mode: 'sandbox',
            sql: "-- BEFORE\nSELECT ROUND(AVG(salary), 2) AS avg_before FROM employees WHERE department_id = 2;\n\nUPDATE employees\nSET salary = ROUND(salary * 1.05, 2)\nWHERE department_id = 2;\n\n-- AFTER\nSELECT ROUND(AVG(salary), 2) AS avg_after FROM employees WHERE department_id = 2;",
            dialect: 'standard',
            note: 'The rows-affected count tells you how many HR employees got the raise.'
          }
        },
        {
          heading: 'INSERT — file a leave request',
          example: {
            mode: 'sandbox',
            sql: "INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, status)\nVALUES (125, 'Annual', '2026-08-03', '2026-08-07', 5, 'Pending');\n\n-- AFTER: employee 125's requests\nSELECT * FROM leave_requests WHERE employee_id = 125 ORDER BY start_date DESC;",
            dialect: 'standard'
          }
        },
        {
          heading: 'DELETE — remove rejected leave requests',
          example: {
            mode: 'sandbox',
            sql: "-- BEFORE\nSELECT status, COUNT(*) AS requests FROM leave_requests GROUP BY status;\n\nDELETE FROM leave_requests WHERE status = 'Rejected';\n\n-- AFTER\nSELECT status, COUNT(*) AS requests FROM leave_requests GROUP BY status;",
            dialect: 'standard',
            note: 'DELETE removes rows, DROP removes the whole table, TRUNCATE (MySQL) empties a table fast — three very different statements. SQLite has no TRUNCATE; `DELETE FROM t;` without WHERE plays that role.'
          }
        },
        {
          heading: 'Referential integrity pushes back',
          body: 'Foreign keys are enforced (`PRAGMA foreign_keys = ON`). You cannot delete an employee who still has attendance, reviews, projects or salary history — try it:',
          example: {
            mode: 'sandbox',
            sql: 'DELETE FROM employees WHERE employee_id = 125;',
            dialect: 'standard',
            expectError: true,
            note: 'FOREIGN KEY constraint failed — by design. Child rows in attendance/salary_history/… still reference employee 125. Real HR systems soft-delete (set employment_status) for exactly this reason.'
          }
        }
      ]
    }
  ]
};
