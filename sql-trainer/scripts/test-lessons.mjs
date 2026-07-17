// Tests EVERY runnable lesson example against the generated database.
//   - learning-mode examples run against a pristine copy
//   - sandbox-mode examples run sequentially against one sandbox copy
//     (lessons build on their own earlier examples, in order)
//   - examples marked expectError MUST fail; everything else MUST succeed
// Uses esbuild (already present via vite) to load the TS lesson modules.

import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');
const esbuild = require('esbuild');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = join(root, 'public', 'hr_training.sqlite');

if (!existsSync(dbPath)) {
  console.error('test-lessons: run `npm run build:db` first.');
  process.exit(1);
}

// bundle the lesson registry to a temp ESM file
const tmp = mkdtempSync(join(tmpdir(), 'lessons-'));
const outfile = join(tmp, 'lessons.mjs');
esbuild.buildSync({
  entryPoints: [join(root, 'src', 'lib', 'lessons', 'index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile
});
const { CATEGORIES } = await import(pathToFileURL(outfile).href);
rmSync(tmp, { recursive: true, force: true });

const SQL = await initSqlJs({
  locateFile: (f) => join(dirname(require.resolve('sql.js')), f)
});
const baseBytes = new Uint8Array(readFileSync(dbPath));

function fresh() {
  const db = new SQL.Database(baseBytes);
  db.run('PRAGMA foreign_keys = ON;');
  return db;
}

const learningDb = fresh();
const sandboxDb = fresh();

let pass = 0;
let fail = 0;
const failures = [];

for (const cat of CATEGORIES) {
  for (const lesson of cat.lessons) {
    for (const [i, section] of lesson.sections.entries()) {
      const ex = section.example;
      if (!ex) continue;
      const label = `${cat.id}/${lesson.id} §${i + 1}`;
      const db = ex.mode === 'sandbox' ? sandboxDb : learningDb;
      let threw = null;
      try {
        db.exec(ex.sql);
      } catch (e) {
        threw = e.message;
        // leave no open transaction behind
        try {
          db.run('ROLLBACK;');
        } catch {}
      }
      const wantError = Boolean(ex.expectError);
      const ok = wantError ? threw !== null : threw === null;
      if (ok) {
        pass += 1;
        console.log(`  ok   ${label}${wantError ? ' (failed as intended)' : ''}`);
      } else {
        fail += 1;
        const msg = wantError
          ? `${label} was expected to FAIL but succeeded`
          : `${label} FAILED: ${threw}\n        SQL: ${ex.sql.split('\n')[0]}…`;
        failures.push(msg);
        console.error(` FAIL  ${msg}`);
      }
    }
  }
}

learningDb.close();
sandboxDb.close();

console.log(`\ntest-lessons: ${pass} passed, ${fail} failed`);
if (fail > 0) {
  process.exit(1);
}
