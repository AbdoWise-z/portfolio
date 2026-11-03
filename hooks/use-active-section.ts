import { useEffect, useState } from "react";

/** Id of the section currently occupying the middle of the viewport, or null before any does. */
export function useActiveSection(ids: readonly string[]): string | null {
    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {
        const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) setActive(entry.target.id);
                }
            },
            // A thin band across the middle of the viewport: whichever section crosses it is active.
            { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [ids]);

    return active;
}
