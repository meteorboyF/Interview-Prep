import type { LessonCategory } from './types';

export const ddl: LessonCategory = {
  id: 'ddl',
  title: 'DDL & Constraints',
  lessons: [
    {
      id: 'create-table-constraints',
      title: 'CREATE TABLE & constraints',
      summary: 'Designing new HR-domain tables (training courses, skills) in the sandbox — primary keys, foreign keys, UNIQUE, CHECK, DEFAULT and NOT NULL.',
      sections: [
        {
          body: 'DDL lessons build **new teaching tables** in the HR domain rather than touching the ten canonical tables. Everything happens in the sandbox; Reset removes your tables again.'
        },
        {
          heading: 'A training_courses table with every constraint type',
          example: {
            mode: 'sandbox',
            sql: "CREATE TABLE IF NOT EXISTS training_courses (\n    course_id     INTEGER PRIMARY KEY,          -- MySQL: INT PRIMARY KEY AUTO_INCREMENT\n    course_name   TEXT NOT NULL UNIQUE,         -- required and unique\n    category      TEXT NOT NULL DEFAULT 'General',\n    max_seats     INTEGER CHECK (max_seats > 0),-- CHECK rejects nonsense\n    fee           NUMERIC DEFAULT 0\n);\n\nINSERT INTO training_courses (course_name, category, max_seats, fee) VALUES\n  ('Advanced SQL', 'Data', 25, 400),\n  ('Leadership Basics', 'Management', 40, 250),\n  ('Workplace Safety', 'Compliance', 100, 0);\n\nSELECT * FROM training_courses;",
            mysqlSql: "CREATE TABLE training_courses (\n    course_id     INT PRIMARY KEY AUTO_INCREMENT,\n    course_name   VARCHAR(150) NOT NULL UNIQUE,\n    category      VARCHAR(50) NOT NULL DEFAULT 'General',\n    max_seats     INT CHECK (max_seats > 0),\n    fee           DECIMAL(8,2) DEFAULT 0\n);",
            dialect: 'sqlite',
            note: 'SQLite `INTEGER PRIMARY KEY` auto-assigns ids like MySQL AUTO_INCREMENT. SQLite\'s optional `AUTOINCREMENT` keyword additionally forbids id reuse — only needed for strict audit requirements.'
          }
        },
        {
          heading: 'Constraints reject bad data',
          example: {
            mode: 'sandbox',
            sql: "-- Each of these violates a different constraint. Run them one at a time:\nINSERT INTO training_courses (course_name, max_seats) VALUES ('Advanced SQL', 10);   -- UNIQUE",
            dialect: 'standard',
            expectError: true,
            note: 'Then try `INSERT INTO training_courses (course_name, max_seats) VALUES (\'Yoga\', -5);` (CHECK) and `INSERT INTO training_courses (max_seats) VALUES (10);` (NOT NULL). Requires the table from the previous example.'
          }
        },
        {
          heading: 'Junction table with composite key + foreign keys',
          body: 'employee_training mirrors the real `employee_projects` design: composite primary key, two foreign keys — a many-to-many between employees and courses.',
          example: {
            mode: 'sandbox',
            sql: "CREATE TABLE IF NOT EXISTS employee_training (\n    employee_id  INTEGER NOT NULL REFERENCES employees(employee_id),\n    course_id    INTEGER NOT NULL REFERENCES training_courses(course_id),\n    enrolled_on  TEXT NOT NULL DEFAULT (DATE('now')),\n    completed    INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),\n    PRIMARY KEY (employee_id, course_id)\n);\n\nINSERT INTO employee_training (employee_id, course_id) VALUES (16, 1), (17, 1), (16, 2);\n\nSELECT e.first_name, e.last_name, tc.course_name, et.enrolled_on\nFROM employee_training et\nJOIN employees e ON e.employee_id = et.employee_id\nJOIN training_courses tc ON tc.course_id = et.course_id;",
            dialect: 'sqlite',
            note: 'Run the training_courses example first. The composite PK makes (16, 1) unique — try inserting it twice. The FK to employees means employee 99999 is rejected.'
          }
        }
      ]
    },
    {
      id: 'alter-drop',
      title: 'ALTER TABLE & DROP TABLE',
      summary: 'Evolving and removing sandbox tables. Destructive DDL practices on teaching tables — the ten canonical HR tables stay intact.',
      sections: [
        {
          heading: 'ALTER TABLE — add and rename columns',
          body: 'SQLite supports ADD COLUMN, RENAME COLUMN, RENAME TO and (3.35+) DROP COLUMN. MySQL additionally supports MODIFY COLUMN for type changes — in SQLite you recreate the table instead.',
          example: {
            mode: 'sandbox',
            sql: "CREATE TABLE IF NOT EXISTS skills (\n    skill_id   INTEGER PRIMARY KEY,\n    skill_name TEXT NOT NULL UNIQUE\n);\n\nALTER TABLE skills ADD COLUMN category TEXT DEFAULT 'Technical';\nALTER TABLE skills RENAME COLUMN category TO skill_category;\n\nINSERT INTO skills (skill_name, skill_category) VALUES ('SQL', 'Technical'), ('Negotiation', 'Soft');\n\nSELECT * FROM skills;\nPRAGMA table_info(skills);",
            mysqlSql: "ALTER TABLE skills ADD COLUMN category VARCHAR(50) DEFAULT 'Technical';\nALTER TABLE skills CHANGE category skill_category VARCHAR(50);  -- MySQL rename syntax",
            dialect: 'sqlite',
            note: 'PRAGMA table_info is SQLite\'s DESCRIBE — MySQL uses `DESCRIBE skills;` or `SHOW COLUMNS FROM skills;`.'
          }
        },
        {
          heading: 'DROP TABLE — on teaching tables only',
          example: {
            mode: 'sandbox',
            sql: "DROP TABLE IF EXISTS skills;\n\n-- Confirm it is gone (and the HR tables are not):\nSELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;",
            dialect: 'sqlite',
            note: '`IF EXISTS` avoids an error when the table is already gone. The canonical tables remain — and even if you dropped one in the sandbox, Reset restores everything. The learning database is never touched.'
          }
        },
        {
          heading: 'Why not practice DROP on the real tables?',
          body: 'You *can* drop core HR tables in your sandbox copy (children first — foreign keys protect referenced tables), and Reset will restore them. But the lessons use disposable teaching tables so a destructive experiment never invalidates the rest of your session. This mirrors real-world discipline: **never test destructive DDL against shared data**.'
        }
      ]
    }
  ]
};
