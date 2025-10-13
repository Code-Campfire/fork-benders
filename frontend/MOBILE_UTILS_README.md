# Mobile & Responsive Utilities

This directory contains custom hooks and styles for building responsive, mobile-first applications.

## 📱 Overview

- **useMediaQuery Hook**: Detect responsive breakpoints and media queries
- **useTouchGestures Hook**: Handle swipe, tap, double-tap, and long-press gestures
- **mobile.css**: Mobile-optimized styles with touch targets and iOS safe areas
- **Viewport Configuration**: Properly configured in `layout.tsx`

---

## 🎯 useMediaQuery Hook

Located: `frontend/hooks/useMediaQuery.js`

### Basic Usage

```jsx
import { useMediaQuery } from '../hooks/useMediaQuery';

function MyComponent() {
    const isMobile = useMediaQuery('(max-width: 767px)');

    return <div>{isMobile ? <MobileView /> : <DesktopView />}</div>;
}
```

### Predefined Breakpoint Hooks

```jsx
import {
    useIsMobile, // max-width: 767px
    useIsTablet, // 768px - 1023px
    useIsDesktop, // min-width: 1024px
    useIsTouch, // Touch devices
    usePrefersReducedMotion,
    usePrefersDarkMode,
} from '../hooks/useMediaQuery';

function ResponsiveComponent() {
    const isMobile = useIsMobile();
    const isTouch = useIsTouch();
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
            {/* Your content */}
        </div>
    );
}
```

### Breakpoint Constants

```jsx
import { breakpoints } from '../hooks/useMediaQuery';

// Available breakpoints:
// breakpoints.mobile = '767px'
// breakpoints.tablet = '768px'
// breakpoints.desktop = '1024px'
// breakpoints.wide = '1280px'
// breakpoints.ultrawide = '1920px'
```

---

## 👆 useTouchGestures Hook

Located: `frontend/hooks/useTouchGestures.js`

### Full Gesture Detection

```jsx
'use client';

import { useTouchGestures } from '../hooks/useTouchGestures';

function SwipeableCard() {
    const ref = useTouchGestures(
        {
            onSwipeLeft: (e, data) => {
                console.log('Swiped left!', data);
                // Navigate to next card
            },
            onSwipeRight: (e, data) => {
                console.log('Swiped right!', data);
                // Navigate to previous card
            },
            onSwipeUp: (e, data) => {
                console.log('Swiped up!', data);
            },
            onSwipeDown: (e, data) => {
                console.log('Swiped down!', data);
            },
            onTap: (e) => {
                console.log('Tapped!');
            },
            onDoubleTap: (e) => {
                console.log('Double tapped!');
            },
            onLongPress: (e) => {
                console.log('Long pressed!');
            },
        },
        {
            minSwipeDistance: 50, // Minimum pixels for swipe
            maxSwipeTime: 300, // Maximum ms for swipe
            tapTimeout: 200, // Maximum ms for tap
            doubleTapDelay: 300, // Maximum delay between taps
            longPressDelay: 500, // Delay for long press
        }
    );

    return (
        <div ref={ref} className="card">
            Swipe me!
        </div>
    );
}
```

### Simple Swipe Detection

```jsx
'use client';

import { useSwipe } from '../hooks/useTouchGestures';

function SimpleSwipe() {
    const ref = useSwipe((direction, event, data) => {
        console.log(`Swiped ${direction}!`, data);
        // direction is 'left' | 'right' | 'up' | 'down'
    });

    return (
        <div ref={ref} className="swipeable">
            Swipe in any direction!
        </div>
    );
}
```

### Data Object

All gesture callbacks receive a `data` object with:

- `deltaX`: Horizontal distance (positive = right, negative = left)
- `deltaY`: Vertical distance (positive = down, negative = up)
- `deltaTime`: Duration of gesture in milliseconds

---

## 🎨 Mobile Styles

Located: `frontend/styles/mobile.css`

### iOS Safe Areas

Automatically handled for notch/home indicator:

```jsx
// CSS classes available:
<header className="safe-area-top">
    {/* Content will avoid the notch */}
</header>

<nav className="mobile-nav safe-area-bottom">
    {/* Content will avoid the home indicator */}
</nav>

// Available classes:
// .safe-area-top
// .safe-area-bottom
// .safe-area-left
// .safe-area-right
// .safe-area-all
// .safe-area-horizontal
// .safe-area-vertical
```

### Touch Target Sizes

All buttons and interactive elements automatically get minimum 44x44px touch targets (WCAG AAA compliant).

```jsx
// Automatic for:
<button>Click me</button>  {/* min-height: 44px */}
<input type="text" />      {/* min-height: 44px, font-size: 16px */}

// Manual classes:
<div className="touch-target">
    {/* min 44x44px */}
</div>

<div className="touch-target-comfortable">
    {/* min 48x48px */}
</div>
```

