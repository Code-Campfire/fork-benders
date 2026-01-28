# SendGrid to Resend Migration Guide

## Status: Code Complete

**Resend Docs:** https://resend.com/docs/send-with-python

---

## Completed Code Changes

| File | Status |
|------|--------|
| `backend/requirements.txt` | ✅ `sendgrid==6.11.0` → `resend==2.0.0` |
| `backend/bible_app/settings.py` | ✅ Env vars renamed to `RESEND_*` |
| `backend/api/utils/email.py` | ✅ Both send functions updated |

---

## Next Steps (Your Action Required)

### 1. Update Environment Variables

**Add to your `.env`:**
```
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Remove from your `.env`:**
```
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
```

### 2. Resend Dashboard Setup

1. Go to https://resend.com/api-keys and create an API key
2. Go to https://resend.com/audiences and add your email as a verified recipient (required for sandbox)
3. Have all dev team members add their emails to the verified list

### 3. Restart Backend

After updating `.env`:
```bash
docker compose down && docker compose up -d
```

### 4. Test

- Register a new account to trigger verification email
- Check Resend dashboard for send logs: https://resend.com/emails

---

## Testing Checklist

- [x] Verification email sends in dev
- [ ] Verification email sends in staging
- [ ] Verification email sends in production
- [ ] Password reset email sends (requires endpoint - separate ticket)

---

## Sandbox Limitations

When using `onboarding@resend.dev`:
- Can only send to verified email addresses
- Rate limit: 3k emails/month (~100/day)

---

## Related Tickets

### Password Reset Endpoint (Not Yet Implemented)

The `send_password_reset_email()` function exists in `backend/api/utils/email.py` but has NO endpoint in views.py.

**Needs:**
- `POST /api/password-reset/request/` - takes email, sends reset link
- `POST /api/password-reset/confirm/` - takes token + new password

### Domain Configuration

Domain + DNS configuration when domain acquired (separate ticket for production `from` email).
