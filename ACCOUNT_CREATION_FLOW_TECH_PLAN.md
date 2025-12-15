# Account Creation Flow - Technical Implementation Plan

## Overview
Implement the complete user onboarding experience from app launch through successful account registration, including welcome screen, authentication method selection, and handoff to habit formation.

---

## Architecture Overview

### User Flow
```
App Launch
    ↓
Welcome Screen (NEW)
    ↓
Login/Create Account Options (NEW)
    ↓
[User selects "Create Account"]
    ↓
Method Selection Screen (NEW)
    ├─→ Email/Password Flow (ENHANCED - existing RegisterForm.js)
    └─→ OAuth Flow (ENHANCED - existing GoogleLoginButton.jsx)
    ↓
Account Created Successfully
    ↓
Habit Formation Screen (FUTURE - separate ticket)
```

### Tech Stack
- **Framework:** Next.js 15.5.6 (App Router)
- **UI Library:** shadcn/ui + Radix UI
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Notifications:** Sonner (toast)

---

## Implementation Plan

### Phase 1: New Pages/Screens (Routes)

#### 1.1 Welcome Screen
**Route:** `/welcome` or `/` (replace current home page)

**Purpose:** First screen users see when launching the app for the first time

**Components Needed:**
- Welcome page component with app branding
- "Get Started" CTA button
- Optional: App feature highlights/carousel

#### 1.2 Auth Options Screen
**Route:** `/auth` or `/get-started`

**Purpose:** Present login vs. create account choice

**Components Needed:**
- Two prominent CTAs: "Log In" and "Create Account"
- Optional: "Continue as Guest" (if supported)
- Legal links (Terms, Privacy Policy)

#### 1.3 Method Selection Screen
**Route:** `/auth/signup-method` or `/register/method`

**Purpose:** Let users choose how to create their account

**Components Needed:**
- Email/Password button
- OAuth provider buttons (Google, potentially Apple/Facebook)
- Visual distinction between methods
- "Already have an account?" link back to login

---

### Phase 2: Component Architecture

```
app/
├── welcome/
│   └── page.js                          # NEW - Welcome screen
├── auth/
│   ├── page.js                          # NEW - Login/Create Account options
│   └── signup-method/
│       └── page.js                      # NEW - Method selection screen
├── register/
│   └── page.js                          # MODIFIED - Email/password registration
├── login/
│   └── page.js                          # MODIFIED - Add back navigation
└── habit-formation/
    └── page.js                          # FUTURE (separate ticket)

components/
├── auth/
│   ├── WelcomeScreen.jsx                # NEW
│   ├── AuthOptionsCard.jsx              # NEW
│   ├── SignupMethodSelector.jsx         # NEW
│   ├── RegisterForm.js                  # MODIFIED - Integration updates
│   ├── GoogleLoginButton.jsx            # MODIFIED - OAuth flow updates
│   └── AuthProvider.js                  # MODIFIED - First-time user detection
├── onboarding/
│   └── HabitFormationFlow.jsx           # FUTURE (separate ticket)
└── ui/
    └── (existing shadcn components)     # REUSED
```

---

### Phase 3: Detailed File Changes

#### NEW FILES

##### 1. `/app/welcome/page.js`
```javascript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import WelcomeScreen from '@/components/auth/WelcomeScreen';

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return <WelcomeScreen />;
}
```

**Purpose:** Welcome screen route that redirects authenticated users

**Dependencies:**
- WelcomeScreen component (NEW)
- useAuthStore hook (EXISTING)
- Next.js useRouter (EXISTING)

---

