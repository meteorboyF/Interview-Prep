import type { LessonCategory } from './types';

export const setops: LessonCategory = {
  id: 'setops',
  title: 'Set Operations',
  lessons: [
    {
      id: 'union-intersect-except',
      title: 'UNION, INTERSECT & EXCEPT',
      summary: 'Combining result sets vertically. Engine support differs: SQLite has all three; MySQL added INTERSECT/EXCEPT only in 8.0.31.',
      sections: [
        {
          heading: 'UNION vs UNION ALL',
          body: '`UNION` removes duplicates (with a sort/dedup cost); `UNION ALL` keeps everything and is faster. Column counts and types must line up.',
          example: {
            sql: "SELECT 'On Leave (status)' AS source, first_name || ' ' || last_name AS person\nFROM employees WHERE employment_status = 'On Leave'\nUNION ALL\nSELECT 'Approved leave request', e.first_name || ' ' || e.last_name\nFROM leave_requests l JOIN employees e ON e.employee_id = l.employee_id\nWHERE l.status = 'Approved' AND l.leave_type = 'Sick'\nLIMIT 20;",
            dialect: 'standard'
          }
        },
        {
          heading: 'INTERSECT — in both sets',
          body: 'Employees who are **both** assigned to a project **and** have made a leave request. Supported by SQLite (always) and MySQL only since 8.0.31 — older MySQL needs a JOIN/EXISTS rewrite.',
          example: {
            sql: 'SELECT employee_id FROM employee_projects\nINTERSECT\nSELECT employee_id FROM leave_requests\nORDER BY employee_id\nLIMIT 15;',
            dialect: 'standard',
            note: 'Pre-8.0.31 MySQL rewrite: SELECT DISTINCT ep.employee_id FROM employee_projects ep WHERE EXISTS (SELECT 1 FROM leave_requests l WHERE l.employee_id = ep.employee_id).'
          }
        },
        {
          heading: 'EXCEPT — in the first set but not the second',
          body: 'Employees staffed on projects who have **never** requested leave. (MySQL 8.0.31+ uses the same syntax; MariaDB has supported EXCEPT since 10.3.)',
          example: {
            sql: 'SELECT employee_id FROM employee_projects\nEXCEPT\nSELECT employee_id FROM leave_requests\nORDER BY employee_id\nLIMIT 15;',
            dialect: 'standard',
            note: 'The equivalent anti-join: LEFT JOIN … WHERE l.employee_id IS NULL, or NOT EXISTS — both portable to any MySQL version.'
          }
        },
        {
          heading: 'Set ops obey bag vs set semantics',
          body: 'INTERSECT/EXCEPT are **set** operations — they deduplicate. An employee with 3 leave requests appears once. Keep that in mind when counting.',
          example: {
            sql: "SELECT\n  (SELECT COUNT(*) FROM (SELECT employee_id FROM employee_projects INTERSECT SELECT employee_id FROM leave_requests)) AS project_and_leave,\n  (SELECT COUNT(*) FROM (SELECT employee_id FROM employee_projects EXCEPT SELECT employee_id FROM leave_requests)) AS project_no_leave,\n  (SELECT COUNT(DISTINCT employee_id) FROM employee_projects) AS all_project_staff;",
            dialect: 'standard',
            note: 'project_and_leave + project_no_leave = all_project_staff — the two set operations partition the staffed employees.'
          }
        }
      ]
    }
  ]
};
