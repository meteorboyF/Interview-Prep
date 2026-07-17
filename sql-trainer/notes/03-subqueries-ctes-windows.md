# Chapter 3 — Subqueries, CTEs & Window Functions

> **Dataset:** the HR training dataset. Every printed result was **executed and verified** against
> the real database — reproduce anything in the
> [SQL Trainer playground](https://meteorboyf.github.io/Interview-Prep/sql-trainer/).

**Covers:** scalar / correlated / derived-table subqueries · `ALL`/`ANY` portability · CTEs (`WITH`)
· recursive CTEs on the org chart · window functions (`OVER`, `PARTITION BY`, ranking, `LAG`/`LEAD`,
running totals, `NTILE`) · latest-record-per-group three ways

**Builds on:** [Ch. 1](01-core-querying.md) (NULL logic, evaluation order) ·
[Ch. 2](02-aggregation-and-joins.md) (GROUP BY, joins, EXISTS)

---

## 1. Subqueries — queries inside queries

### 1.1 Definition & why they exist

A subquery is a `SELECT` used *as a value, a set, or a table* inside another statement. They exist
because real questions are **relative**: "above the average" requires computing the average first.
Relational algebra composes; subqueries are that composition in SQL syntax.

Three shapes, by what they return:

| Shape | Returns | Used in | Example |
|---|---|---|---|
| **Scalar** | 1 value | SELECT, WHERE | `salary > (SELECT AVG(salary) …)` |
| **Column/set** | 1 column, N rows | `IN`, `EXISTS` | `IN (SELECT employee_id …)` |
| **Derived table** | full table | FROM | `FROM (SELECT … GROUP BY …)` |

### 1.2 Scalar subquery — "above the company average"

```sql
-- Verified: company average is 81,474.36 → 187 employees earn more
SELECT COUNT(*) FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

The engine computes the inner query **once**, then treats it as a constant. Scalar subqueries also
work in the SELECT list — the cleanest "compare each group to the whole":

```sql
SELECT d.department_name,
       ROUND(AVG(e.salary), 2)                          AS dept_avg,
       (SELECT ROUND(AVG(salary), 2) FROM employees)    AS company_avg
FROM employees e JOIN departments d ON d.department_id = e.department_id
GROUP BY d.department_id
ORDER BY dept_avg DESC;
-- Verified top 3: Legal 127,169.51 · Product Mgmt 119,545.28 · Engineering 111,064.53 — vs 81,474.36
```

### 1.3 ⚠️ The multi-row scalar trap (engine difference — verified)

What if a "scalar" subquery returns 58 rows?

```sql
SELECT first_name FROM employees
WHERE salary = (SELECT salary FROM employees WHERE department_id = 3);  -- 58 salaries!
```

- **MySQL:** ❌ `ERROR 1242: Subquery returns more than 1 row` — loud and correct.
- **SQLite (verified):** ✅ silently uses **the first row** the inner query happens to produce —
  returned `Patricia` here. No error, arbitrary answer, plan-dependent.

Same lesson as chapter 2 §1.3: the forgiving engine is the dangerous one. If a subquery must be
scalar, *make* it scalar (`MAX(…)`, `LIMIT 1` with an `ORDER BY`, or an equality on a unique key).

### 1.4 Correlated subqueries — "above the *department* average"

A correlated subquery references the outer row, so it logically re-runs **per row**:

```sql
-- Verified: 199 active employees out-earn their own department's average
SELECT COUNT(*) FROM employees e
WHERE e.employment_status = 'Active'
  AND e.salary > (SELECT AVG(e2.salary)
                  FROM employees e2
                  WHERE e2.department_id = e.department_id);   -- ← the correlation
```

- Mental model: a `for each outer row: run inner` loop. Optimizers often decorrelate it into a
  join against a grouped subquery — but you cannot count on it for huge outer tables.
- `EXISTS` (ch. 2 §4) is the most common correlated form, and the one optimizers handle best.

### 1.5 Derived tables — a query in FROM

Aggregate of an aggregate — impossible in one grouping pass, natural with a derived table:

```sql
-- Average per-employee attendance profile. Verified: 42.2 present days, 2.8 late days on average.
SELECT ROUND(AVG(present_days), 1), ROUND(AVG(late_days), 1)
FROM (
  SELECT employee_id,
         SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_days,
         SUM(CASE WHEN status = 'Late'    THEN 1 ELSE 0 END) AS late_days
  FROM attendance GROUP BY employee_id
);
```

Dialect nit (worth an exam mark): **MySQL requires an alias** on every derived table
(`… ) AS per_emp`); SQLite doesn't. Write the alias anyway.

### 1.6 ALL / ANY — standard SQL the trainer's engine doesn't have

`salary > ALL (subquery)` / `> ANY (…)` are standard and work in MySQL —
**SQLite rejects them (verified: syntax error)**. The rewrite is also the *clearer* form:

| Standard/MySQL | Portable rewrite | Meaning |
|---|---|---|
| `> ALL (SELECT s …)` | `> (SELECT MAX(s) …)` | above every one of them |
| `> ANY (SELECT s …)` | `> (SELECT MIN(s) …)` | above at least one |
| `= ANY (…)` | `IN (…)` | set membership |

```sql
-- "Earning more than EVERYONE in Marketing" — verified: Marketing max is 135,082 → 34 employees
SELECT COUNT(*) FROM employees
WHERE salary > (SELECT MAX(salary) FROM employees WHERE department_id = 4);
```

⚠️ NULL caveat: `> ALL` over a set containing NULL is UNKNOWN (ch. 1 §7 again); the `MAX()`
rewrite sidesteps it because aggregates skip NULLs. One more reason the rewrite wins.

---

## 2. CTEs — Common Table Expressions

### 2.1 Definition & why they exist

`WITH name AS (SELECT …)` gives a subquery a **name**, letting you read a query top-down as a
pipeline instead of inside-out as nested parentheses. They exist because derived tables don't
compose readably past ~2 levels — and because recursion (§3) needs a name to refer to itself.

### 2.2 Chained CTEs — the readable pipeline

```sql
WITH att AS (                                   -- step 1: attendance profile per employee
  SELECT employee_id, COUNT(*) AS days_tracked,
         SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_days
  FROM attendance GROUP BY employee_id
),
rev AS (                                        -- step 2: average review rating per employee
  SELECT employee_id, ROUND(AVG(rating), 2) AS avg_rating
  FROM performance_reviews GROUP BY employee_id
)
SELECT e.first_name || ' ' || e.last_name AS employee, att.late_days, rev.avg_rating
FROM att
JOIN employees e ON e.employee_id = att.employee_id
LEFT JOIN rev   ON rev.employee_id = att.employee_id
ORDER BY att.late_days DESC;
-- Verified top: Anthony Rogers (9 late days, rated 4.50!) · Angela Myers (8, 3.67) · Christopher Keith (7, 3.00)
```

Each step is testable alone (run just the CTE body), nameable, and reviewable — that's the whole
value proposition.

### 2.3 CTE vs subquery vs temp table (comparison)

| | Derived subquery | CTE | Temp table |
|---|---|---|---|
| Readability | inside-out | ✅ top-down | top-down, but far from the query |
| Reuse within one query | ❌ repeat it | ✅ reference many times | ✅ |
| Reuse across queries | ❌ | ❌ | ✅ |
| Indexable / ANALYZE-able | ❌ | ❌ (usually) | ✅ |
| Recursion | ❌ | ✅ only option | ❌ |
| Performance | same plan as CTE in modern engines | usually inlined (SQLite/MySQL 8 may materialize when referenced twice — `MATERIALIZED` hints exist) | write cost, but stats + indexes |

**Decision rule:** default to **CTE** for readability; drop to a **temp table** only when the
intermediate result is reused across *multiple statements* or is big enough to need its own index.
A senior answer mentions that CTEs are (mostly) *not* an optimization fence you can rely on —
they're a readability tool.

---

## 3. Recursive CTEs — walking the org chart

### 3.1 Why recursion — the problem plain SQL can't solve

"Who reports to Patricia, **directly or indirectly**?" A self join gets you one level; N levels
need N joins — and you don't know N. Recursive CTEs iterate until no new rows appear.

Anatomy:

```
WITH RECURSIVE name AS (
    <anchor>        -- the starting rows (level 1)
    UNION ALL
    <recursive>     -- joins `name` to find the NEXT level; re-runs until it adds nothing
)
```

### 3.2 The whole hierarchy, verified

```sql
WITH RECURSIVE org AS (
  SELECT employee_id, 1 AS level FROM employees WHERE manager_id IS NULL   -- anchor: the CEO
  UNION ALL
  SELECT e.employee_id, o.level + 1
  FROM employees e JOIN org o ON e.manager_id = o.employee_id              -- next level down
)
SELECT level, COUNT(*) FROM org GROUP BY level ORDER BY level;
```

| level | people | who |
|---|---|---|
| 1 | 1 | CEO |
| 2 | 10 | VPs & senior managers |
| 3 | 397 | the bulk of the org |
| 4 | 92 | deepest reports |

1 + 10 + 397 + 92 = **500** — every employee reachable from the root: the hierarchy is a proper
tree (no orphans, no cycles). That *check itself* is a real data-quality query.

### 3.3 Walking upward — chain of command

Recursion goes whichever way you join. Verified for employee 125:

```sql
WITH RECURSIVE chain AS (
  SELECT employee_id, first_name || ' ' || last_name AS name, manager_id, 0 AS hops
  FROM employees WHERE employee_id = 125
  UNION ALL
  SELECT m.employee_id, m.first_name || ' ' || m.last_name, m.manager_id, c.hops + 1
  FROM employees m JOIN chain c ON m.employee_id = c.manager_id
)
SELECT hops, name FROM chain ORDER BY hops;
-- 0 Emily Diaz → 1 Susan Rogers → 2 Angel Hill (CEO). Two hops to the top.
```

### 3.4 Subtree sizes — "how big is each executive's org?"

```sql
WITH RECURSIVE subtree AS (
  SELECT employee_id AS root, employee_id FROM employees WHERE manager_id = 1  -- each VP as a root
  UNION ALL
  SELECT s.root, e.employee_id FROM employees e JOIN subtree s ON e.manager_id = s.employee_id
)
SELECT e.first_name || ' ' || e.last_name AS leader, COUNT(*) - 1 AS total_reports
FROM subtree s JOIN employees e ON e.employee_id = s.root
GROUP BY s.root ORDER BY total_reports DESC;
-- Verified top: Patricia Miller 57 · Jeremy Roberts 55 · Maria Montgomery 55 · Lindsay Blair 50 · Colin Abbott 50
```

Note this counts **transitive** reports — compare with chapter 2's *direct*-reports leaderboard
(where Patricia doesn't even make the top 5). Direct ≠ total span of control: a classic
misread in org analytics.

### 3.5 Safety: termination & cycles

- Recursion stops when the recursive member returns no rows. A **cycle** in the data
  (A manages B manages A) = infinite loop; engines have backstops
  (MySQL `cte_max_recursion_depth` = 1000 default; SQLite runs until memory or an added
  `WHERE level < 20` guard). Production habit: cap depth explicitly.
- `UNION` (instead of `UNION ALL`) dedupes per iteration — the standard cycle-breaker when
  traversing *graphs* rather than trees.
- Interview flag: "how do you detect a cycle?" — carry a path string
  (`path || '.' || id`, ch. lesson "Indented tree") and refuse to extend when
  `path LIKE '%.' || id || '.%'`.

---

## 4. Window functions — aggregates that don't collapse

### 4.1 Definition & why they exist

`GROUP BY` answers per-group questions by **collapsing** to one row per group. The moment you need
a per-row value *next to* a group value — "each employee **and** their department average", "rank
within department" — collapsing destroys what you need. Window functions compute over a group
(the *window*) while **keeping every row**. That single sentence is the interview answer.

```
aggregate + GROUP BY : N rows → 1 per group
aggregate + OVER(…)  : N rows → N rows, each annotated
```

### 4.2 RANK vs DENSE_RANK vs ROW_NUMBER — real ties, verified

Department headcounts (ch. 2) contain genuine ties — 56/56 and 51/51/51 — making the three
functions visibly diverge on real data:

```sql
WITH hc AS (
  SELECT d.department_name AS dept, COUNT(*) AS n
  FROM employees e JOIN departments d ON d.department_id = e.department_id
  GROUP BY d.department_id
)
SELECT dept, n,
       RANK()       OVER w AS rnk,
       DENSE_RANK() OVER w AS dense_rnk,
       ROW_NUMBER() OVER w AS row_num
