import { useEffect, useRef } from "react";

interface SwipeCallbacks {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
}

export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeCallbacks) {
    const startX = useRef(0);
    const startY = useRef(0);
    const startTime = useRef(0);

    useEffect(() => {
        const threshold = 50; // minimum horizontal distance
        const maxVertical = 100; // maximum vertical deviation
        const maxTime = 500; // maximum swipe duration in ms

        const onPointerDown = (e: PointerEvent) => {
            startX.current = e.clientX;
            startY.current = e.clientY;
            startTime.current = e.timeStamp;
        };

        const onPointerUp = (e: PointerEvent) => {
            const dx = e.clientX - startX.current;
            const dy = e.clientY - startY.current;
            const dt = e.timeStamp - startTime.current;

            if (dt > maxTime) return; // too slow
            if (Math.abs(dy) > maxVertical) return; // mostly vertical movement

            if (dx > threshold) onSwipeRight?.();
            else if (dx < -threshold) onSwipeLeft?.();
        };

        window.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointerup", onPointerUp);

        return () => {
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [onSwipeLeft, onSwipeRight]);
}