##### 2. `/components/auth/WelcomeScreen.jsx`
```javascript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, TrendingUp } from 'lucide-react';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bible-gold/10 to-background p-6">
      {/* App Logo/Icon */}
      <div className="mb-8">
        {/* TODO: Add app logo */}
        <h1 className="text-4xl font-bold text-brand">Fork-Benders</h1>
      </div>

      {/* App Tagline */}
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Build Better Habits with Scripture
        </h2>
        <p className="text-muted-foreground">
          Transform your life one verse at a time
        </p>
      </div>

      {/* Feature Highlights (Optional) */}
      <div className="mb-12 grid gap-4 text-center max-w-md">
        <FeatureItem
          icon={<BookOpen className="h-6 w-6" />}
          text="Daily Bible reading plans"
        />
        <FeatureItem
          icon={<Target className="h-6 w-6" />}
          text="Track spiritual habits"
        />
        <FeatureItem
          icon={<TrendingUp className="h-6 w-6" />}
          text="Monitor your progress"
        />
      </div>

      {/* CTA Button */}
      <Button
        size="lg"
        className="w-full max-w-md"
        onClick={() => router.push('/auth')}
      >
        Get Started
      </Button>

      {/* Legal Footer */}
      <div className="mt-8 text-xs text-muted-foreground">
        By continuing, you agree to our{' '}
        <a href="/terms" className="underline">Terms</a> and{' '}
        <a href="/privacy" className="underline">Privacy Policy</a>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-brand/10 p-2 text-brand">
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}
```

**Purpose:** Main welcome screen UI with app branding and features

**Design Elements:**
- App logo and tagline
- Feature highlights with icons
- Primary CTA to proceed
- Legal links footer

**UI Components Used:**
- `Button` (EXISTING shadcn)
- Custom layout with Tailwind
- lucide-react icons (EXISTING)

**Design Tokens:**
- `text-brand` - Brand color (#FF6B35)
- `text-bible-gold` - Bible gold color
- Standard shadcn/ui spacing and typography

---

##### 3. `/app/auth/page.js`
```javascript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import AuthOptionsCard from '@/components/auth/AuthOptionsCard';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <AuthOptionsCard />
    </div>
  );
}
```

**Purpose:** Auth options route (login vs. create account)

**Dependencies:**
- AuthOptionsCard component (NEW)
- useAuthStore hook (EXISTING)

---

##### 4. `/components/auth/AuthOptionsCard.jsx`
```javascript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AuthOptionsCard() {
  const router = useRouter();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome</CardTitle>
        <CardDescription>
          Sign in to continue or create a new account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create Account Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={() => router.push('/auth/signup-method')}
        >
          Create Account
        </Button>

        <Separator className="my-4" />

        {/* Login Button */}
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => router.push('/login')}
        >
          Log In
        </Button>

        {/* Optional: Guest Access */}
        {/* <Button
          size="sm"
          variant="ghost"
          className="w-full mt-4"
          onClick={() => router.push('/dashboard')}
        >
          Continue as Guest
        </Button> */}
      </CardContent>
    </Card>
  );
}
```

**Purpose:** Present login vs. create account options

**UI Components Used:**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` (EXISTING)
- `Button` (EXISTING)
- `Separator` (EXISTING)

**Navigation:**
- "Create Account" → `/auth/signup-method`
- "Log In" → `/login`

---

##### 5. `/app/auth/signup-method/page.js`
```javascript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import SignupMethodSelector from '@/components/auth/SignupMethodSelector';

export default function SignupMethodPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignupMethodSelector />
    </div>
  );
}
```

**Purpose:** Method selection route

**Dependencies:**
- SignupMethodSelector component (NEW)

---

##### 6. `/components/auth/SignupMethodSelector.jsx`
```javascript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';

