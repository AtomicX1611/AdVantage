# Testing and CI Implementation Report

This document describes exactly what was added for automated testing and CI in this project.

## Scope Implemented

- Backend unit tests and integration tests using Jest.
- Client unit tests using Jest.
- Coverage and report scripts for both backend and client.
- GitHub Actions workflows for backend and client testing.

## What Was Added

### Backend testing stack

- Jest test runner.
- Supertest for route/integration testing.
- Babel Jest transform for ESM-compatible test execution.
- mongodb-memory-server for true in-memory Mongo integration testing.

Files added:
- `backend/jest.config.cjs`
- `backend/babel.config.cjs`
- `backend/tests/helpers/mongoMemory.js`
- `backend/tests/unit/anyone.service.test.js`
- `backend/tests/unit/buyer.service.test.js`
- `backend/tests/unit/seller.service.test.js`
- `backend/tests/unit/buyer.controller.test.js`
- `backend/tests/unit/auth.service.test.js`
- `backend/tests/unit/protect.middleware.test.js`
- `backend/tests/integration/anyone.router.test.js`
- `backend/tests/integration/products.dao.memory.test.js`
- `backend/tests/integration/users.dao.memory.test.js`
- `backend/tests/integration/auth.router.memory.test.js`

Package scripts added in `backend/package.json`:
- `npm run test`
- `npm run test:watch`
- `npm run test:coverage`
- `npm run test:report`

### Client testing stack

- Jest test runner.
- React Testing Library + jest-dom.
- Babel Jest transform for JSX.
- CSS module mapping with identity-obj-proxy.

Files added:
- `client/jest.config.cjs`
- `client/babel.config.cjs`
- `client/src/tests/setupTests.js`
- `client/src/redux/authSlice.test.js`
- `client/src/utils/authCheck.test.js`

Package scripts added in `client/package.json`:
- `npm run test`
- `npm run test:watch`
- `npm run test:coverage`
- `npm run test:report`

### CI workflows added

- `.github/workflows/backend-tests.yml`
- `.github/workflows/client-tests.yml`

What each workflow does:
- Install dependencies using `npm ci`.
- Run tests with coverage.
- Upload coverage artifacts.
- Client workflow also runs lint and build checks.

## How To Use Testing Locally

### Backend

```bash
cd backend
npm run test
npm run test:watch
npm run test:coverage
npm run test:report
```

Coverage output:
- `backend/coverage/`
- Includes terminal summary + HTML report.

### Client

```bash
cd client
npm run test
npm run test:watch
npm run test:coverage
npm run test:report
```

Coverage output:
- `client/coverage/`
- Includes terminal summary + HTML report.

## Tests Currently Covered

### Backend unit tests

- `anyone.service`
  - Featured/fresh product retrieval.
  - Product detail not found path.
  - Name query vector-search path.
  - Non-name query standard search path.

- `buyer.service`
  - Invalid subscription order input.
  - Successful subscription order creation.
  - Invalid payment signature handling + hold release.
  - Valid payment signature path + paid status update.

- `seller.service`
  - Accept request failure mapping.
  - Accept request success + notification.
  - Reject request success + notification.
  - Revoke accepted request success + notification.

- `buyer.controller`
  - create-order validation path.
  - create-order success response path.
  - verify-payment validation path.
  - verify-payment success response path.

- `auth.service`
  - buyer login: missing user, wrong password, success with token.
  - get-my-info: user sanitization and invalid-role branch.

- `protect` middleware
  - checkToken missing token and success path.
  - serializeUser invalid/valid token branches.
  - authorize role-block path.

### Backend integration tests

- `anyone` router:
  - Home requirements endpoint success.
  - Product detail endpoint not found response.
  - Filtered products endpoint success.

- `products.dao` with in-memory Mongo:
  - create product and fetch via search.
  - fetch by id with seller population.
  - request + accept flow persistence checks.
  - self-request rejection.

- `users.dao` with in-memory Mongo:
  - add/get/remove wishlist with real persistence.
  - profile update persistence.

- `auth` router with in-memory Mongo:
  - login followed by `/auth/me` returns authenticated profile.
  - `/auth/me` blocked without token.
  - `/auth/logout` success.

### Client unit tests

- `authSlice` reducer behavior:
  - loginStart
  - loginSuccess
  - loginFailure
  - logout

- `authCheck` utility:
  - Redirect behavior on 403.
  - Success behavior on 200.
  - `authFetch` credentials/header injection.
  - `authFetch` redirect on 403.

## How CI Gets Triggered

- Backend workflow triggers when backend files or backend workflow file changes.
- Client workflow triggers when client files or client workflow file changes.
- Both run on push and pull request.

## Notes

- The tests use mocks for external dependencies to keep the suite stable and fast.
- Persistence-level integration tests are now included via in-memory MongoDB, so write-read behavior is validated without touching your real DB.
- Coverage is generated on demand and is CI-ready.
- Backend suite status at implementation time: all backend tests pass (`10` suites, `39` tests).
