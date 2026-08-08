# Project: CAS Backend API

CAS is the backend API for a restaurant table-ordering and payment-status
system, serving both the customer-facing and operations interfaces. The backend
is a modular monolith built with Java 21, Spring Boot, and Maven. It uses MyBatis
with MySQL, supported by Redis, Flyway, Lombok, and Jakarta Bean Validation.

## Sources of Truth

- Product scope and architecture: `document/OVERALL.md`.
- Business flows and rules: `document/BUSINESS_FLOWS.md`.
- Data model: `document/DATABASE_DESIGN.md`.
- Edge cases and unresolved decisions: `document/EDGE_CASES.md`.
- Do not invent features, endpoints, tables, columns, states, or business rules
  beyond the project documents and the task requirements.
- Content marked as proposed, unconfirmed, unresolved, or `Cần chốt` must not be
  treated as an approved requirement.

## Module Structure

Organize packages by business feature:

```text
com.cas
├── shared      # Shared configuration and technical components
├── store       # Store, dining tables, and table QR codes
├── catalog     # Categories, menu items, and options
├── ordering    # Table sessions, orders, and cancellation requests
├── payment     # Payment requests and manual status confirmation
└── operation   # Operational accounts and audit logs
```

Each business module may contain:

```text
module/
├── domain          # Models, enums, business rules, and repository ports
├── application     # Use cases, business orchestration, and transactions
├── infrastructure  # MyBatis, Redis, and external integrations
└── api             # Controllers and request/response models
```

Do not organize the entire application into shared technical packages such as
`controller`, `service`, `repository`, `entity`, or `dto`.

## Commands


## OpenAPI Specification


## Authentication and Secrets
- Operational accounts (`ADMIN` and `OPERATOR`) use Firebase Authentication.
- Client passes the Firebase ID Token in the `Authorization: Bearer <Firebase_ID_Token>` header.
- CAS Backend verifies the Firebase ID Token and maps it to system accounts and roles.


## Test Order


## Do Not Edit Manually


## Conventions
- Upon completing a task, you must update the PROJECT_PROGRESS.md file.
- Do not read files or directories listed in .gitignore.
- Do not create a Git commit unless the user explicitly requests it.
- If anything is unclear, ask for the user's approval before implementing it. Do not guess.
- Use explicit MyBatis column lists; never use `SELECT *`. Use dedicated query
  DTOs or views for joined and aggregated results.
- Use `DECIMAL` in MySQL and `BigDecimal` in Java for money. Never use `double`
  or `float` for monetary values.
- Apply Jakarta Bean Validation at the API boundary, but always load prices,
  totals, roles, identities, and ownership from trusted server-side data.
- Flyway owns schema changes; never modify an applied migration. Redis must not
  be the source of truth for durable business data.
- Do not create a Git commit, push, merge, or force-push unless the user explicitly requests it.
- If any requirement is unclear, ask for clarification or approval before implementation. Do not guess.
- Only modify files directly related to the requested task.
- Do not refactor unrelated code or change the project architecture unless explicitly requested.
- Always ask for the user's approval before adding, removing, or upgrading dependencies.
- Reuse existing components, hooks, utilities, types, and project patterns whenever possible.
- Read the relevant existing implementation before making changes.
- Follow the current naming, formatting, folder structure, and coding conventions of the project.
- Do not change API contracts, database schemas, environment variables, or configuration files without approval.
- Do not manually edit generated files, including OpenAPI or code-generation outputs.
- Do not delete existing files, code, comments, tests, or configurations unless explicitly required.
- Keep changes minimal and focused. Do not format or modify unrelated files.
- After completing the implementation, run the project's formatting command.
- Clearly report assumptions, modified files, important decisions, and any remaining risks.
- Anything not explicitly stated or defined in the documentation must be treated as NON-EXISTENT. Do not infer, assume, or invent any additional features, data fields, behaviors, or constraints beyond what is documented.
- Do not repeat or explain obvious information. Keep responses concise, precise, and focused directly on the technical request.

