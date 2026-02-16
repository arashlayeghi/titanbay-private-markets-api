# Titanbay Private Markets API

RESTful API for managing private market funds, investors, and their investments.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Validation:** Zod
- **Testing:** Vitest + Supertest
- **Tooling:** ESLint, Prettier, Husky, Docker Compose

## Prerequisites

- Node.js >= 24 (recommended: use [nvm](https://github.com/nvm-sh/nvm) with the included `.nvmrc`)
- Docker & Docker Compose
- npm

## Getting Started
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
npm run db:migrate

# Seed the database
npm run db:seed

# Start the development server
npm run dev
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Documentation

See the [API Specification](https://storage.googleapis.com/interview-api-doc-funds.wearebusy.engineering/index.html) for full endpoint documentation.