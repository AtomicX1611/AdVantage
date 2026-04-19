# Backend Tests and CI Guide

This document explains the backend test suite and the GitHub Actions workflow in plain language. It follows the actual flow used by the codebase: package scripts -> Jest configuration -> helper setup -> unit tests -> integration tests -> GitHub Actions.

## 1. What Runs When You Test the Backend

The backend package is in `backend/`. Its test-related scripts are defined in `backend/package.json`:

- `npm test` runs `jest --runInBand`.
- `npm run test:coverage` runs `jest --coverage --runInBand`.
- `npm run test:report` runs `jest --coverage --ci --runInBand`.

### What those commands mean

- `jest` is the test runner.
- `--runInBand` means tests run one after another in a single process instead of in parallel.
- `--coverage` tells Jest to measure which source lines were exercised.
- `--ci` makes Jest behave like a CI environment, which is stricter and less interactive.

Running tests sequentially matters here because several tests use the same in-memory Mongo helper and shared model setup.

## 2. Jest Configuration

The backend Jest config is in `backend/jest.config.cjs`.

### Important settings

- `testEnvironment: "node"`
  - Jest uses a Node runtime, not a browser DOM.
- `roots: ["<rootDir>/tests"]`
  - Jest only looks under the `backend/tests` folder.
- `testTimeout: 180000`
  - Each test or hook can take up to 180 seconds.
  - This is important for `mongodb-memory-server`, because the first run may need to download a MongoDB binary.
- `transform: { "^.+\\.js$": "babel-jest" }`
  - Jest passes JavaScript files through Babel so modern `import`/`export` syntax works.
- `collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js"]`
  - Coverage is collected from the backend source code.
  - Test files themselves are excluded.

## 3. How the App Is Wired for Tests

The main application factory is in `backend/src/app.create.js`.

That file exports `createApp()`, which builds an Express app without immediately starting a network server. This is why tests can import it and mount the app inside `supertest`.

### Request setup inside `createApp()`

Before routes are mounted, the app installs:

- `morgan` request logging
- `helmet` security headers
- `cookie-parser` so cookies are available as `req.cookies`
- CORS allowing local frontend origins
- JSON and URL-encoded body parsing
- static serving for `/uploads`
- optional Swagger UI at `/api-docs` when `swagger.json` exists

### Route mounting

The app mounts these routers:

- `/auth` -> auth router
- `/user` -> user router
- `/manager` -> manager router
- `/admin` -> admin router
- `/anyone` -> public product router
- `/chatbot` -> chatbot router
- `/chat` -> chat router

At the end, `errorMiddleware` is attached, so thrown errors and rejected async handlers are normalized into HTTP responses.

## 4. Test Helper for Mongo Memory

The shared test helper is `backend/tests/helpers/mongoMemory.js`.

### What it does

- `connectMemoryDb()` starts `MongoMemoryServer` and connects Mongoose to the temporary database.
- `clearMemoryDb()` deletes documents from every connected collection between tests.
- `disconnectMemoryDb()` closes the Mongoose connection and stops the in-memory server.

### Why this exists

The integration tests need a real MongoDB API, but they should not depend on a real external Mongo server. The helper creates a disposable local database for each test file.

### Why the helper was adjusted

The helper pins the Mongo binary version and disables MD5 checking because the default latest binary download was flaky in this environment. That keeps the integration tests deterministic.

## 5. Unit Test Files

Unit tests mock their dependencies with `jest.mock(...)`. They do not hit a real database or external service. Their job is to verify the business logic inside a single service or middleware file.

### 5.1 `backend/tests/unit/auth.service.test.js`

This file tests `backend/src/services/auth.service.js`.

It mocks:

- `users.dao.js`
- `pendingUser.dao.js`
- `admins.dao.js`
- `managers.dao.js`
- `google-auth-library`
- `nodemailer`

That means the test focuses only on how the service reacts to different DAO and library results.

