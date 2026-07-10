DBMS Interview Prep

# Indexes and Query Optimization

## What an index does

An index is an auxiliary data structure that helps locate rows without scanning every table page. It trades extra storage and write work for faster reads. Every insert, delete, and indexed-column update may also modify indexes.

An index is not automatically useful. The optimizer chooses it when estimated index traversal plus row lookup costs less than alternatives such as a sequential scan.

## B+ tree indexes

Most general-purpose relational indexes use B+ trees. Internal nodes guide navigation; leaf nodes contain ordered keys and row locators, often linked for range scans.

They support:

- equality lookup
- range predicates (`<`, `>`, `BETWEEN`)
- prefix matching such as `LIKE 'abc%'`
- ordered scans and sometimes `ORDER BY`
- minimum/maximum and prefix grouping

High fan-out keeps the tree shallow, so lookup is approximately logarithmic in the number of entries and usually requires few page reads.

## Hash indexes

Hash indexes map a key to a bucket and are suited to equality lookup. They generally do not preserve order and therefore do not naturally support range scans or ordered output. Exact availability and behavior vary by DBMS.

## Clustered and nonclustered indexes

A **clustered index** determines or closely corresponds to the physical/primary storage order of rows. A table can have only one such ordering. A **nonclustered/secondary index** is separate and stores keys plus locators to rows.

Terminology differs across products: InnoDB organizes table data by primary key; PostgreSQL heap tables are separate from B-tree indexes; SQL Server explicitly distinguishes clustered and nonclustered indexes. Explain the concept, then qualify product-specific behavior.

## Composite indexes and the leftmost prefix

```sql
CREATE INDEX idx_orders_customer_status_date
ON orders (customer_id, status, created_at);
```

This can efficiently support predicates beginning with `customer_id`, and often `customer_id + status`, or all three. It usually cannot seek efficiently on `status` alone because the leading key is absent.

Choose column order based on query patterns:

1. equality predicates commonly come first;
2. then range predicates;
3. consider ordering/grouping needs;
4. balance selectivity, reuse, and write cost.

The simple advice “put the most selective column first” is incomplete; prefix usability and actual predicates matter more.

## Covering, partial, expression, and unique indexes

- **Covering index:** contains every column a query needs, avoiding a table lookup.
- **Included columns:** stored at leaves for coverage without participating in key order (product-specific).
- **Partial/filtered index:** indexes rows satisfying a predicate, useful for small active subsets.
- **Expression/function index:** indexes a computed expression such as `LOWER(email)`.
- **Unique index:** enforces uniqueness while accelerating lookup.

Avoid excessive coverage: wide indexes consume cache, storage, and write bandwidth.

## Selectivity and cardinality

**Cardinality** is the number of distinct values. **Selectivity** approximates the fraction of rows a predicate returns. An index on a near-unique email is often selective; an index on a boolean may not be, unless a partial index targets a rare value.

Even a low-cardinality column can be useful as part of a composite index or in analytics-oriented bitmap indexing. Workload context matters.

## Sargability

A predicate is sargable when it can be used as an efficient index search argument.

```sql
-- Often non-sargable
WHERE LOWER(email) = 'a@example.com'
WHERE EXTRACT(YEAR FROM created_at) = 2026
WHERE amount + 10 > 100

-- More index-friendly
WHERE email_normalized = 'a@example.com'
WHERE created_at >= DATE '2026-01-01'
  AND created_at <  DATE '2027-01-01'
WHERE amount > 90
```

An expression index can make a function predicate searchable, but queries must match the indexed expression.

## Query optimizer and execution plans

SQL is declarative. The optimizer transforms equivalent expressions and estimates the cost of scan types, join orders, join algorithms, sorts, and aggregation strategies.

Statistics typically include row counts, distinct-value estimates, null fractions, and histograms. Stale or insufficient statistics can cause bad cardinality estimates, leading to unsuitable join order, memory grants, or scan choices.

Use `EXPLAIN` to inspect the estimated plan and `EXPLAIN ANALYZE` (or product equivalent) to execute and compare estimates with actual rows and time. Be cautious: analyzing a write statement may actually modify data.

Look for:

- large differences between estimated and actual rows;
- full scans of large tables when few rows are needed;
- repeated inner operations in nested loops;
- expensive sorts or disk spills;
- filters applied late;
- implicit type conversions;
- missing or unused indexes;
- time concentrated in one operator.

## A disciplined tuning workflow

1. Define the latency/throughput problem and capture a representative query.
2. Measure baseline time, rows, calls, I/O, CPU, and lock waits.
3. Confirm correctness and required output grain.
4. Inspect the actual execution plan.
5. Check estimates and statistics.
6. Reduce unnecessary rows and columns early where semantics allow.
7. consider an appropriate index or query rewrite.
8. Retest with realistic data and parameters.
9. Measure write/storage regression and monitor after deployment.

Do not blindly add every “missing index” suggestion. Similar indexes overlap, and every index has a maintenance cost.

## Common performance traps

- leading-wildcard search: `LIKE '%term'` cannot normally use a standard B-tree seek;
- implicit conversion between mismatched join/filter types;
- N+1 queries from application code;
- deep `OFFSET` pagination, which repeatedly scans/skips earlier rows;
- retrieving large unused columns;
- correlated row-by-row work that can be set-based;
- indexing every column independently instead of designing for whole queries;
- parameter-sensitive plans when data distribution is skewed.

For scalable pagination, use keyset/seek pagination:

```sql
SELECT order_id, created_at, total
FROM orders
WHERE (created_at, order_id) < (:last_created_at, :last_order_id)
ORDER BY created_at DESC, order_id DESC
LIMIT 50;
```

## Indexing Interview Questions

**Q: Why not create an index on every column?**

**A:** Indexes consume storage and cache, slow writes, add maintenance, and can complicate optimization. Create indexes for demonstrated access paths and constraints.

**Q: Why might a database ignore an available index?**

**A:** The predicate returns much of the table, the table is small, statistics predict a scan is cheaper, the predicate is non-sargable, types mismatch, or the index does not match the useful leading keys.

**Q: What is a covering index?**

**A:** It contains all columns required by a query, allowing the result to be produced from the index without fetching base-table rows.

**Q: Explain the leftmost-prefix rule.**

**A:** A composite B-tree is ordered first by its first key, then subsequent keys within equal prefixes. Efficient seeks generally require constraints beginning with the leading key columns.

**Q: Clustered versus nonclustered index?**

**A:** A clustered organization determines the row storage order or primary row organization; a nonclustered index is separate and points to rows. Exact implementation is DBMS-specific.

**Q: What is selectivity?**

**A:** It describes how narrowly a predicate filters rows. Highly selective predicates return a small fraction and are often good candidates for index seeks.

**Q: What is a sargable predicate?**

**A:** One the engine can turn into an index search range rather than evaluating a function or expression for every row.

**Q: How do you troubleshoot a slow query?**

**A:** Measure it, inspect the actual plan and row estimates, check I/O and waits, verify statistics, locate the dominant operator, make one evidence-based change, and retest with representative data.

