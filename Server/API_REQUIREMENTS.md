# ThaparGo Backend API Requirements

## Overview

This document outlines all the required backend APIs based on the frontend implementation. The frontend currently uses mock data and localStorage for authentication, which needs to be replaced with actual backend endpoints.

---

## 1. Authentication APIs

### 1.1 Google OAuth Signup/Login

**Endpoint:** `POST /api/auth/google`

**Description:** Handles Google OAuth authentication. Creates new user if doesn't exist, or logs in existing user.

**Request Body:**

```json
{
	"credential": "string", // JWT token from Google
	"email": "string",
	"name": "string",
	"picture": "string" // optional
}
```

**Response (New User - Needs Onboarding):**

```json
{
	"success": true,
	"isNewUser": true,
	"user": {
		"id": "uuid",
		"email": "string",
		"full_name": "string",
		"google_authenticated": true,
		"hasCompletedOnboarding": false
	},
	"tempToken": "string" // Temporary token for onboarding completion
}
```

**Response (Existing User):**

```json
{
  "success": true,
  "isNewUser": false,
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "phone_number": "string",
    "gender": "Male" | "Female",
    "google_authenticated": true,
    "hasCompletedOnboarding": true,
    "date_joined": "ISO8601"
  },
  "token": "string"  // JWT auth token
}
```

**Validation:**

-  Email must end with `@thapar.edu`
-  Verify Google credential token

**Flow:**

1. Frontend receives Google credential
2. Sends to backend for verification
3. Backend verifies with Google
4. Check if user exists by email
5. If new: Create user with partial data, return tempToken
6. If existing: Return full user data with auth token

---

### 1.2 Complete User Onboarding

**Endpoint:** `POST /api/auth/complete-onboarding`

**Description:** Completes user profile after Google signup

**Headers:**

```
Authorization: Bearer {tempToken}
```

**Request Body:**

```json
{
  "phone_number": "string",     // Required, 10 digits
  "gender": "Male" | "Female"   // Required
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "phone_number": "string",
    "gender": "Male" | "Female",
    "google_authenticated": true,
    "hasCompletedOnboarding": true,
    "date_joined": "ISO8601"
  },
  "token": "string"  // Full JWT auth token
}
```

**Validation:**

-  Phone number must be exactly 10 digits
-  Gender must be "Male" or "Female"
-  TempToken must be valid

**Flow:**

1. Verify tempToken
2. Update user with phone_number and gender
3. Mark hasCompletedOnboarding as true
4. Generate and return full JWT token

---

### 1.3 Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Returns current authenticated user's data

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "phone_number": "string",
    "gender": "Male" | "Female",
    "google_authenticated": true,
    "hasCompletedOnboarding": true,
    "date_joined": "ISO8601"
  }
}
```

**Error Response (401):**

```json
{
	"success": false,
	"error": "Unauthorized"
}
```

---

### 1.4 Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Invalidates user token (if using token blacklist)

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
	"success": true,
	"message": "Logged out successfully"
}
```

---

## 2. Pool APIs

### 2.1 Get All Pools

**Endpoint:** `GET /api/pools`

**Description:** Fetches all available pools with filtering options

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

```
?start_point=string          // Optional filter
&end_point=string            // Optional filter
&transport_mode=string       // Optional: car, bike, train, bus, plane, ferry
&departure_date=YYYY-MM-DD   // Optional filter
&is_female_only=boolean      // Optional filter
```

**Response:**

```json
{
  "success": true,
  "pools": [
    {
      "id": "uuid",
      "start_point": "string",
      "end_point": "string",
      "departure_time": "ISO8601",
      "arrival_time": "ISO8601",
      "transport_mode": "car" | "bike" | "train" | "bus" | "plane" | "ferry",
      "total_persons": number,
      "current_persons": number,
      "total_fare": number,
      "fare_per_head": number,      // Computed: total_fare / current_persons
      "is_female_only": boolean,
      "created_by": "uuid",
      "creator": {
        "id": "uuid",
        "full_name": "string",
        "email": "string",
        "phone_number": "string",
        "gender": "Male" | "Female"
      },
      "members": [
        {
          "id": "uuid",
          "user_id": "uuid",
          "is_creator": boolean,
          "user": {
            "id": "uuid",
            "full_name": "string",
            "phone_number": "string",
            "gender": "Male" | "Female"
          }
        }
      ],
      "available_seats": number,    // Computed: total_persons - current_persons
      "is_full": boolean,           // Computed: current_persons >= total_persons
      "user_is_member": boolean     // Computed: check if current user is in members
    }
  ]
}
```

**Flow:**

1. Parse query parameters for filters
2. Query pools with filters
3. Include creator and members relations
4. Compute virtual properties (fare_per_head, available_seats, is_full)
5. Check if current user is member of each pool
6. Return pools array

---

### 2.2 Get Pool by ID

**Endpoint:** `GET /api/pools/:id`