#### Test flow

1. `beforeEach()` clears mocks and sets `JWT_SECRET`.
2. `buyerLoginService` is tested with three scenarios:
   - no buyer found -> returns `success: false` and `status: 404`
   - wrong password -> returns `success: false` and `status: 401`
   - correct password -> returns a token and `success: true`
3. `getMyInfoService` is tested for a normal user:
   - `getBuyerById` returns a user object with `password` and `wishlistProducts`
   - the service sanitizes the result
   - it removes sensitive fields like password
   - it adds `role: "user"`
4. `getMyInfoService` is tested with an unknown role:
   - it returns `success: false` and `status: 400`

#### What this proves

The auth service correctly handles login failures, creates JWTs on success, and sanitizes user profile data for the `/auth/me` path.

### 5.2 `backend/tests/unit/buyer.service.test.js`

This file tests `backend/src/services/buyer.service.js`.

It mocks:

- buyer/user DAOs
- Razorpay order creation
- product DAOs
- order DAOs
- notification helpers
- webhook signature verification

#### Test flow

1. `createOrderService("u1", false, 99)` checks validation.
   - `99` is not a valid subscription plan.
   - the service returns `success: false` and `status: 400`.
2. `createOrderService("u1", false, 1)` checks the subscription order path.
   - the buyer is found
   - Razorpay order creation is mocked to succeed
   - the order is also persisted through `createOrderDao`
   - the service returns success
3. `verifyPaymentService(...)` checks the failure branch.
   - webhook signature validation returns false
   - order lookup succeeds
   - order status is updated to failed
   - product payment hold is released
   - the service returns `success: false` and `status: 400`
4. `verifyPaymentService(...)` checks the success branch.
   - webhook signature validation returns true
   - order lookup succeeds
   - order status is updated to paid with the payment ID
   - the service returns `success: true` and `status: 200`

#### What this proves

This service covers the payment flow: create an order, validate the payment signature, mark the order paid, or release the held product if the signature is invalid.

### 5.3 `backend/tests/unit/seller.service.test.js`

This file tests `backend/src/services/seller.service.js`.

It mocks:

- product DAOs
- user DAOs
- payment DAOs
- admin DAOs
- notification helpers
- product embedding helper

#### Test flow

1. `acceptProductRequestService("p1", "b1")` with a DAO failure.
   - the DAO returns `success: false` and `reason: "no_request"`
   - the service maps that into a `400` response
2. `acceptProductRequestService("p1", "b1")` with success.
   - the DAO returns `sellerId` and `productName`
   - the service sends an acceptance notification
3. `rejectProductRequestService("p1", "b1")` with success.
   - the service sends a rejection notification
4. `revokeAcceptedRequestService("p1")` with success.
   - the service sends a revoke notification to the buyer

#### What this proves

The seller service is mostly a coordinator. It translates DAO outcomes into user-facing responses and triggers notifications when request state changes.

### 5.4 `backend/tests/unit/anyone.service.test.js`

This file tests `backend/src/services/anyone.service.js`.

It mocks:

- public product DAOs
- search embedding helper

#### Test flow

1. `getFeaturedFreshProductsService()`.
   - it returns featured products and fresh products together
2. `getProductDetailsService("missing")`.
   - product lookup returns `null`
   - the service returns `success: false` and `status: 404`
3. `getProductsService({ name: "iphone", limit: "5", numCandidates: "15" })`.
   - because `name` is present, the service generates a search embedding
   - then it uses `vectorSearchProducts`
4. `getProductsService({ category: "Mobiles", verified: "true" })`.
   - because there is no name query, it falls back to `findProducts`

#### What this proves

The public product search service has two paths:

- semantic/vector search when a text query is provided
- normal filtered database search when it is not

### 5.5 `backend/tests/unit/protect.middleware.test.js`

This file tests `backend/src/middlewares/protect.js`.

