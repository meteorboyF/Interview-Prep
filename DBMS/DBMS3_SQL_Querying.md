DBMS Interview Prep

# SQL Querying and Aggregation

## Logical query processing order

SQL is written as `SELECT ... FROM ... WHERE ...`, but conceptually evaluated in this order:

1. `FROM` and `JOIN`
2. `WHERE`
3. `GROUP BY`
4. `HAVING`
5. `SELECT`
6. `DISTINCT`
7. `ORDER BY`
8. `LIMIT` / `OFFSET`

This explains why a `SELECT` alias is usually unavailable in `WHERE`: the filter is logically evaluated earlier.

## SELECT, filtering, and sorting

```sql
SELECT claim_id, patient_id, amount, status
FROM claims
WHERE status IN ('Denied', 'Pending')
  AND amount BETWEEN 100 AND 500
ORDER BY amount DESC, claim_id
LIMIT 10;
```

Prefer explicit columns over `SELECT *` in application code: it documents the contract, reduces transferred data, and avoids breaking consumers when columns change.

Operator precedence is `NOT`, then `AND`, then `OR`. Use parentheses whenever business logic mixes `AND` and `OR`.

## NULL and three-valued logic

NULL represents missing or unknown information. Comparisons with NULL produce `UNKNOWN`, not true or false.

```sql
-- Correct
WHERE submitted_date IS NULL

-- Incorrect: never true
WHERE submitted_date = NULL
```

`COUNT(*)` counts rows; `COUNT(column)` counts non-NULL values. Most aggregates ignore NULL. `COALESCE(value, fallback)` returns the first non-NULL expression.

Beware `NOT IN` when its list or subquery contains NULL: the result can become UNKNOWN for every row. Prefer `NOT EXISTS` or explicitly exclude NULL.

## CASE and conditional logic

```sql
SELECT claim_id,
       amount,
       CASE
         WHEN amount >= 1000 THEN 'High'
         WHEN amount >= 250  THEN 'Medium'
         ELSE 'Low'
       END AS value_band
FROM claims;
```

Conditional aggregation is a central interview pattern:

```sql
SELECT payer_id,
       COUNT(*) AS total_claims,
       SUM(CASE WHEN status = 'Denied' THEN 1 ELSE 0 END) AS denied_claims,
       AVG(CASE WHEN status = 'Denied' THEN amount END) AS avg_denied_amount
FROM claims
GROUP BY payer_id;
```

## Aggregation, GROUP BY, and HAVING

`WHERE` filters rows before grouping. `HAVING` filters groups after aggregation.

```sql
SELECT payer_id,
       COUNT(*) AS claim_count,
       SUM(amount) AS billed,
       AVG(amount) AS average_claim
FROM claims
WHERE claim_date >= DATE '2024-01-01'
GROUP BY payer_id
HAVING COUNT(*) >= 5
ORDER BY billed DESC;
```

Every selected expression must normally be aggregated or functionally dependent on the `GROUP BY` columns. Some DBMSs enforce this more strictly than others; write portable, explicit SQL.

Common aggregates are `COUNT`, `SUM`, `AVG`, `MIN`, and `MAX`. `COUNT(DISTINCT payer_id)` counts unique non-NULL payer IDs.

## String, date, and numeric operations

Functions vary across DBMSs, but recurring ideas include:

- String: `LOWER`, `UPPER`, `TRIM`, `SUBSTRING`, `CONCAT`, length.
- Date/time: current timestamp, extraction of year/month, interval arithmetic.
- Numeric: `ROUND`, `ABS`, `CEIL`, `FLOOR`.
- Conversion: `CAST(expression AS type)`.

Avoid wrapping indexed filter columns in functions when an equivalent range predicate is possible. `WHERE YEAR(created_at)=2026` may prevent an index range scan; prefer `created_at >= '2026-01-01' AND created_at < '2027-01-01'`.

## Window functions

Window functions compute across related rows without collapsing them into one row per group.

```sql
SELECT employee_id,
       department_id,
       salary,
       AVG(salary) OVER (PARTITION BY department_id) AS dept_avg,
       RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS salary_rank
FROM employee;
```

- `ROW_NUMBER`: unique sequential number; ties are arbitrarily ordered unless ordering is deterministic.
- `RANK`: ties share a rank and leave gaps.
- `DENSE_RANK`: ties share a rank without gaps.
- `LAG` / `LEAD`: access previous or next row.
- Running total: `SUM(amount) OVER (PARTITION BY account_id ORDER BY occurred_at)`.

The window frame matters. For a row-by-row running total, state `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` when peer behavior must be unambiguous.

## Top-N per group

```sql
WITH ranked AS (
  SELECT e.*,
         ROW_NUMBER() OVER (
           PARTITION BY department_id
           ORDER BY salary DESC, employee_id
         ) AS rn
  FROM employee e
)
SELECT *
FROM ranked
WHERE rn <= 3;
```

This pattern is more reliable than a global `LIMIT`, which returns top rows across the entire result rather than within each group.

## DDL, DML, DCL, and TCL

- **DDL:** `CREATE`, `ALTER`, `DROP`, `TRUNCATE` define structure.
- **DML:** `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE` manipulate data.
- **DCL:** `GRANT`, `REVOKE` control privileges.
- **TCL:** `COMMIT`, `ROLLBACK`, `SAVEPOINT` control transactions.

`DELETE` can filter rows and is logged transactionally. `TRUNCATE` removes all rows using a DBMS-specific optimized operation and often resets identity state. `DROP` removes the object definition itself. Exact transaction behavior varies by product.

## Safe writes

```sql
UPDATE account
SET status = 'inactive'
WHERE last_login_at < DATE '2024-01-01';
```

Before a large write, run the same predicate as a `SELECT`, check the affected-row estimate, use a transaction, preserve a rollback path, and consider batching to reduce lock duration and log growth.

## SQL Querying Interview Questions

**Q: What is the difference between WHERE and HAVING?**

**A:** WHERE filters individual rows before grouping; HAVING filters groups after aggregate values have been computed.

**Q: Why does `column = NULL` not work?**

**A:** NULL means unknown, so equality produces UNKNOWN. Use `IS NULL` or `IS NOT NULL`.

**Q: COUNT(*) versus COUNT(column)?**

**A:** COUNT(*) counts rows. COUNT(column) counts rows where that column is non-NULL.

**Q: GROUP BY versus window functions?**

**A:** GROUP BY collapses rows to one result row per group. Window functions retain each row while adding group-level or ordered calculations.

**Q: RANK versus DENSE_RANK versus ROW_NUMBER?**

**A:** ROW_NUMBER assigns unique numbers. RANK gives ties the same rank and leaves gaps. DENSE_RANK gives ties the same rank without gaps.

**Q: How do you find the second-highest salary?**

**A:** Use `DENSE_RANK() OVER (ORDER BY salary DESC)` and filter rank 2 when the second distinct salary is desired. Clarify how ties should be handled.

**Q: Why can NOT IN be dangerous?**

**A:** If the compared set contains NULL, three-valued logic can make every comparison UNKNOWN. NOT EXISTS is usually safer.

**Q: What is SQL injection and how do you prevent it?**

**A:** It is unintended SQL structure introduced through untrusted input. Use parameterized queries, least privilege, input validation for non-parameterizable identifiers, and never build SQL by string concatenation.

