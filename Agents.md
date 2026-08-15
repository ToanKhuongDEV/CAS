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
vn.cas
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

- For every new or changed backend API endpoint, add or update its cURL example
  in `backend/README.md` for Postman/manual testing.
- Keep Firebase ID Tokens only in local shell or Postman environments; never
  commit them to the repository.
- When services are available, execute the relevant cURL/Postman request before
  completing the task. Otherwise, state the remaining risk.


## Do Not Edit Manually


## Conventions
- Upon completing a task, you must update the PROJECT_PROGRESS.md file.
- Do not read files or directories listed in .gitignore.
- Do not create a Git commit unless the user explicitly requests it.
- When a Git commit is authorized, use exactly this format:
  `<prefix>(<scope>): <description>`. The only allowed prefixes are `add`,
  `update`, `chore`, and `delete`; the scope must be `be`, `fe`, or `docs`.
  For example: `add(be): add account, employee, and table management APIs`.
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
- After completing the implementation, run the project's formatting command (for frontend: npx prettier --write src/ or npm run format).
- Clearly report assumptions, modified files, important decisions, and any remaining risks.

## Frontend Design System

- **Colors**: Always use the design tokens defined in `frontend/src/app/globals.css` (e.g., `cas-primary`, `cas-error`, `cas-secondary`, `cas-tertiary`, `cas-on-surface`, `cas-on-surface-variant`, `cas-surface`, `cas-outline-variant`, etc.). Never use raw Tailwind color utilities such as `red-500`, `emerald-500`, `rose-500`, `amber-500`, `slate-500`, or any other hardcoded palette color. If a new color is genuinely needed and no existing token fits, ask the user for approval before adding it to `globals.css`.
- **Fonts**: Always use the system font stack defined via `--font-cas` in `globals.css`, applied globally through the `font-sans` Tailwind utility on `<body>`. Never declare a custom `font-family`, import a separate Google Font, or use any Tailwind font utility other than `font-sans`. If a new typeface is required, ask the user for approval before adding it.
- Minimize additions to the design system. Reuse existing tokens first. Adding new tokens or colors requires explicit user approval.
