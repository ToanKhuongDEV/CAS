# AGENTS.md — CAS Backend

## Scope

This file applies to all code inside `backend/`.

It supplements the repository root `AGENTS.md`. When instructions conflict, use
the more specific applicable instruction unless the user explicitly says
otherwise.

CAS Backend is a Java 21, Spring Boot, Maven, MyBatis, MySQL, Redis, Firebase
Authentication, Flyway, Lombok, Jakarta Bean Validation, JUnit 5, Mockito, and
Testcontainers modular monolith.

Keep packages organized by business feature under the package namespace already
established by the backend source code. Do not rename the root Java package
unless explicitly requested.

---

## Sources of Truth

Before changing a business feature, read the relevant project documents:

* `README.md` for the project overview when needed.
* `../document/OVERALL.md` for product scope and architecture.
* `../document/BUSINESS_FLOWS.md` for business behavior and state transitions.
* `../document/DATABASE_DESIGN.md` for the current data model.
* `../document/EDGE_CASES.md` for confirmed and unresolved edge cases.
* Relevant existing implementation for current conventions and behavior.

Project documents and explicitly approved task requirements are the sources of
truth.

Do not invent:

* features;
* endpoints;
* request fields;
* response fields;
* tables;
* columns;
* database relationships;
* states;
* enum values;
* roles;
* permissions;
* validations;
* side effects;
* business rules.

Content marked as proposed, unconfirmed, unresolved, `Cần chốt`, or equivalent
must not be treated as an approved requirement.

If an unresolved requirement would materially affect the API contract, database
model, state machine, authorization, monetary calculation, or business behavior,
obtain approval before implementing it.

Do not silently invent a business rule.

---

## General Engineering Rules

* Read the relevant existing implementation before making changes.
* Reuse existing components, services, utilities, types, mappings, and project
  patterns whenever they correctly fit the task.
* Preserve existing public behavior unless the task explicitly changes it.
* Prefer the smallest change that fully solves the requested task.
* Keep changes minimal and focused.
* Only modify files directly related to the requested task.
* Do not refactor unrelated code.
* Do not rename or reorganize unrelated files or packages.
* Do not format unrelated files.
* Preserve user changes and unrelated work already present in the working tree.
* Do not delete existing files, code, comments, tests, migrations, or
  configuration unless the requested change explicitly requires it.
* Do not create speculative abstractions or infrastructure for hypothetical
  future requirements.
* Prefer explicit, simple implementations over unnecessary abstraction.

---

## Architecture

CAS Backend is a modular monolith.

Organize code by business feature, not by global technical layer.

Do not reorganize the entire backend into global packages such as:

```text
controller/
service/
repository/
entity/
dto/
```

A business module may use this internal structure when appropriate:

```text
module/
├─ domain
├─ application
├─ infrastructure
└─ api
```

Responsibilities:

* `domain`: business models, enums, domain rules, and domain ports.
* `application`: use cases, commands, queries, orchestration, and transactions.
* `infrastructure`: MyBatis persistence, Redis access, external integrations.
* `api`: controllers and API request/response models.

Keep shared modules limited to genuinely cross-cutting concerns.

Do not move feature-specific:

* business logic;
* MyBatis mappers;
* SQL;
* DTOs;
* domain models;
* persistence models;

into shared modules merely for convenience.

Avoid circular module dependencies.

---

## Dependency Direction

Source-code dependencies should normally follow:

```text
api -> application -> domain
infrastructure -> application/domain ports
configuration -> module implementations
```

Rules:

* Domain code must not depend on Spring MVC.
* Domain code must not depend on API request/response classes.
* Domain code must not depend on MyBatis.
* Domain code must not depend on Redis.
* Domain code must not depend on external-service SDK details.
* Controllers must not contain business logic.
* Controllers should call application services or use cases.
* Infrastructure should implement ports defined by the application or domain
  layer where a boundary is useful.
