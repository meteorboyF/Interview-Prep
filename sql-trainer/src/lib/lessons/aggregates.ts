import type { LessonCategory } from './types';

export const aggregates: LessonCategory = {
  id: 'aggregates',
  title: 'Aggregates',
  lessons: [
    {
      id: 'aggregate-functions',
      title: 'COUNT, SUM, AVG, MIN, MAX',
      summary: 'Collapsing many rows into summary numbers, across salaries, attendance, reviews and project hours.',
      sections: [
        {
          heading: 'Company-wide salary statistics',
          example: {
            sql: 'SELECT COUNT(*) AS headcount,\n       ROUND(AVG(salary), 2) AS avg_salary,\n       MIN(salary) AS min_salary,\n       MAX(salary) AS max_salary,\n       ROUND(SUM(salary) / 1000000.0, 2) AS payroll_millions\nFROM employees;',
            dialect: 'standard'
          }
        },
        {
          heading: 'COUNT(*) vs COUNT(column) vs COUNT(DISTINCT column)',
          body: '`COUNT(*)` counts rows; `COUNT(col)` counts non-NULL values; `COUNT(DISTINCT col)` counts unique non-NULL values.',
          example: {
            sql: 'SELECT COUNT(*) AS review_rows,\n       COUNT(reviewer_id) AS with_reviewer,\n       COUNT(DISTINCT employee_id) AS employees_reviewed,\n       ROUND(AVG(rating), 2) AS avg_rating\nFROM performance_reviews;',
            dialect: 'standard'
          }
        },
        {
          heading: 'Total allocated project hours',
          example: {
            sql: 'SELECT COUNT(*) AS assignments,\n       COUNT(DISTINCT employee_id) AS staffed_employees,\n       SUM(hours_allocated) AS total_hours,\n       ROUND(AVG(hours_allocated), 1) AS avg_hours\nFROM employee_projects;',
            dialect: 'standard'
          }
        }
      ]
    },
    {
      id: 'group-by-having',
      title: 'GROUP BY & HAVING',
      summary: 'Per-group reports: headcount by department, average salary by job, leave by status, attendance totals, project staffing.',
      sections: [
        {
          heading: 'Headcount by department',
          body: '`GROUP BY` splits rows into buckets; aggregates run per bucket. The `LEFT JOIN` keeps departments with zero employees (none here — but the pattern matters).',
          example: {
            sql: 'SELECT d.department_name, COUNT(e.employee_id) AS headcount\nFROM departments d\nLEFT JOIN employees e ON e.department_id = d.department_id\nGROUP BY d.department_id, d.department_name\nORDER BY headcount DESC;',
            dialect: 'standard'
          }
        },
        {
          heading: 'Average salary by job title',
          example: {
            sql: 'SELECT j.job_title,\n       COUNT(*) AS employees,\n       ROUND(AVG(e.salary), 2) AS avg_salary,\n       j.min_salary, j.max_salary\nFROM employees e\nJOIN jobs j ON j.job_id = e.job_id\nGROUP BY j.job_id, j.job_title, j.min_salary, j.max_salary\nORDER BY avg_salary DESC;',
            dialect: 'standard',
            note: 'Compare avg_salary against the job\'s min/max band from the jobs table.'
          }
        },
        {
          heading: 'Leave requests by status, attendance by status',
          example: {
            sql: "SELECT 'leave: ' || status AS category, COUNT(*) AS total FROM leave_requests GROUP BY status\nUNION ALL\nSELECT 'attendance: ' || status, COUNT(*) FROM attendance GROUP BY status\nORDER BY category;",
            dialect: 'standard',
            note: 'Two GROUP BY reports stitched together with UNION ALL (see Set Operations).'
          }
        },
        {
          heading: 'HAVING — filtering groups',
          body: '`WHERE` filters rows **before** grouping; `HAVING` filters groups **after** aggregation. Departments averaging over 90k among active staff:',
          example: {
            sql: "SELECT d.department_name,\n       COUNT(*) AS active_staff,\n       ROUND(AVG(e.salary), 2) AS avg_salary\nFROM employees e\nJOIN departments d ON d.department_id = e.department_id\nWHERE e.employment_status = 'Active'      -- row filter first\nGROUP BY d.department_id, d.department_name\nHAVING AVG(e.salary) > 90000              -- group filter second\nORDER BY avg_salary DESC;",
            dialect: 'standard'
          }
        },
        {
          heading: 'Project staffing report',
          example: {
            sql: "SELECT p.project_name, p.status,\n       COUNT(ep.employee_id) AS team_size,\n       SUM(ep.hours_allocated) AS hours\nFROM projects p\nLEFT JOIN employee_projects ep ON ep.project_id = p.project_id\nGROUP BY p.project_id, p.project_name, p.status\nHAVING COUNT(ep.employee_id) >= 30\nORDER BY team_size DESC;",
            dialect: 'standard',
            note: 'Only projects with at least 30 assigned people survive the HAVING clause.'
          }
        },
        {
          heading: 'Attrition rate (business KPI)',
          example: {
            sql: "SELECT ROUND(100.0 * SUM(CASE WHEN employment_status = 'Terminated' THEN 1 ELSE 0 END) / COUNT(*), 1)\n       AS attrition_pct\nFROM employees;",
            dialect: 'standard',
            note: 'Conditional aggregation: CASE inside SUM. Works identically in MySQL and SQLite.'
          }
        }
      ]
    }
  ]
};
