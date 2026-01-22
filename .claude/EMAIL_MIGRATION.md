# SendGrid to Resend Migration Guide

## Overview

Migrating email service from SendGrid to Resend for verification and password reset emails.

**Resend Docs:** https://resend.com/docs/send-with-python

---

## Files to Modify

| File | Changes |
|------|---------|
| `backend/requirements.txt` | Swap sendgrid → resend |
| `backend/bible_app/settings.py` | Rename 2 env var references |
| `backend/api/utils/email.py` | Change imports, update send logic in 2 functions |
| `.env` (all envs) | Swap env var names and values |

---

## 1. Dependencies (`backend/requirements.txt`)

**Remove:**
```
sendgrid==6.11.0
```

**Add:**
```
resend==2.0.0
```

After changing, rebuild: `docker compose build backend`

---

## 2. Settings (`backend/bible_app/settings.py`, lines 187-190)

**Current:**
```python
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDGRID_FROM_EMAIL = os.environ.get('SENDGRID_FROM_EMAIL', 'noreply@biblememorization.com')
```

**Change to:**
```python
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
RESEND_FROM_EMAIL = os.environ.get('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
```

---

## 3. Email Utility (`backend/api/utils/email.py`)

### Imports (lines 8-9)

**Current:**
```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
```

**Change to:**
```python
import resend
```

### `send_verification_email()` - sending logic (lines 125-146)

**Current:**
```python
if not settings.SENDGRID_API_KEY or settings.SENDGRID_API_KEY == 'your_sendgrid_api_key_here':
    logger.warning(f"SendGrid API key not configured. Verification email for {user.email} not sent.")
    logger.info(f"Verification URL (for testing): {verification_url}")
    return (False, "SendGrid API key not configured. Check server logs for verification URL.")

message = Mail(
    from_email=settings.SENDGRID_FROM_EMAIL,
    to_emails=user.email,
    subject=subject,
    plain_text_content=plain_content,
    html_content=html_content
)

sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
response = sg.send(message)

if response.status_code in [200, 201, 202]:
    logger.info(f"Verification email sent successfully to {user.email}")
    return (True, None)
else:
    logger.error(f"SendGrid returned status {response.status_code} for {user.email}")
    return (False, f"Email service returned status {response.status_code}")
```

**Change to:**
```python
if not settings.RESEND_API_KEY:
    logger.warning(f"Resend API key not configured. Verification email for {user.email} not sent.")
    logger.info(f"Verification URL (for testing): {verification_url}")
    return (False, "Resend API key not configured. Check server logs for verification URL.")

resend.api_key = settings.RESEND_API_KEY

params = {
    "from": settings.RESEND_FROM_EMAIL,
    "to": [user.email],
    "subject": subject,
    "html": html_content,
    "text": plain_content,
}

response = resend.Emails.send(params)

if response.get("id"):
    logger.info(f"Verification email sent successfully to {user.email}, resend_id={response.get('id')}")
    return (True, None)
else:
    logger.error(f"Resend failed for {user.email}: {response}")
    return (False, "Email service failed to send")
```

### `send_password_reset_email()` - sending logic (lines 252-273)

Apply the same pattern as above.

---

## 4. Environment Variables

### Add to all environments:
```
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Remove from all environments:
```
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
```

---

## 5. Error Handling Differences

| SendGrid | Resend |
|----------|--------|
| Returns HTTP status codes (200, 201, 202) | Returns `{"id": "..."}` on success |
| Raises `SendGridException` on errors | Raises `resend.exceptions.ResendError` on errors |

---

## 6. Sandbox Limitations

When using `onboarding@resend.dev`:
- Can only send to verified email addresses
- All 5 dev team members need to add their email to Resend verified list
- Rate limit: 3k emails/month (~100/day)

---

## 7. Testing Checklist

- [ ] Verification email sends in dev
- [ ] Verification email sends in staging
- [ ] Verification email sends in production
- [ ] Password reset email sends (requires endpoint - separate ticket)

---

## Related Tickets

### Password Reset Endpoint (Not Yet Implemented)

The `send_password_reset_email()` function exists in `backend/api/utils/email.py:153-277` but has NO endpoint in views.py.

**Needs:**
- `POST /api/password-reset/request/` - takes email, sends reset link
- `POST /api/password-reset/confirm/` - takes token + new password

---

## Follow-up Ticket

Domain + DNS configuration when domain acquired (separate ticket for production `from` email).