It mocks `jsonwebtoken.verify`.

#### Middleware being tested

- `checkToken`
- `serializeUser`
- `authorize`

#### Test flow

1. `checkToken` with no cookie.
   - the middleware returns HTTP 403
2. `checkToken` with a token cookie.
   - the token is copied into `req.token`
   - `next()` is called
3. `serializeUser` with a bad token.
   - JWT verification fails
   - the middleware returns HTTP 403
4. `serializeUser` with a valid token.
   - JWT verification succeeds
   - `req.user` is attached from the decoded payload
   - `next()` is called
5. `authorize("admin")` with a user role.
   - the middleware blocks access with HTTP 403

#### What this proves

These tests verify the auth gatekeeping layer that protects private routes:

- token presence check
- token decoding
- role-based authorization

## 6. Integration Test Files

Integration tests use the real Mongoose models and DAOs against the in-memory Mongo database. They are slower than unit tests, but they prove the code actually works with data persistence.

### 6.1 `backend/tests/integration/auth.router.memory.test.js`

This file tests the real `/auth` HTTP routes through `supertest`.

#### Setup flow

1. `beforeAll()` sets required environment variables:
   - `JWT_SECRET`
   - `RAZORPAYKEYID`
   - `RAZORPAYKEYSECRET`
2. It calls `connectMemoryDb()`.
3. It dynamically imports `createApp()` from `backend/src/app.create.js`.
4. It creates the Express app instance.
5. `beforeEach()` clears the in-memory database.
6. `afterAll()` disconnects and stops the memory server.

#### Test 1: login then `/auth/me`

1. A real user document is inserted with `Users.create(...)`.
2. `request.agent(app)` is used.
   - this is important because the agent preserves cookies across requests.
3. The agent sends `POST /auth/login` with email and password.
   - the login controller validates the body
   - it calls `buyerLoginService`
   - it sets the token cookie
4. The same agent sends `GET /auth/me`.
   - `checkToken` reads the cookie
   - `serializeUser` verifies the JWT and attaches `req.user`
   - `getMyInfo` looks up the user and returns the sanitized profile
5. The test checks that the response contains the expected email and role.

#### Test 2: `/auth/me` without token

1. A plain `request(app)` call is sent without cookies.
2. `checkToken` rejects it.
3. The response status is 403.

#### Test 3: `/auth/logout`

1. `DELETE /auth/logout` is sent.
2. The controller clears the `token` cookie.
3. The test checks for a 200 response and `success: true`.

#### What this proves

This is the real end-to-end auth flow:

- database user exists
- login creates a cookie
- cookie is reused for `/me`
- logout clears the cookie

### 6.2 `backend/tests/integration/products.dao.memory.test.js`

This file tests the products DAO layer directly against Mongo.

#### Setup flow

1. `connectMemoryDb()` starts the temporary database.
2. `beforeEach()` clears the database.
3. Each test inserts a seller and buyer using the real `Users` model.

#### Shared helper

`buildProductData(sellerId, overrides)` creates a realistic product object with:

- name
- price
- description
- zip code
- category and location
- seller reference
- images
- `isRental`

#### Test 1: `createProduct + findProducts`

1. The DAO creates a real product document.
2. `findProducts({ soldTo: null })` fetches unsold products.
3. The test checks:
   - exactly one product is returned
   - the name matches
   - the seller ID matches the inserted seller

#### Test 2: `getProductById`

1. A product is created.
2. `getProductById(created._id)` fetches it.
3. The DAO populates the seller reference.
4. The test checks that `fetched.seller.username` is `seller`.

#### Test 3: request flow and acceptance

1. A product is created.
2. `addProductRequestDao(productId, buyerId, 12000)` adds a bidding request.
3. `acceptProductRequestDao(productId, buyerId)` marks that buyer as the accepted buyer.
4. The final fetched product is checked to ensure:
   - `sellerAcceptedTo` equals the buyer ID
   - the requests array still contains the inserted request
   - the bidding price was stored correctly

