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
    enabled: boolean,
    setEnabled: ((value: boolean) => void) | null,
};

const SecretContentContext = createContext<SecretContentContextType>({
    innerMaskSize: null,
    MaskSize: null,
    setMaskSize: null,
    pointerX: null,
    pointerY: null,
    maskX: null,
    maskY: null,
    enabled: true,
    setEnabled: null,
});

const SPRING = { stiffness: 1800, damping: 150 };

const SecretContentContextProvider = (
    { children }: { children: React.ReactNode }
) => {
    const innerMaskSize = useMotionValue<number>(60);
    const MaskSize = useSpring(innerMaskSize, SPRING);
    const [enabled, setEnabled] = React.useState<boolean>(true);

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

    const mob = useIsMobile();

    useEffect(() => {
        if (!mob) return;

        const onTouchStart = () => {
            setMaskSize(60);
            setEnabled(true);
        };

        const onTouchEnd = () => {
            setMaskSize(0);
            setEnabled(false);
        };

        window.addEventListener("touchstart", onTouchStart, {passive: true});
        window.addEventListener("touchend", onTouchEnd);
        window.addEventListener("touchcancel", onTouchEnd);

        return () => {
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchEnd);
        };
    }, [mob, setMaskSize]);

    return (
        <SecretContentContext.Provider value={{
            innerMaskSize,
            MaskSize,
            setMaskSize,
            pointerX,
            pointerY,
            maskX,
            maskY,
            enabled,
            setEnabled,
        }}>
            {children}
        </SecretContentContext.Provider>
    );
};

export const useSecretContextValues = () => useContext(SecretContentContext);

export default SecretContentContextProvider;
