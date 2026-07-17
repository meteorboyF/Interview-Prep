import type { DbMode } from '../db/databaseWorker';

/** Which dialect a runnable example demonstrates. */
export type Dialect = 'standard' | 'mysql' | 'sqlite' | 'workaround';

export interface RunnableExample {
  /** SQL that actually executes in the browser SQLite engine. */
  sql: string;
  /** Original MySQL/MariaDB form, shown (not executed) when it differs. */
  mysqlSql?: string;
  dialect: Dialect;
  /** learning (read-only, default) or sandbox (DML/DDL allowed, resettable) */
  mode?: DbMode;
  note?: string;
  /** this example is SUPPOSED to fail (constraint demo, MySQL-only syntax, …) */
  expectError?: boolean;
}

export interface ConcurrencyStep {
  session: 'A' | 'B' | 'DB';
  text: string;
  highlight?: 'ok' | 'problem';
}

export interface ConcurrencyScenario {
  title: string;
  steps: ConcurrencyStep[];
  outcome: string;
  prevention: string;
}

export interface LessonSection {
  heading?: string;
  body?: string;
  example?: RunnableExample;
  /** step-through simulated concurrency timeline (clearly labeled simulated) */
  concurrency?: ConcurrencyScenario;
  /** render the normalization visualizer */
  normalization?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  sections: LessonSection[];
}

export interface LessonCategory {
  id: string;
  title: string;
  lessons: Lesson[];
}
