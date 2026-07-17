# HR SQL Trainer

Interactive DBMS & SQL learning app built on the supplied **HR training dataset** (~25,000 rows,
ten related tables). Every lesson — from `SELECT` basics through recursive CTEs, window functions,
transactions and `EXPLAIN` — runs real queries against this one dataset in an **in-browser SQLite
engine** (sql.js / WebAssembly) inside a Svelte 5 app.

The original dataset documentation is preserved unchanged at [data/README.md](data/README.md).

**Study notes:** [notes/](notes/README.md) — deep, engineer-thinking study chapters
(definition → when/when-not → comparisons → decision trees → interview & exam notes → verified
practice questions), all example results executed against this exact dataset.

## Quick start

```bash
npm install
npm run dev        # builds the browser DB if stale, then starts Vite on :5173
```

Other scripts:

```bash
npm run build:db      # data/csv/*.csv -> public/hr_training.sqlite (+ validation, fails on problems)
npm run validate:db   # standalone validation report incl. per-table row counts
npm run test:lessons  # executes all 99 runnable lesson examples against the built DB
npm run build         # build:db + test:lessons + vite build -> dist/
```

## The canonical dataset

The supplied files are preserved verbatim:

| Path | Contents |
|---|---|
| `data/mysql/hr_training_dataset.sql` | Canonical MySQL/MariaDB dump (schema + 25k rows + indexes) — never executed by the browser |
| `data/csv/*.csv` | The same data as ten flat CSVs — the import source for the browser DB |
| `data/README.md` | The dataset's original documentation |
| `hr_training_dataset.sql`, `hr_dataset_csv_files.zip`, root of repo | The untouched originals as delivered |

## Browser database pipeline

```
data/csv/*.csv ──▶ scripts/build-db.mjs ──▶ public/hr_training.sqlite ──▶ fetched once ──▶ Web Worker (sql.js WASM)
                        │                                                                    ├── learning DB (read-only, pristine)
                        └─ validation: tables, columns, PKs, FKs, indexes,                   └── sandbox DB (DML/DDL/tx, snapshot
                           row counts vs CSV, orphan checks, date parsing,                       undo, reset, restore)
                           canonical sample queries — exit 1 on any failure
```

MySQL → SQLite conversion rules live in `src/lib/db/sqlite/schema.sql` (types, auto-increment,
no `CREATE DATABASE`/`USE`); the five canonical indexes are mirrored in
`src/lib/db/sqlite/indexes.sql`. Conceptual (MySQL) types are kept as display metadata in
`src/lib/db/schemaMetadata.ts` so the schema explorer teaches both.

## App structure

```
src/lib/db/          database.ts (worker client, timeout + recovery), databaseWorker.ts (sql.js),
                     queryRunner.ts (statement classification, friendly errors), databaseReset.ts,
                     schemaMetadata.ts, sqlite/{schema,indexes}.sql
src/lib/lessons/     13 categories, 26 lessons, 99 runnable examples (all CI-tested)
src/lib/components/  SqlEditor, ResultsTable (pagination/truncation/CSV export), QueryPanel,
                     ExplainPlan (EXPLAIN QUERY PLAN visualizer), SchemaExplorer,
                     RelationshipDiagram, TableDetail, LessonView, ConcurrencySim (simulated
                     two-session timelines), NormalizationViz
```

### Modes and safety

- **Learning DB** — pristine, read-only; lessons always see predictable data.
- **Sandbox DB** — full DML/DDL/transactions on your own copy; *Undo last change* (snapshot),
  *Reset sandbox*, and *Restore original dataset* are always available.
- Queries run in a Web Worker with a 15 s limit; runaway queries terminate the worker and the
  engine recovers automatically from cached bytes.
- User SQL is **never rewritten**: `SELECT * FROM attendance` really returns 20,591 rows — only
  the rendering is capped (500 rows shown, labeled), and CSV export caps at 10,000 rows.
- MySQL-only commands (`CREATE DATABASE`, `USE`, `CURDATE()` …) produce teaching errors that
  name the SQLite equivalent instead of pretending to work.
