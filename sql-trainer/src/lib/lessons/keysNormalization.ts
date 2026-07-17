import type { LessonCategory } from './types';

export const keysNormalization: LessonCategory = {
  id: 'keys-normalization',
  title: 'Keys & Normalization',
  lessons: [
    {
      id: 'keys-relationships',
      title: 'Keys & relationships',
      summary: 'Primary, candidate, composite, foreign and self-referencing keys — all present in the real HR schema.',
      sections: [
        {
          heading: 'Primary keys & candidate keys',
          body: 'Every table has a surrogate primary key (`employee_id`, `department_id`, …). `employees.email` is UNIQUE — a **candidate key**: it could identify rows, but the integer surrogate was chosen instead. Both uniquely identify an employee.',
          example: {
            sql: '-- Two ways to find the same person: by PK, by candidate key\nSELECT employee_id, first_name, last_name, email FROM employees WHERE employee_id = 16;\nSELECT employee_id, first_name, last_name, email FROM employees WHERE email = \'craig.ramirez16@northstar-hr.example.com\';',
            dialect: 'standard'
          }
        },
        {
          heading: 'Composite primary key',
          body: '`employee_projects` has PRIMARY KEY (employee_id, project_id): one employee can join many projects and one project has many employees, but the same **pair** can exist only once — the definition of a many-to-many junction table.',
          example: {
            sql: 'SELECT employee_id, COUNT(*) AS projects\nFROM employee_projects\nGROUP BY employee_id\nHAVING COUNT(*) >= 3\nORDER BY projects DESC\nLIMIT 10;',
            dialect: 'standard',
            note: 'Many employees appear on multiple projects — impossible to model with a single-column key on either side.'
          }
        },
        {
          heading: 'One-to-many relationships',
          body: 'departments → employees is 1:N: the FK lives on the **many** side (`employees.department_id`). Same for locations → departments, employees → salary_history, and so on.',
          example: {
            sql: 'SELECT l.city, d.department_name, COUNT(e.employee_id) AS employees\nFROM locations l\nJOIN departments d ON d.location_id = l.location_id\nLEFT JOIN employees e ON e.department_id = d.department_id\nGROUP BY l.location_id, l.city, d.department_id, d.department_name\nORDER BY l.city, employees DESC;',
            dialect: 'standard'
          }
        },
        {
          heading: 'The self-referencing key',
          body: '`employees.manager_id` references `employees.employee_id` — a hierarchy inside one table. Level 1 (CEO) has NULL; everyone else points at a row in the same table.',
          example: {
            sql: 'SELECT COUNT(*) AS total,\n       SUM(CASE WHEN manager_id IS NULL THEN 1 ELSE 0 END) AS roots,\n       COUNT(DISTINCT manager_id) AS distinct_managers\nFROM employees;',
            dialect: 'standard',
            note: 'Exactly one root (the CEO). See the Recursive CTE lesson to walk the tree.'
          }
        },
        {
          heading: 'Referential integrity in action',
          body: 'Foreign keys are not documentation — the engine enforces them. Both of these fail in the sandbox:',
          example: {
            mode: 'sandbox',
            sql: "-- A department that doesn't exist:\nINSERT INTO employees (first_name, last_name, hire_date, department_id, salary)\nVALUES ('Ghost', 'Employee', '2026-07-01', 999, 50000);",
            dialect: 'standard',
            expectError: true,
            note: 'FOREIGN KEY constraint failed. Also try `DELETE FROM departments WHERE department_id = 1;` — rejected because employees still reference it.'
          }
        }
      ]
    },
    {
      id: 'normalization',
      title: 'Normalization',
      summary: 'From one wide spreadsheet to the actual HR schema: 1NF removes repeating groups, 2NF/3NF remove partial and transitive dependencies.',
      sections: [
        {
          body: 'Step through the visualizer: it starts with **real dataset rows** flattened into a denormalized shape (`project_1`, `project_2`, repeated department info…) and derives exactly the tables the supplied schema uses. The last step reassembles the wide row with joins against the live database.'
        },
        { normalization: true },
        {
          heading: 'Verify: each fact lives in exactly one place',
          body: 'Update one department row and every employee "sees" it — no repeated data to keep in sync. That is the payoff of 3NF.',
          example: {
            mode: 'sandbox',
            sql: "UPDATE departments SET department_name = 'Revenue' WHERE department_id = 3;\n\n-- every Sales employee reflects the rename instantly, because the name is stored once:\nSELECT e.first_name, e.last_name, d.department_name\nFROM employees e JOIN departments d ON d.department_id = e.department_id\nWHERE d.department_id = 3\nLIMIT 5;",
            dialect: 'standard',
            note: 'In the denormalized spreadsheet this would require updating hundreds of rows — and missing one creates an update anomaly.'
          }
        }
      ]
    }
  ]
};
