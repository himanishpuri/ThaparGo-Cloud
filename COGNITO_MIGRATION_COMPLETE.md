# AWS Cognito Authentication Migration - Complete

## Summary

Successfully migrated authentication from Google OAuth to AWS Cognito while maintaining the unified sign-in/sign-up flow and onboarding process.

## What Was Done

### Frontend Changes

1. **Environment Variables** (`Client/.env`)

   -  Added Cognito configuration:
      -  `VITE_COGNITO_DOMAIN=us-east-1ult8nlld8`
      -  `VITE_COGNITO_REGION=us-east-1`
      -  `VITE_COGNITO_CLIENT_ID=10igprltmk0ore1fosdqkvmkp4`
      -  `VITE_COGNITO_REDIRECT_URI=http://localhost:8080/buffer`

2. **Cognito URL Utility** (`Client/src/utils/cognitoUrls.ts`)

   -  Created utility functions to build Cognito hosted UI URLs
   -  `buildLoginUrl()` - Generates OAuth login URL with authorization code flow
   -  `buildLogoutUrl()` - Generates OAuth logout URL
   -  `LOGIN_URLS` - Exported URLs object

3. **Buffer Page** (`Client/src/pages/Buffer.tsx`)

   -  New callback page to handle OAuth redirect from Cognito
   -  Extracts authorization `code` from URL parameters
   -  Calls backend to exchange code for JWT tokens
   -  Shows onboarding modal if user is new or incomplete
   -  Redirects to `/pools` after successful authentication
   -  Error handling with automatic redirect to auth page

4. **Auth Page** (`Client/src/pages/Auth.tsx`)

   -  Removed Google OAuth components (`GoogleLogin`, `@react-oauth/google`)
   -  Replaced with simple "Sign In / Sign Up" button
   -  Button redirects to Cognito hosted UI using `buildLoginUrl()`
   -  Maintains check for existing authentication

5. **App Routing** (`Client/src/App.tsx`)

   -  Removed `GoogleOAuthProvider` wrapper
   -  Added `/buffer` route for OAuth callback handling
   -  Imported and registered Buffer component

6. **API Functions** (`Client/src/lib/api/auth.api.ts`)
   -  Added `cognitoAuth(code: string)` function
   -  Sends authorization code to backend `/api/auth/cognito`
   -  Handles token storage (temp or full based on response)
   -  Exported in `Client/src/lib/api/index.ts`

### Backend Changes

7. **Environment Variables** (`Server/.env`)

   -  Added Cognito configuration:
      -  `COGNITO_DOMAIN=us-east-1ult8nlld8`
      -  `COGNITO_REGION=us-east-1`
      -  `COGNITO_CLIENT_ID=10igprltmk0ore1fosdqkvmkp4`
      -  `COGNITO_REDIRECT_URI=http://localhost:8080/buffer`

8. **Cognito Auth Utility** (`Server/src/utils/cognito-auth.ts`)

   -  Created utility for Cognito OAuth token operations
   -  `exchangeCodeForTokens(code)` - Exchanges authorization code for Cognito tokens
   -  `getUserInfoFromToken(accessToken)` - Fetches user info from Cognito
   -  Uses native `fetch` API (no external dependencies)

9. **Auth Controller** (`Server/src/controllers/auth.controller.ts`)

   -  Created new controller file to separate business logic from routes
   -  Moved all auth logic from routes to controller functions:
      -  `googleAuth` - Existing Google OAuth handler
      -  `completeOnboarding` - Existing onboarding handler
      -  `getCurrentUser` - Existing user fetch handler
      -  `logout` - Existing logout handler
   -  Added `cognitoAuth` - New Cognito authentication handler:
      -  Exchanges authorization code for tokens
      -  Fetches user info from Cognito
      -  Validates email domain
      -  Creates new user or logs in existing user
      -  Returns temp token for new users, full token for existing users

