# How Google Auth Works (OAuth 2.0)

## What is OAuth?

OAuth 2.0 is a protocol that lets users sign in with
their Google account without your app ever seeing
their Google password. Instead:

1. User clicks "Sign in with Google"
2. Google opens a popup/redirect → User logs into
   Google
3. Google gives your app a special token that says
   "this person is authenticated"
4. Your backend verifies the token with Google's
   servers
5. Your backend creates its own JWT tokens for your
   app

Think of it like showing your driver's license to
enter a bar:

- Google = DMV (issues the license)
- Your app = Bouncer (verifies the license is real)
- You never tell the bouncer your SSN/password

---

The Complete Flow in Your Codebase

Here's what happens step-by-step when a user signs in
with Google:

### By the way: The Habit Reminder Modal connects by the current state of the Zustand Store (Auth Store)

## Step 1: Frontend Loads Google's SDK

File: frontend/components/GoogleLoginButton.jsx:14-22

```JavaScript
  const script = document.createElement('script');
  script.src =
  'https://accounts.google.com/gsi/client';
  document.body.appendChild(script);
```

This loads Google's JavaScript library that handles
the sign-in popup.

---

## Step 2: Initialize Google Sign-In Button

File: frontend/components/GoogleLoginButton.jsx:25-32

```JavaScript
window.google.accounts.id.initialize({
client_id:
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
callback: handleCallbackResponse,
});
```

What's happening:

- client_id identifies YOUR app to Google (you
  registered this in Google Cloud Console)
- callback is the function Google calls after
  successful login
- Google renders the actual "Sign in with Google"
  button

---

## Step 3: User Clicks Button → Google Popup

When the user clicks, Google:

1. Opens a popup window
2. User logs in with their Google account
3. User approves your app accessing their basic info
   (email)
4. Google closes popup and calls
   handleCallbackResponse()

---

## Step 4: Frontend Sends Token to Your Backend

File: frontend/components/GoogleLoginButton.jsx:36-47

```JavaScript
const handleCallbackResponse = async (response) => {
const res = await fetch(

`${process.env.NEXT_PUBLIC_API_URL}/auth/google/`,
{
method: 'POST',
body: JSON.stringify({ token:
response.credential }),
}
)};
```

What is response.credential?
This is a JWT token signed by Google that contains:

- User's email
- User's Google ID
- Expiration time
- Google's cryptographic signature (proves it's real)

This token is NOT the same as your app's JWT - it's a
temporary proof of identity from Google.

---

## Step 5: Backend Verifies Token with Google

File: backend/api/views.py:57-63

```JavaScript
idinfo = id_token.verify_oauth2_token(
token,
google_requests.Request(),
settings.GOOGLE_CLIENT_ID
)
```

What's happening:

1. Your backend contacts Google's servers
2. Google checks if the token signature is valid
3. Google returns the user's email and info
4. If invalid/expired → raises ValueError

Why verify? Anyone could fake a token, so you MUST
verify it with Google's public keys.

---

## Step 6: Create/Fetch User in Your Database

File: backend/api/views.py:65-72

```JavaScript
email = idinfo.get('email')

# Create or fetch the user

user, created =
CustomUser.objects.get_or_create(email=email)
if created:
user.is_active = True
user.save()
```

What's happening:

- If user exists with this email → fetch them
- If new user → create account automatically
- No password needed! Google already verified them

---

## Step 7: Generate YOUR App's JWT Tokens

File: backend/api/views.py:74-76

```JavaScript
refresh = RefreshToken.for_user(user)
access = str(refresh.access_token)
```

Now your backend creates its own JWT tokens using
djangorestframework-simplejwt:

| Token Type | Lifespan | Storage |
Purpose |
|---------------|------------|------------------|----
---------------------------|
| Access Token | 15 minutes | Memory (Zustand) |
Sent with every API request |
| Refresh Token | 7 days | HttpOnly Cookie |
Used to get new access tokens |

---

## Step 8: Return Tokens to Frontend

File: backend/api/views.py:78-92

