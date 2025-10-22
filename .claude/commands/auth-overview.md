# Auth System Overview

Analyze the entire authentication system in this codebase and provide a comprehensive rundown.

## Instructions

1. **Backend Auth (Django):**
   - Read `backend/api/models.py` - check CustomUser model and any auth-related models
   - Read `backend/api/views.py` - find all auth endpoints (login, register, logout, token refresh, Google OAuth, etc.)
   - Read `backend/api/serializers.py` - check auth serializers
   - Read `backend/api/urls.py` - map out auth URL patterns
   - Check `backend/backend/settings.py` - identify auth configuration (JWT settings, OAuth, CORS, etc.)

2. **Frontend Auth (React):**
   - Find and read all auth-related stores (Zustand/context for user state, tokens)
   - Find and read auth API service files (axios calls to backend)
   - Find and read login/register/OAuth components
   - Check route protection logic (private routes, auth guards)

3. **OAuth Integration:**
   - Identify OAuth providers (Google, etc.)
   - Map the OAuth flow from frontend trigger → backend handling → token generation

4. **Token Management:**
   - Identify token type (JWT, session, etc.)
   - Find where tokens are stored (localStorage, cookies, etc.)
   - Check refresh token logic if applicable
   - Find token expiry handling

## Output Format

Provide a **concise** summary structured as:

### Auth Stack
- Backend: [framework, auth library, token type]
- Frontend: [state management, storage method]
- OAuth: [providers enabled]

### Authentication Flow
1. **Registration:** [step-by-step]
2. **Login:** [step-by-step]
3. **Google OAuth:** [step-by-step if applicable]
4. **Token Refresh:** [how it works]
5. **Logout:** [what happens]

### Key Files
- Backend: [list with line numbers for key functions]
- Frontend: [list with line numbers for key components/functions]

### Current State
- What's working
- Any TODOs or incomplete features
- Security considerations to note

Keep it factual and to-the-point. No fluff.
