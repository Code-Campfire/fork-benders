# Dashboard Endpoints Testing Guide

## Prerequisites

1. Docker running: `docker compose up -d`
2. Postman installed (recommended) OR curl available
3. Test user account

---

## Quick Setup (curl commands)

### Create Test User

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@example.com","password":"TestPass123!","password_confirm":"TestPass123!"}'
```

### Login and Get Token

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@example.com","password":"TestPass123!"}'
```

Copy the `access_token` from the response.

### Refresh Token (when expired after 15 min)

```bash
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -H "Cookie: refresh_token=YOUR_REFRESH_TOKEN_HERE"
```

The refresh token is returned as an HttpOnly cookie in the login response. You can find it in the `Set-Cookie` header.

---

## Postman Setup (Recommended)

### 1. Create Environment

1. In Postman, click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Name it: `Fork-Benders Local`
4. Add variables:
   - `base_url`: `http://localhost:8000`
   - `access_token`: (leave empty for now)
   - `refresh_token`: (leave empty for now)
5. Click **Save**
6. Select this environment from dropdown (top right)

---

## Test Suite

### Setup 1: Register/Login

**Request:** `POST {{base_url}}/api/auth/register/`

**Headers:**
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "email": "tester@example.com",
  "password": "TestPass123!",
  "password_confirm": "TestPass123!"
}
```

**Expected:** 201 Created

---

**OR Login (if user already exists):**

**Request:** `POST {{base_url}}/api/auth/login/`

**Headers:**
- `Content-Type`: `application/json`

**Body:**
```json
{
  "email": "tester@example.com",
  "password": "TestPass123!"
}
```

**After Response:**
1. Copy `access_token` from response body
2. Go to Environments → Fork-Benders Local
3. Paste into `access_token` CURRENT VALUE
4. Click **Cookies** tab (bottom of Postman)
5. Copy the `refresh_token` cookie value
6. Paste into `refresh_token` environment variable
7. Save environment

---

### Setup 2: Token Refresh (Use when token expires)

**Request:** `POST {{base_url}}/api/auth/refresh/`

**Headers:**
- `Cookie`: `refresh_token={{refresh_token}}`

**Expected Response:**
```json
{
  "access_token": "new-token-here"
}
```

**After Response:**
1. Copy new `access_token` from response
2. Update environment variable `access_token`
3. Check Cookies tab for new `refresh_token`
4. Update environment variable `refresh_token`
5. Save environment

**⚠️ Access tokens expire after 15 minutes. Run this request if you get 401 Unauthorized errors**

---

### Test 1: Current Habit (No Habit)

**Request:** `GET {{base_url}}/api/habits/current/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`

**Expected Response:**
```json
{
  "current_habit": null
}
```

**Status:** 200 OK

**✅ Validates:** Endpoint returns null when user has no habit

---

### Test 2: Recent Verses (Empty)

**Request:** `GET {{base_url}}/api/recent-verses/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`

**Expected Response:**
```json
[]
```

**Status:** 200 OK

**✅ Validates:** Endpoint returns empty array when no verses tracked

---

### Test 3: Dashboard (Empty State)

**Request:** `GET {{base_url}}/api/dashboard/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`

**Expected Response:**
```json
{
  "current_habit": null,
  "recent_verses": []
}
```

**Status:** 200 OK

**✅ Validates:** Dashboard aggregates both endpoints correctly in empty state

---

### Setup 3: Get Verse IDs

**Run in terminal:**
```bash
docker compose exec backend python manage.py shell
```

**In Python shell, paste these lines one at a time:**
```python
from api.models import Verse

verses = [
    Verse.objects.filter(book__short_name='Gen', chapter=1).first(),
    Verse.objects.filter(book__short_name='Gen', chapter=2).first(),
    Verse.objects.filter(book__short_name='Exod', chapter=1).first(),
]

for v in verses:
    if v:
        print(f"ID: {v.id}, {v.book.short_name} {v.chapter}:{v.verse_num}")