```JavaScript
response = Response({
'access_token': access,
'email': user.email
})

response.set_cookie(
key='refresh_token',
value=str(refresh),
httponly=True, # JavaScript can't access this
secure=False, # Set True in production (HTTPS
only)
samesite='Lax'
)

return response
```

Security note:

- Access token sent in response body → stored in
  Zustand (memory)
- Refresh token set as HttpOnly cookie → JavaScript
  can't read it (prevents XSS attacks)

---

## Step 9: Frontend Stores Tokens

File: frontend/components/GoogleLoginButton.jsx:49-51

```JavaScript
const data = await res.json();
setAuth({ email: data.email }, data.access_token);
router.push('/dashboard');

File: frontend/lib/auth-store.js:13-21

setAuth: (user, accessToken) =>
set({
user,
accessToken, // Stored in memory
isAuthenticated: true,
}),
```

---

## Step 10: Making Authenticated Requests

When HabitReminderModal creates a habit:

File:
frontend/components/habits/HabitReminderModal.js:39

```JavaScript
const createdHabit = await habitAPI.create(payload);

Behind the scenes (frontend/lib/api.js:13-24):
api.interceptors.request.use((config) => {
const { accessToken } = useAuthStore.getState();
if (accessToken) {
config.headers.Authorization = `Bearer
  ${accessToken}`;
}
return config;
});
```

Every request automatically adds: Authorization:
Bearer eyJhbGc...

---

## Step 11: Backend Validates JWT

File: backend/api/views.py:355-365

```JavaScript
@api_view(['POST'])
@permission_classes([IsAuthenticated]) # ← Validates
JWT
def habits(request):
serializer.save(user=request.user) # ← Links to
authenticated user
```

Django automatically:

1. Reads Authorization: Bearer <token> header
2. Verifies JWT signature
3. Extracts user_id from token
4. Fetches CustomUser from PostgreSQL
5. Sets request.user to that user

---

## Visual Comparison: Fake Login vs Google Auth

Fake Login Flow:

User enters email/password
↓
Backend checks PostgreSQL custom_user table
↓
Returns JWT tokens
↓
User authenticated

Google OAuth Flow:

User clicks "Sign in with Google"
↓
Google popup → User enters Google password
↓
Google returns signed token
↓
Backend verifies token with Google's servers
↓
Backend creates/fetches user by email
↓
Returns JWT tokens
↓
User authenticated

---

Key Differences

| Feature | Fake Login
| Google OAuth |
|-------------------------|--------------------------
--|----------------------------------|
| Password Storage | You store hashed
passwords | No passwords (Google handles it) |
| Security Responsibility | You secure login system
| Google handles security |
| User Experience | User creates account
| One-click sign-in |
| Password Reset | You implement reset flow
| Google handles it |
| Multi-Factor Auth | You implement it
| Google handles it |
| Trust | User trusts YOUR security
| User trusts Google's security |

---

## Important Files Summary

Frontend:

- frontend/components/GoogleLoginButton.jsx - The
  Google sign-in UI
- frontend/lib/auth-store.js - Stores access token in
  memory
- frontend/lib/api.js - Adds Authorization header to
  all requests

Backend:

- backend/api/views.py:49-96 - GoogleLoginView
  (verifies Google token, creates user)
- backend/bible_app/settings.py:160 -
  GOOGLE_CLIENT_ID configuration
- backend/requirements.txt - google-auth library

Environment Variables:

- NEXT_PUBLIC_GOOGLE_CLIENT_ID - Your app's Google
  OAuth client ID
- GOOGLE_CLIENT_ID - Same, used by backend

---

## Why Use Google Auth?

1. Security: Google has world-class security teams
2. User Trust: Users trust Google with their
   passwords
3. Convenience: One-click sign-in (no password to
   remember)
4. Less Code: You don't build password reset, 2FA,
   etc.
5. Faster Sign-Up: Reduces friction for new users

---

# Next Steps for Production

## Looking at your code, to fully switch to Google Auth:

1. Remove fake login when ready for production
2. Set secure=True in cookie settings (requires
   HTTPS)
3. Update CORS settings to allow production domain
4. Keep Google Client ID secret (don't commit to Git)
