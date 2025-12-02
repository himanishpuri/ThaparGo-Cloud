# ThaparGo Server Test Suite

## Overview

Comprehensive integration test suite for ThaparGo Server API endpoints.

## Test Coverage

### 1. Authentication Tests (`auth.test.ts`)

- **POST /api/auth/cognito**
  - ✓ Authenticate existing user with Cognito
  - ✓ Create new user and return temp token
  - ✓ Reject non-thapar.edu email addresses
  - ✓ Require authorization code
- **POST /api/auth/complete-onboarding**
  - ✓ Complete onboarding with valid data
  - ✓ Reject invalid phone number format
  - ✓ Require authentication
- **GET /api/auth/me**
  - ✓ Return current user info
  - ✓ Reject requests without token
  - ✓ Reject temp tokens
- **POST /api/auth/logout**
  - ✓ Logout successfully
  - ✓ Require authentication

### 2. Pool Tests (`pools.test.ts`)

- **GET /api/pools**
  - ✓ Get all pools with filters
  - ✓ Filter by end point, transport mode, date
  - ✓ Filter female-only pools
  - ✓ Require authentication
- **GET /api/pools/:id**
  - ✓ Get pool by ID
  - ✓ Return 404 for non-existent pool
- **POST /api/pools**
  - ✓ Create pool successfully
  - ✓ Reject missing required fields
  - ✓ Reject invalid total_persons (< 2 or > 50)
  - ✓ Reject past departure times
  - ✓ Reject arrival time before departure
  - ✓ Reject female-only pool by male user
  - ✓ Validate transport modes
- **POST /api/pools/:id/join**
  - ✓ Join pool successfully
  - ✓ Reject if already a member
  - ✓ Reject if pool is full
  - ✓ Reject male user joining female-only pool
- **POST /api/pools/:id/leave**
  - ✓ Leave pool successfully
  - ✓ Reject if not a member
  - ✓ Reject pool creator from leaving
- **DELETE /api/pools/:id**
  - ✓ Delete pool successfully
  - ✓ Reject deletion by non-creator
  - ✓ Return 404 for non-existent pool
- **GET /api/pools/users/me/pools**
  - ✓ Get created and joined pools
  - ✓ Filter by type (created/joined/all)

### 3. General API Tests (`general.test.ts`)

- **Health Check**
  - ✓ Return OK status with timestamp
- **404 Handler**
  - ✓ Return proper error for non-existent routes
- **CORS**
  - ✓ Verify CORS headers are set
- **Middleware**
  - ✓ Reject requests without auth token
  - ✓ Reject malformed auth headers
  - ✓ Reject invalid tokens

## Running Tests

### Install Dependencies

```bash
cd Server
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- auth.test.ts
npm test -- pools.test.ts
npm test -- general.test.ts
```

## Test Output

### Successful Run Example

```
PASS  src/__tests__/auth.test.ts
  Auth Routes
    POST /api/auth/cognito
      ✓ should authenticate existing user with Cognito (45ms)
      ✓ should create new user with Cognito and return temp token (12ms)
      ✓ should reject non-thapar.edu email (8ms)
      ✓ should return error when authorization code is missing (5ms)
    POST /api/auth/complete-onboarding
      ✓ should complete onboarding for new user with temp token (15ms)
      ✓ should reject invalid phone number format (7ms)
      ✓ should require authentication (4ms)
    GET /api/auth/me
      ✓ should return current user info (8ms)
      ✓ should reject request without token (5ms)
      ✓ should reject temp token (6ms)
    POST /api/auth/logout
      ✓ should logout user successfully (7ms)
      ✓ should require authentication (4ms)

PASS  src/__tests__/pools.test.ts
  Pool Routes
    GET /api/pools
      ✓ should get all pools with filters (18ms)
      ✓ should filter female-only pools (10ms)
      ✓ should require authentication (5ms)
    ... (more tests)

PASS  src/__tests__/general.test.ts
  General API Tests
    Health Check
      ✓ should return OK status (8ms)
    404 Handler
      ✓ should return 404 for non-existent routes (5ms)

Test Suites: 3 passed, 3 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        3.456s
Ran all test suites.
```

## Mocking Strategy

### External Services

- **Cognito Authentication**: Mocked via `jest.mock('../utils/cognito-auth')`
- **Google OAuth**: Mocked via `jest.mock('../utils/google-auth')`
- **Prisma Database**: Mocked via `jest.mock('../db/prismaClient')`
- **Logger**: Mocked to reduce test output noise

### Test Data

Helper functions in `helpers.ts` provide:

- `createTestUser()` - Generate test user data
- `createTestPool()` - Generate test pool data
- `generateAuthToken()` - Create valid JWT tokens
- `createPoolWithRelations()` - Generate pool with nested relations

## Environment Variables

Tests use mock environment variables set in `setup.ts`:

```
JWT_ACCESS_SECRET=test-secret-key-for-testing-only
JWT_EXPIRES_IN=604800
TEMP_TOKEN_EXPIRES_IN=900
NODE_ENV=test
```

## CI/CD Integration

These tests are designed to run in CI environments:

- Use `--forceExit` to prevent hanging processes
- Use `--detectOpenHandles` to identify resource leaks
- No external database dependencies (fully mocked)
- Deterministic results (no random data)

## Edge Cases Covered

### Authentication

- Missing credentials
- Invalid email domains
- Expired tokens
- Malformed tokens
- Temp vs full authentication

### Pool Management

- Capacity limits (2-50 persons)
- Time validations (past dates, arrival before departure)
- Gender restrictions (female-only pools)
- Creator permissions (can't leave, only delete)
- Member duplication prevention
- Full pool handling

### Validation

- Required field enforcement
- Type validation
- Range validation
- Business rule validation

## Notes for Reviewers

- All tests use proper HTTP status codes
- Comprehensive error messages for failed validations
- Proper authentication flow testing
- Database transaction mocking for consistency
- Clean test isolation (mocks reset between tests)
