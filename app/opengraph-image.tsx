import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";
export const alt = `${SITE_NAME} – portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #0b1020 0%, #1b1035 55%, #3a1033 100%)",
          color: "#e0f7fa",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, opacity: 0.7 }}>{SITE_NAME.toUpperCase()}</div>
        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>
          Building applications
        </div>
        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, color: "#4dd0e1" }}>
          & websites since 2019
        </div>
        <div style={{ fontSize: 28, marginTop: 40, opacity: 0.75 }}>
          AI · game engines · chip design · robotics · full-stack web
        </div>
      </div>
    ),
    size,
  );
}
