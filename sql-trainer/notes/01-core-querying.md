# Chapter 1 — Core Querying

> **Dataset:** every query below runs against the HR training dataset (500 employees, 10 departments,
> 20 jobs, 20k+ attendance rows). Every printed result was **executed and verified** against the real
> database — paste any query into the [SQL Trainer playground](https://meteorboyf.github.io/Interview-Prep/sql-trainer/)
> to reproduce it.

**Covers:** `SELECT` · `WHERE` · comparison & logical operators · `BETWEEN` / `IN` / `LIKE` ·
`ORDER BY` · `LIMIT`/`OFFSET` · `DISTINCT` · aliases & expressions · NULL and three-valued logic

---

## 0. The mental model: logical query processing order

SQL is **declarative**: you describe *what* you want, the engine decides *how*. But the clauses are
evaluated in a fixed **logical order** that is different from the order you write them — this single
fact explains most "why doesn't this work?" moments in SQL:

```
Written order:            Logical evaluation order:
SELECT   (5)              1. FROM      — which table(s)?
FROM     (1)              2. WHERE     — filter rows
WHERE    (2)              3. GROUP BY  — form groups          (chapter 2)
GROUP BY (3)              4. HAVING    — filter groups        (chapter 2)
HAVING   (4)              5. SELECT    — compute output columns, aliases
ORDER BY (6)              6. ORDER BY  — sort the result
LIMIT    (7)              7. LIMIT     — cut the result
```

**Why this matters immediately:**
- `WHERE` cannot see column aliases (they're created in step 5, after step 2).
- `ORDER BY` *can* see aliases (step 6 runs after step 5).
- `LIMIT` cuts *after* sorting — "top 10" only means something with `ORDER BY`.

🧠 **Mnemonic:** *"**F**riendly **W**aiters **G**ive **H**ungry **S**tudents **O**range **L**emonade"*
(From, Where, Group by, Having, Select, Order by, Limit).

---

## 1. SELECT — reading data

### 1.1 Definition

- `SELECT` reads rows from tables and produces a new, temporary **result table**.
- Problem it solves: retrieving data *declaratively* — you never write loops, cursors, or file I/O;
  you state the shape of the answer.
- It exists because the relational model (Codd, 1970) is built on **relational algebra**: every query
  is a projection (choose columns) + selection (choose rows) over relations. `SELECT` is the SQL
  surface for both operations.

### 1.2 Syntax

```sql
-- Basic
SELECT column1, column2 FROM table_name;

-- Everything (exploration only)
SELECT * FROM table_name;

-- Expressions, aliases, functions
SELECT first_name || ' ' || last_name AS full_name,     -- SQLite/standard; MySQL: CONCAT()
       ROUND(salary / 12.0, 2)        AS monthly_salary
FROM employees;

-- Constant / no-table SELECT (quick calculator)
SELECT 320000 * 0.05;
```

### 1.3 When to use what

| You want… | Write |
|---|---|
| Explore an unfamiliar table | `SELECT * … LIMIT 10` |
| Production code / reports | Explicit column list |
| Computed values (totals, name formatting) | Expressions + `AS` aliases |
| Check a function's behavior | `SELECT function(…)` with no table |

### 1.4 When NOT to use `SELECT *`

`SELECT *` is fine in the playground and **wrong in production code**:

| Problem | Why it bites |
|---|---|
| Performance | Drags every column over the network; kills covering-index optimizations (the engine must visit the table even when an index alone could answer). |
| Fragility | Table gains a column → your app receives an unexpected column; `INSERT INTO … SELECT *` breaks outright. |
| Readability | The reader can't tell what the query actually needs. |
| Review-ability | Column renames/drops are invisible in code review. |

**Decision rule:** typing `*` outside of `COUNT(*)` or an ad-hoc exploration session? Stop and list
the columns.

### 1.5 Step-by-step execution

`locations` is small enough to watch every step (5 rows — note Singapore's `NULL` state):

```
Input: locations                                   SELECT city, country
┌────────────┬────────────┬──────────────┬────────────────┐        FROM locations
│location_id │ city       │ state        │ country        │        WHERE country = 'Bangladesh';
├────────────┼────────────┼──────────────┼────────────────┤
│ 1          │ Dhaka      │ Dhaka Div.   │ Bangladesh     │   1) FROM: take all 5 rows
│ 2          │ Chattogram │ Chattogram D.│ Bangladesh     │   2) WHERE: keep rows where
│ 3          │ Singapore  │ NULL         │ Singapore      │      country = 'Bangladesh'  → rows 1,2
│ 4          │ London     │ England      │ United Kingdom │   3) SELECT: project city, country
│ 5          │ New York   │ New York     │ United States  │
└────────────┴────────────┴──────────────┴────────────────┘
Result (verified):
┌────────────┬────────────┐
│ city       │ country    │
│ Dhaka      │ Bangladesh │
│ Chattogram │ Bangladesh │
└────────────┴────────────┘
```

Internally: the engine scans (or index-seeks) the table row by row, evaluates the `WHERE` predicate
per row to TRUE/FALSE/UNKNOWN, keeps only TRUE rows, then materializes only the projected columns.

---

## 2. WHERE — filtering rows

### 2.1 Definition

- `WHERE` keeps only the rows for which its condition evaluates to **TRUE** (not FALSE, and — the
  exam favorite — not UNKNOWN either; see §7 on NULL).
- Problem it solves: without it, every question would return the whole table and the application
  would filter in code — slow, unscalable, and unindexable.
- It exists as the relational algebra **selection (σ)** operator: databases are optimized to filter
  *before* moving data.

### 2.2 Comparison operators

```sql
=    <>   (also != in MySQL/SQLite)   <   <=   >   >=
```

```sql
-- Executives earning ≥ 150,000  (verified: 3 rows — Hill 320000, Doyle 239729, Miller 235753)
SELECT first_name, last_name, salary
FROM employees
WHERE salary >= 150000;
```

### 2.3 AND / OR / NOT — and the precedence trap ⚠️

`AND` binds **tighter** than `OR`. This is the single most common logic bug in beginner SQL, and
this dataset demonstrates it perfectly:

```sql
-- Intent: "Engineering or IT Infrastructure staff earning > 100k"

-- WRONG — verified: 41 rows
SELECT COUNT(*) FROM employees
WHERE department_id = 1 OR department_id = 8 AND salary > 100000;
-- parsed as:  department_id = 1  OR  (department_id = 8 AND salary > 100000)
-- = ALL of Engineering (any salary!) plus only the rich IT folks.

-- RIGHT — verified: 30 rows
SELECT COUNT(*) FROM employees
WHERE (department_id = 1 OR department_id = 8) AND salary > 100000;
```

**Decision rule:** the moment a `WHERE` mixes `AND` and `OR`, add parentheses. Even when you know
the precedence — the next reader may not.

### 2.4 BETWEEN

```sql
-- Inclusive on BOTH ends. Hired during 2020 → verified: 66 employees
SELECT COUNT(*) FROM employees
WHERE hire_date BETWEEN '2020-01-01' AND '2020-12-31';

-- Salary band → verified: 129 employees
SELECT COUNT(*) FROM employees WHERE salary BETWEEN 100000 AND 150000;
```

- ✅ Use for closed ranges on numbers and ISO dates (this dataset stores dates as `YYYY-MM-DD`
  text, so string order = date order — by design).
- ⚠️ For **timestamp** columns, `BETWEEN '2020-01-01' AND '2020-12-31'` silently drops Dec 31
  after midnight. Industry practice: `col >= '2020-01-01' AND col < '2021-01-01'`
  (half-open interval) — works for dates *and* datetimes, always.
- `x BETWEEN a AND b` is pure sugar for `x >= a AND x <= b`; identical plans.

### 2.5 IN

```sql
-- Verified: 96 employees in Engineering (1) or IT Infrastructure (8)
SELECT COUNT(*) FROM employees WHERE department_id IN (1, 8);
```

- ✅ Cleaner than chained `OR`s; also accepts a subquery: `IN (SELECT …)` (chapter 3).
- ⚠️ `NOT IN` + a subquery that can return NULL = **empty result, no error** (§7.4). Interviewers
  love this one.

### 2.6 LIKE

`%` = any run of characters (including empty) · `_` = exactly one character.

```sql
-- Last names starting with R → verified: 36
SELECT COUNT(*) FROM employees WHERE last_name LIKE 'R%';

-- Last names ending in "son" → verified: 54
SELECT COUNT(*) FROM employees WHERE last_name LIKE '%son';
```

| Pattern | Matches | Index-friendly? |
|---|---|---|
| `'R%'` | prefix | ✅ yes — behaves like a range scan |
| `'%son'` | suffix | ❌ no — leading `%` forces a full scan |
| `'%mit%'` | substring | ❌ no |
| `'J_n'` | Jan, Jon, Jen… | ✅ (fixed prefix `J`) |

- **Dialect nuance (verified here):** SQLite's `LIKE` is case-insensitive for ASCII
  (`LIKE 'r%'` also returns 36); MySQL's case sensitivity follows the column collation
  (usually insensitive with `_ci` collations). Never *assume* — test on your engine.
- Don't use `LIKE` for exact matches: `WHERE status LIKE 'Active'` works but reads as a pattern
  and can miss index optimizations on some engines. Use `=`.

### 2.7 Common mistakes (WHERE)

| Mistake | Symptom | Fix |
|---|---|---|
| `WHERE salary = NULL` | 0 rows, no error (**verified**) | `IS NULL` |
| Mixing AND/OR unparenthesized | Silently wrong row count (41 vs 30 above) | Parentheses |
| `WHERE monthly > 5000` referencing a `SELECT` alias | "no such column" | Repeat the expression, or wrap in a subquery/CTE |
| Function on the column: `WHERE STRFTIME('%Y', hire_date) = '2020'` | Correct answer, **unusable index** | Range instead: `hire_date >= '2020-01-01' AND hire_date < '2021-01-01'` |

The last row is the **sargability** rule (Search-ARGument-able): keep the column bare on one side
of the operator so an index can seek. `WHERE salary * 12 > 120000` → rewrite as
`WHERE salary > 10000`.

---

## 3. ORDER BY — sorting

### 3.1 Definition & the guarantee nobody remembers

Without `ORDER BY`, **row order is undefined**. Not "insertion order", not "primary key order" —
undefined. It often *looks* stable in a demo, then changes with a new index, a parallel plan, or an
engine upgrade. Every "it worked yesterday" ordering bug traces back to this.

### 3.2 Syntax

```sql
SELECT last_name, first_name, hire_date
FROM employees
ORDER BY hire_date ASC,        -- primary key of the sort
         last_name ASC         -- tie-breaker
LIMIT 5;
```

Verified — the five longest-serving employees:

| last_name | first_name | hire_date |
|---|---|---|
| Hill | Angel | 2015-08-22 |
| Miller | Patricia | 2016-11-04 |
| Bush | Barbara | 2017-02-20 |
| Roberts | Jeremy | 2017-03-29 |
| Rogers | Susan | 2017-04-12 |

*(The CEO is also the earliest hire — founders usually are.)*

- `DESC` per key: `ORDER BY salary DESC, last_name ASC` — each key has its own direction.
- Aliases are allowed (`ORDER BY monthly_salary`) because ORDER BY runs after SELECT (§0).
- NULL placement differs by engine: SQLite & MySQL sort NULLs **first** ascending; standard SQL
  offers `NULLS FIRST/LAST` (SQLite supports it; MySQL emulates via `ORDER BY col IS NULL, col`).

### 3.3 Performance

Sorting is O(n log n) and may spill to temp storage on big results. Two ways it becomes free:
1. The engine walks an index that already delivers the requested order.
2. You sort *after* reducing rows (`WHERE` first — which the logical order does for you).

In the trainer: `EXPLAIN QUERY PLAN SELECT * FROM attendance ORDER BY check_in;` shows
`USE TEMP B-TREE FOR ORDER BY` (an explicit sort step), while ordering by an indexed prefix doesn't.

---

## 4. LIMIT / OFFSET — cutting the result

### 4.1 The classic Top-N

```sql
SELECT first_name, last_name, salary
FROM employees
ORDER BY salary DESC
LIMIT 5;
```

Verified:

| first_name | last_name | salary |
|---|---|---|
| Angel | Hill | 320000 |
| Jeffrey | Doyle | 239729 |
| Patricia | Miller | 235753 |
| Michael | Luna | 149306.86 |
| David | Walker | 148038.95 |

`LIMIT` without `ORDER BY` = "give me 5 arbitrary rows" — occasionally what you want for sampling,
never what you want for "top".

### 4.2 Pagination — and why OFFSET doesn't scale

```sql
-- Page 3, page size 5 → verified: employee_ids 11–15
SELECT employee_id, last_name FROM employees
ORDER BY employee_id
LIMIT 5 OFFSET 10;
```

`OFFSET 10000` still **walks past** 10,000 rows before returning any — page 400 is measurably
slower than page 1. Production systems use **keyset (seek) pagination** instead:

```sql
WHERE (work_date, attendance_id) > ('2026-06-01', 15000)   -- "after the last row I saw"
ORDER BY work_date, attendance_id
LIMIT 20;
```

(Chapter 4 measures both on the 20,591-row `attendance` table with `EXPLAIN`.)

### 4.3 Dialects

| Engine | Syntax |
|---|---|
| MySQL / SQLite / Postgres | `LIMIT n OFFSET m` |
| SQL standard | `FETCH FIRST n ROWS ONLY` / `OFFSET m ROWS` |
| SQL Server | `TOP n` or `OFFSET … FETCH` |

Exams usually accept `LIMIT`; mention `FETCH FIRST` if the course says "standard SQL".

---

## 5. DISTINCT — removing duplicates

### 5.1 Definition

`SELECT DISTINCT` deduplicates **entire result rows** after projection. It answers
*"which values exist?"* — not *"how many of each?"* (that's `GROUP BY`, chapter 2).

```sql
-- Verified: exactly 3 statuses exist
SELECT DISTINCT employment_status FROM employees;
-- Active · Terminated · On Leave
```

### 5.2 DISTINCT applies to the whole row

```sql
-- Verified: 22 distinct (department_id, job_id) COMBINATIONS
SELECT DISTINCT department_id, job_id FROM employees;
```

There aren't 22 departments — there are 10; the pair-combination is what's distinct. Writing
`DISTINCT a, b` and reading it as "distinct a, and also b" is a classic exam trap.

### 5.3 DISTINCT vs GROUP BY (comparison)

| | `DISTINCT` | `GROUP BY` |
|---|---|---|
| Purpose | Which unique values exist | Per-group computation |
| Can aggregate? | ❌ | ✅ (`COUNT`, `AVG`, …) |
| Typical plan | sort-or-hash dedupe | sort-or-hash grouping — **same cost** |
| Readability | Clear intent for pure dedup | Clear intent for aggregation |
| Interview preference | Use for dedup only | Use as soon as you compute anything |

**Verified pair — same groups, different questions:**

```sql
SELECT DISTINCT employment_status FROM employees;              -- 3 rows: the values
SELECT employment_status, COUNT(*) FROM employees
GROUP BY employment_status;                                    -- Active 430 · On Leave 15 · Terminated 55
```

**Decision rule:** need a count/sum/avg next to the value? `GROUP BY`. Only need the value list?
`DISTINCT`. Using `GROUP BY` without aggregates *works* but signals confusion to reviewers and
interviewers.

### 5.4 COUNT(*) vs COUNT(column) vs COUNT(DISTINCT column) (comparison)

One verified query settles all three:

```sql
SELECT COUNT(*),                       -- 500 : all rows
       COUNT(termination_date),        --  55 : non-NULL values only (= terminated employees)
       COUNT(DISTINCT department_id)   --  10 : unique non-NULL values
FROM employees;
```

| Variant | Counts | NULLs? | Typical use |
|---|---|---|---|
| `COUNT(*)` | rows | includes rows with NULLs | table/group size |
| `COUNT(col)` | non-NULL values | skips NULL | "how many have a value" |
| `COUNT(DISTINCT col)` | unique non-NULL values | skips NULL | cardinality |

`COUNT(*)` is **not** slower than `COUNT(1)` or `COUNT(id)` — engines special-case it. Interviewers
ask; the answer is "same or faster, and it states intent".

---

## 6. Aliases & expressions

```sql
SELECT first_name || ' ' || last_name AS full_name,
       ROUND(salary / 12.0, 2)        AS monthly_salary
FROM employees
ORDER BY salary DESC
LIMIT 3;
```

Verified:

| full_name | monthly_salary |
|---|---|
| Angel Hill | 26666.67 |
| Jeffrey Doyle | 19977.42 |
| Patricia Miller | 19646.08 |

- `AS` is optional (`salary monthly`) but **always write it** — a forgotten comma silently turns a
  column into an alias: `SELECT salary monthly FROM …` runs fine and returns one misnamed column
  instead of two. Nasty, real, and `AS` makes it impossible.
- **Dialect:** string concatenation is `||` in standard SQL/SQLite; MySQL uses `CONCAT(a, b)`
  (in default mode `||` means logical OR there!).
- Integer division trap: `salary / 12` truncates when both operands are integers on many engines —
  write `/ 12.0` (as above) to force decimal math.
- Aliases are usable in `ORDER BY`, **not** in `WHERE` (logical order, §0).

---

## 7. NULL & three-valued logic ⭐ (the most-tested topic in this chapter)

### 7.1 What NULL is

`NULL` = **unknown / missing**, not zero, not empty string. This dataset ships real NULLs on
purpose: the CEO's `department_id` and `manager_id` (verified: employee 1, Angel Hill), every
active employee's `termination_date` (445 NULLs), and `check_in` on absent days.

### 7.2 Three-valued logic (3VL)

Conditions evaluate to TRUE, FALSE, or **UNKNOWN**, and `WHERE` keeps only TRUE:

| Expression | Result |
|---|---|
| `NULL = NULL` | UNKNOWN (not TRUE!) |
| `NULL <> 5` | UNKNOWN |
| `320000 * NULL` | NULL (verified) |
| `TRUE OR UNKNOWN` | TRUE |
| `TRUE AND UNKNOWN` | UNKNOWN |
| `NOT UNKNOWN` | UNKNOWN |

🧠 **Analogy:** NULL is a sealed envelope. "Is the number in this envelope equal to the number in
that envelope?" — you can't say yes *or* no without opening them: UNKNOWN.

### 7.3 IS NULL / IS NOT NULL

```sql
-- WRONG — verified: 0 rows, silently
SELECT * FROM employees WHERE department_id = NULL;

-- RIGHT — verified: 1 row (the CEO)
SELECT employee_id, first_name, last_name
FROM employees WHERE department_id IS NULL;
```

`COALESCE(x, fallback)` / `IFNULL(x, fallback)` substitute a value — verified:
`WHERE COALESCE(commission_pct, 0) = 0` matches 389 employees (the 111 with a real commission
average 7.5%).

### 7.4 The NOT IN + NULL trap (interview classic)

```sql
-- Intent: employees who manage nobody.
-- WRONG — verified: returns 0  (!)
SELECT COUNT(*) FROM employees
WHERE employee_id NOT IN (SELECT manager_id FROM employees);

-- RIGHT — verified: 485
SELECT COUNT(*) FROM employees
WHERE employee_id NOT IN (SELECT manager_id FROM employees
                          WHERE manager_id IS NOT NULL);
```

**Why:** the subquery includes the CEO's `NULL` manager_id. `x NOT IN (a, b, NULL)` expands to
`x<>a AND x<>b AND x<>NULL`; the last term is UNKNOWN, so the whole `AND` chain can never be TRUE.
Zero rows, zero errors. The robust production fix is `NOT EXISTS` (chapter 3), which has no NULL
trap at all.

### 7.5 NULLs and aggregates / counts

Verified consistency check on the big table: `attendance` has 411 rows with `check_in IS NULL`,
and exactly 411 rows with `status = 'Absent'` — the NULLs are *meaningful* (no check-in when
absent), and `COUNT(check_in)` vs `COUNT(*)` measures exactly that gap.

---

## 8. Decision tree — which clause am I reaching for?

```
"I need data from a table"
 ├─ Only some ROWS?                → WHERE  (filter early; keep predicates sargable)
 ├─ Only some COLUMNS?             → explicit SELECT list (never * in production)
 ├─ Computed values?               → expressions + AS aliases
 ├─ Unique values only?
 │    ├─ …with counts/sums?        → GROUP BY  (chapter 2)
 │    └─ …just the values?         → DISTINCT
 ├─ A specific order?              → ORDER BY (else order is UNDEFINED)
 ├─ Only the first N?              → ORDER BY + LIMIT
 ├─ Page N of results?             → LIMIT/OFFSET (small N) · keyset pagination (production)
 └─ Rows where a value is missing? → IS NULL / IS NOT NULL (never = NULL)
```

---

## 9. Interview notes

**Guaranteed questions in this chapter's territory:**

| Question | Expected core answer | Senior-level follow-up |
|---|---|---|
| Why is `SELECT *` bad? | Network waste, breaks covering indexes, fragile to schema change | "When is it fine?" — ad-hoc exploration; `EXISTS (SELECT * …)` where the list is ignored |
| `WHERE` vs `HAVING`? | WHERE filters rows before grouping; HAVING filters groups after | Can HAVING use aliases? (engine-dependent); performance of filtering early |
| Why did my `= NULL` query return nothing? | 3VL: comparison yields UNKNOWN, WHERE keeps TRUE only | Walk through the `NOT IN` + NULL trap unprompted — instant credibility |
| `COUNT(*)` vs `COUNT(col)`? | rows vs non-NULL values | `COUNT(DISTINCT col)`; "is COUNT(1) faster?" — no |
| Find the 2nd-highest salary | (see challenge below) | "What if there are ties?" "What if there's only one salary?" |
| Is result order guaranteed without ORDER BY? | No — undefined, even if it looks stable | Why it can change: plans, parallelism, indexes |

**How interviewers trick you:** they hand you data containing NULLs (like this dataset's CEO row)
and ask for a negative ("employees who are NOT managers", "departments with NO employees"). Every
negative question over nullable data is secretly a NULL-handling question.

## 10. Exam notes

- Definition questions: state the clause's purpose + logical position (e.g., "WHERE performs row
  selection before grouping; HAVING after"). The keyword **three-valued logic** with the truth
  table earns full marks on any NULL question.
- Always mention *inclusive* for `BETWEEN`, *undefined order* for missing `ORDER BY`, and
  *whole-row deduplication* for `DISTINCT` — these are the marking-scheme keywords.
- When asked to "write a query", add a one-line comment stating intent; examiners award method
  marks even when syntax slips.
- Typical mark split (5-marker): 1 definition, 2 correct query, 1 explanation of evaluation
  order, 1 edge case (NULL/duplicates).

## 11. Practical notes (how developers actually write this)

- Column lists, always; one clause per line; commas at line ends; UPPERCASE keywords — matches
  every major style guide (and this repo's lesson code).
- Filter as early and as sargably as possible; the optimizer is good, but it can't index
  `STRFTIME('%Y', hire_date)`.
- Half-open date ranges (`>= start AND < next-start`) as the team convention ends all
  end-of-period bugs.
- `LIMIT` on every exploratory query against production-sized tables — the trainer's own UI caps
  *display* at 500 rows for the same reason (it never rewrites your query, it only truncates
  rendering).

---

## 12. Summary table

| Command | Use when | Avoid when | Best alternative |
|---|---|---|---|
| `SELECT *` | Ad-hoc exploration | Production code, INSERT…SELECT | Explicit column list |
| `WHERE` | Filtering rows | Filtering aggregate results | `HAVING` (ch. 2) |
| `BETWEEN` | Closed numeric/date ranges | Timestamp ranges | `>= a AND < b` (half-open) |
| `IN (list)` | Small enumerations | Negation over nullable subqueries | `NOT EXISTS` (ch. 3) |
| `LIKE 'x%'` | Prefix search | Leading-wildcard search at scale | Full-text index |
| `ORDER BY` | Any time order matters | Assuming implicit order | — (there is none) |
| `LIMIT/OFFSET` | Top-N, small pagination | Deep pagination | Keyset pagination |
| `DISTINCT` | Pure deduplication | When you also aggregate | `GROUP BY` |
| `= NULL` | **never** | always | `IS NULL` |

---

## 13. Practice questions

**Easy**
1. List every job title and grade, ordered by grade. *(jobs, ORDER BY)*
2. Show first name, last name, email of employees hired in 2023. *(BETWEEN or half-open range)*
3. Which distinct leave types exist in `leave_requests`? *(DISTINCT)*

**Medium**
4. Employees with a commission (`commission_pct > 0`): name, salary, commission amount in currency,
   highest first. *(expected: 111 rows; expression + alias + ORDER BY)*
5. Active Sales-department employees earning above 100,000. *(expected: 3 rows; parenthesize!)*
6. The 4th and 5th pages (page size 10) of employees ordered by `last_name, first_name`.

**Hard**
7. Employees whose last name ends in “son” hired before 2021, newest first. *(LIKE '%son' — 54 match
   the name pattern overall; why can't an index help this pattern?)*
8. Using only this chapter's tools: how many employees have **no** phone number vs. no
   `termination_date`? Explain why `COUNT(*) - COUNT(col)` answers it.
   *(verified: 0 and 445 — one of these columns turns out to have no NULLs at all, which is
   itself a data-profiling finding you'd report)*

**Interview-level**
9. Explain the exact result (and why) of:
   `SELECT COUNT(*) FROM employees WHERE employee_id NOT IN (SELECT manager_id FROM employees);`
   *(0 — the NULL trap, §7.4)*
10. Your teammate's report is sometimes ordered differently between runs; the query has no
    `ORDER BY` but "always worked". What do you tell them?

**Scenario**
11. HR asks: "a one-page report of everyone On Leave — name, department id, hire date, longest-
    serving first". Write it, then explain each clause's role in the logical evaluation order.
    *(expected: 15 rows)*

---

## 14. Challenge problem — 2nd-highest salary, four ways

> Classic interview question. All approaches verified on this dataset: the answer is **239729**
> (Jeffrey Doyle — the salary below the CEO's 320000).

```sql
-- A) Scalar subquery (most portable, ANSI-92)
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- B) DISTINCT + LIMIT/OFFSET (shortest; MySQL/SQLite/Postgres)
SELECT DISTINCT salary FROM employees
ORDER BY salary DESC LIMIT 1 OFFSET 1;

-- C) Window function (chapter 3 preview; generalizes to Nth)
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) WHERE rnk = 2;

-- D) Self-join (ancient interviews; know it exists)
SELECT MAX(e1.salary) FROM employees e1
JOIN employees e2 ON e1.salary < e2.salary;
```

| | A subquery | B LIMIT/OFFSET | C window | D self-join |
|---|---|---|---|---|
| Readability | good | best | good | poor |
| Handles ties | ✅ | ✅ (DISTINCT) | ✅ (DENSE_RANK) | ✅ |
| Generalizes to Nth | ❌ (nesting explodes) | ✅ `OFFSET n-1` | ✅✅ `rnk = n` | ❌ |
| Returns NULL vs empty if no 2nd | NULL | empty | empty | NULL |
| Portability | everywhere | not SQL Server | modern engines | everywhere |
| Performance | 2 aggregate passes | sort + early cut | one sort | ⚠️ O(n²) join |

**What a senior engineer picks:** **C** in any modern engine — it's the only one that survives the
inevitable follow-up ("now give me the Nth, per department") by changing one number and adding one
`PARTITION BY`. **A** is the safe answer when window functions are off the table. Mention the
ties/NULL edge cases *unprompted* — that's what separates the senior answer.

---

*Next chapter: [Aggregation & Joins](README.md) — GROUP BY/HAVING, every join type on the
employees→departments→locations chain, and the CEO row that makes INNER vs LEFT visible.*
