# Step 1: Install and Configurations

cd frontend

install tailwind v3.3

# Step 2: Set design tokens

Set the design tokens in the tailwind.config.js file with base colors (primary, secondary, warning, success, dark mode, and light mode) and typography for H1, H2, H3, H4, and paragraph.

# Step 3: Add imports & directives

Import the tailwind directives in globals.css and add a globals.css import into layout.tsx.

# Step 4: Test Tailwind

Add a simple "Hello World" div with styling from design tokens in the page.tsx
file at the bottom. Such as:

<div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
  Tailwind v3 is working!
</div>
  
# Step 5: Start Development Server
Then run "npm run dev" to see it.

# Step 6: Explain

Explain how I can design a design system so that everyone in my team can use it.

# PART 2: Installing Shadcn/ui (Component Library)

## Step 8: Initialize Shadcn/ui (MANUAL INSTALL - YOU MUST RUN THIS YOURSELF)

cd frontend
npx shadcn@latest init

**Why you need to run this yourself:** The installation requires interactive prompts.

**Answer the prompts as follows:**

1. **Would you like to use TypeScript?** → Yes
2. **Which style would you like to use?** → Default (or New York if you prefer)
3. **Which color would you like to use as base color?** → Slate (or Zinc, Neutral, etc.)
4. **Would you like to use CSS variables for colors?** → Yes (recommended)
5. **Where is your global CSS file?** → app/globals.css
6. **Where is your tailwind.config located?** → tailwind.config.js (or .ts if you renamed it)
7. **Configure the import alias for components?** → @/components
8. **Configure the import alias for utils?** → @/lib/utils
9. **Are you using React Server Components?** → Yes (Next.js 14 App Router)

This creates:

- `components.json` - Shadcn configuration file

## Step 9: Install Your First Component (Button)

npx shadcn@latest add button

This creates:

- `frontend/components/ui/button.tsx` - The button component
- `frontend/lib/utils.ts` - Utility functions (if it doesn't exist)

## Step 10: Test the Button Component

In `frontend/app/page.tsx`, add:

```tsx
import { Button } from "@/components/ui/button";

// In your JSX:
<Button>Click me!</Button>
<Button variant="outline">Outlined Button</Button>
<Button variant="destructive">Delete</Button>
```

## Step 11: Run the Dev Server

npm run dev

Visit http://localhost:3000 - you should see styled buttons from shadcn/ui!

---

# Quick Reference: File Structure After Installation

```
frontend/
├── app/
│   ├── layout.tsx          (imports globals.css)
│   ├── page.tsx            (your pages use Tailwind classes)
│   └── globals.css         (has @tailwind directives at top)
├── components/
│   └── ui/                 (shadcn components go here)
│       └── button.tsx
├── lib/
│   └── utils.ts            (utility functions)
├── tailwind.config.js      (Tailwind v3 config)
├── postcss.config.js       (PostCSS config)
└── components.json         (shadcn config)
```

---

# Common Issues & Solutions

**Issue:** Tailwind classes not applying

- Make sure `@tailwind` directives are at the TOP of globals.css
- Check that layout.tsx imports globals.css
- Restart dev server (Ctrl+C, then npm run dev)

**Issue:** Shadcn components not found

- Verify path alias in tsconfig.json has `"@/*": ["./*"]`
- Check import path matches what you configured

**Issue:** Build errors

- Run `npm run build` to check for TypeScript errors
- Make sure all imports are correct
