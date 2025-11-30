"use client";

import React, {createContext, useContext, useEffect, useState} from 'react';
import {MotionValue, useMotionValue, useSpring} from "framer-motion";
import {useIsMobile} from "@/hooks/use-mobile";

type SecretContentContextType = {
    innerMaskSize: MotionValue<number> | null,
    MaskSize: MotionValue<number> | null,
    setMaskSize: ((value: number) => void) | null,
    enabled: boolean,
    setEnabled: ((value: boolean) => void) | null,
};

const SecretContentContext = createContext<SecretContentContextType>({
    innerMaskSize: null,
    MaskSize: null,
    setMaskSize: null,
    enabled: true,
    setEnabled: null,

});

const SecretContentContextProvider = (
    { children }: { children: React.ReactNode }
) => {

    const setMaskSize = (maskSize: number) => {
        innerMaskSize.set(maskSize);
    }

    const innerMaskSize = useMotionValue<number>(60);
    const MaskSize  = useSpring(innerMaskSize , { stiffness: 1800, damping: 150 });
    const [enabled, setEnabled] = React.useState<boolean>(true);

    //const [oldSize, setSize] = useState<number>(0);

    const mob = useIsMobile();

    useEffect(() => {
        if (mob) {


            const onTouchStart = (e: TouchEvent) => {
                setMaskSize(60);
                setEnabled!(true);
            };

            const onTouchEnd = (e: TouchEvent) => {
                setMaskSize(0);
                setEnabled!(false);
            };

            window.addEventListener("touchstart", onTouchStart, {passive: true});
            window.addEventListener("touchend", onTouchEnd);
            window.addEventListener("touchcancel", onTouchEnd);

            return () => {
                window.removeEventListener("touchstart", onTouchStart);
                window.removeEventListener("touchend", onTouchEnd);
                window.removeEventListener("touchcancel", onTouchEnd);
            };
        }
    }, [mob, setMaskSize]);

    return (
        <SecretContentContext.Provider value={{
            innerMaskSize,
            MaskSize,
            setMaskSize,
            enabled,
            setEnabled,
        }}>
            {children}
        </SecretContentContext.Provider>
    );
};

export const useSecretContextValues = () => useContext(SecretContentContext);

export default SecretContentContextProvider;