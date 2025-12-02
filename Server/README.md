# ThaparGo Backend API

Backend API for ThaparGo carpooling application built with Express.js, Prisma, and MySQL.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update `.env` file with your configuration:

```env
DATABASE_URL="mysql://root:viyug132922@localhost:3306/mydb"
DIRECT_URL="mysql://root:viyug132922@localhost:3306/mydb"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
TEMP_TOKEN_EXPIRES_IN="15m"
GOOGLE_CLIENT_ID="your-google-client-id"
FRONTEND_URL="http://localhost:8080"
PORT=3000
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# (Optional) Seed database with test data
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start on http://localhost:3000

## API Endpoints

### Authentication

#### POST `/api/auth/google`

Google OAuth login/signup

**Body:**

```json
{
	"credential": "google-jwt-token"
}
```

#### POST `/api/auth/complete-onboarding`

Complete user profile after Google signup

**Headers:** `Authorization: Bearer {tempToken}`

**Body:**

```json
{
	"phone_number": "1234567890",
	"gender": "Male"
}
```

#### GET `/api/auth/me`

Get current user details

**Headers:** `Authorization: Bearer {token}`

#### POST `/api/auth/logout`

Logout (client-side token invalidation)

**Headers:** `Authorization: Bearer {token}`

### Pools

#### GET `/api/pools`

Get all pools with optional filters

**Headers:** `Authorization: Bearer {token}`

**Query Params:**

-  `start_point` (optional)
-  `end_point` (optional)
-  `transport_mode` (optional): Car, Bike, Train, Bus, Plane, Ferry
-  `departure_date` (optional): YYYY-MM-DD
-  `is_female_only` (optional): true/false

#### GET `/api/pools/:id`

Get pool by ID

**Headers:** `Authorization: Bearer {token}`

#### POST `/api/pools`

Create a new pool

**Headers:** `Authorization: Bearer {token}`

**Body:**

```json
{
	"start_point": "Thapar University",
	"end_point": "Chandigarh",
	"departure_time": "2024-12-25T10:00:00Z",
	"arrival_time": "2024-12-25T12:00:00Z",
	"transport_mode": "Car",
	"total_persons": 4,
	"total_fare": 400,
	"is_female_only": false
}
```

#### POST `/api/pools/:id/join`

Join a pool

**Headers:** `Authorization: Bearer {token}`

#### POST `/api/pools/:id/leave`

Leave a pool

**Headers:** `Authorization: Bearer {token}`

#### DELETE `/api/pools/:id`

Delete a pool (creator only)

**Headers:** `Authorization: Bearer {token}`

#### GET `/api/pools/users/me/pools`

Get user's created and joined pools

**Headers:** `Authorization: Bearer {token}`

**Query Params:**

-  `type` (optional): created | joined | all (default: all)

## Database Schema

### User

-  `id`: UUID (Primary Key)
-  `email`: String (Unique, @thapar.edu)
-  `full_name`: String
-  `phone_number`: String (Unique, 10 digits)
-  `gender`: Enum (Male, Female)
-  `google_authenticated`: Boolean
-  `date_joined`: DateTime

### Pool

-  `id`: UUID (Primary Key)
-  `start_point`: String
-  `end_point`: String
-  `departure_time`: DateTime
-  `arrival_time`: DateTime
-  `transport_mode`: Enum (Car, Bike, Train, Bus, Plane, Ferry)
-  `total_persons`: Int (2-50)
-  `current_persons`: Int
-  `total_fare`: Decimal
-  `is_female_only`: Boolean
-  `created_by`: UUID (Foreign Key to User)

### PoolMember

-  `id`: UUID (Primary Key)
-  `pool_id`: UUID (Foreign Key to Pool)
-  `user_id`: UUID (Foreign Key to User)
-  `is_creator`: Boolean
-  Unique constraint: (pool_id, user_id)

## Scripts

-  `npm run dev` - Start development server with hot reload
-  `npm run build` - Build for production
-  `npm start` - Start production server
-  `npm run prisma:generate` - Generate Prisma Client
-  `npm run prisma:push` - Push schema to database
-  `npm run prisma:studio` - Open Prisma Studio
-  `npm run prisma:seed` - Seed database with test data

## Tech Stack

-  **Express.js** - Web framework
-  **Prisma** - ORM
-  **MySQL** - Database
-  **JWT** - Authentication
-  **Google OAuth** - Social login
-  **TypeScript** - Type safety

## Error Codes

-  `200` - Success
-  `201` - Created
-  `400` - Bad Request (validation errors)
-  `401` - Unauthorized (missing/invalid token)
-  `403` - Forbidden (no permission)
-  `404` - Not Found
-  `500` - Internal Server Error
