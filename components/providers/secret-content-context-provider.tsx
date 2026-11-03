"use client";

import React, {createContext, useCallback, useContext, useEffect} from 'react';
import {MotionValue, useMotionValue, useSpring} from "framer-motion";
import {useIsMobile} from "@/hooks/use-mobile";

type SecretContentContextType = {
    /** Raw (unsmoothed) mask size target. */
    innerMaskSize: MotionValue<number> | null,
    /** Spring-smoothed mask size. */
    MaskSize: MotionValue<number> | null,
    setMaskSize: ((value: number) => void) | null,
    /** Raw pointer position in viewport coordinates. */
    pointerX: MotionValue<number> | null,
    pointerY: MotionValue<number> | null,
    /** Spring-smoothed pointer position in viewport coordinates. */
    maskX: MotionValue<number> | null,
    maskY: MotionValue<number> | null,
};

const SecretContentContext = createContext<SecretContentContextType>({
    innerMaskSize: null,
    MaskSize: null,
    setMaskSize: null,
    pointerX: null,
    pointerY: null,
    maskX: null,
    maskY: null,
});

const SPRING = { stiffness: 1800, damping: 150 };

export const DEFAULT_MASK_SIZE = 60;

const SecretContentContextProvider = (
    { children }: { children: React.ReactNode }
) => {
    const innerMaskSize = useMotionValue<number>(DEFAULT_MASK_SIZE);
    const MaskSize = useSpring(innerMaskSize, SPRING);

    const setMaskSize = useCallback((maskSize: number) => {
        innerMaskSize.set(maskSize);
    }, [innerMaskSize]);

    // A single global pointer tracker shared by every SecretContent instance.
    const pointerX = useMotionValue(-1000);
    const pointerY = useMotionValue(-1000);
    const maskX = useSpring(pointerX, SPRING);
    const maskY = useSpring(pointerY, SPRING);

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            pointerX.set(e.clientX);
            pointerY.set(e.clientY);
        };

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            const t = e.touches[0];
            pointerX.set(t.clientX);
            pointerY.set(t.clientY);
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("touchmove", onTouchMove);
        };
    }, [pointerX, pointerY]);

    // On touch devices the lens only exists while a finger is down.
    const mob = useIsMobile();

    useEffect(() => {
        if (!mob) return;

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                pointerX.set(e.touches[0].clientX);
                pointerY.set(e.touches[0].clientY);
            }
            setMaskSize(DEFAULT_MASK_SIZE);
        };
        const onTouchEnd = () => setMaskSize(0);

        setMaskSize(0);
        window.addEventListener("touchstart", onTouchStart, {passive: true});
        window.addEventListener("touchend", onTouchEnd);
        window.addEventListener("touchcancel", onTouchEnd);

        return () => {
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchEnd);
        };
    }, [mob, setMaskSize, pointerX, pointerY]);

    return (
        <SecretContentContext.Provider value={{
            innerMaskSize,
            MaskSize,
            setMaskSize,
            pointerX,
            pointerY,
            maskX,
            maskY,
        }}>
            {children}
        </SecretContentContext.Provider>
    );
};

export const useSecretContextValues = () => useContext(SecretContentContext);

export default SecretContentContextProvider;