* Do not access another module's MyBatis mapper directly.
* Do not access another module's Redis repository directly.
* Cross-module communication must go through an approved public application
  service or explicit interface.
* Do not create an interface for every class.
* Add an interface when it protects a module boundary, represents an
  infrastructure port, supports multiple implementations, or materially
  improves testing.

---

## API Rules

* Follow existing API versioning and route conventions.
* Do not create a new endpoint when an existing approved endpoint correctly
  supports the operation.
* Do not change an existing API contract unless the task or approved requirement
  explicitly requires it.
* Use dedicated request and response types at the API boundary.
* Prefer Java records for immutable request, response, and query DTOs where they
  fit existing project conventions.
* Do not expose database persistence models directly from controllers.
* Keep API contracts stable unless an approved requirement changes them.
* Use consistent HTTP status codes.
* Use the project's standard error-response structure.
* Never expose:

  * stack traces;
  * SQL errors;
  * internal exception details;
  * secrets;
  * credentials;
  * implementation details.

---

## Validation

* Apply Jakarta Bean Validation at the API boundary where appropriate.
* Use standard constraints such as:

  * `@NotNull`;
  * `@NotBlank`;
  * `@Size`;
  * `@Min`;
  * `@Max`;
  * `@Positive`;
  * `@PositiveOrZero`;
  * `@Pattern`.
* API validation is not a replacement for business validation.
* Validate state-dependent and database-dependent rules inside the appropriate
  application/domain layer.
* Do not duplicate identical validation logic across multiple controllers.

Server-side data remains authoritative.

Never trust client-provided values for:

* roles;
* permissions;
* identity;
* ownership;
* prices;
* totals;
* discounts;
* payment status;
* order status;
* table-session status;
* promotion eligibility;
* quota state.

Recalculate authoritative business and monetary values on the backend.

---

## Authentication and Authorization

Operational accounts such as `ADMIN` and `OPERATOR` use Firebase
Authentication.

Protected operational APIs must:

1. receive the Firebase ID Token through the approved authentication mechanism;
2. verify the token server-side;
3. resolve the authenticated user against CAS backend data;
4. resolve authoritative roles and permissions from trusted backend state;
5. enforce authorization on the backend.

Rules:

* Never trust a role sent by the frontend.
* Never trust user identity sent directly in the request body.
* UI visibility is not authorization.
* Verify resource ownership where applicable.
* Admin-only and Operator-only actions must be enforced server-side.
* Follow the authentication mechanism already established in the repository.
* Do not introduce another authentication strategy without explicit approval.
* Do not create a separate JWT or refresh-token system unless explicitly
  required by an approved design.

Never log:

* Firebase ID Tokens;
* refresh tokens;
* passwords;
* authorization headers;
* API keys;
* session cookies;
* private credentials.

---

## Money and Numeric Rules

* Use `BigDecimal` for monetary values in Java.
* Use `DECIMAL` for monetary values in MySQL.
* Never use `double` or `float` for money.
* Do not calculate money using formatted strings.
* Use explicit rounding rules for division and percentage calculations.
* Preserve the precision defined by the database design.
* Backend-calculated totals are authoritative.
* Snapshot prices and discounts when required by the approved database design.
* Do not reconstruct historical bills from mutable current menu prices when
  snapshots are required.

---

## MySQL and Persistence Rules

MySQL is the authoritative persistent datastore unless project documentation
explicitly states otherwise.

* Follow `../document/DATABASE_DESIGN.md`.
* Enforce critical data integrity in the database where practical.
* Use foreign keys, unique constraints, checks, transactions, and locking
  strategies according to the approved design.
* Do not rely only on frontend validation for integrity.
* Review frequently executed queries for appropriate indexes.
* Do not add indexes without considering actual query patterns.
* Avoid redundant indexes that duplicate an existing left-prefix index.
* Avoid N+1 query patterns.
* Use deterministic ordering for pagination queries.
* Use transactions for operations that must succeed or fail atomically.

---

## MyBatis Rules

