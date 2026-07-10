DBMS Interview Prep

# Joins, Subqueries, CTEs, and Set Operations

## Join mental model

A join combines rows according to a predicate. Always reason about the intended output grain—one row per customer, order, or item—and the cardinality of both inputs. Unexpected duplicates usually mean a one-to-many relationship was treated as one-to-one or the join predicate is incomplete.

```sql
SELECT c.customer_id, c.name, o.order_id, o.total
FROM customer c
JOIN orders o ON o.customer_id = c.customer_id;
```

## Join types

- **INNER JOIN:** only matching pairs.
- **LEFT JOIN:** every left row; unmatched right columns become NULL.
- **RIGHT JOIN:** symmetric to left join and usually expressible by swapping inputs.
- **FULL OUTER JOIN:** matched rows plus unmatched rows from both sides.
- **CROSS JOIN:** Cartesian product.
- **SELF JOIN:** table joined to itself, such as employee to manager.

```sql
SELECT e.name AS employee, m.name AS manager
FROM employee e
LEFT JOIN employee m ON m.employee_id = e.manager_id;
```

## The outer-join filter trap

```sql
-- This removes unmatched customers and behaves like an inner join
SELECT c.*, o.*
FROM customer c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'open';

-- Keep every customer; only matching open orders are attached
SELECT c.*, o.*
FROM customer c
LEFT JOIN orders o
  ON o.customer_id = c.customer_id
 AND o.status = 'open';
```

Predicates in `ON` determine matching. Predicates in `WHERE` filter the joined result.

## Semi-joins and anti-joins

Use `EXISTS` to ask whether at least one related row exists without multiplying the left side.

```sql
SELECT c.*
FROM customer c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.customer_id
);
```

Use `NOT EXISTS` for rows with no match:

```sql
SELECT c.*
FROM customer c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.customer_id
);
```

This is NULL-safe and clearly expresses an anti-join.

## Subquery categories

- **Scalar subquery:** returns one value; usable where a scalar expression is allowed.
- **Multirow subquery:** paired with `IN`, `ANY`, or `ALL`.
- **Derived table:** subquery in `FROM`; must have an alias.
- **Correlated subquery:** references the current outer row and is logically evaluated per outer row.

```sql
SELECT e.employee_id, e.salary
FROM employee e
WHERE e.salary > (
  SELECT AVG(e2.salary)
  FROM employee e2
  WHERE e2.department_id = e.department_id
);
```

An optimizer may decorrelate this, but a join to a grouped result is often easier to reason about and tune.

## CTEs

A Common Table Expression names an intermediate result for one statement.

```sql
WITH department_average AS (
  SELECT department_id, AVG(salary) AS avg_salary
  FROM employee
  GROUP BY department_id
)
SELECT e.employee_id, e.salary, d.avg_salary
FROM employee e
JOIN department_average d USING (department_id)
WHERE e.salary > d.avg_salary;
```

CTEs improve readability and can be referenced more than once. They do not persist after the statement. Whether they are inlined or materialized depends on the DBMS, version, and query, so a CTE is not automatically faster or slower.

## Recursive CTEs

Recursive CTEs contain an anchor query and a recursive query connected by `UNION ALL`.

```sql
WITH RECURSIVE org AS (
  SELECT employee_id, manager_id, name, 0 AS depth
  FROM employee
  WHERE manager_id IS NULL

  UNION ALL

  SELECT e.employee_id, e.manager_id, e.name, o.depth + 1
  FROM employee e
  JOIN org o ON e.manager_id = o.employee_id
)
SELECT * FROM org ORDER BY depth, employee_id;
```

Production recursion needs cycle protection and a sensible depth limit when the data may be malformed.

## Set operations

- `UNION`: combines compatible results and removes duplicates.
- `UNION ALL`: combines results and retains duplicates; usually faster.
- `INTERSECT`: rows present in both results.
- `EXCEPT` / `MINUS`: rows in the first result but not the second.

Inputs need the same number of columns with compatible types. Column names usually come from the first query. Use `UNION ALL` unless deduplication is required.

## Join algorithms

The optimizer can implement a logical join using:

- **Nested-loop join:** good when the outer side is small and the inner side has an index.
- **Hash join:** good for large equality joins; builds a hash table on one input.
- **Merge join:** good when both inputs are ordered by the join keys; supports equality and some range patterns.

Logical SQL does not dictate the physical join algorithm. Statistics, indexes, memory, and row estimates guide the optimizer.

## Common interview query patterns

### Customers with more than three orders

```sql
SELECT c.customer_id, c.name, COUNT(*) AS order_count
FROM customer c
JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
HAVING COUNT(*) > 3;
```

### Find duplicate business keys

```sql
SELECT email, COUNT(*) AS copies
FROM customer
GROUP BY email
HAVING COUNT(*) > 1;
```

### Delete duplicates while keeping one row

Rank duplicates deterministically inside a transaction, inspect the result, then delete rows whose row number exceeds one. Syntax for deleting from a ranked CTE varies by DBMS.

## Joins and Subqueries Interview Questions

**Q: INNER JOIN versus LEFT JOIN?**

**A:** INNER JOIN returns matching pairs only. LEFT JOIN preserves every left row and fills right-side columns with NULL when there is no match.

**Q: Why can a join unexpectedly duplicate rows?**

**A:** The relationship is one-to-many or many-to-many, or the predicate omits part of a composite key. Inspect key uniqueness and define the desired output grain.

**Q: EXISTS versus IN?**

**A:** Both can express membership and optimizers often produce similar plans. EXISTS naturally expresses existence and is safe for correlated checks; NOT EXISTS avoids the NULL trap of NOT IN.

**Q: Correlated versus non-correlated subquery?**

**A:** A correlated subquery references an outer-row value and is logically evaluated for each outer row. A non-correlated subquery is independent and can be evaluated once.

**Q: CTE versus temporary table?**

**A:** A CTE exists for one statement and is primarily a query-structuring tool. A temporary table persists for a session or transaction, can often be indexed, and is useful when materialized intermediate data is reused.

**Q: UNION versus UNION ALL?**

**A:** UNION removes duplicates, requiring extra work. UNION ALL preserves all rows and is preferred when deduplication is unnecessary.

**Q: What is a self join?**

**A:** It joins a table to another logical instance of itself, commonly for hierarchies such as employee-to-manager relationships.

**Q: What is the difference between ON and WHERE in an outer join?**

**A:** ON controls which rows match while preserving the outer side. A WHERE predicate on nullable right-side columns can remove unmatched rows and effectively turn the result into an inner join.

