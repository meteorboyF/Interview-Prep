import type { Lesson, LessonCategory } from './types';
import { foundations } from './foundations';
import { filtering } from './filtering';
import { aggregates } from './aggregates';
import { joins } from './joins';
import { subqueries } from './subqueries';
import { ctes } from './ctes';
import { windows } from './windows';
import { setops } from './setops';
import { dml } from './dml';
import { ddl } from './ddl';
import { keysNormalization } from './keysNormalization';
import { transactions } from './transactions';
import { indexing } from './indexing';

export const CATEGORIES: LessonCategory[] = [
  foundations,
  filtering,
  aggregates,
  joins,
  subqueries,
  ctes,
  windows,
  setops,
  dml,
  ddl,
  keysNormalization,
  transactions,
  indexing
];

export function findLesson(id: string): Lesson | null {
  for (const cat of CATEGORIES) {
    const hit = cat.lessons.find((l) => l.id === id);
    if (hit) return hit;
  }
  return null;
}