#### Test 4: cannot request your own product

1. A seller creates a product.
2. The same seller tries to request it.
3. `addProductRequestDao` returns `success: false` with `reason: "self_request"`.

#### What this proves

The products DAO correctly handles creation, lookup, request insertion, acceptance, and self-request rejection using a real database.

### 6.3 `backend/tests/integration/users.dao.memory.test.js`

This file tests the user DAO layer against Mongo.

#### Setup flow

1. `connectMemoryDb()` starts the database once.
2. `beforeEach()` clears the database and recreates:
   - a seller
   - a buyer
   - a product belonging to the seller

#### Test 1: wishlist add and read

1. `addToWishlistDao(buyerId, productId)` pushes the product into the buyer wishlist.
2. `getWishlistProductsDao(buyerId)` populates those references.
3. The test checks that the wishlist contains exactly one product and that it is the right one.

#### Test 2: wishlist remove

1. The product is added to the wishlist.
2. `removeFromWishlistDao(buyerId, productId)` removes it.
3. `getWishlistProductsDao(buyerId)` confirms the wishlist is empty.

#### Test 3: profile update

1. `updateBuyerById(buyerId, { username, contact })` updates the buyer document.
2. The test checks that the returned document has the new values.

#### What this proves

The user DAO really updates persisted documents, including wishlist population and profile editing.

### 6.4 `backend/tests/integration/anyone.router.test.js`

This file tests the public `GET` routes under `/anyone`.

It does not use Mongo. Instead, it mocks `backend/src/services/anyone.service.js` and verifies the router/controller behavior.

#### App setup

1. A tiny Express app is created inside the test.
2. JSON parsing middleware is enabled.
3. The real anyone router is mounted at `/anyone`.
4. `errorMiddleware` is attached so route errors are handled consistently.

#### Test 1: `/anyone/HomeRequirements`

1. `getFeaturedFreshProductsService` is mocked to return featured and fresh products.
2. `GET /anyone/HomeRequirements` is sent.
3. The controller forwards the service result into a 200 response.

#### Test 2: `/anyone/products/:id`

1. `getProductDetailsService` is mocked to fail with a 404.
2. `GET /anyone/products/p-missing` is sent.
3. The controller returns status 404 with `success: false`.

#### Test 3: `/anyone/products/filtered`

1. `getProductsService` is mocked to return two products.
2. `GET /anyone/products/filtered?category=Mobiles` is sent.
3. The controller returns the products inside a `success: true` response.

#### What this proves

The public router is wired correctly, and it translates service outputs into HTTP responses as expected.

## 7. How the Main Request Flow Works

This section ties the code paths together.

### 7.1 Login flow

1. `POST /auth/login` hits `auth.router.js`.
2. The route calls `buyerLogin` in `auth.controller.js`.
3. The controller validates the request body.
4. It calls `buyerLoginService`.
5. The service looks up the user with `findBuyerByEmail`.
6. If the password matches, the service signs a JWT.
7. The controller stores that JWT in an HTTP-only cookie named `token`.
8. The response returns buyer ID and email.

### 7.2 `/auth/me` flow

1. The route uses `checkToken` first.
2. `checkToken` reads `req.cookies.token`.
3. If the token is missing, it returns 403.
4. If present, `serializeUser` verifies the JWT.
5. The decoded payload becomes `req.user`.
6. `getMyInfo` reads `req.user._id` and `req.user.role`.
7. `getMyInfoService` fetches the correct record and sanitizes it.
8. The controller sends the final profile data.

### 7.3 Product request flow

1. A buyer requests a product.
2. `requestProductService` calls `addProductRequestDao`.
3. The DAO checks product existence, self-request, sold state, and duplicate requests.
4. On success, the service creates a seller notification.
5. The seller can later accept, reject, or revoke the accepted request.

