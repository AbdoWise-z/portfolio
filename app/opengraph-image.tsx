import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";
export const alt = `${SITE_NAME} – portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A few fixed "stars" so the card matches the site's space theme.
const STARS = [
  [60, 80, 3], [180, 420, 2], [300, 140, 2], [420, 560, 3], [640, 60, 2], [760, 300, 2],
  [880, 520, 3], [980, 120, 2], [1100, 400, 2], [1150, 580, 3], [520, 330, 2], [1040, 260, 2],
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          backgroundColor: "#05070f",
          backgroundImage:
            "radial-gradient(circle at 18% 28%, rgba(120,40,170,0.45), transparent 45%)," +
            "radial-gradient(circle at 82% 22%, rgba(0,110,200,0.45), transparent 45%)," +
            "radial-gradient(circle at 66% 82%, rgba(200,40,120,0.4), transparent 50%)",
          color: "#e0f7fa",
          fontFamily: "monospace",
        }}
      >
        {STARS.map(([x, y, r], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: 999,
              background: "white",
              opacity: 0.8,
            }}
          />
        ))}
        <div style={{ fontSize: 26, letterSpacing: 8, opacity: 0.7 }}>{SITE_NAME.toUpperCase()}</div>
        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>Building applications</div>
        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, color: "#22d3ee" }}>& websites since 2019</div>
        <div style={{ fontSize: 26, marginTop: 40, opacity: 0.75 }}>
          AI · game engines · chip design · robotics · full-stack web
        </div>
      </div>
    ),
    size,
  );
}
