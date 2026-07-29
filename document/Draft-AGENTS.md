# Project: CAS Backend API

CAS is the backend API for a restaurant table-ordering and payment-confirmation
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
├── payment     # Payments, VietQR, and payment confirmation
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


## Test Order


## Do Not Edit Manually


## Conventions

- Use explicit MyBatis column lists; never use `SELECT *`. Use dedicated query
  DTOs or views for joined and aggregated results.
- Use `DECIMAL` in MySQL and `BigDecimal` in Java for money. Never use `double`
  or `float` for monetary values.
- Apply Jakarta Bean Validation at the API boundary, but always load prices,
  totals, roles, identities, and ownership from trusted server-side data.
- Flyway owns schema changes; never modify an applied migration. Redis must not
  be the source of truth for durable business data.
