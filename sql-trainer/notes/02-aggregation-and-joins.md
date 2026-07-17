# Chapter 2 — Aggregation & Joins

> **Dataset:** the HR training dataset (500 employees, 10 departments, 20 jobs, 5 locations).
> Every printed result was **executed and verified** against the real database — reproduce any of
> them in the [SQL Trainer playground](https://meteorboyf.github.io/Interview-Prep/sql-trainer/).

**Covers:** `GROUP BY` · `HAVING` · aggregate patterns · `INNER` / `LEFT` / `RIGHT` / `FULL OUTER` /
`CROSS` / self joins · multi-table joins · `IN` vs `EXISTS` · `UNION` vs `UNION ALL` ·
conditional aggregation (pivots)

**Builds on:** [Chapter 1](01-core-querying.md) — especially the logical evaluation order
(FROM → WHERE → **GROUP BY → HAVING** → SELECT → ORDER BY → LIMIT).

---

## 1. GROUP BY — collapsing rows into groups

### 1.1 Definition

- `GROUP BY` partitions the filtered rows into **buckets** that share the same values in the
  grouping columns; every aggregate then runs **once per bucket**, and the output has **one row
  per bucket**.
- Problem it solves: "per-X" questions — headcount per department, average salary per job,
  requests per status. Without it you'd run one query per department and stitch results in code.
- Why it exists: aggregation is the other half of reporting. Codd's algebra had projection and
  selection; real businesses immediately needed *summarization* — `GROUP BY` is SQL's answer.

### 1.2 The mental model (step-by-step execution)

```sql
SELECT department_id, employment_status, COUNT(*)
FROM employees
WHERE department_id IN (1, 3)
GROUP BY department_id, employment_status;
```

```
1. FROM employees            → 500 rows
2. WHERE dept IN (1,3)       → 98 rows (Engineering 40 + Sales 58)
3. GROUP BY (dept, status)   → buckets:  (1,Active) (1,On Leave) (1,Terminated)
                                          (3,Active) (3,Terminated)
4. SELECT + COUNT(*) per bucket → one output row per bucket
```

Verified result — note Sales has **no** On-Leave bucket (groups only exist for combinations
that occur; SQL never invents empty groups):

| department_id | employment_status | COUNT(*) |
|---|---|---|
| 1 | Active | 35 |
| 1 | On Leave | 1 |
| 1 | Terminated | 4 |
| 3 | Active | 53 |
| 3 | Terminated | 5 |

### 1.3 The golden rule — and the engine that ignores it ⚠️

**Every column in SELECT must be either (a) in GROUP BY or (b) inside an aggregate.**

What happens if you break it depends on the engine — and this is a *fantastic* interview answer:

```sql
-- first_name is neither grouped nor aggregated:
SELECT department_id, first_name, COUNT(*)
FROM employees WHERE department_id = 3
GROUP BY department_id;
```

- **MySQL (default since 5.7, `ONLY_FULL_GROUP_BY`)**: ❌ error — refuses to run.
- **SQLite (the trainer)**: ✅ runs, returns **an arbitrary row's value** — verified:
  `(3, 'Patricia', 58)`. Patricia happens to be *one of* the 58 Sales employees; nothing chose
  her deliberately, and a VACUUM or index change could silently change the name returned.

**Verdict:** a query that returns different correct-looking answers on different days is worse
than one that errors. Follow the golden rule even where the engine forgives you.

### 1.4 NULL forms its own group

Verified: `GROUP BY department_id` over all employees yields a `NULL` group with count 1 — the
CEO. `GROUP BY` treats all NULLs as one group (unlike `=`, which says NULL≠NULL — a deliberate
pragmatic inconsistency in the standard, and a favorite exam nitpick).

### 1.5 Real-world patterns (all verified)

```sql
-- Headcount by department (the canonical report)
SELECT d.department_name, COUNT(e.employee_id) AS headcount
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
GROUP BY d.department_id, d.department_name
ORDER BY headcount DESC;
-- Sales 58 · IT Infrastructure 56 · Product Management 56 · HR 51 · Finance 51
-- Customer Support 51 · Operations 49 · Marketing 44 · Legal 43 · Engineering 40
```

```sql
-- Duplicate detection — the #1 practical GROUP BY…HAVING pattern
SELECT first_name, last_name, COUNT(*)
FROM employees
GROUP BY first_name, last_name
HAVING COUNT(*) > 1;
-- Verified: 4 duplicate name pairs — Christopher Williams, Jill Cook, Rachel Flynn, Travis Davis (2 each)
-- (Same *name* ≠ same person — employee_id and the UNIQUE email keep them distinct. Chapter 4: keys.)
```

```sql
-- Conditional aggregation = a pivot table in pure SQL
SELECT leave_type,
       SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
       SUM(CASE WHEN status = 'Pending'  THEN 1 ELSE 0 END) AS pending,
       COUNT(*) AS total
FROM leave_requests
GROUP BY leave_type
ORDER BY total DESC;
```

Verified:

| leave_type | approved | rejected | pending | total |
|---|---|---|---|---|
| Maternity/Paternity Leave | 205 | 31 | 40 | 276 |
| Casual Leave | 184 | 30 | 36 | 250 |
| Sick Leave | 182 | 31 | 35 | 248 |
| Unpaid Leave | 177 | 14 | 31 | 222 |
| Annual Leave | 163 | 24 | 35 | 222 |

```sql
-- Business KPI: attrition rate per department (CASE inside an aggregate + percentage pattern)
SELECT d.department_name,
       ROUND(100.0 * SUM(CASE WHEN e.employment_status = 'Terminated' THEN 1 ELSE 0 END)
                   / COUNT(*), 1) AS attrition_pct
FROM employees e JOIN departments d ON d.department_id = e.department_id
GROUP BY d.department_id
ORDER BY attrition_pct DESC;
-- Verified top 3: Legal 16.3% · Finance 15.7% · IT Infrastructure 14.3%
```

⚠️ Note the `100.0` — integer `100` would trigger integer division on many engines (chapter 1 §6).

### 1.6 When NOT to use GROUP BY

- Pure deduplication → `DISTINCT` states intent better (chapter 1 §5.3).
- One overall total → no GROUP BY at all; the whole table is one implicit group
  (verified: `SELECT COUNT(*), ROUND(AVG(salary),2), MIN(salary), MAX(salary) FROM employees`
  → 500 · 81474.36 · 32291 · 320000).
- Per-row values *alongside* aggregates ("each employee and their department's average") →
  that's a **window function** (chapter 3); GROUP BY would collapse the rows you want to keep.

---

## 2. HAVING — filtering groups

### 2.1 Definition & why it exists

`WHERE` runs **before** grouping — at that point aggregate values don't exist yet, so
`WHERE COUNT(*) > 5` is a syntax-level impossibility. SQL needed a second filter that runs
**after** aggregation: `HAVING`.

### 2.2 WHERE vs HAVING (comparison — memorize this table)

| | `WHERE` | `HAVING` |
|---|---|---|
| Filters | rows | groups |
| Runs | before GROUP BY | after GROUP BY |
| Can use aggregates | ❌ | ✅ |
| Can use plain columns | ✅ | only grouped ones |
| Performance role | shrinks data early (index-friendly) | trims the final, already-small group list |
| Without GROUP BY | normal | legal but odd — treats the whole result as one group |

**Both in one verified query** (each clause doing its own job):

```sql
SELECT d.department_name, COUNT(*) AS active_staff, ROUND(AVG(e.salary), 2) AS avg_salary
FROM employees e
JOIN departments d ON d.department_id = e.department_id
WHERE e.employment_status = 'Active'     -- row filter FIRST (cheap, index-friendly)
GROUP BY d.department_id, d.department_name
HAVING AVG(e.salary) > 90000             -- group filter SECOND (needs the aggregate)
ORDER BY avg_salary DESC;
-- Verified: Legal 32 @ 130322.52 · Product Management 45 @ 118127.65 · Engineering 35 @ 112435.63
```

### 2.3 The efficiency mistake

```sql
-- BAD: filtering rows in HAVING
… GROUP BY department_id HAVING department_id = 3;

-- GOOD: same result, but the engine discards 442 rows BEFORE grouping
… WHERE department_id = 3 GROUP BY department_id;
```

Both return Sales' numbers; the first groups all 500 employees and throws away 9 groups at the
end. On 500 rows, invisible; on 500 million, a job that never finishes.
**Decision rule:** if the condition doesn't contain an aggregate, it belongs in `WHERE`.

---

## 3. Joins — combining tables

### 3.1 Why joins exist

Normalization (chapter 4) stores each fact **once**: the department name lives in `departments`,
not on all 500 employee rows. Joins are the price and the payoff — they reassemble the
spreadsheet view on demand, from data that can't drift out of sync.

### 3.2 INNER JOIN — matches only

```sql
SELECT e.last_name, d.department_name, l.city
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN locations   l ON d.location_id   = l.location_id;
-- Verified first rows: Doyle→Engineering→Dhaka · Miller→Sales→Chattogram · Robinson→Engineering→Dhaka
```

The dataset's built-in demo: **INNER returns 499 rows, not 500** (verified) — the CEO's
`department_id` is NULL, matches nothing, and silently vanishes. One missing row in a 500-row
report is exactly the kind of bug that ships.

### 3.3 LEFT JOIN — keep everything on the left

```sql
SELECT COUNT(*)                          -- verified: 500 (CEO kept, dept columns NULL)
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;
```

**The anti-join pattern** — "left rows with NO match":

```sql
SELECT e.first_name, e.last_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
WHERE d.department_id IS NULL;           -- verified: exactly the CEO
```

### 3.4 The LEFT JOIN killer mistake ⚠️ (ON vs WHERE)

Filtering the **right** table in `WHERE` silently converts your LEFT JOIN into an INNER JOIN:

```sql
-- Intent: all 500 employees, with department info only when the dept is in Dhaka (location 1).

-- WRONG — verified: 91 rows. The WHERE discards every non-Dhaka row,
-- including all the NULL-extended ones. LEFT JOIN behavior destroyed.
SELECT COUNT(*) FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
WHERE d.location_id = 1;

-- RIGHT — verified: 500 rows. Right-table filters belong in ON.
SELECT COUNT(*) FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
                        AND d.location_id = 1;
```

**Rule:** in a LEFT JOIN — conditions on the **right** table go in `ON`; conditions on the
**left** table go in `WHERE`. (For INNER JOIN it makes no difference to the result — only to
readability.) The *one* legitimate right-table WHERE is `IS NULL` for the anti-join above.

### 3.5 RIGHT JOIN and FULL OUTER JOIN

- `RIGHT JOIN` = LEFT JOIN with the tables swapped. Supported by MySQL and modern SQLite (3.39+,
  which the trainer uses), but style guides — and most senior engineers — rewrite it as a LEFT
  JOIN because humans read left-to-right.
- `FULL OUTER JOIN` keeps unmatched rows from **both** sides.
  **MySQL does not have it at all** — the portable workaround is
  `LEFT JOIN … UNION … RIGHT-side anti-join`. SQLite 3.39+ runs it natively — verified here:

```sql
SELECT e.last_name, d.department_name
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.department_id
WHERE e.employee_id IS NULL OR e.department_id IS NULL;
-- Verified: exactly 1 row — Hill | NULL  (the CEO).
-- No department is employee-less, so no NULL | <dept> rows appear.
```

| Join | Keeps | This dataset (verified) |
|---|---|---|
| INNER | matches only | 499 rows |
| LEFT | all employees | 500 (CEO with NULL dept) |
| RIGHT | all departments | 499 matches, every dept staffed |
| FULL OUTER | both sides | 500 (nothing extra — no empty departments) |
| CROSS | every pair | 5 locations × 10 departments = 50 |

### 3.6 CROSS JOIN

No `ON` clause — every row paired with every row. Verified: `locations CROSS JOIN departments`
= 50 rows. Legitimate for generating grids (every employee × every workday); catastrophic when
accidental: `employees CROSS JOIN attendance` would be 500 × 20,591 ≈ **10.3 million rows**.
If you ever see a join result *bigger* than both inputs and you didn't want a grid — you've
written a cross join (usually by forgetting the `ON`).

### 3.7 Self joins — one table, two roles

The `employees.manager_id → employees.employee_id` self-reference powers all of these
(chapter 3 adds recursive CTEs for whole-tree walks):

```sql
-- Interview classic: employees who out-earn their manager. Verified: 82 employees!
SELECT e.first_name || ' ' || e.last_name AS employee, e.salary,
       m.first_name || ' ' || m.last_name AS manager,  m.salary AS manager_salary
FROM employees e
JOIN employees m ON e.manager_id = m.employee_id
WHERE e.salary > m.salary
ORDER BY e.salary - m.salary DESC;
-- Top gap (verified): Michael Luna (149,306.86) over Barbara Bush (99,116) — a 50k inversion.
```

```sql
-- Managers ranked by direct reports (self join + GROUP BY). Verified top 5:
-- Maria Montgomery 55 · Jeremy Roberts 55 · Amy Robinson 50 · Colin Abbott 50 · Lindsay Blair 50
SELECT m.first_name || ' ' || m.last_name AS manager, COUNT(*) AS direct_reports
FROM employees e
JOIN employees m ON e.manager_id = m.employee_id
GROUP BY m.employee_id
ORDER BY direct_reports DESC;
```

Mental model: aliases `e` and `m` are two *independent cursors* over the same physical table.
`LEFT JOIN` (instead of `JOIN`) would keep the CEO, who has no manager row to match.

### 3.8 Join performance notes

- Engines join ~two tables at a time (nested loop / hash / merge); the optimizer picks the order —
  your written order is a *readability* choice, not an execution plan.
- The single biggest join speedup: **index the FK column being probed**. This dataset ships
  `idx_employees_department`, `idx_attendance_employee_date`, etc. for exactly that reason;
  chapter 4 shows the `EXPLAIN QUERY PLAN` difference (`SEARCH … USING INDEX` vs `SCAN`).
- Row-count sanity check after writing any join:
  1:1 → ≤ left rows · N:1 (employees→departments) → = left rows · 1:N → can multiply.
  If counts surprise you, check for accidental N:N (usually a missing join condition).

---

## 4. IN vs EXISTS vs JOIN (comparison)

Three ways to ask "employees that have at least one leave request" — all verified to return
**500** here (this dataset has leave history for everyone; the *comparison* still matters):

```sql
-- IN: readable, fine for small/clean subqueries
SELECT COUNT(*) FROM employees
WHERE employee_id IN (SELECT employee_id FROM leave_requests);

-- EXISTS: short-circuits per row; NULL-safe; the production default for semi-joins
SELECT COUNT(*) FROM employees e
WHERE EXISTS (SELECT 1 FROM leave_requests l WHERE l.employee_id = e.employee_id);

-- JOIN + DISTINCT: works, but the join multiplies rows first and dedupes after — wasteful,
-- and forgetting DISTINCT inflates the count. Use only when you need leave columns in the output.
```

| | `IN` | `EXISTS` | `JOIN` + `DISTINCT` |
|---|---|---|---|
| Semantics | value in set | at least one match | combine then dedupe |
| NULL hazard | ⚠️ `NOT IN` trap (ch. 1 §7.4) | ✅ none | ✅ none |
| Duplicates | can't create them | can't create them | ⚠️ creates them |
| Need right-table columns? | ❌ | ❌ | ✅ the reason to use it |
| Modern optimizers | often rewrite all three to the same semi-join plan | | |

**Decision rule:** need columns from the other table → JOIN. Only testing existence → EXISTS
(always) or IN (when the subquery is provably NULL-free). Negation → **NOT EXISTS, full stop**.

---

## 5. UNION vs UNION ALL

Stack results **vertically** (same column count & compatible types), unlike joins which extend
horizontally.

```sql
SELECT employee_id FROM employee_projects
UNION       -- deduplicates:      verified   500 rows
SELECT employee_id FROM leave_requests;

SELECT employee_id FROM employee_projects
UNION ALL   -- keeps everything:  verified 1,989 rows (771 assignments + 1,218 requests)
SELECT employee_id FROM leave_requests;
```

| | `UNION` | `UNION ALL` |
|---|---|---|
| Duplicates | removed (whole-row) | kept |
| Cost | sort/hash dedupe pass | none — just concatenation |
| Use when | building a distinct set | stacking report sections / logs; you'll aggregate anyway |
| Default choice | — | ✅ start here; add dedup only when you *mean* it |

The 500-vs-1,989 gap **is** the dedup work. If you're about to `GROUP BY` the result anyway,
`UNION` wastes a full dedup pass — a real code-review comment in reporting pipelines.
(`INTERSECT` / `EXCEPT` complete the set-op family — covered with MySQL-version caveats in the
trainer's Set Operations lesson.)

---

## 6. Decision trees

```
"I need a number per <something>"                 "I need columns from two tables"
 └─ GROUP BY <something>                           └─ Which rows must survive?
     ├─ filter on raw columns? → WHERE (before)        ├─ only matches            → INNER JOIN
     ├─ filter on aggregates?  → HAVING (after)        ├─ all of table A          → A LEFT JOIN B
     └─ per-row AND aggregate                          ├─ all of both             → FULL OUTER
        side by side?          → window fn (ch. 3)     │    (MySQL: LEFT ∪ RIGHT anti-join)
                                                       ├─ every combination       → CROSS JOIN
"Does a related row exist?"                            └─ same table, two roles   → self join (aliases!)
 ├─ yes/no only     → EXISTS
 ├─ …negated        → NOT EXISTS (never NOT IN on nullable data)
 └─ need its columns → JOIN (mind row multiplication)
```

---

## 7. Common mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Non-aggregated, non-grouped SELECT column | MySQL: error · SQLite: **arbitrary value** (verified: "Patricia") | Follow the golden rule (§1.3) |
| Right-table filter in WHERE after LEFT JOIN | 500 → 91 rows, silently (verified) | Move it into `ON` (§3.4) |
| Row filter in HAVING | correct but slow | Move to WHERE (§2.3) |
| `COUNT(*)` after LEFT JOIN to count children | empty parents count as 1 | `COUNT(child.pk)` — NULLs don't count (ch. 1 §5.4) |
| Forgotten `ON` | row explosion (accidental CROSS) | Sanity-check output row counts (§3.8) |
| `UNION` out of habit | needless dedup pass (500 vs 1,989 verified) | Default to `UNION ALL` |
| Aggregate of an aggregate: `MAX(COUNT(*))` | error | Nest it: subquery/CTE, or `ORDER BY n DESC LIMIT 1` |

## 8. Interview notes

| Question | Core answer | Senior follow-up |
|---|---|---|
| WHERE vs HAVING? | rows before grouping vs groups after | why WHERE placement is a performance decision (§2.3) |
| INNER vs LEFT join? | matches only vs keep-left; demo: 499 vs 500 here | the ON-vs-WHERE trap (§3.4) — explaining it unprompted is a strong signal |
| Find employees earning more than their manager | self join, `e.manager_id = m.employee_id`, `e.salary > m.salary` (82 here) | who disappears? (the CEO — no manager row); LEFT JOIN variant |
| Find duplicates in a table | `GROUP BY cols HAVING COUNT(*) > 1` (4 name-pairs here) | delete all *but one* of each — needs keys/ROW_NUMBER (ch. 3/4) |
| IN vs EXISTS? | semi-join semantics; EXISTS is NULL-safe | "which is faster?" — usually identical plans; the *correctness* difference is NOT IN vs NOT EXISTS |
| Why not RIGHT JOIN? | equivalent LEFT JOIN reads naturally | any *real* RIGHT JOIN use? (mostly generated SQL / joining into long FROM chains) |

**How examiners twist it:** they put the aggregate condition in the story's *middle* ("…of the
active employees, departments averaging above 90k…") to test whether you split it into
WHERE (`Active`) + HAVING (`AVG > 90000`) — exactly the verified query in §2.2.

## 9. Exam notes

- Always name the logical order: **WHERE → GROUP BY → HAVING → SELECT**. Most marking schemes
  give a point just for that sentence.
- Keywords worth marks: *"one row per group"*, *"NULLs form a single group"*, *"LEFT JOIN
  preserves unmatched left rows padded with NULLs"*, *"HAVING may reference aggregates"*.
- When asked for "departments with more than N employees", write GROUP BY + HAVING first (the
  expected answer), then *mention* the subquery alternative for the comparison mark.
- Draw the two-circle Venn for join questions — INNER = intersection, LEFT = left circle,
  FULL = union. Examiners are trained to look for it.

## 10. Practical notes

- Alias every table (`employees e`) and qualify every column in multi-table queries — future-you
  will add a column with a clashing name someday.
- Join on keys, not on names (`department_id`, never `department_name` — names change, keys don't).
- In dashboards, prefer conditional aggregation (§1.5 pivot) over N separate queries — one scan.
- Treat `RIGHT JOIN` in review as a rewrite request; treat `NOT IN (subquery)` as a bug report.

## 11. Memory tricks

- 🧠 **LEFT JOIN**: "the **L**eft table **L**ives" — every left row survives.
- 🧠 **ON vs WHERE (left joins)**: "**ON** decides the *match*, **WHERE** decides the *result*."
- 🧠 **WHERE vs HAVING**: WHERE = bouncer at the door (rows), HAVING = judge after the party
  (groups).
- 🧠 **UNION ALL**: "ALL means *all* — nothing thrown away" (and it's the fast one).

## 12. Summary table

| Construct | Use when | Avoid when | Best alternative |
|---|---|---|---|
| `GROUP BY` | per-group computation | pure dedup / per-row + aggregate | `DISTINCT` / window fn |
| `HAVING` | filtering on aggregates | condition has no aggregate | `WHERE` |
| `INNER JOIN` | only matched pairs matter | optional relationships (NULL FKs!) | `LEFT JOIN` |
| `LEFT JOIN` | keep-all-left, incl. anti-join | filtering right table in WHERE | filter in `ON` |
| `RIGHT JOIN` | (rarely) generated SQL | almost always | swapped `LEFT JOIN` |
| `FULL OUTER` | reconciliation both ways | MySQL (unsupported) | LEFT ∪ RIGHT anti-join |
| `CROSS JOIN` | deliberate grids | ever accidentally | add the missing `ON` |
| self join | rows related to rows in the same table | whole-hierarchy traversal | recursive CTE (ch. 3) |
| `EXISTS` | existence tests, esp. negated | need right-table columns | `JOIN` |
| `UNION ALL` | stacking results | you truly need a distinct set | `UNION` |

## 13. Practice questions

**Easy**
1. Average, min and max salary per job grade. *(GROUP BY job via join to jobs)*
2. How many attendance rows per status? *(one GROUP BY on the 20k-row table)*
3. Each project with its owning department's name. *(INNER JOIN projects→departments)*

**Medium**
4. Departments whose *active* staff average salary exceeds 90,000 — name, headcount, average.
   *(expected: Legal 32/130322.52 · Product Mgmt 45/118127.65 · Engineering 35/112435.63)*
5. Every employee with their manager's name, **including the CEO**. *(LEFT self join)*
6. Full name duplicates in `employees`. *(expected: 4 pairs)*
7. For each location: city + number of departments + total employees. *(3-table join + GROUP BY;
   watch which COUNT you use)*

**Hard**
8. Projects staffed by more than 35 people, with total allocated hours. *(junction table
   employee_projects: join, GROUP BY, HAVING)*
9. Departments where attrition exceeds 15%. *(conditional aggregation inside HAVING;
   expected: Legal 16.3 · Finance 15.7)*
10. Employees who out-earn their manager *and* whose manager manages ≥ 50 people. *(self join +
    grouped subquery/CTE — 82 out-earners is your checkpoint before the second filter)*

**Interview-level**
11. Your LEFT JOIN report used to show all 500 employees; after a teammate "just added a filter"
    it shows 91. Diagnose without seeing the diff. *(§3.4)*
12. `SELECT department_id, MAX(salary), first_name FROM employees GROUP BY department_id;` —
    what does this return on MySQL vs SQLite, and why is the SQLite answer dangerous even though
    it "works"? *(§1.3 — and no, it is NOT "the name of the top earner")*

**Scenario**
13. HR wants one table: each leave type as a row, columns for approved/rejected/pending counts
    and approval rate %. Build it with conditional aggregation, then explain why this beats
    running four separate queries.

## 14. Challenge problem — "departments with more than 50 employees", four ways

> Verified answer, all four approaches: **Sales 58 · IT Infrastructure 56 · Product Management 56
> · Human Resources 51 · Finance 51 · Customer Support 51.**

```sql
-- A) GROUP BY + HAVING — the canonical answer
SELECT d.department_name, COUNT(*) AS n
FROM employees e JOIN departments d ON d.department_id = e.department_id
GROUP BY d.department_id, d.department_name
HAVING COUNT(*) > 50
ORDER BY n DESC;

-- B) Correlated subquery — no GROUP BY at all
SELECT department_name FROM departments d
WHERE (SELECT COUNT(*) FROM employees e
       WHERE e.department_id = d.department_id) > 50;

-- C) CTE — A split into named steps
WITH counts AS (
  SELECT department_id, COUNT(*) AS n FROM employees GROUP BY department_id
)
SELECT d.department_name, c.n
FROM counts c JOIN departments d ON d.department_id = c.department_id
WHERE c.n > 50 ORDER BY c.n DESC;

-- D) Window function — counts WITHOUT collapsing, then filter+dedupe
SELECT department_name, n FROM (
  SELECT DISTINCT d.department_name,
         COUNT(*) OVER (PARTITION BY e.department_id) AS n
  FROM employees e JOIN departments d ON d.department_id = e.department_id
) WHERE n > 50 ORDER BY n DESC;
```

| | A GROUP BY+HAVING | B subquery | C CTE | D window |
|---|---|---|---|---|
| Readability | ✅ states intent exactly | ok | ✅✅ scales to many steps | convoluted *for this job* |
| Performance | one aggregation pass | correlated — per-department probe (fine at 10 depts, bad at 10M groups) | = A | window + DISTINCT: extra dedupe |
| Returns count too? | ✅ | ❌ (needs repeating the subquery) | ✅ | ✅ |
| ANSI-standard | ✅ SQL-92 | ✅ SQL-92 | ✅ SQL-99 | ✅ SQL-2003 |
| Interview | *the* expected answer | good "alternative" mention | best for multi-step follow-ups | mention only to contrast with GROUP BY |

**What a senior engineer picks: A** — this question *is* a group filter, and `GROUP BY + HAVING`
says so in exactly two clauses. **C** the moment the question grows a second step ("…and their
average salary vs the company average"). **D** is the wrong tool *here* but becomes the right one
the instant the question changes to "show every employee **next to** their department's headcount"
— collapsing vs not-collapsing is the real dividing line, and articulating that is the
senior-level answer.

---

*Previous: [Chapter 1 — Core Querying](01-core-querying.md) ·
Next: Chapter 3 — Subqueries, CTEs & Window Functions (planned, see [index](README.md))*
