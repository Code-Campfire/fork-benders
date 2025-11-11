# Fork-Benders Project - Claude Instructions

## 🔴 NEXT STEPS / TODO

_Currently no active tasks. Update this section when starting new work._

---

## Daily Workflow

### Starting Work

```bash
docker compose up -d
```

### VS Code Setup

- Work in regular VS Code at the monorepo root
- Files are mounted via volumes - all changes sync to Docker automatically
- No need to attach to Docker container

### Ending Work

```bash
docker compose down
```

---

## Project Structure

```
fork-benders/
├── backend/
│   ├── api/
│   │   ├── models.py                         # Database models (User, Translation, Book, Verse, Habit, etc.)
│   │   ├── serializers.py                    # DRF serializers
│   │   ├── views.py                          # API views
│   │   ├── urls.py                           # API routes
│   │   ├── migrations/                       # Database migrations
│   │   ├── tests/                            # Test files
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── seeds.py                  # Bible import command
│   │   └── utils/
│   │       ├── fetch_bible_data.py           # Bible data fetcher
│   │       └── transform_bible_import_data.py # Bible data transformer
│   ├── bible_app/                            # Django project settings
│   ├── manage.py
│   └── requirements.txt
├── frontend/                                  # Next.js app
│   ├── api/                                   # API-specific client code
│   ├── app/                                   # Next.js App Router pages
│   ├── components/                            # React components
│   ├── lib/                                   # Utility libraries
│   │   ├── config.js                         # Centralized API configuration
│   │   ├── api.js                            # API client
│   │   ├── apiClient.js                      # API client utilities
│   │   ├── syncManager.js                    # Sync management
│   │   ├── db.js                             # Database utilities
│   │   └── ...
│   └── public/                               # Static assets
└── docker-compose.yml
```

---

## Running Django Scripts

**All Django commands run through Docker:**

```bash
docker compose exec backend python manage.py <command>
```

### Common Django Commands

```bash
# Make migrations (after model changes)
docker compose exec backend python manage.py makemigrations

# Apply migrations to database
docker compose exec backend python manage.py migrate

# Django shell (interactive Python)
docker compose exec backend python manage.py shell

# Database shell (PostgreSQL prompt)
docker compose exec backend python manage.py dbshell

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Run tests
docker compose exec backend python manage.py test

# Bible import (custom command)
docker compose exec backend python manage.py seeds
```

---

## Testing

```bash
# Run all tests
docker compose exec backend python manage.py test api.tests

# Run specific test file
docker compose exec backend python manage.py test api.tests.test_fetch_bible_data
```

**⚠️ Note:** `.claude/TESTING.md` is **OUTDATED** (references old seeds branch migration workflow). Ignore it for now.

---

## Important Notes

- **Python Version:** 3.12
- **All backend code changes auto-sync to Docker** via volume mount
- **Dependencies:** After adding to `requirements.txt`, rebuild with `docker compose build backend`
- **Frontend dependencies:** After adding to `package.json`, run `npm install` in frontend directory or rebuild with `docker compose build frontend`
- **Run tests before creating PRs**

---

## Session Briefing

At session start, automatically:

1. Review the "🔴 NEXT STEPS / TODO" section
2. Provide a 2-3 sentence summary of:
    - Current status (where you left off)
    - Next immediate task to tackle
    - Any blockers or dependencies

Keep it concise - just the essential context to resume work.

---

## Working Style

- Do not agree with me for any and all reasons. If what I want to do and you want to do differ, I want you to prompt a conversation with me on the topic.

---


## Archived Sections (Reference Only)

<details>
<summary>Bible Data Source Info (from seeds branch)</summary>

- Repo: https://github.com/scrollmapper/bible_databases
- Format: JSON
- Available translations: https://github.com/scrollmapper/bible_databases/tree/master/formats/json
- Note: Modern copyrighted translations (NIV, ESV, NLT, NKJV) are NOT available

</details>