FROM hc WINDOW w AS (ORDER BY n DESC)
ORDER BY n DESC, dept;
```

| dept | n | RANK | DENSE_RANK | ROW_NUMBER |
|---|---|---|---|---|
| Sales | 58 | 1 | 1 | 1 |
| IT Infrastructure | 56 | **2** | **2** | 2 |
| Product Management | 56 | **2** | **2** | 3 |
| Human Resources | 51 | **4** | **3** | 4 |
| Finance | 51 | 4 | 3 | 5 |
| Customer Support | 51 | 4 | 3 | 6 |
| Operations | 49 | **7** | **4** | 7 |
| Marketing | 44 | 8 | 5 | 8 |
| Legal | 43 | 9 | 6 | 9 |
| Engineering | 40 | 10 | 7 | 10 |

- **RANK** — Olympic medals: ties share, next rank **skips** (…4, 4, 4, 7).
- **DENSE_RANK** — ties share, **no gaps** (…3, 3, 3, 4). "Nth distinct value" questions want this.
- **ROW_NUMBER** — unique always; ties broken **arbitrarily** unless you add a tiebreaker to the
  `ORDER BY`. Never use it where ties must share credit.

🧠 **Mnemonic:** **R**ANK leaves **R**oom (gaps) · **DENSE** is densely packed · **ROW_NUMBER**
just numbers rows.

### 4.3 Top-N per group — the pattern

Window functions can't go in `WHERE` (they're computed at SELECT time — ch. 1 §0), so wrap:

```sql
SELECT * FROM (
  SELECT first_name, last_name, department_id, salary,
         RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk
  FROM employees WHERE department_id IS NOT NULL
) WHERE rnk <= 3;
-- Verified: exactly 30 rows (10 depts × 3 — no boundary ties in this data)
-- Engineering's podium: Doyle 239,729 · Craig Wise 142,127.24 · Mason Jackson 140,822.66
```

`PARTITION BY` = "GROUP BY for windows": restart the computation per department. RANK (not
ROW_NUMBER) is the safe default here — if two people tie for 3rd, both deserve to appear.

### 4.4 LAG / LEAD — previous & next row

```sql
SELECT employee_id, change_date, new_salary,
       LAG(new_salary) OVER (PARTITION BY employee_id ORDER BY change_date) AS previous_salary