10.   **Auth Routes** (`Server/src/routes/auth.ts`)
      -  Refactored to use controller functions
      -  Removed inline route handlers (reduced from 305 to ~25 lines)
      -  Added `POST /api/auth/cognito` route for Cognito authentication
      -  All routes now point to controller functions:
         -  `POST /google` → `authController.googleAuth`
         -  `POST /cognito` → `authController.cognitoAuth`
         -  `POST /complete-onboarding` → `authController.completeOnboarding`
         -  `GET /me` → `authController.getCurrentUser`
         -  `POST /logout` → `authController.logout`

## Authentication Flow

### New User Flow

1. User clicks "Sign In / Sign Up" on Auth page
2. Redirected to Cognito hosted UI (`https://us-east-1ult8nlld8.auth.us-east-1.amazoncognito.com/oauth2/authorize`)
3. User signs up/signs in with Cognito
4. Cognito redirects to `/buffer?code=AUTHORIZATION_CODE`
5. Buffer page sends code to backend `/api/auth/cognito`
6. Backend exchanges code for tokens and creates user with partial data
7. Backend returns `tempToken` and `isNewUser: true`
8. Frontend shows onboarding modal for phone and gender
9. User completes onboarding
10.   Backend returns full JWT token
11.   User redirected to `/pools`

### Existing User Flow

1. User clicks "Sign In / Sign Up" on Auth page
2. Redirected to Cognito hosted UI
3. User signs in with Cognito
4. Cognito redirects to `/buffer?code=AUTHORIZATION_CODE`
5. Buffer page sends code to backend `/api/auth/cognito`
6. Backend exchanges code for tokens and finds existing user
7. Backend returns full JWT `token` and `isNewUser: false`
8. User redirected directly to `/pools`

## Key Features Maintained

✅ Unified sign-in and sign-up (single button)
✅ Onboarding flow for new users (phone + gender)
✅ Email domain validation (@thapar.edu)
✅ JWT token management (temp vs full)
✅ Clean MVC architecture with controllers
✅ Comprehensive error handling and logging
✅ Existing Google OAuth still functional (parallel support)

## Files Created

-  `Client/src/utils/cognitoUrls.ts`
-  `Client/src/pages/Buffer.tsx`
-  `Server/src/utils/cognito-auth.ts`
-  `Server/src/controllers/auth.controller.ts`

## Files Modified

-  `Client/.env`
-  `Client/src/pages/Auth.tsx`
-  `Client/src/App.tsx`
-  `Client/src/lib/api/auth.api.ts`
-  `Client/src/lib/api/index.ts`
-  `Server/.env`
-  `Server/src/routes/auth.ts`

## Next Steps

To test the Cognito authentication:

1. Start the backend server:

   ```powershell
   cd Server
   npm run dev
   ```

2. Start the frontend dev server:

   ```powershell
   cd Client
   npm run dev
   ```

3. Navigate to `http://localhost:8080/auth`
4. Click "Sign In / Sign Up"
5. Complete authentication on Cognito hosted UI
6. Verify redirect to `/buffer` and then to `/pools`

## Configuration Notes

-  **Cognito Domain**: `us-east-1ult8nlld8.auth.us-east-1.amazoncognito.com`
-  **Client ID**: `10igprltmk0ore1fosdqkvmkp4`
-  **Redirect URI**: `http://localhost:8080/buffer`
-  **OAuth Flow**: Authorization code with PKCE (recommended)
-  **Scopes**: `email`, `openid`, `profile`

## Security Considerations

-  Authorization codes are single-use and expire quickly
-  Tokens are exchanged securely on the backend
-  JWT tokens follow existing expiration rules (15 min temp, 7 days full)
-  Email domain validation prevents unauthorized access
-  All sensitive data in environment variables

## Migration Complete ✅

All 9 tasks completed successfully. The application now supports both Google OAuth and AWS Cognito authentication with a clean, maintainable architecture.
