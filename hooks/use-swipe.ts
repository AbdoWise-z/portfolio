import { useEffect, useRef } from "react";

interface SwipeCallbacks {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
}

export function useSwipe(
    ref: React.RefObject<HTMLElement>,
    { onSwipeLeft, onSwipeRight }: SwipeCallbacks
) {
    const startX = useRef(0);
    const startY = useRef(0);
    const startTime = useRef(0);

    useEffect(() => {
        if (!ref.current) return;

        const threshold = 50; // min horizontal distance
        const maxVertical = 100; // max vertical deviation
        const maxTime = 500; // max swipe duration

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            const t = e.touches[0];
            startX.current = t.clientX;
            startY.current = t.clientY;
            startTime.current = e.timeStamp;
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (!startTime.current) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - startX.current;
            const dy = t.clientY - startY.current;
            const dt = e.timeStamp - startTime.current;

            if (dt > maxTime) return; // too slow
            if (Math.abs(dy) > maxVertical) return; // mostly vertical

            if (dx > threshold) onSwipeRight?.();
            else if (dx < -threshold) onSwipeLeft?.();
        };

        const node = ref.current;
        node.addEventListener("touchstart", onTouchStart, { passive: true });
        node.addEventListener("touchend", onTouchEnd);

        return () => {
            node.removeEventListener("touchstart", onTouchStart);
            node.removeEventListener("touchend", onTouchEnd);
        };
    }, [ref, onSwipeLeft, onSwipeRight]);
}
