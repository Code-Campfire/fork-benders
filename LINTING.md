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
- **ESLint**: Next.js best practices + accessibility checks
- **Import ordering**: Alphabetical within groups

That's all you need to know! Questions? Ask the team.