FROM salary_history WHERE employee_id IN (16, 17);
```

Verified — first change per employee has `NULL` previous (LAG found no earlier row):

| employee_id | change_date | new_salary | previous_salary |
|---|---|---|---|
| 16 | 2020-07-10 | 48674.15 | *NULL* |
| 16 | 2025-07-19 | 51726.06 | 48674.15 |
| 16 | 2025-07-24 | 56403.79 | 51726.06 |
| 17 | 2024-11-20 | 37181.35 | *NULL* |
| 17 | 2026-06-26 | 40171.23 | 37181.35 |

```sql
-- Biggest single raises in company history (LAG in an expression):
SELECT employee_id, change_date,
       ROUND(new_salary - LAG(new_salary) OVER (PARTITION BY employee_id ORDER BY change_date), 2)
       AS salary_jump
FROM salary_history ORDER BY salary_jump DESC LIMIT 3;
-- Verified: employee 1 (+26,706 on 2025-04-22) · employee 2 (+24,307.29) · employee 1 (+22,981.70)
-- The two biggest raises in the company went to the CEO and the VP of Engineering. Of course they did.
```

⚠️ Fun portability landmine found while verifying: aliasing that column `raise` breaks on SQLite —
`RAISE` is a **reserved word** (trigger machinery). Avoid keyword aliases; every engine has its own
list. `LEAD(…)` is symmetric (next row) — e.g. "date of *next* review" per employee.

### 4.5 Running totals & shares

```sql
-- Cumulative payroll in hire order. Verified first rows:
SELECT hire_date, last_name, salary,
       SUM(salary) OVER (ORDER BY hire_date, employee_id) AS cumulative_payroll