**Description:** Fetches detailed information about a specific pool

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "pool": {
    "id": "uuid",
    "start_point": "string",
    "end_point": "string",
    "departure_time": "ISO8601",
    "arrival_time": "ISO8601",
    "transport_mode": "string",
    "total_persons": number,
    "current_persons": number,
    "total_fare": number,
    "fare_per_head": number,
    "is_female_only": boolean,
    "created_by": "uuid",
    "creator": {
      "id": "uuid",
      "full_name": "string",
      "email": "string",
      "phone_number": "string",
      "gender": "Male" | "Female"
    },
    "members": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "is_creator": boolean,
        "user": {
          "id": "uuid",
          "full_name": "string",
          "phone_number": "string",
          "gender": "Male" | "Female"
        }
      }
    ],
    "available_seats": number,
    "is_full": boolean,
    "user_is_member": boolean
  }
}
```

**Error Response (404):**

```json
{
	"success": false,
	"error": "Pool not found"
}
```

---

### 2.3 Create Pool

**Endpoint:** `POST /api/pools`

**Description:** Creates a new carpool

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "start_point": "string",      // Required
  "end_point": "string",        // Required
  "departure_time": "ISO8601",  // Required
  "arrival_time": "ISO8601",    // Required
  "transport_mode": "car" | "bike" | "train" | "bus" | "plane" | "ferry",  // Required
  "total_persons": number,      // Required, min: 2, max: 50
  "total_fare": number,         // Required, min: 0
  "is_female_only": boolean     // Optional, default: false
}
```

**Response:**

```json
{
  "success": true,
  "pool": {
    "id": "uuid",
    "start_point": "string",
    "end_point": "string",
    "departure_time": "ISO8601",
    "arrival_time": "ISO8601",
    "transport_mode": "string",
    "total_persons": number,
    "current_persons": 1,
    "total_fare": number,
    "fare_per_head": number,
    "is_female_only": boolean,
    "created_by": "uuid",
    "creator": {
      "id": "uuid",
      "full_name": "string",
      "email": "string"
    }
  },
  "message": "Pool created successfully"
}
```

**Validation:**

-  All required fields must be present
-  `total_persons` must be between 2 and 50
-  `total_fare` must be >= 0
-  `departure_time` must be in the future
-  `arrival_time` must be after `departure_time`
-  If `is_female_only` is true, creator must be female

**Flow:**

1. Validate request data
2. Create pool with current user as creator
3. Automatically add creator to pool_members with is_creator=true
4. Set current_persons=1
5. Return created pool data

---

### 2.4 Join Pool

**Endpoint:** `POST /api/pools/:id/join`

**Description:** Allows a user to join an existing pool

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully joined pool",
  "pool": {
    "id": "uuid",
    "current_persons": number,
    "fare_per_head": number,
    "available_seats": number,
    "is_full": boolean
  }
}
```

**Error Responses:**

**400 - Already a Member:**

```json
{
	"success": false,
	"error": "You are already a member of this pool"
}
```

**400 - Pool Full:**

```json
{
	"success": false,
	"error": "This pool is full"
}
```

**400 - Gender Restriction:**

```json
{
	"success": false,
	"error": "This pool is female-only"
}
```

**404 - Pool Not Found:**

```json
{
	"success": false,
	"error": "Pool not found"
}
```

**Validation:**

-  Pool must exist
-  User must not already be a member
-  Pool must not be full (current_persons < total_persons)
-  If pool is female-only, user must be female
-  User must have completed onboarding

**Flow:**

1. Verify pool exists
2. Check if user is already a member
3. Check if pool is full
4. Check gender restrictions if applicable
5. Add user to pool_members
6. Increment current_persons
7. Return updated pool data

---

### 2.5 Leave Pool

**Endpoint:** `POST /api/pools/:id/leave`

**Description:** Allows a user to leave a pool they've joined

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
	"success": true,
	"message": "Successfully left pool"
}
```

**Error Responses:**

**400 - Not a Member:**

```json
{
	"success": false,
	"error": "You are not a member of this pool"
}
```

**400 - Creator Cannot Leave:**

```json
{
	"success": false,
	"error": "Pool creator cannot leave. Delete the pool instead."
}
```

**Validation:**

-  User must be a member of the pool
-  User cannot be the creator (they must delete the pool instead)

**Flow:**

1. Verify user is a member
2. Check user is not the creator
3. Remove user from pool_members
4. Decrement current_persons
5. Return success message

---

### 2.6 Delete Pool

**Endpoint:** `DELETE /api/pools/:id`

