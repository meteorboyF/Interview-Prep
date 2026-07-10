DBMS Interview Prep

# Transactions, Concurrency, Recovery, and Security

## Transactions and ACID

A transaction is a logical unit of work that either completes according to its commit rules or is rolled back.

- **Atomicity:** all effects commit or none do.
- **Consistency:** a committed transaction preserves declared invariants; application logic and constraints define those invariants.
- **Isolation:** concurrent transactions behave according to an isolation contract.
- **Durability:** committed effects survive acknowledged failures within the system's durability guarantees.

```sql
BEGIN;

UPDATE account SET balance = balance - 100 WHERE account_id = 1;
UPDATE account SET balance = balance + 100 WHERE account_id = 2;

COMMIT;
```

Check that both accounts exist and that debit rules hold. ACID does not automatically make incorrect business logic correct.

## Concurrency anomalies

- **Dirty read:** reading another transaction's uncommitted data.
- **Non-repeatable read:** rereading a row returns a different committed value.
- **Phantom:** rerunning a predicate returns a changed set of rows.
- **Lost update:** one write overwrites another without incorporating it.
- **Write skew:** concurrent transactions read a shared condition and update different rows, jointly violating an invariant.

## Isolation levels

The SQL names are:

- **Read Uncommitted:** may allow dirty reads.
- **Read Committed:** prevents dirty reads; statements may see different committed states.
- **Repeatable Read:** protects rows read during the transaction, but standard definitions may allow phantoms.
- **Serializable:** outcome is equivalent to some serial transaction order.

Real DBMS behavior differs. PostgreSQL Repeatable Read is snapshot isolation; MySQL InnoDB uses next-key locking in important cases; SQL Server offers lock-based and row-versioning options. State the standard model, then qualify the engine.

Higher isolation reduces anomalies but can increase blocking, aborts, or coordination. Use the weakest level that still protects the business invariant, and test the actual engine behavior.

## Locks and two-phase locking

Shared locks permit compatible reads; exclusive locks protect writes. Locks can exist at row, page, table, key-range, or metadata level. Intention locks coordinate hierarchical locking.

In **two-phase locking (2PL)**, a transaction has a growing phase that acquires locks and a shrinking phase that releases them. **Strict 2PL** holds write locks until commit or rollback, simplifying recovery and preventing cascading aborts.

Lock escalation can replace many fine-grained locks with a coarse lock to reduce lock-manager overhead, at the cost of concurrency.

## MVCC

Multi-Version Concurrency Control keeps row versions so readers can often access a consistent snapshot without blocking writers. Each transaction sees versions visible under its snapshot rules.

MVCC improves read/write concurrency but introduces version storage and cleanup. It does not eliminate write conflicts, deadlocks, or all anomalies—snapshot isolation can allow write skew unless the invariant is explicitly protected.

## Optimistic and pessimistic control

**Pessimistic concurrency** locks data before conflict, useful when conflicts are likely and retry is costly. `SELECT ... FOR UPDATE` is a common tool.

**Optimistic concurrency** assumes conflicts are uncommon and validates at write time, often using a version column:

```sql
UPDATE document
SET body = :body, version = version + 1
WHERE document_id = :id
  AND version = :expected_version;
```

If zero rows update, another writer changed the document and the application must retry or merge.

## Deadlocks

A deadlock occurs when transactions wait in a cycle. Necessary conditions are mutual exclusion, hold-and-wait, no preemption, and circular wait.

DBMSs detect wait cycles or use timeouts, choose a victim, roll it back, and return an error. Applications must be ready to retry the entire transaction.

Reduce deadlocks by:

- accessing shared resources in a consistent order;
- keeping transactions short;
- indexing predicates so fewer rows are locked;
- avoiding user/network waits inside transactions;
- using appropriate isolation and retry with backoff.

## Write-ahead logging and recovery

With Write-Ahead Logging (WAL), the log record describing a change reaches durable storage before the changed data page is written. On recovery, the DBMS can redo committed work and undo incomplete work, depending on its recovery algorithm.

A **checkpoint** records recovery progress so restart need not scan the entire historical log. It does not necessarily flush every page or replace backups.

Common log concepts include transaction begin/commit/abort records, before/after information, and Log Sequence Numbers. ARIES-style recovery uses analysis, redo, and undo phases with compensation log records.

## Backup, restore, and replication

- **Full backup:** complete protected dataset.
- **Incremental backup:** changes since a previous backup.
- **Differential backup:** changes since the latest full backup.
- **Point-in-time recovery:** restore a base backup and replay logs to a chosen time.

Backups are only trustworthy when restore procedures are tested.

Replication improves availability and read scale but is not a substitute for backups: accidental deletes and corruption can replicate. Synchronous replication waits for replica acknowledgment and offers stronger durability at higher latency; asynchronous replication is faster but may lose recent acknowledged primary changes during failover, depending on configuration.

## Partitioning and sharding

**Partitioning** splits one logical table into parts, often by range, list, or hash, while remaining within one database system. Partition pruning can skip irrelevant partitions.

**Sharding** distributes data across independent database nodes. It adds routing, rebalancing, cross-shard query/transaction, hotspot, and global-uniqueness challenges. A good shard key distributes load while keeping common operations local.

## Security essentials

- Use least privilege and role-based access control.
- Parameterize queries to prevent SQL injection.
- Encrypt in transit and at rest; manage keys separately.
- Mask or tokenize sensitive data where appropriate.
- Audit privileged and sensitive actions.
- Separate application, migration, reporting, and administration roles.
- Patch engines and drivers; rotate credentials.
- Define retention and deletion policies.

Views can expose limited columns/rows, but they are not a complete security boundary unless permissions prevent access to underlying objects. Row-level security can enforce policies inside the database.

## Transactions Interview Questions

**Q: Explain ACID with a money-transfer example.**

**A:** Atomicity applies debit and credit together; consistency preserves constraints such as allowed balances; isolation prevents harmful interference with concurrent transfers; durability preserves the committed transfer after failure.

**Q: What is the difference between a dirty read and a non-repeatable read?**

**A:** A dirty read observes uncommitted data that may roll back. A non-repeatable read observes different committed values for the same row within one transaction.

**Q: Does MVCC eliminate locks?**

**A:** No. It often lets readers avoid blocking writers, but writes, constraints, schema changes, and conflict management still require coordination or locks.

**Q: What is a deadlock and how should an application handle it?**

**A:** It is a cycle of transactions waiting for one another. The DBMS aborts a victim; the application should retry the complete idempotent transaction, ideally with bounded backoff.

**Q: Optimistic versus pessimistic locking?**

**A:** Pessimistic locking reserves data before modification. Optimistic control detects conflicts using a version or timestamp at write time. Choose based on conflict probability and retry cost.

**Q: What does write-ahead logging guarantee?**

**A:** Recovery information is made durable before the corresponding data page, enabling committed work to be redone and incomplete work to be undone after a crash.

**Q: Replication versus backup?**

**A:** Replication maintains live copies for availability/read scale, but logical mistakes can propagate. Backups preserve recoverable historical states. Robust systems need both.

**Q: What is the hardest part of sharding?**

**A:** Choosing and evolving a shard key while handling cross-shard operations, rebalancing, hotspots, global constraints, and failure recovery.

**Q: How can snapshot isolation still violate consistency?**

**A:** Two transactions can read the same snapshot and update different rows, so neither detects a direct write conflict although their combined changes violate a cross-row invariant—write skew.

