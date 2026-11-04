"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/** The game is loaded on first trigger, so it costs nothing until someone finds it. */
const SpaceShooter = dynamic(() => import("@/components/views/space-shooter"), { ssr: false });

const CLICKS = 5;
const WINDOW_MS = 1200;
/** Clicks on these never count: they already do something. */
const INTERACTIVE = "a, button, input, textarea, select, label, [role='dialog'], [contenteditable]";

/**
 * Easter egg trigger: five quick clicks anywhere on the page (except on links,
 * buttons, form fields or an open dialog) open the retro space shooter.
 */
export default function EasterEgg() {
    const [game, setGame] = useState<"idle" | "open" | "closed">("idle");
    const isOpen = useRef(false);
    const clicks = useRef<number[]>([]);
    isOpen.current = game === "open";

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const target = e.target as Element | null;
            if (isOpen.current || !target || target.closest(INTERACTIVE)) return;
            const now = performance.now();
            clicks.current = [...clicks.current.filter((t) => now - t < WINDOW_MS), now];
            if (clicks.current.length >= CLICKS) {
                clicks.current = [];
                setGame("open");
            }
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    if (game === "idle") return null;
    return <SpaceShooter open={game === "open"} onOpenChange={(o) => setGame(o ? "open" : "closed")} />;
}
