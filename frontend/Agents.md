# AGENTS.md — CAS Frontend

## 1. Scope

This file applies to all code inside the CAS frontend project.

The frontend is responsible for:

- Customer-facing QR menu and ordering flows.
- Operator-facing order and payment screens.
- Admin-facing configuration, catalog, table, account, audit, and unpaid-status screens.
- Displaying current business state received from the backend.
- Providing a mobile-first experience for Customer.
- Providing desktop-first web experiences for Operation and Admin, with responsive mobile layouts.
- Keeping all three areas responsive across their supported screen sizes.
- Keeping business rules in the backend unless they are purely presentational.

Do not implement backend authorization, payment confirmation, pricing rules, or order-state transitions only in the frontend.

CAS uses one Next.js application for all frontend experiences. Do not create separate frontend applications for Customer, Operation, or Admin without explicit approval.

---

## 2. Product Context

CAS is a restaurant ordering system focused on this core flow:

```text
Scan table QR
    ↓
View menu
    ↓
Create or add to an order
    ↓
Restaurant processes the order
    ↓
Customer requests payment
    ↓
Customer must meet the operator
    ↓
Operator verifies the successful transfer through the external “ting ting” speaker
    ↓
Operator manually confirms payment
    ↓
Table session is completed
```

Current primary actors:

- Customer: does not have an account and does not use JWT authentication.
- `OPERATOR`: authenticated operational account.
- `ADMIN`: authenticated administrative account.

Authenticated account roles:

- `ADMIN`
- `OPERATOR`

Customer is an actor, not an `accounts.role`. The current system has no kitchen/preparation role or separate kitchen screen.

### 2.1. Confirmed frontend architecture

- One Next.js App Router application.
- Three route and layout areas: Customer, Operation, and Admin.
- Customer routes are public and entered through the table QR flow.
- Firebase Authentication is the primary authentication mechanism for Operation and Admin; client attaches Firebase ID Token in requests.
- Only `ADMIN` can create operational accounts.
- Detailed permissions for `ADMIN` and `OPERATOR` must follow the backend contract once finalized.
- Frontend communicates only with CAS Backend.
- State created by another device is synchronized using REST polling.
- SSE, WebSocket, and Redis Pub/Sub are not part of the initial frontend architecture.
- Frontend never uploads directly to Cloudinary.

Out of scope for the current frontend unless explicitly requested:

- Inventory management
- Employee scheduling and attendance
- Multi-branch management
- Zalo integration
- CRM
- Membership programs
- Promotions and vouchers
- AI games
- Advanced analytics
- Electronic invoices

Do not add out-of-scope features speculatively.

---

## 3. Technology Stack

Use the existing stack:

- Next.js 16 with App Router
- React 19
- TypeScript 5.9
- Tailwind CSS 4
- ESLint 9
- Vitest
- React Testing Library
- Playwright
- npm with `package-lock.json`

Do not replace the framework, package manager, testing stack, or styling approach without explicit approval.

Do not install a new dependency when the same result can be achieved clearly with the existing stack.

When a new dependency is necessary:

1. Explain why existing tools are insufficient.
2. Prefer small, maintained, framework-compatible packages.
3. Check compatibility with the current Next.js and React versions.
4. Update `package.json` and `package-lock.json`.
5. Add or update tests where behavior changes.

---

## 4. Source of Truth

Follow this priority order:

1. The current user request.
2. Repository `AGENTS.md` instructions that apply to the edited file.
3. Approved project documentation:
   - `document/OVERALL.md`
   - `document/BUSINESS_FLOWS.md`
   - `document/DATABASE_DESIGN.md`
   - `document/EDGE_CASES.md`
4. Existing API contracts and generated types, when present.
5. Existing implementation and tests.

Before modifying a feature:

- Read the relevant route, components, hooks, services, types, and tests.
- Preserve existing naming and folder conventions when they are consistent.
- Do not create a second pattern for a problem already solved in the codebase.
- Do not assume an API contract. Read the existing client, types, mocks, or backend documentation first.

