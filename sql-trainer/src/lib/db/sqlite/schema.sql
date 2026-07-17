-- SQLite conversion of data/mysql/hr_training_dataset.sql (schema only).
-- The MySQL file stays canonical; this file is the browser-engine equivalent.
--
-- Conversion rules applied:
--   INT PRIMARY KEY AUTO_INCREMENT -> INTEGER PRIMARY KEY
--     (rowid alias auto-assigns ids; AUTOINCREMENT is intentionally NOT used
--      because strict "never reuse ids" semantics are not required here)
--   BIGINT -> INTEGER (SQLite INTEGER is 64-bit)
--   VARCHAR(n) -> TEXT
--   DECIMAL(p,s) -> NUMERIC
--   DATE -> TEXT (ISO YYYY-MM-DD)
--   TIME -> TEXT (HH:MM:SS)
--   No DROP/CREATE DATABASE or USE: the browser opens an isolated in-memory DB.

PRAGMA foreign_keys = ON;

CREATE TABLE locations (
    location_id     INTEGER PRIMARY KEY,
    city            TEXT NOT NULL,
    state           TEXT,
    country         TEXT NOT NULL
);

CREATE TABLE departments (
    department_id   INTEGER PRIMARY KEY,
    department_name TEXT NOT NULL,
    location_id     INTEGER,
    budget          NUMERIC,
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

CREATE TABLE jobs (
    job_id          INTEGER PRIMARY KEY,
    job_title       TEXT NOT NULL,
    job_grade       TEXT,
    min_salary      NUMERIC,
    max_salary      NUMERIC
);

CREATE TABLE employees (
    employee_id       INTEGER PRIMARY KEY,
    first_name        TEXT NOT NULL,
    last_name         TEXT NOT NULL,
    email             TEXT UNIQUE,
    phone             TEXT,
    date_of_birth     TEXT,
    gender            TEXT,
    hire_date         TEXT NOT NULL,
    job_id            INTEGER,
    department_id     INTEGER,
    manager_id        INTEGER,
    salary            NUMERIC NOT NULL,
    commission_pct    NUMERIC DEFAULT 0,
    employment_status TEXT DEFAULT 'Active',
    termination_date  TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

CREATE TABLE salary_history (
    salary_history_id INTEGER PRIMARY KEY,
    employee_id       INTEGER NOT NULL,
    old_salary        NUMERIC,
    new_salary        NUMERIC,
    change_date       TEXT NOT NULL,
    change_reason     TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE performance_reviews (
    review_id     INTEGER PRIMARY KEY,
    employee_id   INTEGER NOT NULL,
    reviewer_id   INTEGER,
    review_date   TEXT NOT NULL,
    rating        INTEGER NOT NULL,
    comments      TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (reviewer_id) REFERENCES employees(employee_id)
);

CREATE TABLE projects (
    project_id      INTEGER PRIMARY KEY,
    project_name    TEXT NOT NULL,
    department_id   INTEGER,
    start_date      TEXT,
    end_date        TEXT,
    budget          NUMERIC,
    status          TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE employee_projects (
    employee_id     INTEGER NOT NULL,
    project_id      INTEGER NOT NULL,
    role            TEXT,
    hours_allocated INTEGER,
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE leave_requests (
    leave_id        INTEGER PRIMARY KEY,
    employee_id     INTEGER NOT NULL,
    leave_type      TEXT,
    start_date      TEXT NOT NULL,
    end_date        TEXT NOT NULL,
    days_requested  INTEGER,
    status          TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE attendance (
    attendance_id   INTEGER PRIMARY KEY,
    employee_id     INTEGER NOT NULL,
    work_date       TEXT NOT NULL,
    check_in        TEXT,
    check_out       TEXT,
    status          TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
