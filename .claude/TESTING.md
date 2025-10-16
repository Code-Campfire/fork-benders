# Testing Strategy for Bible Import Feature

## ⚠️ IMPORTANT: Run These Tests Before Your PR

Before submitting your PR (especially after teammate's model PR merges), follow this checklist:

---

## 1. Unit Tests (Required)

Run all unit tests to verify individual functions work correctly:

```bash
# Run all tests
docker compose exec backend python manage.py test api.tests

# Run specific test files
docker compose exec backend python manage.py test api.tests.test_transform_bible_data
docker compose exec backend python manage.py test api.tests.test_fetch_bible_data
docker compose exec backend python manage.py test api.tests.test_seeds_command
```

**Expected Result:** All tests should pass ✅

---

## 2. Model Migration Checklist (CRITICAL - Do this when real models arrive)

When your teammate's PR with real models is merged:

### Step 1: Update Model Imports

- [ ] Open `backend/api/management/commands/seeds.py`
- [ ] Replace test model imports:
  ```python
  # OLD (remove this):
  from api.models import TranslationTest, BookTest, VerseTest

  # NEW (use this):
  from api.models import Translation, Book, Verse
  ```
- [ ] Find & replace throughout `seeds.py`:
  - `TranslationTest` → `Translation`
  - `BookTest` → `Book`
  - `VerseTest` → `Verse`

### Step 2: Verify Field Names Match ERD

Compare real model fields against ERD:
- [ ] Translation: `code`, `name`, `license`, `is_public`
- [ ] Book: `canon_order`, `name`, `short_name`, `testament`
- [ ] Verse: `translation_id`, `book_id`, `chapter`, `verse_num`, `text`, `text_len`, `tokens_json`

If field names differ, update code accordingly.

### Step 3: Update Tests

- [ ] Open `backend/api/tests/test_seeds_command.py`
- [ ] Replace all test model references with real models
- [ ] Run tests to verify compatibility

### Step 4: Clean Up

- [ ] Delete `backend/api/models.py` (temporary test models)
- [ ] Delete migration file: `backend/api/migrations/0001_initial.py`
- [ ] Reset database (if needed):
  ```bash
  docker compose down -v
  docker compose up -d
  docker compose exec backend python manage.py migrate
  ```

---

## 3. Integration Testing (Manual QA)

After models are updated and tests pass, manually verify:

### Test Case 1: Fresh Import
```bash
docker compose exec backend python manage.py seeds
```
- [ ] Select "1" (KJV)
- [ ] Verify: 66 books imported
- [ ] Verify: ~31,000 verses imported
- [ ] Verify: No errors

### Test Case 2: Re-import (Duplicate Handling)
```bash
docker compose exec backend python manage.py seeds
```
- [ ] Select "1" (KJV) again
- [ ] Verify: Old verses deleted
- [ ] Verify: New verses imported
- [ ] Verify: Counts match first import

### Test Case 3: Different Translation
```bash
docker compose exec backend python manage.py seeds
```
- [ ] Select "2" (WEB)
- [ ] Verify: Successful import
- [ ] Verify: Both translations exist in DB

### Test Case 4: Custom Translation
```bash
docker compose exec backend python manage.py seeds
```
- [ ] Enter "Anderson"
- [ ] Verify: Successful import

### Test Case 5: Invalid Translation
```bash
docker compose exec backend python manage.py seeds
```
- [ ] Enter "INVALID_TRANSLATION"
- [ ] Verify: Helpful error message
- [ ] Verify: No partial data created

### Test Case 6: Quit Option
```bash
docker compose exec backend python manage.py seeds
```
- [ ] Enter "q"
- [ ] Verify: Exits gracefully
- [ ] Verify: No API calls made

---

## 4. Database Verification

After successful imports, verify data in database:

```bash
# Check translations
docker compose exec backend python manage.py dbshell <<EOF
SELECT * FROM translations;
EOF

# Check book count
docker compose exec backend python manage.py dbshell <<EOF
SELECT COUNT(*) FROM books;
EOF

# Check verse sample
docker compose exec backend python manage.py dbshell <<EOF
SELECT b.name, v.chapter, v.verse_num, v.text
FROM verses v
JOIN books b ON v.book_id = b.id
WHERE b.name = 'Genesis' AND v.chapter = 1 AND v.verse_num <= 3;
EOF

# Verify normalized book names
docker compose exec backend python manage.py dbshell <<EOF
SELECT name, canon_order FROM books
WHERE name LIKE '%Samuel' OR name LIKE '%Corinthians' OR name = 'Revelation'
ORDER BY canon_order;
EOF
```

**Expected Results:**
- [ ] Translations table has entries
- [ ] Books table has 66 books (per translation)
- [ ] Verses table has ~31,000 verses per translation
- [ ] Book names are normalized ("1 Samuel", not "I Samuel")

---

## 5. Code Quality Checks

Before committing:

```bash
# Check for linting errors (if configured)
docker compose exec backend python -m pylint backend/api/utils/
docker compose exec backend python -m pylint backend/api/management/commands/seeds.py
```

---

## 🔴 DO NOT SKIP THIS CHECKLIST

Skipping these tests could result in:
- ❌ Broken imports when real models are merged
- ❌ Data corruption in database
- ❌ Failed PR builds
- ❌ Wasted time debugging later

---

## Test Coverage Summary

| Component | Test File | Coverage |
|-----------|-----------|----------|
| Book name normalization | `test_transform_bible_data.py` | ✅ All variations |
| Translation string parsing | `test_transform_bible_data.py` | ✅ Valid + edge cases |
| Data transformation | `test_transform_bible_data.py` | ✅ Full pipeline |
| API fetching | `test_fetch_bible_data.py` | ✅ Success + errors |
| Seeds command | `test_seeds_command.py` | ✅ Integration tests |
| Model compatibility | `test_seeds_command.py` | ✅ Field verification |

---

## Quick Test Command (Run This First)

```bash
# Run everything at once
docker compose exec backend python manage.py test api.tests && echo "✅ All tests passed!"
```

If this passes, proceed with manual QA.
If this fails, fix the issues before continuing.