This file provides frontend implementation guidance; it does not override approved product or business decisions. If documentation, API contracts, tests, and implementation conflict, report the conflict instead of silently choosing a new behavior.

---

## 5. Working Principles

### 5.1. Make focused changes

- Change only what is required for the task.
- Avoid unrelated refactors.
- Do not reformat entire files unnecessarily.
- Preserve public component and function APIs unless the task requires a breaking change.
- Remove dead code introduced by the change.
- Do not leave commented-out code.

### 5.2. Prefer clarity

- Use descriptive names.
- Keep components and functions small enough to understand.
- Avoid clever abstractions.
- Extract shared logic only when there is real reuse or complexity.
- Prefer explicit code over premature generalization.

### 5.3. Preserve business correctness

Frontend code may:

- Validate obvious input mistakes.
- Disable invalid actions.
- Show business states.
- Improve user feedback.

Frontend code must not be the sole enforcement point for:

- Order ownership
- Table-session validity
- Price calculation
- Payment confirmation
- Role authorization
- Order-state transitions
- Idempotency
- Race-condition prevention

The backend remains authoritative.

---

## 6. Recommended Project Structure

Follow the existing project structure first. When no clear structure exists, prefer:

```text
src/
├── app/
│   ├── (customer)/
│   ├── (operation)/
│   ├── (admin)/
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/
│   ├── shared/
│   └── features/
├── features/
│   ├── catalog/
│   ├── ordering/
│   ├── payment/
│   ├── store/
│   └── operation/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── config/
│   ├── errors/
│   └── utils/
├── hooks/
├── types/
└── test/
```

Guidelines:

- Keep Customer, Operation, and Admin in the same Next.js application while allowing each area to have a distinct layout.
- Do not add Next.js API routes as a second business backend. Business requests go to CAS Backend.
- Route-specific code should stay close to its route when it is not reused.
- Shared business-facing code should live under `features`.
- Generic presentational primitives should live under `components/ui`.
- Generic reusable components should live under `components/shared`.
- API transport code should live under `lib/api`.
- Do not create a global `utils.ts` dumping ground.
- Prefer one clear responsibility per module.

---

## 7. Next.js App Router Rules

### 7.1. Server Components by default

Use Server Components unless the component requires:

- Browser-only APIs
- Local interactive state
- Event handlers
- Effects
- Client-only libraries

Add `"use client"` only at the smallest necessary boundary.

Do not mark an entire page or layout as a Client Component just because one child is interactive.

### 7.2. Data fetching

Prefer server-side data fetching for:

- Initial page data
- SEO-relevant content
- Data not requiring continuous client interaction

Prefer client-side fetching for:

- Live operational screens
- Polling updates
- User-triggered refreshes
- Highly interactive state

Rules:

- Centralize HTTP behavior in the API layer.
- Do not call `fetch` with duplicated headers and error handling across components.
- Use explicit caching behavior.
- Do not rely on Next.js caching defaults for business-critical operational data.
- Order, payment, and table-session screens should favor freshness over aggressive caching.
- Never cache authenticated user-specific responses globally.
- Use REST polling for changes created by other devices.
- Apply a successful mutation response immediately instead of waiting for the next poll.
- Do not introduce SSE or WebSocket without a new approved architecture decision.
- Keep polling intervals configurable and do not invent a fixed interval when the task or API contract has not defined one.

### 7.3. Route files

Use framework conventions correctly:

- `page.tsx` for routes
- `layout.tsx` for shared route layout
- `loading.tsx` for route-level loading UI
- `error.tsx` for recoverable route errors
- `not-found.tsx` for missing resources

Keep route files thin. Move non-trivial UI and logic into feature modules.

### 7.4. URL state

Use URL search parameters for state that should be:

- Shareable
- Bookmarkable
- Restorable after refresh
- Part of navigation history

Examples:

- Menu category
- Search keyword
- Order filters
- Pagination
- Operational status filters

Do not put temporary UI state such as dialog visibility in the URL unless there is a clear navigation benefit.

---

## 8. React Rules

### 8.1. State

Use the smallest state scope possible.

Prefer:

1. Derived values calculated during render.
2. Local component state.
3. Lifted state shared by nearby components.
4. Context for stable cross-tree concerns.
5. A dedicated state library only when clearly justified.

Do not store derived data in state.

Bad:

```tsx
const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0));
}, [items]);
```

Prefer:

```tsx
const total = items.reduce((sum, item) => sum + item.price, 0);
```

### 8.2. Effects

Use `useEffect` only for synchronization with external systems, such as:

- Browser APIs
- Subscriptions
- Timers
- Imperative third-party widgets
- Network behavior that cannot be handled by the selected data-fetching pattern

Do not use effects for values that can be calculated during render.

Always clean up subscriptions, observers, and timers.

### 8.3. Components

- Use function components.
- Keep props explicit and typed.
- Prefer composition over large sets of boolean props.
- Avoid components that mix data fetching, complex business logic, and large UI trees.
- Split by responsibility, not by arbitrary line count.
- Use stable keys based on entity IDs, never array indexes for mutable lists.

### 8.4. Event handlers

Use names that describe the event or intent:

- `handleSubmitOrder`
- `handleRequestPayment`
- `handleCategoryChange`

Do not use vague names such as `handleClick` when multiple actions exist.

---

## 9. TypeScript Rules

TypeScript must remain strict.

- Do not use `any` unless integrating an untyped boundary and the reason is documented.
- Prefer `unknown` over `any` for untrusted data.
- Narrow unknown values before use.
- Do not silence errors with broad type assertions.
- Do not duplicate backend enum values in many files.
- Centralize domain types and status unions.
- Use discriminated unions for UI states when appropriate.
- Prefer `type` for unions and object aliases.
- Prefer `interface` when extension or declaration merging is intentional.
- Avoid optional fields when the value is actually required in a specific state.

Example:

```ts
type PaymentViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; qrUrl: string; formattedAmount: string }
  | { status: "error"; message: string };
```

For money:

- Do not use floating-point arithmetic for business calculations.
- Preserve the exact representation defined by the backend API contract.
- Format values for display only at the UI boundary.
- Never recalculate the authoritative payable amount independently from incomplete frontend data.

---

## 10. API Client Rules

Create a consistent API boundary.

Every request should handle:

- Base URL
- JWT authentication for Admin and Operation requests
- Content type
- Serialization
- Timeout or cancellation where appropriate
- Non-2xx responses
- Validation of returned data when needed
- Mapping technical errors to user-facing errors

Recommended shape:

```text
lib/api/
├── client.ts
├── errors.ts
├── endpoints.ts
└── modules/
    ├── catalog.api.ts
    ├── ordering.api.ts
    ├── payment.api.ts
    └── table.api.ts
```

Rules:

- Components should not know raw endpoint strings.
- Customer requests must not require an operational JWT unless an approved API contract explicitly says otherwise.
- Access-token attachment and refresh-token handling must be centralized in the API/auth layer.
- Do not expose backend error internals directly to customers.
- Preserve error codes when the UI needs different handling.
- Support request cancellation for searches and rapidly changing filters.
- Prevent duplicate submissions for order and payment actions.
- Prefer idempotency support from the backend when available.
- Never retry a mutation automatically unless the operation is proven idempotent.

Polling rules:

- Poll only screens that need changes created by another device.
- Use the latest successful server response as the displayed source of truth.
- Prevent overlapping poll requests.
- Stop or reduce polling when the page is hidden when appropriate.
- Resume with an immediate refresh when the page becomes active.
- A polling failure must not erase the last valid state.
- Do not poll the menu continuously; the backend validates current availability again when an order is submitted.

---

## 11. Domain-Specific Frontend Rules

### 11.1. Table QR

- Treat the QR token as untrusted input.
- Do not assume a table exists because a token is present.
- Show a clear invalid or expired QR state.
- Do not expose internal table database IDs unnecessarily.
- Preserve the active table session context across menu navigation.

### 11.2. Menu

- Optimize for mobile use.
- Show item availability clearly.
- Prevent adding unavailable items.
- Handle price or availability changes returned by the backend.
- Do not rely solely on stale cached menu data during order submission.
- Images must include meaningful alternative text.
- Use image dimensions or aspect ratios to avoid layout shifts.
- Admin sends image files to CAS Backend. Frontend must not upload directly to Cloudinary.
- Store and render only the finalized media URL returned by the backend.

