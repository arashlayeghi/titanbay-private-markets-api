# Titanbay Private Markets API

RESTful API for managing private market funds, investors, and their investments.

Built as a take-home assessment for the Senior Software Engineer role at [Titanbay](https://titanbay.com).

## Tech Stack

- **Runtime:** Node.js 24 with TypeScript
- **Framework:** Express.js 5
- **Database:** PostgreSQL 17 with Prisma ORM v7
- **Validation:** Zod v4
- **Testing:** Vitest + Supertest (TDD approach)
- **Tooling:** ESLint, Prettier, Husky, lint-staged, Docker Compose

## Prerequisites

- Node.js >= 24 (recommended: use [nvm](https://github.com/nvm-sh/nvm) with the included `.nvmrc`)
- Docker & Docker Compose
- npm

## Getting Started

### Quick Setup (Recommended)
```bash
git clone https://github.com/arashlayeghi/titanbay-private-markets-api.git
cd titanbay-private-markets-api
nvm use
./scripts/setup.sh
npm run dev
```

### Manual Setup
```bash
# Clone the repository
git clone https://github.com/arashlayeghi/titanbay-private-markets-api.git
cd titanbay-private-markets-api

# Use the correct Node version
nvm use

# Install dependencies
npm install

# Start PostgreSQL
docker compose up -d

# Set up environment
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Apply migrations to test database
DATABASE_URL=postgresql://titanbay:titanbay_dev@localhost:5432/titanbay_test?schema=public npx prisma migrate deploy

# Seed the database (optional)
npm run db:seed

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3000`.

## Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

Full specification: [Titanbay Private Markets API v1.0.0](https://storage.googleapis.com/interview-api-doc-funds.wearebusy.engineering/index.html)

### Funds

| Method | Endpoint      | Description            |
|--------|---------------|------------------------|
| GET    | /funds        | List all funds         |
| POST   | /funds        | Create a new fund      |
| PUT    | /funds/:id    | Update an existing fund|
| GET    | /funds/:id    | Get a specific fund    |

### Investors

| Method | Endpoint      | Description            |
|--------|---------------|------------------------|
| GET    | /investors    | List all investors     |
| POST   | /investors    | Create a new investor  |

### Investments

| Method | Endpoint                          | Description                       |
|--------|-----------------------------------|-----------------------------------|
| GET    | /funds/:fund_id/investments       | List investments for a fund       |
| POST   | /funds/:fund_id/investments       | Create an investment for a fund   |

## Design Decisions

### Architecture

The project follows a **layered architecture** with clear separation of concerns:

- **Routes** — Define endpoints and attach validation middleware
- **Controllers** — Handle HTTP request/response, delegate to services
- **Services** — Contain business logic and database operations
- **Validators** — Define Zod schemas for input validation
- **Middleware** — Reusable request validation and error handling

This structure keeps each layer focused on a single responsibility. Controllers never touch the database directly, and services have no knowledge of HTTP — making both independently testable.

### Database

- **Decimal(18, 2)** for all monetary values — floating point arithmetic introduces rounding errors that are unacceptable in financial systems
- **Database-level enums** for `FundStatus` (Fundraising, Investing, Closed) and `InvestorType` (Individual, Institution, Family Office) — enforces data integrity beyond application-level validation
- **Unique constraint** on investor email — prevents duplicates at the database level
- **Foreign keys** with referential integrity on investments — an investment cannot reference a non-existent fund or investor
- **Prisma v7** with `@prisma/adapter-pg` driver adapter — uses the latest Prisma version with native Node.js PostgreSQL driver

### Validation

- **Zod v4** for runtime validation with TypeScript type inference — schemas serve as the single source of truth for both validation rules and TypeScript types (`z.infer`)
- **Reusable validation middleware** — a single `validateRequest` middleware handles both body and param validation across all routes
- **Consistent error responses** — all validation errors return the same shape with field-level detail

### Error Handling

- **Centralised API response utility** (`ApiResponse`) — ensures consistent response shapes across all endpoints
- **Global error handler middleware** — catches any unhandled errors and returns a clean 500 response
- **Business logic errors** (e.g., duplicate email, fund not found) are thrown as named errors in the service layer and mapped to appropriate HTTP status codes in controllers

### Testing

- **TDD approach** — tests were written before implementation (visible in git history)
- **Integration tests** with Supertest — tests hit actual endpoints against a real test database
- **Separate test database** — isolated from development data, cleaned between each test
- **Sequential test execution** — prevents race conditions when multiple test files share the same database

## Assumptions

- The [API spec](https://storage.googleapis.com/interview-api-doc-funds.wearebusy.engineering/index.html#funds) defines `PUT /funds` with the fund `id` in the request body. I chose to use `PUT /funds/:id` instead, as REST convention identifies resources via the URL. This also prevents any ambiguity around whether the `id` itself can be updated — it cannot, as it's a server-generated UUID. The request body contains only the mutable fields.
- All request body fields are treated as required for both POST and PUT endpoints. This aligns with PUT semantics (full resource replacement rather than partial update, which would be PATCH) and POST semantics (all fields needed to create a valid resource). The API spec examples consistently include all fields in every request body.
- The `GET /funds` response example in the spec shows `"status": "fundraising"` (lowercase), while all other endpoints and the Data Model definition use capitalised values (`Fundraising`, `Investing`, `Closed`). I followed the Data Model definition with capitalised status values for consistency.
- `investment_date` is a date-only field (no time component), stored as a PostgreSQL `DATE` type
- Investor email uniqueness is enforced — attempting to create a duplicate returns `409 Conflict`
- Fund and investor existence is validated before creating an investment — returns `404` if either doesn't exist
- The API does not implement authentication/authorisation — this would be a priority addition for production

## Scripts

| Command              | Description                        |
|----------------------|------------------------------------|
| `npm run dev`        | Start development server           |
| `npm run build`      | Compile TypeScript                 |
| `npm start`          | Run compiled server                |
| `npm test`           | Run all tests                      |
| `npm run test:watch` | Run tests in watch mode            |
| `npm run lint`       | Lint source files                  |
| `npm run lint:fix`   | Lint and auto-fix                  |
| `npm run format`     | Format source files                |
| `npm run db:migrate` | Run database migrations            |
| `npm run db:seed`    | Seed the database                  |
| `npm run db:studio`  | Open Prisma Studio                 |

## Git Hooks

Pre-configured with Husky and lint-staged:

- **Pre-commit** — Runs Prettier and ESLint on staged `.ts` files
- **Pre-push** — Runs the full test suite to prevent broken code from reaching the remote