MyBatis maps SQL results. It does not manage entities like JPA.

* Keep domain models, database row models, query views, and API responses
  separate when they serve different purposes.
* A simple persistence model may also serve as a domain model only when no
  meaningful behavior or boundary is lost.
* Use dedicated query DTOs/views for joined or aggregated results.
* Use explicit SQL column lists.
* Never use `SELECT *`.
* Explicitly list columns in `INSERT` statements.
* Make result mappings unambiguous.
* Use aliases or result maps when necessary.
* Mapper interfaces must describe persistence operations, not business logic.
* Keep feature-specific mappers inside the owning feature.
* Do not move all mappers into a shared module.
* Do not construct SQL through unsafe string concatenation.
* Use bound parameters for user-controlled values.

Use XML mappers for:

* complex joins;
* dynamic SQL;
* conditional filters;
* large queries;
* result maps;
* one-to-many mappings.

Mapper annotations are acceptable for very small and stable queries when they
match existing project conventions.

Write operations should return affected-row counts when useful.

Check affected-row counts when:

* missing records matter;
* concurrency matters;
* an update is expected to modify exactly one row;
* an invalid state transition must be detected.

---

## Flyway Rules

Flyway owns schema changes.

* Make schema changes only through Flyway migrations.
* Never manually change the shared database as a replacement for a migration.
* Never modify an already-applied migration.
* Create a new migration for every schema change.
* Follow the project's current migration naming convention.
* Keep migrations deterministic.
* Do not depend on manually prepared local data.
* Do not depend on local-only state.
* Review destructive migrations carefully.
* Do not drop or rename production data structures without an approved migration
  strategy.
* Use lowercase `snake_case` for database identifiers unless the existing schema
  establishes another convention.

When a schema change affects application code, update all applicable:

* SQL;
* MyBatis mappings;
* persistence models;
* query DTOs;
* API DTOs;
* validation;
* tests;
* Postman requests;
* documentation.

---

## Redis Rules

* Use Redis only for approved use cases.
* MySQL remains authoritative for durable business data.
* Redis must not become the source of truth for core persistent state.
* Use Redis for caching, shared ephemeral state, coordination, or another
  explicitly justified purpose.
* Cache keys must follow a consistent namespace.
* Cached values must have a defined expiration or invalidation strategy.
* Cache misses must be handled correctly.
* Redis outages must not corrupt authoritative MySQL data.
* Do not cache:

  * passwords;
  * Firebase tokens;
  * API keys;
  * private credentials.

Do not introduce Redis into a feature merely because Redis is available.

---

## Transactions

Place transaction boundaries at the application/business-operation layer.

* Do not place transaction orchestration in controllers.
* Use `@Transactional` for commands that modify related persistent state when
  appropriate.
* Use `@Transactional(readOnly = true)` for reads where appropriate.
* One transaction should cover all database changes that belong to one atomic
  business operation.
* Keep transaction boundaries focused.
* Do not keep database transactions open while calling slow external services
  unless the consistency behavior has been explicitly designed.
* Use post-commit processing or an approved outbox pattern when reliable external
  notification is required.

---

## Business State and Concurrency

Treat state changes as business operations, not blind database updates.

* Validate the current state before transitioning to another state.
* Reject invalid state transitions.
* Reject duplicate transitions where appropriate.
* Do not introduce new enum values or states without approval.
* Follow approved state diagrams and edge cases.

Assume multiple requests can arrive concurrently.

Do not rely on frontend button disabling to enforce correctness.

Use appropriate combinations of:

* database constraints;
* unique indexes;
* transactions;
* row locking;
* atomic updates;
* optimistic checks;
* affected-row validation;
* idempotency mechanisms.

Concurrency-sensitive operations include, where applicable:

* opening table sessions;
* updating orders;
* cancellation requests;
* promotion redemption;
* quota counters;
* payment completion;
* bill closing;
* other operations where duplicate execution can corrupt state.

Critical invariants should be enforced by the database where practical.

---