### 11.3. Ordering

- An active table session may contain multiple orders.
- “Add more items” should create or submit an additional order in the current session according to the backend contract.
- Disable repeated submission while a request is pending.
- Show a clear confirmation after submission.
- Preserve the cart after recoverable errors.
- Clear the cart only after confirmed successful submission.
- Show backend-confirmed item prices and totals.
- `orders` has no independent business status. Display table-session, cancellation-request, and payment states where relevant.

### 11.4. Payment

The current payment-status flow is manually confirmed by an operator.

- The customer requests payment.
- The backend creates a `PENDING` payment whose amount equals the session's authoritative order total.
- The customer UI instructs the customer to meet an operator to finish payment.
- The operator verifies the successful transfer through the external “ting ting” notification speaker.
- The operator confirms payment.
- The backend changes the payment to `PAID`.
- The backend closes the table session.

Frontend rules:

- Do not show a “paid” state before backend confirmation.
- Do not infer payment success from elapsed time.
- Do not automatically close a table session.
- Show the exact amount returned by the backend.
- Never submit a client-calculated amount as authoritative payment data.
- Do not display or collect bank account, bank name, account-holder, transfer-reference, QR-payment, or transaction data.
- Clearly tell the customer that they must meet an operator after requesting payment.
- The operator confirmation UI must state that confirmation is allowed only after the external speaker reports a successful transfer.
- Do not imply that CAS reads or integrates with the speaker; verification is a manual action outside CAS.
- Require an explicit confirmation action from the operator.
- Protect confirmation from accidental double clicks.
- Show who confirmed payment when that data is available.
- Treat payment confirmation as a high-impact mutation.

### 11.5. Operational screens

- Favor current data over long cache duration.
- Make pending, failed, canceled, and completed states visually distinct.
- Keep primary actions easy to find.
- Avoid hidden critical actions.
- Require confirmation for destructive or irreversible actions.
- Do not use color as the only status indicator.
- Keep screens usable on tablets and common desktop sizes.

---

## 12. Styling and UI

Use Tailwind CSS 4 and existing design tokens.

### 12.1. General rules

- Mobile-first for Customer flows.
- Desktop-first web layout for Operation screens used by restaurant staff, with responsive mobile layouts.
- Desktop-first web layout for Admin screens.
- Keep Customer, Operation, and Admin responsive beyond their primary target size.
- Use consistent spacing, typography, radius, and control heights.
- Reuse existing UI primitives.
- Avoid arbitrary values when a token or standard utility works.
- Do not introduce inline styles without a concrete reason.
- Avoid excessive animation.
- Respect reduced-motion preferences.
- Ensure touch targets are large enough for mobile operation.

### 12.2. Accessibility

Minimum requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Form labels
- Accessible names for icon buttons
- Correct heading order
- Sufficient contrast
- Error messages connected to inputs
- Status updates announced appropriately when needed
- Dialog focus management
- No interaction available only through hover

Use native elements before recreating controls with generic `div` elements.

### 12.3. Loading and empty states

Every data-driven screen should consider:

- Initial loading
- Background refresh
- Empty data
- Recoverable error
- Permission denied
- Not found
- Offline or network failure where relevant

Avoid blank screens.

Use skeletons only when they improve perceived stability. Do not use them for very short operations that would cause flashing.

---

## 13. Forms and Validation

- Use controlled or uncontrolled forms consistently within a feature.
- Validate required fields and obvious input constraints in the frontend.
- Treat backend validation as authoritative.
- Show field-specific errors close to the relevant input.
- Show a form-level message for non-field errors.
- Preserve user input after failed submissions.
- Disable submit only when necessary.
- Do not hide the reason an action is unavailable.
- Trim user-entered text when the domain requires it.
- Do not silently change meaningful user input.

For operator confirmation actions, make the requested action explicit.

Example:

```text
Confirm received payment of 320,000 ₫?
```

