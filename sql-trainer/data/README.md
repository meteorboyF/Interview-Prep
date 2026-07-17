# HR Training Dataset — `hr_training` (MySQL / MariaDB)

Synthetic HR/Employee Management dataset built for the **SQL Fundamentals → Analytics → Advanced SQL** 3-week course. Tested end-to-end on MariaDB 10.11 (MySQL-compatible syntax).

## Files
| File | Purpose |
|---|---|
| `hr_training_dataset.sql` | Full schema + data. Run once to create the `hr_training` database. |
| `csv/*.csv` (zipped as `hr_dataset_csv_files.zip`) | Same data as flat CSVs, in case students want to practice `LOAD DATA INFILE` or import into another tool. |

## How to load
```bash
mysql -u root -p < hr_training_dataset.sql
```
This drops/recreates the `hr_training` database, creates 10 tables, loads all rows, and adds indexes.

## Scale
~25,000 rows total — sized for Week 4's query optimization discussions (index usage, `EXPLAIN`, execution plans) without being unwieldy to load in class.

| Table | Rows | Notes |
|---|---:|---|
| `locations` | 5 | Office cities |
| `departments` | 10 | Linked to a location |
| `jobs` | 20 | Job title/grade with salary bands |
| `employees` | 500 | Self-referencing `manager_id` → full org hierarchy (CEO → VPs → Managers → ICs) |
| `salary_history` | ~1,030 | 1–3 salary changes per employee — good for trend/window-function work |
| `performance_reviews` | ~990 | 1–3 reviews per employee, rating 1–5 |
| `projects` | 20 | Department-owned projects |
| `employee_projects` | ~770 | Many-to-many junction table |
| `leave_requests` | ~1,220 | Leave type, status, date range |
| `attendance` | ~20,600 | Daily check-in/out for the last ~65 workdays, active employees only |

## Entity relationships
```
locations ─┬─< departments ─┬─< employees ──self-FK (manager_id)──┐
           │                │        │                            │
           │                │        ├─< salary_history            │
           │                │        ├─< performance_reviews (also reviewer_id → employees)
           │                │        ├─< leave_requests
           │                │        ├─< attendance
           │                │        └─< employee_projects >─ projects ─< departments
           │                └─< projects
           └── (jobs) ──< employees (job_id)
```

## Topic → table/query mapping

### Week 2 — SQL Fundamentals
- **SELECT / WHERE / ORDER BY**: `employees`, `departments` are the go-to simple tables.
  ```sql
  SELECT first_name, last_name, salary FROM employees
  WHERE department_id = 1 AND employment_status = 'Active'
  ORDER BY salary DESC;
  ```
- **Data types & conversion**: `salary` (DECIMAL), `hire_date`/`termination_date` (DATE), `check_in`/`check_out` (TIME) in `attendance` — good for `CAST`, `CONVERT`, `DATE_FORMAT`, `STR_TO_DATE`.
- **Built-in functions**: `CONCAT(first_name, ' ', last_name)`, `DATEDIFF`, `TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())` for age, `ROUND`, `UPPER/LOWER`.
- **Logical operators**: combine `employment_status`, `commission_pct`, `salary` ranges with `AND/OR/NOT/IN/BETWEEN`.

### Week 3 — Analytics & Business Reporting
- **Joins (INNER/LEFT/RIGHT)**: `employees ⋈ departments ⋈ locations`, `employees ⋈ jobs`.
  ```sql
  SELECT e.first_name, e.last_name, d.department_name, j.job_title
  FROM employees e
  JOIN departments d ON e.department_id = d.department_id
  JOIN jobs j ON e.job_id = j.job_id;
  ```
  MySQL has no `FULL JOIN` — teach it as `LEFT JOIN UNION RIGHT JOIN`, e.g. departments with no employees vs. employees with no department (the CEO row, `department_id IS NULL`, is built in for this).
- **Aggregates & window functions**: salary rank within department, running totals in `salary_history`.
  ```sql
  SELECT employee_id, department_id, salary,
         RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS salary_rank
  FROM employees;
  ```
- **GROUP BY / HAVING**: headcount and average salary by department, filter departments with >5 active employees.
- **Business KPIs**: attrition rate (`employment_status='Terminated'` ratio), attendance rate, average review rating by department.
- **Multi-table / reporting queries**: combine `employee_projects`, `projects`, `departments` for project staffing reports.

### Week 4 — Advanced SQL & Data Manipulation
- **DDL**: `CREATE TABLE`, `ALTER TABLE ... ADD COLUMN`, the pre-built indexes at the bottom of the script.
- **DML**: `INSERT` a new hire, `UPDATE employees SET salary = salary * 1.05 WHERE department_id = 2`, `DELETE FROM leave_requests WHERE status = 'Rejected'`.
- **Subqueries**: employees earning above their department's average (tested — 199 of 500 active employees qualify).
- **CTEs, including recursive**: the org chart is a real hierarchy, so a recursive CTE walks CEO → VP → Manager → IC cleanly:
  ```sql
  WITH RECURSIVE org_chart AS (
    SELECT employee_id, first_name, manager_id, 1 AS level
    FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.employee_id, e.first_name, e.manager_id, oc.level + 1
    FROM employees e JOIN org_chart oc ON e.manager_id = oc.employee_id
  )
  SELECT * FROM org_chart ORDER BY level;
  ```
- **Set operations**: `UNION`/`UNION ALL` across `leave_requests` leave types; MySQL 8.0.31+ also supports `INTERSECT`/`EXCEPT` directly on this schema.
- **DISTINCT vs GROUP BY**: `SELECT DISTINCT job_id FROM employees` vs. `SELECT job_id, COUNT(*) FROM employees GROUP BY job_id`.
- **Query optimization**: use `EXPLAIN` on `attendance` (20k+ rows) filtered by `employee_id, work_date` — indexed — vs. an unindexed column, to show the difference.

## Notes for the instructor
- Ages are constrained so every employee was 22–60 years old at their hire date (no impossible birth/hire combinations).
- ~12% of employees are `Terminated` with a valid `termination_date` after hire — useful for attrition KPIs.
- The dataset was generated with Python + Faker (seeded, so it's reproducible) and validated by actually loading it into MariaDB and running sample queries from every topic above before delivery.
