// Standalone validation of the generated browser database
// (public/hr_training.sqlite) against the supplied CSV files.
// Prints the full report incl. final per-table row counts; exit 1 on failure.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { parseCsv } from './csv.mjs';
import { TABLES, validateDatabase } from './validation-core.mjs';

const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = join(root, 'public', 'hr_training.sqlite');

if (!existsSync(dbPath)) {
  console.error('validate-db: public/hr_training.sqlite not found. Run `npm run build:db` first.');
  process.exit(1);
}

const csvRowCounts = {};
for (const table of TABLES) {
  const csvPath = join(root, 'data', 'csv', `${table}.csv`);
  if (!existsSync(csvPath)) {
    console.error(`validate-db: missing CSV file ${csvPath}`);
    process.exit(1);
  }
  const { rows } = parseCsv(readFileSync(csvPath, 'utf8'));
  csvRowCounts[table] = rows.filter((r) => !(r.length === 1 && r[0] === '')).length;
}

const SQL = await initSqlJs({
  locateFile: (f) => join(dirname(require.resolve('sql.js')), f)
});
const db = new SQL.Database(new Uint8Array(readFileSync(dbPath)));

const { ok, report, failures } = validateDatabase(db, csvRowCounts);
console.log(report);
db.close();

if (!ok) {
  console.error(`\nvalidate-db: FAILED (${failures.length} problem${failures.length === 1 ? '' : 's'}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nvalidate-db: all checks passed.');