exit()
```

**Example output:**
```
ID: 1, Gen 1:1
ID: 45, Gen 2:1
ID: 1534, Exod 1:1
```

**📝 Save these 3 verse IDs** - you'll use them in the next tests.

---

### Test 4: Track First Verse

**Request:** `POST {{base_url}}/api/recent-verses/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "verse_id": 1
}
```
*(Replace `1` with your actual verse ID from Setup 3)*

**Expected Response:**
```json
{
  "id": 1,
  "verse": 1,
  "verse_text": "In the beginning God created the heaven and the earth.",
  "verse_reference": "Gen 1:1",
  "book_name": "Gen",
  "chapter": 1,
  "last_accessed": "2025-10-22T12:00:00Z"
}
```

**Status:** 201 Created

**✅ Validates:** First verse is tracked successfully

---

### Test 5: Track Second Verse (Different Chapter)

**Request:** `POST {{base_url}}/api/recent-verses/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`
- `Content-Type`: `application/json`

**Body:**
```json
{
  "verse_id": 45
}
```
*(Replace with your second verse ID - must be different book OR chapter)*

**Expected:** 201 Created with verse details

**Verify you now have 2 verses:**

**Request:** `GET {{base_url}}/api/recent-verses/`

**Expected:** Array with **2 items**, most recent first

**✅ Validates:** Can track multiple verses from different chapters

---

### Test 6: Update Same Book/Chapter

**Request:** `POST {{base_url}}/api/recent-verses/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`
- `Content-Type`: `application/json`

**Body:**
```json
{
  "verse_id": 5
}
```
*(Use another verse from Gen chapter 1 - same book AND chapter as first verse)*

**Expected Response:**
- `id` field will be **same as Test 4** (proves update, not create)
- `verse` will be the new verse ID
- `last_accessed` timestamp will be updated

**Verify still only 2 verses:**

**Request:** `GET {{base_url}}/api/recent-verses/`

**Expected:** Still only **2 items** in array

**✅ Validates:** Same book/chapter updates existing entry instead of creating duplicate

---

### Test 7: FIFO Deletion (3rd Book/Chapter)

**Request:** `POST {{base_url}}/api/recent-verses/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`
- `Content-Type`: `application/json`

**Body:**
```json
{
  "verse_id": 1534
}
```
*(Use verse from Exodus - different book than your current 2 entries)*

**Expected:** 201 Created

**Verify FIFO deletion occurred:**

**Request:** `GET {{base_url}}/api/recent-verses/`

**Expected:**
- Still only **2 verses** in array
- The **oldest** verse (from Test 5) should be gone
- New Exodus verse should be present
- Gen 1 verse (most recently updated in Test 6) should still be present

**✅ Validates:** Maximum 2 verses enforced, oldest entry deleted when tracking 3rd unique book/chapter

---

### Setup 4: Create Habit

**In terminal:**
```bash
docker compose exec backend python manage.py shell
```

**In Python shell, paste one line at a time:**
```python
from api.models import UserHabit, CustomUser
from django.utils import timezone

user = CustomUser.objects.get(email='tester@example.com')

habit = UserHabit.objects.create(
    user=user,
    habit='Daily Bible Reading',
    frequency='daily',
    purpose='spiritual growth',
    day='Monday',
    time=timezone.now(),
    reminder=1
)

print(f'Habit created with ID: {habit.id}')

