import type { LessonCategory } from './types';

export const indexing: LessonCategory = {
  id: 'indexing',
  title: 'Indexing & Optimization',
  lessons: [
    {
      id: 'explain-indexes',
      title: 'Indexes & EXPLAIN QUERY PLAN',
      summary: 'The 20,000-row attendance table plus the dataset\'s real indexes show full scans vs index searches, live.',
      sections: [
        {
          body: 'The dataset ships five indexes (created by the canonical MySQL file and mirrored in the browser database), including the composite `idx_attendance_employee_date ON attendance(employee_id, work_date)`. `EXPLAIN QUERY PLAN` shows how SQLite will execute a query. **MySQL\'s `EXPLAIN` output looks different** (access types like `ref`/`range`, key names, row estimates) — the concepts transfer, the format does not.'
        },
        {
          heading: 'Index search — filtering on indexed columns',
          example: {
            sql: "EXPLAIN QUERY PLAN\nSELECT *\nFROM attendance\nWHERE employee_id = 125\n  AND work_date BETWEEN '2026-05-01' AND '2026-05-31';",
            dialect: 'sqlite',
            note: 'SEARCH attendance USING INDEX idx_attendance_employee_date — the composite index narrows 20k rows to ~20 without touching the rest.'
          }
        },
        {
          heading: 'Full table scan — filtering on an unindexed column',
          body: '`status` has no index, so every one of the 20,591 rows must be examined.',
          example: {
            sql: "EXPLAIN QUERY PLAN\nSELECT * FROM attendance WHERE status = 'Late';",
            dialect: 'sqlite',
            note: 'SCAN attendance — the red flag. On 20k in-memory rows this is milliseconds; on 20 million disk rows it is an outage.'
          }
        },
        {
          heading: 'Feel the difference',
          body: 'Run both aggregates and compare the elapsed-ms readout (run each a few times; in-memory timings jitter). The indexed probe touches a handful of rows; the status filter reads all 20k.',
          example: {
            sql: "SELECT COUNT(*) AS may_days_emp125\nFROM attendance\nWHERE employee_id = 125 AND work_date BETWEEN '2026-05-01' AND '2026-05-31';\n\nSELECT COUNT(*) AS late_days_company\nFROM attendance\nWHERE status = 'Late';",
            dialect: 'standard'
          }
        },
        {
          heading: 'Composite index rules: leftmost prefix',
          body: 'The composite index is (employee_id, work_date). A filter on `employee_id` alone can use it; a filter on `work_date` alone cannot — the index is sorted by employee first.',
          example: {
            sql: "EXPLAIN QUERY PLAN SELECT * FROM attendance WHERE employee_id = 125;\nEXPLAIN QUERY PLAN SELECT * FROM attendance WHERE work_date = '2026-05-15';",
            dialect: 'sqlite',
            note: 'First: SEARCH … USING INDEX. Second: SCAN — work_date is not a leftmost prefix. Identical rule in MySQL.'
          }
        },
        {
          heading: 'Create your own index (sandbox)',
          body: 'Add the missing index and watch the same query flip from SCAN to SEARCH.',
          example: {
            mode: 'sandbox',
            sql: "EXPLAIN QUERY PLAN SELECT * FROM attendance WHERE status = 'Late';\n\nCREATE INDEX idx_attendance_status ON attendance(status);\n\nEXPLAIN QUERY PLAN SELECT * FROM attendance WHERE status = 'Late';",
            dialect: 'sqlite',
            note: 'Indexes are not free: every INSERT/UPDATE now maintains the extra B-tree, and low-selectivity columns (4 distinct statuses over 20k rows) often are not worth indexing. Reset the sandbox to remove it.'
          }
        }
      ]
    },
    {
      id: 'optimization-pagination',
      title: 'Query pipelines & large-result pagination',
      summary: 'Reading execution plans for joins and sorts, and paging through 20k attendance rows responsibly.',
      sections: [
        {
          heading: 'A join pipeline in the plan',
          body: 'Joins appear as nested loops: an outer SCAN/SEARCH feeding inner index lookups. Note how the employees PK and the attendance composite index are both used.',
          example: {
            sql: "EXPLAIN QUERY PLAN\nSELECT e.last_name, a.work_date, a.status\nFROM employees e\nJOIN attendance a ON a.employee_id = e.employee_id\nWHERE e.department_id = 1\n  AND a.work_date >= '2026-06-01';",
            dialect: 'sqlite',
            note: 'SEARCH e USING INDEX idx_employees_department, then SEARCH a USING INDEX idx_attendance_employee_date per employee — an indexed nested-loop join.'
          }
        },
        {
          heading: 'Sorts show up as TEMP B-TREE',
          body: 'ORDER BY on an unindexed expression forces a sort step. Ordering by indexed columns can ride the index for free.',
          example: {
            sql: 'EXPLAIN QUERY PLAN SELECT * FROM attendance ORDER BY check_in;\nEXPLAIN QUERY PLAN SELECT * FROM attendance WHERE employee_id = 125 ORDER BY work_date;',
            dialect: 'sqlite',
            note: 'First plan: USE TEMP B-TREE FOR ORDER BY. Second: no sort step — idx_attendance_employee_date already delivers rows in work_date order for that employee.'
          }
        },
        {
          heading: 'Pagination with LIMIT/OFFSET',
          body: 'Classic pagination. Works everywhere, but OFFSET must still *walk past* the skipped rows — page 400 is slower than page 1.',
          example: {
            sql: 'SELECT attendance_id, employee_id, work_date, status\nFROM attendance\nORDER BY work_date, attendance_id\nLIMIT 20 OFFSET 10000;',
            dialect: 'standard',
            note: 'The engine processed 10,020 rows to show you 20.'
          }
        },
        {
          heading: 'Keyset (seek) pagination',
          body: 'Remember the last key of the previous page and seek past it — constant-time paging used by every serious API.',
          example: {
            sql: "SELECT attendance_id, employee_id, work_date, status\nFROM attendance\nWHERE (work_date, attendance_id) > ('2026-06-01', 15000)\nORDER BY work_date, attendance_id\nLIMIT 20;",
            dialect: 'standard',
            note: 'Row-value comparison is supported by SQLite and MySQL 8+. The plan can seek directly instead of counting an OFFSET.'
          }
        },
        {
          heading: 'The UI is protected, your SQL is not rewritten',
          body: 'Try `SELECT * FROM attendance;` — the engine genuinely executes all 20,591 rows (see the row count), but only the first 500 are rendered and the truncation is labeled. Your query is never silently modified with a LIMIT; only the display is capped. Exports are capped at 10,000 rows.',
          example: {
            sql: 'SELECT * FROM attendance;',
            dialect: 'standard',
            note: 'Watch the banner: "20,591 rows — showing first 500". Real result, truncated rendering.'
          }
        }
      ]
    }
  ]
};
