// Statement classification + friendly error handling shared by the worker
// (guarding learning mode, undo snapshots) and the UI (labels, hints).

export type StatementKind =
  | 'read'        // SELECT / WITH…SELECT / EXPLAIN / PRAGMA read / VALUES
  | 'write'       // INSERT / UPDATE / DELETE / REPLACE / WITH…(write)
  | 'ddl'         // CREATE / ALTER / DROP TABLE|INDEX|VIEW|TRIGGER
  | 'transaction' // BEGIN / COMMIT / ROLLBACK / SAVEPOINT / RELEASE
  | 'mysql-only'  // CREATE DATABASE / DROP DATABASE / USE …
  | 'blocked';    // ATTACH / DETACH / VACUUM INTO etc.

export interface ClassifiedSql {
  kind: StatementKind;
  mutates: boolean; // anything that can change database state
}

/** Strip -- and C-style comments plus leading whitespace so the first keyword is real. */
export function stripLeadingComments(sql: string): string {
  let s = sql;
  for (;;) {
    const t = s.replace(/^\s+/, '');
    if (t.startsWith('--')) {
      const nl = t.indexOf('\n');
      if (nl === -1) return '';
      s = t.slice(nl + 1);
    } else if (t.startsWith('/*')) {
      const end = t.indexOf('*/');
      if (end === -1) return '';
      s = t.slice(end + 2);
    } else {
      return t;
    }
  }
}

const WRITE_RE = /\b(INSERT|UPDATE|DELETE|REPLACE)\b/i;

export function classifySql(sql: string): ClassifiedSql {
  const s = stripLeadingComments(sql);
  const first = (s.match(/^[A-Za-z]+/) ?? [''])[0].toUpperCase();

  if (first === 'USE') return { kind: 'mysql-only', mutates: false };
  if ((first === 'CREATE' || first === 'DROP') && /^\s*\w+\s+(DATABASE|SCHEMA)\b/i.test(s.slice(first.length)))
    return { kind: 'mysql-only', mutates: false };

  if (first === 'ATTACH' || first === 'DETACH') return { kind: 'blocked', mutates: false };

  switch (first) {
    case 'SELECT':
    case 'VALUES':
    case 'EXPLAIN':
      return { kind: 'read', mutates: false };
    case 'PRAGMA':
      // treat value-setting pragmas as mutating, bare reads as reads
      return { kind: 'read', mutates: /=/.test(s) };
    case 'WITH':
      // WITH … can end in a write statement in SQLite
      return WRITE_RE.test(s) ? { kind: 'write', mutates: true } : { kind: 'read', mutates: false };
    case 'INSERT':
    case 'UPDATE':
    case 'DELETE':
    case 'REPLACE':
      return { kind: 'write', mutates: true };
    case 'CREATE':
    case 'ALTER':
    case 'DROP':
      return { kind: 'ddl', mutates: true };
    case 'BEGIN':
    case 'COMMIT':
    case 'END':
    case 'ROLLBACK':
    case 'SAVEPOINT':
    case 'RELEASE':
      return { kind: 'transaction', mutates: true };
    case 'VACUUM':
    case 'REINDEX':
    case 'ANALYZE':
      return { kind: 'ddl', mutates: true };
    default:
      // unknown → let SQLite produce the real error, assume it could mutate
      return { kind: 'write', mutates: true };
  }
}

/** Does this batch contain anything that can change database state? */
export function batchMutates(sql: string): boolean {
  // conservative: if any write/ddl/transaction keyword appears as a statement head
  return splitish(sql).some((stmt) => classifySql(stmt).mutates);
}

/** Cheap statement splitter for classification only (the engine does real parsing).
 *  Respects quotes and comments; good enough to find statement heads. */
