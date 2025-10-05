# Code Quality Setup

## First Time Setup

```bash
# Install dependencies
npm install              # At project root
cd frontend && npm install
```

That's it! Pre-commit hooks are now active.

## How It Works

**On Save** (VS Code only):
- Code auto-formats with Prettier
- ESLint highlights errors

**On Commit**:
- Prettier formats staged files
- ESLint auto-fixes issues
- Commit fails if errors remain

## Common Commands

```bash
# Check for issues
npm run lint

# Auto-fix what's possible
npm run lint:fix

# Format all files
npm run format
```

## Common Issues & Fixes

### "Missing alt text on image"
```tsx
// ❌ Bad
<img src="/logo.png" />

// ✅ Good
<img src="/logo.png" alt="Company logo" />
```

### "Import order violation"
The hook will auto-fix this. Imports are organized:
1. Node built-ins (`fs`, `path`)
2. External packages (`react`, `axios`)
3. Your files (`@/components`)

### "Commit blocked by linter"
1. Check error message
2. Run `npm run lint:fix` in frontend/
3. Manually fix remaining issues
4. Try commit again

## Rules We Follow

- **Prettier**: 4 spaces, semicolons, single quotes
- **ESLint**: Next.js best practices + accessibility checks + base JavaScript rules
- **Import ordering**: Alphabetical within groups

## Testing the Linting Setup

Want to verify ESLint and Husky are working? Create these test files in `frontend/app/`:

### Test 1: Auto-Fix Test (Commit Should Succeed)

**File:** `frontend/app/test-autofix.js`

```javascript
// Imports in WRONG order - should be: builtin → external → internal
// ESLint --fix will reorder these automatically
import axios from 'axios';
import path from 'path';

function fetchData(endpoint) {
    const fullPath = path.join('/api', endpoint);
    return axios.get(fullPath);
}

export default fetchData;
```

**Test:**
```bash
git add frontend/app/test-autofix.js
git commit -m "Test auto-fix"
```

**Expected:** Commit succeeds. ESLint auto-fixes the import order.

### Test 2: Error Test (Commit Should Fail)

**File:** `frontend/app/test-commit.js`

```javascript
const unusedVariable = 'test';

function testFunction() {
    console.log(undefinedVariable);
}
```

**Test:**
```bash
git add frontend/app/test-commit.js
git commit -m "Test linting errors"
```

**Expected:** Commit fails with 4 errors:
- `unusedVariable` is assigned but never used
- `testFunction` is defined but never used
- Unexpected `console.log` statement
- `undefinedVariable` is not defined

**Cleanup:** `git restore --staged frontend/app/test-*.js && rm frontend/app/test-*.js`

That's all you need to know! Questions? Ask the team.
