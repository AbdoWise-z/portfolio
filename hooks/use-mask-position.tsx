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
    /** How much ancestor transforms scale the element: mask coordinates are pre-transform. */
    const scale = useMotionValue(1);

    useEffect(() => {
        if (!pointerX || !pointerY || !maskX || !maskY || !MaskSize) return;

        const update = () => {
            const node = ref.current;
            if (!node) return;

            const rect = node.getBoundingClientRect();
            const k = node.offsetWidth ? rect.width / node.offsetWidth : 1;
            const half = MaskSize.get() / 2 / k;
            scale.set(k);

            targetX.set((pointerX.get() - rect.left) / k - half);
            targetY.set((pointerY.get() - rect.top) / k - half);
        };

        update();

        // The element can move under a resting pointer (drifting images, sections
        // that recede), so keep updating every frame while the pointer is near it.
        let frame = 0;
        const tick = () => {
            const node = ref.current;
            if (node) {
                const rect = node.getBoundingClientRect();
                const pad = MaskSize.get();
                const px = pointerX.get(), py = pointerY.get();
                if (px > rect.left - pad && px < rect.right + pad && py > rect.top - pad && py < rect.bottom + pad) update();
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        window.addEventListener("scroll", update, { passive: true });
        const unsubs = [
            maskX.on("change", update),
            maskY.on("change", update),
            MaskSize.on("change", update),
        ];

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", update);
            unsubs.forEach((u) => u());
        };
    }, [ref, pointerX, pointerY, maskX, maskY, MaskSize, targetX, targetY, scale]);

    return {
        transformedX,
        transformedY,
        scale,
        contextData,
    };
};