## Audit Logging

Record required Admin and Operator mutations through the shared audit-log
component.

* Do not create separate ad hoc audit implementations when the shared component
  already supports the use case.
* Audit entries should include the approved actor, action, target, and relevant
  metadata.
* Do not store secrets in audit data.
* Do not store unnecessary sensitive payloads in audit data.
* Audit failure behavior must follow the approved system design.

---

## Application Logging

* Use the project's logging framework.
* Do not use `System.out.println` for normal application logging.
* Use appropriate log levels.
* Avoid noisy logs in frequently executed loops and polling endpoints.
* Log useful identifiers where safe, such as:

  * correlation/request ID;
  * business public ID;
  * authenticated account ID;
  * operation name.

Avoid logging the same exception redundantly at multiple layers.

Never log:

* passwords;
* Firebase ID Tokens;
* refresh tokens;
* authorization headers;
* API keys;
* cookies;
* payment credentials;
* full sensitive customer information.

---

## Exceptions and Error Handling

* Use centralized exception handling.
* Do not add repetitive standard `try/catch` logic in controllers.
* Use domain- or application-specific exceptions for expected business failures.
* Do not use a generic `RuntimeException` as the normal business error model.
* Preserve original causes when wrapping unexpected exceptions.
* Do not map every error to HTTP 500.
* Map validation, authentication, authorization, not-found, conflict, and
  business-rule failures according to the approved API error contract.
* Never expose implementation details to clients.

---

## External Services

* Keep third-party integrations behind clear application/infrastructure
  boundaries.
* Do not call real third-party services from ordinary unit tests.
* Mock external integrations in unit tests where appropriate.
* Use sandbox/test environments for integration verification when available.
* Do not invent retry policies.
* Timeout, retry, fallback, and failure behavior must follow approved
  requirements.
* Avoid external network calls while holding a database transaction unless
  explicitly designed.

---

## Dependency Rules

* Use Maven and the repository Maven Wrapper.
* Do not introduce Gradle.
* Do not add, remove, replace, or upgrade Maven dependencies without explicit
  user approval.
* Prefer the JDK, Spring Boot, or dependencies already available in the project.
* Do not add overlapping libraries that solve the same problem.
* Put dependencies in the correct Maven module.
* Review Maven dependency scope before adding a dependency.
* Do not upgrade Spring Boot or unrelated libraries while implementing an
  unrelated feature.

Use Lombok selectively.

Prefer Java records for immutable data carriers when appropriate.

Avoid Lombok annotations that hide important:

* construction;
* mutation;
* equality;
* inheritance;

behavior in domain code.

---

## Generated Files

* Do not manually edit generated files.
* If OpenAPI, code generation, or another generator owns a file, change the
  source definition and regenerate through the approved project workflow.
* Do not commit build output unless the repository explicitly tracks it.
* Do not treat generated files as the source of truth when an upstream
  specification exists.

---

## Secret and Ignored Files

* Do not read secret-bearing ignored files such as `.env`, credential files,
  private key files, local secret stores, or generated credential files unless
  the user explicitly requests it and the task requires it.
* Do not expose secret values in logs, code, tests, Postman requests, summaries,
  or documentation.
* Do not inspect build-output directories such as `target/` unless required to
  diagnose a build or test problem.

---

## Naming and Code Quality

* Use names that express a business action or responsibility.
* Avoid vague types such as:

  * `Manager`;
  * `Helper`;
  * `CommonUtils`;
  * `DataProcessor`;
  * `BaseService`.
* Keep methods focused.
* Keep classes focused.
* Avoid premature abstractions.
* Prefer composition over unnecessary inheritance.
* Do not create generic utility classes for unrelated functionality.
* Avoid unexplained magic numbers and business string literals.
* Remove dead code introduced or made obsolete by the current change.
* Remove unused imports introduced by the change.
* Do not leave commented-out implementation code.
* Do not suppress warnings merely to hide a real problem.
* Follow existing naming, formatting, folder structure, and coding conventions.

