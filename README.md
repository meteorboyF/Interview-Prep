# Interview Prep — DSA & DBMS Study Site

A fast, static study website for DSA, DBMS, and SQL interview preparation,
pairing comprehensive notes and active-recall questions with **interactive,
animated algorithm visualizers**.

**Live site:** https://meteorboyf.github.io/Interview-Prep

## Features

- **15 topic guides** — 9 DSA guides plus 6 comprehensive DBMS guides covering
  modeling, normalization, SQL, joins, indexing, transactions, and recovery.
- **18 interactive visualizers** with play / pause / step / reset / speed and
  keyboard shortcuts (`Space` play, `←`/`→` step, `R` reset):
  - Sorting (selection, bubble, insertion, merge, quick) & searching (linear, binary)
  - Linked lists (singly/doubly), stack, queue
  - Graphs (BFS/DFS/topological sort, editable), binary search trees + traversals
  - Greedy: fractional knapsack, activity selection, MST (Prim/Kruskal), Dijkstra
  - DP tables: 0/1 knapsack, LCS (+ traceback), matrix-chain, Bellman-Ford
  - KMP string matching with the LPS array
- **Complexity reference** — sortable/filterable Big-O tables (sorts by growth rate).
- **Flashcards** — click-to-reveal DSA and DBMS interview questions plus rapid-fire drills.
- **Extras** — full-text search (press `/`), dark/light mode, per-topic progress
  tracking (localStorage), copy-to-clipboard code buttons, sticky table of contents.

## Tech stack

- [Astro](https://astro.build) static site (zero backend) + [Svelte](https://svelte.dev) islands for visualizers
- [Shiki](https://shiki.style) syntax highlighting (dual light/dark themes)
- [Pagefind](https://pagefind.app) client-side full-text search
- Deployed to GitHub Pages via GitHub Actions

## HR SQL Trainer (`sql-trainer/`)

An interactive DBMS & SQL course that runs **real SQL in the browser** (SQLite via
sql.js/WebAssembly) against the supplied canonical HR training dataset (~25,000 rows,
ten related tables). 26 lessons across 13 categories — SELECT basics, NULL logic,
joins, subqueries, recursive CTEs, window functions, DML/DDL, transactions,
simulated concurrency, and `EXPLAIN`-based index lessons — plus a schema explorer
and a fully resettable sandbox.

**Live:** https://meteorboyf.github.io/Interview-Prep/sql-trainer/ (also in the site nav).
It is an independent Vite + Svelte app: see [sql-trainer/README.md](sql-trainer/README.md).
The deploy workflow builds it (dataset validation + 99 lesson-example tests must pass)
and merges its output into `dist/sql-trainer/`.

## Project structure

```
DSA 1/ , DSA 2/ , DBMS/    # source notes and supplied DBMS reference documents
scripts/ingest.mjs         # parses notes -> clean content + JSON data
sql-trainer/               # HR SQL Trainer app (own package.json; deployed under /sql-trainer/)
src/
  content/topics/          # generated DSA + DBMS topic markdown (rebuilt on build)
  data/generated/          # generated JSON: topics, questions, complexity (gitignored)
  components/viz/           # the 18 Svelte visualizers + shared Player engine
  lib/algos/               # pure TS frame-generators (sorting, graph, bst, dp, weighted)
  pages/                   # landing, topics, visualize, complexity, questions
```

## Local development

```bash
npm install
npm run dev        # runs the ingest step, then starts Astro at http://localhost:4321/Interview-Prep
npm run build      # ingest -> astro build -> pagefind search index (output in dist/)
npm run preview    # serve the production build locally
```

## How the notes are processed

The source exports store code blocks as single-cell markdown tables with
collapsed newlines and backslash-escaped punctuation. `scripts/ingest.mjs`
reconstructs clean, indented fenced code blocks from them **without changing any
algorithm logic** — only whitespace/escaping destroyed by the export is restored.
Prose and data tables use standard CommonMark escapes and pass through untouched.

## License

Educational use. Notes © their original author.
