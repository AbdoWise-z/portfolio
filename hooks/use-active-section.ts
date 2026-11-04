import { useEffect, useState } from "react";

/**
 * Id of the section the reader is on, or null while still on the hero.
 *
 * The sections stack as sheets (pinned predecessors, negative margins), so
 * intersection alone is misleading: a covered sheet still intersects. Instead,
 * the active section is the last one in page order whose top edge has risen
 * past the middle of the viewport, which is the point where a sliding sheet
 * visually takes over. Recomputed on scroll and resize.
 */
export function useActiveSection(ids: readonly string[]): string | null {
    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {
        const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
        if (elements.length === 0) return;

        let frame = 0;
        const update = () => {
            frame = 0;
            const line = window.innerHeight * 0.5;
            let current: string | null = null;
            for (const el of elements) {
                if (el.getBoundingClientRect().top <= line) current = el.id;
            }
            setActive(current);
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, [ids]);

    return active;
}
