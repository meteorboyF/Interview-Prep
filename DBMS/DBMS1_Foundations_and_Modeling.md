DBMS Interview Prep

# DBMS Foundations and Data Modeling

## Why databases exist

A database is an organized collection of related data. A Database Management System (DBMS) is the software that defines, stores, retrieves, protects, and coordinates access to that data. Compared with ordinary files, a DBMS provides controlled redundancy, constraints, concurrent access, transactions, recovery, security, and a declarative query language.

Examples include PostgreSQL, MySQL, SQL Server, Oracle, SQLite, MongoDB, and Redis. A relational DBMS stores data in tables and connects tables through keys. NoSQL systems use models such as documents, key-value pairs, wide columns, or graphs when their access patterns favor those structures.

### DBMS versus file system

| Concern | File system | DBMS |
| --- | --- | --- |
| Redundancy | Often duplicated across files | Controlled through schema design |
| Consistency | Application must enforce it | Constraints and transactions help enforce it |
| Concurrent access | Difficult to coordinate | Locks or MVCC provide isolation |
| Querying | Custom code | Declarative SQL and optimizer |
| Recovery | Manual backups | Logs, checkpoints, backup and restore |
| Security | Mostly file permissions | Users, roles, views, row/column privileges |

Use a file when data is small, private to one process, and has simple access patterns. Use a DBMS when relationships, integrity, concurrent users, flexible querying, or reliable recovery matter.

## Three-schema architecture and data independence

- **External level:** user-specific views of data. A billing clerk and an administrator may see different columns.
- **Conceptual level:** the logical database structure—entities, relationships, constraints, and types.
- **Internal level:** physical files, pages, indexes, compression, and placement on storage.

**Physical data independence** means changing storage details without changing the logical schema. Adding an index should not require rewriting application queries. **Logical data independence** means changing the conceptual schema with minimal impact on external views; it is harder to achieve.

## Schema, instance, and metadata

A **schema** is the relatively stable blueprint. An **instance** is the data stored at a particular moment. Metadata is data about the database: table definitions, column types, constraints, indexes, and statistics, usually stored in a system catalog.

```sql
CREATE TABLE department (
  department_id INTEGER PRIMARY KEY,
  name          VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE employee (
  employee_id   INTEGER PRIMARY KEY,
  department_id INTEGER REFERENCES department(department_id),
  email         VARCHAR(255) NOT NULL UNIQUE,
  salary        DECIMAL(12,2) CHECK (salary >= 0),
  hired_at      DATE NOT NULL DEFAULT CURRENT_DATE
);
```

## Relational model vocabulary

- **Relation:** table.
- **Tuple:** row.
- **Attribute:** column.
- **Domain:** permitted values for an attribute.
- **Degree:** number of attributes.
- **Cardinality:** number of rows.
- **NULL:** missing, unknown, or not applicable—not zero or an empty string.

SQL tables behave like multisets unless `DISTINCT` is used, while a mathematical relation contains no duplicate tuples and has no inherent row order.

## Keys

- **Super key:** any attribute set that uniquely identifies a row.
- **Candidate key:** minimal super key; removing any attribute breaks uniqueness.
- **Primary key:** candidate key chosen as the main identifier.
- **Alternate key:** candidate key not selected as primary.
- **Composite key:** key containing multiple attributes.
- **Foreign key:** attribute set referencing a candidate/primary key in another or the same table.
- **Natural key:** meaningful real-world identifier, such as an email or national ID.
- **Surrogate key:** generated identifier with no business meaning.

A surrogate key is stable and compact, but it does not replace business uniqueness rules. If email must be unique, keep a `UNIQUE(email)` constraint even when `employee_id` is the primary key.

## Integrity constraints

**Entity integrity** requires primary-key values to be unique and non-NULL. **Referential integrity** requires a foreign key to be NULL (when permitted) or match a referenced row. **Domain integrity** is enforced through types, `NOT NULL`, `CHECK`, and defaults.

Foreign-key actions include:

- `RESTRICT` / `NO ACTION`: reject deletion while children exist.
- `CASCADE`: propagate deletion or key updates.
- `SET NULL`: detach children while preserving them.
- `SET DEFAULT`: replace the reference with its default.

Choose actions from business rules; automatic cascades are convenient but can delete much more data than expected.

## ER modeling

An **entity** is a distinguishable object, an **attribute** describes it, and a **relationship** connects entities. Cardinalities are one-to-one, one-to-many, and many-to-many. Participation can be total (mandatory) or partial (optional).

Mapping rules:

1. A strong entity normally becomes a table.
2. A one-to-many relationship places the foreign key on the many side.
3. A many-to-many relationship becomes a junction table containing both foreign keys; relationship attributes belong there.
4. A one-to-one relationship usually places a unique foreign key on the optional or dependent side.
5. A weak entity includes its owner's key in a composite primary key.
6. Multivalued attributes become separate tables; derived attributes are usually computed.

```sql
CREATE TABLE enrollment (
  student_id INTEGER REFERENCES student(student_id),
  course_id  INTEGER REFERENCES course(course_id),
  enrolled_at DATE NOT NULL,
  grade       VARCHAR(2),
  PRIMARY KEY (student_id, course_id)
);
```

`enrollment` resolves a many-to-many relationship and stores attributes of that relationship.

## Relational algebra essentials

- **Selection** `σ`: choose rows; similar to `WHERE`.
- **Projection** `π`: choose columns; similar to a `SELECT` list.
- **Union / intersection / difference:** combine compatible relations.
- **Cartesian product:** every row paired with every row.
- **Join:** product followed by a matching condition.
- **Rename** `ρ`: assign an alias.

Relational algebra is procedural notation; SQL is primarily declarative—you describe the result and the optimizer chooses an execution strategy.

## Database categories and CAP context

Relational databases favor structured schemas, joins, and transactions. Document stores suit aggregates with varying fields. Key-value stores excel at direct key access. Graph databases make relationship traversal first-class. Wide-column databases support very large sparse distributed datasets.

The CAP theorem applies when a network partition occurs in a distributed system: the system must trade between immediate consistency and availability. It does not say a system can only ever possess two of three properties under normal operation.

## Foundations Interview Questions

**Q: What is the difference between a database and a DBMS?**

**A:** A database is the organized data itself; a DBMS is the software that defines, queries, secures, coordinates, and recovers that data.

**Q: What is data independence?**

**A:** It is the ability to change one schema level without forcing changes above it. Physical independence hides storage changes; logical independence hides conceptual-schema changes from user views.

**Q: What is the difference between a primary key and a unique key?**

**A:** Both enforce uniqueness. A table has one primary key and it cannot contain NULL. A table may have multiple unique constraints; NULL behavior for unique constraints varies by DBMS.

**Q: Why use a junction table?**

**A:** It converts a many-to-many relationship into two one-to-many relationships and provides a home for attributes of the relationship.

**Q: Natural key or surrogate key—which is better?**

**A:** Neither universally. Surrogate keys are stable and compact; natural keys express business identity. A common design uses a surrogate primary key plus unique constraints on natural identifiers.

**Q: What does referential integrity guarantee?**

**A:** A foreign-key value must reference an existing candidate key, or be NULL if permitted, preventing orphan references.

**Q: RDBMS versus NoSQL?**

**A:** RDBMSs emphasize relational schemas, joins, and strong transactional semantics. NoSQL describes several non-relational models optimized for particular scale, flexibility, or access patterns. The workload should drive the choice.

