# AdVantage Mentor Requirements Task List

Scope: active work is in `backend/` and `client/`. The legacy `frontend/` folder is out of scope for this checklist.

This document breaks the mentor requirements into mostly independent work items so different team members can work in parallel.

## 1. Add Redis caching for hot backend reads and measure the gain

Implement a Redis cache-aside layer for the highest-traffic read endpoints in `backend/`, especially the ones that power the home page, search, product detail, wishlist, notifications, seller dashboards, and admin dashboards.

Suggested files to touch: `backend/src/services/anyone.service.js`, `backend/src/services/buyer.service.js`, `backend/src/services/seller.service.js`, `backend/src/services/admin.service.js`, `backend/src/services/manager.service.js`, `backend/src/daos/*.js`, `backend/src/helpers/*.js`, `backend/app.js`, and a new Redis config file under `backend/src/config/`.

What to cache first:
- Home page featured and fresh product lists.
- Product detail lookups.
- Filtered product search results.
- Buyer wishlist and notification counts.
- Seller dashboard summaries and transaction history.
- Admin metrics/graph data and manager dashboard summaries.

What to invalidate:
- Product create, update, delete, and availability changes.
- Request accept/reject/revoke flows.
- Payment verification and order status changes.
- Wishlist add/remove actions.
- Notification create/read/delete actions.

Deliverable:
- A short performance report comparing baseline vs Redis enabled behavior.
- Include at least p95 latency, average response time, DB query count, and Redis hit ratio.
- Use the existing load-test idea in `backend/quantification.js` or replace it with a proper repeatable benchmark script.

## 2. Move product search to Solr or another dedicated search engine

The current search path is Mongo filter plus embedding-based ranking. Replace the actual product search execution with Solr-backed indexing and querying so search becomes a separate optimized subsystem.

Suggested files to touch: `backend/src/services/anyone.service.js`, `backend/src/daos/products.dao.js`, `backend/src/helpers/productEmbedding.helper.js`, `backend/src/controllers/anyone.controller.js`, `backend/src/routes/anyone.router.js`, `client/src/pages/SearchPage.jsx`, `client/src/components/SearchPage/*`, and any product create/update/delete flow that must update the index.

What to index:
- Product name, description, category, city, state, district, zip code, rental flag, verified flag, price, posting date, seller id, and any ranking fields you want to boost.

What to support:
- Keyword search.
- Category filters.
- Rental/verified/price filters.
- Sorting or ranking by relevance and freshness.
- Reindexing when a product is added, edited, deleted, or made available again.

Deliverable:
- Search should use the search engine for query execution, not only MongoDB regex/filtering.
- Add a small index rebuild script and document how to run it.
- Include a search comparison note showing better latency or better result relevance than the current implementation.

## 3. Finish REST API documentation for both B2C and B2B surfaces

The project already has `backend/swagger.json` and `/api-docs`, but it needs complete, production-ready documentation.

Suggested files to touch: `backend/swagger.json`, `backend/app.js`, all route files under `backend/src/routes/`, and the corresponding controllers/services so request and response schemas stay accurate.

Separate the documentation into two consumer groups:
- B2C: public discovery, login/signup, profile, wishlist, requests, orders, chat, notifications.
- B2B: seller, admin, and manager operations such as add product, accept/reject/revoke requests, dashboards, complaint resolution, metrics, and payment analytics.

What each documented endpoint should include:
- Method and URL.
- Authentication requirement and role requirement.
- Request body schema.
- Query/path parameters.
- Success response schema.
- Error cases and status codes.
- Example payloads.

Deliverable:
- A maintained OpenAPI 3.0 spec that matches the real routes.
- Keep REST documentation as the source of truth.
- If a GraphQL layer is ever added, document the schema and resolvers separately instead of mixing it into the REST spec.

## 4. Add backend unit and integration tests for the core business logic

There is currently no real backend test runner. Add one and cover the most important logic paths.

Suggested files to cover: `backend/src/services/auth.service.js`, `backend/src/services/anyone.service.js`, `backend/src/services/buyer.service.js`, `backend/src/services/seller.service.js`, `backend/src/services/manager.service.js`, `backend/src/services/admin.service.js`, `backend/src/helpers/notification.helper.js`, `backend/src/helpers/user.helper.js`, `backend/src/helpers/productEmbedding.helper.js`, and the main route/controller layers.

Minimum test targets:
- Login, signup, OTP verification, logout, and `/auth/me`.
- Home product fetch and product detail fetch.
- Search/filter logic.
- Wishlist add/remove/get.
- Request create/accept/reject/revoke flows.
- Razorpay order creation and payment verification.
- Seller product creation and deletion.
- Notification read/delete flows.
- Manager complaint resolution.

Deliverable:
- Add a runnable test command in `backend/package.json`.
- Use mocks for Mongo, Razorpay, Cloudinary, and any external embedding or chatbot dependency.
- Produce a coverage report that can be generated on demand.

## 5. Add client tests for route protection and critical user flows

The client also needs a real test setup, not only linting.

Suggested files to cover: `client/src/routes/AppRoutes.jsx`, `client/src/redux/authSlice.js`, `client/src/context/CurrentUserContextProvider.jsx`, `client/src/pages/AuthLogin.jsx`, `client/src/pages/AuthSignup.jsx`, `client/src/pages/SearchPage.jsx`, `client/src/pages/ProductDetailPage.jsx`, `client/src/pages/ChatPage.jsx`, and important reusable components such as `client/src/components/SearchPage/*`, `client/src/components/AIChatOverlay.jsx`, `client/src/components/NotificationSidebar.jsx`, and `client/src/components/SellerHome/*`.