Prefer this over:

```text
Are you sure?
```

---

## 14. Authentication and Authorization

- Customer does not log in and must not be treated as role `USER`.
- Firebase Authentication is the primary authentication mechanism used by `ADMIN` and `OPERATOR`.
- Client attaches Firebase ID Token in the `Authorization: Bearer <Firebase_ID_Token>` header for protected backend requests.
- Do not fall back to `sessionStorage` or IndexedDB as an alternative token store without an approved architecture change.
- Use the token transport and storage mechanism defined by the backend API contract. The split between in-memory state and secure cookies has not yet been approved.
- Centralize access-token attachment, refresh, authentication failure, and logout behavior.
- Do not decode a JWT and treat its claims as trusted authorization without backend enforcement.
- Client-side role checks improve UX but are not security boundaries.
- Hide or disable unauthorized actions, but expect the backend to reject unauthorized requests.
- Handle `401` and `403` differently.
- Only show account-creation functionality to `ADMIN`, while still relying on backend authorization.
- Do not invent detailed Admin/Operator permissions before they are approved.
- Do not expose secrets through `NEXT_PUBLIC_*` variables.
- Only values safe for every browser user may use the `NEXT_PUBLIC_` prefix.

---

## 15. Error Handling

Errors should be:

- Actionable
- Understandable
- Appropriate for the actor
- Logged with enough context for debugging
- Free of secrets and sensitive details

Customer-facing messages should avoid technical terminology.

Operator-facing messages may include an error reference or code, but not stack traces.

Do not catch errors and ignore them.

When an operation fails:

1. Preserve valid user state.
2. Explain what failed.
3. Provide a safe retry when appropriate.
4. Avoid duplicate mutation risk.
5. Log technical context through the approved mechanism.

---

## 16. Testing

All meaningful behavior changes require appropriate tests.

### 16.1. Unit and component tests

Use Vitest and React Testing Library.

Test:

- User-visible behavior
- Business-relevant rendering
- Form validation
- Loading, empty, and error states
- Disabled and pending states
- Role-based UI behavior
- Critical formatting and mapping logic

Avoid testing internal implementation details.

Prefer queries by:

1. Role
2. Label
3. Visible text
4. Test ID only when semantic queries are impractical

### 16.2. End-to-end tests

Use Playwright for critical flows:

- Open menu from a valid table QR
- Handle an invalid QR
- Add items to cart
- Submit an order
- Add more items in the same table session
- Request payment
- Show the instruction requiring the customer to meet an operator
- Confirm payment manually
- Finish the table session
- Reject unauthorized operational access

E2E tests should use stable test data and should not depend on production services. Cloudinary integration must be stubbed or run against an explicitly approved non-production environment.

### 16.3. Regression rules

When fixing a bug:

1. Reproduce it.
2. Add a failing test when practical.
3. Implement the fix.
4. Verify the test passes.
5. Check related states and routes.

---

## 17. Commands

Use the scripts already defined in `package.json`.

Typical commands may include:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

Do not assume a command exists. Check `package.json` first.

Before completing a task, run the most relevant available checks.

Minimum expectation for normal code changes:

```bash
npm run lint
npm run format # or npx prettier --write src/
npm run typecheck
npm run test
```

For routing, build configuration, server/client boundaries, or production-sensitive changes:

```bash
npm run build
```

For critical user flows:

```bash
npm run test:e2e
```

If a command cannot be run, clearly report:

- Which command was not run
- Why it was not run
- What risk remains

---

## 18. Environment Configuration

- Keep environment variables documented in an example file such as `.env.example`.
- Never commit real secrets.
- Validate required server-side environment variables during startup.
- Expose browser variables only when necessary.
- Use clear names.
- Keep environment-specific endpoints outside source code.
- Do not silently fall back to production services during local development or tests.

Example categories:

```text
API base URL
Application environment
Feature flags
Observability configuration
```

Do not add Cloudinary credentials or upload presets to frontend environment variables. CAS Backend owns the integration and returns finalized media data.

---

## 19. Performance

Prioritize performance on customer mobile devices.