---

## Testing Rules

Every behavior change must be verified at the appropriate level.

* Add or update tests for success paths.
* Add or update tests for important failure paths.
* Add regression tests for bug fixes when practical.
* Prefer unit tests for isolated business rules.
* Use integration tests for:

  * MyBatis mappings;
  * Flyway migrations;
  * transaction behavior;
  * Redis behavior;
  * database constraints;
  * repository behavior;
  * module integration.
* Use Testcontainers when behavior depends on actual MySQL or Redis semantics.
* Do not over-mock behavior whose correctness depends on SQL or database
  constraints.
* Add concurrency tests for concurrency-sensitive operations.
* Include relevant documented edge cases.

---

## Postman API Checks

The Postman Native Git collection in `postman/collections/` is the canonical
executable API-check collection for backend endpoints. The local environment
template is stored in `postman/environments/`.

For every new backend endpoint:

* add the corresponding Postman request.

For every changed backend endpoint:

* update the corresponding Postman request.

Do not leave obsolete Postman requests after an API contract changes.

Each Postman request must verify:

* expected HTTP status;
* relevant response fields;
* relevant business outcome when applicable.

A successful HTTP connection alone is not sufficient verification.

Group Postman requests by business feature.

Example:

```text
postman/
├─ collections/
│  ├─ auth/
│  ├─ store/
│  ├─ catalog/
│  ├─ ordering/
│  ├─ payment/
│  └─ operation/
└─ environments/
   └─ local.postman_environment.json
```

Add or update multi-step Postman flows when a change affects a complete business
process.

Important flows may include:

```text
authentication
    ↓
open table session
    ↓
create order
    ↓
add/change order items
    ↓
kitchen processing
    ↓
apply promotion
    ↓
create/confirm payment
    ↓
close session
```

Reuse values returned by earlier requests instead of hard-coding generated IDs.

Examples:

* `sessionId`;
* `orderId`;
* `orderItemId`;
* `billId`;
* `paymentId`;
* access/auth tokens.

Do not make automated API checks depend on mutable production data.

Where practical, create or resolve required test data as part of the Postman flow.

Store environment-specific values in Postman environments.

Store the following only in local/private Postman environments:

* Firebase ID Tokens;
* credentials;
* API keys;
* database passwords;
* secrets.

Never commit secrets to:

* shared Postman environment files;
* collection metadata;
* repository configuration.

When MySQL, Redis, and the backend are available:

* execute the relevant Postman request for the endpoint change;
* execute the relevant Postman business flow when the behavior spans multiple
  endpoints.

If Postman verification cannot be executed, report:

* what was not run;
* why it could not be run;
* what behavior remains unverified;
* the remaining risk.

Do not claim an endpoint or flow is verified when the corresponding Postman check
was skipped.

---

## Test Data

* Keep automated test data deterministic where practical.
* Do not rely on manually prepared local database IDs unless explicitly required
  by the test setup.
* Avoid hard-coded database-generated IDs.
* Use unique values for repeatable test scenarios where necessary.
* Tests must never modify production data.
* Clean up temporary test state when the test environment requires it.
* Do not weaken production constraints to make tests easier.

---

## Maven Verification

Use the Maven Wrapper.

On Windows:

```powershell
.\mvnw.cmd test
```

On Unix-like environments:

```bash
./mvnw test
```

Use `test` during normal iteration.

For fuller verification after broad changes, migrations, or before a major
handoff, run:

```powershell
.\mvnw.cmd clean verify
```

or:

```bash
./mvnw clean verify
```

Do not claim a Maven command passed unless it was actually executed
successfully.

---

## Change Workflow

### Before changing code

1. Read this `AGENTS.md` and any more specific nested `AGENTS.md`.
2. Read the relevant project documents.
3. Inspect the existing implementation.
4. Identify affected:

   * modules;
   * API contracts;
   * migrations;
   * MyBatis SQL/mappings;
   * services/use cases;
   * database constraints;
   * tests;
   * Postman requests;
   * documentation.