export function splitish(sql: string): string[] {
  const out: string[] = [];
  let cur = '';
  let i = 0;
  const n = sql.length;
  let mode: 'code' | 'sq' | 'dq' | 'line' | 'block' = 'code';
  while (i < n) {
    const c = sql[i];
    const c2 = sql.slice(i, i + 2);
    if (mode === 'code') {
      if (c === "'") mode = 'sq';
      else if (c === '"') mode = 'dq';
      else if (c2 === '--') mode = 'line';
      else if (c2 === '/*') mode = 'block';
      else if (c === ';') {
        if (cur.trim()) out.push(cur);
        cur = '';
        i += 1;
        continue;
      }
    } else if (mode === 'sq' && c === "'") mode = 'code';
    else if (mode === 'dq' && c === '"') mode = 'code';
    else if (mode === 'line' && c === '\n') mode = 'code';
    else if (mode === 'block' && c2 === '*/') {
      cur += c2;
      i += 2;
      mode = 'code';
      continue;
    }
    cur += c;
    i += 1;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/** Turn raw SQLite errors into friendlier, teaching-oriented messages. */
export function friendlyError(message: string): { message: string; hint?: string } {
  const m = message ?? 'Unknown database error';
  const table = m.match(/no such table: (\w+)/i);
  if (table)
    return {
      message: `Table "${table[1]}" does not exist.`,
      hint: 'Check the Dataset Explorer for the ten HR tables (e.g. employees, departments, attendance). In sandbox mode you may also have dropped or not yet created it.'
    };
  const col = m.match(/no such column: ([\w.]+)/i);
  if (col)
    return {
      message: `Column "${col[1]}" does not exist.`,
      hint: 'Open the table in the Dataset Explorer to see its exact column names.'
    };
  if (/no such function: (\w+)/i.test(m)) {
    const fn = m.match(/no such function: (\w+)/i)![1].toUpperCase();
    const map: Record<string, string> = {
      CURDATE: "DATE('now')",
      NOW: "DATETIME('now')",
      DATEDIFF: 'JULIANDAY(end_date) - JULIANDAY(start_date)',
      YEAR: "STRFTIME('%Y', date_value)",
      MONTH: "STRFTIME('%m', date_value)",
      DAY: "STRFTIME('%d', date_value)",
      DATE_FORMAT: 'STRFTIME(format, date_value)',
      CONCAT: "the || operator, e.g. first_name || ' ' || last_name",
      TIMESTAMPDIFF: 'a JULIANDAY() or STRFTIME() calculation',
      ISNULL: 'IFNULL(x, y) or COALESCE(x, y)',
      CURTIME: "TIME('now')"
    };
    const sqlite = map[fn];
    return {
      message: `${fn}() is not available in SQLite (the browser engine).`,
      hint: sqlite
        ? `That is MySQL/MariaDB syntax. The SQLite equivalent is ${sqlite}.`
        : 'That function is MySQL-specific; see the lesson notes for a SQLite-compatible equivalent.'
    };
  }
  if (/syntax error/i.test(m)) {
    const near = m.match(/near "([^"]+)"/i);
    return {
      message: `SQL syntax error${near ? ` near "${near[1]}"` : ''}.`,
      hint: 'Check for missing commas, unbalanced quotes/parentheses, or MySQL-only syntax the browser SQLite engine does not support.'
    };
  }
  if (/UNIQUE constraint failed: ([\w.]+)/i.test(m)) {
    const c = m.match(/UNIQUE constraint failed: ([\w.]+)/i)![1];
    return {
      message: `UNIQUE constraint violated on ${c}.`,
      hint: 'A row with this value already exists (for example, employees.email must be unique).'
    };
  }
  if (/FOREIGN KEY constraint failed/i.test(m))
    return {
      message: 'FOREIGN KEY constraint violated.',
      hint: 'The referenced row must exist (e.g. an employee_id must exist in employees before you reference it), and referenced rows cannot be deleted while children point at them.'
    };
  if (/NOT NULL constraint failed: ([\w.]+)/i.test(m)) {
    const c = m.match(/NOT NULL constraint failed: ([\w.]+)/i)![1];
    return { message: `NOT NULL constraint violated on ${c}.`, hint: 'Provide a value for this required column.' };
  }
  if (/CHECK constraint failed/i.test(m))
    return { message: 'CHECK constraint violated.', hint: 'The value breaks a CHECK rule defined on the table.' };
  return { message: m };
}
