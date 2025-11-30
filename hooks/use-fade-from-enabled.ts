import {MotionValue, useSpring, useTransform} from "framer-motion";

interface FadeValues {
    opacity: MotionValue<number>;
    visibility: MotionValue<"visible" | "hidden">;
}

export function useFadeFromEnabled(enabled: MotionValue<boolean>): FadeValues {
    // Convert boolean to numeric target (0|1)
    const target = useTransform(enabled, (v) => (v ? 1 : 0));

    // Smooth fade animation
    // @ts-ignore
    const opacity = useSpring(target, {
        stiffness: 120,
        damping: 20,
    });

    // Compute visibility based on opacity (discrete)
    const visibility = useTransform(opacity, (o) =>
        o <= 0.001 ? "hidden" : "visible"
    );

    return { opacity, visibility };
}
