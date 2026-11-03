import { useLayoutEffect, useRef, RefObject } from "react";
import { useScroll, MotionValue } from "framer-motion";

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * Scroll progress of another section, looked up by id, so a section can react
 * to its neighbour (for example recede while the next sheet slides over it).
 */
export function useSectionProgress(id: string, offset: Offset): MotionValue<number> {
    const ref = useRef<HTMLElement | null>(null);

    // Runs before useScroll's own effect, so the target is set by then.
    useLayoutEffect(() => {
        ref.current = document.getElementById(id);
    }, [id]);

    const { scrollYProgress } = useScroll({
        target: ref as RefObject<HTMLElement>,
        offset,
        layoutEffect: false,
    });

    return scrollYProgress;
}