FROM employees ORDER BY hire_date, employee_id;
-- Hill 320,000 → Miller 555,753 → Bush 654,869 → Roberts 774,740 …
```

- An `ORDER BY` inside `OVER` turns `SUM` into a **running** sum (default frame:
  `RANGE UNBOUNDED PRECEDING`). Frame nuance worth knowing: `RANGE` treats *peer rows* (ties in
  the ordering) as one unit; `ROWS` counts physical rows. The tiebreaker `employee_id` above makes
  them equivalent — add one whenever your order key can tie.
- Empty `OVER ()` = the whole result is one window:

```sql
-- Payroll share per department, no self-join needed. Verified top: dept 10 → 16.6% · 9 → 13.5% · 1 → 11.0%
SELECT DISTINCT department_id,
       ROUND(100.0 * SUM(salary) OVER (PARTITION BY department_id)
                   / SUM(salary) OVER (), 1) AS pct_of_payroll
FROM employees WHERE department_id IS NOT NULL ORDER BY pct_of_payroll DESC;
```

### 4.6 NTILE — buckets

```sql
-- Engineering salary quartiles. Verified: 40 people → 10 per quartile;
-- Q4 spans 126,211.62 … 239,729 (the VP stretches the top bucket).
SELECT quartile, COUNT(*), MIN(salary), MAX(salary)
FROM (SELECT salary, NTILE(4) OVER (ORDER BY salary) AS quartile
      FROM employees WHERE department_id = 1)
