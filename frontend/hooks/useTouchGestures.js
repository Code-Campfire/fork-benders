import { useRef, useEffect, useCallback } from 'react';

/**
 * Configuration for touch gesture detection
 * @typedef {Object} TouchGestureConfig
 * @property {number} minSwipeDistance - Minimum distance in pixels for a swipe (default: 50)
 * @property {number} maxSwipeTime - Maximum time in ms for a swipe gesture (default: 300)
 * @property {number} tapTimeout - Maximum time in ms for a tap (default: 200)
 * @property {number} doubleTapDelay - Maximum delay between taps for double tap (default: 300)
 */

/**
 * Custom hook for handling touch gestures (swipe, tap, double tap, long press)
 * @param {Object} callbacks - Object containing gesture callback functions
 * @param {Function} callbacks.onSwipeLeft - Called on left swipe
 * @param {Function} callbacks.onSwipeRight - Called on right swipe
 * @param {Function} callbacks.onSwipeUp - Called on up swipe
 * @param {Function} callbacks.onSwipeDown - Called on down swipe
 * @param {Function} callbacks.onTap - Called on single tap
 * @param {Function} callbacks.onDoubleTap - Called on double tap
 * @param {Function} callbacks.onLongPress - Called on long press
 * @param {TouchGestureConfig} config - Configuration options
 * @returns {React.RefObject} - Ref to attach to the target element
 */
export function useTouchGestures(callbacks = {}, config = {}) {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        onTap,
        onDoubleTap,
        onLongPress,
    } = callbacks;

    const {
        minSwipeDistance = 50,
        maxSwipeTime = 300,
        tapTimeout = 200,
        doubleTapDelay = 300,
        longPressDelay = 500,
    } = config;

    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);
    const lastTapRef = useRef(0);
    const longPressTimerRef = useRef(null);
    const elementRef = useRef(null);

    const handleTouchStart = useCallback(
        (e) => {
            const touch = e.touches[0];
            touchStartRef.current = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now(),
            };

            // Start long press timer
            if (onLongPress) {
                longPressTimerRef.current = setTimeout(() => {
                    onLongPress(e);
                }, longPressDelay);
            }
        },
        [onLongPress, longPressDelay]
    );

    const handleTouchMove = useCallback(() => {
        // Cancel long press if finger moves
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    const handleTouchEnd = useCallback(
        (e) => {
            // Clear long press timer
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }

            if (!touchStartRef.current) {
                return undefined;
            }

            const touch = e.changedTouches[0];
            touchEndRef.current = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now(),
            };

            const deltaX = touchEndRef.current.x - touchStartRef.current.x;
            const deltaY = touchEndRef.current.y - touchStartRef.current.y;
            const deltaTime =
                touchEndRef.current.time - touchStartRef.current.time;

            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);

            // Check for swipe gestures
            if (
                (absDeltaX > minSwipeDistance ||
                    absDeltaY > minSwipeDistance) &&
                deltaTime < maxSwipeTime
            ) {
                if (absDeltaX > absDeltaY) {
                    // Horizontal swipe
                    if (deltaX > 0 && onSwipeRight) {
                        onSwipeRight(e, { deltaX, deltaY, deltaTime });
                    } else if (deltaX < 0 && onSwipeLeft) {
                        onSwipeLeft(e, { deltaX, deltaY, deltaTime });
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0 && onSwipeDown) {
                        onSwipeDown(e, { deltaX, deltaY, deltaTime });
                    } else if (deltaY < 0 && onSwipeUp) {
                        onSwipeUp(e, { deltaX, deltaY, deltaTime });
                    }
                }
            }
            // Check for tap gestures
            else if (
                absDeltaX < 10 &&
                absDeltaY < 10 &&
                deltaTime < tapTimeout
            ) {
                const now = Date.now();
                const timeSinceLastTap = now - lastTapRef.current;

                if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
                    // Double tap
                    onDoubleTap(e);
                    lastTapRef.current = 0; // Reset to prevent triple tap
                } else {
                    // Single tap (delayed to check for double tap)
                    if (onTap && !onDoubleTap) {
                        // If no double tap handler, fire immediately
                        onTap(e);
                    } else if (onTap) {
                        // Delay to check for double tap
                        setTimeout(() => {
                            const newTimeSinceLastTap =
                                Date.now() - lastTapRef.current;
                            if (newTimeSinceLastTap >= doubleTapDelay) {
                                onTap(e);
                            }
                        }, doubleTapDelay);
                    }
                    lastTapRef.current = now;
                }
            }

            touchStartRef.current = null;
            return undefined;
        },
        [
            onSwipeLeft,
            onSwipeRight,
            onSwipeUp,
            onSwipeDown,
            onTap,
            onDoubleTap,
            minSwipeDistance,
            maxSwipeTime,
            tapTimeout,
            doubleTapDelay,
        ]
    );

    useEffect(() => {
        const element = elementRef.current;
        if (!element) {
            return undefined;
        }

        // Add passive: false to allow preventDefault if needed
        const options = { passive: true };

        element.addEventListener('touchstart', handleTouchStart, options);
        element.addEventListener('touchmove', handleTouchMove, options);
        element.addEventListener('touchend', handleTouchEnd, options);

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);

            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return elementRef;
}

/**
 * Simpler hook for just swipe detection
 * @param {Function} onSwipe - Callback with direction ('left' | 'right' | 'up' | 'down')
 * @param {TouchGestureConfig} config - Configuration options
 * @returns {React.RefObject} - Ref to attach to the target element
 */
export function useSwipe(onSwipe, config = {}) {
    return useTouchGestures(
        {
            onSwipeLeft: (e, data) => onSwipe('left', e, data),
            onSwipeRight: (e, data) => onSwipe('right', e, data),
            onSwipeUp: (e, data) => onSwipe('up', e, data),
            onSwipeDown: (e, data) => onSwipe('down', e, data),
        },
        config
    );
}