- Keep Client Component boundaries small.
- Avoid large client bundles.
- Dynamically load heavy, non-critical UI when appropriate.
- Optimize images through the approved Next.js image configuration.
- Prevent layout shifts.
- Avoid unnecessary re-renders.
- Memoize only when measurement or clear behavior justifies it.
- Paginate or virtualize long operational lists when needed.
- Debounce search input only when it improves behavior.
- Do not poll faster than the business need requires.
- Stop polling when the page is hidden when appropriate.

Do not sacrifice correctness for caching.

---

## 20. Security

Treat all browser input and external data as untrusted.

- Never insert unsanitized HTML.
- Avoid `dangerouslySetInnerHTML`.
- Do not expose secrets, JWTs, internal IDs, stack traces, or infrastructure details in rendered UI, URLs, logs, analytics, or error reports.
- Encode route parameters correctly.
- Validate redirect destinations.
- Avoid open redirects.
- Use CSRF protection according to the backend authentication model.
- Do not log sensitive payment or authentication data.
- Do not trust role, price, total, order status, or payment status supplied only by the browser.
- Do not call Cloudinary APIs directly from browser code.

---

## 21. Git and Change Hygiene

- Keep commits focused.
- Use meaningful commit messages.
- Do not commit generated build output unless the repository explicitly tracks it.
- Do not edit `package-lock.json` manually.
- Do not include unrelated dependency updates.
- Do not rename files only for style unless required.
- Preserve line endings and repository formatting.
- Review the final diff before reporting completion.

---

## 22. Definition of Done

A frontend task is complete when:

- The requested behavior is implemented.
- The implementation follows existing project patterns.
- Types are correct.
- Loading, empty, error, and pending states are handled where relevant.
- Accessibility is considered.
- Critical business actions cannot be accidentally submitted multiple times.
- Tests are added or updated.
- Relevant lint, test, build, and E2E checks pass.
- No secrets or debug code are introduced.
- Documentation is updated when behavior, configuration, or architecture changes.
- The final response explains changed files and verification results.

---

## 23. Agent Response Format

After completing a coding task, report:

```text
Summary
- What changed

Files changed
- path/to/file: reason

Validation
- Command: result

Notes
- Remaining risks, assumptions, or follow-up items
```

Do not claim a check passed unless it was actually run.

Do not claim a file was changed unless it was actually changed.

Do not hide unresolved errors.

---

## 24. Prohibited Actions

Do not:

- Invent API endpoints or response fields.
- Add a global state library without approval.
- Add a component library without approval.
- Split Customer, Operation, and Admin into separate frontend applications without approval.
- Replace Tailwind with another styling system.
- Convert Server Components to Client Components unnecessarily.
- Implement payment success based on frontend assumptions.
- Add SSE, WebSocket, or Redis Pub/Sub without an approved architecture change.
- Close table sessions from frontend-only logic.
- Duplicate backend business rules as an authoritative source.
- Use `any` to bypass type errors.
- Disable ESLint rules broadly to make code pass.
- Remove tests merely because they fail.
- Perform unrelated refactors.
- Add out-of-scope CAS features unless explicitly requested.

## Frontend Design System

- **Colors**: Always use the design tokens defined in `frontend/src/app/globals.css` (e.g., `cas-primary`, `cas-error`, `cas-secondary`, `cas-tertiary`, `cas-on-surface`, `cas-on-surface-variant`, `cas-surface`, `cas-outline-variant`, etc.). Never use raw Tailwind color utilities such as `red-500`, `emerald-500`, `rose-500`, `amber-500`, `slate-500`, or any other hardcoded palette color. If a new color is genuinely needed and no existing token fits, ask the user for approval before adding it to `globals.css`.
- **Fonts**: Always use the system font stack defined via `--font-cas` in `globals.css`, applied globally through the `font-sans` Tailwind utility on `<body>`. Never declare a custom `font-family`, import a separate Google Font, or use any Tailwind font utility other than `font-sans`. If a new typeface is required, ask the user for approval before adding it.
- Minimize additions to the design system. Reuse existing tokens first. Adding new tokens or colors requires explicit user approval.

