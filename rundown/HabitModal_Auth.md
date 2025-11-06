Authentication Flow Explanation

Here's how authentication works from QuickLogin.js to
HabitReminderModal.js and connects to PostgreSQL:

# 1. Login Process (QuickLogin.js)

File: frontend/api/QuickLogin.js:16-49

When you click the "Login & Save Token" button:

```Javascript
// Sends email + password to backend
fetch('http://localhost:8000/api/auth/login/', {
method: 'POST',
body: JSON.stringify({ email, password })
})
```

Backend Handler: backend/api/views.py:113-147 (login_view)

The backend:

1. Authenticates credentials against PostgreSQL custom_user table
   (backend/api/models.py:32-53)
2. Generates two JWT tokens using RefreshToken.for_user(user):
    - Access Token (short-lived, ~5 mins)
    - Refresh Token (long-lived, 7-30 days)

3. Returns access token in JSON response
4. Sets refresh token as HttpOnly cookie (secure, can't be accessed
   by JavaScript)

Frontend Storage: frontend/lib/auth-store.js:13-21

```Javascript
setAuth(data.user, data.access_token)
```

This stores in Zustand (state management):

- user: User object from backend (email, id, etc.)
- accessToken: JWT access token
- isAuthenticated: true

The accessToken is stored in memory only (not localStorage) for
security.

---

# 2. Making Authenticated Requests (HabitReminderModal.js)

File: frontend/components/habits/HabitReminderModal.js:39

When you create a habit in the modal:

```Javascript
const createdHabit = await habitAPI.create(payload);
```

API Interceptor: frontend/lib/api.js:13-24

Before the request is sent, an Axios interceptor automatically:

1. Reads the accessToken from Zustand store
2. Adds it to the request header: Authorization: Bearer <token>

```Javascript
api.interceptors.request.use((config) => {
const { accessToken } = useAuthStore.getState();
if (accessToken) {
config.headers.Authorization = `Bearer ${accessToken}`;
}
return config;
});
```

---

# 3. Backend Validates Token & Links to User

Endpoint: backend/api/views.py:355-365 (habits function)

```python
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # ← Requires valid JWT token
def habits(request):
    if request.method == 'POST':
        serializer = HabitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # ← Links habit to authenticated user
            return Response(serializer.data, status=201)
```

Here's what happens:

1. JWT Validation: Django REST Framework's
   @permission_classes([IsAuthenticated]) validates the JWT token in
   the Authorization header
2. User Extraction: The token contains the user_id, which Django
   uses to fetch the CustomUser from PostgreSQL
3. Database Link: serializer.save(user=request.user) creates a
   UserHabit row in PostgreSQL with:
    - user_id (foreign key to custom_user table)
    - habit, frequency, purpose, time, location, skipped

Database Model: backend/api/models.py:109-129

```Python
class UserHabit(models.Model):
user = models.ForeignKey(
CustomUser,
on_delete=models.CASCADE,
related_name='habits',
db_column='user_id' # ← Foreign key column in PostgreSQL
)
habit = models.CharField(max_length=255) # ... other fields
```

---

# 4. Token Refresh (Automatic)

File: frontend/lib/api.js:26-68 (response interceptor)

If the access token expires (401 error), the frontend
automatically:

1. Reads the refresh token from the HttpOnly cookie
2. Calls /auth/refresh/ endpoint
3. Gets a new access token
4. Retries the original request

Backend Handler: backend/api/views.py:152-187 (refresh_token_view)

---

File Correlation Map

┌─────────────────────────────────────────────────────────────┐
│ FRONTEND │
├─────────────────────────────────────────────────────────────┤
│ QuickLogin.js (Login UI) │
│ ↓ Calls authAPI.login() │
│ lib/api.js (Axios config + interceptors) │
│ ↓ Stores token in Zustand │
│ lib/auth-store.js (State: user, accessToken) │
│ ↓ HabitReminderModal creates habit │
│ components/habits/HabitReminderModal.js │
│ ↓ Calls habitAPI.create() │
│ lib/api.js (Adds Bearer token to headers) │
└─────────────────────────────────────────────────────────────┘
↓ HTTP POST /api/habits/
┌─────────────────────────────────────────────────────────────┐
│ BACKEND │
├─────────────────────────────────────────────────────────────┤
│ api/views.py:355 (habits function) │
│ ↓ @permission_classes([IsAuthenticated]) │
│ JWT validates token → extracts user_id │
│ ↓ queries CustomUser from PostgreSQL │
│ api/serializers.py:59 (HabitSerializer) │
│ ↓ save(user=request.user) │
│ api/models.py:109 (UserHabit model) │
│ ↓ Writes to PostgreSQL │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ POSTGRESQL DATABASE │
├─────────────────────────────────────────────────────────────┤
│ Table: custom_user (id, email, password_hash) │
│ Table: user_habit (id, user_id → custom_user.id, habit, ...) │
└─────────────────────────────────────────────────────────────┘

---

Key Security Points

1. Access token is stored in memory only (Zustand) → cleared on
   browser close
2. Refresh token is HttpOnly cookie → JavaScript can't access it
   (prevents XSS attacks)
3. JWT tokens contain user_id → backend doesn't need to query
   sessions, just validates the token signature
4. @permission_classes([IsAuthenticated]) ensures only logged-in
   users can create habits

---

Does this clarify how the authentication flow works? The key is
that the JWT token acts as proof of identity, and Django
automatically extracts the user from it to link habits to the
correct PostgreSQL user account.

```

```
