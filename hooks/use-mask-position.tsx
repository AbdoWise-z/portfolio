import { useMotionValue, useSpring } from "framer-motion";
import React, { useEffect } from "react";
import { useSecretContextValues } from "@/components/providers/secret-content-context-provider";

export const useMaskPosition = (ref: React.RefObject<any>) => {
	const contextData = useSecretContextValues();

	// Track ONLY raw mouse position in viewport (no transforms)
	const vMouseX = useMotionValue(-1000);
	const vMouseY = useMotionValue(-1000);

	// Smooth spring versions
	const vMaskX = useSpring(vMouseX, { stiffness: 1800, damping: 150 });
	const vMaskY = useSpring(vMouseY, { stiffness: 1800, damping: 150 });

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            vMouseX.set(e.clientX);
            vMouseY.set(e.clientY);
        };

        window.addEventListener("pointermove", onMove);

        return () => window.removeEventListener("pointermove", onMove);
    }, [vMouseX, vMouseY]);


    //
	// RETURN SCROLL-AWARE COORDINATES
	//
	const transformedX = useSpring(vMaskX, { stiffness: 1200, damping: 100 });
	const transformedY = useSpring(vMaskY, { stiffness: 1200, damping: 100 });

	useEffect(() => {
		const update = () => {
			if (!ref.current) return;

			const layoutRect = ref.current.getBoundingClientRect();

			// Apply scroll offset + center the mask
			const finalX =
				vMouseX.get() -
				layoutRect.left -
				contextData.MaskSize!.get() / 2;

			const finalY =
				vMouseY.get() -
				layoutRect.top -
				contextData.MaskSize!.get() / 2;

			transformedX.set(finalX);
			transformedY.set(finalY);
		};

		update(); // run once
		window.addEventListener("scroll", update, { passive: true });
		const unsubX = vMaskX.onChange(update);
		const unsubY = vMaskY.onChange(update);

		return () => {
			window.removeEventListener("scroll", update);
			unsubX();
			unsubY();
		};
	}, [ref, contextData.MaskSize, vMouseX, vMouseY, vMaskX, vMaskY, transformedX, transformedY]);


	return {
		transformedX,
		transformedY,
		contextData,
	};
};