**Description:** Deletes a pool (only creator can delete)

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
	"success": true,
	"message": "Pool deleted successfully"
}
```

**Error Responses:**

**403 - Not Creator:**

```json
{
	"success": false,
	"error": "Only the pool creator can delete this pool"
}
```

**404 - Pool Not Found:**

```json
{
	"success": false,
	"error": "Pool not found"
}
```

**Validation:**

-  Pool must exist
-  User must be the creator of the pool

**Flow:**

1. Verify pool exists
2. Verify user is the creator
3. Delete all pool_members entries (cascade)
4. Delete pool
5. Return success message

---

### 2.7 Get User's Pools

**Endpoint:** `GET /api/users/me/pools`

**Description:** Fetches all pools the current user has created or joined

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

```
?type=created | joined | all    // Optional, default: all
```

**Response:**

```json
{
  "success": true,
  "created_pools": [
    {
      "id": "uuid",
      "start_point": "string",
      "end_point": "string",
      "departure_time": "ISO8601",
      "current_persons": number,
      "total_persons": number,
      "fare_per_head": number,
      // ... other pool fields
    }
  ],
  "joined_pools": [
    {
      "id": "uuid",
      "start_point": "string",
      "end_point": "string",
      "departure_time": "ISO8601",
      "current_persons": number,
      "total_persons": number,
      "fare_per_head": number,
      // ... other pool fields
    }
  ]
}
```

**Flow:**

1. Get pools created by user (where created_by = user.id)
2. Get pools joined by user (where user is in members but not creator)
3. Return both arrays based on query parameter

---

## 3. Data Models (Prisma Schema Reference)

### User Model

```prisma
model User {
  id                   String    @id @default(uuid())
  google_authenticated Boolean   @default(false)
  email                String    @unique
  full_name            String
  phone_number         String?   @unique
  gender               Gender?
  date_joined          DateTime  @default(now())

  created_pools Pool[]       @relation("UserCreatedPools")
  pools         PoolMember[] @relation("UserPoolMembership")
}
```

### Pool Model

```prisma
model Pool {
  id              String   @id @default(uuid())
  start_point     String   @default("Thapar University")
  end_point       String
  departure_time  DateTime
  arrival_time    DateTime
  transport_mode  String
  total_persons   Int
  current_persons Int      @default(1)
  total_fare      Decimal?
  is_female_only  Boolean  @default(false)

  created_by String
  creator    User         @relation("UserCreatedPools", fields: [created_by], references: [id], onDelete: Cascade)
  members    PoolMember[]
}
```

### PoolMember Model

```prisma
model PoolMember {
  id         String  @id @default(uuid())
  is_creator Boolean @default(false)

  pool_id String
  user_id String
  pool    Pool @relation(fields: [pool_id], references: [id], onDelete: Cascade)
  user    User @relation("UserPoolMembership", fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([pool_id, user_id])
}
```

---

## 4. Virtual/Computed Properties

These should be calculated on the backend before sending to frontend:

### Pool Virtual Properties

```typescript
{
  fare_per_head: total_fare / current_persons,
  available_seats: total_persons - current_persons,
  is_full: current_persons >= total_persons,
  user_is_member: check if current user's id is in members array
}
```

---

## 5. Authentication Flow

### JWT Token Structure

```json
{
  "userId": "uuid",
  "email": "string",
  "exp": timestamp,
  "iat": timestamp
}
```

### Token Types

1. **Temporary Token** - Used during onboarding, expires in 15 minutes
2. **Full Auth Token** - Used after onboarding complete, expires in 7 days

### Protected Routes

All pool endpoints and `/api/auth/me` require valid JWT token.

---

## 6. Error Handling Standards

### Standard Error Response Format

```json
{
	"success": false,
	"error": "Error message",
	"code": "ERROR_CODE", // Optional
	"details": {} // Optional, for validation errors
}
```

### HTTP Status Codes

-  `200` - Success
-  `201` - Created
-  `400` - Bad Request (validation errors)
-  `401` - Unauthorized (missing or invalid token)
-  `403` - Forbidden (no permission)
-  `404` - Not Found
-  `500` - Internal Server Error

---

## 7. Validation Rules

### Email

-  Must end with `@thapar.edu`
-  Must be valid email format

### Phone Number

-  Must be exactly 10 digits
-  Must be numeric only

### Pool Fields

-  `total_persons`: 2-50
-  `total_fare`: >= 0
-  `departure_time`: Must be in future
-  `arrival_time`: Must be after departure_time
-  `transport_mode`: Must be one of: car, bike, train, bus, plane, ferry

---

## 8. Database Indexes (Recommended)

```prisma
// Add these for performance
@@index([email])           // On User
@@index([created_by])      // On Pool
@@index([departure_time])  // On Pool
@@index([end_point])       // On Pool
@@index([pool_id])         // On PoolMember
@@index([user_id])         // On PoolMember
```

---

## 9. Additional Considerations

### Rate Limiting

-  Auth endpoints: 5 requests per minute per IP
-  Pool creation: 10 pools per day per user
-  Pool joining: 20 requests per minute per user

### CORS Configuration

```javascript
{
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
```

### Environment Variables Required

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
TEMP_TOKEN_EXPIRES_IN=15m
GOOGLE_CLIENT_ID=...
FRONTEND_URL=http://localhost:8080
PORT=3000
```

---

## 10. Implementation Priority

### Phase 1 (MVP)

1. Auth APIs (1.1, 1.2, 1.3)
2. Pool CRUD (2.1, 2.2, 2.3)
3. Join/Leave Pool (2.4, 2.5)

### Phase 2

1. Delete Pool (2.6)
2. User's Pools (2.7)
3. Advanced filters

### Phase 3

1. Real-time notifications
2. Chat functionality
3. Payment integration

---

## End of Document
