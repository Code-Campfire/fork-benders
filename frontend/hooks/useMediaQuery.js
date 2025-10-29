import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive breakpoints
 * @param {string} query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Check if window is defined (client-side only)
        if (typeof window === 'undefined') {
            return undefined; // ✅ Explicitly return undefined (or just remove this early return)
        }

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Create event listener
        const handler = (event) => setMatches(event.matches);

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
            return () => {
                mediaQuery.removeEventListener('change', handler);
            };
        }
        // Legacy browsers
        mediaQuery.addListener(handler);
        return () => {
            mediaQuery.removeListener(handler);
        };
    }, [query]);

    return matches;
}

/**
 * Predefined breakpoint hooks for common responsive patterns
 */
export function useIsMobile() {
    return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet() {
    return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop() {
    return useMediaQuery('(min-width: 1024px)');
}

export function useIsTouch() {
    return useMediaQuery('(hover: none) and (pointer: coarse)');
}

export function usePrefersReducedMotion() {
    return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode() {
    return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Common breakpoint values for reference
 */
export const breakpoints = {
    mobile: '767px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
    ultrawide: '1920px',
};
