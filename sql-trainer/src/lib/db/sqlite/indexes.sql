-- Same five indexes the canonical MySQL file creates
-- ("Indexes to support Week 4 query optimization exercises").
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, work_date);
CREATE INDEX idx_salary_history_employee ON salary_history(employee_id);
CREATE INDEX idx_reviews_employee ON performance_reviews(employee_id);