export default function SignupMethodSelector() {
  const router = useRouter();

  const handleEmailSignup = () => {
    router.push('/register');
  };

  const handleGoogleSuccess = () => {
    // Will be handled by GoogleLoginButton
    // After successful OAuth, redirect to habit formation
    router.push('/habit-formation');
  };

  return (
    <div className="w-full max-w-md">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Choose how you'd like to sign up
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email/Password Option */}
          <Button
            size="lg"
            variant="outline"
            className="w-full justify-start"
            onClick={handleEmailSignup}
          >
            <Mail className="mr-2 h-5 w-5" />
            Sign up with Email
          </Button>

          {/* OAuth Options */}
          <div className="space-y-2">
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              mode="signup"
            />

            {/* Future: Add more OAuth providers */}
            {/* <AppleLoginButton /> */}
            {/* <FacebookLoginButton /> */}
          </div>

          {/* Already Have Account Link */}
          <div className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-brand hover:underline"
            >
              Log in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Purpose:** Method selection UI with OAuth and email options

**UI Components Used:**
- `Card` components (EXISTING)
- `Button` (EXISTING)
- lucide-react icons: `Mail`, `ArrowLeft` (EXISTING)
- `GoogleLoginButton` (MODIFIED)

**Navigation:**
- "Sign up with Email" → `/register`
- "Back" → Previous page (router.back())
- "Log in" link → `/login`
- After OAuth success → `/habit-formation`

---

#### MODIFIED FILES

##### 7. `/components/auth/RegisterForm.js` (MODIFICATIONS)

**Changes Needed:**
1. Add success callback prop for navigation control
2. Update success handler to redirect to habit formation instead of dashboard
3. Add back navigation option
4. Update UI to match new flow design

**Key Modifications:**
```javascript
// ADD: Success callback prop
export default function RegisterForm({ onSuccess }) {
  // ... existing code ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ... existing registration logic ...

      // MODIFY: Use callback instead of direct router.push
      if (onSuccess) {
        onSuccess(data.user);
      } else {
        router.push('/habit-formation'); // Default to habit formation
      }
    } catch (err) {
      // ... existing error handling ...
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      {/* ADD: Back button */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* ... existing form UI ... */}
    </Card>
  );
}
```

**Updated Props:**
- `onSuccess?: (user) => void` - Callback after successful registration

**Modified Behavior:**
- Redirects to `/habit-formation` instead of `/dashboard` on success
- Adds back navigation button
- Maintains existing validation and error handling

---

##### 8. `/app/register/page.js` (MODIFICATIONS)

**Changes Needed:**
1. Update to handle new onSuccess callback
2. Ensure proper navigation after registration

```javascript
'use client';

import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegistrationSuccess = (user) => {
    // Navigate to habit formation after successful registration
    router.push('/habit-formation');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <RegisterForm onSuccess={handleRegistrationSuccess} />
    </div>
  );
}
```

---

##### 9. `/components/auth/GoogleLoginButton.jsx` (MODIFICATIONS)

**Changes Needed:**
1. Add `mode` prop to differentiate signup vs. login
2. Add `onSuccess` callback prop
3. Update success handler to route appropriately based on mode
4. Ensure proper error handling and user feedback

**Key Modifications:**
```javascript
// ADD: New props
export default function GoogleLoginButton({
  mode = 'login',  // 'login' | 'signup'
  onSuccess
}) {
  // ... existing Google OAuth logic ...

  const handleGoogleSuccess = async (response) => {
    try {
      // ... existing token exchange logic ...

      // MODIFY: Handle success based on mode
      if (mode === 'signup') {
        // Check if this is a new user
        const isNewUser = response.isNewUser || false;

        if (onSuccess) {
          onSuccess(userData);
        } else {
          router.push('/habit-formation');
        }
      } else {
        // Login mode - go to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      // ... existing error handling ...
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="w-full justify-start"
      onClick={handleGoogleLogin}
    >
      {/* Google icon */}
      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
        {/* ... existing Google logo SVG ... */}
      </svg>
      {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
    </Button>
  );
}
```

**Updated Props:**
- `mode?: 'login' | 'signup'` - Determines button text and success behavior
- `onSuccess?: (user) => void` - Callback after successful OAuth

**Modified Behavior:**
- In signup mode, redirects to `/habit-formation`
- In login mode, redirects to `/dashboard`
- Supports custom success callbacks

---

##### 10. `/app/login/page.js` (MODIFICATIONS)

**Changes Needed:**
1. Add back navigation button
2. Update to match new design consistency

```javascript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      {/* ADD: Back button */}
      <div className="w-full max-w-md mb-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <LoginForm />
    </div>
  );
}
```

---

##### 11. `/components/auth/AuthProvider.js` (MODIFICATIONS)

**Changes Needed:**
1. Add first-time user detection
2. Determine if welcome screen should be shown
3. Check onboarding status from IndexedDB via auth store

```javascript
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ children }) {
  const { isInitialized, initializeAuth, hasSeenWelcome, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Initialize auth on mount (loads from IndexedDB)
    initializeAuth();

    // ADD: Check if first-time user after store hydration
    if (isInitialized && !hasSeenWelcome && !isAuthenticated) {
      // First-time user - redirect to welcome
      router.push('/welcome');
    }
  }, [isInitialized, hasSeenWelcome, isAuthenticated, router]);

  // Show loading state while initializing/hydrating from IndexedDB
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand" />
      </div>
    );
  }

  return children;
}
```

**Modified Behavior:**
- Detects first-time users via `hasSeenWelcome` from IndexedDB
- Redirects to `/welcome` for first-time users
- Waits for Zustand IndexedDB hydration before checking state
- Maintains existing auth initialization logic

**Storage:**
- **Before:** Checked `localStorage.getItem('hasSeenWelcome')` directly
- **After:** Uses `hasSeenWelcome` from Zustand store (automatically loaded from IndexedDB)

---

##### 12. `/lib/zustand-idb-storage.js` (NEW FILE)

**Purpose:** Custom Zustand storage adapter for IndexedDB integration

**Changes Needed:**
1. Create IndexedDB storage adapter for Zustand
2. Integrate with existing PWA IndexedDB infrastructure
3. Use existing `userSettings` store in db.js

```javascript
import * as db from './db';

/**
 * Custom Zustand storage adapter using IndexedDB
 * Integrates with existing PWA offline-first architecture
 */
export const idbStorage = {
  /**
   * Retrieve item from IndexedDB userSettings store
   */
  getItem: async (name) => {
    try {
      const result = await db.getSetting(name);
      return result?.value || null;
    } catch (error) {
      console.error('IDB getItem error:', error);
      return null;
    }
  },

  /**
   * Store item in IndexedDB userSettings store
   */
  setItem: async (name, value) => {
    try {
      await db.setSetting(name, value);
    } catch (error) {
      console.error('IDB setItem error:', error);
    }
  },

  /**
   * Remove item from IndexedDB userSettings store
   */
  removeItem: async (name) => {
    try {
      await db.deleteSetting(name);
    } catch (error) {
      console.error('IDB removeItem error:', error);
    }
  },
};
```

**Benefits:**
- Consistent with existing PWA architecture (all data in IndexedDB)
- Better performance for offline-first apps
- Larger storage quota than localStorage
- Async operations (non-blocking)
- Easy to clear all user data on logout

---

##### 13. `/lib/auth-store.js` (MODIFICATIONS)

**Changes Needed:**
1. Add onboarding status tracking
2. Add method to mark welcome screen as seen
3. Add method to mark habit formation as completed
4. **Use IndexedDB storage instead of localStorage for PWA compatibility**

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './zustand-idb-storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ... existing auth state ...

      // ADD: Onboarding state
      hasSeenWelcome: false,
      hasCompletedHabitFormation: false,

      // ADD: Onboarding methods
      markWelcomeSeen: () => {
        set({ hasSeenWelcome: true });
      },

      markHabitFormationComplete: () => {
        set({ hasCompletedHabitFormation: true });
      },

      // ... existing methods (setAuth, clearAuth, etc.) ...
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => idbStorage), // ✅ Use IndexedDB via custom adapter
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        hasSeenWelcome: state.hasSeenWelcome,
        hasCompletedHabitFormation: state.hasCompletedHabitFormation,
      }),
    }
  )
);
```

**New State:**
- `hasSeenWelcome: boolean` - Tracks if user has seen welcome screen
- `hasCompletedHabitFormation: boolean` - Tracks onboarding completion

**New Methods:**
- `markWelcomeSeen()` - Called when user proceeds from welcome screen
- `markHabitFormationComplete()` - Called when habit formation is done

**Storage Architecture:**
- **Before:** localStorage (5-10MB limit, synchronous, not PWA-optimized)
- **After:** IndexedDB via existing `userSettings` store (50MB+, async, PWA-ready)
- **Integration:** Uses existing [lib/db.js](frontend/lib/db.js) infrastructure

---

#### FUTURE FILES (Separate Ticket)

##### 13. `/app/habit-formation/page.js` (FUTURE)
**Purpose:** Habit formation onboarding flow

**Note:** This will be implemented in a separate ticket. For now, this route can show a placeholder or redirect to dashboard.

**Placeholder Implementation:**
```javascript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HabitFormationPage() {
  const router = useRouter();

  // TODO: Implement actual habit formation flow
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Habit Formation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Habit formation flow coming soon!
          </p>
          <Button
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Phase 4: Navigation Flow Logic

#### Route Hierarchy
```
/welcome
  ↓
/auth (login vs. create account)
  ├─→ /login
  │     ↓
  │   /dashboard
  │
  └─→ /auth/signup-method
        ├─→ /register (email/password)
        │     ↓
        │   /habit-formation → /dashboard
        │
        └─→ [OAuth] (Google/Apple/etc.)
              ↓
            /habit-formation → /dashboard
```

#### Back Navigation Behavior

| Current Page | Back Action | Implementation |
|--------------|-------------|----------------|
| `/welcome` | None (first screen) | No back button |
| `/auth` | → `/welcome` | `router.back()` |
| `/login` | → `/auth` | `router.back()` |
| `/auth/signup-method` | → `/auth` | `router.back()` |
| `/register` | → `/auth/signup-method` | `router.back()` |
| `/habit-formation` | None (onboarding flow) | No back button, skip button instead |

#### Authenticated User Redirects

All pre-auth pages should redirect authenticated users to `/dashboard`:
- `/welcome`
- `/auth`
- `/auth/signup-method`
- `/login`
- `/register`

**Implementation pattern:**
```javascript
const { isAuthenticated } = useAuthStore();

useEffect(() => {
  if (isAuthenticated) {
    router.push('/dashboard');
  }
}, [isAuthenticated, router]);
```

---

### Phase 5: Error Handling & Edge Cases

#### Error Scenarios

1. **OAuth Failure**
   - Display error toast notification
   - Allow user to retry or choose different method
   - Log error for debugging

2. **Email/Password Registration Failure**
   - Show inline error messages (existing RegisterForm behavior)
   - Clear form on critical errors
   - Maintain form state on network errors

3. **Network Errors**
   - Show user-friendly error message
   - Provide retry mechanism
   - Cache form data to prevent loss

4. **Duplicate Account**
   - Detect via API response
   - Show message: "Account already exists. Would you like to log in?"
   - Provide direct link to login page

#### Edge Cases

1. **User Refreshes Mid-Flow**
   - Each page is independent (stateless)
   - No progress lost
   - User can resume from any step

2. **User Uses Browser Back**
   - Next.js handles browser back naturally
   - Each page has explicit back buttons for clarity

3. **User Already Authenticated**
   - All auth pages redirect to `/dashboard`
   - Prevents confusion and loops

4. **First-Time vs. Returning User**
   - `hasSeenWelcome` flag determines if welcome screen shows
   - Returning users go directly to `/login` or `/dashboard`

---

### Phase 6: Testing Checklist

#### Unit Tests

- [ ] `WelcomeScreen.jsx` renders correctly
- [ ] `AuthOptionsCard.jsx` navigation buttons work
- [ ] `SignupMethodSelector.jsx` method selection works
- [ ] `RegisterForm.js` onSuccess callback fires
- [ ] `GoogleLoginButton.jsx` mode prop changes behavior
- [ ] `auth-store.js` onboarding methods update state
- [ ] `zustand-idb-storage.js` adapter getItem/setItem/removeItem work
- [ ] IndexedDB hydration restores auth state correctly

#### Integration Tests

- [ ] Welcome → Auth → Method Selection flow
- [ ] Method Selection → Email Registration flow
- [ ] Method Selection → OAuth flow
- [ ] Registration success → Habit Formation navigation
- [ ] Back navigation at each step
- [ ] Authenticated user redirects work

#### E2E Tests

- [ ] Complete new user signup flow (email)
- [ ] Complete new user signup flow (OAuth)
- [ ] Returning user login flow
- [ ] Error handling for failed registration
- [ ] Browser refresh at each step
- [ ] Browser back button behavior

#### Manual Testing

- [ ] Welcome screen displays on first launch
- [ ] "Get Started" button navigates correctly
- [ ] Login/Create Account options clear and functional
- [ ] Method selection shows all options
- [ ] Email/password registration works end-to-end
- [ ] Google OAuth flow works end-to-end
- [ ] Back navigation intuitive at each step
- [ ] Success states route to correct next step
- [ ] Error states display user-friendly messages
- [ ] UI consistent with app design system
- [ ] Responsive on mobile devices
- [ ] Accessible (keyboard navigation, screen readers)

#### PWA/IndexedDB Testing

- [ ] Auth state persists after page refresh
- [ ] Auth state persists after browser close/reopen
- [ ] `hasSeenWelcome` flag prevents welcome screen on return visit
- [ ] IndexedDB `BibleStudyDB` → `userSettings` contains `auth-storage` key
- [ ] Clearing IndexedDB resets onboarding state
- [ ] No localStorage usage for auth (verify in DevTools)
- [ ] Works offline after initial setup
- [ ] Hydration completes before routing logic executes

---

### Phase 7: Dependencies & Prerequisites

#### NPM Packages (Already Installed)
- ✅ `next` - Framework
- ✅ `react` & `react-dom` - UI library
- ✅ `zustand` - State management
- ✅ `axios` - API calls
- ✅ `lucide-react` - Icons
- ✅ `sonner` - Toast notifications
- ✅ `tailwindcss` - Styling
- ✅ All shadcn/ui components

#### New Dependencies (If Needed)
- [ ] `framer-motion` (optional) - Animations for welcome screen
  ```bash
  npm install framer-motion
  ```

#### Backend API Requirements

Ensure these endpoints are ready:

1. **POST /api/auth/register/** (EXISTING)
   - Email/password registration
   - Returns user object and tokens

2. **POST /api/auth/google/** (EXISTING, may need updates)
   - Google OAuth token exchange
   - Should return `isNewUser` flag to differentiate signup vs. login
   - Returns user object and tokens

3. **GET /api/auth/me/** (EXISTING)
   - Retrieve current user info
   - Used for auth state verification

4. **POST /api/auth/refresh/** (EXISTING)
   - Token refresh endpoint

**Potential Backend Updates:**
- Modify `/api/auth/google/` to return `isNewUser: boolean` in response
- This helps frontend distinguish between new account creation and existing account login

---

### Phase 8: Design Consistency

#### Design System Alignment

All new components should use:

**Colors:**
- Brand: `#FF6B35` (via `text-brand`, `bg-brand`)
- Bible Gold: `#D4AF37` (via `text-bible-gold`)
- shadcn/ui semantic colors: `primary`, `secondary`, `muted`, `destructive`

**Typography:**
- Headings: `text-2xl font-semibold`, `text-xl font-medium`
- Body: `text-sm`, `text-base`
- Muted text: `text-muted-foreground`

**Spacing:**
- Consistent with shadcn/ui: `space-y-4`, `gap-4`, `p-6`

**Components:**
- Use existing shadcn/ui components for consistency
- Maintain existing button variants and sizes
- Follow card layout patterns from LoginForm/RegisterForm

#### Responsive Design

- All layouts should be mobile-first
- Use `max-w-md` for form containers (existing pattern)
- Ensure touch targets are minimum 44x44px
- Test on mobile (375px), tablet (768px), and desktop (1024px+)

#### Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation works throughout flow
- Focus indicators visible
- Color contrast meets WCAG AA standards (existing theme already compliant)
- Error messages announced to screen readers

---

### Phase 9: Implementation Order (Recommended)

#### Sprint 1: Core Structure (Week 1)
1. Create welcome screen route and component
2. Create auth options route and component
3. Create method selection route and component
4. Add back navigation buttons to existing login/register pages
5. Update AuthProvider for first-time user detection

#### Sprint 2: Integration (Week 2)
6. Modify RegisterForm for new navigation flow
7. Modify GoogleLoginButton for signup mode
8. Update auth-store with onboarding state
9. Create habit formation placeholder page
10. Wire up all navigation between pages

#### Sprint 3: Polish & Testing (Week 3)
11. Add animations/transitions (optional)
12. Implement error handling and edge cases
13. Write unit and integration tests
14. Manual QA across devices
15. Accessibility audit

#### Sprint 4: Backend Coordination (if needed)
16. Coordinate with backend team for OAuth `isNewUser` flag
17. Test OAuth flow end-to-end
18. Fix any integration issues

---

### Phase 10: Success Metrics

#### Acceptance Criteria Verification

- ✅ Welcome page displays with option to proceed
- ✅ Login or Create Account options are clearly presented
- ✅ Selecting "Create Account" navigates to method selection screen
- ✅ Method selection screen shows both Email/Password and OAuth options as buttons
- ✅ Each method button triggers respective auth flow (implemented in separate tickets)
- ✅ Successful account creation from any method routes user to habit formation process
- ✅ Back navigation works appropriately at each step
- ✅ UI is consistent with app design system

#### Additional Quality Metrics

- Page load time < 2 seconds for each step
- Zero console errors during flow
- 100% of components pass accessibility audit
- Mobile usability score > 90 (Lighthouse)
- All unit tests passing
- E2E tests covering happy path and error cases

---

## File Summary (Condensed)

### New Files

1. **[app/welcome/page.js](app/welcome/page.js)** - Welcome route with authenticated user redirect detection using `useAuthStore` and Next.js `useRouter`

2. **[components/auth/WelcomeScreen.jsx](components/auth/WelcomeScreen.jsx)** - Welcome UI featuring app branding, feature highlights with lucide-react icons (`BookOpen`, `Target`, `TrendingUp`), "Get Started" CTA using shadcn `Button`, and legal links footer

3. **[app/auth/page.js](app/auth/page.js)** - Auth options route (login vs signup) with authenticated redirect using `useAuthStore` and `useRouter`

4. **[components/auth/AuthOptionsCard.jsx](components/auth/AuthOptionsCard.jsx)** - Login/signup choice UI using shadcn `Card`, `Button`, and `Separator` components with navigation to `/auth/signup-method` or `/login`

5. **[app/auth/signup-method/page.js](app/auth/signup-method/page.js)** - Signup method selection route with authenticated redirect logic

6. **[components/auth/SignupMethodSelector.jsx](components/auth/SignupMethodSelector.jsx)** - Method selection UI displaying email/password option and OAuth providers using shadcn `Card`, `Button`, lucide-react icons (`Mail`, `ArrowLeft`), and existing `GoogleLoginButton` component

7. **[app/habit-formation/page.js](app/habit-formation/page.js)** - Placeholder for future habit formation flow with temporary "Continue to Dashboard" button using shadcn `Card` and `Button`

8. **[lib/zustand-idb-storage.js](lib/zustand-idb-storage.js)** - Custom Zustand storage adapter using IndexedDB, integrates with existing PWA `userSettings` store from [lib/db.js](lib/db.js), provides async `getItem`/`setItem`/`removeItem` methods using `idb` package

### Modified Files

9. **[components/auth/RegisterForm.js](components/auth/RegisterForm.js)** - Add `onSuccess` callback prop for navigation control, redirect to `/habit-formation` instead of `/dashboard`, add back button with lucide-react `ArrowLeft` icon

10. **[app/register/page.js](app/register/page.js)** - Add `handleRegistrationSuccess` callback to route users to `/habit-formation` after successful registration

11. **[components/auth/GoogleLoginButton.jsx](components/auth/GoogleLoginButton.jsx)** - Add `mode` prop ('login' | 'signup') and `onSuccess` callback, update button text and routing based on mode (signup → `/habit-formation`, login → `/dashboard`)

12. **[app/login/page.js](app/login/page.js)** - Add back button with lucide-react `ArrowLeft` icon for navigation consistency

13. **[components/auth/AuthProvider.js](components/auth/AuthProvider.js)** - Add first-time user detection checking IndexedDB via auth store, redirect new users to `/welcome` using `useRouter`

14. **[lib/auth-store.js](lib/auth-store.js)** - Add Zustand state for onboarding tracking (`hasSeenWelcome`, `hasCompletedHabitFormation`) with methods `markWelcomeSeen()` and `markHabitFormationComplete()`, persisted to IndexedDB using `createJSONStorage` and custom `idbStorage` adapter (PWA-compatible)

### Total Files: 14 (8 new, 6 modified)

---

## Notes

- **Habit Formation Flow:** Separate ticket (future work)
- **OAuth Providers:** Currently Google only; Apple/Facebook can be added later
- **Welcome Screen Frequency:** Shows only on first app launch (controlled by `hasSeenWelcome` flag)
- **Design Flexibility:** Welcome screen feature highlights and animations are optional enhancements
- **Backend Coordination:** May need to update OAuth endpoint to return `isNewUser` flag
- **PWA Storage:** Uses IndexedDB for all persistence (auth state, onboarding status) via custom Zustand adapter

---

## IndexedDB Integration (PWA Architecture)

### Why IndexedDB Instead of localStorage?

This implementation uses a **custom Zustand storage adapter** to persist auth state in IndexedDB instead of the default localStorage. This decision aligns with the existing PWA architecture.

**Benefits:**

1. **Consistency:** All app data (verses, notes, settings, auth) in one IndexedDB database
2. **Storage Quota:** IndexedDB provides 50MB+ vs localStorage's 5-10MB
3. **Performance:** Async operations don't block the main thread
4. **PWA Best Practice:** IndexedDB is the recommended storage for Progressive Web Apps
5. **Offline-First:** Integrates with existing cache-first and network-first strategies
6. **Easy Cleanup:** One clear operation removes all user data on logout

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Fork-Benders PWA                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Zustand Auth Store (useAuthStore)                          │
│  ├─ isAuthenticated                                         │
│  ├─ hasSeenWelcome                                          │
│  └─ hasCompletedHabitFormation                              │
│           │                                                  │
│           │ (via custom idbStorage adapter)                 │
│           ↓                                                  │
│  ┌──────────────────────────────────────────┐              │
│  │      IndexedDB: BibleStudyDB             │              │
│  ├──────────────────────────────────────────┤              │
│  │  • verses (cache-first)                  │              │
│  │  • studyNotes (network-first)            │              │
│  │  • userSettings (auth state stored here) │ ← New usage  │
│  │  • syncQueue (offline mutations)         │              │
│  └──────────────────────────────────────────┘              │
│           ↑                                                  │
│           │ (uses existing db.js utilities)                 │
│           │                                                  │
│  lib/db.js (existing PWA infrastructure)                    │
│  ├─ getSetting()                                            │
│  ├─ setSetting()                                            │
│  └─ deleteSetting()                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Details

**Existing Infrastructure** ([lib/db.js](frontend/lib/db.js)):
- Already has `userSettings` object store (line 32-34)
- Provides `getSetting(key)`, `setSetting(key, value)`, `deleteSetting(key)`
- Used for user preferences, now also for auth state

**New Custom Adapter** ([lib/zustand-idb-storage.js](lib/zustand-idb-storage.js)):
```javascript
export const idbStorage = {
  getItem: async (name) => await db.getSetting(name),
  setItem: async (name, value) => await db.setSetting(name, value),
  removeItem: async (name) => await db.deleteSetting(name),
};
```

**Zustand Integration** ([lib/auth-store.js](lib/auth-store.js)):
```javascript
persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => idbStorage), // Custom IndexedDB adapter
  }
)
```

### Data Storage Location

In IndexedDB `BibleStudyDB` database, `userSettings` store:
```javascript
{
  key: 'auth-storage',
  value: {
    state: {
      isAuthenticated: true,
      hasSeenWelcome: true,
      hasCompletedHabitFormation: false
    },
    version: 0
  }
}
```

### Hydration Behavior

When the app loads:
1. Zustand calls `idbStorage.getItem('auth-storage')`
2. Retrieves from IndexedDB `userSettings` store
3. Hydrates the auth store with persisted state
4. Sets `isInitialized` to true
5. AuthProvider checks `hasSeenWelcome` and routes accordingly

This ensures **no flash of welcome screen** for returning users, as the state loads from IndexedDB before rendering.

---

## Questions for Clarification

1. **Welcome Screen Persistence:** Should the welcome screen show every time the user logs out, or only on first-ever launch?
   - Current assumption: Only first launch (stored in localStorage)

2. **Habit Formation Handoff:** What data should be passed to the habit formation flow?
   - User object
   - Auth tokens (already in store)
   - Any specific flags?

3. **OAuth Providers:** Priority order for OAuth providers?
   - Current: Google (already implemented)
   - Future: Apple, Facebook?

4. **Guest Mode:** Should "Continue as Guest" be supported?
   - Current assumption: No (commented out in code)

5. **Legal Pages:** Do `/terms` and `/privacy` routes need to be created?
   - Current assumption: Placeholder links for now

---

## Timeline Estimate

- **Sprint 1 (Core Structure):** 3-5 days
- **Sprint 2 (Integration):** 3-5 days
- **Sprint 3 (Polish & Testing):** 3-5 days
- **Sprint 4 (Backend Coordination):** 1-2 days (if needed)

**Total Estimate:** 10-17 days (2-3.5 weeks)

This includes development, testing, and minor iterations based on feedback.

---

## Conclusion

This implementation plan provides a complete roadmap for building the user account creation flow from scratch. Each component is designed to be modular, testable, and consistent with the existing codebase architecture. The flow prioritizes user experience with clear CTAs, intuitive navigation, and proper error handling at each step.

The phased approach allows for incremental development and testing, reducing risk and enabling early feedback. All components leverage the existing shadcn/ui design system and follow established patterns in the codebase for maintainability.