5. Choose the smallest safe change that fully solves the task.

### While changing code

* Keep changes scoped to the task.
* Preserve unrelated user work.
* Follow existing project conventions.
* Do not silently invent requirements.
* Do not make unrelated architectural changes.
* Do not add dependencies without approval.
* Do not edit generated files manually.

### After changing code

1. Review all changed files.
2. Run relevant unit tests.
3. Run relevant integration tests.
4. Run relevant Postman API checks.
5. Run the applicable Maven verification command when the scope warrants it.
6. Review migration and SQL impact when applicable.
7. Verify no secrets were introduced.
8. Update `document/PROJECT_PROGRESS.md`.
9. Report what changed and what verification actually ran.

---

## Git Rules

* Do not create a Git commit unless the user explicitly requests it.
* Do not push unless explicitly requested.
* Do not merge unless explicitly requested.
* Do not rebase unless explicitly requested.
* Do not force-push unless explicitly requested.
* Do not rewrite Git history unless explicitly requested.
* Do not run destructive Git commands that discard user changes unless
  explicitly requested.
* Do not commit generated build output or secrets.
* When the user explicitly requests a commit, keep it focused and follow the
  repository's commit conventions.

---

## Contract and Configuration Safety

Do not change the following without an approved requirement or explicit user
request:

* API contracts;
* database schema;
* authentication design;
* authorization semantics;
* environment-variable contracts;
* application configuration;
* payment semantics;
* promotion semantics;
* approved state machines;
* role permissions.

Database schema changes that are approved must still be implemented through a
new Flyway migration.

Do not introduce fallback behavior that is not defined by project requirements.

---

## Prohibited Architectural Changes Without Approval

Do not do any of the following unless explicitly requested:

* split the modular monolith into microservices;
* create a new microservice;
* replace MyBatis;
* introduce JPA;
* introduce Hibernate;
* introduce jOOQ;
* replace MySQL;
* introduce another primary durable datastore;
* replace Firebase Authentication;
* introduce another backend authentication architecture;
* change API versioning;
* introduce new business states;
* weaken database constraints;
* remove required audit logging;
* make unrelated architectural refactors.

---

## Review Priorities

When implementing or reviewing backend code, prioritize in this order:

1. Correctness against approved project requirements.
2. Data integrity.
3. Concurrency correctness.
4. Security and authorization.
5. Transaction boundaries.
6. Maintainability.
7. Performance.
8. Code style.

---

## Completion Report

After completing a backend task, clearly report:

* what changed;
* which files were modified;
* tests that were actually executed;
* Postman checks that were actually executed;
* Maven commands that were actually executed;
* schema or migration impact;
* API-contract impact;
* important implementation decisions;
* assumptions or approved interpretations;
* verification that could not be performed;
* remaining risks;
* unresolved requirements.

Do not claim a test, API check, build, or migration passed unless it was actually
executed successfully.

---

## Definition of Done

A backend task is complete only when all applicable conditions are satisfied:

* requested behavior matches approved requirements;
* no undocumented business behavior was invented;
* existing implementation conventions were respected;
* changed modules compile;
* API contracts are consistent;
* validation is enforced at the appropriate boundaries;
* authentication and authorization are enforced server-side;
* monetary calculations use `BigDecimal`;
* database changes use a new Flyway migration;
* MyBatis SQL uses explicit column lists;
* relevant database constraints are preserved;
* relevant unit tests pass;
* relevant integration tests pass;
* concurrency-sensitive behavior is tested when applicable;
* relevant Postman endpoint checks are updated;
* relevant Postman business-flow checks are updated;
* relevant Postman checks were executed when the environment allowed it;
* Maven verification was run when the environment allowed it;
* no secrets were committed or exposed;
* required audit logging is present;
* no unrelated code was modified;
* `document/PROJECT_PROGRESS.md` is updated;
* skipped verification and remaining risks are clearly reported.
