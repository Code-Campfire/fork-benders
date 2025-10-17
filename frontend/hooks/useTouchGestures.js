import { useRef, useEffect, useCallback } from 'react';

/**
 * Simplified hook for swipe detection
 * @param {Function} onSwipe - Callback with direction ('left' | 'right' | 'up' | 'down')
 * @param {Object} config - Configuration options
 * @param {number} config.minSwipeDistance - Minimum distance in pixels (default: 50)
 * @param {number} config.maxSwipeTime - Maximum time in ms (default: 300)
 * @returns {React.RefObject} - Ref to attach to the target element
 */
export function useSwipe(onSwipe, config = {}) {
    const { minSwipeDistance = 50, maxSwipeTime = 300 } = config;

    const touchStartRef = useRef(null);
    const elementRef = useRef(null);

    const handleTouchStart = useCallback((e) => {
        const touch = e.touches[0];
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        };
    }, []);

    const handleTouchEnd = useCallback(
        (e) => {
            if (!touchStartRef.current) {
                return;
            }

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;
            const deltaTime = Date.now() - touchStartRef.current.time;

            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);

            // Check if it's a swipe (distance & time thresholds)
            if (
                (absDeltaX > minSwipeDistance ||
                    absDeltaY > minSwipeDistance) &&
                deltaTime < maxSwipeTime
            ) {
                let direction;

                if (absDeltaX > absDeltaY) {
                    // Horizontal swipe
                    direction = deltaX > 0 ? 'right' : 'left';
                } else {
                    // Vertical swipe
                    direction = deltaY > 0 ? 'down' : 'up';
                }

                onSwipe(direction, e, { deltaX, deltaY, deltaTime });
            }

            touchStartRef.current = null;
        },
        [onSwipe, minSwipeDistance, maxSwipeTime]
    );

    useEffect(() => {
        const element = elementRef.current;
        if (!element) {
            return undefined;
        }

        const options = { passive: true };
        element.addEventListener('touchstart', handleTouchStart, options);
        element.addEventListener('touchend', handleTouchEnd, options);

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchEnd]);

    return elementRef;
}
