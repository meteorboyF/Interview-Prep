import type { LessonCategory } from './types';

export const transactions: LessonCategory = {
  id: 'transactions',
  title: 'Transactions & Concurrency',
  lessons: [
    {
      id: 'acid-transactions',
      title: 'Transactions & ACID',
      summary: 'Real BEGIN/COMMIT/ROLLBACK in the sandbox: a salary change plus its history entry succeed or fail as one unit.',
      sections: [
        {
          body: 'A transaction groups statements into an all-or-nothing unit. **A**tomicity (all or nothing), **C**onsistency (constraints hold before and after), **I**solation (concurrent transactions do not trample each other), **D**urability (committed means saved). The sandbox runs genuine SQLite transactions — atomicity, consistency and durability behave for real here; isolation needs multiple sessions and is simulated in the next lesson.'
        },
        {
          heading: 'Atomic salary update + history insert (ROLLBACK)',
          body: 'HR rule: a salary change must always write a salary_history row. A transaction makes the pair atomic. Watch the ROLLBACK erase both.',
          example: {
            mode: 'sandbox',
            sql: "SELECT salary FROM employees WHERE employee_id = 10;   -- before\n\nBEGIN;\nUPDATE employees SET salary = 150000 WHERE employee_id = 10;\nINSERT INTO salary_history (employee_id, old_salary, new_salary, change_date, change_reason)\nVALUES (10, 95695, 150000, DATE('now'), 'Promotion — atomic with the salary update');\n\nSELECT salary FROM employees WHERE employee_id = 10;   -- inside the transaction: 150000\nROLLBACK;\n\nSELECT salary FROM employees WHERE employee_id = 10;   -- after rollback: original value\nSELECT COUNT(*) AS history_rows_today FROM salary_history\nWHERE employee_id = 10 AND change_date = DATE('now');  -- 0 — the insert vanished too",
            mysqlSql: 'START TRANSACTION;   -- MySQL synonym for BEGIN\n-- … same statements …\nROLLBACK;',
            dialect: 'standard',
            note: 'Everything between BEGIN and ROLLBACK disappeared as a unit — atomicity.'
          }
        },
        {
          heading: 'The same pair, COMMITted',
          example: {
            mode: 'sandbox',
            sql: "BEGIN;\nUPDATE employees SET salary = 150000 WHERE employee_id = 10;\nINSERT INTO salary_history (employee_id, old_salary, new_salary, change_date, change_reason)\nVALUES (10, 95695, 150000, DATE('now'), 'Promotion');\nCOMMIT;\n\nSELECT e.salary, s.change_reason, s.change_date\nFROM employees e\nJOIN salary_history s ON s.employee_id = e.employee_id\nWHERE e.employee_id = 10\nORDER BY s.change_date DESC LIMIT 1;",
            dialect: 'standard',
            note: 'Committed — both rows persist (until you reset the sandbox). Undo last change still works: it snapshots around the whole batch.'
          }
        },
        {
          heading: 'Consistency: a transaction cannot dodge constraints',
          body: 'An employee transfer must point at a real department. The second UPDATE below hits a FOREIGN KEY error, the batch aborts, and the app rolls the open transaction back so nothing leaks.',
          example: {
            mode: 'sandbox',
            sql: "BEGIN;\nUPDATE employees SET department_id = 4 WHERE employee_id = 17;  -- valid transfer\nUPDATE employees SET department_id = 999 WHERE employee_id = 18; -- no such department → error",
            dialect: 'standard',
            expectError: true,
            note: 'The FOREIGN KEY error aborts the batch and the transaction is rolled back automatically. Run the next query to confirm the first (valid) UPDATE did not leak out either.'
          }
        },
        {
          heading: 'Verify: the partial transfer never happened',
          example: {
            mode: 'sandbox',
            sql: 'SELECT employee_id, department_id FROM employees WHERE employee_id IN (17, 18);',
            dialect: 'standard',
            note: 'Employee 17 is still in department 6 — the rollback undid the valid UPDATE too. All-or-nothing.'
          }
        }
      ]
    },
    {
      id: 'concurrency-phenomena',
      title: 'Concurrency phenomena (simulated)',
      summary: 'Dirty reads, non-repeatable reads, phantoms, lost updates, locks and deadlocks — visual timelines of what two real server sessions would experience.',
      sections: [
        {
          body: 'A browser SQLite instance has **one** connection, so real concurrent sessions cannot exist here — every timeline below is a **simulation** of two MySQL/InnoDB sessions. The SQL shown is what you would type into two terminal windows against a real server.'
        },
        {
          heading: 'Dirty read',
          concurrency: {
            title: 'Dirty read — reading uncommitted data (READ UNCOMMITTED)',
            steps: [
              { session: 'A', text: 'BEGIN;' },
              { session: 'A', text: "UPDATE employees SET salary = 200000 WHERE employee_id = 42;" },
              { session: 'B', text: 'SELECT salary FROM employees WHERE employee_id = 42;  → 200000', highlight: 'problem' },
              { session: 'DB', text: 'Session B just read data that was never committed.' },
              { session: 'A', text: 'ROLLBACK;  — the 200000 never existed' },
              { session: 'B', text: 'Pays a bonus based on a salary of 200000…', highlight: 'problem' }
            ],
            outcome: 'B acted on a value that was rolled back — a dirty read. Only possible at READ UNCOMMITTED isolation.',
            prevention: 'READ COMMITTED or stricter. InnoDB default (REPEATABLE READ) and SQLite never allow dirty reads.'
          }
        },
        {
          heading: 'Non-repeatable read',
          concurrency: {
            title: 'Non-repeatable read — same row, two answers (READ COMMITTED)',
            steps: [
              { session: 'A', text: 'BEGIN;' },
              { session: 'A', text: 'SELECT salary FROM employees WHERE employee_id = 42;  → 69010.74' },
              { session: 'B', text: 'UPDATE employees SET salary = 75000 WHERE employee_id = 42; COMMIT;', highlight: 'ok' },
              { session: 'A', text: 'SELECT salary FROM employees WHERE employee_id = 42;  → 75000', highlight: 'problem' },
              { session: 'DB', text: 'Same query, same transaction, different result.' }
            ],
            outcome: 'A read the row twice inside one transaction and got different values — a non-repeatable read.',
            prevention: 'REPEATABLE READ (InnoDB default) gives A a consistent snapshot: both reads return 69010.74.'
          }
        },
        {
          heading: 'Phantom read',
          concurrency: {
            title: 'Phantom read — new rows appear between identical queries',
            steps: [
              { session: 'A', text: "BEGIN; SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending';  → 177" },
              { session: 'B', text: "INSERT INTO leave_requests (…) VALUES (…, 'Pending'); COMMIT;", highlight: 'ok' },
              { session: 'A', text: "SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending';  → 178", highlight: 'problem' },
              { session: 'DB', text: 'A row that matches the WHERE clause materialized mid-transaction — a phantom.' }
            ],
            outcome: 'The set of matching rows changed between two identical queries in one transaction.',
            prevention: 'SERIALIZABLE isolation (or InnoDB gap locks under REPEATABLE READ) blocks the insert until A finishes.'
          }
        },
        {
          heading: 'Lost update',
          concurrency: {
            title: 'Lost update — two admins raise the same salary',
            steps: [
              { session: 'A', text: 'SELECT salary FROM employees WHERE employee_id = 42;  → 69010.74' },
              { session: 'B', text: 'SELECT salary FROM employees WHERE employee_id = 42;  → 69010.74' },
              { session: 'A', text: 'UPDATE employees SET salary = 69010.74 + 5000 WHERE employee_id = 42; COMMIT;' },
              { session: 'B', text: 'UPDATE employees SET salary = 69010.74 + 3000 WHERE employee_id = 42; COMMIT;', highlight: 'problem' },
              { session: 'DB', text: 'Final salary: 72010.74 — the 5000 raise is silently gone.' }
            ],
            outcome: "B's write, computed from a stale read, overwrote A's raise. No error was raised anywhere.",
            prevention: 'Atomic updates (SET salary = salary + 5000), SELECT … FOR UPDATE row locks, or optimistic version checks.'
          }
        },
        {
          heading: 'Locks & deadlock',
          concurrency: {
            title: 'Deadlock — two sessions, two rows, opposite order',
            steps: [
              { session: 'A', text: 'BEGIN; UPDATE employees SET salary = salary + 1 WHERE employee_id = 10;  (locks row 10)' },
              { session: 'B', text: 'BEGIN; UPDATE employees SET salary = salary + 1 WHERE employee_id = 20;  (locks row 20)' },
              { session: 'A', text: 'UPDATE employees SET salary = salary + 1 WHERE employee_id = 20;  — waits for B', highlight: 'problem' },
              { session: 'B', text: 'UPDATE employees SET salary = salary + 1 WHERE employee_id = 10;  — waits for A', highlight: 'problem' },
              { session: 'DB', text: 'Cycle detected. InnoDB kills one victim: "Deadlock found when trying to get lock; try restarting transaction".' },
              { session: 'B', text: 'ERROR 1213 — transaction rolled back. A proceeds and commits.', highlight: 'ok' }
            ],
            outcome: 'Each session held a lock the other needed — a cycle the engine breaks by rolling one back.',
            prevention: 'Acquire locks in a consistent order (always lowest employee_id first), keep transactions short, and retry on deadlock errors.'
          }
        },
        {
          heading: 'What SQLite itself does',
          body: 'SQLite uses **database-level locking** (or WAL mode with one writer + many readers) rather than row locks — writers simply wait on `SQLITE_BUSY` instead of deadlocking on rows. MySQL/InnoDB uses row-level locking + MVCC. Same ACID guarantees, very different concurrency machinery — never assume the two behave identically under load.'
        }
      ]
    }
  ]
};