exit()
```

**Expected output:** `Habit created with ID: 1`

---

### Test 8: Current Habit (With Data)

**Request:** `GET {{base_url}}/api/habits/current/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`

**Expected Response:**
```json
{
  "id": 1,
  "habit": "Daily Bible Reading",
  "frequency": "daily",
  "purpose": "spiritual growth",
  "day": "Monday",
  "time": "2025-10-22T12:00:00Z",
  "reminder": 1
}
```

**Status:** 200 OK

**✅ Validates:** Endpoint returns habit data when habit exists

---

### Test 9: Dashboard (Full Data)

**Request:** `GET {{base_url}}/api/dashboard/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`

**Expected Response:**
```json
{
  "current_habit": {
    "id": 1,
    "habit": "Daily Bible Reading",
    "frequency": "daily",
    "purpose": "spiritual growth",
    "day": "Monday",
    "time": "2025-10-22T12:00:00Z",
    "reminder": 1
  },
  "recent_verses": [
    {
      "id": 3,
      "verse": 1534,
      "verse_text": "...",
      "verse_reference": "Exod 1:1",
      "book_name": "Exod",
      "chapter": 1,
      "last_accessed": "..."
    },
    {
      "id": 1,
      "verse": 5,
      "verse_text": "...",
      "verse_reference": "Gen 1:5",
      "book_name": "Gen",
      "chapter": 1,
      "last_accessed": "..."
    }
  ]
}
```

**Status:** 200 OK

**✅ Validates:** Dashboard aggregates habit + recent verses in single response

---

## Error Testing

### Test 10: Missing verse_id

**Request:** `POST {{base_url}}/api/recent-verses/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`
- `Content-Type`: `application/json`

**Body:**
```json
{}
```

**Expected Response:**
```json
{
  "error": "verse_id is required"
}
```

**Status:** 400 Bad Request

**✅ Validates:** Proper error handling for missing required field

---

### Test 11: Invalid verse_id

**Request:** `POST {{base_url}}/api/recent-verses/`

**Headers:**
- `Authorization`: `Bearer {{access_token}}`
- `Content-Type`: `application/json`

**Body:**
```json
{
  "verse_id": 999999999
}
```

**Expected Response:**
```json
{
  "error": "Verse not found"
}
```

**Status:** 404 Not Found

**✅ Validates:** Proper error handling for non-existent verse

---

### Test 12: Missing Authorization

**Request:** `GET {{base_url}}/api/dashboard/`

**Headers:**
- (Remove Authorization header)

**Expected Response:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Status:** 401 Unauthorized

**✅ Validates:** JWT authentication is enforced on all endpoints

---

## Test Summary Checklist

Copy this checklist to track your testing progress:

```
□ Setup: Created test user account
□ Setup: Obtained access token
□ Setup: Retrieved verse IDs from database
□ Test 1: Current habit returns null (no habit)
□ Test 2: Recent verses returns empty array
□ Test 3: Dashboard returns empty state
□ Test 4: Track first verse (201 Created)
□ Test 5: Track second verse from different chapter (201 Created)
□ Test 5: Verified GET returns 2 verses
□ Test 6: Same book/chapter updates existing entry
□ Test 6: Verified still only 2 verses after update
□ Test 7: Third unique chapter triggers FIFO deletion
□ Test 7: Verified oldest verse removed, still 2 total
□ Setup: Created habit via Django shell
□ Test 8: Current habit returns habit data
□ Test 9: Dashboard aggregates habit + recent verses
□ Test 10: Missing verse_id returns 400 error
□ Test 11: Invalid verse_id returns 404 error
□ Test 12: Missing auth returns 401 error
□ Setup: Refreshed expired token successfully
```

---

## Acceptance Criteria Validation

✅ **AC 1:** Endpoint returns user's current active habit
- Covered by Test 1 (null) and Test 8 (with data)

✅ **AC 2:** Endpoint provides content discovery/search capabilities
- N/A for this ticket (future feature)

✅ **AC 3:** Endpoint retrieves recent content items for review
- Covered by Tests 2, 5, 6, 7

✅ **AC 4:** All endpoints handle authentication and user context
- Covered by Test 12 (401 enforcement)
- All endpoints scoped to `request.user`

✅ **AC 5:** Endpoints return appropriate data structure for frontend consumption
- All tests validate proper JSON structure
- Dashboard provides aggregated single-request response

---

## Implementation Details Validated

### RecentVerse Model
- ✅ Tracks max 2 verses per user
- ✅ Unique constraint on (user, book, chapter)
- ✅ Updates timestamp when same book/chapter tracked
- ✅ FIFO deletion when 3rd unique book/chapter added
- ✅ `last_accessed` auto-updates on save

### Authentication
- ✅ JWT required on all endpoints
- ✅ Rate limiting: 60 requests/minute per user
- ✅ Token refresh mechanism works

### Error Handling
- ✅ 400: Invalid request data (missing verse_id)
- ✅ 401: JWT expired/invalid
- ✅ 404: Verse not found
- ✅ 500: Server errors (covered by try/except blocks)

---

## Tips for Testing

1. **Token Management:**
   - Access tokens expire after 15 minutes
   - Use Setup 2 to refresh when you get 401 errors
   - Save both access and refresh tokens in Postman environment

2. **Postman Collections:**
   - Save all requests as a Collection for easy reuse
   - Use **Tests** tab to auto-update environment variables
   - Export collection to share with team

3. **Database State:**
   - Each test builds on previous state
   - Run tests in order for expected results
   - Use Django shell to reset state if needed

4. **Verse Selection:**
   - Tests 4-7 require specific book/chapter combinations
   - Use Setup 3 to get appropriate verse IDs
   - Verify book/chapter in response to confirm test logic

---

## Cleanup (Optional)

To reset test data after testing:

```bash
docker compose exec backend python manage.py shell
```

```python
from api.models import CustomUser, UserHabit, RecentVerse

user = CustomUser.objects.get(email='tester@example.com')

# Delete all related data
UserHabit.objects.filter(user=user).delete()
RecentVerse.objects.filter(user=user).delete()

# Optionally delete test user
# user.delete()

exit()
```

---

## Troubleshooting

**Issue:** "Authentication credentials were not provided"
- **Solution:** Check Authorization header is set to `Bearer {{access_token}}`
- Verify environment is selected in Postman (top right)

**Issue:** "Invalid token" or 401 Unauthorized
- **Solution:** Token expired - run Setup 2 to refresh

**Issue:** "Verse not found" on valid ID
- **Solution:** Verse might be from different translation than imported
- Run Setup 3 again to get valid verse IDs from your database

**Issue:** Rate limit 429 error
- **Solution:** Wait 1 minute, rate limit is 60 requests/minute

**Issue:** "refresh_token not found" on refresh request
- **Solution:** Check Cookie header format: `Cookie: refresh_token=YOUR_TOKEN`
- Ensure you copied refresh token from login Cookies tab
