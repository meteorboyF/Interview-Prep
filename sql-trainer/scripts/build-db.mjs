// Builds the browser database: data/csv/*.csv -> public/hr_training.sqlite
// using the SQLite schema in src/lib/db/sqlite/. Validates the result and
// FAILS (exit 1) if the converted dataset is incomplete.
//
// Usage: node scripts/build-db.mjs [--skip-if-fresh]

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { parseCsv } from './csv.mjs';
import { TABLES, EXPECTED_COLUMNS, validateDatabase } from './validation-core.mjs';

const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const csvDir = join(root, 'data', 'csv');
const schemaPath = join(root, 'src', 'lib', 'db', 'sqlite', 'schema.sql');
const indexesPath = join(root, 'src', 'lib', 'db', 'sqlite', 'indexes.sql');
const outDir = join(root, 'public');
const outPath = join(outDir, 'hr_training.sqlite');
const metaPath = join(outDir, 'hr_training.meta.json');

const skipIfFresh = process.argv.includes('--skip-if-fresh');

function newestInputMtime() {
  const inputs = [schemaPath, indexesPath, ...TABLES.map((t) => join(csvDir, `${t}.csv`))];
  return Math.max(...inputs.map((f) => statSync(f).mtimeMs));
}

if (skipIfFresh && existsSync(outPath) && existsSync(metaPath)) {
  try {
    if (statSync(outPath).mtimeMs >= newestInputMtime()) {
      console.log('build-db: public/hr_training.sqlite is up to date, skipping.');
      process.exit(0);
    }
  } catch {
    // fall through and rebuild
  }
}

// Empty CSV fields become NULL; numeric-typed columns get real numbers.
function coerce(value, type) {
  if (value === '' || value === undefined) return null;
  if (type === 'INTEGER' || type === 'NUMERIC' || type === 'REAL') {
    const n = Number(value);
    if (Number.isNaN(n)) {
      throw new Error(`expected number, got ${JSON.stringify(value)}`);
    }
    return n;
  }
  return value;
}

const SQL = await initSqlJs({
  locateFile: (f) => join(dirname(require.resolve('sql.js')), f)
});
const db = new SQL.Database();

console.log('build-db: creating SQLite schema…');
db.run(readFileSync(schemaPath, 'utf8'));

console.log('build-db: importing CSV data…');
const csvRowCounts = {};
// FK enforcement stays off during bulk import (self-referencing manager_id);
// integrity is verified afterwards via PRAGMA foreign_key_check + SQL probes.
db.run('PRAGMA foreign_keys = OFF; BEGIN TRANSACTION;');
try {
  for (const table of TABLES) {
    const csvPath = join(csvDir, `${table}.csv`);
    if (!existsSync(csvPath)) {
      throw new Error(`missing CSV file: ${csvPath}`);
    }
    const { header, rows } = parseCsv(readFileSync(csvPath, 'utf8'));

    const expected = EXPECTED_COLUMNS[table];
    const missing = expected.filter((c) => !header.includes(c));
    if (missing.length) {
      throw new Error(`${table}.csv is missing expected columns: ${missing.join(', ')}`);
    }

    const info = db.exec(`PRAGMA table_info(${table})`)[0];
    const colTypes = Object.fromEntries(info.values.map((v) => [v[1], String(v[2]).toUpperCase()]));

    // Map by header name so CSV column order never matters.
    const cols = header.filter((h) => expected.includes(h));
    const stmt = db.prepare(
      `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`
    );
    let inserted = 0;
    try {
      for (const row of rows) {
        if (row.length === 1 && row[0] === '') continue; // stray blank line
        const values = cols.map((c) => {
          try {
            return coerce(row[header.indexOf(c)], colTypes[c]);
          } catch (e) {
            throw new Error(`${table}.csv row ${inserted + 2}, column ${c}: ${e.message}`);
          }
        });
        stmt.run(values);
        inserted += 1;
      }
    } finally {
      stmt.free();
    }
    csvRowCounts[table] = inserted;
    console.log(`  ${table.padEnd(22)} ${String(inserted).padStart(7)} rows`);
  }
  db.run('COMMIT;');
} catch (e) {
  db.run('ROLLBACK;');
  console.error(`build-db: FAILED during import: ${e.message}`);
  process.exit(1);
}

console.log('build-db: creating indexes…');
db.run(readFileSync(indexesPath, 'utf8'));
db.run('PRAGMA foreign_keys = ON;');

console.log('build-db: validating converted dataset…\n');
const { ok, report, failures, finalCounts } = validateDatabase(db, csvRowCounts);
console.log(report);

if (!ok) {
  console.error(`\nbuild-db: VALIDATION FAILED (${failures.length} problem${failures.length === 1 ? '' : 's'}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const bytes = db.export();
writeFileSync(outPath, Buffer.from(bytes));
writeFileSync(
  metaPath,
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      sizeBytes: bytes.length,
      rowCounts: finalCounts
    },
    null,
    2
  )
);
db.close();
console.log(`\nbuild-db: wrote ${outPath} (${(bytes.length / 1024 / 1024).toFixed(2)} MB)`);
