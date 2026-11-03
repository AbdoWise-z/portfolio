import React from "react";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** A faint film grain over the whole page for texture. Purely decorative. */
const Grain = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 z-[-10] opacity-[0.045] mix-blend-overlay dark:opacity-[0.07]"
    style={{ backgroundImage: NOISE, backgroundSize: "160px 160px" }}
  />
);

export default Grain;