GROUP BY quartile;
```

NTILE splits into equal-**count** buckets (±1), not equal-width value bands — the right tool for
percentile cohorts, the wrong one for histograms.

---

## 5. Decision tree — subquery vs CTE vs window

```
"My question references another computed result"
 ├─ one value (an average, a max)              → scalar subquery
 ├─ per-outer-row lookup                       → correlated subquery / EXISTS
 ├─ a whole intermediate table
 │    ├─ used once, simple                     → derived table
 │    ├─ multi-step or reused                  → CTE
 │    └─ reused across statements / needs index→ temp table
 ├─ unknown-depth hierarchy                    → recursive CTE (cap the depth!)
 └─ per-row value NEXT TO a group value
      ├─ rank / top-N per group                → RANK / DENSE_RANK / ROW_NUMBER
      ├─ previous / next row                   → LAG / LEAD
      ├─ running / cumulative                  → aggregate OVER (ORDER BY …)
      └─ share of total                        → aggregate OVER () in a ratio
```

## 6. Common mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Multi-row subquery where scalar expected | MySQL error · SQLite silently picks a row (verified: "Patricia") | force scalar: `MAX()` / unique key / `LIMIT 1` |
| `NOT IN (subquery with NULLs)` | 0 rows silently (ch. 1 §7.4) | `NOT EXISTS` |
| Window function in `WHERE` | error | wrap in derived table/CTE, filter outside |
| `ROW_NUMBER` where ties matter | one of the tied rows silently dropped | `RANK` / `DENSE_RANK` |
| No tiebreaker in `OVER (ORDER BY …)` | nondeterministic results, `RANGE`-frame surprises | add a unique key to the ordering |
| Unbounded recursion | hang / depth-limit error | `WHERE level < N` guard; `UNION` for graphs |
| Correlated subquery on a huge outer table | per-row probes | rewrite as JOIN on a grouped subquery / CTE |
| Keyword as alias (`AS raise`) | baffling syntax error (verified on SQLite) | pick non-reserved names |

## 7. Interview notes

| Question | Core answer | Senior follow-up |
|---|---|---|
| GROUP BY vs window functions? | collapse vs annotate — one row per group vs every row kept | when the optimizer computes both in one pass |
| RANK vs DENSE_RANK vs ROW_NUMBER? | gaps / no gaps / always unique (recite the 56-56 tie table) | which for "3rd highest *distinct* salary"? (DENSE_RANK) |
| Latest record per group? | ROW_NUMBER = 1 pattern (see challenge) | what breaks with duplicate timestamps? (add tiebreaker; verified: this dataset has none) |
| Correlated vs non-correlated? | inner references outer → conceptually per-row | decorrelation: optimizers rewrite to joins; EXISTS as the optimizer-friendliest form |
| Walk an org chart in SQL? | recursive CTE, anchor = `manager_id IS NULL` | cycle detection via path column; depth caps |
| CTE = faster? | **No** — readability tool; may inline or materialize | `MATERIALIZED` hints; when a temp table genuinely wins |

**How interviewers trick you:** "top 3 salaries per department" then quietly ask what happens on a
tie at 3rd place. ROW_NUMBER answers drop a deserving row; RANK answers might return 4. Saying
*"depends whether ties share the podium — RANK for inclusive, ROW_NUMBER for exactly-3"* is the
whole game.

## 8. Exam notes

- Recursive CTE questions: always label **anchor** and **recursive member**, mention `UNION ALL`,
  and state the termination condition ("stops when the recursive member returns no rows") —
  that sentence is usually a dedicated mark.
- Window syntax skeleton to memorize: `fn() OVER (PARTITION BY … ORDER BY … [frame])`.
- The phrase *"window functions do not reduce the number of rows"* is the keyword examiners scan
  for; pair it with "evaluated after WHERE/GROUP BY/HAVING, before ORDER BY".
- Show the tie table (RANK 1,2,2,4 vs DENSE 1,2,2,3) — tiny, and it proves you understand.

## 9. Practical notes

- Name CTE steps after business meaning (`att`, `rev`, `latest_salary`) — the query becomes its
  own documentation.
- Reports with multiple metrics per entity: one pass with several window functions beats N
  self-joins — measurable on the 20k-row attendance table in the trainer.
- Cap every recursive CTE in production code, even over "guaranteed" trees. Data drifts.
- Team style: `WINDOW w AS (…)` (named windows, §4.2) once you use the same window twice.

## 10. Summary table

| Construct | Use when | Avoid when | Best alternative |
|---|---|---|---|
| Scalar subquery | compare against one computed value | it might return >1 row | aggregate it / unique key |
| Correlated subquery | per-row lookups, EXISTS tests | huge outer tables | JOIN on grouped CTE |
| Derived table | one-shot intermediate | nesting > 2 levels | CTE |
| CTE | readable pipelines, reuse in-query | cross-statement reuse | temp table |
| Recursive CTE | hierarchies, unknown depth | uncapped on untrusted data | depth guard |
| RANK / DENSE_RANK | ties share position | need exactly-one winner | ROW_NUMBER + tiebreaker |
| ROW_NUMBER | dedup, pagination keys, latest-per-group | ties deserve equal credit | RANK |
| LAG / LEAD | change-over-time, gaps | — | self join (pre-2003 style) |
| `SUM() OVER (ORDER BY)` | running totals | tie-prone order key without tiebreaker | add unique key |

## 11. Practice questions

**Easy**
1. Employees earning above the company average — name + salary + the average itself.
   *(checkpoint: 187 rows)*
2. Each employee's latest review rating. *(ROW_NUMBER pattern on performance_reviews)*
3. Number each employee within their department by hire date. *(ROW_NUMBER, PARTITION BY)*

**Medium**
4. Departments whose average salary is above the company average. *(scalar subquery in HAVING —
   verified: Legal, Product Mgmt, Engineering lead)*
5. Every employee's salary vs their department average, as a ± difference. *(window `AVG OVER
   PARTITION` — note why GROUP BY can't do this)*
6. The 3 biggest single raises in salary_history. *(LAG; checkpoint: +26,706 / +24,307.29 /
   +22,981.70 — and don't call the column `raise` on SQLite!)*
7. Chain of command for employee 300. *(upward recursion, §3.3)*

**Hard**
8. Employees earning more than **everyone** in Marketing. *(ALL-rewrite; checkpoint: 34)*
9. For each level of the org chart: headcount and average salary. *(recursive CTE + join +
   GROUP BY; levels are 1/10/397/92)*
10. Per department: total transitive reports of its highest-paid member. *(recursion + window —
    two chapters in one query)*

**Interview-level**
11. "3rd highest distinct salary company-wide" — why is DENSE_RANK the only strictly correct
    window answer, and what's the ch. 1 LIMIT/OFFSET equivalent?
12. Your recursive CTE never terminates in production but finishes in staging. What data
    condition do you suspect, and what two defenses do you add? *(§3.5)*

**Scenario**
13. Build a "manager dashboard" row per manager: direct reports (ch. 2), transitive reports
    (§3.4), average team rating, and their own salary rank among managers. Sketch the CTE
    pipeline before writing SQL.

## 12. Challenge problem — latest salary per employee, three ways

> All three verified to return exactly **500 rows** (every employee has salary history here), and
> the same rows — most recent changes on 2026-06-29 (employees 67, 86, 151…). Also verified: no
> duplicate `(employee_id, change_date)` pairs exist, which is what makes all three deterministic.

```sql
-- A) Correlated MAX (ANSI-92 — works everywhere, even ancient MySQL)
SELECT s.* FROM salary_history s
WHERE s.change_date = (SELECT MAX(s2.change_date) FROM salary_history s2
                       WHERE s2.employee_id = s.employee_id);

