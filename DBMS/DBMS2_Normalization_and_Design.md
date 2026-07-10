DBMS Interview Prep

# Normalization and Database Design

## Why normalize?

Normalization organizes attributes into relations that represent facts cleanly. Its goals are to reduce harmful redundancy, prevent anomalies, and make dependencies explicit.

Suppose one table stores `(student_id, student_name, course_id, course_name, instructor, grade)`. Course and instructor facts repeat for every enrolled student.

- **Update anomaly:** changing an instructor requires editing many rows.
- **Insertion anomaly:** a new course cannot be recorded until a student enrolls.
- **Deletion anomaly:** deleting the final enrollment may erase the only course record.

Normalization decomposes this into `student`, `course`, and `enrollment` tables.

## Functional dependencies

A functional dependency `X → Y` means that any two rows agreeing on X must agree on Y. It is a rule about all valid database states, not an accident in current sample data.

Important forms:

- **Trivial:** Y is a subset of X.
- **Full dependency:** Y depends on all of a composite determinant, not a subset.
- **Partial dependency:** a non-key attribute depends on part of a composite candidate key.
- **Transitive dependency:** X determines Y through another non-key attribute.

The **closure** `X+` is the set of attributes functionally determined by X. To test whether X is a super key, compute its closure; if it contains every relation attribute, X is a super key.

Armstrong's axioms are reflexivity, augmentation, and transitivity. Union, decomposition, and pseudotransitivity follow from them.

## First Normal Form (1NF)

Each field contains one value from its domain, and repeating groups are removed. Instead of `phone_numbers = '111,222'`, use a child table:

```sql
CREATE TABLE customer_phone (
  customer_id INTEGER REFERENCES customer(customer_id),
  phone       VARCHAR(30),
  PRIMARY KEY (customer_id, phone)
);
```

Atomicity depends on intended use: an address may be atomic for display but not if the system queries city and postal code separately.

## Second Normal Form (2NF)

A relation is in 2NF when it is in 1NF and every non-prime attribute depends on the whole of every candidate key. It matters primarily with composite keys.

For `enrollment(student_id, course_id, student_name, course_name, grade)` with key `(student_id, course_id)`:

- `student_id → student_name` is partial.
- `course_id → course_name` is partial.
- `(student_id, course_id) → grade` is full.

Move student and course facts to their own tables.

## Third Normal Form (3NF)

A relation is in 3NF when it is in 2NF and has no problematic transitive dependency of a non-key attribute on a key. Formally, for every nontrivial FD `X → A`, X is a super key or A is prime.

If `employee_id → department_id` and `department_id → department_name`, storing `department_name` in employee creates a transitive dependency. Keep department data in `department`.

## Boyce-Codd Normal Form (BCNF)

BCNF requires every determinant in every nontrivial FD to be a super key. It is stricter than 3NF. A relation can be in 3NF but not BCNF when overlapping candidate keys allow a determinant that is not a super key while the dependent attribute is prime.

BCNF removes more redundancy, but a BCNF decomposition may fail to preserve every functional dependency. In that case, a dependency-preserving 3NF design can be the pragmatic choice.

## 4NF and 5NF

**Fourth Normal Form** addresses independent multivalued dependencies. If a teacher can have many skills and many languages independently, storing all skill-language combinations causes a cross product. Decompose into `(teacher, skill)` and `(teacher, language)`.

**Fifth Normal Form** addresses join dependencies where a relation can be reconstructed from three or more projections and redundancy cannot be explained by ordinary FDs. It is uncommon in day-to-day application interviews but useful conceptually.

## Good decomposition

A decomposition should ideally have:

- **Lossless join:** joining decomposed relations recreates exactly the original valid relation, without spurious rows.
- **Dependency preservation:** constraints can be checked within individual decomposed relations without joining them.

For a binary decomposition of R into R1 and R2, it is lossless when their shared attributes functionally determine R1 or R2 under the known dependencies.

## Denormalization

Denormalization deliberately duplicates or precomputes data to optimize a measured workload. Examples include cached totals, materialized views, and star schemas. Costs include more storage, more complex writes, and the risk of inconsistency.

Normalize first for correctness. Denormalize only with a clear access pattern, ownership rule, refresh strategy, and evidence that the normalized design is the bottleneck.

## OLTP and OLAP design

**OLTP** systems handle short concurrent transactions and usually favor normalized schemas. **OLAP** systems scan and aggregate large histories and often use dimensional models.

A star schema has a central **fact table** containing measures and foreign keys, surrounded by denormalized **dimension tables** such as date, customer, and product. A snowflake schema normalizes dimensions further.

## Practical design checklist

1. Identify entities and business events.
2. Write candidate keys and business uniqueness rules.
3. Record cardinality and optionality for every relationship.
4. Discover functional dependencies from business rules.
5. Normalize and verify lossless decomposition.
6. Choose data types, constraints, and deletion behavior.
7. Design indexes from real query patterns—not guesses.
8. Decide audit, retention, privacy, and migration requirements.
9. Test concurrency and failure behavior.

## Normalization Interview Questions

**Q: What problem does normalization solve?**

**A:** It reduces harmful redundancy and prevents update, insertion, and deletion anomalies by storing each fact in an appropriate relation.

**Q: What is the difference between 2NF and 3NF?**

**A:** 2NF removes partial dependencies on part of a composite candidate key. 3NF also removes problematic transitive dependencies of non-key attributes on keys.

**Q: How does BCNF differ from 3NF?**

**A:** BCNF requires every nontrivial determinant to be a super key. 3NF permits a non-super-key determinant when the dependent attribute is prime, so BCNF is stricter.

**Q: What makes a decomposition lossless?**

**A:** Joining its projections must reproduce exactly the original valid relation without losing information or generating spurious tuples.

**Q: What is dependency preservation?**

**A:** All original functional dependencies can be enforced by checking individual decomposed tables rather than joining them.

**Q: When is denormalization justified?**

**A:** When measurement shows a read-heavy access pattern needs it and the team has a reliable strategy for maintaining duplicated data correctly.

**Q: Give an example of a multivalued dependency.**

**A:** If an employee has independent sets of skills and languages, employee determines multiple skills and multiple languages independently. Keeping both in one table creates redundant combinations and violates 4NF.

