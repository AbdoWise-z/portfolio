import { useMotionValue, useSpring } from "framer-motion";
import React, { useEffect } from "react";
import { useSecretContextValues } from "@/components/providers/secret-content-context-provider";

/**
 * Converts the shared viewport pointer position into coordinates relative to
 * `ref`, centred on the mask, so it can be used as a CSS mask position.
 */
export const useMaskPosition = (ref: React.RefObject<HTMLElement | null>) => {
    const contextData = useSecretContextValues();
    const { pointerX, pointerY, maskX, maskY, MaskSize } = contextData;

    const targetX = useMotionValue(0);
    const targetY = useMotionValue(0);
    const transformedX = useSpring(targetX, { stiffness: 1200, damping: 100 });
    const transformedY = useSpring(targetY, { stiffness: 1200, damping: 100 });

    useEffect(() => {
        if (!pointerX || !pointerY || !maskX || !maskY || !MaskSize) return;

        const update = () => {
            const node = ref.current;
            if (!node) return;

            const rect = node.getBoundingClientRect();
            const half = MaskSize.get() / 2;

            targetX.set(pointerX.get() - rect.left - half);
            targetY.set(pointerY.get() - rect.top - half);
        };

        update();

        window.addEventListener("scroll", update, { passive: true });
        const unsubs = [
            maskX.on("change", update),
            maskY.on("change", update),
            MaskSize.on("change", update),
        ];

        return () => {
            window.removeEventListener("scroll", update);
            unsubs.forEach((u) => u());
        };
    }, [ref, pointerX, pointerY, maskX, maskY, MaskSize, targetX, targetY]);

    return {
        transformedX,
        transformedY,
        contextData,
    };
};