-- B) JOIN against a grouped derived table (the pre-window workhorse)
SELECT s.* FROM salary_history s
JOIN (SELECT employee_id, MAX(change_date) AS mx
      FROM salary_history GROUP BY employee_id) m
  ON m.employee_id = s.employee_id AND m.mx = s.change_date;

-- C) ROW_NUMBER (the modern standard)
SELECT * FROM (
  SELECT s.*, ROW_NUMBER() OVER (PARTITION BY employee_id
                                 ORDER BY change_date DESC, salary_history_id DESC) AS rn
  FROM salary_history s
) WHERE rn = 1;
```

| | A correlated | B join-on-max | C ROW_NUMBER |
|---|---|---|---|
| Duplicate max dates | returns **both** rows | returns **both** rows | returns exactly one (tiebreaker!) |
| "Exactly one per group" guarantee | ❌ | ❌ | ✅ |
| Extra columns from the row | ✅ | ✅ | ✅ |
| Performance | per-row probe (fine with `idx_salary_history_employee`) | two passes, joins well | one sort per partition |
| Portability | everywhere | everywhere | MySQL 8+/SQLite 3.25+/all modern |
| Interview | "the classic" | "the scalable classic" | *the expected modern answer* |

**What a senior engineer picks: C**, with the explicit tiebreaker (`salary_history_id DESC`) —
it's the only variant whose cardinality is *guaranteed*, and guaranteed cardinality is what
downstream joins silently depend on. Say that sentence in an interview and watch the interviewer
relax. **B** when the engine lacks windows; **A** for a quick ad-hoc check.

---

*Previous: [Chapter 2 — Aggregation & Joins](02-aggregation-and-joins.md) ·
Next: Chapter 4 — DDL, Keys, Transactions & Indexing (planned, see [index](README.md))*