Minimum test targets:
- Protected route redirects by role.
- Auth bootstrap from `/auth/me`.
- Search filter behavior.
- Product detail actions such as wishlist, request, and rent.
- Chat data loading and message submission.
- Notification UI state transitions.

Deliverable:
- A client test runner with a coverage command.
- A way to generate test output or coverage artifacts when needed.

## 6. Dockerize the full stack

The backend already has a Mongo-only compose file, but the project still needs a complete container story.

Suggested files to create or update: `backend/Dockerfile`, `client/Dockerfile`, root-level `docker-compose.yaml` or an improved backend compose file, and environment example files for both apps.

What the container setup should include:
- Backend service.
- Client service.
- MongoDB.
- Redis.
- Solr or the chosen search service.
- Optional Mongo Express for local development only.

What to make explicit:
- Separate dev and production compose targets.
- Health checks and restart policies.
- Environment variable wiring for backend URL, Mongo, Redis, search engine, Razorpay, Google auth, Cloudinary, and JWT secrets.

Deliverable:
- A single `docker compose up` path for local development.
- A production-oriented image build path for both backend and client.

## 7. Set up CI in GitHub Actions

Add a pipeline that runs on pull requests and pushes so the main quality gates are automated.

Suggested files to create: `.github/workflows/ci.yml` and any supporting scripts in `backend/package.json` and `client/package.json`.

The CI job should do at least the following:
- Install backend dependencies.
- Install client dependencies.
- Run backend tests.
- Run backend coverage reporting.
- Run client tests.
- Run client lint.
- Build the client.
- Optionally build Docker images as a final validation step.

Deliverable:
- Green checks in GitHub for the main branches and pull requests.
- Uploaded test or coverage artifacts if your test runner supports them.

## 8. Remove hardcoded localhost URLs from the client and centralize API calls

The client still contains many hardcoded `http://localhost:3000` and similar URLs. That blocks deployment and makes the app harder to maintain.

Suggested files to fix: `client/src/config/api.config.js`, `client/src/pages/AuthLogin.jsx`, `client/src/pages/AuthSignup.jsx`, `client/src/pages/ChatPage.jsx`, `client/src/pages/ProductDetailPage.jsx`, `client/src/pages/ManagerDashboard.jsx`, `client/src/pages/LoginPage.jsx`, `client/src/pages/PendingTxsPage.jsx`, `client/src/pages/YourOrders.page.jsx`, `client/src/pages/WishlistPage.jsx`, `client/src/pages/userUpdateProfile.jsx`, `client/src/pages/AddProductForm.jsx`, `client/src/pages/SellerDashboard.jsx`, and the `client/src/components/SellerHome/*`, `client/src/components/Admin/*`, `client/src/components/NotificationSidebar.jsx`, `client/src/components/AIChatOverlay.jsx`, and `client/src/components/ActionButtons.jsx` request paths.

What to do:
- Route all backend calls through a single API base URL source.
- Prefer one shared service layer for fetch/axios calls instead of scattering literal URLs.
- Keep env variables per environment, not per page.

Deliverable:
- One environment-based backend URL for dev, staging, and production.
- No hardcoded localhost in production-facing code paths.

## 9. Harden the backend for production use

There are a few development-only behaviors in `backend/app.js` that should not stay live in a production deployment.

Suggested files to touch: `backend/app.js`, `backend/src/middlewares/*.js`, `backend/src/config/*.js`, and `backend/package.json`.

What to improve:
- Gate or remove `/shutdown`.
- Gate or remove debug helpers like `bulkUpload.html` and the proxy download route unless they are truly required.
- Turn the commented rate limiter into a real configurable protection layer.
- Reduce any oversized request/body limits if they are not needed in production.
- Make CORS, cookie, and logging settings environment driven.
- Add a proper production start script.

Deliverable:
- A server that can run safely outside the developer machine without debug-only endpoints exposed by default.

## 10. Separate developer utilities from runtime code

There are several top-level helper files that look like development or benchmarking tools rather than application runtime code.

Files to review: `backend/data.js`, `backend/data.json`, `backend/data.html`, `backend/bulkUpload.html`, and `backend/quantification.js`.

What to do:
- Move seed, benchmark, and bulk-upload helpers into a clearly named `scripts/` or `tools/` folder.
- Document which ones are for seeding, benchmarking, or manual admin testing.
- Exclude anything that should never ship in production.

Deliverable:
- A cleaner production boundary between runtime code and local maintenance utilities.

## 11. Deploy the client and backend in a real hosting setup

The app needs a live deployment path, and the demo should use that deployed environment rather than localhost.

Suggested files to touch: `client/vite.config.js`, `client/src/config/api.config.js`, `client/.env`, backend env handling, and deployment configs for the selected hosting provider.

What to deploy:
- Client to Vercel or a similar frontend host.
- Backend to a server host that can keep the API and socket flow alive.
- MongoDB, Redis, and the search engine either as managed services or containerized services with public/private access as needed.

What to verify after deployment:
- Auth cookies and CORS still work.
- Chat and socket flows still connect.
- Search, wishlist, product detail, payment, and dashboard screens all hit production URLs.
- No local-only assumptions remain in the client.

Deliverable:
- Live production URLs for the client and backend.
- A short deployment note with the environment variables used.

## 12. Add a short runbook for tests, reports, and local startup

Once the above work is in place, create a small operating guide for the team.

Suggested files: root README or this file, plus package scripts in `backend/package.json` and `client/package.json`.

What the runbook should explain:
- How to start the full stack locally.
- How to run backend tests.
- How to run client tests.
- How to generate coverage and test reports on demand.
- How to run the benchmark that proves the Redis improvement.
- How to rebuild the search index.

Deliverable:
- One concise place where a new teammate can reproduce the build, test, and deployment workflow.