### Mobile Utilities

```jsx
// Show only on mobile
<div className="mobile-only">
    Mobile-specific content
</div>

// Hide on mobile
<div className="mobile-hidden">
    Desktop-only content
</div>

// Full width on mobile
<div className="mobile-full-width">
    Full width on small screens
</div>

// Mobile navigation
<nav className="mobile-nav">
    <button className="mobile-nav-item">Home</button>
    <button className="mobile-nav-item">Search</button>
    <button className="mobile-nav-item">Profile</button>
</nav>
```

### Spacing

```jsx
// Mobile-specific padding
<div className="container">
    {/* Auto 16px padding on mobile */}
</div>

<section className="section-padding">
    {/* 24px vertical, 16px horizontal on mobile */}
</section>

// Stack elements with spacing
<div className="stack-mobile">
    <div>Item 1</div>
    <div>Item 2</div>  {/* 1rem margin-top on mobile */}
</div>

<div className="stack-mobile-tight">
    <div>Item 1</div>
    <div>Item 2</div>  {/* 0.5rem margin-top on mobile */}
</div>
```

### Button Groups

```jsx
<div className="button-group-mobile">
    <button>Action 1</button>
    <button>Action 2</button>
    <button>Action 3</button>
    {/* Stacked vertically on mobile with proper spacing */}
</div>
```

---

## 🔧 Configuration

### Viewport Settings

The viewport is configured in `frontend/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
        viewportFit: 'cover', // For iOS safe areas
    },
};
```

### CSS Variables

Available in `mobile.css`:

```css
:root {
    --safe-area-inset-top: env(safe-area-inset-top, 0px);
    --safe-area-inset-right: env(safe-area-inset-right, 0px);
    --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
    --safe-area-inset-left: env(safe-area-inset-left, 0px);

    --mobile-padding: 16px;
    --mobile-padding-small: 8px;
    --mobile-padding-large: 24px;

    --touch-target-min: 44px;
    --touch-target-comfortable: 48px;
}
```

---

## 📝 Complete Example

```jsx
'use client';

import { useIsMobile, useIsTouch } from '../hooks/useMediaQuery';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { useState } from 'react';

export default function CardStack() {
    const [currentCard, setCurrentCard] = useState(0);
    const isMobile = useIsMobile();
    const isTouch = useIsTouch();

    const gestureRef = useTouchGestures({
        onSwipeLeft: () => {
            setCurrentCard((prev) => prev + 1);
        },
        onSwipeRight: () => {
            setCurrentCard((prev) => Math.max(0, prev - 1));
        },
        onDoubleTap: () => {
            console.log('Favorite!');
        },
    });

    return (
        <div
            className={`container ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}
        >
            <div
                ref={isTouch ? gestureRef : null}
                className="card touch-target-comfortable safe-area-all"
            >
                <h2>Card {currentCard}</h2>
                {isTouch && <p className="mobile-only">Swipe left or right</p>}
            </div>

            {!isTouch && (
                <div className="button-group-mobile mobile-hidden">
                    <button
                        onClick={() =>
                            setCurrentCard((prev) => Math.max(0, prev - 1))
                        }
                    >
                        Previous
                    </button>
                    <button onClick={() => setCurrentCard((prev) => prev + 1)}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
```

---

## 🎯 Best Practices

1. **Mobile-First Approach**: Design for mobile, then enhance for larger screens
2. **Touch Targets**: Ensure all interactive elements are at least 44x44px
3. **Font Sizes**: Use minimum 16px for inputs to prevent iOS zoom
4. **Safe Areas**: Apply safe-area classes to fixed/sticky elements
5. **Client Components**: Use `'use client'` directive when using hooks
6. **Performance**: Use `useMediaQuery` instead of CSS-in-JS for better performance
7. **Accessibility**: Respect `prefers-reduced-motion` for animations
8. **Testing**: Test on real devices, especially iOS for safe areas

---

## 🚀 Next Steps

1. Apply `.safe-area-*` classes to any fixed headers/footers
2. Use `useIsMobile()` hook for conditional rendering
3. Add swipe gestures to card-based interfaces
4. Test touch targets with your finger on a real device
5. Verify safe areas on iPhone X+ devices

---

## 🐛 Troubleshooting

**Hooks not working?**

- Ensure you're using `'use client'` directive at the top of the component file
- Check that the component is actually being rendered client-side

**Safe areas not applying?**

- Verify `viewport-fit=cover` is set in metadata
- Test on actual iOS device or simulator (safe areas don't show in desktop browser)

**Touch gestures not firing?**

- Make sure the ref is attached to the element
- Check that the element has sufficient size to swipe on
- Verify you're testing on a touch device or touch simulator

**Styles not applying?**

- Confirm `mobile.css` is imported in `layout.tsx`
- Check for CSS specificity conflicts
- Use browser dev tools to inspect applied styles