### 7.4 Payment flow

1. `createOrderService` either creates a subscription order or a product payment order.
2. For product payments, `holdPoductWhilePaymentDao` marks the product as in progress.
3. Razorpay order creation happens through `razorpay.orders.create(...)`.
4. `verifyPaymentService` checks the webhook signature.
5. If the signature is invalid, it marks the order failed and releases the product hold.
6. If valid, it marks the order paid.

## 8. GitHub Actions Workflow

The backend workflow file is `.github/workflows/backend-tests.yml`.

### When it runs

It triggers on:

- `push` to paths under `backend/**`
- `pull_request` affecting `backend/**`
- any direct change to `.github/workflows/backend-tests.yml`

So this workflow only runs when backend-related files change.

### Job environment

- The job name is `backend-test`.
- It runs on `ubuntu-latest`.
- `defaults.run.working-directory: backend` means every shell command runs inside the backend folder unless overridden.

### Step-by-step CI flow

1. **Checkout**
   - `actions/checkout@v5`
   - pulls the repository code onto the runner
2. **Setup Node**
   - `actions/setup-node@v5`
   - installs Node 20
   - enables npm cache
   - uses `backend/package-lock.json` as the cache dependency key
3. **Install dependencies**
   - runs `npm ci`
   - this is the strict install step
   - it fails if `package.json` and `package-lock.json` are inconsistent
4. **Run tests with coverage**
   - runs `npm run test:coverage`
   - executes Jest and generates the coverage folder
5. **Upload backend coverage artifact**
   - `actions/upload-artifact@v4`
   - uploads `backend/coverage`
   - the artifact is named `backend-coverage`

### Why `npm ci` matters here

`npm ci` is stricter than `npm install`.

- It does not try to resolve a new dependency graph.
- It expects the lockfile to already describe every package correctly.
- This is why the earlier `gcp-metadata` issue happened in CI.

### Why the coverage artifact exists

The uploaded artifact lets you inspect coverage output after the workflow finishes, without needing to rerun the job locally.

## 9. What Changed to Make the Tests Green

Two practical test-stability fixes were added during debugging:

- `backend/tests/helpers/mongoMemory.js`
  - pins the Mongo binary version and disables MD5 checking
- `backend/jest.config.cjs`
  - raises `testTimeout` to 180000

These do not change product logic. They only make the test environment more reliable.

## 10. Short Summary of Each Test File

- `backend/tests/unit/auth.service.test.js`
  - verifies auth business logic, login failures, JWT success, and sanitized profile lookup
- `backend/tests/unit/buyer.service.test.js`
  - verifies order creation and payment verification branches
- `backend/tests/unit/seller.service.test.js`
  - verifies request handling and notification dispatch
- `backend/tests/unit/anyone.service.test.js`
  - verifies public product listing, detail lookup, and search selection logic
- `backend/tests/unit/protect.middleware.test.js`
  - verifies token checking, JWT decoding, and role authorization
- `backend/tests/integration/auth.router.memory.test.js`
  - verifies the real `/auth` routes with cookies and in-memory Mongo
- `backend/tests/integration/products.dao.memory.test.js`
  - verifies product DAO behavior against a real temporary database
- `backend/tests/integration/users.dao.memory.test.js`
  - verifies wishlist and profile update DAO behavior against a real temporary database
- `backend/tests/integration/anyone.router.test.js`
  - verifies public router/controller wiring without hitting the database

## 11. Final Mental Model

If you want the shortest correct mental model, it is this:

1. Jest reads `backend/jest.config.cjs`.
2. Unit tests mock dependencies and verify pure logic.
3. Integration tests start MongoMemoryServer and use real models/DAOs.
4. Express app creation happens through `createApp()`.
5. Requests go through routes, controllers, services, DAOs, and finally Mongoose.
6. GitHub Actions does the same thing on Ubuntu with `npm ci` and coverage upload.
